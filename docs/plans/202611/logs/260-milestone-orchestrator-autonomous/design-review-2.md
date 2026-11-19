Verdict: CONCERNS
Fingerprint: ecf3f4938450298d8ad765a5d20b9efef4210a751cde085ed058ac61ae1c2b71
<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

Scope: `design-v1-draft.md` (read in full) against `design-input-1.md`, `docs/observability.md`, `docs/deployments.md`, `.agents/docs.md`, `.agents/rules.md` from `bkit:end`, and three existing pieces the design extends: `.bkit/core/engine/commands/workflow/locks.ts`, `.bkit/core/.bkit/workflows.md` § Concurrency lock and § Tests lock, and `.bkit/core/hooks/guardrails-deny.js`. "On-call" here means the owner: no pager, no server and no dashboard exist, so the owner's signals are `bkit manage state`, the report comments on the parent issue and the chat. Design line numbers below refer to `design-v1-draft.md`.

Severity mapping: the CRITICAL section holds the CRITICAL and HIGH findings, which must be folded into the next design version. The OPTIONAL section holds MEDIUM and LOW findings.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| ID | Component | What fails | How the owner or manager detects it today | Blast radius |
| --- | --- | --- | --- | --- |
| FM1 | Manager session | Dies, hangs, app quits, laptop sleeps | Nothing reaches the owner: every report is written by the manager itself. The in-clone heartbeat goes stale (limit not stated). | Whole run. Workers wait or keep running. Landed-unpushed work stays local. |
| FM2 | Manager restart | A new session (crash, app update, new chat) starts `/bkit-manage #N` while the old run is open | Preflight refuses "an earlier run of the same parent still open" (line 189). No takeover or end verb exists. | Whole run is stranded. Workers are orphaned. |
| FM3 | One-manager-per-parent lock | The lock is reclaimed while the first manager is alive, or never reclaimed | Not specified. See finding 2. | Two managers start workers, send go messages and push for one parent. |
| FM4 | Context reset (about 14 a day) | Memory lost | Covered: `SessionStart` hook, `manage state` first call, watcher output starts with the briefing (lines 240-244). | One turn. |
| FM5 | Run records | A torn or malformed row in the parent `status.jsonl` | `manage` fold fails closed and names the line (line 170). The guard tier denies hand edits of `*.jsonl` (line 277). | The manager cannot re-read its memory. No sanctioned repair. |
| FM6 | `manage watch` | Crashes, is started twice, `watch.pid` reused, never restarted after a wake | Stop hook checks for a live watcher only when the manager's turn ends (line 278). A crash exit would wake the manager, but its reason code is not defined. | Run stalls while workers wait. |
| FM7 | Worker session | Silent stall, dead session, permission refusal, hung gate | Only a worker's own one-line report or a status change. The due list has no stalled-worker item (lines 206-219). Gates stop at the existing 3600 s tests-lock hold limit (`workflows.md` § Tests lock). | One issue and one test slot. |
| FM8 | Crash windows between a side effect and its row | Worker started but `bound` not written; go sent but `manage-go` not written (or the reverse); ship landed but `manage-landed` not written; comment posted but `manage-report` not written | No reconciliation item. `manage-landed` is written by the manager "from ship's output" (line 162). | One issue started twice or shipped twice. Breaks criterion 2. |
| FM9 | Hard-limits tier | Stale heartbeat turns it off; `active` unreadable; hook error; the owner's side agents hit a refusal with no explanation | A "warning" on stale (line 129). No row, no due item, no owner-visible signal. | Every worker's `--no-verify`, force push and ledger edits are unguarded during the gap. |
| FM10 | Stop hook | Miscounts work in flight and refuses to end the turn forever | Not specified. No bound on refusals. | Manager burns tokens in a loop. |
| FM11 | Tracker writes | 401, rate limit, network (the GitHub MCP returned 401 in this design run: line 16) | Writes are best-effort (line 130). A `manage-deviation` row requires a comment URL (line 160). | Reports and the deviation comments that criterion 3 relies on are lost while the owner is away. |
| FM12 | Landing | Red chore, foreign edits, landing disturbs running builds | Covered: `land-check` stops at the first red, lists foreign paths, compares with running builds (lines 197, 236). | One issue. |
| FM13 | Batch push | Foreign commit, red pre-push hook, flaky re-run masks a real failure, network drop mid-push | Foreign commit and red hook are covered (line 237). `LANDED-UNPUSHED` is derived from git, so a half-done push self-heals. The flaky re-run is not audited. | Whole batch, never rewritten locally. |
| FM14 | Machine load | More than about 3 builds; tests-lock holder dies | Covered by the single tests lock and its hold limit; `manage go` reads holders (D8). | Builds and the push. |
| FM15 | Estimate | Wrong range (21-hour outlier) | Labelled with its source and sample count (lines 246-251). | Owner expectation only. |
| FM16 | Closing tasks (step 14) | Audit or utility fails, no prior evidence | Restartable from `manage-closing` rows (line 379). | End of run. |
| FM17 | Private notes | `private.jsonl` lost with the clone | Text also lives in chat (line 255). | One note. |
| FM18 | Rules change mid-run | Workers run old rules | Covered: `STALE-BRIEF` (line 217). | One worker. |

