<!-- bkit:anchor
baseSha: f6914f3c9c88e68faa4b8806406c0d562d2d6c7c
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Machine Lock Waiters Served in Arrival Order Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Runs get the lock in the order they started waiting.

### Success Criteria

- A run waiting with a long enough limit always gets its turn once the runs ahead of it finish.

### Process Sketch

- **WHEN** a run asks for a held lock **→ THEN** it takes a ticket in the lock's queue folder and waits; only the first live ticket in line tries the `flock`, and its waiting note says where it is in line, for example "2nd in line".
- **WHEN** the holder finishes **→ THEN** the run first in line takes the lock and leaves the queue, and the next run becomes first in line within about 0.1 s.
- **WHEN** a run that just released the lock asks again **→ THEN** it joins the end of the line, behind every run already waiting; a run that gave up and asks again within 120 s takes back its old place instead.
- **WHEN** the human approves `bkit tests jump <run>` for a waiting run **→ THEN** that run moves to the front of the `tests` line and takes the lock once the current holder finishes; an agent's own call is held for the human's approval, or blocked on Codex.
- **IF** a waiter gives up, its caller dies or its Perl helper is killed **→ THEN** its ticket is removed, skipped, or kept only as a held place that the line skips, and the runs behind it move up without waiting on it.
- **IF** a `try` asks while runs wait in line **→ THEN** it reports busy and takes nothing, even when a slot is free.
- **IF** a copy of the script without the queue waits at the same time **→ THEN** only one run holds the lock at a time, and the queued runs keep their order among themselves.

### Concrete Example

**Setup:** One laptop, three agent sessions and a holder, using the issue's steps to reproduce. No `CI` variable is set.

**Steps:**

1. The holder runs `bash scripts/ci/bkit-machine-lock.sh run holder --lock tests -- sleep 30` → it takes the `tests` lock.
2. Waiter A runs `LOCAL_STACK_LOCK_WAIT_S=600 bash scripts/ci/bkit-machine-lock.sh run A --lock tests -- sleep 5` → A prints `⏳ A is waiting for tests (up to 600s), 1st in line: in use by holder — …`.
3. A few seconds later, waiters B and C start the same way → B prints `2nd in line` and C prints `3rd in line`.
4. The holder finishes → A's command runs; after A finishes, B's runs; after B finishes, C's runs.

**Outcome:** With ordering it is always A, then B, then C, on every repeat; today it is any of A, B or C.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A waiter reaches its `LOCAL_STACK_LOCK_WAIT_S` limit | It exits 75 with the unchanged give-up line, its helper turns its ticket into a held place that the line skips, and the runs behind it move up. |
| A waiter gives up (exit 75; exit 81 from `bkit tests run`, `bkit tests changed` or `bkit branches push`) and the same run (the same `<who> — <checkout>` line) asks again within 120 s | It takes back its held place, ahead of every run that started waiting after its first wait (decision `916-queue-keeps-place-across-give-up`). |
| A held place is not taken back within 120 s | The next scan deletes it, and a later re-ask from that run takes a new ticket at the end of the line. |
| A waiter's caller is killed while it waits | Its helper sees the caller gone within 0.1 s, removes its ticket and exits; the runs behind it move up. |
| A waiter's Perl helper gets `SIGTERM`, `SIGINT` or `SIGHUP` while it waits | It removes its ticket at once and exits; the runs behind it move up. |
| A waiter's Perl helper is killed with `SIGKILL`, leaving its ticket file | The kernel drops the helper's `flock` on the ticket, so the next scan treats the ticket as dead, skips it and deletes it. |
| A waiter is suspended (Ctrl-Z, `SIGSTOP`) while first in line | Its ticket stays live, so the line waits until it resumes, even while the lock sits free; runs behind it may give up at their limits. This is new: today a suspended waiter blocks nobody (decision `916-stopped-first-in-line-holds-the-line`). |
| A run releases the lock and asks again at once | It takes a new ticket at the end of the line. |
| `BKIT_TEST_SLOTS=N` with several slots free | Only the run first in line tries the slots; each admitted run leaves the line, and the next run is admitted within about 0.1 s, so the slots fill in arrival order. |
| `try_local_stack_lock` while runs wait in line | It returns 1 at once with a busy note that names the holders and how many runs wait in line, even when a slot is free; it takes no ticket. |
| `try_local_stack_lock` when the queue folder is missing, or a regular file sits at its path | It creates no folder and counts the line as empty, so it behaves as before and never fails because of a path it only reads. |
| A child of a live holder asks for the same lock | It reuses the parent's lock as today and takes no ticket. |
| `CI=true` / `CI=1` | Every lock stays a no-op, and no queue folder is created. |
| The queue folder cannot be created (a regular file sits at its path) or a ticket cannot be written (the folder is read-only) | `take_local_stack_lock` returns 1 and `run` exits 73, naming the queue path; `bkit tests run` maps the refusal to exit 4. |
| A copy of the script without the queue (the shipped 6.1.x copy) waits on the same lock | Mutual exclusion holds, because both copies take the same lock file; the old copy may still take the lock ahead of queued runs, and the queued runs keep their order among themselves. |
| Two waiters take tickets in the same microsecond | The helper's process id breaks the tie, so the order stays total. |
| The wall clock jumps (NTP, manual change) between two arrivals | Tickets use the system-wide monotonic clock (`CLOCK_MONOTONIC`), so a wall-clock jump does not reorder them. |
| A ticket's temporary file is left behind by a helper killed between create and rename, or an unrelated file sits in the queue folder | The scan ignores names that are neither tickets, held places nor jump markers and never deletes them, so they never block the line. |
| The human approves `bkit tests jump <run>` while that run waits 4th in line | The run becomes first in line. The holder keeps the lock until its command finishes, and then the jumped run takes it; the other waiters keep their order behind it. |
| An agent runs `bkit tests jump <run>` | Claude Code, OpenCode, Cursor and Antigravity ask the human before it runs; Codex blocks it and tells the agent to ask the human to run it in their own terminal (Open Question 11, option A). The agent cannot approve its own jump. |
| A second jump is approved while the first jumped run still waits | The newest jump goes to the front, and the earlier jumped run is second (Open Question 9, option A). |
| `bkit tests jump <run>` names a run that no waiting ticket or held place carries | It exits 1 with "no run named <run> waits for tests" and writes nothing. |
| Two waiting runs from different checkouts carry the same run name | `bkit tests jump <run>` exits 1, lists both `<who> — <checkout>` lines and writes nothing; `--checkout <path>` picks one (Open Question 10, option A). |
| A jumped run gives up (exit 75 or 81) and the same run asks again within 120 s | It keeps the front, because the jump marker matches the run's `<who> — <checkout>` line, not its ticket. |
| A jumped run takes the lock, dies while waiting, or its held place expires | The helper deletes the run's marker when it takes the lock, and the next scan deletes a marker that matches no live ticket and no held place. |
| `bkit tests jump` while the `tests` queue folder does not exist (no run waits, or `CI` is set) | It exits 1 with "no run named <run> waits for tests" and creates no folder. |
| A consumer's `scripts/ci/bkit-machine-lock.sh` is byte-identical to the shipped 6.1.0 / 6.1.1 text | `bkit upgrade` replaces it with the current template and logs one line naming the file. |
| A consumer's `scripts/ci/bkit-machine-lock.sh` is edited and has no queue | `bkit upgrade` leaves it byte for byte and warns, naming the template to merge by hand and that waiting runs take the lock out of arrival order until then. |
| A consumer's `scripts/ci/bkit-machine-lock.sh` is a symlink or sits under one | `bkit upgrade` leaves it and warns, naming the template to merge by hand. |
| A consumer's `scripts/ci/bkit-machine-lock.sh` already has the queue, or is absent | `bkit upgrade` writes nothing and prints nothing for it. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

