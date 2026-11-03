## Session Prompt — this run's, newer than everything below

[$bkit-build](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-build/SKILL.md) #724

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

## Issue comment — no date, counts as oldest

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

## Issue comment — no date, counts as oldest

Body rewritten as a change issue (Narrative, Success Criteria, Derived Test Matrix, 5 tasks in 3 groups); `bkit tests plan-check` on the body: 0 problems, 0 existence findings. Label `next:design` → `next:plan`.

Where it differs from the slots comment above, the body wins:

- **Slots:** default 1 heavy run per machine plus a `BKIT_TEST_SLOTS` override. No hardware formula, no live-load guard, so no up-front 1-vs-2 timing is needed.
- **Rename without migration:** the script is copy-and-own. Consumers keep their copies at their own paths (app-gether-life: `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` prunes the old name from `.bkit/templates/` on upgrade.
- **Named-lock API upstreamed:** comes from app-gether-life's adopted copy, which already holds a second named lock (`e2e-phones`) beside the stack lock.

## Issue comment — no date, counts as oldest

## Owner answers to the plan's open questions

The owner has answered all 10 open questions in [724-machine-wide-test-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202610/724-machine-wide-test-plan.md). Three answers differ from the plan's recommended option, so the plan has to be redone before it is built.

<!-- prettier-ignore -->
| # | Question | Answer |
| --- | --- | --- |
| 1 | Which copy of the lock script `bkit tests run` executes | **Changed: none of A/B/C.** The engine never runs the script. A consumer copies `bkit-machine-lock.sh` to `scripts/ci/`, customises it, and wraps their `bkit:gate:*` scripts in `package.json` (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate>`), the same as every other template. bkit's own `package.json` does the same. `bkit tests run` only turns the script's exit 75 into exit 81. |
| 2 | `/usr/bin/perl` missing | A: refuse (`run` exits 73, `bkit tests run` exits 4) |
| 3 | Lock order enforced or documented | A: enforced |
| 4 | Worker count for raw `pnpm test` with slots > 1 | A: `maxWorkers` from `BKIT_TEST_WORKERS` only when present |
| 5 | Vitest watch mode | A: takes no lock |
| 6 | Pre-push hook and subagent prompts that run gates raw | **Changed: new option D.** No change to the hook or the prompts, because the wrapped gate scripts carry the lock. TASKS 7 and 8 drop out. A raw caller that gives up waiting sees exit 75 plus the holder line. |
| 7 | Long default wait when an agent with no terminal hits the lock | **Changed: A′.** The lock script itself waits 60 s instead of 3600 s when stdin is not a terminal and `LOCAL_STACK_LOCK_WAIT_S` is unset, then exits 75 naming the holder. This covers every repo that wires the script in, not only bkit's vitest setup. |
| 8 | Host sandbox can't write `~/.cache/bkit/` | A: refuse, naming the path and the host setting |
| 9 | Limit on retries after exit 81 | A: no limit |
| 10 | `BKIT_TEST_WORKERS` at 1 slot | A: floor(cores / slots) |

Recorded in `docs/decisions.jsonl`:
- `724-engine-runs-packaged-lock-template` (Q1)
- `724-lock-order-tests-named-stack-enforced` (Q3)
- `724-shipped-gate-calls-run-through-tests-run` (Q6)
- `724-lock-script-short-wait-without-tty` (Q7, new)

These are committed on `dev` (292cb9857, 90843c6ce, 1aca511ad, f83a0e77a) and not pushed yet.

**Next step:** re-run `/bkit-plan #724` so that the plan matches these answers.

## Issue comment — no date, counts as oldest

**Plan brought up to date with recent commits.** Three new open questions need the owner's answer before building.

**Why:** bkit's plan-currency check (`bkit tasks currency`) compared the plan with every commit since it was last revised (0617256d0). No commit already builds this lock or adds a competing one. But how subagents run tests has changed:
- **Subagents no longer call the gates directly.** They now run `bkit tests changed --fallback=…`, which turns any gate failure into exit 1. So a subagent that gives up waiting for the lock would see a plain test failure, not the "exit 75 plus who holds the lock" message the plan promised.
- **There is a new test-running gate,** `bkit:gate:changed`.

**What changed in `docs/plans/202610/724-machine-wide-test-plan.md`:**
- **New TASK 10:**
  - `bkit tests changed` gets the same lock-wait handling as `bkit tests run`: a `--lock-wait-s` flag, exit 81 meaning "a wait, run it again", and the lock holder's name.
  - The four prompts that run `bkit tests changed` say to re-run on exit 81.
  - A lock wait writes no `test-run` status row.
  - This went into a new task because TASK 5 was already at its 10-test limit.
- **TASK 6:** also puts `bkit:gate:changed` under the lock.
- **TASK 7:**
  - Covers the `tests run` command handed to the gaps-remediate subagent, which the existing guard cannot see.
  - Fixes the notes on `GATE_CALLERS` and `PROBES`, plus moved line references.
- **TASK 5:** the `tests red` test and the Concrete Example use the current flags, `--group` / `--plan`.
- **TASKS 4 and 5:** regenerate the new `.bkit/core/.bkit/cli.md` with `pnpm cli:sync`, and check it with `cli-doc.test.ts`.
- **TASK 3:** updates the renamed `bkit-build-plan-tasks.md` and the new `bkit-build-plan-tests.md`.
- **TASK 1:** the `docs/architecture.md` lines it planned to add have already landed, so it now only checks they are there.

**Open questions for the owner:** new, unanswered. TASKS 6 and 10 are written for the recommended option, which is also the default if left unanswered.
- **Open Question 11:** how `bkit tests changed` reports a lock wait.
  - A) exit 81, like `tests run` (recommended)
  - B) the prompts tell subagents to spot the wait in the output
  - C) change nothing
- **Open Question 12:** whether a lock wait writes a `test-run` status row.
  - A) no row (recommended)
  - B) a row with no verdict
  - C) a new row type
- **Open Question 13:** whether `bkit:gate:changed` takes the lock.
  - A) wrap it like the full gates (recommended)
  - B) let each test run inside it decide
  - C) never lock it
  - Note: `vitest related` hands vitest no file filters, so the light-run rule would treat it as a heavy run anyway.

Open Question 6 keeps its answer D, with a note that its starting assumption has changed. The Open Questions confirmation box is still ticked from before, so it needs a fresh look now that there are new questions.

**Checks:** `bkit tests plan-check` reports 0 problems.

**Commit:** 9a305afda on local `dev` (not pushed yet).

## Issue comment — no date, counts as oldest

## Owner answers, round 2 (2026-11-02)

**Why now.** Today two full test gates ran at the same time on one laptop and a `/bkit-build` run failed its group gate on load timeouts alone. That is the pile-up this issue fixes. Reading the plan's answers against it, I changed four and added two. Everything below is written into `docs/plans/202610/724-machine-wide-test-plan.md` in place (commit c65200076 on dev): Open Questions 7, 8, 9 and 10 carry an "Answered by owner, revised" line, Open Questions 14 and 15 are new, and TASK 11 is new. The per-host facts the answers rest on are in `.bkit/providers.md` § Long-running shell commands, with the sources.

### 1. The lock wait is a host budget, not a number in the script (new Open Question 14, answer B)

A fixed 60 s fits no repo. How long a waiter needs depends on how long the holder's gate runs. How long a waiter can afford depends on what its host does with a shell command that outlives one tool call, and that differs per host. Checked today:

