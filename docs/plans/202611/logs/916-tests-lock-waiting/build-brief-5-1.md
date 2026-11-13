# Brief: group 5 — Challenge round 2 findings

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
- Group 4: Challenge round 1 findings — done
  - TASK 11: Two runs that take a lock at once on a fresh cache race to create `<name>.queue/`, and the loser exits 73 with "cannot create …: File exists" — done
  - TASK 12: A waiter started under `nohup` (or as a background job, which ignores SIGINT) now dies on SIGHUP / SIGINT while it waits, so its run exits 73 instead of waiting its turn — done
  - TASK 13: A Codex user whose `.codex` folder is a symlink gets `bkit tests jump` as an advisory, so a Codex agent jumps the line with no human approval — done
  - TASK 14: TASK 11's race test counts the normal "in line" waiting note as a refusal, so it fails with the fix in place and proves nothing — done
- Group 5: Challenge round 2 findings — this group
  - TASK 15: A Codex agent chains another ask-tier command before `bkit tests jump` (`gh pr close 999999; bkit tests jump build-1`), so the hook sees only the first ask match, turns it into an advisory, and the jump runs with no human approval — open

## The work

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** A Codex agent chains another ask-tier command before `bkit tests jump` (`gh pr close 999999; bkit tests jump build-1`), so the hook sees only the first ask match, turns it into an advisory, and the jump runs with no human approval
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-tiers.js:291` · **Round:** 2
  - **DONE WHEN:** under the Codex hook, `classifyShell` denies any command whose text matches the jump pattern, whatever other ask-tier pattern (git ask rules, `sudo`, `brew install`, `gh pr close`, package publish) matches first, for example by testing the jump pattern on its own before `askRule`'s first-hit result is used; Cursor and Antigravity still ask for those compound commands; the rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` are re-rendered. Reproduced on this diff: piping `{"tool_name":"Bash","tool_input":{"command":"gh pr close 999999; bkit tests jump build-1"}}` into `node .codex/hooks/bkit-guardrails.cjs` returns `additionalContext` "(gh pr close) ran without confirmation" instead of `permissionDecision: "deny"`; the same holds for `sudo -n true; bkit tests jump build-1`. The cause is `askRule` (`guardrails-tiers.js:191-199`), which returns the first ASK_PATTERNS hit, and the jump pattern sits last in the array.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump chained after another ask-tier command` fails on `codexVerdict("gh pr close 999999; bkit tests jump build-1")` and `codexVerdict("sudo -n true; bkit tests jump build-1")` returning "ask" instead of "deny"
<!-- bkit:task 15 end -->
