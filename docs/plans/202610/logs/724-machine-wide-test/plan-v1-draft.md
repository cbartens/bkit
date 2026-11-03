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
4. bkit's own heavy raw vitest runs (`pnpm test`, `test:integration`, `test:coverage:unit`) take the `tests` lock through a vitest global setup; single-file, watch, CI and nested runs never wait.

**Plan-input deviations (surfaced, not silent):**

- Consumer repo names in the input → written as "a consumer" (`.agents/rules.md` § Consumer names); the Narrative and Success Criteria carry none, so stay word for word.
- Derived Test Matrix `Type` → tier names as `docs/testing.md` writes them (`Integration`, `Unit`); descriptions kept word for word.
- Issue TASK 1 split into TASK 1 (named locks, `run`) + TASK 2 (slots, workers, lock order) to stay under the per-task test cap; every issue test kept. The dogfood copy + registry move into TASK 1, since deleting the old template breaks `dogfood-templates.test.ts` until they land.
- Issue TASK 2's docs split by what each documents: template docs → TASK 3; `docs/testing.md` tests-lock section → TASKS 4 and 6 (with the code it describes).
- Issue TASK 4 `TEST FIRST: n/a` tightened to a guard test in `local-gate-audit.test.ts` (every `tests run` call site routes exit 81).
- Plan-added tests: `run` exit 73 on lock error; lock-order refusal; `--lock-wait-s` validation; a gate's own exit 75 stays a FAIL; watch-mode runs take no lock; exit-81 routing guard; the vitest global setup run against a real lock (wait + teardown).

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

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`. All lock tests point `XDG_CACHE_HOME` at a per-test temp dir and clear `CI` / `LOCAL_STACK_LOCK_OWNER*`, so a real run on the machine is never touched or waited on.

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
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking the tests lock while holding the stack lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| tests run waits for a held tests lock and runs the gate once the holder finishes | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests run exits 81 naming the holder when the lock stays held past --lock-wait-s | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests run holds the tests lock for the whole gate, so a second tests run waits | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests red runs its test file without waiting for a held tests lock | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests run under CI=true never waits on a held tests lock | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests run with an unwritable lock dir exits 4 naming the path | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| a gate that itself exits 75 is a FAIL verdict, not a lock wait (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| every tests run call site routes exit 81 to a re-run of its block (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 5 |
| a run whose every filter is an existing test file is light and takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| a run started under a live tests-lock owner takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| CI=true takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| BKIT_TEST_WORKERS sets maxWorkers when present | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| a watch-mode run takes no lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 6 |
| the global setup waits for a held tests lock and takes it once the holder ends (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 6 |
| the global setup's teardown frees the tests lock (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

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
| Engine export | `wholeNumber` in `.bkit/core/engine/commands/lib.ts` |
| Repo files | `vitest.test-lock.ts`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` |
| Doc section | `.bkit/templates.md` § Machine lock; `docs/testing.md` § Tests lock |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

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
  - **Options:** A) watch / dev mode takes no lock — an open session would block every gate for hours · B) watch takes the lock like a heavy run
  - **Recommended:** A).
  - **Default if unanswered:** A.