Every lock row runs real Bash, real Perl helpers and real `flock` against the test's own `XDG_CACHE_HOME`, so the boundary under test (the kernel file lock and the queue folder) is never mocked. Ordering rows use at least five waiters that stay in line, each started only after the previous one printed its waiting note, so the arrival order is fixed and the script without the queue passes by chance at most 1 time in 120.

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
| `bkit tests run` exits 4 naming the queue folder when a regular file blocks its creation, and the gate never runs | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 2 |
| A `try` while a run waits first in line reports busy, with "1 waiting in line" in its note, and takes nothing, even when the lock is free | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| The waiting note says where the run is in line ("1st in line", "2nd in line") | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A leftover `.<n>.tmp` and an unrelated file in the queue folder neither block the line nor get deleted: five waiters run in arrival order, and both files still exist afterwards | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A stopped first-in-line waiter holds the line while the lock sits free; once it resumes, it runs first and the run behind it runs next | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A child of a live holder reuses the parent's lock and leaves no ticket in the queue folder (existing test `a runner started by the holder does not wait on its parent`, updated) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 3 |
| A waiter that gives up and asks again under the same run name within 120 s runs ahead of every run that started waiting after its first wait | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 4 |
| A held place older than 120 s is deleted by the next scan, and a re-ask from that run takes a new ticket at the end of the line | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 4 |
| A tests-lock give-up through the queued script still maps to exit 81 with `lockHolder` in `bkit tests run` (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 4 |
| `CI=true` / `CI=1` creates no queue folder (existing test `CI=%s is a no-op that creates no lock file`, kept green: it already asserts that no `<cache>/bkit` folder exists) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| bkit's adopted `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template (existing test, kept green) | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 1 |
| Upgrade replaces an adopted `scripts/ci/bkit-machine-lock.sh` byte-identical to the 6.1.1 fixture with the current template, records the same unhashed write in a dry run, and writes nothing on a second run | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade leaves an edited adopted copy without the queue byte for byte and warns, naming the template to merge by hand and "out of arrival order" | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade leaves a symlinked adopted copy unchanged and warns, naming the template to merge by hand | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| A jump marker moves its waiting run to the front of the line: the holder's command finishes first, then the marked fourth waiter runs, then the others in arrival order | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| With two jump markers, the run with the newer marker runs before the run with the older one | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| A jump marker that matches no live ticket and no held place is deleted by the next scan | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| A jumped run that gives up and asks again within 120 s keeps the front | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 7 |
| `bkit tests jump <run>` moves a real waiting run to the front of the `tests` line, and the holder's command still finishes before the jumped run's starts | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 8 |
| `bkit tests jump <run>` exits 1 and writes no marker when no waiting run carries the name | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 8 |
| `bkit tests jump <run>` exits 1, lists both checkouts and writes no marker when two waiting runs carry the name | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 8 |
| `bkit tests jump` asks the human on Claude Code, OpenCode, Cursor and Antigravity, and is denied on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 9 |
| The same verdicts hold for the path-prefixed forms (`"<root>/node_modules/.bin/bkit" tests jump`, `pnpm bkit tests jump`, `node dist/cli.js tests jump`, `pnpm tsx .bkit/core/engine/cli.ts tests jump`) | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 9 |
| `.bkit/cli.md` lists `bkit tests jump` (existing check-mode test, kept green after `pnpm cli:sync`) | Unit | `.bkit/core/engine/tools/cli-doc.test.ts` | 8 |
| concurrent first takes on a fresh cache exit 0 with no cannot-create refusal | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 11 |
| a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 12 |
| the codex hook denies bkit tests jump when .codex is a symlinked folder | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 13 |
| the codex hook denies bkit tests jump chained after another ask-tier command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 15 |

Untested edge cases: the same-microsecond tie-break and the wall-clock jump. No real-lock test can force two tickets into one microsecond or move the monotonic clock, and a planted live ticket would block the line instead of revealing the sort. Both rest on the `CLOCK_MONOTONIC` and `flock` Assumptions below.

The migration rows sit at the Integration tier because the migration reads and writes real files in a scratch consumer, like the sibling `slop plugin migration` tests in the same file. The host-approval rows sit at the Integration tier because they read the rendered host settings and run the rendered guardrails hooks, as the existing `permissions-parity` tests do. The human prompt itself is the host's own surface, and the Manual Verification steps cover it.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

No breaking change: exit codes 2 / 73 / 75, lock file paths, owner variables, the give-up line `bkit tests run` parses, and mutual exclusion with older copies all stay. The changes a caller can see:

<!-- prettier-ignore -->
| Item | Kind | Change |
| --- | --- | --- |
| `<stem>.queue/` beside each lock file (`~/.cache/bkit/machine-lock/tests.queue/`, `~/.cache/bkit/local-stack-lock/<stack>.queue/`) | New name (folder) | Holds one ticket per waiting run; created by every wait-mode take, contended or not, and never deleted. A `try` never creates it. |
| Ticket file `<monotonic seconds, 6 decimals>-<helper pid>` | New name (file) | Holds the `<who> — <checkout>` line; tests read the helper pid from the ticket name. |
| Held place `<monotonic seconds, 6 decimals>-<helper pid>.held` | New name (file) | Left by a waiter that gives up; holds the same `<who> — <checkout>` line. The line skips it, the same run takes it back within 120 s, and the next scan after 120 s deletes it (decision `916-queue-keeps-place-across-give-up`). |
| Jump marker `<wall-clock ms>.jump` | New name (file) | Written by `bkit tests jump`; holds the target run's `<who> — <checkout>` line. The live ticket whose line matches it sorts first; the newest marker wins among several. The helper deletes it when its run takes the lock, and the scan deletes it once no live ticket or held place matches it. |
| `bkit tests jump <run> [--checkout <path>]` | New name (CLI verb) | Moves one waiting run to the front of the `tests` line; never touches the holder. `use: "by-hand"`; exit 0 moved, 1 no single match, 2 usage (decision `916-jump-verb-tests-noun`; Open Question 10). |
| Shipped host permissions: `.claude/settings.json` `permissions.ask`, `opencode.json` `permission.bash`, the Cursor / Codex / Antigravity guardrails hooks | Changed behaviour | `bkit tests jump` is ask-tier on Claude Code, OpenCode, Cursor and Antigravity, and denied on Codex, which cannot prompt (Open Question 11). |
| Waiting note `⏳ <who> is waiting for <lock> (up to <N>s), <ordinal> in line: in use by …` | Changed text | Gains `, <ordinal> in line`. Nothing in bkit parses the note. |
| `try_local_stack_lock` | Changed behaviour | Returns 1 (busy) while any run waits in line, even when a slot is free; its busy note gains `; <N> waiting in line`. With nobody waiting it behaves as before. |
| Waiting runs on every lock | Changed behaviour | Take the lock in arrival order instead of at random. A waiter stopped while first in line now holds the line, even while the lock sits free (decision `916-stopped-first-in-line-holds-the-line`). |
| `.bkit/providers.md` § Long-running shell commands, rule sentence | Changed text | Says that a short-call host's re-run within 120 s keeps its place in line, so the loop still costs a re-run per minute of waiting and nothing else. |
| Consumers' `scripts/ci/bkit-machine-lock.sh` byte-identical to a shipped release without the queue | Changed file (upgrade migration) | `bkit upgrade` replaces it with the current template; an edited copy without the queue is kept and warned about. The migration gets a `docs/migrations.md` row. |
| `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` | New name (test fixture) | Follows the sibling `stack-lock-6.0.0.sh`; test-only and unshipped, so it carries no `bkit-` prefix. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 9:** Where does a second jump land while the first jumped run still waits?
  - **Options:** A) The newest jump goes to the front, and the earlier jumped run becomes second — each approval means "this run next", matching the human's latest call · B) Jumped runs keep their jump order, so a second jump lands behind the first — stable, but the second jump does not reach the front the owner asked for · C) Refuse a second jump while a jumped run still waits — no ordering rule needed, but the human must wait for the first jumped run to finish.
  - **Recommended:** A) — every jump the human approves does what it says.
  - **Default if unanswered:** A). The runbook carries A in TASK 7; choosing B flips one sort and its test, and choosing C adds a refusal test to TASK 8.
- **Open Question 10:** How does a jump name its target run?
  - **Options:** A) By the run name the waiting note prints (`<who>`), refused with both `<who> — <checkout>` lines listed when two waiting runs share it, and `--checkout <path>` picks one — readable straight from the note, at the cost of one refusal path · B) By the helper pid in the ticket name — exact, but the human must `ls` the queue folder to find it · C) By place in line (`2`) — easiest to type, but the line can move between reading it and approving the jump, so the wrong run can jump.
  - **Recommended:** A) — the human approves a name they can read in the waiting note and in the ask prompt.
  - **Default if unanswered:** A).
- **Open Question 11:** What happens on a host with no ask equivalent? Claude Code (`permissions.ask`), OpenCode (`permission.bash` `ask`), Cursor and Antigravity (the guardrails hook's ask tier) can all ask the human. Codex parses `permissionDecision: "ask"` but does not implement it, so bkit's Codex hook turns every ask-tier command into an advisory and the command runs (`.bkit/providers.md` § Codex CLI).
  - **Options:** A) Deny `bkit tests jump` on Codex, with a fix that tells the agent to ask the human to run it in their own terminal — no agent path to an unapproved jump, but the shared guardrails engine needs a "human only" verdict that the Codex driver maps to deny, inside the `bkit:start` / `bkit:end` block so `bkit upgrade` reaches consumers' drivers · B) Advisory only, as for every other ask-tier command on Codex — no new verdict, but a Codex agent can jump the line unapproved, which breaks the owner's requirement on that host · C) The verb itself refuses unless it runs on an interactive terminal and the human types the run name back — host-independent, but unverified whether each host's shell tool hands agents a terminal, and scripts cannot use the verb at all.
  - **Recommended:** A) — it is the only option that keeps "every use needs the human's approval" true on all five hosts.
  - **Default if unanswered:** A). The runbook carries A in TASK 9.