## Observability Coverage

<!-- prettier-ignore -->
| ID | Structured log with `[Context]` prefix | Metric or counter | Correlation across sessions | Verdict |
| --- | --- | --- | --- | --- |
| FM1, FM2 | None specified | None | `manage-run.session`, `active.session` exist | Missing owner-side signal |
| FM3 | None | None | Lock holder line only | Missing |
| FM4 | Briefing text only | None | FIDs, worker names, question ids on every row | Covered |
| FM5 | The fold names the bad line, no prefix specified | None | n/a | Partial |
| FM6, FM7 | None | None | `manage-heard`, `manage-worker` rows | Partial: no stalled-worker item |
| FM8 | None | None | Rows exist but nothing reconciles them against child logs | Missing |
| FM9 | "A warning", no prefix, no row | None | The refusal carries no run id | Missing |
| FM10 | None | None | None | Missing |
| FM11 | Existing `[bkit-tracker]` diagnostics apply to the adapter (`docs/observability.md` § Tracker reporting diagnostics) | None | `manage-report.url` | Partial: no unposted state |
| FM12, FM13 | Existing `[bkit-runs]`, `[bkit-branches]` output plus `manage-landed` and `manage-pushed` rows | Counts derive from rows | Landed sha, FIDs, range | Covered, except the flaky re-run |
| FM14 | Existing tests-lock status file | None | Lock holder names | Covered |
| FM15, FM16, FM17, FM18 | Rows | Derived | Rows | Covered |

Design-wide gaps:

- The design never names a log prefix for `bkit manage`. `docs/observability.md` § Log Format requires one prefix per new command noun, says the `[{Context}]` brackets are load-bearing for consumer grep alerting and lists each prefix's grep patterns. `[bkit-manage]` (and a hook-side prefix) do not appear anywhere in the design.
- `docs/observability.md` § Signals and § Alerts, and its "Update when: a signal, destination, correlation key or alert changes" rule, are not in the design's change list. The design adds at least seven new signals: the `manage-*` rows, the due list, the heartbeat, the guard-off state, the report comments, `private.jsonl` and `HEARD-REJECTED`.
- No counters are specified for the run: context resets survived, rejected worker lines, assumptions, deviations, flaky re-runs, push reds, parked issues. The final report carries some of them as prose; nothing feeds `bkit stats`.

## On-Call Ergonomics