- **Claude Code:** a `Bash` call that passes its timeout (2 minutes by default, up to 10) is moved to the background and Claude is told when it exits. Unattended sessions (`-p`, SDK, CI, cloud) stop a background command after 30 minutes.
- **Codex CLI:** unified exec keeps the process alive as a resumable session; the model reads on with `write_stdin` polls, at most 5 minutes per poll (`background_terminal_max_timeout`). Nobody tells the model when it ends.
- **Google Antigravity:** `run_command` goes async after `WaitMsBeforeAsync`; the agent polls it through `manage_task`. No completion signal documented.
- **Cursor:** the agent terminal has no documented timeout or background contract (the CLI's Shell Mode caps a command at 30 s). Forum reports describe auto-backgrounding after a timeout, but that is not a documented contract.
- **opencode:** `bash` runs in the foreground until the call's timeout; no background option.

Decision: `bkit tests run` and `bkit tests changed` default `--lock-wait-s` from `BKIT_LOCK_WAIT_S`, else 60. bkit ships `BKIT_LOCK_WAIT_S=1200` in the Claude Code settings `env` (a 20-minute wait plus a 10-minute gate stays inside the 30-minute cap on unattended sessions) and nothing for the other hosts, which loop on exit 81 in 60 s calls. That costs one re-run per minute waited and nothing else. The script's own 60 s no-TTY default stays as the floor for raw callers with no engine in front.

On "report back once the test run is done": on Claude Code that is exactly what happens now. The call moves to the background while the gate waits for the lock and runs, and the result arrives when it exits, with no 81 loop. On the other hosts the 81 loop is the report-back, because none of them tells the agent when a command ends.

### 2. The holder line says how long the wait will likely be (part of Open Question 14)

The script records each `tests` run's held time on release (`<lock dir>/tests.last`), and the waiting note and the give-up line end in `last run took 9m50s`, or `no earlier run`. This also gives Open Question 9 (no re-run ceiling) the test it lacked: a holder held past three times its last run is reported as stale, with pid and start time, instead of re-run again.

### 3. The push step (new Open Question 15, answer A, new TASK 11)

Under Open Question 6 D the shipped pre-push hook runs the gate raw. A workflow's `bkit branches push` behind a held lock therefore fails with git's exit code, the give-up line buried in the hook output, after only the script's 60 s. Decision: `branches push` passes the wait and its run name to `git push` (hooks inherit the environment), classifies the hook output with the same classifier `tests run` uses, and exits 81 with `lockHolder` on a `tests`-lock give-up. Every `branches push` block in `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` routes 81 → end turn, re-run, guarded in `local-gate-audit.test.ts`.

### 4. Open Question 10 revised to B

`BKIT_TEST_WORKERS` = max(1, floor(cores / slots) - 1). One gate at a time is the point of this change, and the agent, its hooks and the other sessions still run on the same cores. A gate given all 10 cores recreates the pile-up one gate at a time. At one slot this is vitest's own default width.

### 5. Open Question 8 stays A, plus shipped grants

Where a host has a setting that grants `~/.cache/bkit/`, bkit ships it in the host settings it already writes (Claude Code's sandbox write allow-list; the key is confirmed against the Claude Code sandbox docs at build time). Codex `sandbox_workspace_write.writable_roots` stays the owner's step, since bkit writes no `.codex/config.toml`.

### 6. Open Question 7 stays A′ in shape

The script defaults the wait when stdin is not a TTY and no wait is passed. The number is no longer the design; see 1.

**Unchanged:** Open Questions 1 to 6 and 11 to 13. The plan now has 11 tasks in 5 groups, every task at or under the ten-test cap (TASK 2 sits at 10). The issue body is untouched.

## Issue comment — no date, counts as oldest

**Correction to point 2 above (the holder line's "last run took").** Keying the record by lock name would show repo A's gate time to a waiter queued behind repo B's gate, and the two can differ by a lot. The script now keeps one line per checkout in `<lock dir>/tests.last` (`<checkout path><TAB><seconds>`, replaced in place on every release), and the waiting note and the give-up line print the current holder's own last run, or `no earlier run` when that checkout has none. Open Question 14, TASK 2 and the matrix row are updated in the plan in place.

## Plan — docs/plans/202610/724-machine-wide-test-plan.md — last committed 2026-11-02T04:23:34.000Z

<!-- bkit:anchor
baseSha: 5bb26e7c6ae15bc6bb8ae02054846025d5a45882
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Machine-wide tests lock Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

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

- **WHEN** an agent's `bkit tests run` starts a wrapped gate while no gate holds the `tests` lock **→ THEN** the gate's lock script takes the lock (wait and run name from the engine's env), exports `BKIT_TEST_WORKERS`, runs the gate, frees the lock on exit.
- **WHEN** a second wrapped gate (any repo, any worktree, any caller) starts while the first holds it **→ THEN** it waits and prints the first one's holder line; it starts once the holder ends.
- **IF** the lock stays held past `--lock-wait-s` **→ THEN** `bkit tests run` exits 81 naming the holder; the workflow ends its turn and re-runs the block. A raw caller (a push, or a prompt that runs `pnpm bkit:gate:*`) sees the gate exit 75 with the holder line; a subagent's `bkit tests changed` exits 81 naming the holder, and the subagent runs it again (Open Question 11). `bkit branches push` exits 81 naming the holder when the pre-push hook's gate gave up, and the push block re-runs (Open Question 15).
- **IF** the run is light (`tests red` / `green`, one existing test file), nested under a holder (a wrapped gate inside a wrapped gate included), in watch mode, or `CI` is set **→ THEN** no lock is taken and nothing waits.
- **IF** the holder is killed **→ THEN** the lock frees within a second and the waiter starts.
- **IF** the lock dir cannot be written **→ THEN** the wrapped gate exits 73 naming the path and reason; `bkit tests run` exits 4, no test verdict.
- **IF** stdin is not a TTY and `LOCAL_STACK_LOCK_WAIT_S` is unset (a raw caller with no engine in front) **→ THEN** a waiting gate gives up after 60 s, not 3600 s; under the engine the wait is `BKIT_LOCK_WAIT_S`, else 60 s (Open Question 14).
- **WHEN** a gate waits **→ THEN** the waiting note names the holder, its start time and how long that holder's last run took (recorded by checkout, so one repo's figure never stands for another's); a holder held past three times its last run is reported as stale instead of waited on (Open Question 9).

### Concrete Example

**Setup:** Agent A runs `/bkit-build` for FID `724-x` in worktree `bkit/.worktrees/724-x`; agent B runs `/bkit-debug` in a consumer checkout on the same 10-core laptop. Both repos wrap their test-running `bkit:gate:*` scripts as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>`. Default `BKIT_TEST_SLOTS` (1). Both agents run on Claude Code, whose shipped settings set `BKIT_LOCK_WAIT_S=1200`.

**Steps:**

1. Agent B's Step 3 block runs `bkit tests run --gate=bkit:gate:static-unit-integration …` → the engine runs B's `bkit:gate:static-unit-integration` with `LOCAL_STACK_LOCK_WAIT_S=1200` and `LOCAL_STACK_LOCK_WHO=bkit tests run bkit:gate:static-unit-integration …`; the gate's lock script takes the `tests` lock (`~/.cache/bkit/machine-lock/tests.lock`), exports `BKIT_TEST_WORKERS=9`, runs the gate command.
2. Agent A's group-gate block runs `bkit tests run …` 20 s later → A's wrapped gate waits; the log gets `[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 724-x build-group-gate-1 is waiting for the tests lock: in use by bkit tests run … — /path/to/consumer (pid 4242, since 10:31:07, last run took 9m50s)`.
3. A's tool call reaches its foreground timeout with B's gate still running → Claude Code moves the call to the background and tells A when it exits; A's gate keeps waiting. On a host with no such move (budget 60 s) A's gate instead exits 75 with the give-up line naming the `tests` lock and A's run → the engine exits 81, printing B's holder line and `lockHolder` → A ends its turn and re-runs the block.
4. B's gate finishes → lock frees → A's waiting gate (or its re-run) takes the lock and runs; A reads the block's result when it exits.
5. Meanwhile A's Step 7 records group 1's reds: `bkit tests red --file="{STATUS}" --workflow=build --group=1 --plan="docs/plans/202610/724-x-plan.md" --log=…` → each planned test runs through `bkit:test:file` at once; no lock line in its output.

**Outcome:** the two gates never overlap; A's log names B's run and how long B's last gate took, and so does the 81 hand-back where one happens; A's red never waited.

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
| Plan-added: `bkit tests run` with `CI` set | The wrapped gate's lock script skips the lock; the gate runs at once |
| Plan-added: a gate's own nested lock gives up (exit 75, give-up line for a lock other than this run's `tests` lock) | Read as the gate's exit: verdict FAIL, exit 1, never 81 |
| Plan-added: a gate's nested lock is refused (exit 73, refusal line for a lock other than `tests`) | Read as the gate's exit: verdict FAIL, exit 1, never 4 |
| Plan-added: a child of a `tests` holder needs the unnamed stack lock | Waits on the stack lock as usual, under this script and under an older copy |
| Plan-added: a wrapped gate calls another wrapped gate (`bkit:gate:static-unit-integration` → `bkit:gate:static-unit`) | The inner wrap sees the live `tests` owner and runs unlocked; never waits on itself |
| Plan-added: a push (pre-push hook) or a shipped prompt that runs `pnpm bkit:gate:*` raw starts a wrapped full gate while another gate holds the lock | The gate waits the budget the engine passes (`BKIT_LOCK_WAIT_S`, else 60 s) or, with no engine in front, the script's 60 s no-TTY default, then exits 75 with the script's holder line: `bkit branches push` exits 81 naming the holder and the push block re-runs (Open Question 15); a raw prompt call sees a failed gate naming the holder (Open Question 6) |
| Plan-added: a subagent's `bkit tests changed` runs a wrapped gate (`bkit:gate:changed` or its `--fallback` gate) while another gate holds the lock | The gate waits up to `--lock-wait-s` (default `BKIT_LOCK_WAIT_S`, else 60), then `tests changed` exits 81 naming the holder; the subagent runs it again and edits no code for it (Open Question 11) |
| Plan-added: `bkit tests run --file` exits 81 on a held tests lock | No `test-run` row is appended, so the step's `run` count and its verdicts show only runs that reached the gate (Open Question 12) |
| Plan-added: any wrapped gate, or a heavy raw vitest run in bkit's repo, started with no TTY (agent tool call, push) finds the lock held, `LOCAL_STACK_LOCK_WAIT_S` unset | Waits at most 60 s, then exits 75 naming the holder; a terminal run keeps 3600 s; an explicit `LOCAL_STACK_LOCK_WAIT_S` wins (Open Question 7) |
| Plan-added: a repo whose gate scripts are not wrapped | No lock; `bkit tests run` runs the gate as before (opt-in, as the stack lock) |
| Plan-added: `run` with no `<who>` | Names the run from `LOCAL_STACK_LOCK_WHO`, else the `package.json` script name (`npm_lifecycle_event`), else `run` |
| Plan-added: a host sandbox denies writes to `~/.cache/bkit/` | Same as an unwritable lock dir: exit 4 naming the path (Open Question 8) |
| Plan-added: `BKIT_LOCK_WAIT_S` set to a value that is not a whole number >= 0 | Usage error, exit 2, naming the variable; no gate runs (Open Question 14) |
| Plan-added: the holder has been held for more than three times that holder's last recorded run | The waiting note and the 81 hand-back still name it; the agent reports a stale holder (pid, since, last run took) instead of re-running (Open Question 9) |
| Plan-added: no earlier run is recorded for the holder's checkout | The waiting note reads `no earlier run`; nothing else changes |
| Plan-added: `git push` does not pass the engine's env to the pre-push hook | The hook's gate waits the script's 60 s no-TTY default; `branches push` still reads the give-up line and exits 81 (Open Question 15) |

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
| bkit's root package.json wraps every test-running bkit:gate script in the tests lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/package-json.test.ts` | 6 |
| every tests run call site routes exit 81 to a re-run of its block (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock (plan-added, Open Question 15) | Integration | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` | 11 |
| branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push (plan-added, Open Question 15) | Integration | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` | 11 |
| every branches push call site routes exit 81 to a re-run of its block (plan-added, Open Question 15) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 11 |
| a run whose every filter is an existing test file is light and takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| a run started under a live tests-lock owner takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| CI=true takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| CI=1 takes no lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| BKIT_TEST_WORKERS sets maxWorkers when present | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| a watch-mode run takes no lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 8 |
| the global setup waits for a held tests lock and takes it once the holder ends (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 9 |
| the global setup throws naming the holder when the wait gives up (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 9 |
| the global setup's teardown frees the tests lock (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 9 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking changes:**

- **Template renamed:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `.bkit/templates/scripts/ci/bkit-machine-lock.sh`. No migration: adopted copies are the consumer's (any path, any name) and keep working; `syncTemplateCopies` prunes the old name from the consumer's `.bkit/templates/` and the upgrade report prints `removed:`.
- **Wrapped gates take a machine-wide lock locally** (Open Question 1): in a repo whose `bkit:gate:*` scripts run through `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- …`, a second gate on the same machine waits; `bkit tests run` waits <= `--lock-wait-s` and may exit 81, and so does `bkit tests changed` (Open Question 11 A); a raw caller (a push, or a prompt that runs `pnpm bkit:gate:*`) sees exit 75 and the holder line. Outside `CI` a wrapped gate needs `bash` and `/usr/bin/perl` (missing → `run` exits 73, `bkit tests run` exits 4). A repo that wires nothing sees no change.
- **bkit's own gate scripts wrapped:** bkit's root `package.json` test-running `bkit:gate:*` scripts take the `tests` lock, so bkit's pushes and subagent gates queue too; that includes `bkit:gate:changed` (Open Question 13 A), so every subagent's `bkit tests changed` check in bkit's repo queues behind a full gate.
- **Subagent prompts that call `bkit tests changed` gain an exit-81 line** (Open Question 11 A, TASK 10), and `bkit-build-plan-gaps-remediate.md` re-runs its `Group gate` command on exit 81 (TASK 7).
- **Lock order refused in reverse** (Open Question 3): a caller holding the stack lock that asks for `tests` is refused (functions return 1, `run` exits 73).
- **`run` exit codes:** a lock wait that gives up exits 75 (was 1); a lock that cannot be taken exits 73 (was 1). Function return codes unchanged.
- **No-TTY default wait 60 s** (Open Question 7): with stdin not a TTY and `LOCAL_STACK_LOCK_WAIT_S` unset, every lock in the script (stack lock included) gives up after 60 s, was 3600 s; terminal runs keep 3600 s; an explicit `LOCAL_STACK_LOCK_WAIT_S` wins. The engine always passes one: `BKIT_LOCK_WAIT_S`, else 60 (Open Question 14); the shipped Claude Code settings set 1200.
- **`BKIT_TEST_WORKERS` leaves one core free** (Open Question 10 B): max(1, floor(cores / slots) - 1), vitest's own default width at one slot.
- **Holder lines carry the last run's duration** (Open Question 14): the waiting note and the give-up line end in `last run took <N>m<N>s` (or `no earlier run`), read from the current holder's own line in `<lock dir>/<name>.last` (one line per checkout: path and seconds), written on every release of a named lock.
- **`bkit branches push` exits 81 on a lock wait** (Open Question 15, TASK 11): when the pre-push hook's gate gave up on the `tests` lock, the verb exits 81 with `lockHolder` instead of git's failure; every workflow push block re-runs on 81.
- **Doc section renamed:** `.bkit/templates.md` § Local stack lock → § Machine lock (rules / prompt references follow).

**Unchanged (compatibility):** functions `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; env `BKIT_LOCAL_STACK`, `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER`, `LOCAL_STACK_LOCK_PID`; `run "<who>" -- <cmd>` (a `<who>` before `--lock` / `--` still names the run); the unnamed lock file `~/.cache/bkit/local-stack-lock/<stack>.lock`; `.bkit/templates/.husky/pre-push` and the prompts that run `pnpm bkit:gate:*` raw (`bkit-debug-failure-soak.md`, `bkit-ship-conflict-resolve.md`) (Open Question 6).

**New names:**

<!-- prettier-ignore -->
| Kind | Name |
| --- | --- |
| Template / dogfood file | `bkit-machine-lock.sh` (`.bkit/templates/scripts/ci/`, `scripts/ci/`) |
| Lock dir | `~/.cache/bkit/machine-lock/` (`$XDG_CACHE_HOME/bkit/` when set); `tests.lock`, `tests.<k>.lock`, `tests.last` |
| Env | `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `BKIT_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER_<name>`, `LOCAL_STACK_LOCK_PID_<name>`, `LOCAL_STACK_LOCK_WHO` |
| Lock name | `tests` |
| CLI | `bkit tests run --lock-wait-s`; exit 81; output field `lockHolder`; the same flag, exit and field on `bkit tests changed` (Open Question 11 A); `bkit branches push`: exit 81 + `lockHolder` (Open Question 15) |
| Script CLI | `run ["<who>"] [--lock <name>] -- <cmd>`; exits 73, 75 |
| Gate wiring | `"bkit:gate:<name>": "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>"` |
| Script log prefix | `[machine-lock]` (was `[local-stack-lock]`) |
| Engine export | `wholeNumber` in `.bkit/core/engine/commands/lib.ts`; `classifyLockExit` in `.bkit/core/engine/commands/workflow/tests.ts` |
| Repo files | `vitest.test-lock.ts`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` |
| Doc section | `.bkit/templates.md` § Machine lock; `docs/testing.md` § Tests lock |
| Host setting | `.bkit/shared/.claude/settings.json` `env.BKIT_LOCK_WAIT_S` = `"1200"` (Claude Code only; `.bkit/providers.md` § Long-running shell commands) |

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
  - **Answered by owner:** new option, none of A / B / C — the engine never executes the lock script. Copy-and-own like every other template (`.bkit/templates.md` § Local stack lock pattern): a consumer copies `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to `scripts/ci/`, customises it and wraps its `bkit:gate:*` scripts in `package.json` as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>`; bkit's root `package.json` does the same with its own `scripts/ci/` copy. `bkit tests run` runs the gate as today, passes the wait (`LOCAL_STACK_LOCK_WAIT_S`) and its `<who>` (`LOCAL_STACK_LOCK_WHO`) via env, and classifies the gate's exit: 75 with the give-up line naming the `tests` lock and this run's `<who>` → exit 81 + `lockHolder`; 73 with a refusal line for the `tests` lock → exit 4; else the gate's own verdict. A repo that does not wire the script gets no lock (opt-in, as the stack lock).
- **Open Question 2:** `/usr/bin/perl` missing when a gate needs the lock.
  - **Options:** A) refuse like an unwritable lock dir: `run` exits 73, `bkit tests run` exits 4 naming the reason — the stack lock already refuses without perl; perl ships with macOS, Debian / Ubuntu (`perl-base`) and git-bash · B) run the gate unlocked with one stderr line — Alpine-style hosts keep testing, but the machine-wide promise silently lapses there
  - **Recommended:** A) refuse — one rule for every "could not take the lock" case; `CI` already skips the lock.
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 3:** lock order (issue: "never the reverse") — enforced or documented.
  - **Options:** A) enforced: asking for `tests` while this shell or a live parent holds any other lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` exits 73) · B) script header + docs only — a reversed caller waits its full timeout against a peer holding the other lock, then 81-loops
  - **Recommended:** A) enforced — the order becomes an invariant a test pins (TASK 2).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 4:** raw `pnpm test` in bkit's repo with `BKIT_TEST_SLOTS` > 1 — vitest reads `maxWorkers` when the config loads, before the global setup takes the lock.
  - **Options:** A) `maxWorkers` from `BKIT_TEST_WORKERS` only when present (issue row) — runs under `bkit tests run` get their share; raw runs with slots > 1 keep vitest's default width · B) also derive cores / slots in `vitest.test-lock.ts` when absent — second copy of the shell formula · C) take the lock at config load (top-level await) — every config load (IDE extension, `vitest list`, `vitest.unit.config.ts`) can queue
  - **Recommended:** A) — slots > 1 is opt-in and raw runs are bkit-repo only.
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 5:** `vitest` watch mode (plan-added; the issue does not mention it).
  - **Options:** A) watch / dev mode takes no lock — an open session would block every gate for hours · B) watch takes the lock like a heavy run — a watch session's re-runs never overlap a gate, but every gate on the machine waits (then exits 81) for as long as the session stays open
  - **Recommended:** A).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 6:** full gates bkit ships outside a workflow block skip the lock in consumer repos — `.bkit/templates/.husky/pre-push` runs `pnpm bkit:gate:static-unit-integration` / `bkit:gate:static-unit` raw (fired by every `bkit branches push`), and `bkit-build-plan-gaps-remediate.md:92`, `bkit-debug-failure-remediate.md:72`, `bkit-build-plan-verify.md:66`, `bkit-debug-failure-soak.md:68`, `bkit-ship-conflict-resolve.md` run `pnpm bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` raw. SC 1 ("Two full test gates … never run at the same time") then fails for pushes and subagent gates — the load in `.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`.
  - **Options:** A) hook and prompts run their gate through `bkit tests run` — SC 1 holds for every shipped gate; a push on a busy machine stops after `--lock-wait-s` with exit 81 and must be re-pushed; a consumer's copied hook changes only when re-copied · B) hook through `bkit tests run`, prompts stay raw — smaller prompt change; subagent gates in consumer repos keep overlapping; needs SC 1 narrowed by the human + a `Blocking` deferral · C) neither; the human narrows SC 1 to `bkit tests run` gates + a `Blocking` deferral for both — pushes keep overlapping gates (the friction row stays open) · D) neither the hook nor the prompts change: they call `pnpm bkit:gate:*`, which carries the lock once the repo wraps its gate scripts (Open Question 1) — every caller queues with no hook re-copy; a raw caller that gives up sees exit 75 + the holder line, never 81
  - **Recommended:** A) — the only option that meets SC 1 as written.
  - **Default if unanswered:** A.
  - **Answered by owner:** D.
  - **Premise changed after the answer:** four of the prompts above now run `bkit tests changed --fallback=bkit:gate:*` instead of `pnpm bkit:gate:*`, and that verb maps a lock give-up to exit 1, not 75. Open Question 11 asks the question again for them. The pre-push hook, `bkit-debug-failure-soak.md` (`pnpm bkit:gate:static-unit`, Process step 6) and `bkit-ship-conflict-resolve.md` (`pnpm bkit:gate:install-static-unit-build`, Process step 9) still run the gate raw, so answer D stands for them.