- **Assumption:** An agent re-runs a block that exited 81 within 120 s, under the same run name and checkout. → If it is wrong, the re-run's held place has expired, and the run joins the end of the line as it would with no held place.
- **Assumption:** `/usr/bin/perl` exposes the system-wide `CLOCK_MONOTONIC` through `Time::HiRes` on macOS and Linux (verified on macOS: Perl 5.34.1). → If it is missing, tickets cannot share one clock, and the helper must fall back to `Time::HiRes::time`, which a wall-clock jump can reorder.
- **Assumption:** The kernel drops a `flock` when its process dies, including on `SIGKILL`, so a ticket's lock is a reliable liveness signal with no pid-reuse risk. → If it is wrong, a dead ticket blocks the line until each waiter's limit.
- **Assumption:** `rename` within one folder keeps the open, locked file handle valid, so a ticket is locked before any other waiter can see it. → If it is wrong, another waiter could see an unlocked ticket and delete it as dead.
- **Assumption:** The cache folder sits on a local file system, as the lock already requires. → On NFS, `flock` semantics differ, and both the lock and the queue are unreliable.
- **Assumption:** Nothing parses the waiting note; only the give-up line is parsed (`testsLockHolder` and `classifyLockExit` in `.bkit/core/engine/commands/lib.ts`). → If a consumer parses the note, the added "Nth in line" text breaks that parser.
- **Assumption:** A queue scan every 0.1 s (one directory read plus one non-blocking `flock` per ticket) costs too little to matter for tens of waiters. → If it is wrong, waiting runs use measurable CPU, and the scan interval must grow.
- **Assumption:** The human approval gates the `bkit tests jump` command, not the queue folder. An agent with shell access can still write a `.jump` file into the queue folder by hand, and no host permission can stop that. → If agents do this, the line can be jumped without approval, and only a review of the agent's commands shows it; a stronger guard would need the helper to authenticate markers, which no local file permission can do for a process running as the same user.
- **Assumption:** Every form an agent uses to call the verb contains `tests jump` after `bkit`, `cli.js` or `cli.ts` (`"<root>/node_modules/.bin/bkit" tests jump`, `pnpm bkit tests jump`, `npx bkit tests jump`, `node dist/cli.js tests jump`, `pnpm tsx .bkit/core/engine/cli.ts tests jump`). → If a form slips past the ask patterns (an alias, or a script that wraps the call), the jump runs without the human's approval.
- **Assumption:** The Codex guardrails hook can tell from inside the shared engine's managed block that it runs under Codex, so the "human only" verdict denies there and asks on every other script host. → If it cannot, the Codex denial needs a change to the driver outside the managed block, which `bkit upgrade` does not refresh in consumers' copies.
- **Assumption:** The shipped 6.1.0 and 6.1.1 texts of `scripts/ci/bkit-machine-lock.sh` are the only released texts without the queue (`git show v6.1.0:` and `v6.1.1:` both hash to `63ee5873795f…`; 6.0.0 shipped no file at that path). → If a release ships before this change lands, its text joins the migration's hash list, or an unedited copy of it is warned about instead of replaced.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Ticket queue folder beside each lock file; a ticket is live while its owner holds a `flock` on it; only the first live ticket tries the slots | **Chosen** | Strict arrival order with no new dependency. Liveness rides the same kernel `flock` the lock already trusts, so a killed helper's ticket dies with it and pid reuse cannot fake a live ticket. |
| Blocking `flock` (no `LOCK_NB`) | Rejected | The issue rules it out: macOS does not promise to hand the lock over in arrival order, and a blocked call cannot check the wait limit or the caller-alive check every 0.1 s. |
| Ticket liveness by `kill 0` on the pid in the ticket name | Rejected | A recycled pid makes a dead ticket look live and blocks the line until each waiter's limit. The pid stays in the name only to break ties and for diagnostics. |
| Wall-clock arrival time (`Time::HiRes::time`) | Rejected | An NTP or manual clock change between two arrivals reorders them; `CLOCK_MONOTONIC` is system-wide and only moves forward. |
| A shared counter file (`<name>.next`) incremented under a second lock, bakery style | Rejected | Needs a second lock and a separate dead-entry sweep; a ticket file per waiter carries its own liveness and needs neither. |
| The oldest N tickets try when `BKIT_TEST_SLOTS=N` (the issue's wording) | Rejected by the owner (decision `916-queue-first-in-line-only-tries`) | The oldest N race among themselves, so a run can keep losing to newer arrivals inside that window. |
| A give-up removes the ticket, so a re-run joins the end of the line | Rejected by the owner (decision `916-queue-keeps-place-across-give-up`) | The exit-81 short-call loop of the bkit verbs would put every 60 s host behind each run that arrived during its last minute. |
| The bkit verbs pass a first-wait time the helper uses as the ticket time | Rejected by the owner (decision `916-queue-keeps-place-across-give-up`) | Needs engine state that survives re-runs and a clock Node cannot read, and lets any caller jump the line with an old time. |
| Upgrade migration that replaces unedited consumer copies of the shipped 6.1.0 / 6.1.1 text | **Chosen** by the owner (decision `916-stale-lock-copy-upgrade-report-note`) | Reaches every unedited copy in the same upgrade that ships the queue. The owner's answer is the confirmation the Migrations rule requires. |
| A `TEMPLATE_CHANGE_CONSEQUENCES` line in the upgrade report, or docs only | Rejected by the owner (decision `916-stale-lock-copy-upgrade-report-note`) | A consumer who ignores the report keeps the random order. |
| Jump by renaming the target's ticket to an earlier time | Rejected | The waiting helper keeps its own ticket name to unlink it and to find its place, so a rename under it breaks both; a marker matched by the run's `<who> — <checkout>` line leaves tickets alone and survives the held-place cycle. |
| Jump inside the lock script (`bkit-machine-lock.sh jump`) | Rejected | The script is copy-and-own, so an ask pattern would have to match every consumer's adopted path, and copies without the subcommand could not jump; one `bkit` verb gives every host one pattern to ask on. |

**Recommendation for a later phase:** the migration leaves edited copies alone, so an edited copy without the queue is the only way a run can still take the lock out of arrival order. A detect-only `bkit check` advisory (`docs/migrations.md` § Detect-only guards) that spots an adopted copy without the queue would keep naming that gap after the upgrade's one warning.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Wait estimate in the waiting note, summed from `<name>.last` | The issue says the note "can" estimate the wait; no `Derived Test Matrix` row needs it, and the owner's answer to the waiting-note question (decision `916-waiting-note-place-only-no-estimate`) declares it out, because `.last` keeps one held time per checkout, not per gate. | `docs/deferrals.jsonl` key `916-lock-wait-estimate-from-last`; a later issue once `.last` records held time per gate. |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Route raw test-runner commands through the tests lock per host | #822 — Route raw test-runner commands through the tests lock per host (OPEN); `docs/deferrals.jsonl` key `724-host-hook-catches-raw-test-runners` (TRIAGED) | Every caller of the `tests` lock; a raw runner skips the queue as it skips the lock | Keep deferred: it is its own issue, and the queue serves it unchanged once it lands. |
| Shipped gate templates pass `BKIT_TEST_WORKERS` to the runner | `docs/deferrals.jsonl` key `724-gate-templates-pass-test-workers` (OPEN) | The `tests` lock's slot and worker export in the same script | Keep deferred: no ordering surface. |
| Release-gate refusal with exit 73 instead of 75 in the history test | `docs/failures.jsonl` key `machine-lock-history-wait-returned-refusal` (OPEN) | The acquire loop and `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | Keep separate, but note it at build time: the queue rewrites the loop this failure touched, and TASK 1's 6.1.1 fixture carries the reader from before its fix, so a recurrence after the build points at the new code or at that fixture. |
| Retune `vitest.timeout-budget.ts` once the tests lock lowers local load | `docs/deferrals.jsonl` key `724-timeout-budget-and-ci-serialisation-unchanged` (OPEN) | The `tests` lock's effect on local test load | Keep deferred: the queue changes who goes next, not how many runs go at once. |
| `--lock tests.2` names the same lock file as slot 2 of the `tests` lock | Plan review (tightness lens, `OUT OF SCOPE`): name sanitising in `local_stack_lock_file` keeps `.` (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:61-63`) | The lock file paths beside which the queue folders sit | Propose a separate issue: it has nothing to do with waiter order. |
| A terminal Ctrl-C may release the lock while the gate keeps running | Plan review (regression lens, `OUT OF SCOPE`, unverified): the helper installs `$SIG{INT}` / `$SIG{HUP}` after acquiring (`scripts/ci/bkit-machine-lock.sh:254`), even when Bash started it with `SIGINT` ignored; knowledge `machine-lock-wrapper-cancellation-keeps-foreground-owner-alive` guards the `TERM` case only | The helper's signal handlers, which TASK 2 extends to the wait | Probe it first, then open an issue if it reproduces; it exists today and does not depend on the queue. |
| Detect-only `bkit check` advisory for an adopted lock copy without the queue | This plan, `Alternative Approaches & Recommendations` | The edited-copy warning of TASK 6's migration | Needs a design decision; it keeps naming an edited copy without the queue on every `bkit check`, where TASK 6 warns once per upgrade. |

## Security & Privacy

- [ ] **New API Route** — not applicable.
- [ ] **New DB Table/Column** — not applicable.
- [ ] **Role-Gated Mutation** — applicable. `bkit tests jump` reorders other runs' turn on the machine, so only the human may approve it: ask-tier on Claude Code, OpenCode, Cursor and Antigravity, denied on Codex (TASK 9). The gate covers the command, not the queue folder (Assumptions).
- [ ] **User Input** — not applicable as a handler input. The only external text the helper reads is file names in its own queue folder; the scan accepts only ticket names matching `^\d+\.\d{6}-\d+$`, held-place names matching `^\d+\.\d{6}-\d+\.held$` and jump-marker names matching `^\d+\.jump$`, so a stray file can neither break the sort nor be unlinked by the scan (TASK 3 tests it). `bkit tests jump` takes a run name and an optional checkout path from the human; it compares them only as exact strings against ticket lines, and writes the matched line, never the raw argument, into its marker.
- [ ] **PII** — not applicable. A ticket holds the same `<who> — <checkout>` text the `.holder` file already writes into the user's own cache folder; nothing is logged elsewhere.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

