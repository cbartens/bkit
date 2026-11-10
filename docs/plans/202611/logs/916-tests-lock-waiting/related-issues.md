## #914 — Build: planned-test lock fires late on cross-group changes, BLOCKED escape never read (open)

## What happens

`bkit steps finish` refuses a build commit with exit 11 when a planned test differs from the lines its group's tests step recorded at its red (`touchedTests`, `.bkit/core/engine/commands/workflow/tests.ts:309`, called at `.bkit/core/engine/commands/workflow/steps.ts:1262`). Two problems surfaced in #891's build:

### 1. A change to another group's planned test is caught only at the holistic fix

The check covers only the step's own group for `build-plan-tasks` and `build-plan-gaps-remediate`, and every group only for `build-plan-gaps-remediate-holistic`. A code step that legitimately has to reshape an earlier group's planned test is waved through. The refusal then lands on a later, unrelated holistic fix round that never touched the file.

In #891, group 7 Task 20 made `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. The group 3 (Task 8) planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` composed exactly that file, so its setup had to change; its assertions stayed the same. Group 7's finish passed. The holistic fix of attempt 4 (help-text wording only) then failed exit 11 twice.

### 2. A planned test the owner superseded stays locked

Task 16 was rewritten after an owner decision, replacing its `TEST FIRST` test. The old name, `bkit tests base > a gate red on a non-test stage as well never reads all`, is still in group 6's first `build-tests-red` row (state `missing`). The plan no longer names it and the file never held it, yet `touchedTests` keeps reporting it as changed.

### 3. The refusal offers a BLOCKED escape the engine never reads

The problem text says "...or log the task BLOCKED naming the test and what it gets wrong", and the `steps finish` help says the same. `touchedTests` reads only the red rows and the test files. No BLOCKED line in the agent's log changes the result, so the re-ask the workflow prescribes can't succeed when restoring the test would be wrong, and the run goes to the Failure Path.

## Expected

- A code step that changes another group's planned test is flagged in that step, not in a later holistic round.
- A red row whose test the plan no longer names is not checked.
- Either the BLOCKED escape works (the check reads it), or the message and help stop offering it.

## Found in

#891 build, holistic attempt 4, 2026-11-10.

**Label added: `next:design`**

The issue had no `next:*` label. The cause of all three problems is known, but point 3 under "Expected" is an open choice: make the `BLOCKED` escape work, or stop offering it. Point 1 says what should happen but not how. That is design's job (`.bkit/workflows.md:58`). If the owner settles point 3 in a comment, the issue can skip design and go to `/bkit-plan 914`.

## #822 — Route raw test-runner commands through the tests lock per host (open)

### Problem

#724 — Machine-wide test lock: one test run at a time across agents makes bkit's own test scripts take a machine-wide lock. An agent that runs a test runner directly (for example `vitest run` or `pnpm exec vitest`) bypasses it, so two heavy runs can still overlap. No host hook wraps those commands: `git grep -l 'machine-lock\|--lock tests'` over `.bkit/core/hooks` and the host dirs is empty. #724's Out of Scope names this as a separate follow-up.

### Outcome

On every host, a raw heavy test-runner command either runs under the tests lock or is refused with the locked command to use instead.

### Success criteria

- On Claude, Codex, OpenCode and Cursor, a raw heavy test-runner command goes through the tests lock.
- A light run (a single test file) is not slowed down, or is exempt by a stated rule.
- The refusal text names the exact command to run instead.

### Constraints and non-goals

- Host parity (`.agents/rules.md` § Provider parity); POSIX shell only.
- Stack-agnostic: match `package.json` script names and runner binaries from config, not one test framework.

### Decisions already made

None.

### Open questions

- A) Wrap: the hook rewrites the command to run under the lock. B) Refuse: the hook blocks and names the locked script. Recommended: B, because not every host lets a hook rewrite a command.
- Light-run exemption? A) Exempt single-file runs. B) No exemption. Recommended: A.

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-16)
- Audit parent: #344 — Deferrals triage
- #724 — Machine-wide test lock: one test run at a time across agents
- `docs/deferrals.jsonl` key `724-host-hook-catches-raw-test-runners`

## #724 — Machine-wide test lock: one test run at a time across agents (closed)

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

Body rewritten as a change issue (Narrative, Success Criteria, Derived Test Matrix, 5 tasks in 3 groups); `bkit tests plan-check` on the body: 0 problems, 0 existence findings. Label `next:design` → `next:plan`.

Where it differs from the slots comment above, the body wins:

- **Slots:** default 1 heavy run per machine plus a `BKIT_TEST_SLOTS` override. No hardware formula, no live-load guard, so no up-front 1-vs-2 timing is needed.
- **Rename without migration:** the script is copy-and-own. Consumers keep their copies at their own paths (app-gether-life: `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` prunes the old name from `.bkit/templates/` on upgrade.
- **Named-lock API upstreamed:** comes from app-gether-life's adopted copy, which already holds a second named lock (`e2e-phones`) beside the stack lock.

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

**Correction to point 2 above (the holder line's "last run took").** Keying the record by lock name would show repo A's gate time to a waiter queued behind repo B's gate, and the two can differ by a lot. The script now keeps one line per checkout in `<lock dir>/tests.last` (`<checkout path><TAB><seconds>`, replaced in place on every release), and the waiting note and the give-up line print the current holder's own last run, or `no earlier run` when that checkout has none. Open Question 14, TASK 2 and the matrix row are updated in the plan in place.
