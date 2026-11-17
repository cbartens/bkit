# Brief: group 1 — Arrival-ordered queue in the lock template

Plan: Machine Lock Waiters Served in Arrival Order Implementation Plan

## Why and what

### Context & Goals

The machine lock (`.bkit/templates/scripts/ci/bkit-machine-lock.sh`, adopted byte-identical as `scripts/ci/bkit-machine-lock.sh`) has no wait list. Each waiting run's Perl helper retries a non-blocking `flock` every 0.1 s (`scripts/ci/bkit-machine-lock.sh:234-252`), so whichever helper retries first after a release wins. How long a run has waited counts for nothing, and a session that just released the lock and asks again is as likely to win as a run that has waited 50 minutes. One `bkit tests run` gate waited 51 minutes while three later arrivals took the lock ahead of it, and would have given up (exit 75) at its 3600 s limit without running.

Goals:

- Add a ticket queue beside each lock file, so the Perl helper's acquire loop admits waiters in the order they started waiting. The queue lives in the one acquire loop every lock shares, so the `tests` lock, other named locks and the unnamed stack lock all gain it.
- Make a ticket disappear, or be skipped, when its waiter gives up, its caller dies or its helper is killed, so a dead ticket never blocks the line.
- Keep a run's place in line when it gives up and the same run asks again within 120 s, so the exit-81 short-call loop of `bkit tests run`, `bkit tests changed` and `bkit branches push` (`.bkit/providers.md` § Long-running shell commands) does not send a 60 s host to the end of the line on every re-run (decision `916-queue-keeps-place-across-give-up`).
- Make the `⏳ waiting` note say where the run is in line.
- Replace consumers' adopted copies of `scripts/ci/bkit-machine-lock.sh` that are byte-identical to a shipped release without the queue with the new template, through an upgrade migration (decision `916-stale-lock-copy-upgrade-report-note`).
- Add `bkit tests jump <run>`, which moves one waiting run to the front of the `tests` line. It never takes the lock from the current holder, and every use needs the human's approval through the host's ask permission, so an agent cannot approve its own jump (decision `916-priority-jump-human-approved`).
- Keep every existing contract: exit codes 2 / 73 / 75, the give-up line `bkit tests run` parses (`testsLockHolder` in `.bkit/core/engine/commands/lib.ts`), lock file paths, owner variables, the `BKIT_TEST_SLOTS` slots, nested reuse, the `CI` no-op and mutual exclusion with copies that predate the queue.

This plan covers issue #916, plus the priority jump the owner folded into it while answering the plan's questions (no workstreams, no parent design, no audit). It reads no superseded plan, because none exists at `docs/plans/202611/916-tests-lock-waiting-plan.md`.

**Related Issues:**

- #916 — Tests lock: waiting runs win at random, so one can wait out its limit (OPEN)
- #724 — Machine-wide test lock: one test run at a time across agents (CLOSED)
- #822 — Route raw test-runner commands through the tests lock per host (OPEN)

---

### Narrative

Runs get the lock in the order they started waiting.

### Success Criteria

- A run waiting with a long enough limit always gets its turn once the runs ahead of it finish.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Wait estimate in the waiting note, summed from `<name>.last` | The issue says the note "can" estimate the wait; no `Derived Test Matrix` row needs it, and the owner's answer to the waiting-note question (decision `916-waiting-note-place-only-no-estimate`) declares it out, because `.last` keeps one held time per checkout, not per gate. | `docs/deferrals.jsonl` key `916-lock-wait-estimate-from-last`; a later issue once `.last` records held time per gate. |

## Where it fits

- Group 1: Arrival-ordered queue in the lock template — this group
  - TASK 1: Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it — open
  - TASK 2: Clean up dead tickets and refuse with the queue path when the queue cannot be used — open
  - TASK 3: Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note — open
  - TASK 4: Keep a run's place in line across a give-up and re-ask — open
  - TASK 5: Document the queue in the lock docs and re-render the mirrors — open
- Group 2: Upgrade migration replaces unedited adopted lock copies — next
  - TASK 6: Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade — open