<!-- prettier-ignore -->
| Alert (owner-facing) | Runbook obvious from the payload? | Recovery action | Tuning |
| --- | --- | --- | --- |
| Report comment on a push batch | Yes: progress line, landed, parked, assumptions with links (line 255). Missing: heartbeat age, guard state, watcher state, next report due. | None needed. | Fires once per push; fine. |
| Report comment: questions waiting | Yes: owner-question shape (what, why his call, options with cost, recommendation). | Human judgement, one batched answer. | Not stated whether several triggers inside a short window fold into one comment. Comments posted under the owner's own token may not notify him (unverified, see finding 12). |
| Report comment: issue parked | Yes: reason and decision needed. | Human judgement. | Fires per parked issue; a bad hour could post several. |
| Report comment: run end | Yes. | Human reads. | Fine. |
| Due-list lines (`ANSWER`, `GO`, `REVIEW`, `STALE-BRIEF`, `HEARD-REJECTED`) | Yes: each is a self-contained fact with ids and option targets. | Mixed: `GO` and `STALE-BRIEF` are mechanical and idempotent once their rows exist; `ANSWER` and `REVIEW` are judgement. | Bounded briefing, good. |
| Preflight refusal | Yes: reason printed; names the missing variable (Open question 8). | Fix environment and rerun. For an earlier open run, no action exists. | n/a |
| `manage push` stops on a foreign commit | Yes: commits listed. | Owner judgement (Open question 5). | n/a |
| Guard-tier refusal (seen by the owner's side agents and workers) | Not specified. A refusal naming the run, the heartbeat time and the end command is what an on-call needs. | Wait or end the run. No end verb exists. | n/a |
| Stale-heartbeat warning | Printed to the hook's stderr only. | None. | Limit value unstated. |
| Stop-hook refusal | Not specified. | Manager starts a watcher. | No bound on repeats. |

## Operational Dependencies

New on-call burden the design adds. None blocks by itself; each needs an owner for the text.

- **Alerts (owner-facing):** four report-comment triggers (push, questions waiting, parked, end); the preflight advisories (open advisories, expiring assumed accepts); `STALE-BRIEF`, `HEARD-REJECTED` and `LANDED-UNPUSHED` due items; the guard-tier and Stop-hook refusals.
- **Dashboards:** none. `bkit manage state` plus the progress line is the only live view, and it needs the manager's session. A read-only `manage state` that works from a plain terminal, with no manager session and no hook, is the owner's dashboard when the manager is dead (finding 1).
- **Runbooks to write:** (1) take over an open run from a dead manager; (2) end or abandon a run and remove the clone-wide guard; (3) a bad row in the run records; (4) orphaned workers and the `feat/{PARENT_FID}` worktree after an abandoned run; (5) tracker comments not posting. `DETAILS.md` (root, hand-authored, Q9) lists the limitations and is the natural home for one short recovery section.
- **Docs to update with the change:** `docs/observability.md` (§ Signals, § Alerts, a `[bkit-manage]` prefix section with grep patterns), `.bkit/workflows.md` § Concurrency lock (manage liveness), `.bkit/providers.md` (already listed), `.bkit/prompts.md` (already listed).
- **Files with a lifecycle nobody owns yet:** the outbox folder `manage/{PARENT_FID}/` (`active`, `watch.pid`, `private.jsonl`) and the manager's `feat/{PARENT_FID}` worktree. The design says when they appear, not when they are removed (finding 13).

## Verdict Reasoning

CONCERNS. The core shape is operable: derive-on-read state, a bounded due list of facts, the single tests lock as slot authority, engine-printed worker lines with a rejected-line item, a push check for foreign commits that never rewrites local `dev`, and a closing sequence restartable from rows. Context resets, landings and pushes have clear recovery paths. The design also meets the open-question format: all nine open questions carry one lettered option per line, a lettered `Recommended` and a `Default if unanswered`.

It is not `PASS` because the failure paths that matter most for an unattended run are missing or silent: a new session cannot take over an open run (finding 1); the lock that keeps a second manager out depends on rows the manager does not write (finding 2); the owner has no signal when the manager itself dies (finding 3); the hard limits switch off on a heartbeat only the watcher refreshes (finding 4); one malformed row can brick the run's memory with no allowed repair (finding 5); and no log prefix, counter or `docs/observability.md` change is specified (finding 6). Findings 7 to 9 close crash windows that break the "no issue lost or started twice" criterion and the "every deviation has a comment" criterion.

It is not `FAIL`: each gap closes with a paragraph, a verb or a due-list item inside the existing architecture. Nothing requires a different design. The CRITICAL section items should be folded into the next design version before planning.

## CRITICAL

1. **No takeover or end path for an open run (CRITICAL).** Preflight refuses when "an earlier run of the same parent [is] still open" (line 189), and no verb adopts, ends or abandons a run. The context-reset flow (lines 240-244) covers only the same session id. A crash, an app update, an archived session or a new chat leaves the run open, the workers orphaned and the clone-wide guard live until the heartbeat goes stale. Add a `manage kickoff --resume` (adopt: rewrites `active.session`, re-reads state, flags orphaned workers) and a `manage end` (close or abandon with a reason row, clear `active` and `watch.pid`, release the lock). State when each is allowed. Done when the design names both verbs, their preconditions and the `manage-run` row each writes.
2. **Manager lock liveness is undefined (CRITICAL).** Design lines 63 and 282 say a second manager is "refused with exit 8 while the first is live" and that `/bkit-manage` is "not a numbered step pipeline". `locks.ts:264-278` treats a holder as live only if its run is `IN_PROGRESS` with a step row under `WORKFLOW_LOCK_IDLE_S` (1800 s); no run is `orphaned`, and an in-progress run with no step row is `stale`, and both are reclaimed at once. A manager that writes only `manage-*` rows is reclaimable by the second `/bkit-manage #N` immediately, which means two managers on one parent, double-started workers and two pushers. Quiet stretches over 30 minutes are normal (builds run for hours), so the answer cannot be "write a row on every event". State what keeps the lock live (for example the watcher's `timeout` wake writes a step row, or `locks acquire` learns a `manage` liveness rule from the `active` heartbeat) and align the two liveness signals so they cannot disagree. Done when the design names the one liveness source and the timeout value.
3. **The owner cannot tell that the manager died (CRITICAL).** Every owner-facing signal comes from the manager. If it dies, sleeps or wedges, the owner sees silence on the parent issue and cannot distinguish "building quietly" from "stopped". The design rules out cloud loops (input), so the in-run answer is cheap: put the heartbeat time and the next expected report time in every report and in the progress line, so a stale latest comment is itself the alarm; have `manage push`, `manage report` and each watcher wake refresh a "last alive" line; have the SessionStart and Stop hooks post one best-effort "manager stopped at {time}, reason" comment where they can. Done when the report format carries "last alive" and "next report by", and the design says which hook posts a stopped line.
4. **The hard-limits tier fails open at the wrong moments (CRITICAL).** Line 129 turns the tier off when `active`'s heartbeat is older than "a fixed limit" (value unstated), and line 194 says `manage watch` writes the heartbeat. The watcher exits whenever something is due, so during a long manager turn (a review, a landing, a push, a laptop sleep) no process refreshes it, and the limits switch off exactly when the riskiest commands run. A malformed or unreadable `active` file has no stated behaviour either (hook errors normally do not block). Make the heartbeat refresh from every `manage` verb and from any manager-session hook event; state the limit, longer than the longest legitimate turn; fail closed while the run's marker exists and the file is unreadable; and record the off state as a `GUARD-OFF since {time}` due item and a report line, not only a stderr warning. Done when the design states the refresh sources, the limit value and the malformed-file rule.
5. **One bad row can brick the run's memory with no allowed repair (CRITICAL).** The `manage` fold exits non-zero on any malformed row (line 170) while the guard tier denies hand edits of `*.jsonl` (line 277) and the limits forbid editing a ledger line (input). A torn append, a full disk or a `merge=union` accident leaves `manage state`, the single recovery call after every reset, failing with no sanctioned fix. The repo already has the opposite convention for read paths (`docs/observability.md`: `[bkit-roadmap] .bkit/issues.jsonl: N malformed line(s) skipped`; `readRunsLenient` in `locks.ts`). Keep the fail-closed write validation, make `manage state` read leniently with a `DEGRADED row {n} skipped` banner that names the line, and add the repair path (a superseding row appended by `manage record`, never an edit). Done when the design says what `state` prints for a bad line and how the owner or manager supersedes it.
6. **No log prefix, counters or observability doc change (CRITICAL).** See Observability Coverage. Add: the `[bkit-manage]` prefix for the noun and one for the hook tier with grep patterns for each failure mode above (guard off, heartbeat stale, fold degraded, push stopped on foreign commit, report unposted, watcher exit reasons); counters for resets survived, rejected worker lines, assumptions, deviations, flaky re-runs, push reds and parked issues, written at `manage close` into `.bkit/stats.jsonl` or stated as not recorded; a line in the change list for `docs/observability.md` § Signals, § Alerts and § Log Format; the run id (parent FID) on every hook refusal line. Done when each is listed in Components or a Decisions row.
7. **Crash windows between a side effect and its row break "no issue lost or started twice" (HIGH).** Rows for starting a worker, sending a go, posting a report and recording a landing are written by the manager after the effect (lines 157, 161, 162, 165). A crash in between leaves the effect with no row. Because state is derived on read (D3), the child's own log would show a shipped issue that `manage-landed` does not, and the due list could ask for it to be shipped again. State the ordering per effect (engine writes an intent row first, the manager confirms) and add reconciliation items to `manage state`: `LANDED-UNRECORDED` (child log shows landed, no `manage-landed`), `GO-UNACKED` (go recorded, worker silent for N minutes), `WORKER-UNBOUND` (a worker session the run has no row for). Done when each of the four effects has a stated order and a due item that catches a crash in between.
8. **No stalled-worker signal (HIGH).** The due list reacts to worker lines and status changes but has nothing for a worker that went quiet: a dead session, a refused permission, a gate killed at the 3600 s tests-lock hold limit (exit 124) or a worker waiting for a go the manager never sent. The watcher only wakes on `timeout`. Add `STALLED worker-NN #N idle={min} step={step}` computed from the child's last status row using the same 1800 s idle constant that `locks.ts` uses (`WORKFLOW_LOCK_IDLE_S`), so one definition of "stuck" serves both. Done when the due list shows the item and names the constant.
9. **Tracker-write failure has no defined behaviour (HIGH).** Criterion 3 says every deviation has an issue comment, and `manage-deviation.comment` is a URL (line 160), but writes are best-effort (line 130) and the GitHub MCP in this very design run returned 401 (line 16). With the owner away, a failed report or deviation comment is lost, and the row cannot be written as designed. Add an `unposted` state on `manage-report` and `manage-deviation` (`comment: null`), a due item `UNPOSTED n` that retries on each wake, posting through `bkit issues comment --post` so its existing posted-once dedupe applies on retry, and the report text also printed to chat. Done when the row shapes allow `comment: null`, the due item exists and the retry rule is stated.

## OPTIONAL

10. **Stop hook has no bound on refusals (MEDIUM).** D13 (line 278) refuses the turn while work is in flight and no live watcher exists, with no cap and no escape if the watcher cannot start or "in flight" is miscounted. State a maximum of consecutive refusals (check the host's hook input for a loop flag in the plan's first task, which also covers the unverified hook behaviour already in Risks), after which the hook allows the stop and writes a `manage-stop-overridden` row plus a due item.
11. **Watcher failure modes are not named (MEDIUM).** Line 194 lists four reason codes. Add `watcher-error` (crash exit must wake the manager and be restarted), a start-time check that refuses a second watcher when `watch.pid` is alive (and checks the pid belongs to this run, because pids are reused), and the `timeout` interval, which must be shorter than the lock idle limit in finding 2.
12. **How the owner is actually notified is not stated (MEDIUM).** The design posts reports under the owner's token (Risks, first bullet) and relies on a chat link. GitHub does not usually notify an author of their own comment (unverified in this run), so the phone may not buzz when a decision is waiting. Also unstated: whether several triggers in a short window fold into one report.

    Open question: What should wake the owner when a decision is waiting?
    A) The chat message from the manager plus the report link, with reports folded to at most one per 15 minutes — uses what exists today; relies on the app notifying the owner.
    B) Also add an `@mention` of the owner login in the report — may notify when a different token posts; may do nothing under the owner's own token.
    C) A separate bot token for reports — notifies reliably; adds a credential, which `docs/security.md` limits.
    Recommended: A, and prove in the plan's first task whether the app and the tracker notify; move to C only if neither does.
    Default if unanswered: A.