No new routes, DB writes or secrets. The one gated mutation is the jump above. The queue folder sits in the user's own cache folder with the default `umask`, like the lock files beside it. The migration writes only a consumer file byte-identical to a shipped bkit text, and never follows a symlink.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added. The lock stays Bash 3.2+ plus `/usr/bin/perl` core modules (`Fcntl`, `File::Glob`, `POSIX`, `Time::HiRes`), so `package.json` and `pnpm-lock.yaml` do not change.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (`pnpm outdated`) lists only dev tools behind: `vitest` 5.0.5 → 5.1.0, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. None blocks this change, which touches no runtime dependency. Toolchain: Node v24.16.0, pnpm 10.34.7, GNU Bash 5.3.20 (the script must still run under macOS `/bin/bash` 3.2), `/usr/bin/perl` 5.34.1 with `Time::HiRes::clock_gettime(CLOCK_MONOTONIC)` working.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the plan touches is readable in the worktree `/Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting`. The owner has answered the first eight questions, including the jump verb's name and reach (decision `916-jump-verb-tests-noun`); Open Questions 9 to 11 cover the rest of the priority jump, and each has a default.
- [ ] **Project Context:** read `docs/decisions.jsonl` keys `724-machine-lock-script-named-locks-no-migration`, `724-engine-runs-packaged-lock-template`, `724-tests-lock-fixed-slots-not-live-load`, `724-lock-run-exit-codes-73-75`, `724-tests-run-lock-wait-exit-81`; `docs/knowledge.jsonl` keys `machine-lock-holder-report-allows-empty-primary-slot`, `machine-lock-wrapper-cancellation-keeps-foreground-owner-alive`, `machine-lock-fifo-timeout-may-consume-partial-line`, `copied-perl-fixture-replacement-must-preserve-pid-token`; the owner's answers in decision keys `916-stale-lock-copy-upgrade-report-note` (a migration) and `916-priority-jump-human-approved` (the jump); `docs/migrations.md` § Migrations (the row shape and the `migrateSlopTypeSuppression` / `SHIPPED_CI_SCRIPT_HASHES` patterns in `.bkit/core/engine/install/modules/core.ts`); `.bkit/providers.md` § Codex CLI (Codex cannot prompt); `docs/failures.jsonl` keys `machine-lock-history-wait-returned-refusal` (OPEN) and `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts a killed tests-lock holder frees its slot within a second and the waiter starts` (CLOSED: fixed by polling both sides every 100 ms, so the queue scan must stay inside that one pass). None decides waiter order. The 6.1.1 fixture of TASK 1 carries the reader from before the partial-line fix (`git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh | grep -c _lsl_partial` prints `0`), so it can reproduce `machine-lock-fifo-timeout-may-consume-partial-line` under load; TASK 1 guards for it.
- [ ] **Testing & Quality:** every lock behaviour is tested at the Integration tier with real Bash, Perl and `flock` against a per-test `XDG_CACHE_HOME` (`docs/testing.md` § Which tier does a behaviour need?, § Tiers). The migration is tested at the Integration tier on the old shape (the 6.1.1 fixture) in a scratch consumer, and the host approval at the Integration tier against the rendered host settings and hooks.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable. No secret or new environment variable is added; the existing `LOCAL_STACK_LOCK_WAIT_S`, `BKIT_TEST_SLOTS`, `XDG_CACHE_HOME` and `CI` keep their meaning.
- [ ] **Schema State:** not applicable. bkit has no database; the queue folder is a cache folder, not a schema.
- [ ] **Architecture & UI:** the only new file is a test fixture under `tests/fixtures/machine-lock/`, where `docs/architecture.md` and `docs/testing.md` already place the 6.0.0 lock fixture. No UI.
- [ ] **Observability:** the lock's notes stay plain `[machine-lock]` stderr lines (`docs/observability.md` § prefixes: CLI stdout / stderr only). The waiting note gains the place in line, and the busy note of a `try` names the runs waiting in line. `bkit tests jump` prints one stdout line naming the run it moved, or the refusal; the migration logs one `core:` line per replaced or kept copy.
- [ ] **Notifications:** not applicable.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md`). The change adds an on-disk cache layout beside the existing lock files, which is not a schema.

### Data Schema Usage

None.

### Data Schema Changes

None. The new on-disk layout, for the record: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.queue/` for named locks and `…/bkit/local-stack-lock/<stack>.queue/` for the unnamed stack lock. Each waiter holds one ticket file named `<monotonic seconds, 6 decimals>-<helper pid>` that holds its `<who> — <checkout>` line. A waiter that gives up leaves a held place, `<same name>.held`, with the same line, until its run takes it back or it is 120 s old. `bkit tests jump` writes a jump marker, `<wall-clock ms>.jump`, holding the target run's line, until that run takes the lock or no live ticket or held place matches it. The queue folder is created by every wait-mode take and never deleted, like the lock files beside it.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Arrival-ordered ticket queue with first-in-line acquire | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rli "ticket\|fifo order\|arrival order\|wait list\|waitlist" .bkit/core/engine scripts .bkit/templates` (no queue; only Linear-ticket text in `checks/before/mcp.test.ts`); `grep -rl "flock\|openSync(.*\"wx\"\|O_EXCL" .bkit/core/engine` (`commands/workflow/locks.ts`: per-feature lock file, no waiters; `commands/workflow/ledgers.ts`: guard file); `docs/capabilities.md` (no lock-queue entry); built-ins: `flock(2)` and Perl `Fcntl` promise no arrival order; current practice: ticket / bakery locks | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` — the Perl helper's acquire loop owns every lock wait, missing any record of arrival order | EXTEND | Add ticket create / scan / remove to the existing acquire loop (lines 231-252), so every caller gains the queue with no new script. |
| Dead-ticket detection and cleanup | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Same searches; read the helper's `$caller_alive` check (lines 199-200) and its exit paths (lines 237-244) | Same file — already checks the caller every 0.1 s and exits on caller death, give-up and error | EXTEND | Hold a `flock` on the own ticket while waiting, unlink it on every exit path, and treat any ticket whose `flock` can be taken as dead. |
| A run keeps its place in line across a give-up and re-ask | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rn "LOCAL_STACK_LOCK_WHO" .bkit/core/engine/commands/workflow/tests.ts .bkit/core/engine/commands/workflow/tests-changed.ts .bkit/core/engine/commands/workflow/branches.ts` (each verb passes a run name that is stable across re-runs); read the helper's `timeout` exit path (lines 237-244) | Same file — the give-up path already knows its ticket and its `<who> — <checkout>` line | EXTEND | On give-up, rename the own ticket to `<name>.held`; on a wait-mode take, adopt a matching held place under 120 s old (decision `916-queue-keeps-place-across-give-up`). |
| Jump markers move a run to the front of the line | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rli "jump\|priority" .bkit/core/engine/commands .bkit/templates/scripts/ci/bkit-machine-lock.sh` (only unrelated "priority order" text in `commands/workflow/tests.ts` and `commands/launch.ts`); read the planned scan (TASKS 1 and 4), which already matches held places by their `<who> — <checkout>` line | Same file — the scan already sorts tickets and matches lines | EXTEND | Sort live tickets whose line matches a `.jump` marker first, newest marker first, and delete markers that match no live ticket or held place. |
| A human-run command that writes a jump marker | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "noun:\|verbs:" .bkit/core/engine/commands/registry.ts .bkit/core/engine/commands/workflow/locks.ts .bkit/core/engine/commands/workflow/tests.ts`; read `locks.ts` header (`bkit locks acquire\|release`, the per-feature workflow lock in `docs/plans/{month}/logs/{fid}/.lock`); read `testsCommand` (`run`, `changed`, `red`, `green`, `plan-check`) and `VerbUse` / `positional` in `.bkit/core/engine/commands/lib.ts` | `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts` — the noun whose `run` verb already takes the `tests` lock; `locksCommand` in `locks.ts` — a different lock (decision `916-jump-verb-tests-noun`) | EXTEND | Add a `jump` verb (`use: "by-hand"`, positional `run`, optional `--checkout`) to `testsCommand.verbs` (decision `916-jump-verb-tests-noun`). |
| Human approval for the jump on every host | `.bkit/shared/.claude/settings.json`, `.bkit/shared/.opencode/opencode.json`, `.bkit/core/hooks/guardrails-tiers.js` | `grep -rln '"ask"' .bkit/core .bkit/shared .bkit/templates` (Claude `permissions.ask`, OpenCode `permission.bash`, the guardrails engine's `ASK_PATTERNS` / `askRule` / `classifyShell`, and the Cursor, Codex and Antigravity drivers); read `.bkit/providers.md` § Codex CLI (ask is advisory there) and the `permissions-parity` describe in `.bkit/core/engine/install/modules/index.integration.test.ts` | The three shipped permission sources and the shared guardrails engine; `SHELL_GATES` in `index.integration.test.ts` checks all five hosts against one table | EXTEND | Add the jump patterns to each source, and a "human only" verdict the Codex driver maps to deny (Open Question 11, option A). |
| Migration of unedited adopted lock copies | `.bkit/core/engine/install/modules/core.ts` | `grep -n "migrateSlopTypeSuppression\|RETIRED_SLOP_PLUGIN_HASH\|SHIPPED_CI_SCRIPT_HASHES\|function runBkitDocs" .bkit/core/engine/install/modules/core.ts`; read `docs/migrations.md` § Migrations (rows "Branded CI script files", "Retired Antigravity hook drivers"); `for t in v6.0.0 v6.1.0 v6.1.1; do git show "$t:.bkit/templates/scripts/ci/bkit-machine-lock.sh" \| shasum -a 256; done` (6.0.0 has no file; 6.1.0 and 6.1.1 share `63ee5873795f…`) | `migrateSlopTypeSuppression` in `.bkit/core/engine/install/modules/core.ts` — replaces a copy byte-identical to one shipped hash and warns on an edited one, called by `runBkitDocs` | EXTEND | Add `migrateMachineLockCopy` beside it, called by `runBkitDocs`, with its own shipped-hash list (decision `916-stale-lock-copy-upgrade-report-note`). |
| Place in line in the waiting note | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Read the `⏳` note (line 248); `grep -n "is waiting for" .bkit/core/engine/commands/lib.ts` (no parser of the note; only the give-up line is parsed by `testsLockHolder`) | Same file — the note already names the budget and holders | EXTEND | Add the ordinal place ("2nd in line") computed from the same queue scan. |
| `try` never jumps the line | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Read the `try` branch (line 243) and `try_local_stack_lock` (line 337) | Same file — `try` replies `busy <holder>` | EXTEND | Reply busy when any live ticket exists, before trying a slot; name the runs waiting in line when no slot is held. |
| bkit's own adopted copy | `scripts/ci/bkit-machine-lock.sh` | `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` (identical); `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` entry `"scripts/ci/bkit-machine-lock.sh": identical` | `scripts/ci/bkit-machine-lock.sh` — the byte-identical copy | EXTEND | Copy the template over it, as the dogfood test requires. |
| A frozen copy of the script without the queue, for the mixed-version test | `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` | `ls tests/fixtures/machine-lock/` (only `stack-lock-6.0.0.sh`); `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh` (the shipped 6.1.0 / 6.1.1 text, sha256 `63ee5873795f…`) | `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` — the 6.0.0 stack-lock script, with no named locks, so it cannot wait on `tests` | NEW | Reason (b): turning the 6.0.0 fixture into the 6.1.1 script breaks its contract as the frozen 6.0.0 copy and its callers in `machine-lock.integration.test.ts` ("the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other", "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy"). |
| Lock docs | `.bkit/core/.bkit/templates.md`, `.bkit/shared/docs/testing.md`, `docs/testing.md`, `.bkit/core/.bkit/providers.md` | `grep -n "Machine lock" .bkit/core/.bkit/templates.md`; `grep -n "## Tests lock" .bkit/shared/docs/testing.md`; `diff` of each section against its mirror (`.bkit/templates.md`, `docs/testing.md`): identical; `grep -n "stack-lock-6.0.0" docs/testing.md` (the machine-lock paragraph below `bkit:end`); `grep -n "re-run per minute" .bkit/core/.bkit/providers.md` (line 858) | `.bkit/core/.bkit/templates.md` § Machine lock; `.bkit/shared/docs/testing.md` § Tests lock; the machine-lock paragraph of `docs/testing.md`; `.bkit/core/.bkit/providers.md` § Long-running shell commands | EXTEND | Describe the queue, the held place, the place-in-line note, the stopped-head rule and `try` behaviour in the sources, name the 6.1.1 fixture in `docs/testing.md`, say in § Long-running shell commands that a re-run within 120 s keeps its place, then re-render the mirrors. |
| Jump and migration docs | `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/providers.md`, `.bkit/core/.bkit/templates.md`, `.bkit/cli.md`, `docs/migrations.md` | `grep -n "## Permissions" .bkit/core/.bkit/workflows.md` (line 1426, the bucket table with the `ask` row); `grep -n "Codex cannot prompt" .bkit/core/.bkit/providers.md` (line 60); `grep -n "cli:sync" package.json` (`tsx .bkit/core/engine/tools/cli-doc.ts --write` writes the generated region of `.bkit/cli.md`); `grep -n "^\| Migration" docs/migrations.md` (the § Migrations table) | `.bkit/core/.bkit/workflows.md` § Permissions; `.bkit/core/.bkit/providers.md` § Codex CLI; `.bkit/core/.bkit/templates.md` § Machine lock; the generated region of `.bkit/cli.md`; the § Migrations table of `docs/migrations.md` | EXTEND | Add the jump's ask row and Codex denial, the jump and its approval to § Machine lock, regenerate `.bkit/cli.md`, and add the migration row. |

## Architecture & Component Changes

The ordering fix lives in the Perl helper inside `_local_stack_lock`, which every lock wait already runs through. The Bash API, exit codes, lock file paths, owner variables and the give-up line stay as they are. Around it: an upgrade migration in `runBkitDocs` replaces unedited adopted copies; `bkit tests jump` writes a jump marker the helper's scan honours; and the shipped host permissions make every jump wait for the human's approval.

Shared surfaces the build treats as high-risk: the Perl acquire loop, which every lock caller on the machine runs through; `try_local_stack_lock`, a public shell API whose result changes (busy while anyone waits); `runBkitDocs`, which every install and upgrade runs and which now writes a consumer file; and the shipped permission sources plus the shared guardrails engine, which every host's agent runs through. The existing lock suites, the `permissions-parity` suite and the planned rows cover each one.

**Ledger rows:** `916-machine-lock-ticket-queue-flock-liveness`, `916-queue-first-in-line-only-tries`, `916-queue-covers-every-lock`, `916-try-never-jumps-the-line`, `916-stale-lock-copy-upgrade-report-note`, `916-waiting-note-place-only-no-estimate`, `916-lock-wait-estimate-from-last`, `916-queue-keeps-place-across-give-up`, `916-stopped-first-in-line-holds-the-line`, `916-priority-jump-human-approved`, `916-jump-marker-matches-run-line`, `916-jump-verb-tests-noun`

### Database Migrations

None.

### Lock template (Bash + Perl)

#### [MODIFY] `.bkit/templates/scripts/ci/bkit-machine-lock.sh`

- **Existence Check:** the file exists (390 lines), byte-identical to `scripts/ci/bkit-machine-lock.sh`.
- **Queue folder (wait mode only):** the helper derives `$queue = "$stem.queue"` from the lock file it already receives (`$file`, `$stem`), and creates it with `mkdir` on every wait-mode take, contended or not, when it is absent. A failure, or a path that exists but is not a folder, replies `error cannot create $queue: $!`, which `run` maps to exit 73 through the existing `*)` reply branch, and which `bkit tests run` maps to exit 4 through `classifyLockExit` (prefix `could not take the lock for tests:`).
- **Ticket (wait mode only):** before the acquire loop, the helper opens `$queue/.$$.tmp`, takes `flock(LOCK_EX)` on it, writes `"$who — $checkout\n"`, and renames it to `$queue/<sprintf "%.6f", clock_gettime(CLOCK_MONOTONIC)>-$$`. The `flock` stays held for as long as the helper waits. A failure replies `error cannot write a ticket in $queue: $!`.
- **Held place (decision `916-queue-keeps-place-across-give-up`):** before that rename, the helper looks for a `*.held` file under 120 s old (by `mtime`) whose line equals its own `"$who — $checkout"`. When it unlinks one successfully, it renames its temp file to that held place's time with its own pid, so it takes back its old place; a second run with the same line that loses the unlink takes a new time.
- **Scan (each 0.1 s pass):** list names matching `^\d+\.\d{6}-\d+$` (tickets) and `^\d+\.\d{6}-\d+\.held$` (held places), and ignore every other name. Delete held places older than 120 s, and skip the rest: a held place never blocks the line. Sort the tickets numerically by time, then pid. For each other ticket, try `flock(LOCK_EX | LOCK_NB)`: success means its owner is gone, so unlink it and drop it; failure means it is live. The waiter's place is 1 + the live tickets ahead of its own.
- **Jump markers (TASK 7, decision `916-jump-marker-matches-run-line`):** the scan also lists names matching `^\d+\.jump$` and reads each one's line. A live ticket whose line equals a marker's line sorts before every unmarked ticket; among marked tickets, the one with the newest marker (the larger number) goes first (Open Question 9, option A). The scan deletes a marker whose line matches no live ticket and no held place. Matching by line, not by ticket name, keeps a jumped run at the front across a give-up and re-ask.
- **Constraint (failure `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts a killed tests-lock holder frees its slot within a second and the waiter starts`, CLOSED):** the scan, the slot tries and the caller check all run inside the one existing 0.1 s pass, with no second sleep and no blocking call per pass, so the `< 2000 ms` handoff assertion of that test stays green.
- **Acquire:** the slot loop (current lines 235-240) runs only when the waiter's place is 1. On success, the helper unlinks its ticket and every jump marker whose line equals its own (TASK 7), and closes its handle before writing the `.holder` file and replying `ok`, so the next run becomes first in line within one poll.
- **Give-up (`timeout`):** the helper renames its ticket to `<ticket name>.held`, keeping its time, then closes its handle and replies as today.
- **Every other exit:** caller gone (`exit 0 unless $caller_alive`), errors, and `TERM` / `INT` / `HUP` while waiting unlink the own ticket first. The wait-time `TERM` / `INT` / `HUP` handlers are installed before the acquire loop and unlink the ticket themselves; the existing post-acquire handler (`scripts/ci/bkit-machine-lock.sh:254`, which only sets `$stopping`) replaces them after acquire. A `SIGKILL` leaves the file, and the next scan removes it.
- **`try` mode:** takes no ticket and never creates the queue folder. A missing queue folder, or a path that cannot be read as a folder, counts as an empty line, so a `try` never fails because of a path it only reads. Otherwise it scans the queue first; any live ticket → reply `busy <holders>; <N> waiting in line`, where `<holders>` is the existing holder text (`another run` when no `.holder` file exists). With no live ticket it tries the slots as today, and its busy reply gains nothing.
- **Waiting note:** `[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s), <ordinal> in line: in use by <holders>`, with ordinals `1st`, `2nd`, `3rd`, `Nth` (11th-13th take `th`). The once-a-minute cadence is unchanged.
- **Unchanged:** the give-up line `❌ <who> gave up after <N>s waiting for <label>, in use by <holders>` that `testsLockHolder` parses, the `.last` history, the `.holder` files, slot files, lock order checks, nested reuse and the `CI` no-op (which returns before the helper starts, so no queue folder appears).
- **Header comment:** lines 22-36 gain one sentence each for the queue folder, arrival order, the held place and jump markers (TASKS 1, 4 and 7). TASK 3 updates line 9 (`try_local_stack_lock … # returns 1 immediately while busy`) to say a `try` is busy while runs wait in line, and line 34 (`Waiting notes name every holder and that checkout's last run.`) to say waiting notes also name the place in line.
- **Modules:** `use Time::HiRes qw(clock_gettime CLOCK_MONOTONIC);` joins the existing `Fcntl`, `File::Glob` and `POSIX` imports; all four ship with `/usr/bin/perl`.