- Group 3: A human-approved jump to the front of the tests line — later
  - TASK 7: Sort a jumped run first in the Perl helper's scan — open
  - TASK 8: Add `bkit tests jump <run>`, which writes the jump marker for one waiting run — open
  - TASK 9: Make every `bkit tests jump` wait for the human's approval on all five hosts — open
  - TASK 10: Document the jump and its approval, and re-render the mirrors — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the Perl helper creates `<stem>.queue/` on every wait-mode take, writes a `flock`-held ticket named `<CLOCK_MONOTONIC seconds, 6 decimals>-<pid>` (temp file, lock, rename), scans live tickets every pass while ignoring names that are not tickets, tries the slots only when first in line, and unlinks its ticket on acquire
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the scan, the slot tries and the caller check stay inside the one existing 0.1 s pass, with no second sleep and no blocking call per pass, so the handoff fix of failure `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts a killed tests-lock holder frees its slot within a second and the waiter starts` (CLOSED) holds
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment (lines 22-36) names the queue folder and arrival order
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **CREATE:** `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`: the exact output of `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh`, written by the tests step as test input
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: a `machine lock waiting order` describe block with the five tests below, the order-file and ticket-pid helpers, and an `OLD_LOCK_SCRIPT` path to the fixture
  - **READ:** `testsLockHolder` in `.bkit/core/engine/commands/lib.ts`: the give-up line format that must not change
  - **READ:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the existing give-up → exit 81 tests that must stay green
  - **READ:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `identical` entry for `scripts/ci/bkit-machine-lock.sh`
  - **READ:** `docs/knowledge.jsonl`: key `machine-lock-fifo-timeout-may-consume-partial-line`, the failure chain the fixture's pre-fix reader can reproduce
  - **READ:** `docs/failures.jsonl`: key `machine-lock-history-wait-returned-refusal` (OPEN), the same reader on this suite
  - **DONE WHEN:** the five tests below pass; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs`, `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `shasum -a 256 tests/fixtures/machine-lock/machine-lock-6.1.1.sh` starts with `63ee5873795f`; the mixed-version test passes with the old-copy waiter's command also run and no two commands' start-to-end spans overlapping
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `tests-lock waiters run their commands in arrival order` fails on the order file listing the five waiters in a different order from the one they started waiting in
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `stack-lock waiters run their commands in arrival order` fails on the unnamed stack lock's five waiters running out of arrival order
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a run that releases the lock and asks again queues behind runs already waiting` fails on the order file not listing the five waiting runs in arrival order followed by the re-asking holder's second entry
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with two slots, waiters take freed slots in arrival order` fails on a later waiter taking a freed slot before an earlier one under `BKIT_TEST_SLOTS=2`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `queued waiters keep their order while a copy without the queue also waits, and no two commands overlap` fails on the five queued waiters running out of arrival order

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Clean up dead tickets and refuse with the queue path when the queue cannot be used
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the Perl helper unlinks its ticket on give-up, caller death and errors; installs wait-time `TERM` / `INT` / `HUP` handlers before the acquire loop that unlink the ticket and exit, replaced by the existing post-acquire handler after acquire; unlinks as dead any ticket whose `flock` can be taken; and replies `error cannot create $queue: …` or `error cannot write a ticket in $queue: …` when the queue folder cannot be created or a ticket cannot be written
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the six machine-lock tests below in the `machine lock waiting order` block
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the `bkit tests run` exit-4 test below, beside `tests run with an unwritable lock dir exits 4 naming the path`
  - **READ:** `classifyLockExit` in `.bkit/core/engine/commands/lib.ts`: the `could not take the lock for tests:` prefix that maps a refusal to exit 4
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the seven tests below pass; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs`, `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter that gives up leaves the line and the runs behind it keep their order` fails on the remaining waiters running out of arrival order after one gives up with exit 75
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose caller is killed leaves the line and the runs behind it keep their order` fails on the remaining waiters running out of arrival order after one caller is killed
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order` fails on the helper finding "no ticket for" the waiter whose Perl helper it must signal
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order` fails on the helper finding "no ticket for" the waiter whose Perl helper it must kill
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the queue folder when it cannot be created` fails on `run` exiting 0 and running its command while a regular file sits at `tests.queue`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the queue folder when no ticket can be written` fails on `run` exiting 0 and running its command while `tests.queue` is read-only (`chmod 0555`)
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 4 naming the queue folder when a regular file blocks it` fails on `bkit tests run` running the gate and exiting 0 while a regular file sits at `tests.queue`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: `try` mode never creates the queue folder, counts a missing or unreadable queue folder as an empty line, scans the queue before the slots and replies `busy <holders>; <N> waiting in line` while any live ticket exists; the scan leaves every name that is neither a ticket nor a held place in place; the `⏳` note gains `, <ordinal> in line` (`1st`, `2nd`, `3rd`, `Nth`, with `11th`-`13th`)
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment line 9 says a `try` is busy while runs wait in line, and line 34 says waiting notes name the place in line
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the four new tests below in the `machine lock waiting order` block, and a no-ticket assertion in the existing `a runner started by the holder does not wait on its parent`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the five tests below pass; the existing `try_local_stack_lock` tests in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` and `scripts/ci/bkit-test-awake.test.mjs` pass; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts` and `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a try while a run waits first in line reports busy even when the lock is free` fails on the ticket-pid helper throwing "no ticket for" the first-in-line waiter it must stop, before the `try` result and its "1 waiting in line" note are checked
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the waiting note says where the run is in line` fails on the second waiter's note lacking "2nd in line"
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a stray file in the queue folder neither blocks the line nor gets deleted` fails on the five waiters running out of arrival order while a planted `.<n>.tmp` and an unrelated file sit in `tests.queue`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a stopped first-in-line waiter holds the line while the lock is free` fails on the ticket-pid helper throwing "no ticket for" the first-in-line waiter it must stop
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by the holder does not wait on its parent` (existing test, updated) fails on a ticket left in the stack lock's queue folder after the child reuses its parent's lock

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Keep a run's place in line across a give-up and re-ask
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: on give-up the Perl helper renames its ticket to `<ticket name>.held`, keeping its time; a wait-mode take whose `<who> — <checkout>` line matches a held place under 120 s old unlinks it and takes its time with its own pid; the scan skips held places and deletes those older than 120 s (decision `916-queue-keeps-place-across-give-up`)
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment (lines 22-36) names the held place
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the two tests below in the `machine lock waiting order` block, and the held-place helper
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: the `bkit tests run` run name passed as `LOCAL_STACK_LOCK_WHO`, stable across re-runs, that a held place matches on
  - **READ:** `.bkit/core/engine/commands/workflow/tests-changed.ts`: the `bkit tests changed` run name, stable across re-runs
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: the `bkit branches push` run name, stable across re-runs
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the two tests below pass; the existing `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` and `tests run with --lock-wait-s=0 exits 81 at once against a held lock` in `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` pass; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs`, `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter that gives up and asks again within 120 s keeps its place in line` fails on the re-asking run's command running after a run that started waiting after its first wait
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a held place older than 120 s is deleted and the re-ask joins the end of the line` fails on the test finding "no held place for" the waiter that gave up

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Document the queue in the lock docs and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock names the `<name>.queue/` folder, arrival order, dead-ticket skipping, the held place across a give-up, the place-in-line note, the `try` rule, and that a waiter stopped while first in line holds the line (`ls` the queue folder to see who is first)
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock's last bullet says waiting runs take the lock in arrival order and waiting notes name the place in line; its re-run bullet says a re-run on exit 81 within 120 s keeps its place in line
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Long-running shell commands' rule sentence (line 858) says a short-call host's re-run within 120 s keeps its place in line
  - **UPDATE:** `docs/testing.md`: the machine-lock paragraph below `bkit:end` (line 709) names `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/templates.md`, `.bkit/providers.md` and the managed block of `docs/testing.md`, so `diff <(sed -n '/^## Machine lock/,/^## /p' .bkit/core/.bkit/templates.md) <(sed -n '/^## Machine lock/,/^## /p' .bkit/templates.md)` prints nothing, the same holds for § Tests lock in `.bkit/shared/docs/testing.md` against `docs/testing.md` and for § Long-running shell commands in `.bkit/core/.bkit/providers.md` against `.bkit/providers.md`, and after `pnpm build`, `node dist/cli.js check` reports no drift
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 5 end -->

Reuse Inventory rows left out: 10; Architecture entries left out: 9 — read them in docs/plans/202611/916-tests-lock-waiting-plan.md § Reuse Inventory and § Architecture & Component Changes.
