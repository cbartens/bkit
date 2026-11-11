<!-- bkit:anchor
baseSha: f6914f3c9c88e68faa4b8806406c0d562d2d6c7c
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Machine Lock Waiters Served in Arrival Order Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

The machine lock (`.bkit/templates/scripts/ci/bkit-machine-lock.sh`, adopted byte-identical as `scripts/ci/bkit-machine-lock.sh`) has no wait list. Each waiting run's Perl helper retries a non-blocking `flock` every 0.1 s (`scripts/ci/bkit-machine-lock.sh:234-252`), so whichever helper retries first after a release wins. How long a run has waited counts for nothing, and a session that just released the lock and asks again is as likely to win as a run that has waited 50 minutes. One `bkit tests run` gate waited 51 minutes while three later arrivals took the lock ahead of it, and would have given up (exit 75) at its 3600 s limit without running.

Goals:

- Add a ticket queue beside each lock file, so the Perl helper's acquire loop admits waiters in the order they started waiting. The queue lives in the one acquire loop every lock shares, so the `tests` lock, other named locks and the unnamed stack lock all gain it.
- Make a ticket disappear, or be skipped, when its waiter gives up, its caller dies or its helper is killed, so a dead ticket never blocks the line.
- Keep a run's place in line when it gives up and the same run asks again within 120 s, so the exit-81 short-call loop of `bkit tests run`, `bkit tests changed` and `bkit branches push` (`.bkit/providers.md` § Long-running shell commands) does not send a 60 s host to the end of the line on every re-run (Open Question 6).
- Make the `⏳ waiting` note say where the run is in line.
- Keep every existing contract: exit codes 2 / 73 / 75, the give-up line `bkit tests run` parses (`testsLockHolder` in `.bkit/core/engine/commands/lib.ts`), lock file paths, owner variables, the `BKIT_TEST_SLOTS` slots, nested reuse, the `CI` no-op and mutual exclusion with copies that predate the queue.

This plan covers issue #916 only (no workstreams, no parent design, no audit). It reads no superseded plan, because none exists at `docs/plans/202611/916-tests-lock-waiting-plan.md`.

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

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** a run asks for a held lock **→ THEN** it takes a ticket in the lock's queue folder and waits; only the first live ticket in line tries the `flock`.
- **WHEN** the holder finishes **→ THEN** the run first in line takes the lock and leaves the queue, and the next run becomes first in line within about 0.1 s.
- **WHEN** a run that just released the lock asks again **→ THEN** it joins the end of the line, behind every run already waiting; a run that gave up and asks again within 120 s takes back its old place instead.
- **WHEN** a waiting note prints **→ THEN** it says where the run is in line, for example "2nd in line".
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
| A waiter gives up (exit 75; exit 81 from `bkit tests run`, `bkit tests changed` or `bkit branches push`) and the same run (the same `<who> — <checkout>` line) asks again within 120 s | It takes back its held place, ahead of every run that started waiting after its first wait (Open Question 6, option A). |
| A held place is not taken back within 120 s | The next scan deletes it, and a later re-ask from that run takes a new ticket at the end of the line. |
| A waiter's caller is killed while it waits | Its helper sees the caller gone within 0.1 s, removes its ticket and exits; the runs behind it move up. |
| A waiter's Perl helper gets `SIGTERM`, `SIGINT` or `SIGHUP` while it waits | It removes its ticket at once and exits; the runs behind it move up. |
| A waiter's Perl helper is killed with `SIGKILL`, leaving its ticket file | The kernel drops the helper's `flock` on the ticket, so the next scan treats the ticket as dead, skips it and deletes it. |
| A waiter is suspended (Ctrl-Z, `SIGSTOP`) while first in line | Its ticket stays live, so the line waits until it resumes, even while the lock sits free; runs behind it may give up at their limits. This is new: today a suspended waiter blocks nobody (Open Question 7). |
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
| A ticket's temporary file is left behind by a helper killed between create and rename, or an unrelated file sits in the queue folder | The scan ignores names that are neither tickets nor held places and never deletes them, so they never block the line. |

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
| The upgrade report's `changed:` line for `scripts/ci/bkit-machine-lock.sh` says that a stale adopted copy lets waiting runs take the lock out of arrival order (Open Question 2, option B) | Unit | `.bkit/core/engine/install/template-copies.test.ts` | 6 |

Untested edge cases: the same-microsecond tie-break and the wall-clock jump. No real-lock test can force two tickets into one microsecond or move the monotonic clock, and a planted live ticket would block the line instead of revealing the sort. Both rest on the `CLOCK_MONOTONIC` and `flock` Assumptions below.