- **Assumption:** vitest 5.0.3 exposes the CLI filters to a global setup as `project.vitest.config.filters` (`ResolvedConfig.filters?: string[]` confirmed in `node_modules/vitest/dist/chunks/plugin.d.*.d.ts`; runtime read confirmed at TASK 6's red) → wrong: the light rule falls back to `bkit:test:file` exporting a skip variable (issue's fallback); TASK 6 changes `package.json` `bkit:test:file`.
- **Assumption:** a gate exiting 75 by itself is rare; the engine reads 75 as a lock give-up only when the log holds the script's give-up line (TASK 4 test pins it) → wrong: none, the check is the guard.
- **Assumption:** `bash` is on `PATH` wherever `bkit tests run` runs locally (bkit hooks already need it), and the script stays bash 3.2-compatible (stock macOS `/bin/bash`: no associative arrays, `mapfile`, `${var,,}`) → wrong: gates exit 4 "could not run" on that host.
- **Assumption:** `getconf _NPROCESSORS_ONLN` reports cores on macOS and Linux (fallback `nproc`, then `sysctl -n hw.ncpu`, then 1) → wrong: `BKIT_TEST_WORKERS` = 1 and gates run narrow but correct.
- **Assumption:** `vitest.setup.ts` points `XDG_CACHE_HOME` at a per-worker temp dir, so existing in-process `tests run` tests (`tests.test.ts`) only ever take a temp-dir lock → wrong: they queue behind real gates on a busy machine.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays under the agent's 10-minute tool-timeout ceiling → wrong: lower the default.
- **Assumption:** a consumer copy whose lock dir was customised (the copy the named-lock API comes from writes `~/.cache/local-stack-lock/`) shares no lock with the template; SC 5 covers copies that kept the template's path → wrong: that consumer re-adopts the template to share locks.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

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

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Full-gate timeouts on single tests (`ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`, `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`) | `docs/failures.jsonl` (OPEN) | the load the tests lock removes; `vitest.config.ts` | keep separate; re-observe after ship — a recurrence with the lock held points at the test, not the machine |
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
- [x] **User Context:** read access confirmed to every file the runbook names, and to the consumer's adopted copy the named-lock API comes from. No missing user information; human decisions are Open Questions 1-5.
- [x] **Project Context:** read `docs/knowledge.jsonl` `local-pnpm-test-full-parallelism-integration-timeouts-flake`, `spawn-heavy-unit-suite-needs-its-own-budget-under-load`; `docs/failures.jsonl` `subprocess-integration-tests-time-out-at-5000ms-under-high-load`, `install-upgrade-integration-tests-flake-on-default-5s-timeout` and the open `*-timeout-under-full-gate` rows; `docs/decisions.jsonl` (no prior `724-*` row; lock rows `467-*` are workflow locks, unrelated).
- [x] **Testing & Quality:** tiers per `docs/testing.md` § Which tier does a behaviour need? — lock and engine behaviour cross real bash / perl / flock / subprocess boundaries → Integration, no mocks at the boundary; pure decision helpers and shipped-text guards → Unit. Engine spawned via `requireTsx()` (§ Spawning `bkit` from tests).
- [x] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no secrets. New non-secret env names listed in Breaking Changes & Naming Review.
- [ ] **Schema State:** n/a — no database.
- [x] **Architecture & UI:** `docs/architecture.md` places neither root `vitest.*.ts` helpers nor `scripts/` dogfood copies → TASKS 1 and 6 add tree lines. No UI.
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
| Engine gate runs under the tests lock | `.bkit/core/engine/commands/workflow/tests.ts` | `find_symbol testsCommand`; `grep -n -e runToLog -e EXIT_COULD_NOT_RUN tests.ts` | `testsCommand.verbs.run` + `runToLog` — runs the gate, maps 126/127 to exit 4 | EXTEND | wrap the gate argv in the lock script's `run`; map 75 → 81, 73 → 4; `--lock-wait-s` flag; `lockHolder` output |
| Exit 81 code | `.bkit/core/engine/commands/lib.ts` | `grep -rn '\b81\b' .bkit/core/engine/commands` | `EXIT.AGENT_WAIT` = 81, "hand the wait back to the agent's turn loop" | EXTEND | used as is; no new code |
| `--lock-wait-s` whole-number parsing | `.bkit/core/engine/commands/lib.ts` | `grep -rn 'const wholeNumber' .bkit/core/engine`; `positiveInt` in `status.ts` (>= 1 only) | `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts` (module-local, `--budget-s`) | EXTEND | move `wholeNumber` to `lib.ts` as an export; `runs.ts` imports it |
| Packaged script path | `.bkit/core/engine/shared/package-roots.ts` | `find_symbol getTemplatesRoot`; `grep -rln getTemplatesRoot .bkit/core/engine` | `getTemplatesRoot()` — package `.bkit/templates` under dist / tsx / node_modules | EXTEND | read only; no change |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — `Unit` tier, in-process `runCommand` | NEW | (b) the suffix is the tier contract (`.agents/rules.md` § Naming Conventions; `docs/testing.md` § Tiers: spawning `bkit` via `tsx` = Integration), and its caller `test:coverage:unit` counts `*.test.ts` toward the unit branch floor |
| Workflows route exit 81 from gate blocks | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md` | `grep -rn 'tests run' .bkit/core/workflows .bkit/core/prompts`; `grep -n 'exit 81' .bkit/core/workflows/*.md` | 3 `tests run` blocks; `**If** exit 80 or 81 → …` route precedent (`bkit-build.md:946`) | EXTEND | add the route line to each block |
| Exit-81 routing guard | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | `ls .bkit/core/engine/audits/workflows`; `grep -ln 'tests run' …/audits/workflows/*.ts` | `testBlocks` / `callPosition` helpers already find every `tests run` block | EXTEND | one `it` per probe: the block's route holds `exit 81` |
| Run-wide tests lock for raw vitest runs + heavy / light decision | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` (none); `ls vitest*`; vitest `globalSetup` built-in (`plugin.d.*.d.ts`) | `vitest.setup.ts` — a `setupFiles` entry run in every worker once per test file; `vitest.timeout-budget.ts` — pure timeout maths | NEW | (a) no global setup exists; (b) for `vitest.setup.ts`: its contract runs per file in every worker, so a run-wide lock there would be taken N times by its callers (each worker) |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl -e vitest.timeout-budget -e vitest.test-lock .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — asserts only the timeout module | NEW | (a) no test covers the new module; sits beside its sibling |
| Global setup against a real lock | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | same search | `vitest-test-lock.test.ts` (this plan, `Unit` tier) | NEW | (b) spawns real bash / perl holders → Integration suffix (`.agents/rules.md` § Naming Conventions); the unit file's caller `test:coverage:unit` counts only `*.test.ts` |
| Global setup registration + `maxWorkers` | `vitest.config.ts` | `Read vitest.config.ts`; `vitest.unit.config.ts` merges it | `vitest.config.ts` `test` block | EXTEND | `globalSetup`, `...testWorkers()` |
| Machine lock docs | `.bkit/core/.bkit/templates.md` | `grep -n 'Local stack lock' .bkit/core/.bkit/templates.md` | § Local stack lock + catalog rows (lines 17, 41, 73) | EXTEND | renamed § Machine lock, extended |

## Architecture & Component Changes

Areas: copy-and-own template script, bkit dogfood copy, engine (`bkit tests run`), workflows, bkit's own vitest config, docs.

**Ledger rows:** `724-tests-lock-fixed-slots-not-live-load`, `724-tests-run-lock-wait-exit-81`, `724-light-runs-skip-tests-lock`, `724-machine-lock-script-named-locks-no-migration`, `724-lock-order-tests-named-stack-enforced`, `724-engine-runs-packaged-lock-template`, `724-lock-run-exit-codes-73-75`, `724-vitest-global-setup-holds-tests-lock`, `724-host-hook-catches-raw-test-runners`, `724-upstream-consumer-load-gate`, `724-timeout-budget-and-ci-serialisation-unchanged`

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
- Every test of the old file pointed at the new script (`[local-stack-lock]` → `[machine-lock]` where a string asserts the prefix; none does today) + the TASK 1 / TASK 2 tests. `envFor` also clears `LOCAL_STACK_LOCK_OWNER_*` and `BKIT_TEST_SLOTS`.

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
- Exit 75 **and** the log holds the script's give-up line → no verdict, no artifact; prints the `[machine-lock]` lines; emits `lockHolder`; returns `EXIT.AGENT_WAIT` (81). Exit 75 without that line → the gate's own exit (FAIL).
- Exit 73 **and** a `[machine-lock] ❌` line → could-not-run path: exit 4 (`EXIT_COULD_NOT_RUN`), the line (path + reason) logged.
- Output gains `lockHolder` (holder line when the wait gave up, else null); `exitCodes` gains 81; summary names `81 tests lock held`. `red` / `green` unchanged.

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
- Temp consumer checkout with stub `bkit:gate:*` / `bkit:test:file` scripts (node one-liners writing start / end timestamps); real lock holders via the template script; `bkit` spawned through `requireTsx()`; per-test `XDG_CACHE_HOME`; `CI` and `LOCAL_STACK_LOCK_OWNER*` cleared.

#### [MODIFY] `dist/`

- Rebuilt with `pnpm build` in each engine-editing commit (`.agents/rules.md` § Engine builds).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** Step 8 (Plan Verify) sub-step 8 group-gate `Route:` (line ~555) and Step 12 sub-step 2 `Decide` (line ~749) exist.
- Each gains `**If** exit 81 → end turn, re-run this block.` before `**Else**`.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** Step 3 sub-step 1 `Decide` (line ~297).
- Same route line.

### Vitest (bkit repo only)

#### [NEW] `vitest.test-lock.ts`

- **Reuse Check:** `Reuse Inventory` row "Run-wide tests lock for raw vitest runs" — reasons (a) / (b).
- Pure `testLockDecision({ filters, env, exists, watch })` → `{ take, reason }`: no lock under `CI`, a live `LOCAL_STACK_LOCK_OWNER_tests`, watch mode, or when every filter (`:line` suffix stripped) is an existing file; else take.
- Pure `testWorkers(env)` → `{ maxWorkers: n }` when `BKIT_TEST_WORKERS` is a whole number >= 1, else `{}`.
- Default-export global `setup(project)`: reads `project.vitest.config.filters` / `.watch`; on take, spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c 'printf "locked %s\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat >/dev/null'` with piped stdin and inherited stderr (waiting notes reach the human); resolves on `locked`, sets `process.env.LOCAL_STACK_LOCK_OWNER_tests`; child exit before `locked` → throws naming its exit and stderr. Returned teardown closes stdin and awaits the child. vitest dying closes the pipe → holder exits → lock frees within a second.

#### [MODIFY] `vitest.config.ts`

- **Existence Check:** file exists; `vitest.unit.config.ts` merges it.
- `globalSetup: ["./vitest.test-lock.ts"]`; `...testWorkers()` in `test`.

#### [NEW] `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Heavy / light decision tests" — reason (a).
- Unit tests of `testLockDecision` / `testWorkers` with injected `env` / `exists`; wiring asserted on comment-stripped `vitest.config.ts` text, as `vitest-timeout-budget.test.ts` does.

#### [NEW] `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Global setup against a real lock" — reason (b).
- Calls the default-export `setup` with a plain `{ vitest: { config: { filters: [], watch: false } } }` input against a real holder of the dogfood script; `LOCAL_STACK_LOCK_OWNER_tests` stubbed empty so the outer run's owner does not short-circuit it; per-worker `XDG_CACHE_HOME` from `vitest.setup.ts`.

### Docs

- `.bkit/core/.bkit/templates.md` § Local stack lock → § Machine lock (+ catalog rows 17 / 41 / 73); `.bkit/core/.agents/rules.md` § Shared local stack, `bkit-build-plan-execute.md`, `bkit-build-plan-gaps-remediate.md` name § Machine lock; `.bkit/instructions.md` re-synced (`pnpm instructions:sync`); `.bkit/core/.bkit/workflows.md` tests-lock bullet; `docs/testing.md` § Tests lock; `docs/architecture.md` tree lines; `CHANGELOG.md` `[Unreleased]`; mirrors via `bkit install`.

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
| `.bkit/core/.bkit/templates.md` | § Local stack lock → § Machine lock: stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` (gates pass it to their runner, e.g. vitest `--maxWorkers`), lock order, `run` exits 73 / 75, light vs heavy runs, `bkit tests run` takes `tests` itself, adopted copies keep working; catalog rows (lines 17, 41, 73) renamed (TASK 3) |
| `.bkit/core/.agents/rules.md` | § Shared local stack names `.bkit/templates.md` § Machine lock (TASK 3) |
| `.bkit/core/prompts/bkit-build-plan-execute.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | Shared local stack line names § Machine lock (TASK 3) |
| `.bkit/instructions.md` | `shared-local-stack` refs + text re-synced with `pnpm instructions:sync` (TASK 3) |
| `.bkit/core/.bkit/workflows.md` | rationale bullet beside **CI-Dispatch poll**: `bkit tests run` exits 81 while the tests lock is held; every `tests run` block routes 81 → end turn, re-run (TASK 5) |
| `docs/testing.md` | new § Tests lock (what takes it, what skips it, `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `--lock-wait-s`, exit 81) (TASK 4); § Stack line for `vitest.test-lock.ts` + raw-run rule; § Key test files rows for the 4 new test files (TASKS 1, 4, 6) |
| `docs/architecture.md` | tree line `scripts/` (adopted template copies, pinned by `dogfood-templates.test.ts`) (TASK 1); `.bkit/templates/` note that `bkit tests run` executes the packaged lock script (TASK 4); tree line `vitest.*.ts` (root test-runner config + helpers) (TASK 6) |
| `CHANGELOG.md` | `[Unreleased]`: template rename + named locks (TASK 3); `bkit tests run` tests lock + exit 81 (TASK 4) |
| Mirrors (`.bkit/templates.md`, `.agents/rules.md`, `.claude/` / `.cursor/` / `.opencode/` / `.codex/` / `.agents/plugins/` agents and workflows) | regenerated by `bkit install` (TASKS 3, 5) |
| `docs/capabilities.md` | regenerated by `pnpm graph:rollup` when the pre-push graph check asks (new modules) |
| `docs/decisions.jsonl` | 8 `724-*` rows written by this plan (Ledger rows line) |
| `docs/deferrals.jsonl` | 3 `724-*` `Exempt` rows (Out of Scope) |
| `docs/observability.md` | none — no new `[bkit-*]` prefix; engine lines stay under `[bkit-tests]` |
| `docs/data-schema.md`, `docs/design.md`, `docs/technology.md` | none — no schema, UI or new dependency |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | n/a | No database |
| **Code** | `git revert {COMMIT}` per task commit, newest first | Reverting TASK 4 alone restores unlocked gates; consumers' adopted copies are unaffected either way |
| **Risk window** | Between a release with TASK 1 and one with TASK 4 | The template rename is inert until `bkit tests run` uses it; a consumer upgrading in between only sees `removed:` / `added:` template lines |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: script (Group 1) → engine + workflows (Group 2) → bkit's own vitest (Group 3). Suggested integration shape (advice only): one PR; one commit per task. Every engine-editing commit carries `pnpm build` output (`dist/`).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Machine lock script

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script (bash 3.2-compatible) plus optional `[name]` on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; named lock at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock`, no repo prefix; `LOCAL_STACK_LOCK_PID_<key>` / `LOCAL_STACK_LOCK_OWNER_<key>` so children skip; named-lock holder line names the caller's checkout; unnamed lock path, names and holder line unchanged; `run "<who>" [--lock <name>] -- <cmd>` exits with the command's status, 2 usage, 73 lock not takeable, 75 wait gave up; functions still return 1 on every refusal; prefix `[machine-lock]`; header documents API, lock order, exits
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test of `local-stack-lock.integration.test.ts` pointed at the new script, `envFor` also clearing `LOCAL_STACK_LOCK_OWNER_*` / `BKIT_TEST_SLOTS`, plus the tests below
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`) → `scripts/ci/bkit-machine-lock.sh`: `identical`
  - **UPDATE:** `docs/architecture.md`: Package Boundaries tree gains `scripts/` (adopted template copies, pinned by `dogfood-templates.test.ts`)
  - **UPDATE:** `docs/testing.md`: § Key test files row for `machine-lock.integration.test.ts`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts` passes, including every carried-over stack-lock test unchanged in intent; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `cmp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/bkit-machine-lock.sh` exits 0; `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is gone
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` fails on the second repo starting at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side` fails on the second take refusing
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock` fails on the child waiting on its parent
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other` fails on both copies holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on` fails on usage error for `--lock`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` fails on exit 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the path when the lock dir cannot be written` fails on exit 1 with no path

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Slots, `BKIT_TEST_WORKERS` and the enforced lock order on the `tests` lock
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: `BKIT_TEST_SLOTS` (whole number >= 1, else 1 + one stderr note) gives the `tests` lock slot files `tests.lock`, `tests.<k>.lock`; the perl holder tries each slot per second; waiting note and `local_stack_lock_holder tests` name every holder; taking `tests` exports `BKIT_TEST_WORKERS` = max(1, floor(cores / slots)) (cores: `getconf _NPROCESSORS_ONLN`, `nproc`, `sysctl -n hw.ncpu`, else 1); asking for `tests` while this shell or a live parent holds another lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` → 73)
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: same bytes as the template
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the tests below
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `/bin/bash -n` on the template exits 0; `cmp` template vs dogfood copy exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on two runs holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots` fails on the variable being unset
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding the stack lock is refused, naming the lock order` fails on the tests lock being taken

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Point every template doc, rule and prompt at § Machine lock
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock → § Machine lock (stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` passed to the runner, lock order, `run` exits 73 / 75, light vs heavy runs, `bkit tests run` takes `tests` itself, a consumer's adopted copy keeps working); catalog rows at lines 17, 41, 73 name `bkit-machine-lock.sh`
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-execute.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/instructions.md`: `shared-local-stack` refs and text re-synced (`pnpm instructions:show --file` before editing, `pnpm instructions:sync` after)
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — template renamed `bkit-machine-lock.sh`, named machine-wide locks, slots, lock order, `run` exits 73 / 75; adopted copies keep working
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -rln -e bkit-local-stack-lock -e 'Local stack lock' .bkit/core .bkit/templates.md .bkit/instructions.md .agents/rules.md` finds nothing; `bkit install` regenerates the mirrors and `bkit check` reports no drift; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/tools/instructions.test.ts` passes
  - **TEST FIRST:** n/a — docs, rules and prompt text only; existing template / instructions tests cover the shapes

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: `bkit tests run` takes the tests lock

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Gate runs take the tests lock through the packaged script; single-file runs do not
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `run` verb gains `--lock-wait-s` (whole number >= 0, default 60); outside `CI` the gate argv becomes `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "bkit tests run <gate>[ <fid>][ <step>]" --lock tests -- <gate argv>` with `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s`; exit 75 with the script's give-up line in the log → print the `[machine-lock]` lines, emit `lockHolder`, no artifact, return `EXIT.AGENT_WAIT`; exit 73 with a `[machine-lock] ❌` line → `EXIT_COULD_NOT_RUN` naming path + reason; `lockHolder` output field, exit 81 in `exitCodes` and the verb summary; `red` / `green` unchanged
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: exports `wholeNumber` (moved from `runs.ts`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: imports `wholeNumber` from `../lib.js`
  - **DELETE:** `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts`: moved to `lib.ts`
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: where the packaged template lives in a consumer install
  - **READ:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: argv + env the gate runs with
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, against real lock holders of the template script and a stub gate in a temp checkout, `bkit` spawned via `requireTsx()`
  - **UPDATE:** `docs/testing.md`: new § Tests lock (what takes it, what skips it, `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `--lock-wait-s`, exit 81); § Key test files row for `tests-lock.integration.test.ts`
  - **UPDATE:** `docs/architecture.md`: `.bkit/templates/` tree note — `bkit tests run` executes the packaged `scripts/ci/bkit-machine-lock.sh`
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — `bkit tests run` holds the machine-wide tests lock, `--lock-wait-s`, exit 81
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/runs.test.ts` passes; `node dist/cli.js tests run --help` lists `--lock-wait-s` and exit 81; `grep -c 'const wholeNumber' .bkit/core/engine/commands/workflow/runs.ts` prints 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on unknown flag
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if red is wired to the lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate` fails on unknown flag
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `a gate that itself exits 75 is a FAIL verdict, not a lock wait` fails on exit 81 for the gate's own 75

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 (group gate) `Route:` and Step 12 sub-step 2 `Decide` gain `**If** exit 81 → end turn, re-run this block.` before `**Else**` (read `.bkit/authoring.md` § Prompts and Workflows + § Workflows Only first)
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3 sub-step 1 `Decide` gains the same route
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: rationale bullet beside **CI-Dispatch poll** — `bkit tests run` exits 81 while the machine-wide tests lock is held past `--lock-wait-s`; every `tests run` block routes 81 → end turn, re-run
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: the test below, per `PROBES` workflow, over `testBlocks`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes; `bkit install` regenerates the mirrors and `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every tests run call site routes exit 81 to a re-run of its block` fails on a block whose `Else` sends exit 81 to the Failure Path

<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: bkit's own raw vitest runs queue too

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **CREATE:** `vitest.test-lock.ts`: pure `testLockDecision({ filters, env, exists, watch })` (no lock under `CI`, a live `LOCAL_STACK_LOCK_OWNER_tests`, watch mode, or when every filter minus a `:line` suffix is an existing file); pure `testWorkers(env)` (`{ maxWorkers }` from a valid `BKIT_TEST_WORKERS`, else `{}`); default-export global `setup(project)` that, for a heavy run, spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c '…; exec cat >/dev/null'` on a piped stdin, resolves on its ready line, exports `LOCAL_STACK_LOCK_OWNER_tests`, throws naming the exit if the child ends first, and returns a teardown that closes stdin and awaits the child
  - **UPDATE:** `vitest.config.ts`: `globalSetup: ["./vitest.test-lock.ts"]`; `...testWorkers()` in `test`
  - **READ:** `unitTimeouts` in `vitest.timeout-budget.ts`: sibling root-helper pattern (pure functions + one config spread)
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the unit tests below, beside `vitest-timeout-budget.test.ts`
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`: the integration tests below, with `LOCAL_STACK_LOCK_OWNER_tests` stubbed empty
  - **UPDATE:** `docs/testing.md`: § Stack names `vitest.test-lock.ts` (heavy raw runs queue, light / watch / CI / nested never wait); § Key test files rows for both new files
  - **UPDATE:** `docs/architecture.md`: Package Boundaries tree gains `vitest.*.ts` (root test-runner config + helpers)
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line naming the first; `pnpm bkit:test:file <one file>` does not wait; `pnpm vitest run` (full suite) passes with the global setup in place
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run whose every filter is an existing test file is light and takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no filters, or a pattern filter, is heavy and takes the tests lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run started under a live tests-lock owner takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=true takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `BKIT_TEST_WORKERS sets maxWorkers when present` fails on maxWorkers left at vitest's default
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a watch-mode run takes no lock` fails on a watch run being told to take the lock
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup waits for a held tests lock and takes it once the holder ends` fails on setup resolving while the lock is held
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup's teardown frees the tests lock` fails on the lock staying held after teardown

<!-- bkit:task 6 end -->
<!-- bkit:group 3 end -->

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
- [ ] **Test Synchronization:** `.bkit/core/engine/commands/workflow/tests.test.ts` (in-process `tests run`, now through the lock script in a per-worker temp `XDG_CACHE_HOME`) and `.bkit/core/engine/commands/workflow/runs.test.ts` (`wholeNumber` move) green; no E2E suite in bkit.
- [ ] **Build Configuration:** `tsconfig.json` still excludes `**/*.test.ts`; `vitest.test-lock.ts` stays outside `dist/` (root helper, not an engine entry).
- [ ] **Integration (`machine-lock.integration.test.ts`):** its Derived Test Matrix rows + every carried-over stack-lock test; real bash / perl / flock, per-test `XDG_CACHE_HOME`.
- [ ] **Integration (`tests-lock.integration.test.ts`):** its matrix rows; real holders, `bkit` via `requireTsx()`.
- [ ] **Unit (`local-gate-audit.test.ts`):** exit-81 routing guard.
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