13. **Run-end cleanup is unowned (MEDIUM).** State when `manage close` and the new `manage end` remove `active` and `watch.pid`, what happens to `private.jsonl` (keep until the owner confirms he read it), and what removes the `feat/{PARENT_FID}` worktree and branch once the last bookkeeping commit has landed. Otherwise a finished run leaves a clone-wide guard marker and a stale worktree.
14. **Guard refusals for the owner's side agents need an explanation (MEDIUM).** Open question 6 recommends clone-wide limits. The refusal text must name the managed run, the parent issue, the heartbeat time and the command that ends the run (finding 1), so an agent or the owner can act without reading hook source.
15. **Journal volume and completeness noise (MEDIUM).** The command journal writes `engine-call` rows to the active run's `status.jsonl` (`docs/observability.md` § `[bkit-telemetry]`). If `manage state`, `manage watch` and `manage hear` journal, the parent log grows by hundreds of rows a day and each push's bookkeeping commit carries them (not checked in this review; read the seam before the plan). Also say how `bkit completeness check` and the CI `Check Status Holes` sweep treat a run that is not a numbered step pipeline, so the advisory step does not report holes on every manage run.
16. **Audit the flaky re-run (MEDIUM).** The "re-run once" rule (line 40, risk at line 378) can hide a real failure if `docs/failures.jsonl` is incomplete. Write a `manage-flaky-rerun` row per re-run (test names, first and second result) and list the count in the report.
17. **Report content for the owner as on-call (LOW).** Add to each report one health line: heartbeat age, guard state, watcher state, tests-lock holders, count of landed-unpushed commits, age of the oldest unanswered question. These are all derivable on read and answer "is it alive and what is it waiting for" at a glance.
18. **Open-question coverage (LOW).** Nine open questions exist and each has lettered options, a recommendation and a default. None covers the manager-takeover case (finding 1) or the owner-notification channel (finding 12). Add both.