The upgrade-report row stays at the Unit tier: `formatTemplateChanges` is a pure function (`docs/testing.md` § Which tier does a behaviour need?), and unit tests live in `*.test.ts`, although the sibling consequence case sits in `.bkit/core/engine/install/template-copies.integration.test.ts`.

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
| Held place `<monotonic seconds, 6 decimals>-<helper pid>.held` | New name (file) | Left by a waiter that gives up; holds the same `<who> — <checkout>` line. The line skips it, the same run takes it back within 120 s, and the next scan after 120 s deletes it (Open Question 6, option A). |
| Waiting note `⏳ <who> is waiting for <lock> (up to <N>s), <ordinal> in line: in use by …` | Changed text | Gains `, <ordinal> in line`. Nothing in bkit parses the note. |
| `try_local_stack_lock` | Changed behaviour | Returns 1 (busy) while any run waits in line, even when a slot is free; its busy note gains `; <N> waiting in line`. With nobody waiting it behaves as before. |
| Waiting runs on every lock | Changed behaviour | Take the lock in arrival order instead of at random. A waiter stopped while first in line now holds the line, even while the lock sits free (Open Question 7). |
| `.bkit/providers.md` § Long-running shell commands, rule sentence | Changed text | Says that a short-call host's re-run within 120 s keeps its place in line, so the loop still costs a re-run per minute of waiting and nothing else. |
| Upgrade report `changed: .bkit/templates/scripts/ci/bkit-machine-lock.sh` | Changed text | Gains `— an adopted copy without the queue lets waiting runs take the lock out of arrival order; re-copy it`. |
| `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` | New name (test fixture) | Follows the sibling `stack-lock-6.0.0.sh`; test-only and unshipped, so it carries no `bkit-` prefix. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1:** The issue is a bug-shape issue, so it has no `Narrative` or `Success Criteria` fields, and there is no design. Where do the two come from? → The owner resolves it at plan review.
  - **Options:** A) Use the issue's `What should happen` text word for word: Narrative "Runs get the lock in the order they started waiting.", one Success Criterion "A run waiting with a long enough limit always gets its turn once the runs ahead of it finish." — the owner's own words, but no criterion covers the place-in-line note or dead tickets · B) The owner writes a new Narrative and up to five criteria — complete, at the cost of one review round.
  - **Recommended:** A) — it is the owner's stated outcome, and the `Derived Test Matrix` already covers the note and the dead-ticket cases.
  - **Default if unanswered:** None. The Acceptance Scenario stays `⚠️ MISSING`, and Gate 1 cannot pass.
- **Open Question 2:** Do consumers' adopted copies of `scripts/ci/bkit-machine-lock.sh` need anything beyond the template change? (The issue leaves this open. #724 shipped the script copy-and-own with no migration, and decision `724-engine-runs-packaged-lock-template` keeps it copy-and-own.) Two of the three runs that jumped the line in the issue came from a consumer repo, so an un-recopied consumer copy keeps racing.
  - **Options:** A) An upgrade migration that replaces a `scripts/ci/bkit-machine-lock.sh` byte-identical to the shipped 6.1.0 / 6.1.1 text (sha256 `63ee5873795f…`) with the new template, after the pattern of `migrateSlopTypeSuppression` in `.bkit/core/engine/install/modules/core.ts`, plus a `docs/migrations.md` row and an old-shape test — reaches every unedited copy, but writes into a copy-and-own file and needs the owner's confirmation under the Migrations rule · B) A `TEMPLATE_CHANGE_CONSEQUENCES` entry in `.bkit/core/engine/install/template-copies.ts`, so the upgrade report's `changed:` line for this template says what a stale copy costs — writes no consumer file and keeps copy-and-own, but a consumer who ignores the report keeps the random order · C) Docs only (`.bkit/templates.md`) — no engine change, and the consumer learns only from the generic `changed:` line.
  - **Recommended:** B) — it keeps the copy-and-own decision and puts the concrete consequence in the same upgrade run that changes the template.
  - **Default if unanswered:** B). The runbook carries B as TASK 6. Choosing A needs a plan update that adds a migration group.
- **Open Question 3:** Which waiters try the `flock` when `BKIT_TEST_SLOTS=N`? The issue proposes "the oldest N".
  - **Options:** A) Only the run first in line tries; it leaves the line on success, and the next run tries within about 0.1 s — strict arrival order, and N free slots fill one per poll · B) The oldest N tickets try — free slots fill at once, but the oldest N race among themselves, so a run can keep losing to a newer arrival that enters the window.
  - **Recommended:** A) — it gives strict order for every slot count, and the cost is at most 0.1 s per extra free slot.
  - **Default if unanswered:** A).
- **Open Question 4:** Does the queue cover every lock, or only `tests`?
  - **Options:** A) Every lock (the `tests` lock, other named locks and the unnamed stack lock) — one acquire loop with no special case, and stack resets get fair order too · B) `tests` only — matches the issue title, but adds a name check to the shared loop and leaves the same starvation on the other locks.
  - **Recommended:** A) — the starvation lives in the shared loop, so fixing it there fixes every caller.
  - **Default if unanswered:** A).
- **Open Question 5:** Should the waiting note also estimate the wait from `<name>.last`? The issue says it "can".
  - **Options:** A) Place in line only — exact, and the note already shows each holder's `last run took` time · B) Place in line plus "about N min", summed from the `.last` time of each run ahead — useful at a glance, but `.last` records one time per checkout, not per gate, so a short static gate and a long full gate from one checkout give the same figure, and the estimate can be badly wrong.
  - **Recommended:** A) — a wrong estimate misleads more than a missing one.
  - **Default if unanswered:** A). Choosing B adds one test to TASK 3, which owns the waiting note.
