# Brief: group 4 — Challenge round 1 findings

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
  - TASK 12: A waiter started under `nohup` (or as a background job, which ignores SIGINT) now dies on SIGHUP / SIGINT while it waits, so its run exits 73 instead of waiting its turn — open
  - TASK 13: A Codex user whose `.codex` folder is a symlink gets `bkit tests jump` as an advisory, so a Codex agent jumps the line with no human approval — open

## The work

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Two runs that take a lock at once on a fresh cache race to create `<name>.queue/`, and the loser exits 73 with "cannot create …: File exists"
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:301` · **Round:** 1
  - **DONE WHEN:** the helper treats the queue folder as usable when `mkdir` fails because another helper created it first (for example `mkdir($queue) || -d $queue`, checked after the `mkdir`, not before it), so concurrent first takes never reply `error cannot create`; a regular file at the path still replies `error cannot create $queue` and `run` still exits 73; `scripts/ci/bkit-machine-lock.sh` is copied from the template byte for byte. Reproduced on this diff: 8 concurrent `run --lock tests -- true` per fresh `XDG_CACHE_HOME`, 20 rounds, 1 round had an exit 73 with `could not take the lock for tests: cannot create …/tests.queue: File exists`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` fails on at least one of 16 concurrent `run --lock tests` takes, repeated over 50 fresh `XDG_CACHE_HOME` folders, exiting 73 with "cannot create" and "File exists" in its stderr (a stress test: the race fired in 1 of 20 rounds at 8 concurrent takes, so the round and take counts must stay high enough that the current code fails it)
<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** A waiter started under `nohup` (or as a background job, which ignores SIGINT) now dies on SIGHUP / SIGINT while it waits, so its run exits 73 instead of waiting its turn
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:242` · **Round:** 1
  - **DONE WHEN:** the wait-time handler is installed only for a signal whose inherited disposition is not `IGNORE` (Perl shows an inherited ignore as `$SIG{HUP} eq "IGNORE"`), so a helper whose caller ignores SIGHUP or SIGINT keeps waiting as the 6.1.1 copy does; TERM, and HUP / INT when not ignored, still unlink the ticket and exit; `scripts/ci/bkit-machine-lock.sh` is copied from the template byte for byte. Reproduced on this diff: holder on `tests`, `nohup bash bkit-machine-lock.sh run W --lock tests -- echo W-ran`, `kill -HUP <helper pid>` → `could not take the lock for tests: the perl process holding it stopped before it answered`, exit 73; the same steps against `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` print `W-ran` and exit 0. The plan's Out of Scope row names the same flaw in the post-acquire handler (`scripts/ci/bkit-machine-lock.sh:254` before this diff); this diff copies it into the wait.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP` fails on the waiter, started as `bash -c "trap '' HUP; exec bash <script> run w1 --lock tests -- …"` behind a holder, exiting 73 with "stopped before it answered" after `process.kill(ticketPid(queueOf("tests"), "w1"), "SIGHUP")`, instead of running its command once the holder releases
<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** A Codex user whose `.codex` folder is a symlink gets `bkit tests jump` as an advisory, so a Codex agent jumps the line with no human approval
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-tiers.js:181` · **Round:** 1
  - **DONE WHEN:** the Codex check also tests the path the hook was invoked by (`process.argv[1]`, which Node makes absolute but does not resolve through symlinks), not only `__filename`, which Node resolves to the real path; a Codex hook reached through a symlinked `.codex` folder denies `bkit tests jump`, and the Cursor and Antigravity hooks still ask; the rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` are re-rendered. Reproduced on this diff: the rendered Codex hook copied to `dotfiles/codex-config/hooks/` with `repo/.codex -> dotfiles/codex-config`, run as `node .codex/hooks/bkit-guardrails.cjs` from `repo/` with a `bkit tests jump build-1` payload, returns `additionalContext` ("ran without confirmation") instead of `permissionDecision: "deny"`; the same file under a real `.codex/hooks/` denies.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump when .codex is a symlinked folder` fails on the rendered Codex hook, run through a `.codex` symlink to a folder whose real path has no `.codex/hooks/`, returning an advisory (`codexVerdict` "ask") instead of "deny"
<!-- bkit:task 13 end -->