#### [MODIFY] `scripts/ci/bkit-machine-lock.sh`

- **Existence Check:** the file exists and is bkit's adopted copy.
- Replaced with the template byte for byte by every task that changes the template (TASKS 1, 2, 3, 4 and 7), so `dogfood-templates.test.ts` stays green after each task and bkit's own gates queue in order.

### Engine (install)

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** the file exists; `runBkitDocs` (line 308) calls `migrateSlopTypeSuppression` (line 793), and `SHIPPED_CI_SCRIPT_HASHES` (line 1081) is the per-file shipped-hash pattern.
- Add `SHIPPED_MACHINE_LOCK_HASHES`, the sha256 of every released `scripts/ci/bkit-machine-lock.sh` text without the queue: today only the 6.1.0 / 6.1.1 text (`63ee5873795f…`, in full from `shasum -a 256 tests/fixtures/machine-lock/machine-lock-6.1.1.sh`). Before the build finishes, `git tag --list 'v6.*'` is checked for a later release without the queue, and its hash joins the list.
- Add `migrateMachineLockCopy(dryRun, ws, logPrefix)`, called by `runBkitDocs` beside `migrateSlopTypeSuppression` (decision `916-stale-lock-copy-upgrade-report-note`):
  - `scripts/ci/bkit-machine-lock.sh` absent, or equal to `getTemplatesRoot()/scripts/ci/bkit-machine-lock.sh` → return, silent.
  - The path is not a regular file, or sits under a symlink (`linkedPath`) → leave it and `console.warn` one `core:` line naming the file and `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to merge by hand.
  - Its sha256 is in `SHIPPED_MACHINE_LOCK_HASHES` → write the template over it (skipped in a dry run), push `{ path, action: "update", unhashed: true }` and log `core: scripts/ci/bkit-machine-lock.sh — machine lock now serves waiting runs in arrival order`.
  - Otherwise, when its text contains no `.queue` → leave it and `console.warn` one `core:` line naming the template to merge by hand and that waiting runs take the lock out of arrival order until then. An edited copy that already has the queue is silent, so a merged copy is not warned about on every upgrade.
- `pnpm build` refreshes `dist/` in the same commit.

#### [MODIFY] `docs/migrations.md`

- **Existence Check:** the file exists; § Migrations holds the `| Migration | Where | What it rewrites | Releases | Test |` table.
- Add the row "Machine-lock copies without the queue": Where `.bkit/core/engine/install/modules/core.ts` (`migrateMachineLockCopy`, `SHIPPED_MACHINE_LOCK_HASHES`, called by `runBkitDocs`); What it rewrites as the four cases above; Releases `6.1.0-6.1.x`; Test `.bkit/core/engine/install/modules/core.integration.test.ts`.

### Engine (commands)

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists (2610 lines); `testsCommand` (line 1622) has the verbs `changed`, `run`, `red`, `green` and `plan-check`.
- Add the verb `jump` (decision `916-jump-verb-tests-noun`; Open Question 10, option A): `use: "by-hand"`, a required positional `run` and an optional `--checkout <path>`. Its summary says that it moves one waiting run to the front of the `tests` line, that it never takes the lock from the holder, and that each use needs the human's approval.
- Behaviour: read `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue/` without creating it; collect the distinct `<who> — <checkout>` lines of tickets and held places whose `<who>` equals `run` (and whose checkout equals `--checkout`, when given).
  - Exactly one line → write `<Date.now()>.jump` holding that line through a temp file plus rename, print `moved <who> — <checkout> to the front of the tests line; it takes the lock when the holder releases it`, exit 0.
  - No line, or no queue folder → print `no run named <run> waits for tests`, write nothing, exit 1 (`EXIT.NO`).
  - Two or more lines → print each line and `pass --checkout <path> to pick one`, write nothing, exit 1.
- It never reads or writes the lock file, the `.holder` files or the slot files.
- `pnpm cli:sync` regenerates `.bkit/cli.md`; `pnpm build` refreshes `dist/` in the same commit.

### Host permissions

#### [MODIFY] `.bkit/shared/.claude/settings.json`

- **Existence Check:** the file exists; `permissions.ask` holds the destructive-git and publish patterns.
- Add `Bash(*bkit tests jump*)`, `Bash(*cli.js tests jump*)` and `Bash(*cli.ts tests jump*)` to `permissions.ask`.

#### [MODIFY] `.bkit/shared/.opencode/opencode.json`

- **Existence Check:** the file exists; `permission.bash` maps globs to `ask`, last match wins.
- Add `"*bkit tests jump*": "ask"`, `"*cli.js tests jump*": "ask"` and `"*cli.ts tests jump*": "ask"` after every broader `allow` glob, so a later allow cannot override them.

#### [MODIFY] `.bkit/core/hooks/guardrails-tiers.js`

- **Existence Check:** the file exists; `ASK_PATTERNS`, `askRule` and `classifyShell` sit inside the managed block that `bkit install` renders into the Cursor, Codex and Antigravity guardrails hooks.
- Add `{ re: /\b(?:bkit|cli\.[jt]s)\s+tests\s+jump\b/, what: "bkit tests jump" }`, so Cursor and Antigravity ask.
- Add the "human only" verdict (Open Question 11, option A): under the Codex hook, `classifyShell` returns `{ tier: "deny", what: "bkit tests jump", fix: "Ask the human to run this bkit tests jump command in their own terminal; Codex cannot ask for approval." }` for the jump; every other host keeps `ask`. The host check lives inside the managed block, so `bkit upgrade` reaches consumers' drivers, which stay unchanged.

### Tests

#### [MODIFY] `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