- **Open Question 7:** a heavy raw vitest run in bkit's repo started by an agent with no TTY (ad-hoc `pnpm test`, any raw gate left after Open Question 6) waits the script's default 3600 s while another gate holds the lock — past the agent's ~10-minute tool timeout, so the agent sees a killed call, not a holder line.
  - **Options:** A) the global setup passes `LOCAL_STACK_LOCK_WAIT_S` = 60 to its holder when stdin is not a TTY and the variable is unset, then throws naming the holder — the agent sees the holder within a minute and re-runs; a terminal run keeps the 3600 s wait · A′) the lock script itself defaults the wait to 60 s when stdin is not a TTY and `LOCAL_STACK_LOCK_WAIT_S` is unset (terminal runs keep 3600 s; an explicit `LOCAL_STACK_LOCK_WAIT_S` always wins) — every wrapped gate, push and subagent call in every repo sees the holder within a minute; the global setup sets no wait · B) always 60 s — a human's terminal run fails after a minute too · C) keep 3600 s, documented — agent calls time out silently
  - **Recommended:** A) — reuses the script's existing wait variable; no new env name.
  - **Default if unanswered:** A.
  - **Answered by owner:** A′.
  - **Answered by owner, revised:** A′ stays the script's shape; the number is no longer the design. Under the engine the wait is a host budget (Open Question 14); the script's 60 s no-TTY default is the floor for raw callers only.
- **Open Question 8:** host sandboxes and the lock dir (`.agents/rules.md` § Provider parity). Every local `bkit tests run` writes `~/.cache/bkit/machine-lock/`; a host that limits writes to the workspace denies it. Hosts: Claude Code (sandbox off by default; when on, writes outside the workspace need its write allow-list), Codex (bkit agents run `workspace-write`, `.bkit/providers.md`; outside paths need `sandbox_workspace_write.writable_roots`), OpenCode, Cursor (agent terminal sandbox when enabled), Antigravity, cloud agents (fresh VM; no other gate on the machine) — write scope per host checked by Manual Verification Step 6.
  - **Options:** A) refuse with exit 4 naming the path and the host setting that grants it — matches the issue Edge Case "Lock dir … not writable → exit 4"; a sandboxed host gates nothing until its owner grants `~/.cache/bkit/` · B) run the gate unlocked with one stderr line when the lock dir is unwritable — sandboxed hosts keep gating; the machine-wide promise lapses there and the issue Edge Case changes · C) put the lock under a path every host can write (`$TMPDIR`, the checkout's git dir) — `$TMPDIR` differs per sandboxed session and the git dir is per repo, so locks stop meeting machine-wide
  - **Recommended:** A).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
  - **Answered by owner, revised:** A, and where a host has a setting that grants the path, bkit ships it in the host settings it already writes (Claude Code's sandbox write allow-list; the key is confirmed against the Claude Code sandbox docs at build time). Codex `sandbox_workspace_write.writable_roots` stays the owner's step, since bkit writes no `.codex/config.toml` (`.bkit/providers.md` § Permissions / auto-approve).
- **Open Question 9:** exit-81 re-run ceiling. A holder that runs 30 minutes means ~30 end-turn / re-run cycles at the 60 s default; a hung holder never frees the lock.
  - **Options:** A) no ceiling, as the CI-dispatch poll (`.bkit/core/.bkit/workflows.md`); the holder line carries pid and start time, so the agent can report a stale holder — a hung holder loops until a human acts · B) cap re-runs (e.g. 10), then the Failure Path naming the holder — bounded, but needs a re-run counter kept across turns and fails real long gates
  - **Recommended:** A) — `.bkit/core/.bkit/workflows.md` states it (TASK 7).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
  - **Answered by owner, revised:** A, with a stale test the agent can apply: the waiting note and the 81 hand-back name the holder's last run duration (Open Question 14); a holder held past three times it is reported as stale (pid, since, last run took) in place of another re-run. On Claude Code the loop rarely runs at all (budget 1200 s).
- **Open Question 10:** `BKIT_TEST_WORKERS` at 1 slot. The issue formula floor(cores / slots) gives 10 on the 10-core machine; vitest's own default is cores - 1, so a gate under `bkit tests run` gains one worker.
  - **Options:** A) issue formula floor(cores / slots) — one extra worker while only one gate runs · B) max(1, floor(cores / slots) - 1) — matches vitest's default at 1 slot; departs from the issue formula and the `Derived Test Matrix` row "cores divided by slots" · C) export only when slots > 1 — no change at the default; one more branch
  - **Recommended:** A) — issue text; one worker is noise once only one gate runs.
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
  - **Answered by owner, revised:** B. One gate at a time is the point of this change, and the agent, its hooks and the other sessions still run on the same cores; a gate given every core recreates the pile-up one gate at a time. The matrix row reads "cores divided by slots, minus one".
- **Open Question 11:** how `bkit tests changed` reports a `tests`-lock give-up of the gate it runs; TASK 10 lands the answer. Four shipped prompts run it: `bkit-build-plan-tasks.md` (`--fallback=bkit:gate:static`), `bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md` and `bkit-build-plan-verify.md` (`--fallback=bkit:gate:static-unit`). `testsChangedVerb.run` in `.bkit/core/engine/commands/workflow/tests-changed.ts` runs `bkit:gate:changed` when declared, else the fallback gate, with stdin closed (so the script's 60 s no-TTY wait applies) and no `LOCAL_STACK_LOCK_WHO` (holder lines name the gate through `npm_lifecycle_event`). It echoes the gate's output lines and maps every non-zero exit except 126 / 127 to exit 1 FAIL. Open Question 6's answer D assumed such a subagent would see exit 75; it sees exit 1 with the give-up line in its output.
  - **Options:** A) `tests changed` takes the `tests run` contract from TASKS 4 / 5: `--lock-wait-s` (default 60) passed as `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_WHO` = `bkit tests changed <gate>`, `classifyLockExit` mapping a give-up of this run to exit 81 + `lockHolder` and a `tests`-lock refusal to exit 4; the four prompts gain one line: exit 81 → run the command again, a wait is not a failure — one lock contract for every engine verb that runs a gate; costs TASK 10, a CLI flag and four prompt edits · B) `tests changed` unchanged; the four prompts gain a line saying that exit 1 with a `[machine-lock]` give-up line naming the `tests` lock is a wait, so run the command again — no engine change; the subagent must spot the line in the output, and a model that misses it edits code or writes `BLOCKED` for a wait · C) change nothing, and Goal 5 and the Edge Cases say a subagent sees exit 1 with the holder line — no work; a lock wait reads as a test failure, so a subagent may "fix" passing code or block its group
  - **Recommended:** A) — the subagent gets the same unambiguous exit the workflow blocks get, and the engine already has the classifier (TASK 4).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 12:** whether a `bkit tests run --file` that exits 81 on the `tests` lock appends a `test-run` status row; TASK 10 lands the answer. Every `--file` run appends one row today, pass, fail or could not run (`appendTestRun` in `.bkit/core/engine/commands/workflow/tests.ts`), and the row's `run` counts the step's rows in the workflow's active run. `.bkit/core/.bkit/workflows.md` § `status.jsonl` — workflow state SoT documents `verdict` null as "the gate could not run". With no ceiling on exit-81 re-runs (Open Question 9), a 30-minute holder means about 30 re-runs of one block.
  - **Options:** A) no row on a lock wait: the gate's tests never started, so `run` and the verdicts count only runs that reached the gate — the status log keeps no trace of the waits; the holder shows only in the agent's output and the gate log · B) a row with `verdict` null and `exitCode` 81 — waits show in the status log; `run` climbs once per wait, and a null verdict no longer means only "could not run", so its documented meaning and every reader of it change · C) a new row type (e.g. `test-wait`) carrying the holder — waits show without touching `test-run` counts; one more row type to document in `.bkit/core/.bkit/workflows.md` and to add to `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts`
  - **Recommended:** A) — a wait is not a test run, and the gate log and the 81 hand-back already name the holder.
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 13:** whether bkit's `bkit:gate:changed` takes the `tests` lock; TASK 6 lands the answer. bkit's root `package.json` declares `"bkit:gate:changed": "node scripts/gate/bkit-gate-changed.mjs"`. The script runs `vitest related --run --passWithNoTests <changed files>`, then `vitest run` / `node --test` / bats on the test files that name a changed path, oxlint, prettier, and `pnpm typecheck` when a `.ts` file changed. In bkit's repo every `bkit tests changed` call runs it, because it is declared. vitest 5.0.5 hands `vitest related` its files as the `related` option, not as filters (`runRelated` in `node_modules/vitest/dist/chunks/cac.*.js` calls `start([], argv)`), so TASK 8's rule reads a raw `vitest related` run as heavy (no filters), and the script's `vitest run <test files>` stage as light.
  - **Options:** A) wrap it like the three full gates: `"bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs"`, with no `sh -c`, so the file arguments pnpm appends reach the script; the vitest runs inside see the live owner and take no lock of their own — one lock for the whole check, given up as exit 75, which `tests changed` maps to 81 under Open Question 11 A; every subagent check in bkit's repo queues behind a full gate, up to 60 s per try · B) leave it unwrapped and let TASKS 8 / 9 decide per vitest run: the `related` stage takes the lock through the global setup (heavy), the `named` stage does not (light), and typecheck and lint never lock — no `package.json` change; the lock is taken and dropped per stage, and a give-up surfaces as the global setup throwing (vitest exit 1), which no classifier reads as a wait · C) leave it unwrapped and add `vitest related` to TASK 8's light rule — a subagent check never waits; a related run can reach many test files and `pnpm typecheck` stays unlocked, so this load keeps overlapping full gates
  - **Recommended:** A) — the check is a real test run, and one wrap gives one wait, one holder line and one exit to classify.
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Open Question 14:** the lock wait. A fixed 60 s fits no repo: a holder runs for as long as its gate runs, and the wait a caller can afford is set by the host's tool call, not by the repo. Hosts differ (`.bkit/providers.md` § Long-running shell commands): Claude Code moves a call past its timeout to the background and reports its exit; Codex and Antigravity keep the process alive and let the model poll; Cursor documents no contract; opencode stops the call.
  - **Options:** A) one constant for every host (60 s) and the exit-81 loop — simple; up to 30 re-runs behind a 30-minute holder on every host · B) the wait is a host budget: `--lock-wait-s` defaults to `BKIT_LOCK_WAIT_S`, else 60; bkit ships 1200 in the Claude Code settings `env` (a 20-minute wait plus a 10-minute gate stays inside the 30-minute cap on unattended background commands) and nothing for the other hosts, which loop; the script's no-TTY default stays 60 s for raw callers; the waiting note and the give-up line name the current holder's last run duration, recorded on release by the holder's checkout (two repos' gates differ in length, so one figure per lock would mislead), so the agent and the hand-back say how long the wait is likely to be · C) the engine detects the host from its env (`CLAUDECODE`, `CURSOR_AGENT`) — no settings entry, but a marker per host to verify and keep current
  - **Recommended:** B) — one variable, set where the budget is known (the host's settings), the loop as the floor everywhere.
  - **Default if unanswered:** B.
  - **Answered by owner:** B.
- **Open Question 15:** the push step. Under Open Question 6 D the shipped pre-push hook runs `pnpm bkit:gate:*` raw; a workflow's `bkit branches push` (every `branches push` block in `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`) then fails with git's exit and the give-up line buried in the hook output, and the hook's gate waits the script's 60 s no-TTY default, never the host budget.
  - **Options:** A) `branches push` passes `LOCAL_STACK_LOCK_WAIT_S` (`BKIT_LOCK_WAIT_S`, else 60) and `LOCAL_STACK_LOCK_WHO` = `bkit branches push <branch>` to `git push`, classifies the hook output with `classifyLockExit` (TASK 4) and exits 81 + `lockHolder` on a `tests`-lock give-up of this run; every workflow push block routes 81 → end turn, re-run, guarded in `local-gate-audit.test.ts` — one contract for every engine verb that can wait on the lock; costs TASK 11 · B) leave it: a push behind a gate fails after 60 s and the agent takes the Failure Path — a lock wait reads as a failed push, with nothing to fix
  - **Recommended:** A).
  - **Default if unanswered:** A.
  - **Answered by owner:** A.
