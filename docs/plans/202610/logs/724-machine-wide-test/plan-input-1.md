## Session Prompt — this run's, newer than everything below

/bkit-plan #724

## Issue description — oldest

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. One vitest run already sizes its worker pool to every core, and many bkit tests start their own `git`, `tsx` and `bkit` child processes. Measured on a 10-core MacBook (4 performance + 6 efficiency cores, 32 GB) during parallel agent runs: `uptime` load average 78.01 over 5 minutes, about eight runnable processes per core. The pain crosses repos: agents in bkit, app-gether-life and other consumer repos compete for the same CPU. `vitest.timeout-budget.ts` only stretches time limits so slow tests stop failing; runs still pile up.

This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning). It ships to consumers as a script template, built by extending the existing stack lock, not by adding a second lock script.

Decisions already made:

1. **Fixed slots, not live load.** Default 1 heavy run per machine; `BKIT_TEST_SLOTS` overrides it. Each holder exports `BKIT_TEST_WORKERS` = cores / slots for its test runner. Live load average lags (two agents checking at once both see a quiet machine), so it never decides who runs.
2. **Agent tool timeouts.** `bkit tests run` waits for the lock up to `--lock-wait-s` (default 60, the same budget `bkit runs dispatch` polls with), then exits 81 naming the holder. 81 is the existing "hand the wait back to the agent's turn loop" code: the workflow ends its turn and re-runs the block. A raw `pnpm test` in bkit's repo just waits and prints the holder once a minute.
3. **Light runs skip the lock.** Single-file runs (`bkit tests red`, `bkit tests green`, `bkit:test:file`, a raw `vitest run` naming only existing test files) never wait. They use about one core; queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the load.
4. **Rename the script** to `bkit-machine-lock.sh` and generalise it with named locks. The named-lock API comes from app-gether-life's adopted copy (`scripts/ci/local/local-stack-lock.sh`: `take_local_stack_lock "<who>" [name]`, `LOCAL_STACK_LOCK_OWNER_<name>`), which already runs a second named lock (`e2e-phones`) beside the stack lock. No migration: the script is copy-and-own, consumers keep their copies at paths and names of their own (app-gether-life's lives at `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` already prunes the old name from `.bkit/templates/` and prints `removed:` on upgrade.
5. **Lock order.** A run that needs several locks takes the tests lock first, then any other named lock, then the unnamed stack lock. One fixed order means two runs can never each hold one lock and wait forever for the other.

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

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

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a named lock is machine-wide: checkouts of two different repos wait on the same named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| one process holds a named lock and the unnamed stack lock side by side | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a named-lock holder does not wait on that named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run --lock` holds the named lock for the command and passes its exit status on | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 75 when the wait gives up, distinct from the command's own failure | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| tests run waits for a held tests lock and runs the gate once the holder finishes | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run exits 81 naming the holder when the lock stays held past --lock-wait-s | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run holds the tests lock for the whole gate, so a second tests run waits | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests red runs its test file without waiting for a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run under CI=true never waits on a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run with an unwritable lock dir exits 4 naming the path | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| a run whose every filter is an existing test file is light and takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run started under a live tests-lock owner takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| CI=true takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| BKIT_TEST_WORKERS sets maxWorkers when present | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |

### Tasks

<!-- bkit:group 1 start -->

### TASK GROUP 1: Machine lock script

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide, slotted locks
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script plus an optional `[name]` argument on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` (API as in app-gether-life's `scripts/ci/local/local-stack-lock.sh`); a named lock lives at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock` with no repo prefix, so it is machine-wide; `LOCAL_STACK_LOCK_OWNER_<name>` lets children skip; `BKIT_TEST_SLOTS` gives the `tests` lock N slot files and the holder exports `BKIT_TEST_WORKERS`; `run "<who>" [--lock <name>] -- <cmd>`; `run` exits 75 when the wait gives up; header states the lock order (tests, then other named locks, then the stack)
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test from `local-stack-lock.integration.test.ts`, pointed at the new script, plus the new ones below
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes, including every carried-over stack-lock test unchanged in intent
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` fails on the second repo starting at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side` fails on the second take refusing
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock` fails on the child waiting on its parent
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other` fails on both copies holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on two runs holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots` fails on the variable being unset
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on` fails on usage error for `--lock`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` fails on exit 1

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Adopt the script in bkit's repo and point every doc at it
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `scripts/ci/bkit-local-stack-lock.sh` "not-adopted" entry becomes `scripts/ci/bkit-machine-lock.sh` identical (bkit now uses the tests lock)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock becomes § Machine lock — the stack lock, named locks, the tests lock, slots, `BKIT_TEST_WORKERS`, lock order, light vs heavy runs; a consumer's adopted copy keeps working
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-execute.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `docs/testing.md`: new section on the tests lock — what takes it, what skips it, `BKIT_TEST_SLOTS`, exit 81
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `grep -rn 'local-stack-lock\|Local stack lock' .bkit/core docs/testing.md` finds nothing; `bkit install` regenerates the mirrors (`.bkit/templates.md`, `.agents/rules.md`, `.bkit/instructions.md`, agent mirrors) with no drift in `bkit check`
  - **TEST FIRST:** n/a — docs and the dogfood registry; the existing dogfood-templates test covers the copy

<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: `bkit tests run` takes the tests lock

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Gate runs take the tests lock through the packaged script; single-file runs do not
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb runs the gate under `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "<workflow> <fid> <step>" --lock tests -- <gate>` with `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` (default 60); exit 75 from the lock → exit 81 printing `lockHolder`; lock dir error → exit 4; `--lock-wait-s` flag and exit 81 added to the verb's help and `exitCodes`; `red` / `green` unchanged (no lock)
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: where the packaged template lives in a consumer install
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `--budget-s` / exit 81 pattern to mirror
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, against a real lock script and a stub gate
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` passes; `bkit tests run --help` lists `--lock-wait-s` and exit 81
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on unknown flag
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if red is wired to the lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 7 sub-step 8 (group gate) and the Run-Tests block Route gain **If** exit 81 → end turn, re-run the block, before **Else** → Failure Path
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `tests run` block in Context (local tests) gains the same exit 81 route
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commands names `bkit tests run` among the blocks that exit 81 (tests lock held)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** every `tests run` block in `.bkit/core/workflows/*.md` routes exit 81 to a re-run; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes; mirrors regenerated with no `bkit check` drift
  - **TEST FIRST:** n/a — workflow prose; shape covered by the existing workflow-shape test

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: bkit's own raw vitest runs queue too

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **CREATE:** `vitest.test-lock.ts`: a pure `testLockDecision({ filters, env, exists })` (light when every filter is an existing file; skip under CI or a live `LOCAL_STACK_LOCK_OWNER_tests`) and a global setup that takes the `tests` lock through `scripts/ci/bkit-machine-lock.sh` for heavy runs and releases it on teardown
  - **UPDATE:** `vitest.config.ts`: register the global setup; `maxWorkers` from `BKIT_TEST_WORKERS` when set
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the tests below, beside `vitest-timeout-budget.test.ts`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line, and `pnpm bkit:test:file <one file>` does not wait
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run whose every filter is an existing test file is light and takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no filters, or a pattern filter, is heavy and takes the tests lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run started under a live tests-lock owner takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=true takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `BKIT_TEST_WORKERS sets maxWorkers when present` fails on maxWorkers left at vitest's default

<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

### Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Machine-wide named locks with slots | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rln 'local-stack-lock' .bkit scripts`; `grep -rln flock .bkit scripts`; app-gether-life `git grep local-stack-lock` | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — waits, names the holder, never stale, CI no-op; missing named / machine-wide / slotted locks. app-gether-life's copy adds named locks | NEW | Rename of the existing script, extended with app-gether-life's named-lock API; the old file is deleted (Supersession Inventory) |
| Lock script tests | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -rl 'bkit-local-stack-lock' .bkit/core/engine` | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | NEW | Its tests move here with the script rename, plus the named-lock tests |
| bkit's own copy of the lock | `scripts/ci/bkit-machine-lock.sh` | `ls scripts/ci`; `dogfood-templates.test.ts` entry | None — bkit does not adopt the stack lock today | NEW | bkit's repo now takes the tests lock from vitest's global setup |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — unit tests, no real subprocess lock | NEW | Needs real lock processes; kept apart from the unit file |
| Heavy / light decision for raw vitest runs | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` | None — no global setup today; `vitest.timeout-budget.ts` is the sibling pattern | NEW | Root vitest helper beside `vitest.timeout-budget.ts` |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl timeout-budget .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — sibling | NEW | Same place the sibling helper's tests live |

### Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | DELETE | Renamed and generalised; adopted consumer copies are theirs and keep working |
| `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | DELETE | Tests move with the script |

### Open Questions & Assumptions

- **Assumption:** the engine may run the packaged template from `getTemplatesRoot()` (`.bkit/templates/` ships in the npm package, `package.json` `files`). That is a new pattern: no other engine verb executes a copy-and-own template. Planning confirms this, or moves an engine-owned copy under `.bkit/core/`.
- **Assumption:** vitest's global setup can read the run's CLI filters (vitest exposes `filters?: string[]` on its run APIs). Planning confirms the exact field available to a global setup; if none, the light-run rule falls back to `bkit:test:file` setting a skip variable.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays well under the agent's 10-minute tool-timeout ceiling.

### Breaking Changes & Naming

- Template file renamed: `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `bkit-machine-lock.sh`. No migration: consumers' adopted copies are their own (any path, any name) and keep working; `syncTemplateCopies` prunes the old name from `.bkit/templates/` and the upgrade report prints `removed:`.
- Function names (`take_local_stack_lock` etc.), env names (`BKIT_LOCAL_STACK`, `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER`) and the unnamed stack lock's file path are unchanged, so an adopted copy and the new script exclude each other.
- New: `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `LOCAL_STACK_LOCK_OWNER_<name>`, `bkit tests run --lock-wait-s`, `bkit tests run` exit 81.
- Doc section renamed: `.bkit/templates.md` § Local stack lock → § Machine lock.

### Out of Scope

- Catching raw `npx vitest` (or any runner) in consumer repos with a host-level hook on Claude / OpenCode / Codex / Cursor / Antigravity: separate follow-up.
- Upstreaming app-gether-life's `scripts/ci/local/load-gate.mjs` (one runner deciding whether to overlap its own jobs, by projected load and macOS memory pressure). Related, but it solves overlap inside one runner, not between agents.
- Changing `vitest.timeout-budget.ts`, or serializing anything on CI.

### References

- `.bkit/templates.md` § Local stack lock — one run at a time on a shared stack
- `.agents/rules.md` § Shared local stack
- `.bkit/workflows.md` § Commands (exit 81 turn-loop hand-back)
- `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`
- `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`
- `.bkit/core/engine/commands/workflow/tests.ts` (`runToLog`, `testsCommand`)
- `.bkit/core/engine/install/template-copies.ts` (`syncTemplateCopies` prunes removed templates)
- `vitest.timeout-budget.ts`
- app-gether-life `scripts/ci/local/local-stack-lock.sh` (named locks, lock order) and `scripts/ci/local/load-gate.mjs` (lag-aware overlap check)
- `docs/failures.jsonl` key `subprocess-integration-tests-time-out-at-5000ms-under-high-load`
- `docs/failures.jsonl` key `install-upgrade-integration-tests-flake-on-default-5s-timeout`
- `docs/knowledge.jsonl` key `local-pnpm-test-full-parallelism-integration-timeouts-flake`
- `docs/roadmap.md` item 10 — Fix the flake and timeout cluster

## Issue comment — posted 2026-10-29T00:50:26.000Z

### Proposed answer to "one run at a time, or N slots?"

**Recommendation:** fixed slots worked out from the hardware, not decided from live CPU/RAM load. Plus a split between heavy and light runs, so a single-file test run never queues behind a full gate.

**Why not decide from live load**

- **It lags.** The load average is a smoothed ~1-minute figure. Two agents that check at the same moment both see a quiet machine and both start, which is the exact pile-up this issue is about. `vitest.timeout-budget.ts` already notes the reading "sees a quiet machine before that load has built up".
- **It counts everything.** Builds, Docker, the agents themselves and the browser all feed it. A threshold that works one day misfires the next, and "waited because load was 14" is hard to explain or debug.
- **RAM is platform-specific.** macOS memory pressure and Linux `/proc/meminfo` read differently, and a shipped template must work on both. RAM belongs in the slot calculation, not in a live check.

**Proposed shape**

1. **Fixed slots from hardware.** Work out how many heavy runs fit from the core count and RAM, with an env override. Every run gets the same answer, so behaviour is predictable. Note: Apple Silicon splits cores into fast and slow (the 10-core MacBook here is 4 performance + 6 efficiency, `sysctl hw.perflevel0.physicalcpu` / `hw.perflevel1.physicalcpu`), so real capacity is below the raw core count. That machine → 1 heavy slot.
2. **Each run gets its share.** With N slots, the lock script exports a worker count (e.g. `BKIT_TEST_WORKERS` = cores / N). Each consumer's gate script passes it to its own runner (`--maxWorkers` for vitest, the equivalent setting elsewhere), which keeps the shipped part independent of the stack.
3. **Heavy vs light runs.**
   - **Heavy:** full gates (`bkit tests run`) take a slot.
   - **Light:** single-file runs (`bkit tests red`, `bkit:test:file`) skip the heavy lock or use a small separate pool. They use about one core, and queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the extra load.
4. **Live load as a guard only (optional).** Slot free but the machine already badly overloaded by something else → wait briefly and say why. Never the main rule.

**Mechanism:** N lock files, each held the way `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` holds its lock today (a perl process holds the `flock`, so a lock frees itself within a second of its holder dying). A run takes any free slot. When all are taken it waits and names every holder.

**To measure in design, not yet measured:** for CPU-bound work, two half-width runs finish in about the same total time as one full-width run after another. Two slots only win on idle gaps, such as a run's slow last few files and its startup. Time it: one full-width gate twice in a row, versus two half-width gates at once, on the same machine.

## Issue comment — posted 2026-10-29T01:03:17.000Z

Body rewritten as a change issue (Narrative, Success Criteria, Derived Test Matrix, 5 tasks in 3 groups); `bkit tests plan-check` on the body: 0 problems, 0 existence findings. Label `next:design` → `next:plan`.

Where it differs from the slots comment above, the body wins:

- **Slots:** default 1 heavy run per machine plus a `BKIT_TEST_SLOTS` override. No hardware formula, no live-load guard, so no up-front 1-vs-2 timing is needed.
- **Rename without migration:** the script is copy-and-own. Consumers keep their copies at their own paths (app-gether-life: `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` prunes the old name from `.bkit/templates/` on upgrade.
- **Named-lock API upstreamed:** comes from app-gether-life's adopted copy, which already holds a second named lock (`e2e-phones`) beside the stack lock.