- **Open Question 6:** How does a run keep its place in line when it gives up and asks again? `bkit tests run`, `bkit tests changed` and `bkit branches push` wait 60 s by default, exit 81 and re-run on Codex, Antigravity, Cursor and OpenCode (`.bkit/providers.md` § Long-running shell commands), and `--lock-wait-s=0` tries once. If a give-up drops the ticket, every re-run joins the end of the line, so a 60 s host waits behind every run that arrived during its last minute, and a `--lock-wait-s=0` caller is never first unless the line is empty. That turns the issue's starvation onto the waiters bkit's own verbs create.
  - **Options:** A) A held place: on a give-up, the helper renames its ticket to `<time>-<pid>.held`, keeping its time; the line skips held places, and a wait-mode take whose `<who> — <checkout>` line matches a held place less than 120 s old takes its time back. The run names of the three verbs are stable across re-runs (`bkit tests run <gate> <fid> <step>`, `bkit tests changed <gate>`, `bkit branches push <branch>`) — a lock-only change with no engine edit, but two live runs with the same run name in one checkout share one held place, and a re-run after 120 s loses it · B) The verbs pass the run's first-wait time (for example `LOCAL_STACK_LOCK_SINCE`), and the helper uses it as the ticket time — exact for any re-run gap, but it needs an engine change in three verbs plus state that survives between re-runs, the time must be on the same clock as the tickets (Node cannot read `CLOCK_MONOTONIC`), and any caller can jump the line by passing an old time · C) Accept the cost and document it in `.bkit/providers.md` — no code, but short-call hosts starve behind long-wait hosts such as Claude Code's 1200 s.
  - **Recommended:** A) — it keeps the short-call loop's promise of "a re-run per minute of waiting and nothing else" without trusting a caller-supplied time.
  - **Default if unanswered:** A). The runbook carries A as TASK 4. Choosing B needs a plan update that adds engine tasks; choosing C drops TASK 4 and rewrites the `.bkit/providers.md` line instead.
- **Open Question 7:** What happens to the line when its first waiter is suspended (Ctrl-Z, `SIGSTOP`)? Today a suspended waiter blocks nobody; with the queue, its ticket stays live and holds every run behind it, even while the lock sits free.
  - **Options:** A) Accept it and document it in `.bkit/templates.md` § Machine lock — no extra code, and runs behind it give up at their limits as they would behind a suspended holder · B) Skip a ticket whose owner is stopped — keeps the line moving, but Perl can only read process state by running `ps` once per ticket per pass, which breaks the one-0.1-s-pass rule and is not portable · C) Accept it, and name the first-in-line run in later runs' waiting notes ("behind `<who>` — `<checkout>`") — makes a stuck head visible, at the cost of a longer note.
  - **Recommended:** A) — a suspended head is rare and recoverable, and the docs say how to spot it (`ls` the queue folder).
  - **Default if unanswered:** A). Choosing C adds one test to TASK 3.
