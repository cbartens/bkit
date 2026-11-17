## Session Prompt — this run's, newer than everything below

#921 cut worktree from local dev

## Issue description — oldest

### Narrative

Test gates queue for the machine-wide `tests` lock while the CPU is mostly idle. The lock has one slot unless `BKIT_TEST_SLOTS` says otherwise, so a second gate (from another worktree or another repo) waits for the whole of the first gate, even when that gate is in a light stretch.

The slot count also has nowhere to live. bkit is installed per repo, but every repo's gates queue on the same files in `~/.cache/bkit/machine-lock/`. Each repo's copy of `scripts/ci/bkit-machine-lock.sh` reads `BKIT_TEST_SLOTS` from the environment of whatever starts the gate (`:93`) and falls back to 1. No shipped file sets it, and the docs do not say where a user should. Two shells or repos that disagree (1 versus 2) leave a slots=1 run at the front of the line holding back a slots=2 run while slot 2 is free (#916's LOW deferral).

Owner decision (2026-11-15): the lock script works out the default slot count from the machine's core count, the same count it already uses for `BKIT_TEST_WORKERS`, and this issue goes straight to build without a design. The proposed rule is 2 slots with 8 or more cores, otherwise 1 (see Open Questions & Assumptions). `BKIT_TEST_SLOTS` still overrides it. Every repo on the same bkit version then works out the same count on the same machine, with no setting. Decision `724-tests-lock-fixed-slots-not-live-load` still holds: the count is fixed per machine, and live load never decides it.

This lands after #814, whose fixed local hang limits (6× the CI limit) stop a second slot from turning extra load into false `Test timed out` failures. Locking per stage (only the CPU-heavy stages hold the lock) is not part of this issue; it is built only if gates still queue with two slots.

###### bkit:blocked-by start
- #814
###### bkit:blocked-by end

### Success Criteria

- With `BKIT_TEST_SLOTS` unset, the `tests` lock has 2 slots on a machine with 8 or more cores and 1 slot below 8.
- A whole-number `BKIT_TEST_SLOTS` >= 1 overrides the core-count default in both directions.
- An invalid `BKIT_TEST_SLOTS` falls back to the core-count default, with one stderr note naming the slot count used.
- `BKIT_TEST_WORKERS` stays `max(1, floor(cores / slots) - 1)` with whatever slot count was chosen.
- `docs/testing.md` § Tests lock and `.bkit/templates.md` § Machine lock state the default rule and that `BKIT_TEST_SLOTS` is a per-machine setting, with where to set it.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `BKIT_TEST_SLOTS` unset, 10 cores | 2 slots; `BKIT_TEST_WORKERS=4` |
| `BKIT_TEST_SLOTS` unset, 8 cores | 2 slots; `BKIT_TEST_WORKERS=3` |
| `BKIT_TEST_SLOTS` unset, 7 cores | 1 slot; `BKIT_TEST_WORKERS=6` |
| `BKIT_TEST_SLOTS=1`, 10 cores | 1 slot; `BKIT_TEST_WORKERS=9` |
| `BKIT_TEST_SLOTS=3`, 4 cores | 3 slots; `BKIT_TEST_WORKERS=1` |
| `BKIT_TEST_SLOTS` is `0`, `-1`, `1.5`, `garbage` or empty, 10 cores | 2 slots; one stderr note naming `BKIT_TEST_SLOTS` and 2 |
| No core probe (`getconf`, `nproc`, `sysctl`) gives a number | cores = 1 → 1 slot (unchanged fallback) |
| `CI=true` / `CI=1` | No lock, no slot count (unchanged) |
| A repo still on an older lock copy, `BKIT_TEST_SLOTS` unset | That copy uses 1 slot and only `tests.lock`; it still meets newer copies on slot 1 |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Unset slots on 10 cores: two holders hold `tests` at once and a third waits naming both | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| Unset slots on 7 cores: a second holder waits behind the first | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| Unset slots: `BKIT_TEST_WORKERS` is 4 on 10 cores, 3 on 8 cores and 6 on 7 cores | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| `BKIT_TEST_SLOTS=1` on 10 cores keeps one slot; `BKIT_TEST_SLOTS=3` on 4 cores gives three | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| An invalid slots value falls back to the core-count default with one note naming it, on 10 and on 4 cores | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| No working core probe gives one slot | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Core-count default for the tests slots
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Work out the default slot count from the core count
  - **CREATE:** `_local_stack_lock_cores` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the core probe moved out of `_local_stack_lock_workers` (`getconf _NPROCESSORS_ONLN`, else `nproc`, else `sysctl -n hw.ncpu`, else 1), setting `_lsl_cores`
  - **UPDATE:** `_local_stack_lock_slots` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: with `BKIT_TEST_SLOTS` unset, use 2 when `_lsl_cores` >= 8, else 1; a set value that is not a whole number >= 1 falls back to that same default, and the one-time note reads `[machine-lock] invalid BKIT_TEST_SLOTS; using N slot(s)` with the count used
  - **UPDATE:** `_local_stack_lock_workers` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: use `_lsl_cores` from `_local_stack_lock_cores` instead of probing again
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: for `tests`, call `_local_stack_lock_cores`, then `_local_stack_lock_slots`, then `_local_stack_lock_workers`, with `_lsl_cores` declared `local` there
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh` header comment (`:30-31`): state the core-count default and the override
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical copy of the template
  - **UPDATE:** `envFor` in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: put a fake `getconf` reporting 4 cores first on `PATH` unless the caller passes its own `PATH`, so the existing one-slot tests hold on any machine
  - **DONE WHEN:** `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds and `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset on 10 cores, two runs hold tests at once and a third waits naming both` fails while the default is 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset on 7 cores, a second run waits behind the first` fails if the threshold is below 8
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset, BKIT_TEST_WORKERS follows the core-count slots` fails while 10 cores give 9 instead of 4
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` fails if the override is ignored
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `an invalid slots value falls back to the core-count default and names it` fails while 10 cores fall back to 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with no working core probe, slots unset gives one slot` fails if the fallback core count is not 1
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Pin one slot in the tests that expect a second run to wait
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the env of every run that expects exit 81 / `lockHolder` behind the external `tests` holder sets `BKIT_TEST_SLOTS: "1"`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`: same for the push runs that expect exit 81 behind `external push holder`
  - **READ:** `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts:32`: already stubs `BKIT_TEST_SLOTS` to 1
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both files pass with `pnpm bkit:test:file` on a machine with 8 or more cores, and `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists no other file whose test expects a second `tests` run to wait without pinning the slot count
  - **TEST FIRST:** n/a — test-only change; the two files' existing exit-81 tests are the check
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Docs and decision
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the default rule and where to set the override
  - **UPDATE:** `.bkit/core/.bkit/templates.md` § Machine lock (`:966`): default 2 slots on 8 or more cores, else 1; `BKIT_TEST_SLOTS` overrides it; an invalid value falls back to the default with one note; it is a per-machine setting, so set it in user-level host settings or the shell profile, never per repo
  - **UPDATE:** `.bkit/core/.bkit/workflows.md` (`:1231`) and `docs/testing.md` § Tests lock (`:325`): the same rule in one bullet
  - **UPDATE:** `.bkit/templates.md` and `.bkit/workflows.md`: refresh the mirrors from the core copies with `bkit install`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n "default 1" -- docs/testing.md .bkit/templates.md .bkit/workflows.md .bkit/core/.bkit/templates.md .bkit/core/.bkit/workflows.md` no longer matches a `BKIT_TEST_SLOTS` line, and `bkit check` passes
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Update the slots decision
  - **UPDATE:** `docs/decisions.jsonl` key `724-tests-lock-fixed-slots-not-live-load`: append a same-key row with `bkit ledgers append` whose description says the default slot count comes from the core count (2 on 8 or more cores, else 1), `BKIT_TEST_SLOTS` overrides it, and live load still never decides it (#921)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=decisions --status=ACTIVE` shows the key with the new description
  - **TEST FIRST:** n/a — ledger row
<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: the threshold is 8 cores and the default never goes above 2. More slots stay an explicit `BKIT_TEST_SLOTS` choice.
- Consumer copies: this ships in v6.2, the same release as #916's arrival-order queue, so the existing `migrateMachineLockCopy` (`SHIPPED_MACHINE_LOCK_HASHES`) already replaces byte-identical 6.1.x copies with the new template and no new migration is needed. If a release containing the queue ships first, the build adds that release's lock hash to `SHIPPED_MACHINE_LOCK_HASHES` and updates the `docs/migrations.md` row, with a case in `.bkit/core/engine/install/modules/core.integration.test.ts`.
- Assumed: the #916 LOW deferral `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344` stays open. The core-count default removes the disagreement when nobody sets `BKIT_TEST_SLOTS`, but an explicit mismatch between shells can still block.

### Breaking Changes & Naming

- On machines with 8 or more cores and no `BKIT_TEST_SLOTS`, two gates now run at once, each with about half the cores. Anyone who wants the old behaviour sets `BKIT_TEST_SLOTS=1`.
- New internal function `_local_stack_lock_cores`; the invalid-value note now names the slot count used.

### Out of Scope

- Locking per stage instead of per gate: only if gates still queue with two slots after this lands.
- Live-load admission: rejected by decision `724-tests-lock-fixed-slots-not-live-load`.
- `CI=true` behaviour: unchanged, CI takes no lock.

### References

- #814 — Local test limits only catch hangs; drop load-based scaling (https://github.com/cbartens/bkit/issues/814)
- #916 — Tests lock: waiting runs win at random, so one can wait out its limit (https://github.com/cbartens/bkit/issues/916)
- #924 — Let every workflow land on local dev without pushing (https://github.com/cbartens/bkit/issues/924): with two slots, two landings' checks run at once more often
- `.bkit/templates.md` § Machine lock
- `docs/testing.md` § Tests lock
- `docs/migrations.md` § Machine-lock copies without the queue
- `docs/decisions.jsonl` key `724-tests-lock-fixed-slots-not-live-load`
- `docs/decisions.jsonl` key `916-queue-first-in-line-only-tries`
- `docs/deferrals.jsonl` key `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344`

## Issue comment — posted 2026-11-14T00:37:59.000Z

**Related: #924 — Let every workflow land on local dev without pushing — https://github.com/cbartens/bkit/issues/924**

When `BKIT_TEST_SLOTS` is above 1, two #924 landings can run their checks at the same time. `dev` then often moves between one run's green checks and its landing, so #924's refuse-and-retest path has to hold up as a routine case ([owner answer 7](https://github.com/cbartens/bkit/issues/924#issuecomment-6868621643)). That work is planned in #937 — Local landing target with design / plan local close — https://github.com/cbartens/bkit/issues/937.

Also related: #916 — Tests lock: waiting runs win at random, so one can wait out its limit — https://github.com/cbartens/bkit/issues/916

## Issue comment — posted 2026-11-15T08:05:39.000Z

**Input for the design: the slot count is a per-machine setting with no file to live in.**

bkit is installed per repo, but the tests lock it installs is shared by every repo on the machine. Every repo's gates queue on the same files in `~/.cache/bkit/machine-lock/` (`tests.lock`, `tests.2.lock`, …), per `.bkit/templates.md` § Machine lock.

The number of slots does not work the same way. Each repo's copy of `scripts/ci/bkit-machine-lock.sh` reads `BKIT_TEST_SLOTS` from the environment of whatever starts the gate (`scripts/ci/bkit-machine-lock.sh:93`), and falls back to 1. No shipped file sets it. `docs/testing.md` § Tests lock and `.bkit/templates.md` § Machine lock say what it does, but not where a user should set it.

That causes two problems:

- **Different values in one line.** Two repos (or two shells) can disagree, for example one running with 1 slot and another with 2. Since #916 — Tests lock: waiting runs win at random, so one can wait out its limit — https://github.com/cbartens/bkit/issues/916, only the run at the front of the line tries for a slot. A slots=1 run at the front therefore holds back a slots=2 run behind it, even while slot 2 is free. This is the open LOW deferral `docs/deferrals.jsonl` key `916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344`.
- **No right per-repo value.** The right count depends on the machine (10 cores versus 4), which a repo file cannot know. A repo-level setting would also bring back the disagreement above.

**A third option alongside the two in the body: work out the default slot count from the core count.** The lock script already counts cores (`getconf _NPROCESSORS_ONLN`, else `nproc`, else `sysctl -n hw.ncpu`) to set `BKIT_TEST_WORKERS = max(1, floor(cores / slots) - 1)`. It could use the same count to choose the default number of slots, for example 2 slots on 8 or more cores, with `BKIT_TEST_SLOTS` still overriding it.

- Every repo on the same bkit version would work out the same count on the same machine, so they would agree with no setting, and nobody would need to know the variable exists.
- Decision `724-tests-lock-fixed-slots-not-live-load` still holds: the count is fixed per machine, and live load never decides it.
- Cost: a repo still on an older copy of the script works out 1 and holds the others back until it upgrades.
- Smaller alternative: keep the default at 1 and document `BKIT_TEST_SLOTS` as a per-machine setting, with where to put it (user-level host settings or the shell profile).

**What capping workers does not solve.** Two slots cap the *workers* at `cores - 2` in total, but not the load. Tests start `git`, `node` and ESLint child processes on top of their workers, which is how the single-gate run in the body reached load 79.8 on 10 cores. So the timeout risk from two slots is real even with the worker cap. That makes the body's other option, locking only the CPU-heavy stages, the one that goes after the cause. The core-count default helps either way, because it removes the per-repo disagreement over how many slots there are.

## Issue comment — posted 2026-11-15T08:09:18.000Z

**Recommended order for this issue's design**

1. **Land #814 — Local test limits only catch hangs; drop load-based scaling — https://github.com/cbartens/bkit/issues/814 first.**
2. **Then default the slot count from the core count**: 2 slots on 8 or more cores, with `BKIT_TEST_SLOTS` still overriding it (the option in the comment above).
3. **Lock per stage only if measured waits remain** after step 2.

**Why #814 comes first.** Locally, test time limits currently stretch with the machine's load, starting at ×1 on a quiet machine, and the stretch keeps falling short. #814 measured tests slowing about 2.3× under the full suite while their limits stretched about 1.6×. That shortfall is why a second slot was risky: two gates at once means more load and more false `Test timed out` failures. #814 sets every local limit to a fixed 6× the CI value (30s per unit test, 60s per unit hook, 180s per integration test and hook), whatever the load. After it lands:

- A local limit only fails a test that is really hung, not one slowed down by a second gate sharing the CPU.
- CI keeps the strict limits (5s / 10s / 30s), and `CI=true` skips the lock, so a test that really got slower still fails on every PR.

Once #814 is in, a second slot costs speed per gate, not false failures.

**Why the core-count default is the fix for this issue.** It is a small change to `scripts/ci/bkit-machine-lock.sh` (plus its template copy and the docs). Every repo on the same bkit version works out the same count on the same machine with no setting, which removes the slots=1-front-of-line blocking from the #916 deferral. It ends the idle waiting this issue reports. Decision `724-tests-lock-fixed-slots-not-live-load` still holds, because the count is fixed per machine and live load never decides it.

**Why per-stage locking waits.** Taking the lock only for the CPU-heavy stages goes more directly at the cause, but it adds new ways to fail:

- A gate can stall partway through, waiting for the lock again with stages already done.
- The lock-order rules (`tests` → other named locks → stack lock) get more cases.
- `dev` moves more often between one run's green checks and its landing. That is the #924 — Let every workflow land on local dev without pushing — https://github.com/cbartens/bkit/issues/924 race, planned in #937 — Local landing target with design / plan local close — https://github.com/cbartens/bkit/issues/937.

That is a lot of new design for a problem step 2 may already solve. Build it only if gates still queue with two slots.

## Issue comment — posted 2026-11-15T08:14:55.000Z

**Made build-ready, no design.** The body now has the change shape: Narrative, Success Criteria, Edge Cases, Derived Test Matrix and two task groups (core-count default in the lock script plus test pinning; docs plus the `724-tests-lock-fixed-slots-not-live-load` decision row). The original body, a pasted chat answer, is in the body's edit history; its two options are kept, with the core-count default as the fix and per-stage locking out of scope.

- Title: "Machine wide test lock despite low CPU usage" → "Tests lock: default the slot count from the core count".
- Labels: `next:design` → `next:build`.
- Blocked by #814 — Local test limits only catch hangs; drop load-based scaling — https://github.com/cbartens/bkit/issues/814 (machine-read block in the body).
- Board: Status Ready, Priority Medium (tooling, moved up one band because it touches the same test harness as #814, which is being built), Size S.
- Milestone v6.2, so it ships with #916's queue and needs no new migration of consumer lock copies.