- **Existence Check:** the file exists (1025 lines) with the `running`, `waitForOutput`, `commandRun`, `slotHolder` and `envFor` helpers.
- A new `describe("machine lock waiting order", …)` block with the twenty-one new tests the runbook names (TASKS 1 to 4 and 7), plus a helper that plants a jump marker for a run's line, a small helper that starts a waiter recording its name to an order file and waits for its `waiting` note before the next one starts, a helper that reads the helper pid from a waiter's ticket name, and a helper that finds a run's held place.
- The existing test `a runner started by the holder does not wait on its parent` gains an assertion that the queue folder holds no ticket (TASK 3).

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

- **Existence Check:** the file exists, with `tests run with an unwritable lock dir exits 4 naming the path` (line 425) as the sibling pattern.
- One new test: a regular file at `tests.queue` makes `bkit tests run` exit 4 naming the queue folder (TASK 2).
- Three new `bkit tests jump` tests against real waiters on the `tests` lock (TASK 8).

#### [MODIFY] `.bkit/core/engine/install/modules/core.integration.test.ts`

- **Existence Check:** the file exists; `describe("slop plugin migration", …)` (line 98) is the sibling pattern, with `seed` and `migrate` helpers around `runBkitDocs`.
- A new `describe("machine-lock copy migration", …)` block with the three tests of TASK 6, reading `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` as the old shape.

#### [MODIFY] `.bkit/core/engine/install/modules/index.integration.test.ts`

- **Existence Check:** the file exists; `describe("permissions-parity", …)` (line 489) holds `SHELL_GATES` and the per-host verdict helpers (`claudeShellVerdict`, `opencodeVerdict`, `cursorVerdict`, `codexVerdict`, `antigravityShellVerdict`).
- Two new tests of TASK 9 that expect `ask` on four hosts and `deny` on Codex, so the jump stays out of `SHELL_GATES`, whose rows expect one verdict on all five hosts. The file's header comment names the jump as Codex's second structural exception.

#### [new] `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`

- **Reuse Check:** `Reuse Inventory` row "A frozen copy of the script without the queue", reason (b).
- The exact output of `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh`, so its sha256 starts `63ee5873795f`. Test-only; `package.json` `files` lists no `tests/` path, so it never ships.
- It is test input: the group's tests step writes it together with the TASK 1 tests, so the mixed-version test's red shows the order fault, not a missing file.
- It carries the reply reader from before the partial-line fix (no `_lsl_partial`), so under load it can turn a fragmented `ok` into `k` and then wait on its own acquired holder (knowledge `machine-lock-fifo-timeout-may-consume-partial-line`, failure `machine-lock-history-wait-returned-refusal`). The test that runs it guards for this (TASK 1).
- It is also the old shape the migration tests of TASK 6 seed into a scratch consumer.

### Docs

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** the file exists; § Machine lock starts at line 925 and matches its mirror `.bkit/templates.md`.
- Add the queue folder, arrival order, the held place across a give-up, the place-in-line note, the `try` rule and the stopped-head rule (a waiter stopped while first in line holds the line; `ls` the queue folder to see who is first) to § Machine lock; the mirror re-renders through `pnpm tsx .bkit/core/engine/cli.ts upgrade`.
- Add `bkit tests jump <run>` to § Machine lock (TASK 10): what it moves, that the holder keeps the lock, that the newest jump goes first, that each use needs the human's approval (denied on Codex), and that the upgrade migration replaces an unedited 6.1.x copy.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Permissions (`.claude/settings.json`) (line 1426) holds the bucket table whose `ask` row lists the shipped ask patterns.
- Add the three `tests jump` patterns to the `ask` row (TASK 10); the mirror `.bkit/workflows.md` re-renders.

#### [MODIFY] `.bkit/cli.md`

- **Existence Check:** the file exists; its generated region lists every `bkit <noun> <verb>`.
- Regenerated by `pnpm cli:sync` in TASK 8, so it lists `bkit tests jump`; no hand edit.

#### [MODIFY] `.bkit/shared/docs/testing.md`

- **Existence Check:** the file exists; § Tests lock (line 317) matches `docs/testing.md`.
- Reword the last bullet so waiting notes name the place in line and waiting runs take the lock in arrival order; the mirror `docs/testing.md` re-renders.
- Add one bullet (TASK 10): the human can move a waiting gate to the front with `bkit tests jump <run>`, and every use needs their approval.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; the machine-lock paragraph sits at line 709, below `bkit:end`, so it is edited directly.
- Name `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` beside the 6.0.0 fixture as the frozen copy without the queue.

#### [MODIFY] `.bkit/core/.bkit/providers.md`