## OUT OF SCOPE

- A cloud-side watcher or scheduled job that detects a dead manager (the input rules out cloud loops and wake-ups on tracker events; finding 3 uses only in-run signals).
- Cost, token and budget alerts for the run (the input rules out budget caps and cost control).
- Rollback of a landed issue found wrong later (the input rules out named rollback paths; the existing `docs/deployments.md` § Dev rollback runbook applies).
- Operability on OpenCode, Codex, Cursor and Antigravity (D15 renders no `/bkit-manage` there).
- A cross-run view of manager runs in `harvest/` or `bkit stats` beyond the counters in finding 6.
- Whether the Claude desktop app's wake rule, session start and archive behaviour hold in later app releases; the design records them as measured facts with dates in `DETAILS.md`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** No takeover or end path for an open run
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:189` · **Round:** 1
  - **DONE WHEN:** The design names a resume/adopt verb and an end/abandon verb, their preconditions, and the manage-run row each writes; preflight no longer strands a run whose manager session is gone.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Manager lock liveness is undefined (locks.ts:264-278 reclaims a run with no step row)
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:63` · **Round:** 1
  - **DONE WHEN:** The design names the single liveness source for the manage lock (step row written on watcher timeout, or a manage rule in locks acquire reading the active heartbeat) and the timeout value, shorter than WORKFLOW_LOCK_IDLE_S (1800 s).
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** The owner cannot tell that the manager died
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:255` · **Round:** 1
  - **DONE WHEN:** Every report and the progress line carry last-alive time and next-report-by time, and the design names which hook posts a best-effort 'manager stopped' comment.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Hard-limits tier fails open when the heartbeat goes stale between watcher runs
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:129` · **Round:** 1
  - **DONE WHEN:** The design states which events refresh the heartbeat (every manage verb and manager-session hook events), the stale limit value, the fail-closed rule for an unreadable active file, and a GUARD-OFF due item plus report line.
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** One malformed row bricks manage state while hand repair is denied
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:170` · **Round:** 1
  - **DONE WHEN:** The design says manage state reads leniently with a DEGRADED banner naming the bad line, keeps fail-closed validation on write, and defines a superseding-row repair path.
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** No log prefix, counters or docs/observability.md change specified
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:125` · **Round:** 1
  - **DONE WHEN:** The design lists the [bkit-manage] and hook prefixes with grep patterns per failure mode, the run counters (or states none are recorded), and docs/observability.md Signals, Alerts and Log Format in its change list.
  - **TEST FIRST:**
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** Crash windows between a side effect and its row can start or ship an issue twice
  **Severity:** HIGH · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:162` · **Round:** 1
  - **DONE WHEN:** Each of start-worker, go, report and landed has a stated write order, and manage state has LANDED-UNRECORDED, GO-UNACKED and WORKER-UNBOUND items that catch a crash in between.
  - **TEST FIRST:**
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** No stalled-worker signal in the due list
  **Severity:** HIGH · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:204` · **Round:** 1
  - **DONE WHEN:** The due list shows STALLED worker, issue, idle minutes and step, computed from the child's last status row with the WORKFLOW_LOCK_IDLE_S constant.
  - **TEST FIRST:**
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** Tracker-write failure has no defined behaviour for reports and deviation comments
  **Severity:** HIGH · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:130` · **Round:** 1
  - **DONE WHEN:** manage-report and manage-deviation allow comment null (unposted), a due item UNPOSTED retries via bkit issues comment --post on each wake, and the report text is also printed to chat.
  - **TEST FIRST:**
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** Stop hook has no bound on consecutive refusals
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:278` · **Round:** 1
  - **DONE WHEN:** The design states a maximum of consecutive refusals, the escape (allow stop, write a row and a due item), and the plan's first task verifies the host's hook loop flag.
  - **TEST FIRST:**
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Watcher failure modes are not named
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:194` · **Round:** 1
  - **DONE WHEN:** The design adds a watcher-error exit reason, a second-watcher refusal that checks watch.pid belongs to this run, and the timeout interval.
  - **TEST FIRST:**
<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** How the owner is notified of a waiting decision is not stated, and report coalescing is unstated
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:255` · **Round:** 1
  - **DONE WHEN:** A lettered open question with Recommended and Default covers the notification channel, and the design states whether triggers inside a short window fold into one report.
  - **TEST FIRST:**