- **Assumption:** vitest 5.0.3 exposes the CLI filters to a global setup as `project.vitest.config.filters` (`ResolvedConfig.filters?: string[]` confirmed in `node_modules/vitest/dist/chunks/plugin.d.*.d.ts`; runtime read confirmed at TASK 9's red) → wrong: the light rule falls back to `bkit:test:file` exporting a skip variable (issue's fallback); TASK 9 changes `package.json` `bkit:test:file`.
- **Assumption:** vitest 5.0.3 exposes watch mode to a global setup as `project.vitest.config.watch` (runtime read confirmed at TASK 9's red) → wrong: every watch session reads as heavy, takes the lock and blocks gates for hours; TASK 9 then reads watch from `process.argv` (no `run` subcommand).
- **Assumption:** a gate exiting 75 by itself is rare; the engine reads 75 as a lock give-up only when the log's give-up line names the `tests` lock and this run's `<who>` (TASK 4 tests pin it, nested-lock case included) → wrong: none, the check is the guard.
- **Assumption:** consumers who do not copy the script and wrap their gate scripts get no lock; install-seeded `bkit:gate:*` defaults stay unwrapped (the script is copy-and-own, absent until copied); `.bkit/templates.md` § Machine lock and the `CHANGELOG.md` upgrade note (TASK 3) tell them to wire it → wrong: their gates keep overlapping other gates on the machine, as today; SC 1 holds only in repos that wire it.
- **Assumption:** pnpm and npm set `npm_lifecycle_event` to the running `package.json` script name, so a wrapped gate called raw (push, subagent prompt) names itself in holder lines → wrong: holder lines read `run` in place of the gate name; locking is unaffected.
- **Assumption:** a wrapped gate passes the script's stdin through, so `[ -t 0 ]` in the script sees the caller's terminal (or its absence) → wrong: a terminal run behind a pipe waits 60 s, not 3600 s, then exits 75 naming the holder.
- **Assumption:** `bash` is on `PATH` wherever a wrapped gate runs locally (bkit hooks already need it), and the script stays bash 3.2-compatible (stock macOS `/bin/bash`: no associative arrays, `mapfile`, `${var,,}`) → wrong: wrapped gates exit 127 and `bkit tests run` exits 4 "could not run" on that host.
- **Assumption:** `getconf _NPROCESSORS_ONLN` reports cores on macOS and Linux (fallback `nproc`, then `sysctl -n hw.ncpu`, then 1) → wrong: `BKIT_TEST_WORKERS` = 1 and gates run narrow but correct.
- **Assumption:** `vitest.setup.ts` points `XDG_CACHE_HOME` at a per-worker temp dir, so a test that runs a wrapped gate, the lock script or the global setup without its own `XDG_CACHE_HOME` only ever takes a temp-dir lock; `tests.test.ts` stub gates are not wrapped and take none → wrong: they queue behind real gates on a busy machine.
- **Assumption:** a Claude Code call that outlives its foreground timeout is moved to the background and Claude is told when it exits (`.bkit/providers.md` § Long-running shell commands), so the shipped 1200 s budget never leaves the agent blind → wrong (`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, bare mode): the call stops at its timeout with the waiting note already printed; the agent re-runs the block, as on every other host, and the owner lowers `BKIT_LOCK_WAIT_S` in `.claude/settings.json`.
- **Assumption:** `git push` passes its environment to the pre-push hook, so the wait and run name `bkit branches push` sets reach the hook's gate → wrong: the hook waits the script's 60 s no-TTY default; `branches push` still reads the give-up line and exits 81.
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
| Engine runs a copy of the lock script (packaged, synced or engine-owned) | Rejected (Open Question 1, owner) | The engine never executes a copy-and-own template; consumers wrap their gate scripts, as with the stack lock |
| Shipped pre-push hook and prompts call `bkit tests run` | Rejected (Open Question 6, owner) | Wrapped gate scripts already lock every caller; no hook re-copy |
| No-TTY short wait only in bkit's vitest global setup | Rejected (Open Question 7, owner) | Pushes and subagent gates in every wired repo would still wait 3600 s past the agent's tool timeout |
| One lock wait for every host | Rejected (Open Question 14, owner) | The affordable wait is a property of the host's tool call: a host that keeps a call alive and reports its exit waits once; the rest loop on exit 81 in short calls |
| Push block left to fail on a held lock | Rejected (Open Question 15, owner) | A lock wait would read as a failed push and send the agent to the Failure Path with nothing to fix |
| Lock order documented only | Rejected (Open Question 3) | A reversed caller deadlocks for its whole wait; enforcing makes it testable |
| Take bkit's raw-run lock at vitest config load | Rejected (Open Question 4) | Every config load (IDE, `vitest list`) could queue |

**Future phase:** time one full-width gate twice in a row vs two half-width gates at once on the 10-core machine before changing the slot default from 1 (first issue comment, "to measure").

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Host-level hook (Claude / OpenCode / Codex / Cursor / Antigravity) catching a raw `npx vitest` or any runner in consumer repos | No Success Criterion needs it: SC 1-5 cover wrapped gate scripts, `bkit tests run`, bkit's own raw runs and the script; issue § Out of Scope names it a separate follow-up | follow-up issue; `docs/deferrals.jsonl` `724-host-hook-catches-raw-test-runners` |
| Upstreaming a consumer's `load-gate.mjs` (one runner overlapping its own jobs by projected load + memory pressure) | Solves overlap inside one runner, not between agents; nothing here depends on it | future template; `docs/deferrals.jsonl` `724-upstream-consumer-load-gate` |
| Changing `vitest.timeout-budget.ts`; serialising anything on CI | Issue non-goal; CI runners have one job and the lock no-ops under `CI` | measurement after ship; `docs/deferrals.jsonl` `724-timeout-budget-and-ci-serialisation-unchanged` |
| Shipped gate-script templates (`.bkit/templates.md` § Gate tool scripts) passing `BKIT_TEST_WORKERS` to the consumer's runner (`--maxWorkers`) | No Success Criterion, scenario or matrix row needs it: at the default 1 slot it changes nothing; `.bkit/templates.md` § Machine lock documents the variable for consumers to wire | follow-up once slots > 1 is in use; `docs/deferrals.jsonl` `724-gate-templates-pass-test-workers` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Full-gate timeouts on single tests (`ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`, `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `runs-wait-cli-found-flaky-under-full-gate`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run`) | `docs/failures.jsonl` (OPEN) | the load the tests lock removes; `vitest.config.ts`; pre-push full gate under a concurrent session | keep separate; re-observe after ship — a recurrence with the lock held points at the test, not the machine |
| Pre-push gate flakes under concurrent load block workflow push | `.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push` (MEDIUM, bkit-repo) | the pre-push gate path: bkit's wrapped `bkit:gate:*` scripts (TASK 6) put it behind the tests lock | link from this plan; close after ship once re-observed |
| Flake triage tracker | `#481 — Flake triage (OPEN)` | same flake cluster (`docs/roadmap.md` item 10) | keep separate; link this plan from it once shipped |
| Pre-commit dist check blocks parallel agents | `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN) | parallel-agent contention on one machine, different resource (`dist/`) | keep separate; needs its own design decision |
| bkit-cloud cross-runner concurrency (global ship lock) | `#397 — bkit-cloud concurrency: global ship lock, FID arbitration (OPEN)`; `docs/deferrals.jsonl` `397-external-cross-runner-lock-primitive-ref-or-label-cas` | "lock" vocabulary only — across CI runners, not one machine | keep separate |

## Security & Privacy

- [ ] **New API Route** — n/a: no routes.
- [ ] **New DB Table/Column** — n/a: no database.
- [ ] **Role-Gated Mutation** — n/a.
- [x] **User Input** — `--lock-wait-s` validated in the `tests run` handler, and in the `tests changed` handler (Open Question 11 A) (`wholeNumber`, exit 2); `BKIT_TEST_SLOTS` validated in the script (whole number >= 1, else 1 + note); lock names sanitised to `A-Za-z0-9._-` before they reach a path (`A-Za-z0-9_` for env keys).
- [x] **Shell injection** (`docs/security.md` § Shell Injection) — the engine runs the gate argv unchanged (`spawnSync`, no shell); `<who>` (gate name, fid, step) and the wait pass as env values (`LOCAL_STACK_LOCK_WHO`, `LOCAL_STACK_LOCK_WAIT_S`), never interpolated into a command string; the script passes `<who>` to perl as `@ARGV`.
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
- [x] **User Context:** read access confirmed to every file the runbook names, and to the consumer's adopted copy the named-lock API comes from. No missing user information; human decisions are Open Questions 1-13, all answered by the owner.
- [x] **Project Context:** read `docs/knowledge.jsonl` `local-pnpm-test-full-parallelism-integration-timeouts-flake`, `spawn-heavy-unit-suite-needs-its-own-budget-under-load`; `docs/failures.jsonl` `subprocess-integration-tests-time-out-at-5000ms-under-high-load`, `install-upgrade-integration-tests-flake-on-default-5s-timeout` and the open `*-timeout-under-full-gate` rows; `docs/decisions.jsonl` (no prior `724-*` row; lock rows `467-*` are workflow locks, unrelated).
- [ ] **Provider parity (lock dir writes):** every host bkit supports must write `~/.cache/bkit/machine-lock/` or refuse with exit 4 naming the setting that grants it — hosts and behaviour in Open Question 8; per-host write scope confirmed by Manual Verification Step 6.
- [x] **Testing & Quality:** tiers per `docs/testing.md` § Which tier does a behaviour need? — lock and engine behaviour cross real bash / perl / flock / subprocess boundaries → Integration, no mocks at the boundary; pure decision helpers and shipped-text guards → Unit. Engine spawned via `requireTsx()` (§ Spawning `bkit` from tests).
- [x] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no secrets. New non-secret env names listed in Breaking Changes & Naming Review.
- [ ] **Schema State:** n/a — no database.
- [x] **Architecture & UI:** `docs/architecture.md` § Package Boundaries tree already places `scripts/ci/` (adopted template copies) and `scripts/gate/`; it places no root `vitest.*.ts` helpers → TASK 9 adds that tree line. No UI.
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
| bkit's adopted copy of the lock | `scripts/ci/bkit-machine-lock.sh` | `ls scripts/ci`; `dogfood-templates.test.ts` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`) | None — bkit adopts no stack lock today | NEW | (a) no candidate; bkit's wrapped gate scripts and vitest's global setup run this copy |
| bkit's test gates take the tests lock | `package.json` | `grep -n '"bkit:gate' package.json`; `grep -rln 'BKIT_GATE_SCRIPTS' .bkit/core/engine` (seeded consumer defaults, `detectGateAdvisories` skips a gate whose value is not the seeded default) | root `package.json` `bkit:gate:static-unit`, `bkit:gate:static-unit-integration`, `bkit:gate:install-static-unit-build`, `bkit:gate:changed` | EXTEND | each value wrapped as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <current command>` (`bkit:gate:changed` per Open Question 13 A, with no `sh -c` so pnpm's appended file arguments reach `scripts/gate/bkit-gate-changed.mjs`); `bkit:gate:min` / `static` / `format` run no test suite and stay unwrapped |
| Guard: bkit's test gates stay wrapped | `.bkit/core/engine/audits/repo/package-json.test.ts` | `ls .bkit/core/engine/audits/repo/package-json*`; `grep -n 'describe(' package-json.test.ts` | `package.json manifest invariants` suite — bkit's own `package.json` invariants | EXTEND | one `it` asserting the three test gates' wrap prefix |
| Dogfood registry entry for the renamed template | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | `grep -n 'local-stack-lock' .bkit/core/engine/audits/repo/dogfood-templates.test.ts` | `ADOPTED` map, `identical` entry kind | EXTEND | entry renamed to `scripts/ci/bkit-machine-lock.sh`, `identical` |
| Frozen older copy for the SC 5 compatibility test | `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` | `ls tests/fixtures`; `grep -rl 'bkit-local-stack-lock' tests/` (none) | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — the bytes an adopted consumer copy holds | NEW | (c) the candidate is a `Supersession Inventory` `DELETE`; the fixture freezes its bytes (`git show HEAD:…`) so the compat test meets a real older copy, outside TASK 3's grep scope |
| Engine reads a wrapped gate's lock outcome | `.bkit/core/engine/commands/workflow/tests.ts` | `find_symbol testsCommand`; `grep -n -e runToLog -e EXIT_COULD_NOT_RUN tests.ts`; `grep -rn '\b81\b' .bkit/core/engine/commands` | `testsCommand.verbs.run` + `runToLog` — runs the gate with extra env, maps 126/127 to exit 4; `EXIT.AGENT_WAIT` (81, shared code in `lib.ts`) used as is | EXTEND | gate argv unchanged; env gains `LOCAL_STACK_LOCK_WAIT_S` (`--lock-wait-s`) + `LOCAL_STACK_LOCK_WHO` (this run); `classifyLockExit` maps 75 → 81 (give-up line naming `tests` and this run) and 73 → 4 (refusal line naming `tests`); `--lock-wait-s` flag; `lockHolder` output |
| `--lock-wait-s` whole-number parsing | `.bkit/core/engine/commands/lib.ts` | `grep -rn 'const wholeNumber' .bkit/core/engine`; `positiveInt` in `status.ts` (>= 1 only) | `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts` (module-local, `--budget-s`) | EXTEND | move `wholeNumber` to `lib.ts` as an export; `runs.ts` imports it |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — `Unit` tier, in-process `runCommand` (takes TASK 4's unit rows) | NEW | (b) the suffix is the tier contract (`.agents/rules.md` § Naming Conventions; `docs/testing.md` § Tiers: spawning `bkit` via `tsx` = Integration), and its caller `test:coverage:unit` counts `*.test.ts` toward the unit branch floor |
| Workflows route exit 81 from gate blocks | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md` | `grep -rn 'tests run' .bkit/core/workflows .bkit/core/prompts`; `grep -n 'exit 81' .bkit/core/workflows/*.md` | 3 `tests run` blocks; `**If** exit 81 **or** 80 → **CI wait turn-loop** …` route precedent (`bkit-debug.md:709`, Step 11 — Close Workflow sub-step 7) | EXTEND | add the route line to each block |
| Subagents re-run a gate command on exit 81 | `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` (TASK 7: the `Group gate` command `bkit-build.md` Step 9 hands it), plus `bkit-build-plan-tasks.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md` (TASK 10: `bkit tests changed`, Open Question 11 A) | `grep -rn -e 'tests run' -e 'tests changed' -e 'exit 81' .bkit/core/prompts`; `pnpm instructions:show --file bkit-build-plan-gaps-remediate.md` | the prompts' gate step (gaps-remediate Process step 9 "run that command … until it exits 0"); no prompt handles exit 81 today | EXTEND | one line in each prompt's existing gate step; shared wording goes through `.bkit/instructions.md` |
| Exit-81 routing guards | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | `ls .bkit/core/engine/audits/workflows`; `grep -ln 'tests run' …/audits/workflows/*.ts` | `testBlocks` / `callPosition` helpers find every `tests run` block; `PROBES` keyed by `step` (`build-run-tests`, `build-group-gate-`, debug `""`); `GATE_CALLERS` lists the prompts' `--fallback=bkit:gate:*` calls | EXTEND | a route-capture helper (the list after each block's closing fence) filtered per `PROBES` entry by its `--step=`; one `it` per probe: the route holds `exit 81`; a `Context:`-line check for the Step 9 `Group gate` (TASK 7); a `GATE_CALLERS`-driven check that each `--fallback=` prompt routes exit 81 (TASK 10) |
| `bkit tests changed` reads a wrapped gate's lock outcome (Open Question 11 A) | `.bkit/core/engine/commands/workflow/tests-changed.ts` | `grep -n -e runLogged -e COULD_NOT_RUN tests-changed.ts`; `find_symbol testsChangedVerb` | `testsChangedVerb` + module-local `runLogged` (stdin closed, output echoed through `ctx.log`); `classifyLockExit` (TASK 4) and `wholeNumber` in `lib.ts` (TASK 4) | EXTEND | gate env gains `LOCAL_STACK_LOCK_WAIT_S` + `LOCAL_STACK_LOCK_WHO`; `classifyLockExit` maps the exit; `--lock-wait-s`; `lockHolder` output |
| Run-wide tests lock for raw vitest runs + heavy / light decision | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` (none); `ls vitest*`; vitest `globalSetup` built-in (`plugin.d.*.d.ts`); Node `process.kill(pid, 0)` liveness probe | `vitest.setup.ts` — a `setupFiles` entry run in every worker once per test file; `vitest.timeout-budget.ts` — pure timeout maths | NEW | (a) no global setup exists; (b) for `vitest.setup.ts`: its contract runs per file in every worker, so a run-wide lock there would be taken N times by its callers (each worker) |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl -e vitest.timeout-budget -e vitest.test-lock .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — asserts only `vitest.timeout-budget.ts` | NEW | (b) extending breaks its contract — one test file per root helper, named after the module it tests (`vitest-timeout-budget.test.ts` ↔ `vitest.timeout-budget.ts`) — and its callers: `docs/testing.md` § Key test files row and `bkit tests red --file` per task address it as the timeout module's test |
| Global setup against a real lock | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | same search | `vitest-test-lock.test.ts` (this plan, `Unit` tier) | NEW | (b) spawns real bash / perl holders → Integration suffix (`.agents/rules.md` § Naming Conventions); the unit file's caller `test:coverage:unit` counts only `*.test.ts` |
| Global setup registration + `maxWorkers` | `vitest.config.ts` | `Read vitest.config.ts`; `vitest.unit.config.ts` merges it | `vitest.config.ts` `test` block | EXTEND | `globalSetup`, `...testWorkers()` |
| Machine lock docs | `.bkit/core/.bkit/templates.md` | `grep -n 'Local stack lock' .bkit/core/.bkit/templates.md` | § Local stack lock + catalog lines (§ What each template is for intro line 16 and table row 41; § Contract table row 74) | EXTEND | renamed § Machine lock, extended |

## Architecture & Component Changes

Areas: copy-and-own template script, bkit dogfood copy and its wrapped gate scripts, engine (`bkit tests run`, and `bkit tests changed` per Open Question 11 A), workflows, the subagent prompts' exit-81 lines, bkit's own vitest config, docs. The shipped pre-push hook and the prompts that run `pnpm bkit:gate:*` raw stay unchanged (Open Question 6). `bkit branches push` carries the wait to the hook and reads its give-up (Open Question 15, TASK 11); the Claude Code shared settings ship `BKIT_LOCK_WAIT_S` (Open Question 14).

**Ledger rows:** `724-tests-lock-fixed-slots-not-live-load`, `724-tests-run-lock-wait-exit-81`, `724-light-runs-skip-tests-lock`, `724-machine-lock-script-named-locks-no-migration`, `724-lock-order-tests-named-stack-enforced`, `724-engine-runs-packaged-lock-template`, `724-lock-run-exit-codes-73-75`, `724-vitest-global-setup-holds-tests-lock`, `724-shipped-gate-calls-run-through-tests-run`, `724-lock-script-short-wait-without-tty`, `724-host-hook-catches-raw-test-runners`, `724-upstream-consumer-load-gate`, `724-timeout-budget-and-ci-serialisation-unchanged`, `724-gate-templates-pass-test-workers`, `724-tests-changed-lock-wait-exit-81`, `724-lock-wait-writes-no-test-run-row`, `724-gate-changed-wrapped-in-tests-lock`, `724-lock-wait-is-host-budget-not-constant`, `724-branches-push-maps-hook-lock-give-up-to-81`, `724-test-workers-leave-one-core`

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
  - Taking `tests` exports `BKIT_TEST_WORKERS` = max(1, floor(cores / slots) - 1) (Open Question 10 B); cores from `getconf _NPROCESSORS_ONLN`, else `nproc`, else `sysctl -n hw.ncpu`, else 1.
  - Lock order enforced (Open Question 3): asking for `tests` while this shell or a live parent holds any other lock, or for a named lock while holding the stack lock → refused at once, message names the order; function returns 1.
  - Functions return 1 on every refusal (unchanged for `|| exit 1` / `if try_…` callers); `run` maps the refusal kind.
  - `run ["<who>"] [--lock <name>] -- <cmd> [args…]`: holds the lock for the command, exits with its status; 2 usage; 73 the lock could not be taken (lock dir not writable, no `/usr/bin/perl`, stack unnameable, lock order); 75 the wait gave up. `<who>` omitted (first argument `--lock` or `--`) → `LOCAL_STACK_LOCK_WHO`, else `npm_lifecycle_event` (the `package.json` script name), else `run`.
  - Wait (Open Question 7): `LOCAL_STACK_LOCK_WAIT_S` when set; else 60 s when stdin is not a TTY (`[ -t 0 ]` false), else 3600 s. Applies to every lock; the waiting note names the wait (`up to <N>s`). The engine always sets it (`BKIT_LOCK_WAIT_S`, else 60; Open Question 14). On release of a named lock the script writes the held seconds to the holder's checkout line in `<lock dir>/<name>.last` (`<checkout path><TAB><seconds>`, one line per checkout, replaced in place); the waiting note and the give-up line end in `last run took <N>m<N>s` for the current holder's checkout, or `no earlier run`.
  - Message prefix `[machine-lock]`; give-up line keeps `<who> gave up after <N>s waiting for <label>, in use by <holder>`; refusal lines (`❌`) name the lock asked for.
  - `CI=true` / `CI=1` → no-op for every lock (unchanged).
  - Header: purpose, wiring (`package.json` gate wrap), lock order, slots, wait, exit codes; "a consumer's adopted copy keeps working".

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

- **Existence Check:** file exists (`ADOPTED` map, entry `"scripts/ci/bkit-local-stack-lock.sh"` at line 346).
- `[DELETE]` entry `"scripts/ci/bkit-local-stack-lock.sh": { status: "not-adopted", … }`; `[NEW]` entry `"scripts/ci/bkit-machine-lock.sh": identical`.

#### [MODIFY] `package.json`

- **Existence Check:** `bkit:gate:static-unit` (line 59), `bkit:gate:static-unit-integration` (line 60), `bkit:gate:install-static-unit-build` (line 61), `bkit:gate:changed` (line 65, `node scripts/gate/bkit-gate-changed.mjs`).
- Each value becomes `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <current command>` (the command after `--` passed as one `sh -c` string where it chains with `&&`). `bkit:gate:changed` is wrapped too (Open Question 13 A), as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs` with no `sh -c`, so the file arguments `pnpm bkit:gate:changed {file}...` appends reach the script. Nested gates (`static-unit-integration` → `static-unit`, `install-static-unit-build` → `static-unit`) do not self-deadlock: the inner wrap sees the live `LOCAL_STACK_LOCK_OWNER_tests` and runs unlocked. `bkit:gate:min` / `static` / `format` unchanged (no test suite).

#### [MODIFY] `.bkit/core/engine/audits/repo/package-json.test.ts`

- **Existence Check:** `package.json manifest invariants (BAR-138)` suite.
- Gains the TASK 6 guard: the three full test gates and `bkit:gate:changed` (Open Question 13 A) start with `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- `.

### Engine — `bkit tests run`

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** `testsCommand` (line 1290), `runToLog` (line 102), `appendTestRun` (line 155) exist; the `run` verb is `use: "by-hand"` with `--file` / `--workflow` and a `row` output.
- `run` verb: new flag `lock-wait-s` (whole number >= 0, default `BKIT_LOCK_WAIT_S` else 60, a bad variable value → the same usage error naming the variable; `0` = one try); bad value → `CommandError(EXIT.USAGE)`.
- Gate argv unchanged (`scriptCommand(gate)`); the engine never executes the lock script. Gate env gains `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` and `LOCAL_STACK_LOCK_WHO` = `bkit tests run <gate>[ <fid>][ <step>]`, always set (under `CI` too: the script ignores them there). A wrapped gate's script adds `BKIT_TEST_WORKERS` + `LOCAL_STACK_LOCK_OWNER_tests`; an unwrapped gate takes no lock.
- Exported pure `classifyLockExit({ exitCode, log, who })` → `gate` | `lock-wait` | `could-not-run`: `lock-wait` only for exit 75 **and** a give-up line naming the `tests` lock **and** this run's `<who>`; `could-not-run` only for exit 73 **and** a `[machine-lock] ❌` refusal line naming the `tests` lock; else `gate`.
- `lock-wait` → no verdict, no artifact, and no `test-run` row under `--file` (Open Question 12 A, TASK 10); prints the `[machine-lock]` lines; emits `lockHolder`; returns `EXIT.AGENT_WAIT` (81). A 75 with no such line (the gate's own 75, or a nested lock's give-up) → the gate's own exit (FAIL).
- `could-not-run` → exit 4 (`EXIT_COULD_NOT_RUN`), the line (path + reason) logged.
- Output gains `lockHolder` (holder line when the wait gave up, else null). 81 stays out of `exitCodes` (verb codes must sit in `OWN_EXIT_MIN`-`OWN_EXIT_MAX`, 3-79, `conventions.test.ts:74-79`; 81 is the shared `EXIT.AGENT_WAIT` every `--help` already lists); summary names `81 tests lock held`. `red` / `green` unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** PASS-case exact `toEqual` at line 135 (`describe("bkit tests run")`, `it("PASS: runs the gate through the package runner, …")`; it already holds `row: null`).
- Expected output gains `lockHolder: null`; TASK 4's unit rows (`classifyLockExit`, `--lock-wait-s` validation).

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-changed.ts` (Open Question 11 A)

- **Existence Check:** `testsChangedVerb` (line 74), module-local `runLogged` (line 51, stdin closed, output echoed through `ctx.log`).
- New flag `lock-wait-s` (`wholeNumber` from `lib.ts`, default `BKIT_LOCK_WAIT_S` else 60); gate env gains `LOCAL_STACK_LOCK_WAIT_S` and `LOCAL_STACK_LOCK_WHO` = `bkit tests changed <gate>`; `classifyLockExit` (TASK 4) maps a give-up of this run to `EXIT.AGENT_WAIT` (81) + `lockHolder` and a `tests`-lock refusal to exit 4; else the current PASS / FAIL mapping. Summary names `81 tests lock held`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-changed.test.ts`

- **Existence Check:** `describe("tests changed")`; output asserted with `toMatchObject`, so a new `lockHolder` key breaks none.
- Gains the `--lock-wait-s` validation row (TASK 10).

#### [MODIFY] `.bkit/core/.bkit/cli.md`

- **Existence Check:** generated region; `tests` rows `changed` (line 368) and `run` (line 369); `.bkit/core/engine/tools/cli-doc.test.ts` `the generated region of .bkit/cli.md is current (run pnpm cli:sync)` fails on drift.
- Regenerated with `pnpm cli:sync` in each task that changes a `tests` verb's flags or summary (TASKS 4, 5, 10); `.bkit/cli.md` mirrored by `bkit install`.

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
- Temp consumer checkout with a copy of the template at `scripts/ci/bkit-machine-lock.sh` and stub `bkit:gate:*` scripts wrapped as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <node one-liner writing start / end timestamps and its env>` (one wrapped gate calling another for the nested case); `bkit:test:file` unwrapped; real lock holders via the template script; `bkit` spawned through `requireTsx()`; per-test `XDG_CACHE_HOME`; `CI`, `LOCAL_STACK_LOCK_OWNER*` and `LOCAL_STACK_LOCK_WHO` cleared; `tierTimeouts(true)` budgets, holder-file polling.

#### [MODIFY] `dist/`

- Rebuilt with `pnpm build` in each engine-editing commit (`.agents/rules.md` § Engine builds).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** Step 8 — Plan Verify sub-step 8 group-gate `Route:` (lines 651-653; the block at 648-650 runs `--gate=bkit:gate:static-unit` with `--file` / `--workflow`) and Step 12 — Run Tests sub-step 2 `Decide` (lines 866-869) exist. Step 9 — Plan Gaps Remediate sub-step 2 `Context:` (line 711) hands the subagent a `Group gate` `tests run` command; it is prose, not a fenced block, so the block route does not reach it (see the prompt below).
- Each fenced block's route gains `**If** exit 81 → end turn, re-run this block.` before `**Else**`.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** Step 3 — Run Tests sub-step 1 `Decide` (lines 319-322).
- Same route line.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`

- **Existence Check:** Process step 9 (line 102): "**If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0".
- TASK 7: a sub-bullet in step 9 — **If** the group gate exits 81 → another run holds the machine-wide tests lock; run the same command again, and treat the wait as no gap and no reason to edit code. TASK 10 (Open Question 11 A): the same handling for its `bkit tests changed` line.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md`, `.bkit/core/prompts/bkit-build-plan-verify.md` (Open Question 11 A)

- **Existence Check:** `bkit tests changed --fallback=bkit:gate:static` (`bkit-build-plan-tasks.md:118`), `--fallback=bkit:gate:static-unit` (`bkit-debug-failure-remediate.md:76`, `bkit-build-plan-verify.md:83`).
- TASK 10: each gate step gains the exit-81 line (run the command again; a wait is not a failure).

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`

- **Existence Check:** both exist; `trackers.test.ts:376-380` compares the none render byte for byte.
- Regenerated after the diff is reviewed (`vitest -u`, per the test's comment).

#### [MODIFY] `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

- **Existence Check:** `GATE_CALLERS` (line 107), `PROBES` (lines 166-183: three probes keyed by `step` — `build-run-tests`, `build-group-gate-`, debug `""`), `testBlocks` (lines 185-188), `callPosition` (line 197), the test `every \`tests run\` call site of a workflow is probed` (line 202).
- Route-capture helper (the `Route:` / `Decide` list after each block's closing fence; `testBlocks` returns only the fenced body), applied per `PROBES` entry through the same `--step=` filter the probe's `describe` uses; TASK 7 rows: the block route, and the Step 9 `Context:` `Group gate` command matched by the exit-81 line in `bkit-build-plan-gaps-remediate.md`. TASK 10 row: each `GATE_CALLERS` entry whose call is `--fallback=bkit:gate:*` (a `bkit tests changed` caller) carries the exit-81 line. `GATE_CALLERS` keeps its entries: the pre-push hook's `pnpm bkit:gate:*` calls, `bkit-ship-conflict-resolve.md`'s `pnpm bkit:gate:install-static-unit-build`, and the four prompts' `--fallback=bkit:gate:*` calls.

### Vitest (bkit repo only)

#### [NEW] `vitest.test-lock.ts`

- **Reuse Check:** `Reuse Inventory` row "Run-wide tests lock for raw vitest runs" — reasons (a) / (b).
- Pure `testLockDecision({ filters, env, exists, alive, watch })` → `{ take, reason }`: no lock under `CI` (`true` / `1`), a `LOCAL_STACK_LOCK_OWNER_tests` pid that `alive(pid)` confirms (default probe `process.kill(pid, 0)`), watch mode, or when every filter (`:line` suffix stripped) is an existing file; else take.
- Pure `testWorkers(env)` → `{ maxWorkers: n }` when `BKIT_TEST_WORKERS` is a whole number >= 1, else `{}`.
- Default-export global `setup(project)`: reads `project.vitest.config.filters` / `.watch`; on take, spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c 'printf "locked %s\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat <&3 >/dev/null'` with stdio `[inherit, pipe, pipe, pipe]`: vitest's own stdin (the script's `[ -t 0 ]` sees the real terminal or its absence, Open Question 7; the setup sets no `LOCAL_STACK_LOCK_WAIT_S`), stdout for the `locked` line, stderr captured and echoed (waiting notes reach the human), fd 3 the keep-alive pipe. Resolves on `locked`, sets `process.env.LOCAL_STACK_LOCK_OWNER_tests`; child exit before `locked` → throws naming its exit and the holder line from its stderr. Returned teardown closes fd 3 and awaits the child. vitest dying closes the pipe → holder exits → lock frees within a second.

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

- `.bkit/core/.bkit/templates.md` § Local stack lock → § Machine lock (catalog lines 16 / 41 / 74 in TASK 1; section incl. the consumer wiring step in TASKS 3 / 5); `.bkit/core/.agents/rules.md` § Shared local stack, `bkit-build-plan-tasks.md`, `bkit-build-plan-tests.md`, `bkit-build-plan-gaps-remediate.md` name § Machine lock; `.bkit/core/.bkit/cli.md` regenerated by `pnpm cli:sync` (TASKS 4, 5, 10); `.bkit/core/.bkit/workflows.md` `test-run` row docs say a lock wait writes no row (TASK 10, Open Question 12 A); `.bkit/instructions.md` re-synced (`pnpm instructions:sync`); `.bkit/core/.bkit/workflows.md` tests-lock bullet; § Tests lock in `.bkit/shared/docs/testing.md` (consumer-facing, inside the shipped block) and the same text in the root `docs/testing.md` `bkit:start` / `bkit:end` block; bkit-only `docs/testing.md` lines (§ Stack, § Key test files) below `bkit:end`; `docs/architecture.md` tree line for `vitest.*.ts` (TASK 9; the `scripts/ci/` and `scripts/gate/` lines exist); `CHANGELOG.md` `[Unreleased]` incl. the upgrade note to wire the script; mirrors via `bkit install`.

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
| `.bkit/core/.bkit/templates.md` | catalog lines (§ What each template is for line 16 and row 41, § Contract row 74) name the machine lock and `bkit-machine-lock.sh` (TASK 1); § Local stack lock → § Machine lock: stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` (gates pass it to their runner, e.g. vitest `--maxWorkers`), lock order, `run` exits 73 / 75, optional `<who>`, 60 s no-TTY wait, consumer wiring (copy to `scripts/ci/`, wrap test-running `bkit:gate:*` scripts; a chained command goes in one `sh -c` string), adopted copies keep working (TASK 3); light vs heavy runs, `bkit tests run` passes `--lock-wait-s` + its run name and maps 75 → 81, 73 → 4 (TASK 5) |
| `.bkit/core/.agents/rules.md` | § Shared local stack names `.bkit/templates.md` § Machine lock (TASK 3) |
| `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-build-plan-tests.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | Shared local stack line names § Machine lock (TASK 3) |
| `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | Process step 9: the group gate's exit 81 → run the same command again, no gap (TASK 7) |
| `.bkit/core/prompts/bkit-build-plan-tasks.md`, `bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md` | `bkit tests changed` exit 81 → run it again, not a failure (TASK 10, Open Question 11 A) |
| `.bkit/core/.bkit/cli.md` (+ `.bkit/cli.md` mirror) | regenerated by `pnpm cli:sync`: `tests run` and `tests changed` gain `--lock-wait-s` and the `81` summary (TASKS 4, 5, 10) |
| `.bkit/core/.bkit/workflows.md` § `status.jsonl` — workflow state SoT | `test-run` row: a run that exits 81 on the tests lock writes no row (TASK 10, Open Question 12 A) |
| `.bkit/instructions.md` | `shared-local-stack` refs + text re-synced with `pnpm instructions:sync` (TASKS 3, 7) |
| `.bkit/core/.bkit/workflows.md` | rationale bullet beside **CI-Dispatch poll**: `bkit tests run` exits 81 while the tests lock is held; every `tests run` block routes 81 → end turn, re-run, no ceiling (Open Question 9) (TASK 7) |
| `.bkit/shared/docs/testing.md` + root `docs/testing.md` `bkit:start` / `bkit:end` block | new § Tests lock (wrapped `bkit:gate:*` scripts take it for the whole gate; light runs, nested wraps and `CI` skip it; `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `BKIT_LOCK_WAIT_S` per host, `--lock-wait-s`, exit 81; raw callers see exit 75; no-TTY 60 s wait; an unwired repo takes no lock) (TASK 5) |
| `docs/testing.md` below `bkit:end` | § Stack line: bkit's test gates are wrapped, `bkit:gate:changed` included (Open Question 13 A) (its **Changed files** bullet) (TASK 6); § Stack line for `vitest.test-lock.ts` + raw-run rule (TASK 9); § Key test files rows for the new test files and fixture (TASKS 1, 5, 9) |
| `docs/architecture.md` | § Package Boundaries tree line `vitest.*.ts` (root test-runner config + helpers) (TASK 9); the `scripts/ci/` and `scripts/gate/` lines exist (TASK 1 checks them) |
| `CHANGELOG.md` | `[Unreleased]`: template rename + named locks, no-TTY wait, upgrade note: copy `bkit-machine-lock.sh` to `scripts/ci/` and wrap the test-running `bkit:gate:*` scripts to get the tests lock (TASK 3); `bkit tests run` passes the wait + run name, exit 81 (TASK 5); `bkit tests changed` does the same (TASK 10, Open Question 11 A) |
| Mirrors (`.bkit/templates.md`, `.bkit/cli.md`, `.bkit/workflows.md`, `.agents/rules.md`, `.claude/` / `.cursor/` / `.opencode/` / `.codex/` / `.agents/plugins/` agents and workflows) | regenerated by `bkit install` (TASKS 3, 4, 5, 7, 10) |
| `docs/capabilities.md` | regenerated by `pnpm graph:rollup` when the pre-push graph check asks (new modules) |
| `docs/decisions.jsonl` | 13 `724-*` rows written for this plan (Ledger rows line) |
| `docs/deferrals.jsonl` | 4 `724-*` `Exempt` rows (Out of Scope) |
| `docs/observability.md` | none — no new `[bkit-*]` prefix; engine lines stay under `[bkit-tests]` |
| `docs/data-schema.md`, `docs/design.md`, `docs/technology.md` | none — no schema, UI or new dependency |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | n/a | No database |
| **Code** | `git revert {COMMIT}` per task commit, newest first | Reverting TASK 6 restores bkit's unlocked gates, TASK 5 the engine's plain exit mapping, TASK 10 `bkit tests changed`'s plain exit mapping and the prompts' gate steps; consumers' adopted copies and wrapped gate scripts are theirs and unaffected |
| **Risk window** | Between a release with TASK 3 and one with TASK 5 | A consumer who wires the script then gets the lock, but `bkit tests run` reads a give-up as the gate's FAIL (exit 1), not 81; TASK 3's docs and upgrade note ship with the script, TASK 5's exit mapping in the next commit of the same PR |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: script (Groups 1-2) → engine (Group 3; TASK 10 runs after TASK 5 and is numbered above the plan's highest so no task renumbers) → bkit's wrapped gates + workflows (Group 4) → bkit's own vitest (Group 5). Suggested integration shape (advice only): one PR; one commit per task. Every engine-editing commit carries `pnpm build` output (`dist/`).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Machine lock script — named locks

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits
  - **CREATE:** `tests/fixtures/machine-lock/stack-lock-6.0.0.sh`: byte-for-byte `git show HEAD:.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`, written before the delete below; the older copy every compat test runs
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script (bash 3.2-compatible) plus optional `[name]` on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; named lock at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock`, no repo prefix; `LOCAL_STACK_LOCK_PID_<key>` / `LOCAL_STACK_LOCK_OWNER_<key>` so children skip that named lock only (a named-lock holder never sets the unsuffixed `LOCAL_STACK_LOCK_OWNER`, so its children still wait on the stack lock); named-lock holder line names the caller's checkout; unnamed lock path, names and holder line unchanged; `run ["<who>"] [--lock <name>] -- <cmd>` exits with the command's status, 2 usage, 73 lock not takeable (unwritable lock dir, no `/usr/bin/perl`), 75 wait gave up; `<who>` omitted (first argument `--lock` or `--`) → `LOCAL_STACK_LOCK_WHO`, else `npm_lifecycle_event`, else `run`; refusal lines name the lock asked for; functions still return 1 on every refusal; prefix `[machine-lock]`; header documents API, `package.json` gate wiring and exits
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test of `local-stack-lock.integration.test.ts` pointed at the new script, `envFor` also clearing `LOCAL_STACK_LOCK_OWNER_*` / `BKIT_TEST_SLOTS`, older-copy cases run the fixture above, missing-perl case runs a temp copy with every `/usr/bin/perl` replaced (`replaceAll`) by a missing path, `tierTimeouts(true)` budgets and holder-file polling, plus the tests below
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`, line 346) → `scripts/ci/bkit-machine-lock.sh`: `identical`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: the catalog lines name the machine lock and `bkit-machine-lock.sh`, so no row names a deleted file — § What each template is for intro line 16 ("The local stack lock has no tip…") and table row 41 (`Local stack lock`), § Contract table row 74 (`.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`)
  - **READ:** `docs/architecture.md`: § Package Boundaries tree line `scripts/ci/` ("Adopted copy of `.bkit/templates/scripts/ci/`…") already covers the dogfood copy; no edit
  - **UPDATE:** `docs/testing.md`: § Key test files rows (below `bkit:end`) for `machine-lock.integration.test.ts` and the `tests/fixtures/machine-lock/` fixture
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates.test.ts` passes, including every carried-over stack-lock test unchanged in intent; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `cmp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/bkit-machine-lock.sh` exits 0; `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is gone; `git show "$(git merge-base HEAD main)":.bkit/templates/scripts/ci/bkit-local-stack-lock.sh | cmp - tests/fixtures/machine-lock/stack-lock-6.0.0.sh` exits 0; the `.bkit/core/.bkit/templates.md` § Contract table row names `.bkit/templates/scripts/ci/bkit-machine-lock.sh`; `grep -c '── scripts/ci/ .*Adopted copy' docs/architecture.md` prints 1
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
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name` fails on `run --lock tests -- <cmd>` exiting 2 as a usage error, or a holder line naming `--lock`

<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Slots, lock order, no-TTY wait and template docs

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Slots, `BKIT_TEST_WORKERS`, the enforced lock order on the `tests` lock and the no-TTY default wait
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: `BKIT_TEST_SLOTS` (whole number >= 1, else 1 + one stderr note) gives the `tests` lock slot files `tests.lock`, `tests.<k>.lock`; one perl holder entry point tries each slot per second; waiting note and `local_stack_lock_holder tests` name every holder; taking `tests` exports `BKIT_TEST_WORKERS` = max(1, floor(cores / slots) - 1) (Open Question 10 B) (cores: `getconf _NPROCESSORS_ONLN`, `nproc`, `sysctl -n hw.ncpu`, else 1); asking for `tests` while this shell or a live parent holds another lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` → 73); wait = `LOCAL_STACK_LOCK_WAIT_S` when set, else 60 s when stdin is not a TTY, else 3600 s, for every lock, and the waiting note names it (`up to <N>s`) (Open Question 7); header documents lock order, slots and wait
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: on release of a named lock, write the held seconds to the holder's checkout line in `<lock dir>/<name>.last` (one `<checkout path><TAB><seconds>` line per checkout, replaced in place; bash 3.2: `grep -v` into a temp file, append, `mv`); the waiting note and the give-up line end in `last run took <N>m<N>s` for the current holder's checkout, or `no earlier run` when it has no line (Open Question 14)
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: same bytes as the template
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the tests below; the stalled-holder helper patches the perl body with `replaceAll`, so slot logic cannot leave a second perl body unpatched
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `/bin/bash -n` on the template exits 0; `cmp` template vs dogfood copy exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on no stderr note about the fallback
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one` fails on the variable being unset, or on 10 cores and 1 slot giving 10
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a killed tests-lock holder frees its slot within a second and the waiter starts` fails on the waiter still waiting after the holder is killed
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding the stack lock is refused, naming the lock order` fails on the tests lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding another named lock is refused, naming the lock order` fails on the tests lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking a named lock while holding the stack lock is refused, naming the lock order` fails on the named lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a child of a stack-lock holder asking for the tests lock is refused, naming the lock order` fails on the child taking the tests lock
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set` fails on a waiter with stdin from `/dev/null` and no `LOCAL_STACK_LOCK_WAIT_S` noting `up to 3600s`, or on `LOCAL_STACK_LOCK_WAIT_S=2` not giving up after 2 s
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock records its held time by checkout on release and the next waiting note names the holder's last run` fails on no `tests.last` line for the holder's checkout after a release, on a waiting note with neither `last run took` nor `no earlier run`, or on another checkout's figure printed for this holder

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Point every template doc, rule and prompt at § Machine lock, with the consumer wiring step
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock → § Machine lock (stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` passed to the runner, lock order, `run` exits 73 / 75, optional `<who>`, 60 s no-TTY wait, a consumer's adopted copy keeps working); consumer wiring like the stack lock's: `cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/`, then a `Wire into` row wrapping each test-running `bkit:gate:*` script as `"bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>"` (a chained command in one `sh -c '…'` string); an unwired repo takes no lock
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: Shared local stack line (line 74) names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tests.md`: Shared local stack line (line 58) names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line (line 68) names § Machine lock
  - **UPDATE:** `.bkit/instructions.md`: `shared-local-stack` refs and text re-synced (`pnpm instructions:show --file` before editing, `pnpm instructions:sync` after)
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — template renamed `bkit-machine-lock.sh`, named machine-wide locks, slots, lock order, `run` exits 73 / 75, 60 s no-TTY wait; adopted copies keep working; upgrade note: copy `bkit-machine-lock.sh` to `scripts/ci/` and wrap the test-running `bkit:gate:*` scripts to get the machine-wide tests lock
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -rln -e bkit-local-stack-lock -e 'Local stack lock' .bkit/core .bkit/templates.md .bkit/instructions.md .agents/rules.md docs/testing.md` finds nothing; `grep -c 'bkit-machine-lock.sh run --lock tests --' .bkit/core/.bkit/templates.md` prints >= 1; `bkit install` regenerates the mirrors and `bkit check` reports no drift; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/tools/instructions.test.ts` passes
  - **TEST FIRST:** n/a — docs, rules and prompt text only; existing template / instructions tests cover the shapes

<!-- bkit:task 3 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate

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
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: bkit's gates take the tests lock; workflows route exit 81

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** bkit's root `package.json` wraps its test-running gates in the tests lock (`bkit:gate:changed` included, per the owner's answer A to Open Question 13)
  - **UPDATE:** `package.json`: `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` (lines 59-61) each become `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c '<current command>'`; `bkit:gate:changed` (line 65) becomes `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs`, with no `sh -c`, so the file arguments `bkit tests changed` appends reach the script; nested gates (`static-unit-integration` → `static-unit`, `install-static-unit-build` → `static-unit`) and the vitest runs inside `bkit-gate-changed.mjs` never self-deadlock: the inner wrap or global setup sees the live `LOCAL_STACK_LOCK_OWNER_tests` and runs unlocked; `bkit:gate:min` / `static` / `format` unchanged (no test suite)
  - **UPDATE:** `.bkit/core/engine/audits/repo/package-json.test.ts`: the guard test below, listing the four wrapped gates
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the nested-gate test below — a stub outer gate calling a stub inner gate, both wrapped with the prefix read from bkit's own `bkit:gate:static-unit-integration` / `bkit:gate:static-unit` values, run through `bkit tests run`
  - **UPDATE:** `docs/testing.md`: § Stack (below `bkit:end`) — bkit's test-running gates, `bkit:gate:changed` included (its **Changed files** bullet), hold the `tests` lock through `scripts/ci/bkit-machine-lock.sh`; a nested gate runs unlocked under its parent
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/package-json.test.ts .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; with a `sleep 30` holder of the `tests` lock, `LOCAL_STACK_LOCK_WAIT_S=2 pnpm bkit:gate:static-unit` exits 75 naming the holder; with no holder, `pnpm bkit:gate:static-unit-integration` passes and its output has no `[machine-lock] ⏳` line; with no holder, `pnpm bkit:gate:changed package.json` exits 0, its output shows the script received `package.json`, and it has no `[machine-lock] ⏳` line
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself` fails on bkit's gate values carrying no wrap (a contrast `tests run --lock-wait-s=0` during the outer gate does not exit 81), or on the inner wrap waiting on its own parent until `--lock-wait-s` and the run exiting 81
    - `.bkit/core/engine/audits/repo/package-json.test.ts` `bkit's root package.json wraps every test-running bkit:gate script in the tests lock` fails on `bkit:gate:static-unit`, `bkit:gate:static-unit-integration`, `bkit:gate:install-static-unit-build` or `bkit:gate:changed` running unwrapped, or on `bkit:gate:changed` wrapped in `sh -c` (which drops the file arguments)

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 — Plan Verify sub-step 8 (group gate) `Route:` (lines 651-653) and Step 12 — Run Tests sub-step 2 `Decide` (lines 866-869) gain `**If** exit 81 → end turn, re-run this block.` before `**Else**` (read `.bkit/authoring.md` § Prompts and Workflows + § Workflows Only first; `pnpm instructions:show --file bkit-build.md` before editing sentences)
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3 — Run Tests sub-step 1 `Decide` (lines 319-322) gains the same route (`pnpm instructions:show --file bkit-debug.md` first)
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Process step 9, which runs the `Group gate` command that `bkit-build.md` Step 9 — Plan Gaps Remediate sub-step 2 puts in the subagent's `Context:` (line 711), gains a sub-bullet: **If** the group gate exits 81 → another run holds the machine-wide tests lock; run the same command again, and count the wait as no gap and no reason to edit code (`pnpm instructions:show --file bkit-build-plan-gaps-remediate.md` first). This site sits in a `Context:` line, not a fenced block, so the block guard cannot see it; the second test below covers it
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: rationale bullet beside **CI-Dispatch poll** — `bkit tests run` exits 81 while the machine-wide tests lock is held past `--lock-wait-s`; every `tests run` block routes 81 → end turn, re-run, and a subagent handed a `tests run` command re-runs it; no re-run ceiling (Open Question 9); a holder held past three times the last run duration the holder line names is stale, so the agent reports it (pid, since, last run took) instead of re-running
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: a helper capturing the `Route:` / `Decide` list after each `tests run` block's closing fence (`testBlocks`, lines 185-188, returns only the fenced body), applied per `PROBES` entry (lines 166-183, keyed by `step`) through the same `--step=` filter its `describe` uses; a check that each `tests run` command in a workflow `Context:` line (today `Group gate` in `bkit-build.md` Step 9) has an exit-81 line in the prompt that `Context:` line's sub-step invokes; the tests below. `GATE_CALLERS` (line 107) keeps its entries, which list the four prompts' `--fallback=bkit:gate:*` calls, the hook's and `bkit-ship-conflict-resolve.md`'s `pnpm bkit:gate:*` calls
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated after reviewing the diff (`vitest -u`, per `trackers.test.ts`)
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated after reviewing the diff
  - **UPDATE:** `.bkit/instructions.md`: re-synced (`pnpm instructions:sync`) if the route line is a tracked clause
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/tools/instructions.test.ts` passes; `bkit install` regenerates the mirrors and `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every tests run call site routes exit 81 to a re-run of its block` fails on a block whose `Else` sends exit 81 to the Failure Path
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt` fails on `bkit-build-plan-gaps-remediate.md` running the `Group gate` command until exit 0 with no exit-81 line, or on the check finding no `Context:` line that hands over a `tests run` command

<!-- bkit:task 7 end -->
<!-- bkit:task 11 start -->

- [ ] **TASK 11:** `bkit branches push` carries the lock wait to the pre-push hook and maps its give-up to exit 81 (owner answer A to Open Question 15)
  - **UPDATE:** the `push` verb in `.bkit/core/engine/commands/workflow/branches.ts`: the `git push` call's env gains `LOCAL_STACK_LOCK_WAIT_S` = `BKIT_LOCK_WAIT_S` else `60` (`wholeNumber` from `../lib.js`; a bad variable value → `CommandError(EXIT.USAGE)` naming the variable) and `LOCAL_STACK_LOCK_WHO` = `bkit branches push <branch>`; the push's combined output goes through `classifyLockExit` (TASK 4) with `who` = that run name: `lock-wait` → exit `EXIT.AGENT_WAIT` (81), output field `lockHolder` (the holder line), nothing reported as pushed; `could-not-run` → exit 4; else today's mapping. Verb summary names `81 tests lock held`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`: every fenced block that runs `"{BKIT}" branches push` gains `**If** exit 81 → end turn, re-run this block.` in its `Route:` / `Decide` list before `**Else**` (the TASK 7 clause; a block that chains the push with `|| exit 1` routes the block's exit 81 the same way; `pnpm instructions:show --file <workflow>` before editing sentences)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: `PROBES` gain every `branches push` block; the guard below reuses TASK 7's route-capture helper
  - **CREATE:** `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`: a temp repo with a bare remote and a pre-push hook that runs a wrapped stub gate through a copy of `scripts/ci/bkit-machine-lock.sh`; the tests below
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `branches` `push` row regenerated with `pnpm cli:sync`; `.bkit/cli.md` mirrored by `bkit install`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the **CI-Dispatch poll** rationale bullet (TASK 7) names `bkit branches push` beside `bkit tests run`
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Long-running shell commands already names `bkit branches push` in its rule line; confirm it after the verb lands
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock names `bkit branches push` and its exit 81
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `bkit-debug.none.txt`, `bkit-ship.none.txt`: regenerated after reviewing the diff
  - **UPDATE:** `.bkit/instructions.md`: re-synced (`pnpm instructions:sync`) if the route line is a tracked clause
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — `bkit branches push` passes the lock wait and its run name to the pre-push hook and exits 81 when the hook's gate gave up on the tests lock
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/tools/cli-doc.test.ts` passes; `node dist/cli.js branches push --help` lists the output key `lockHolder` and exit 81; `bkit install` regenerates the mirrors and `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` `branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock` fails on git's failure exit with the give-up line only in the git output and `lockHolder` missing
    - `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` `branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push` fails on the hook's gate seeing neither variable (the stub gate prints both)
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every branches push call site routes exit 81 to a re-run of its block` fails on a push block whose `Else` sends exit 81 to the Failure Path

<!-- bkit:task 11 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: bkit's own raw vitest runs queue too

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Heavy / light and worker decisions for bkit's raw vitest runs
  - **CREATE:** `vitest.test-lock.ts`: pure `testLockDecision({ filters, env, exists, alive, watch })` (no lock under `CI` = `true` / `1`, a `LOCAL_STACK_LOCK_OWNER_tests` pid `alive(pid)` confirms, watch mode, or when every filter minus a `:line` suffix is an existing file); pure `testWorkers(env)` (`{ maxWorkers }` from a valid `BKIT_TEST_WORKERS`, else `{}`); no wait logic (the script owns the no-TTY wait, Open Question 7)
  - **READ:** `unitTimeouts` in `vitest.timeout-budget.ts`: sibling root-helper pattern (pure functions + one config spread)
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the unit tests below, beside `vitest-timeout-budget.test.ts`, with injected `env` / `exists` / `alive`
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

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **UPDATE:** `vitest.test-lock.ts`: default-export global `setup(project)` that reads `project.vitest.config.filters` / `.watch`, and for a heavy run spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c '…; exec cat <&3 >/dev/null'` with vitest's own stdin (so the script's no-TTY wait applies; the setup sets no `LOCAL_STACK_LOCK_WAIT_S`, Open Question 7), stdout for the ready line, stderr captured and echoed, fd 3 the keep-alive pipe; resolves on its ready line, exports `LOCAL_STACK_LOCK_OWNER_tests`, throws naming the exit and the holder line if the child ends first, and returns a teardown that closes fd 3 and awaits the child
  - **UPDATE:** `vitest.config.ts`: `globalSetup: ["./vitest.test-lock.ts"]`; `...testWorkers()` in `test`
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`: the integration tests below, with `LOCAL_STACK_LOCK_OWNER_tests` stubbed empty, `tierTimeouts(true)` budgets, holder-file polling
  - **UPDATE:** `docs/testing.md`: § Stack (below `bkit:end`) names `vitest.test-lock.ts` (heavy raw runs queue, light / watch / CI / nested never wait, no-TTY runs wait the script's 60 s); § Key test files rows for `vitest-test-lock.test.ts` and `vitest-test-lock.integration.test.ts`
  - **UPDATE:** `docs/architecture.md`: Package Boundaries tree gains `vitest.*.ts` (root test-runner config + helpers)
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line naming the first; `pnpm bkit:test:file <one file>` does not wait; `pnpm vitest run` (full suite) passes with the global setup in place
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup waits for a held tests lock and takes it once the holder ends` fails on setup resolving while the lock is held
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup throws naming the holder when the wait gives up` fails on setup hanging, or throwing with no holder line
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup's teardown frees the tests lock` fails on the lock staying held after teardown

<!-- bkit:task 9 end -->
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
- [ ] **Test Synchronization:** `.bkit/core/engine/commands/workflow/tests.test.ts` (in-process `tests run` with unwrapped stub gates; PASS output with `lockHolder: null`), `.bkit/core/engine/commands/workflow/runs.test.ts` and `lib.test.ts` (`wholeNumber` move), `.bkit/core/engine/commands/conventions.test.ts` (no 81 in `exitCodes`), `.bkit/core/engine/render/trackers.test.ts` (none-render snapshots), `package-json.test.ts`, `husky-pre-push.integration.test.ts`, `tests-changed.test.ts`, `cli-doc.test.ts` (`pnpm cli:sync` output current) and `local-gate-audit.test.ts` `GATE_CALLERS` green (hook unchanged; the `--fallback=` prompts keep their calls and gain the exit-81 line); no E2E suite in bkit.
- [ ] **Dogfood (`.agents/rules.md` § Verify before complete):** `pnpm build && pnpm pack`; install the tarball into a fresh scratch consumer; copy `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to `scripts/ci/` and set `bkit:gate:static-unit` to `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sleep 30`; two concurrent `node_modules/.bin/bkit tests run --gate=bkit:gate:static-unit --log=a.log` / `--log=b.log --lock-wait-s=5` → the second exits 81 printing the first's holder line; inspect the on-disk footprint (`~/.cache/bkit/machine-lock/` only; nothing under the scratch consumer from the engine).
- [ ] **Build Configuration:** `tsconfig.json` still excludes `**/*.test.ts`; `vitest.test-lock.ts` stays outside `dist/` (root helper, not an engine entry).
- [ ] **Integration (`machine-lock.integration.test.ts`):** its Derived Test Matrix rows + every carried-over stack-lock test; real bash / perl / flock, per-test `XDG_CACHE_HOME`.
- [ ] **Integration (`tests-lock.integration.test.ts`):** its matrix rows (TASKS 5, 6, 10); real holders and a real wrapped gate, `bkit` via `requireTsx()`.
- [ ] **Integration (`branches-lock.integration.test.ts`):** its matrix rows (TASK 11); a real pre-push hook and a wrapped stub gate.
- [ ] **Unit (`tests.test.ts`, `tests-changed.test.ts`):** lock-exit classification and `--lock-wait-s` rows.
- [ ] **Unit (`package-json.test.ts`):** bkit's test gates wrapped, `bkit:gate:changed` included.
- [ ] **Unit (`local-gate-audit.test.ts`):** exit-81 routing guards (workflow blocks, the Step 9 `Context:` `Group gate`, the `bkit tests changed` caller prompts, the `branches push` blocks).
- [ ] **Unit + Integration (`vitest-test-lock*.test.ts`):** their matrix rows.
- [ ] **Run all tests:** `pnpm vitest run` (full, never scoped) and `pnpm bkit:test:bats` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Dogfood (`.agents/rules.md` § Verify before complete): `pnpm build && pnpm pack`; install the tarball into a fresh scratch consumer; copy `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to `scripts/ci/` and wrap a slow `bkit:gate:static-unit` as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sleep 30`; run `node_modules/.bin/bkit tests run --gate=bkit:gate:static-unit --log=a.log` in two terminals → the second waits, names the first, and with `--lock-wait-s=5` exits 81 printing the holder.
- [ ] **Step 2:** Cross-repo: start a gate in the scratch consumer and `pnpm test` in a bkit worktree → whichever starts second prints the other's holder line.
- [ ] **Step 3:** `bkit upgrade` an older scratch consumer that copied `bkit-local-stack-lock.sh` to `scripts/ci/` → report shows `removed: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh`; the adopted copy and the new script exclude each other on the unnamed stack lock.
- [ ] **Step 4:** `/bin/bash` 3.2 (stock macOS): `/bin/bash scripts/ci/bkit-machine-lock.sh run t --lock tests -- echo ok` prints `ok`.
- [ ] **Step 5:** `BKIT_TEST_SLOTS=2` with three gates → two run with `BKIT_TEST_WORKERS` = 5 on the 10-core machine, the third names both holders.
- [ ] **Step 6:** Provider parity (Open Question 8): run one `bkit tests run` gate from each host — Claude Code (sandbox on), OpenCode, Codex (`workspace-write`), Cursor, Antigravity — → each either takes the lock or exits 4 naming `~/.cache/bkit/machine-lock/` and the host setting that grants it; record the result per host.
- [ ] **Step 7:** In the scratch consumer, `pnpm bkit:gate:static-unit < /dev/null` while another gate holds the lock → gives up after 60 s, exit 75 with the holder line; the same from a terminal notes `up to 3600s`; `LOCAL_STACK_LOCK_WAIT_S=5` from either gives up after 5 s.
- [ ] **Step 8:** Push from a workflow (`bkit branches push`) in bkit's repo while another gate holds the lock → `branches push` exits 81 with the holder line and `lockHolder` (the hook's gate waited `BKIT_LOCK_WAIT_S`, 1200 s on Claude Code); the re-run after the holder ends goes through.
- [ ] **Step 9:** In a Claude Code session, run a gate block while another gate holds the lock → the call moves to the background at its foreground timeout, the waiting note names the holder and `last run took`, and the block's result arrives when the holder frees, with no exit 81. The same on Codex, Cursor, opencode and Antigravity → exit 81 after 60 s and a re-run.