- **Assumption:** An agent re-runs a block that exited 81 within 120 s, under the same run name and checkout. → If it is wrong, the re-run's held place has expired, and the run joins the end of the line as it would with no held place.
- **Assumption:** `/usr/bin/perl` exposes the system-wide `CLOCK_MONOTONIC` through `Time::HiRes` on macOS and Linux (verified on macOS: Perl 5.34.1). → If it is missing, tickets cannot share one clock, and the helper must fall back to `Time::HiRes::time`, which a wall-clock jump can reorder.
- **Assumption:** The kernel drops a `flock` when its process dies, including on `SIGKILL`, so a ticket's lock is a reliable liveness signal with no pid-reuse risk. → If it is wrong, a dead ticket blocks the line until each waiter's limit.
- **Assumption:** `rename` within one folder keeps the open, locked file handle valid, so a ticket is locked before any other waiter can see it. → If it is wrong, another waiter could see an unlocked ticket and delete it as dead.
- **Assumption:** The cache folder sits on a local file system, as the lock already requires. → On NFS, `flock` semantics differ, and both the lock and the queue are unreliable.
- **Assumption:** Nothing parses the waiting note; only the give-up line is parsed (`testsLockHolder` and `classifyLockExit` in `.bkit/core/engine/commands/lib.ts`). → If a consumer parses the note, the added "Nth in line" text breaks that parser.
- **Assumption:** A queue scan every 0.1 s (one directory read plus one non-blocking `flock` per ticket) costs too little to matter for tens of waiters. → If it is wrong, waiting runs use measurable CPU, and the scan interval must grow.

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
| The oldest N tickets try when `BKIT_TEST_SLOTS=N` (the issue's wording) | Rejected by default (Open Question 3) | The oldest N race among themselves, so a run can keep losing to newer arrivals inside that window. |
| A give-up removes the ticket, so a re-run joins the end of the line | Rejected by default (Open Question 6) | The exit-81 short-call loop of the bkit verbs would put every 60 s host behind each run that arrived during its last minute. |
| The bkit verbs pass a first-wait time the helper uses as the ticket time (Open Question 6, option B) | Not chosen by default | Needs engine state that survives re-runs and a clock Node cannot read, and lets any caller jump the line with an old time. |
| Upgrade migration that rewrites unedited consumer copies (Open Question 2, option A) | Not chosen by default | Reaches every unedited copy, but writes into a copy-and-own file against `724-engine-runs-packaged-lock-template`, and the Migrations rule requires the owner's confirmation first. It stays available if the owner picks A. |

**Recommendation for a later phase:** once every supported release ships the queue, a copy without it is the only way a run can still jump the line. A detect-only `bkit check` advisory (`docs/migrations.md` § Detect-only guards) that spots an adopted copy without the queue would close that gap without writing consumer files.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Wait estimate in the waiting note, summed from `<name>.last` | The issue says the note "can" estimate the wait; no `Derived Test Matrix` row needs it, and Open Question 5 (default A) declares it out, because `.last` keeps one held time per checkout, not per gate. | `docs/deferrals.jsonl` key `916-lock-wait-estimate-from-last`; joins this plan if the owner picks Open Question 5 option B. |

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
| Detect-only `bkit check` advisory for an adopted lock copy without the queue | This plan, `Alternative Approaches & Recommendations` | The upgrade report line of TASK 6 | Needs a design decision; a stronger nudge than TASK 6 that still writes no consumer file. |

## Security & Privacy

- [ ] **New API Route** — not applicable.
- [ ] **New DB Table/Column** — not applicable.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a handler input. The only external text the helper reads is file names in its own queue folder; the scan accepts only ticket names matching `^\d+\.\d{6}-\d+$` and held-place names matching `^\d+\.\d{6}-\d+\.held$`, so a stray file can neither break the sort nor be unlinked by the scan (TASK 3 tests it).
- [ ] **PII** — not applicable. A ticket holds the same `<who> — <checkout>` text the `.holder` file already writes into the user's own cache folder; nothing is logged elsewhere.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input. The queue folder sits in the user's own cache folder with the default `umask`, like the lock files beside it.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added. The lock stays Bash 3.2+ plus `/usr/bin/perl` core modules (`Fcntl`, `File::Glob`, `POSIX`, `Time::HiRes`), so `package.json` and `pnpm-lock.yaml` do not change.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (`pnpm outdated`) lists only dev tools behind: `vitest` 5.0.5 → 5.1.0, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. None blocks this change, which touches no runtime dependency. Toolchain: Node v24.16.0, pnpm 10.34.7, GNU Bash 5.3.20 (the script must still run under macOS `/bin/bash` 3.2), `/usr/bin/perl` 5.34.1 with `Time::HiRes::clock_gettime(CLOCK_MONOTONIC)` working.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the plan touches is readable in the worktree `/Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting`. The owner must answer Open Questions 1 to 7; Open Question 1 has no default.
- [ ] **Project Context:** read `docs/decisions.jsonl` keys `724-machine-lock-script-named-locks-no-migration`, `724-engine-runs-packaged-lock-template`, `724-tests-lock-fixed-slots-not-live-load`, `724-lock-run-exit-codes-73-75`, `724-tests-run-lock-wait-exit-81`; `docs/knowledge.jsonl` keys `machine-lock-holder-report-allows-empty-primary-slot`, `machine-lock-wrapper-cancellation-keeps-foreground-owner-alive`, `machine-lock-fifo-timeout-may-consume-partial-line`, `copied-perl-fixture-replacement-must-preserve-pid-token`; `docs/failures.jsonl` keys `machine-lock-history-wait-returned-refusal` (OPEN) and `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts a killed tests-lock holder frees its slot within a second and the waiter starts` (CLOSED: fixed by polling both sides every 100 ms, so the queue scan must stay inside that one pass). None decides waiter order. The 6.1.1 fixture of TASK 1 carries the reader from before the partial-line fix (`git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh | grep -c _lsl_partial` prints `0`), so it can reproduce `machine-lock-fifo-timeout-may-consume-partial-line` under load; TASK 1 guards for it.
- [ ] **Testing & Quality:** every lock behaviour is tested at the Integration tier with real Bash, Perl and `flock` against a per-test `XDG_CACHE_HOME` (`docs/testing.md` § Which tier does a behaviour need?, § Tiers). The pure report-line function is tested at the Unit tier.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable. No secret or new environment variable is added; the existing `LOCAL_STACK_LOCK_WAIT_S`, `BKIT_TEST_SLOTS`, `XDG_CACHE_HOME` and `CI` keep their meaning.
- [ ] **Schema State:** not applicable. bkit has no database; the queue folder is a cache folder, not a schema.
- [ ] **Architecture & UI:** the only new file is a test fixture under `tests/fixtures/machine-lock/`, where `docs/architecture.md` and `docs/testing.md` already place the 6.0.0 lock fixture. No UI.
- [ ] **Observability:** the lock's notes stay plain `[machine-lock]` stderr lines (`docs/observability.md` § prefixes: CLI stdout / stderr only). The waiting note gains the place in line, and the busy note of a `try` names the runs waiting in line.
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

None. The new on-disk layout, for the record: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.queue/` for named locks and `…/bkit/local-stack-lock/<stack>.queue/` for the unnamed stack lock. Each waiter holds one ticket file named `<monotonic seconds, 6 decimals>-<helper pid>` that holds its `<who> — <checkout>` line. A waiter that gives up leaves a held place, `<same name>.held`, with the same line, until its run takes it back or it is 120 s old. The queue folder is created by every wait-mode take and never deleted, like the lock files beside it.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Arrival-ordered ticket queue with first-in-line acquire | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rli "ticket\|fifo order\|arrival order\|wait list\|waitlist" .bkit/core/engine scripts .bkit/templates` (no queue; only Linear-ticket text in `checks/before/mcp.test.ts`); `grep -rl "flock\|openSync(.*\"wx\"\|O_EXCL" .bkit/core/engine` (`commands/workflow/locks.ts`: per-feature lock file, no waiters; `commands/workflow/ledgers.ts`: guard file); `docs/capabilities.md` (no lock-queue entry); built-ins: `flock(2)` and Perl `Fcntl` promise no arrival order; current practice: ticket / bakery locks | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` — the Perl helper's acquire loop owns every lock wait, missing any record of arrival order | EXTEND | Add ticket create / scan / remove to the existing acquire loop (lines 231-252), so every caller gains the queue with no new script. |
| Dead-ticket detection and cleanup | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Same searches; read the helper's `$caller_alive` check (lines 199-200) and its exit paths (lines 237-244) | Same file — already checks the caller every 0.1 s and exits on caller death, give-up and error | EXTEND | Hold a `flock` on the own ticket while waiting, unlink it on every exit path, and treat any ticket whose `flock` can be taken as dead. |
| A run keeps its place in line across a give-up and re-ask | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rn "LOCAL_STACK_LOCK_WHO" .bkit/core/engine/commands/workflow/tests.ts .bkit/core/engine/commands/workflow/tests-changed.ts .bkit/core/engine/commands/workflow/branches.ts` (each verb passes a run name that is stable across re-runs); read the helper's `timeout` exit path (lines 237-244) | Same file — the give-up path already knows its ticket and its `<who> — <checkout>` line | EXTEND | On give-up, rename the own ticket to `<name>.held`; on a wait-mode take, adopt a matching held place under 120 s old (Open Question 6, option A). |
| Place in line in the waiting note | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Read the `⏳` note (line 248); `grep -n "is waiting for" .bkit/core/engine/commands/lib.ts` (no parser of the note; only the give-up line is parsed by `testsLockHolder`) | Same file — the note already names the budget and holders | EXTEND | Add the ordinal place ("2nd in line") computed from the same queue scan. |
| `try` never jumps the line | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | Read the `try` branch (line 243) and `try_local_stack_lock` (line 337) | Same file — `try` replies `busy <holder>` | EXTEND | Reply busy when any live ticket exists, before trying a slot; name the runs waiting in line when no slot is held. |
| bkit's own adopted copy | `scripts/ci/bkit-machine-lock.sh` | `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` (identical); `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` entry `"scripts/ci/bkit-machine-lock.sh": identical` | `scripts/ci/bkit-machine-lock.sh` — the byte-identical copy | EXTEND | Copy the template over it, as the dogfood test requires. |
| A frozen copy of the script without the queue, for the mixed-version test | `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` | `ls tests/fixtures/machine-lock/` (only `stack-lock-6.0.0.sh`); `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh` (the shipped 6.1.0 / 6.1.1 text, sha256 `63ee5873795f…`) | `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` — the 6.0.0 stack-lock script, with no named locks, so it cannot wait on `tests` | NEW | Reason (b): turning the 6.0.0 fixture into the 6.1.1 script breaks its contract as the frozen 6.0.0 copy and its callers in `machine-lock.integration.test.ts` ("the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other", "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy"). |
| Upgrade report says what a stale adopted lock copy costs | `.bkit/core/engine/install/template-copies.ts` | `grep -n "TEMPLATE_CHANGE_CONSEQUENCES\|formatTemplateChanges" .bkit/core/engine/install/template-copies.ts`; `grep -rln "formatTemplateChanges" .bkit/core/engine` (`template-copies.ts`, `template-copies.integration.test.ts`, `commands/install/upgrade.ts`) | `TEMPLATE_CHANGE_CONSEQUENCES` in `.bkit/core/engine/install/template-copies.ts` — a per-template consequence map the `changed:` line already prints | EXTEND | Add one entry keyed `scripts/ci/bkit-machine-lock.sh` (Open Question 2, option B). |
| Lock docs | `.bkit/core/.bkit/templates.md`, `.bkit/shared/docs/testing.md`, `docs/testing.md`, `.bkit/core/.bkit/providers.md` | `grep -n "Machine lock" .bkit/core/.bkit/templates.md`; `grep -n "## Tests lock" .bkit/shared/docs/testing.md`; `diff` of each section against its mirror (`.bkit/templates.md`, `docs/testing.md`): identical; `grep -n "stack-lock-6.0.0" docs/testing.md` (the machine-lock paragraph below `bkit:end`); `grep -n "re-run per minute" .bkit/core/.bkit/providers.md` (line 858) | `.bkit/core/.bkit/templates.md` § Machine lock; `.bkit/shared/docs/testing.md` § Tests lock; the machine-lock paragraph of `docs/testing.md`; `.bkit/core/.bkit/providers.md` § Long-running shell commands | EXTEND | Describe the queue, the held place, the place-in-line note, the stopped-head rule and `try` behaviour in the sources, name the 6.1.1 fixture in `docs/testing.md`, say in § Long-running shell commands that a re-run within 120 s keeps its place, then re-render the mirrors. |

## Architecture & Component Changes

The whole fix lives in the Perl helper inside `_local_stack_lock`, which every lock wait already runs through. The Bash API, exit codes, lock file paths, owner variables and the give-up line stay as they are.

Shared surfaces the build treats as high-risk: the Perl acquire loop, which every lock caller on the machine runs through; `try_local_stack_lock`, a public shell API whose result changes (busy while anyone waits); and the exported `TEMPLATE_CHANGE_CONSEQUENCES` map. The existing lock suites plus the planned rows cover each one.

**Ledger rows:** `916-machine-lock-ticket-queue-flock-liveness`, `916-queue-first-in-line-only-tries`, `916-queue-covers-every-lock`, `916-try-never-jumps-the-line`, `916-stale-lock-copy-upgrade-report-note`, `916-waiting-note-place-only-no-estimate`, `916-lock-wait-estimate-from-last`, `916-queue-keeps-place-across-give-up`, `916-stopped-first-in-line-holds-the-line`

### Database Migrations

None.

### Lock template (Bash + Perl)

#### [MODIFY] `.bkit/templates/scripts/ci/bkit-machine-lock.sh`

- **Existence Check:** the file exists (390 lines), byte-identical to `scripts/ci/bkit-machine-lock.sh`.
- **Queue folder (wait mode only):** the helper derives `$queue = "$stem.queue"` from the lock file it already receives (`$file`, `$stem`), and creates it with `mkdir` on every wait-mode take, contended or not, when it is absent. A failure, or a path that exists but is not a folder, replies `error cannot create $queue: $!`, which `run` maps to exit 73 through the existing `*)` reply branch, and which `bkit tests run` maps to exit 4 through `classifyLockExit` (prefix `could not take the lock for tests:`).
- **Ticket (wait mode only):** before the acquire loop, the helper opens `$queue/.$$.tmp`, takes `flock(LOCK_EX)` on it, writes `"$who — $checkout\n"`, and renames it to `$queue/<sprintf "%.6f", clock_gettime(CLOCK_MONOTONIC)>-$$`. The `flock` stays held for as long as the helper waits. A failure replies `error cannot write a ticket in $queue: $!`.
- **Held place (Open Question 6, option A):** before that rename, the helper looks for a `*.held` file under 120 s old (by `mtime`) whose line equals its own `"$who — $checkout"`. When it unlinks one successfully, it renames its temp file to that held place's time with its own pid, so it takes back its old place; a second run with the same line that loses the unlink takes a new time.
- **Scan (each 0.1 s pass):** list names matching `^\d+\.\d{6}-\d+$` (tickets) and `^\d+\.\d{6}-\d+\.held$` (held places), and ignore every other name. Delete held places older than 120 s, and skip the rest: a held place never blocks the line. Sort the tickets numerically by time, then pid. For each other ticket, try `flock(LOCK_EX | LOCK_NB)`: success means its owner is gone, so unlink it and drop it; failure means it is live. The waiter's place is 1 + the live tickets ahead of its own.
- **Constraint (failure `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts a killed tests-lock holder frees its slot within a second and the waiter starts`, CLOSED):** the scan, the slot tries and the caller check all run inside the one existing 0.1 s pass, with no second sleep and no blocking call per pass, so the `< 2000 ms` handoff assertion of that test stays green.
- **Acquire:** the slot loop (current lines 235-240) runs only when the waiter's place is 1. On success, the helper unlinks its ticket and closes its handle before writing the `.holder` file and replying `ok`, so the next run becomes first in line within one poll.
- **Give-up (`timeout`):** the helper renames its ticket to `<ticket name>.held`, keeping its time, then closes its handle and replies as today.
- **Every other exit:** caller gone (`exit 0 unless $caller_alive`), errors, and `TERM` / `INT` / `HUP` while waiting unlink the own ticket first. The wait-time `TERM` / `INT` / `HUP` handlers are installed before the acquire loop and unlink the ticket themselves; the existing post-acquire handler (`scripts/ci/bkit-machine-lock.sh:254`, which only sets `$stopping`) replaces them after acquire. A `SIGKILL` leaves the file, and the next scan removes it.
- **`try` mode:** takes no ticket and never creates the queue folder. A missing queue folder, or a path that cannot be read as a folder, counts as an empty line, so a `try` never fails because of a path it only reads. Otherwise it scans the queue first; any live ticket → reply `busy <holders>; <N> waiting in line`, where `<holders>` is the existing holder text (`another run` when no `.holder` file exists). With no live ticket it tries the slots as today, and its busy reply gains nothing.
- **Waiting note:** `[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s), <ordinal> in line: in use by <holders>`, with ordinals `1st`, `2nd`, `3rd`, `Nth` (11th-13th take `th`). The once-a-minute cadence is unchanged.
- **Unchanged:** the give-up line `❌ <who> gave up after <N>s waiting for <label>, in use by <holders>` that `testsLockHolder` parses, the `.last` history, the `.holder` files, slot files, lock order checks, nested reuse and the `CI` no-op (which returns before the helper starts, so no queue folder appears).
- **Header comment:** lines 22-36 gain one sentence each for the queue folder, arrival order and the held place (TASKS 1 and 4). TASK 3 updates line 9 (`try_local_stack_lock … # returns 1 immediately while busy`) to say a `try` is busy while runs wait in line, and line 34 (`Waiting notes name every holder and that checkout's last run.`) to say waiting notes also name the place in line.
- **Modules:** `use Time::HiRes qw(clock_gettime CLOCK_MONOTONIC);` joins the existing `Fcntl`, `File::Glob` and `POSIX` imports; all four ship with `/usr/bin/perl`.

#### [MODIFY] `scripts/ci/bkit-machine-lock.sh`

- **Existence Check:** the file exists and is bkit's adopted copy.
- Replaced with the template byte for byte by every task that changes the template (TASKS 1, 2, 3 and 4), so `dogfood-templates.test.ts` stays green after each task and bkit's own gates queue in order.

### Engine (install)

#### [MODIFY] `.bkit/core/engine/install/template-copies.ts`

- **Existence Check:** the file exists; `TEMPLATE_CHANGE_CONSEQUENCES` (line 111) holds one entry, for `slop-scan.config.json`.
- Add `"scripts/ci/bkit-machine-lock.sh": "an adopted copy without the queue lets waiting runs take the lock out of arrival order; re-copy it"` (Open Question 2, option B). `pnpm build` refreshes `dist/` in the same commit.

### Tests

#### [MODIFY] `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

- **Existence Check:** the file exists (1025 lines) with the `running`, `waitForOutput`, `commandRun`, `slotHolder` and `envFor` helpers.
- A new `describe("machine lock waiting order", …)` block with the seventeen new tests the runbook names (TASKS 1 to 4), plus a small helper that starts a waiter recording its name to an order file and waits for its `waiting` note before the next one starts, a helper that reads the helper pid from a waiter's ticket name, and a helper that finds a run's held place.
- The existing test `a runner started by the holder does not wait on its parent` gains an assertion that the queue folder holds no ticket (TASK 3).

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

- **Existence Check:** the file exists, with `tests run with an unwritable lock dir exits 4 naming the path` (line 425) as the sibling pattern.
- One new test: a regular file at `tests.queue` makes `bkit tests run` exit 4 naming the queue folder (TASK 2).

#### [new] `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`

- **Reuse Check:** `Reuse Inventory` row "A frozen copy of the script without the queue", reason (b).
- The exact output of `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh`, so its sha256 starts `63ee5873795f`. Test-only; `package.json` `files` lists no `tests/` path, so it never ships.
- It is test input: the group's tests step writes it together with the TASK 1 tests, so the mixed-version test's red shows the order fault, not a missing file.
- It carries the reply reader from before the partial-line fix (no `_lsl_partial`), so under load it can turn a fragmented `ok` into `k` and then wait on its own acquired holder (knowledge `machine-lock-fifo-timeout-may-consume-partial-line`, failure `machine-lock-history-wait-returned-refusal`). The test that runs it guards for this (TASK 1).

#### [MODIFY] `.bkit/core/engine/install/template-copies.test.ts`

- **Existence Check:** the file exists and imports `remapTemplateDest` from `./template-copies`.
- One test for the new consequence line, importing `formatTemplateChanges`.

### Docs

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** the file exists; § Machine lock starts at line 925 and matches its mirror `.bkit/templates.md`.
- Add the queue folder, arrival order, the held place across a give-up, the place-in-line note, the `try` rule and the stopped-head rule (a waiter stopped while first in line holds the line; `ls` the queue folder to see who is first) to § Machine lock; the mirror re-renders through `pnpm tsx .bkit/core/engine/cli.ts upgrade`.

#### [MODIFY] `.bkit/shared/docs/testing.md`

- **Existence Check:** the file exists; § Tests lock (line 317) matches `docs/testing.md`.
- Reword the last bullet so waiting notes name the place in line and waiting runs take the lock in arrival order; the mirror `docs/testing.md` re-renders.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; the machine-lock paragraph sits at line 709, below `bkit:end`, so it is edited directly.
- Name `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` beside the 6.0.0 fixture as the frozen copy without the queue.

#### [MODIFY] `.bkit/core/.bkit/providers.md`

- **Existence Check:** the file exists; § Long-running shell commands' rule sentence (line 858) ends "which costs a re-run per minute of waiting and nothing else", and matches its mirror `.bkit/providers.md`.
- Add that a re-run within 120 s keeps its place in line (Open Question 6, option A), so that sentence stays true; the mirror re-renders.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. The acquire loop is extended in place; no file, function or export is replaced, and the frozen 6.1.1 fixture is a new test input, not a replacement.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/templates.md` § Machine lock (source of `.bkit/templates.md`) | Add: waiting runs take the lock in arrival order through `<name>.queue/`; a dead waiter's ticket is skipped; a run that gives up keeps a held place for 120 s; waiting notes name the place in line; `try` reports busy while runs wait in line; a waiter stopped while first in line holds the line, and `ls` of the queue folder shows who is first. |
| `.bkit/core/.bkit/providers.md` § Long-running shell commands (source of `.bkit/providers.md`) | The rule sentence says a short-call host's re-run within 120 s keeps its place in line. |
| `.bkit/shared/docs/testing.md` § Tests lock (source of `docs/testing.md`'s managed block) | Reword the last bullet: waiting runs take the lock in arrival order, and waiting notes name the place in line, the holders and their checkouts' earlier run times. Add to the re-run bullet that a re-run on exit 81 within 120 s keeps its place in line. |
| `docs/testing.md` (below `bkit:end`, the machine-lock paragraph at line 709) | Name `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` as the frozen 6.1.1 copy without the queue. |
| `.bkit/templates/scripts/ci/bkit-machine-lock.sh` header comment | One sentence each for the queue folder, arrival order and the held place; line 9 says a `try` is busy while runs wait in line; line 34 says waiting notes name the place in line. |
| `docs/decisions.jsonl` | Eight decision keys written by this plan (the `**Ledger rows:**` line). |
| `docs/deferrals.jsonl` | One `Exempt` row for the wait estimate (`Out of Scope`). |
| `docs/knowledge.jsonl` | No change at plan time; the build adds a row only if it meets a new trap. |
| `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no new component kind, library, schema, UI or log prefix. |
| `docs/migrations.md` | No change under Open Question 2's default B; option A would add a row. |
| `CHANGELOG.md` | No change in this plan; the release writes its `## [X.Y.Z]` block. |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit has no database. |
| **Code** | `git revert {COMMIT}` of the build's commits | A reverted script ignores any `*.queue/` folder left in the cache; the folders hold only dead tickets once their waiters exit, and `rm -rf ~/.cache/bkit/machine-lock/*.queue ~/.cache/bkit/local-stack-lock/*.queue` clears them. |
| **Risk window** | None | Copies with and without the queue exclude each other on the same lock file, so a machine running both versions during a rollback keeps one holder at a time. |

## Agent Execution Runbook

Build order: the lock template and its tests first (queue and order, then dead tickets and errors, then `try` and the note, then the held place), then the docs that describe it, then the engine's upgrade report. One PR for all six tasks is fine.

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
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: on give-up the Perl helper renames its ticket to `<ticket name>.held`, keeping its time; a wait-mode take whose `<who> — <checkout>` line matches a held place under 120 s old unlinks it and takes its time with its own pid; the scan skips held places and deletes those older than 120 s (Open Question 6, option A)
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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Upgrade report names the cost of a stale lock copy

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Add the machine-lock consequence to the upgrade report's `changed:` line
  - **UPDATE:** `TEMPLATE_CHANGE_CONSEQUENCES` in `.bkit/core/engine/install/template-copies.ts`: an entry `"scripts/ci/bkit-machine-lock.sh"` reading "an adopted copy without the queue lets waiting runs take the lock out of arrival order; re-copy it"
  - **UPDATE:** `.bkit/core/engine/install/template-copies.test.ts`: import `formatTemplateChanges` and add the test below
  - **READ:** `formatTemplateChanges` in `.bkit/core/engine/install/template-copies.ts`: how the `changed:` line appends a consequence
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the test below passes; `.bkit/core/engine/install/template-copies.integration.test.ts` passes; `pnpm build` has refreshed `dist/` and `dist/` is staged with the change; in a fresh scratch consumer whose `.bkit/templates/scripts/ci/bkit-machine-lock.sh` is the 6.1.1 text, `node <bkit>/dist/cli.js upgrade` prints the `changed: .bkit/templates/scripts/ci/bkit-machine-lock.sh` line with "out of arrival order"
  - **TEST FIRST:**
    - `.bkit/core/engine/install/template-copies.test.ts` `names the stale-copy cost on the machine-lock template's changed line` fails on the `changed:` line for `scripts/ci/bkit-machine-lock.sh` lacking "out of arrival order"

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

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
- [ ] **Integration (`.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`):** the seventeen new ordering, cleanup, error, `try`, note, stray-file, stopped-head, held-place and mixed-version tests and the updated nested-reuse test pass, each in its own `XDG_CACHE_HOME`, and leave no child process alive (`afterEach` kills them, the old-copy waiter's process group included).
- [ ] **Integration (`.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`):** the new queue-folder exit-4 test passes.
- [ ] **Unit (`.bkit/core/engine/install/template-copies.test.ts`):** the consequence-line test passes.
- [ ] **Dogfood upgrade report:** `pnpm build`, then in a fresh scratch consumer whose `.bkit/templates/scripts/ci/bkit-machine-lock.sh` is the 6.1.1 text, `node <bkit>/dist/cli.js upgrade` prints `changed: .bkit/templates/scripts/ci/bkit-machine-lock.sh — an adopted copy without the queue lets waiting runs take the lock out of arrival order; re-copy it`, and the scratch consumer's adopted `scripts/ci/bkit-machine-lock.sh` is left byte for byte as it was.
- [ ] **Apply local migrations:** not applicable; bkit has no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In four terminals with no `CI` set, run the issue's steps to reproduce: the holder `bash scripts/ci/bkit-machine-lock.sh run holder --lock tests -- sleep 30`, then `LOCAL_STACK_LOCK_WAIT_S=600 bash scripts/ci/bkit-machine-lock.sh run A --lock tests -- sleep 5`, then B and C a few seconds apart. A, B and C say `1st in line`, `2nd in line` and `3rd in line`, and their commands run in that order. Repeat three times.
- [ ] **Step 2:** While the waiters wait, `ls ~/.cache/bkit/machine-lock/tests.queue/` shows three tickets; press Ctrl-C in B's terminal, and B's ticket is gone within a second while C moves up to `2nd in line` on its next note.
- [ ] **Step 3:** `pnpm build`, then in a fresh scratch consumer with an older `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, run `node <bkit>/dist/cli.js upgrade` and read the `changed: .bkit/templates/scripts/ci/bkit-machine-lock.sh — an adopted copy without the queue lets waiting runs take the lock out of arrival order; re-copy it` line.