<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** Run-end cleanup of the outbox folder, active marker and manager worktree is unowned
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:127` · **Round:** 1
  - **DONE WHEN:** The design states when manage close and manage end remove active and watch.pid, how private.jsonl is retained, and what removes the feat/{PARENT_FID} worktree and branch.
  - **TEST FIRST:**
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** Guard refusals seen by the owner's side agents need an explanation and an exit
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:349` · **Round:** 1
  - **DONE WHEN:** The refusal text names the managed run, the parent issue, the heartbeat time and the command that ends the run.
  - **TEST FIRST:**
<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** Journal volume and completeness check noise for a non-pipeline workflow are unchecked
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:282` · **Round:** 1
  - **DONE WHEN:** The design says whether manage state, watch and hear journal engine-call rows and how bkit completeness check and the Check Status Holes sweep treat manage runs.
  - **TEST FIRST:**
<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->
- [ ] **TASK 16:** The flaky re-run is not audited
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:378` · **Round:** 1
  - **DONE WHEN:** A manage-flaky-rerun row records test names and both results per re-run, and the report lists the count.
  - **TEST FIRST:**
<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->
- [ ] **TASK 17:** Report lacks a one-line health summary for the owner
  **Severity:** LOW · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:255` · **Round:** 1
  - **DONE WHEN:** Each report carries heartbeat age, guard state, watcher state, tests-lock holders, landed-unpushed count and oldest unanswered question age.
  - **TEST FIRST:**
<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->
- [ ] **TASK 18:** Open questions do not cover manager takeover or the owner notification channel
  **Severity:** LOW · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:317` · **Round:** 1
  - **DONE WHEN:** Risks & Open Questions lists both as open questions with lettered options, a Recommended and a Default if unanswered.
  - **TEST FIRST:**
<!-- bkit:task 18 end -->
