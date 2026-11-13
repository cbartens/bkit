# Brief: group 2 — Upgrade migration replaces unedited adopted lock copies (tests)

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

- Group 1: Arrival-ordered queue in the lock template — done
  - TASK 1: Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it — done
  - TASK 2: Clean up dead tickets and refuse with the queue path when the queue cannot be used — done
  - TASK 3: Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note — done
  - TASK 4: Keep a run's place in line across a give-up and re-ask — done
  - TASK 5: Document the queue in the lock docs and re-render the mirrors — done
- Group 2: Upgrade migration replaces unedited adopted lock copies — this group
  - TASK 6: Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade — open
- Group 3: A human-approved jump to the front of the tests line — next
  - TASK 7: Sort a jumped run first in the Perl helper's scan — open
  - TASK 8: Add `bkit tests jump <run>`, which writes the jump marker for one waiting run — open
  - TASK 9: Make every `bkit tests jump` wait for the human's approval on all five hosts — open
  - TASK 10: Document the jump and its approval, and re-render the mirrors — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: call a new `migrateMachineLockCopy(dryRun, ws, logPrefix)` beside `migrateSlopTypeSuppression`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `SHIPPED_MACHINE_LOCK_HASHES` (the full sha256 of `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`, plus the hash of any later release without the queue that `git tag --list 'v6.*'` shows) and `migrateMachineLockCopy`: absent or equal to the template → silent; not a regular file or under a symlink → warn; a shipped hash → replace with the template as an unhashed `update` write and log one `core:` line; otherwise, with no `.queue` in its text → warn naming `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to merge by hand and that waiting runs take the lock out of arrival order until then
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: a `machine-lock copy migration` describe block with `seed` and `migrate` helpers after the `slop plugin migration` block, and the three tests below
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Machine-lock copies without the queue", naming `migrateMachineLockCopy`, `SHIPPED_MACHINE_LOCK_HASHES`, the four cases, releases `6.1.0-6.1.x` and the test file
  - **READ:** `migrateSlopTypeSuppression` in `.bkit/core/engine/install/modules/core.ts`: the replace-or-warn pattern, `linkedPath` and the unhashed write
  - **READ:** `.bkit/core/engine/install/modules/core.integration.test.ts`: the `slop plugin migration` block, the sibling test pattern
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the three tests below pass; the whole of `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `pnpm build` has refreshed `dist/` and `dist/` is staged with the change; in a fresh scratch consumer whose `scripts/ci/bkit-machine-lock.sh` is the 6.1.1 fixture, `node <bkit>/dist/cli.js upgrade` makes `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exit 0, and a second `upgrade` prints no line for that file; `docs/migrations.md` has the "Machine-lock copies without the queue" row
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `replaces a shipped 6.1.1 machine-lock copy and records the same unhashed write in dry run` fails on the 6.1.1 copy left byte for byte as it was after `runBkitDocs`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `preserves an edited machine-lock copy without the queue and reports the template to merge by hand` fails on no warning naming "out of arrival order" for the edited copy
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a symlinked machine-lock copy unchanged and reports the template to merge by hand` fails on no warning naming ".bkit/templates/scripts/ci/bkit-machine-lock.sh" for the symlinked copy

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it — `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`, `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Upgrade replaces an adopted `scripts/ci/bkit-machine-lock.sh` byte-identical to the 6.1.1 fixture with the current template, records the same unhashed write in a dry run, and writes nothing on a second run | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade leaves an edited adopted copy without the queue byte for byte and warns, naming the template to merge by hand and "out of arrival order" | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade leaves a symlinked adopted copy unchanged and warns, naming the template to merge by hand | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