- **Existence Check:** the file exists; § Long-running shell commands' rule sentence (line 858) ends "which costs a re-run per minute of waiting and nothing else", and matches its mirror `.bkit/providers.md`.
- Add that a re-run within 120 s keeps its place in line (decision `916-queue-keeps-place-across-give-up`), so that sentence stays true; the mirror re-renders.
- In § Codex CLI, the "Codex cannot prompt" note (line 60) gains that `bkit tests jump` is denied on Codex instead of advised, because each use needs the human's approval (TASK 10).

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. The acquire loop, `runBkitDocs`, `testsCommand` and the host permission sources are extended in place; no file, function or export is replaced, and the frozen 6.1.1 fixture is a new test input, not a replacement. The migration replaces consumers' unedited 6.1.x copies with the current template, which is a migration, not a supersession of a bkit artifact.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/templates.md` § Machine lock (source of `.bkit/templates.md`) | Add: waiting runs take the lock in arrival order through `<name>.queue/`; a dead waiter's ticket is skipped; a run that gives up keeps a held place for 120 s; waiting notes name the place in line; `try` reports busy while runs wait in line; a waiter stopped while first in line holds the line, and `ls` of the queue folder shows who is first. |
| `.bkit/core/.bkit/providers.md` § Long-running shell commands (source of `.bkit/providers.md`) | The rule sentence says a short-call host's re-run within 120 s keeps its place in line. |
| `.bkit/shared/docs/testing.md` § Tests lock (source of `docs/testing.md`'s managed block) | Reword the last bullet: waiting runs take the lock in arrival order, and waiting notes name the place in line, the holders and their checkouts' earlier run times. Add to the re-run bullet that a re-run on exit 81 within 120 s keeps its place in line. |
| `docs/testing.md` (below `bkit:end`, the machine-lock paragraph at line 709) | Name `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` as the frozen 6.1.1 copy without the queue. |
| `.bkit/templates/scripts/ci/bkit-machine-lock.sh` header comment | One sentence each for the queue folder, arrival order, the held place and jump markers; line 9 says a `try` is busy while runs wait in line; line 34 says waiting notes name the place in line. |
| `.bkit/core/.bkit/templates.md` § Machine lock, again for the jump (TASK 10) | Add `bkit tests jump <run>`: it moves one waiting run to the front of the `tests` line, the holder keeps the lock, the newest jump goes first, each use needs the human's approval (denied on Codex), and the upgrade migration replaces an unedited 6.1.x copy. |
| `.bkit/core/.bkit/workflows.md` § Permissions (source of `.bkit/workflows.md`) | The `ask` row lists the three `tests jump` patterns. |
| `.bkit/core/.bkit/providers.md` § Codex CLI | The "Codex cannot prompt" note says `bkit tests jump` is denied on Codex instead of advised. |
| `.bkit/shared/docs/testing.md` § Tests lock, again for the jump (TASK 10) | One bullet: the human can move a waiting gate to the front with `bkit tests jump <run>`, and every use needs their approval. |
| `.bkit/cli.md` | Regenerated by `pnpm cli:sync` with the `bkit tests jump` verb (TASK 8). |
| `docs/decisions.jsonl` | Eleven decision keys written for this plan (the `**Ledger rows:**` line, less the one deferral key). |
| `docs/deferrals.jsonl` | One `Exempt` row for the wait estimate (`Out of Scope`). |
| `docs/knowledge.jsonl` | No change at plan time; the build adds a row only if it meets a new trap. |
| `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no new component kind, library, schema, UI or log prefix. |
| `docs/migrations.md` § Migrations | One row, "Machine-lock copies without the queue" (TASK 6). |
| `CHANGELOG.md` | No change in this plan; the release writes its `## [X.Y.Z]` block. |

## Rollback Strategy

Code-only — `git revert` sufficient for bkit. A release that shipped the migration has already rewritten unedited consumer copies; reverting bkit does not restore them, and needs none, because a migrated copy excludes older copies on the same lock file.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit has no database. |
| **Code** | `git revert {COMMIT}` of the build's commits | A reverted script ignores any `*.queue/` folder left in the cache, jump markers included; the folders hold only dead tickets once their waiters exit, and `rm -rf ~/.cache/bkit/machine-lock/*.queue ~/.cache/bkit/local-stack-lock/*.queue` clears them. The reverted settings and hooks drop the `tests jump` ask patterns along with the verb. |
| **Consumer copies** | None | A consumer copy the migration replaced keeps the queue after a bkit revert; a consumer who wants the old text re-copies it from the reverted `.bkit/templates/`. |
| **Risk window** | None | Copies with and without the queue exclude each other on the same lock file, so a machine running both versions during a rollback keeps one holder at a time. |

## Agent Execution Runbook

Build order: the lock template and its tests first (queue and order, then dead tickets and errors, then `try` and the note, then the held place), then the docs that describe it, then the upgrade migration of adopted copies, then the priority jump (the helper's markers, then the `bkit tests jump` verb, then the host approval, then its docs). One PR for all ten tasks is fine.

Group 3 carries the owner's answer on the jump verb (decision `916-jump-verb-tests-noun`) and the defaults of Open Questions 9 to 11. A different answer to Questions 9 to 11 changes the tasks those questions name before Group 3 is built.

Test-writing notes for every ordering test in Group 1:

- Each waiter runs through `running(…)` with its own `LOCAL_STACK_LOCK_WAIT_S` (30 s unless the test says otherwise), and its command appends its name to an order file in `tmp`, then sleeps briefly before releasing.
- Start each waiter only after the previous one printed `waiting` (`waitForOutput`), so the arrival order is fixed.
- Use at least five waiters that stay in line, so the script without the queue passes by chance at most 1 time in 120.
- Read a waiter's helper pid from its ticket name in `<cache>/bkit/machine-lock/tests.queue/` (or the stack lock's queue folder), and throw "no ticket for <name>" when it is missing.
- Find a run's held place in the same folder by its `<who> — <checkout>` line, and throw "no held place for <name>" when it is missing.
- The group's tests step writes `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` as test input, together with the TASK 1 tests, so the mixed-version test's red shows the order fault, not a missing file.
- The 6.1.1 fixture carries the reply reader from before the partial-line fix, so the mixed-version test spawns its old-copy waiter with its own timeout and SIGKILLs that waiter's process group, Perl helper included, in cleanup. When the old-copy waiter hangs, the test fails with a message that names the known pre-fix reader (knowledge `machine-lock-fifo-timeout-may-consume-partial-line`, failure `machine-lock-history-wait-returned-refusal`), not a generic timeout. Never retry it for luck.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Arrival-ordered queue in the lock template

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add the ticket queue and first-in-line acquire to the Perl helper, and prove it beside a 6.1.1 copy without it
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

- [x] **TASK 2:** Clean up dead tickets and refuse with the queue path when the queue cannot be used
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

- [x] **TASK 3:** Keep `try` behind the line, ignore stray files, and name the place in line in the waiting note
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

- [x] **TASK 4:** Keep a run's place in line across a give-up and re-ask
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

- [x] **TASK 5:** Document the queue in the lock docs and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock names the `<name>.queue/` folder, arrival order, dead-ticket skipping, the held place across a give-up, the place-in-line note, the `try` rule, and that a waiter stopped while first in line holds the line (`ls` the queue folder to see who is first)
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock's last bullet says waiting runs take the lock in arrival order and waiting notes name the place in line; its re-run bullet says a re-run on exit 81 within 120 s keeps its place in line
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Long-running shell commands' rule sentence (line 858) says a short-call host's re-run within 120 s keeps its place in line
  - **UPDATE:** `docs/testing.md`: the machine-lock paragraph below `bkit:end` (line 709) names `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/templates.md`, `.bkit/providers.md` and the managed block of `docs/testing.md`, so `diff <(sed -n '/^## Machine lock/,/^## /p' .bkit/core/.bkit/templates.md) <(sed -n '/^## Machine lock/,/^## /p' .bkit/templates.md)` prints nothing, the same holds for § Tests lock in `.bkit/shared/docs/testing.md` against `docs/testing.md` and for § Long-running shell commands in `.bkit/core/.bkit/providers.md` against `.bkit/providers.md`, and after `pnpm build`, `node dist/cli.js check` reports no drift
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Upgrade migration replaces unedited adopted lock copies

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Replace consumers' unedited 6.1.x copies of `scripts/ci/bkit-machine-lock.sh` with the queued template on upgrade
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

<!-- bkit:group 2 end -->

Test-writing notes for Group 3:

- The lock-script tests of TASK 7 plant a jump marker as `<cache>/bkit/machine-lock/tests.queue/<number>.jump` holding the target waiter's `<who> — <checkout>` line, with a larger number for a newer marker. They follow the Group 1 notes for waiters and order files.
- The verb tests of TASK 8 start real waiters through the lock script with the test's own `XDG_CACHE_HOME`, run `bkit tests jump` with the same `XDG_CACHE_HOME`, and read the order file; they never write a marker by hand.
- The host tests of TASK 9 use the existing per-host verdict helpers in `permissions-parity`, so each host is judged by its own rendered settings or hook.

<!-- bkit:group 3 start -->

### TASK GROUP 3: A human-approved jump to the front of the tests line

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Sort a jumped run first in the Perl helper's scan
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the scan lists `^\d+\.jump$` markers and reads their lines; a live ticket whose line equals a marker's line sorts before every unmarked ticket, newest marker first; the scan deletes a marker whose line matches no live ticket and no held place; the helper deletes the markers matching its own line when it takes the lock
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment (lines 22-36) names jump markers
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: copied from the template byte for byte
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the four tests below in the `machine lock waiting order` block, and the marker-planting helper
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** the four tests below pass; the whole of `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs`, `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker moves its waiting run to the front of the line` fails on the marked fourth waiter running after the three waiters ahead of it
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the newest jump marker goes first` fails on the run with the older marker running before the run with the newer one
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker that matches no waiting run is deleted` fails on the marker file still existing after the waiters' next scan
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jumped run that gives up and asks again within 120 s keeps the front` fails on the re-asking jumped run running after an unmarked waiter

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Add `bkit tests jump <run>`, which writes the jump marker for one waiting run
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: a `jump` verb (`use: "by-hand"`, positional `run`, optional `--checkout`) that reads the `tests` queue folder without creating it, finds the distinct `<who> — <checkout>` lines of tickets and held places carrying the run name, and on exactly one match writes `<Date.now()>.jump` with that line through a temp file plus rename and exits 0; on no match or no folder it prints "no run named <run> waits for tests" and exits 1; on several matches it lists them, prints "pass --checkout <path> to pick one" and exits 1; it never touches the lock, `.holder` or slot files
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the three tests below
  - **UPDATE:** `.bkit/cli.md`: regenerated by `pnpm cli:sync`
  - **READ:** `VerbSpec` in `.bkit/core/engine/commands/lib.ts`: the verb shape, `use` and output keys
  - **READ:** `FlagSpec` in `.bkit/core/engine/commands/lib.ts`: the `positional` flag that takes the bare `run` argument
  - **READ:** `EXIT` in `.bkit/core/engine/commands/lib.ts`: exit 0 moved, 1 refused, 2 usage
  - **READ:** `testsChangedVerb` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: a sibling `bkit tests` verb
  - **DEPENDS ON:** 7
  - **DONE WHEN:** the three tests below pass; the whole of `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests.test.ts` and `.bkit/core/engine/tools/cli-doc.test.ts` pass; `.bkit/cli.md` lists `bkit tests jump`; `pnpm build` has refreshed `dist/` and `dist/` is staged with the change; `node dist/cli.js tests jump --help` prints a summary that says each use needs the human's approval
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump moves a waiting run to the front of the tests line` fails on the jumped waiter running after the waiters ahead of it, or before the holder's command finished
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name no waiting run carries` fails on the verb not printing "no run named" and exiting 1 with no marker in `tests.queue`
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name two waiting runs share` fails on the verb not listing both checkouts with "pass --checkout" and exiting 1 with no marker in `tests.queue`

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Make every `bkit tests jump` wait for the human's approval on all five hosts
  - **UPDATE:** `.bkit/shared/.claude/settings.json`: `permissions.ask` gains `Bash(*bkit tests jump*)`, `Bash(*cli.js tests jump*)` and `Bash(*cli.ts tests jump*)`
  - **UPDATE:** `.bkit/shared/.opencode/opencode.json`: `permission.bash` gains the same three globs as `ask`, after every broader `allow` glob
  - **UPDATE:** `ASK_PATTERNS` in `.bkit/core/hooks/guardrails-tiers.js`: `{ re: /\b(?:bkit|cli\.[jt]s)\s+tests\s+jump\b/, what: "bkit tests jump" }`, so Cursor and Antigravity ask
  - **UPDATE:** `classifyShell` in `.bkit/core/hooks/guardrails-tiers.js`: under the Codex hook, the jump returns `{ tier: "deny", what, fix }` with a fix that tells the agent to ask the human to run it in their own terminal (Open Question 11, option A); the host check stays inside the managed block, and the drivers stay unchanged
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: the two tests below in `permissions-parity`, and the header comment's list of Codex's structural exceptions
  - **READ:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: how the Codex driver maps `deny` and `ask`
  - **READ:** `.bkit/core/.bkit/providers.md`: § Codex CLI, why Codex cannot ask
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the two tests below pass; the whole of `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/opencode.integration.test.ts`, `.bkit/core/engine/install/modules/antigravity.test.ts` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass; every existing `SHELL_GATES` row keeps its verdict on all five hosts
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex` fails on a host returning allow for `bkit tests jump build-1`
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `path-prefixed bkit tests jump forms get the same verdicts on every host` fails on a host returning allow for `"/repo/node_modules/.bin/bkit" tests jump build-1`, `pnpm bkit tests jump build-1`, `node dist/cli.js tests jump build-1` or `pnpm tsx .bkit/core/engine/cli.ts tests jump build-1`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Document the jump and its approval, and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock names `bkit tests jump <run>`, that the holder keeps the lock, that the newest jump goes first, that each use needs the human's approval (denied on Codex), and that the upgrade migration replaces an unedited 6.1.x copy
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Permissions' `ask` row lists the three `tests jump` patterns
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Codex CLI's "Codex cannot prompt" note says `bkit tests jump` is denied on Codex instead of advised
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock gains one bullet saying the human can move a waiting gate to the front with `bkit tests jump <run>`, and every use needs their approval
  - **DEPENDS ON:** 5, 6, 9
  - **DONE WHEN:** `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/providers.md`, the managed block of `docs/testing.md`, `.claude/settings.json`, `.opencode/opencode.json`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`; `diff <(sed -n '/^## Machine lock/,/^## /p' .bkit/core/.bkit/templates.md) <(sed -n '/^## Machine lock/,/^## /p' .bkit/templates.md)` prints nothing, and the same holds for § Permissions in `.bkit/core/.bkit/workflows.md` against `.bkit/workflows.md`, § Codex CLI in `.bkit/core/.bkit/providers.md` against `.bkit/providers.md` and § Tests lock in `.bkit/shared/docs/testing.md` against `docs/testing.md`; `grep -c "tests jump" .claude/settings.json` prints 3; after `pnpm build`, `node dist/cli.js check` reports no drift
  - **TEST FIRST:** n/a — docs and re-rendered mirrors only, no behaviour change

<!-- bkit:task 10 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 1 findings

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Two runs that take a lock at once on a fresh cache race to create `<name>.queue/`, and the loser exits 73 with "cannot create …: File exists"
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:301` · **Round:** 1
  - **DONE WHEN:** the helper treats the queue folder as usable when `mkdir` fails because another helper created it first (for example `mkdir($queue) || -d $queue`, checked after the `mkdir`, not before it), so concurrent first takes never reply `error cannot create`; a regular file at the path still replies `error cannot create $queue` and `run` still exits 73; `scripts/ci/bkit-machine-lock.sh` is copied from the template byte for byte. Reproduced on this diff: 8 concurrent `run --lock tests -- true` per fresh `XDG_CACHE_HOME`, 20 rounds, 1 round had an exit 73 with `could not take the lock for tests: cannot create …/tests.queue: File exists`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` fails on at least one of 16 concurrent `run --lock tests` takes, repeated over 50 fresh `XDG_CACHE_HOME` folders, exiting 73 with "cannot create" and "File exists" in its stderr (a stress test: the race fired in 1 of 20 rounds at 8 concurrent takes, so the round and take counts must stay high enough that the current code fails it)
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` fails on a concurrent first take exiting 73 with "cannot create" and "File exists" — the race is timing-dependent, so against the unfixed script the test fails only about 1 run in 3; the fix is a one-line `mkdir || -d`, the test passes on all 50 fresh caches with it, and an intermittent guard is accepted over none (reason worded by Claude at the owner's request) (owner, 2026-11-12)

<!-- bkit:task 11 end -->
<!-- bkit:task 12 start -->

- [x] **TASK 12:** A waiter started under `nohup` (or as a background job, which ignores SIGINT) now dies on SIGHUP / SIGINT while it waits, so its run exits 73 instead of waiting its turn
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:242` · **Round:** 1
  - **DONE WHEN:** the wait-time handler is installed only for a signal whose inherited disposition is not `IGNORE` (Perl shows an inherited ignore as `$SIG{HUP} eq "IGNORE"`), so a helper whose caller ignores SIGHUP or SIGINT keeps waiting as the 6.1.1 copy does; TERM, and HUP / INT when not ignored, still unlink the ticket and exit; `scripts/ci/bkit-machine-lock.sh` is copied from the template byte for byte. Reproduced on this diff: holder on `tests`, `nohup bash bkit-machine-lock.sh run W --lock tests -- echo W-ran`, `kill -HUP <helper pid>` → `could not take the lock for tests: the perl process holding it stopped before it answered`, exit 73; the same steps against `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` print `W-ran` and exit 0. The plan's Out of Scope row names the same flaw in the post-acquire handler (`scripts/ci/bkit-machine-lock.sh:254` before this diff); this diff copies it into the wait.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP` fails on the waiter, started as `bash -c "trap '' HUP; exec bash <script> run w1 --lock tests -- …"` behind a holder, exiting 73 with "stopped before it answered" after `process.kill(ticketPid(queueOf("tests"), "w1"), "SIGHUP")`, instead of running its command once the holder releases

<!-- bkit:task 12 end -->
<!-- bkit:task 13 start -->

- [x] **TASK 13:** A Codex user whose `.codex` folder is a symlink gets `bkit tests jump` as an advisory, so a Codex agent jumps the line with no human approval
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-tiers.js:181` · **Round:** 1
  - **DONE WHEN:** the Codex check also tests the path the hook was invoked by (`process.argv[1]`, which Node makes absolute but does not resolve through symlinks), not only `__filename`, which Node resolves to the real path; a Codex hook reached through a symlinked `.codex` folder denies `bkit tests jump`, and the Cursor and Antigravity hooks still ask; the rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` are re-rendered. Reproduced on this diff: the rendered Codex hook copied to `dotfiles/codex-config/hooks/` with `repo/.codex -> dotfiles/codex-config`, run as `node .codex/hooks/bkit-guardrails.cjs` from `repo/` with a `bkit tests jump build-1` payload, returns `additionalContext` ("ran without confirmation") instead of `permissionDecision: "deny"`; the same file under a real `.codex/hooks/` denies.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump when .codex is a symlinked folder` fails on the rendered Codex hook, run through a `.codex` symlink to a folder whose real path has no `.codex/hooks/`, returning an advisory (`codexVerdict` "ask") instead of "deny"

<!-- bkit:task 13 end -->
<!-- bkit:task 14 start -->

- [x] **TASK 14:** TASK 11's race test counts the normal "in line" waiting note as a refusal, so it fails with the fix in place and proves nothing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` · **Round:** 1
  - **DONE WHEN:** the test `runs that take a lock at once on a fresh cache never refuse over the queue folder` is replaced by `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`, which counts a take as refused only when it exits non-zero or its stderr has "cannot create" or "File exists", and never counts the "⏳ … in line" waiting note; it starts 16 concurrent `run --lock tests -- true` takes per fresh `XDG_CACHE_HOME`, forked from one shell so they start together, over 50 fresh folders; it passes with TASK 11's `mkdir($queue) || -d $queue` fix and fails on the group's start commit `e929f8d63`, which has no such fix.
  - **TEST FIRST:** n/a — test-only repair of the test TASK 11 plans (its Derived Test Matrix row maps to TASK 11); no product behaviour changes

<!-- bkit:task 14 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Challenge round 2 findings

<!-- bkit:task 15 start -->

- [x] **TASK 15:** A Codex agent chains another ask-tier command before `bkit tests jump` (`gh pr close 999999; bkit tests jump build-1`), so the hook sees only the first ask match, turns it into an advisory, and the jump runs with no human approval
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-tiers.js:291` · **Round:** 2
  - **DONE WHEN:** under the Codex hook, `classifyShell` denies any command whose text matches the jump pattern, whatever other ask-tier pattern (git ask rules, `sudo`, `brew install`, `gh pr close`, package publish) matches first, for example by testing the jump pattern on its own before `askRule`'s first-hit result is used; Cursor and Antigravity still ask for those compound commands; the rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` are re-rendered. Reproduced on this diff: piping `{"tool_name":"Bash","tool_input":{"command":"gh pr close 999999; bkit tests jump build-1"}}` into `node .codex/hooks/bkit-guardrails.cjs` returns `additionalContext` "(gh pr close) ran without confirmation" instead of `permissionDecision: "deny"`; the same holds for `sudo -n true; bkit tests jump build-1`. The cause is `askRule` (`guardrails-tiers.js:191-199`), which returns the first ASK_PATTERNS hit, and the jump pattern sits last in the array.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump chained after another ask-tier command` fails on `codexVerdict("gh pr close 999999; bkit tests jump build-1")` and `codexVerdict("sudo -n true; bkit tests jump build-1")` returning "ask" instead of "deny"

<!-- bkit:task 15 end -->
<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the `[machine-lock]` notes read as `Architecture & Component Changes` describes, and the give-up line is unchanged.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared `bkit:gate:*` script) and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** no E2E suite exists in bkit; the existing lock suites (`machine-lock.integration.test.ts`, `tests-lock.integration.test.ts`, `branches-lock.integration.test.ts`, `vitest-test-lock.integration.test.ts`, `test-file-script.integration.test.ts`, `install/modules/core.integration.test.ts`, `scripts/ci/bkit-test-awake.test.mjs` and its template twin) run unchanged against the queued script, apart from the one updated nested-reuse test.
- [ ] **Build Configuration:** the new fixture lives under `tests/`, which `package.json` `files` does not ship; `pnpm pack --dry-run` lists no `tests/fixtures/machine-lock/` path.
- [ ] **Integration (`.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`):** the twenty-one new ordering, cleanup, error, `try`, note, stray-file, stopped-head, held-place, mixed-version and jump-marker tests and the updated nested-reuse test pass, each in its own `XDG_CACHE_HOME`, and leave no child process alive (`afterEach` kills them, the old-copy waiter's process group included).
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`):** the new queue-folder exit-4 test and the three `bkit tests jump` tests pass.
- [ ] **Integration (`.bkit/core/engine/install/modules/core.integration.test.ts`):** the three machine-lock migration tests pass.
- [ ] **Integration (`.bkit/core/engine/install/modules/index.integration.test.ts`):** the two `bkit tests jump` host-approval tests pass, and every existing `SHELL_GATES` row keeps its verdict.
- [ ] **Dogfood upgrade migration:** `pnpm build`, then in a fresh scratch consumer whose adopted `scripts/ci/bkit-machine-lock.sh` is the 6.1.1 fixture, `node <bkit>/dist/cli.js upgrade` logs the `core: scripts/ci/bkit-machine-lock.sh` line and leaves the copy byte-identical to `.bkit/templates/scripts/ci/bkit-machine-lock.sh`; a second `upgrade` prints nothing for it; with an edited 6.1.1 copy instead, the copy is left byte for byte and the warning names "out of arrival order".
- [ ] **Dogfood host settings:** in the same scratch consumer installed with `--claude --opencode=<provider> --cursor --codex --antigravity`, `.claude/settings.json` `permissions.ask` and `.opencode/opencode.json` `permission.bash` list the three `tests jump` patterns, and the rendered Codex guardrails hook denies `bkit tests jump build-1` when fed a Codex `PreToolUse` payload.
- [ ] **Apply local migrations:** not applicable; bkit has no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In four terminals with no `CI` set, run the issue's steps to reproduce: the holder `bash scripts/ci/bkit-machine-lock.sh run holder --lock tests -- sleep 30`, then `LOCAL_STACK_LOCK_WAIT_S=600 bash scripts/ci/bkit-machine-lock.sh run A --lock tests -- sleep 5`, then B and C a few seconds apart. A, B and C say `1st in line`, `2nd in line` and `3rd in line`, and their commands run in that order. Repeat three times.
- [ ] **Step 2:** While the waiters wait, `ls ~/.cache/bkit/machine-lock/tests.queue/` shows three tickets; press Ctrl-C in B's terminal, and B's ticket is gone within a second while C moves up to `2nd in line` on its next note.
- [ ] **Step 3:** `pnpm build`, then in a fresh scratch consumer whose `scripts/ci/bkit-machine-lock.sh` is the 6.1.1 text, run `node <bkit>/dist/cli.js upgrade`, read the `core: scripts/ci/bkit-machine-lock.sh` line, and check that `grep -c '\.queue' scripts/ci/bkit-machine-lock.sh` now prints a number above 0.
- [ ] **Step 4:** Repeat Step 1 with five waiters A to E. While they wait, ask a Claude Code agent to run `bkit tests jump D`: Claude Code asks you before it runs; approve it. When the holder finishes, D runs first, then A, B, C and E. Ask the agent again for `bkit tests jump E` and decline: nothing moves.
