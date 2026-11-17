Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 1 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-v1-draft.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/related-deferrals.md`, `docs/plans/202611/logs/916-tests-lock-waiting/related-failures.md`, `docs/plans/202611/logs/916-tests-lock-waiting/related-issues.md` |
| plan-review | CONCERNS | 8 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-review-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-review-2.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/916-tests-lock-waiting/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-v1-draft.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/related-deferrals.md`, `docs/plans/202611/logs/916-tests-lock-waiting/related-failures.md`, `docs/plans/202611/logs/916-tests-lock-waiting/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-review-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-review-2.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md`, `docs/plans/202611/logs/916-tests-lock-waiting/plan-update-check.md` |

## Acceptance Scenario

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

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #916
```

Or, to address the reasons first: `/bkit-plan #916`
