# Brief: group 4 — Challenge round 1 findings (tests)

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
- Group 2: Upgrade migration replaces unedited adopted lock copies — done
  - TASK 6: Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade — done
- Group 3: A human-approved jump to the front of the tests line — done
  - TASK 7: Sort a jumped run first in the Perl helper's scan — done
  - TASK 8: Add `bkit tests jump <run>`, which writes the jump marker for one waiting run — done
  - TASK 9: Make every `bkit tests jump` wait for the human's approval on all five hosts — done
  - TASK 10: Document the jump and its approval, and re-render the mirrors — done
- Group 4: Challenge round 1 findings — this group
  - TASK 11: Two runs that take a lock at once on a fresh cache race to create `<name>.queue/`, and the loser exits 73 with "cannot create …: File exists" — open
  - TASK 12: A waiter started under `nohup` (or as a background job, which ignores SIGINT) now dies on SIGHUP / SIGINT while it waits, so its run exits 73 instead of waiting its turn — done
  - TASK 13: A Codex user whose `.codex` folder is a symlink gets `bkit tests jump` as an advisory, so a Codex agent jumps the line with no human approval — done

## The work

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Two runs that take a lock at once on a fresh cache race to create `<name>.queue/`, and the loser exits 73 with "cannot create …: File exists"
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:301` · **Round:** 1
  - **DONE WHEN:** the helper treats the queue folder as usable when `mkdir` fails because another helper created it first (for example `mkdir($queue) || -d $queue`, checked after the `mkdir`, not before it), so concurrent first takes never reply `error cannot create`; a regular file at the path still replies `error cannot create $queue` and `run` still exits 73; `scripts/ci/bkit-machine-lock.sh` is copied from the template byte for byte. Reproduced on this diff: 8 concurrent `run --lock tests -- true` per fresh `XDG_CACHE_HOME`, 20 rounds, 1 round had an exit 73 with `could not take the lock for tests: cannot create …/tests.queue: File exists`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` fails on at least one of 16 concurrent `run --lock tests` takes, repeated over 50 fresh `XDG_CACHE_HOME` folders, exiting 73 with "cannot create" and "File exists" in its stderr (a stress test: the race fired in 1 of 20 rounds at 8 concurrent takes, so the round and take counts must stay high enough that the current code fails it)

<!-- bkit:task 11 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Five waiters on a held `tests` lock run their commands in the order they started waiting (the issue's steps to reproduce, widened from three waiters to five) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| Five waiters on the unnamed stack lock run their commands in arrival order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| A run that releases the lock and asks again at once runs after every run already waiting: the order file lists the five waiters in arrival order, then the re-asker | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| With `BKIT_TEST_SLOTS=2`, waiters take freed slots in arrival order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| Queued waiters keep their order while a 6.1.1 copy without the queue also waits, and no two commands ever overlap; the old-copy waiter's command also runs | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| A waiter that gives up at its limit leaves the line, exits 75, and the runs behind it keep their order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| A waiter whose caller is killed leaves the line, and the runs behind it keep their order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| A waiter whose Perl helper gets `SIGTERM` while it waits removes its ticket at once, and the runs behind it keep their order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| A waiter whose Perl helper is killed with `SIGKILL` leaves a ticket that the next scan skips and deletes, and the runs behind it keep their order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| `run` exits 73 naming the queue folder when a regular file blocks its creation, and the command never runs | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| `run` exits 73 naming the queue folder when the folder is read-only, so no ticket can be written, and the command never runs | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| A `try` while a run waits first in line reports busy, with "1 waiting in line" in its note, and takes nothing, even when the lock is free | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| The waiting note says where the run is in line ("1st in line", "2nd in line") | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A leftover `.<n>.tmp` and an unrelated file in the queue folder neither block the line nor get deleted: five waiters run in arrival order, and both files still exist afterwards | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A stopped first-in-line waiter holds the line while the lock sits free; once it resumes, it runs first and the run behind it runs next | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A child of a live holder reuses the parent's lock and leaves no ticket in the queue folder (existing test `a runner started by the holder does not wait on its parent`, updated) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A waiter that gives up and asks again under the same run name within 120 s runs ahead of every run that started waiting after its first wait | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 4 |
| A held place older than 120 s is deleted by the next scan, and a re-ask from that run takes a new ticket at the end of the line | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 4 |
| `CI=true` / `CI=1` creates no queue folder (existing test `CI=%s is a no-op that creates no lock file`, kept green: it already asserts that no `<cache>/bkit` folder exists) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| A jump marker moves its waiting run to the front of the line: the holder's command finishes first, then the marked fourth waiter runs, then the others in arrival order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| With two jump markers, the run with the newer marker runs before the run with the older one | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| A jump marker that matches no live ticket and no held place is deleted by the next scan | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| A jumped run that gives up and asks again within 120 s keeps the front | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| runs that take a lock at once on a fresh cache never refuse over the queue folder | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 11 |
| a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 12 |

### Planned tests that already exist

- TASK 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — exists at `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1563`; update that test in place: add expectations, never remove or loosen one
