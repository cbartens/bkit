Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-spike: unsettled claims remain
- design-organise CONCERNS
- 2 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-grill-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-review-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v3-organised.md` |

## Resolved Findings

- design-review CONCERNS, resolved by design-apply-review

## Reassessed Findings

- design-spike: design impact addressed by design-apply-review; unsettled claims remain

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| design-start-workflow | - | - | - |
| design-worktree-setup | - | - | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-input-1.md` |
| design-grill | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-grill-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-input-1.md` |
| design-brainstorm-ideate | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-brainstorm-ideate-3.md` |
| design-generate | - | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md` |
| design-review | CONCERNS | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-review-1.md`, `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-review-2.md` |
| design-spike | FAIL | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-spike.md` |
| design-apply-review | PASS | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v2-reviewed.md` |
| design-organise | CONCERNS | 1 | `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v3-organised.md` |

## Suggested Plans

### P-1: Live desktop-app checks

Covers: WS-1 (Live desktop-app checks)
Requires: []

### P-2: Tracker children and field reads

Covers: WS-4 (Tracker children and field reads)
Requires: []

### P-3: Machine-lock `holders` subcommand

Covers: WS-6 (Test-slot holders)
Requires: []

### P-4: Per-workflow host allow-list

Covers: WS-15 (Per-workflow host allow-list)
Requires: []

### P-5: `/bkit-manage` with PR landing

Covers: WS-2 (Run records and the `manage` noun), WS-3 (Run identity, liveness and takeover), WS-5 (Manager answerer in decisions), WS-7 (Managed-run guard tier), WS-8 (Manager session hooks), WS-9 (Worker coordination and wake-up), WS-10 (Preflight, kickoff and queue), WS-11 (Owner reports, progress and estimate), WS-12 (Review, landing check and PR-mode landing), WS-13 (Run close and end), WS-14 (Managed-run ask points in phase workflows), WS-16 (`/bkit-manage` workflow and operator docs)
Requires: [P-1, P-2, P-3, P-4]

### P-6: Local landing and batch push for managed runs

Covers: WS-17 (Local landing and batch push)
Requires: [P-3, P-5]


## Open Questions

Open questions (the four the input left `Open` come first):

- **Where the run keeps its memory (input Open item: run state).** The manager needs a record it can re-read after every context reset. This design keeps it as rows in the parent's own status log, inside a worktree that holds only the manager's records (D1).
  A) Rows in the parent's `status.jsonl` in the manager's `feat/{PARENT_FID}` worktree — follows the owner's "engine facts go in status.jsonl" rule; costs one extra worktree per run.
  B) A private journal in Git's common directory — never touches the checkout; a second home for structured facts, which the owner's rule turns down.
  C) The tracker — visible on the phone; best-effort writes can lose state, and private notes cannot live there.
  Recommended: A — it is the placement design and plan already use, and it keeps every write out of the main checkout during pushes.
  Default if unanswered: A.
- **How the manager answers a worker's pause (input Open item: the third answerer).** The manager must be able to answer a build's pause without its answer ever being mistaken for the owner's (D5, D6).
  A) A third answerer on the existing decision command, `--by=manager`, which writes `Accept (assumed) — by the manager: {reason}` (listed by today's readers), refuses an assumed accept of a hard blocker, a HIGH or unfixable finding or a verify gap, and prints the step each option leads to — one mechanism, enforced limit.
  B) The manager messages the answer and the worker writes it — no engine change; the worker cannot tell the manager from the owner.
  C) A separate decision file kind for the manager — clean separation; a second reader in every place that reads decision files.
  Recommended: A — it extends what `--by=headless` already does and makes the limit an exit code.
  Default if unanswered: A.
- **How the finish time is estimated (input Open item: the estimate).** The owner wants a finish time that firms up as work lands (D14).
  A) A range from hours per size, divided by free slots and floored at the longest chain of blocked issues, replaced by measured hours as issues land — honest early, narrows over the run.
  B) A single time — easy to read; wrong by hours early on.
  C) Nothing until the first landing — never wrong; no answer in the first two hours.
  Recommended: A — it is the only option that answers from the start and gets firmer.
  Default if unanswered: A.
- **What this design needs from local landing (input Open item: the ship contract).** Landing goes through ship (Q10). Local landing for every workflow is the #924 design, and it needs four open issues in order: #849, then #936, then #937, then #938, plus #924 P4's range read for batch pushes. None of them is built yet.
  A) Build against the #924 design, and land through PRs for any run that starts before the whole chain and P4 are on `dev` — nothing waits; early runs cost a CI run per landing.
  B) Make #260 wait for the whole chain — no PR-mode period; contradicts Q10's "nothing is blocked".
  C) Give `/bkit-manage` its own landing command — no dependency; a second landing implementation.
  Recommended: A — it follows Q10 and avoids duplicate landing code.
  Default if unanswered: A.
- **What to do when another session's commit sits on local `dev` at push time.** A batch push publishes everything on local `dev`, including commits the run did not make (D10).
  A) Stop the push, list the commits, and ask the owner in the next report — nothing is published without him; the push waits for his answer.
  B) Push only the run's own commits by replaying them — no wait; local `dev` and `origin/dev` then split, which the v6.3 run showed is painful.
  C) Push everything — no wait; publishes work nobody reviewed.
  Recommended: A — publishing is the owner's call, and the wait costs only the push, not the builds.
  Default if unanswered: A.
- **Whether the limits should also bind the owner's own agent sessions in the same clone during a run.** The guard is clone-wide while a run is live (D12), so an agent session the owner runs beside the manager is refused `--no-verify` too.
  A) Clone-wide — workers are covered with no registration; the owner's side agents are bound for the run (his own terminal is not).
  B) Only sessions the run registered — the owner's side agents stay free; a worker the manager forgot to register is unguarded.
  Recommended: A — an unguarded worker is the failure the v6.3 run hit; the owner keeps his terminal.
  Default if unanswered: A.
- **How to run a whole milestone, which has no issue to comment on.** The input says a milestone can be run as the parent, but reports are comments on the parent issue and FIDs come from issues.
  A) The parent must be an issue; `--milestone=<name>` adds that milestone's open issues to its children — reports have a home; the owner names an umbrella issue.
  B) Allow a bare milestone; reports go to chat only — no umbrella needed; loses the phone-readable record.
  C) The manager files an umbrella issue — automatic; needs an extra owner yes, because issue creation needs one.
  Recommended: A — bkit's tracker already keeps umbrella issues per theme, and it keeps the report record.
  Default if unanswered: A.
- **What the preflight does if the desktop-app signal is missing.** The refusal rests on `CLAUDE_CODE_ENTRYPOINT=claude-desktop`, seen in this session but not documented; an app release could rename it (D16).
  A) Refuse, naming the missing variable — matches Q9; a rename blocks every run until bkit is updated.
  B) Warn and go on — never blocks; a run could start where workers cannot be started.
  Recommended: A — Q9 asks for a refusal, and the message tells the owner exactly what changed.
  Default if unanswered: A.
- **When to ask for the word-ceiling raise this feature needs.** A new workflow and about a dozen verbs add agent-read text; the owner's rule exempts new features from shrinking, but the ceiling gate will still fail, and `pnpm bkit:text:ceiling raise` is his alone.
  A) Ask once, as a single owner question when the build's text is final — one interruption, at a known point.
  B) Shrink other text to fit — no question; breaks the owner's rule that new features are not shrunk.
  Recommended: A — it follows the owner's rule.
  Default if unanswered: A.
- **When a new session may take over a run whose manager stopped.** If the manager crashes or the app restarts, a new session has to adopt the run. The design lets it do so once the old manager has been silent for 30 minutes, so two managers can never act at once (D26).
  A) Only after 30 minutes of silence — two managers can never overlap; after a crash the owner waits up to 30 minutes.
  B) At once when the owner's typed launch line says `resume` — no wait; the engine cannot prove the owner typed it, and a still-live old manager would be locked out only by the session check.
  C) At once, with the old manager's workers paused until the new one reconciles them — no wait, little overlap risk; more engine work.
  Recommended: A — the wait is rare and short next to a day-long run, and it keeps one rule for "dead manager" in the lock and the takeover.
  Default if unanswered: A.
- **What should alert the owner when a decision is waiting.** Reports are posted under the owner's own token, and GitHub usually does not notify people of their own comments (not checked in this run), so his phone may not buzz.
  A) The manager's chat message plus the report link — uses what exists; relies on the desktop app notifying him.
  B) Also `@`-mention the owner's login in the report — may notify; may do nothing under his own token.
  C) A separate bot token for reports — notifies reliably; adds a credential, which `docs/security.md` limits.
  Recommended: A, with the plan's first live task checking whether the app or the tracker notifies; move to C only if neither does.
  Default if unanswered: A.
- **What happens if a worker's message does not wake an idle manager** (`design-spike.md` C3, not yet tested). The design expects a worker's message to start a turn on a manager that is idle apart from its background watcher. Only owner-started Code-tab sessions can test this.
  A) Rely on the outbox copy: `manage say` writes every line to `inbox.jsonl` and the watcher exits on it — works whether or not the message wakes the manager; adds a file write per report.
  B) Rely on the message alone — simpler; a held or dropped message stalls the issue until the 600 s timeout.
  Recommended: A — it is already in the design (D27) and covers both outcomes.
  Default if unanswered: A.
- **What happens if the Stop hook does not fire in the Code tab** (`design-spike.md` C5, not yet tested). The hook blocks correctly on the Code tab's own binary run headless, but firing inside the Code tab is unproven. If it does not fire, nothing stops the manager going idle with work in flight.
  A) Keep the hook and add a backstop: the watcher's `timeout` exit and the workflow's first-call rule restart the loop on the next wake — partial cover; an idle manager with no live watcher still sleeps until the owner types.
  B) Make the plan's first live task a gate: if Stop does not fire, stop the build and ask the owner — no silent gap; delays the build.
  Recommended: B — it is the most common v6.3 failure, so the design should not proceed on an unproven guard.
  Default if unanswered: B.
- **What happens if SessionStart does not fire on compact or resume in the Code tab** (`design-spike.md` C7, not yet tested). The injection and the session-id match work on the Code tab's binary run headless; the Code tab itself is unproven.
  A) Keep the fallback: every turn starts with `manage state`, and the watcher's exit prints the briefing — covers a miss at the cost of one extra call per turn.
  B) Gate the build on a live check, as for Stop — certainty; a delay for a risk the fallback already covers.
  Recommended: A — the fallback is in the design already.
  Default if unanswered: A.
- **What happens if a background task's completion does not wake the manager while a worker is working** (`design-spike.md` C8, measured once in v6.3, not documented). The watcher is then not a wake-up at all, and only a worker's message or the owner can wake the manager.
  A) Gate the build on a live check in the plan's first task — certainty; delays the build.
  B) Add worker messages as the only wake-up when the check fails: every worker sends a line at each report point — no new mechanism; long builds leave the manager asleep for hours.
  Recommended: A — the whole unattended loop rests on this wake-up.
  Default if unanswered: A.
- **What happens if messaging pauses with "keeps answering other sessions"** (`design-spike.md` C9, not yet tested). The app may stop delivering messages until the owner types a prompt, which breaks the "away all day" promise.
  A) Detect it, show `NEEDS-TYPED-PROMPT`, and post a report asking the owner to type one line — honest; the run waits for him.
  B) Also budget exchanges per typed prompt and slow the manager down as the budget runs out — fewer pauses; slower runs, and the threshold is unknown.
  Recommended: A, and measure the threshold in the plan's first live task before adding B.
  Default if unanswered: A.
- **How the Jira children read is verified** (`design-spike.md` C12). The Jira key answered `401 invalid_token`, so listing a Jira parent's children with `parent = KEY` is unproven.
  A) Ship the Jira arm behind a live test that runs once a valid key exists — no delay for GitHub and Linear; Jira children stay unverified until then.
  B) Leave Jira out of the children read until verified; the preflight refuses a Jira parent — no unverified code; Jira users cannot run it.
  Recommended: A — the risk is confined to one adapter arm, and the read is a standard JQL query.
  Default if unanswered: A.

Risks and assumptions:

- **An owner answer cannot be proven by the engine.** Owner answers reach workers only through the manager, and tracker comments post under the owner's token. The engine can make a forged answer auditable (`manage-answer` carries the verbatim words and must follow a recorded question), not impossible. The limit "a message is never the owner's approval" rests partly on the manager's judgement.
- **Hook behaviour in the desktop app is partly verified.** The spike showed, on the Code tab's own `2.1.325` binary run headless, that a wrapped `Stop` hook blocks once per stop and that `SessionStart` injects context on `compact` and `resume` with a matching session id (`design-spike.md` C4, C6). Whether `Stop`, `SessionStart` and `SessionEnd` fire inside the Code tab must be checked live in the plan's first task (open questions above).
- **Documented messaging limits** (Claude Code cross-session and desktop docs), each with its fallback:
  - `Not delivered: this session keeps answering other sessions` needs a typed prompt → `NEEDS-TYPED-PROMPT` and a report asking the owner to type one line.
  - Held messages are dropped at the 5-minute `dialogExpiry` when two sessions' permission classes differ → the preflight warns off `acceptEdits`, and the `inbox.jsonl` copy keeps worker lines.
  - Sends are refused after a burst of 30 → the manager sends one message per due item, and a refused send is retried at the next wake.
  - At most 50 messages are queued → workers send one line per report point, and the outbox copy is the record.
  - The desktop listing shows only the 20 most recently active sessions → the manager addresses workers by the session id in `manage-worker`, not by the listing.
  - Archiving shows an approval card in `acceptEdits` → archiving a worker needs the owner, asked at the fixed points (Key Edge Cases).
- **The desktop-app facts are measured, not documented.** Starting a session only on an owner-typed turn, refusal under Remote Control, unreliable archive, the wake rule and the shared-checkout requirement come from one run, plus the environment variable names from this session. `manage-run` records the app version (`CLAUDE_CODE_DESKTOP_APP_VERSION`), and `DETAILS.md` lists each fact with its date.
- **Open issues change the shapes this design extends.** #958 may move decision lines into status rows, #1001 adds the route command, and #849, #936, #937, #938 add local landing. The plan must re-read each at build time and extend whatever shape is on `dev` then.
- **D35 narrows an earlier owner decision.** The #924 design keeps a batch-push command out of scope (`715-no-batch-publish-verb`); this design adds one for managed runs only, on the owner's newer Q12 answer. The build records the narrower scope in `docs/decisions.jsonl`.
- **An owner `/clear` changes the session id.** The manager-only hooks then go inert until `manage kickoff --resume` re-registers the session; `DETAILS.md` records this.
- **A batch of local landings widens the damage of one bad landing.** A defect the push hook finds sits under every later landing in the batch. `manage push` stops at the first red, reports it and never rewrites local `dev`; batch size stays the manager's judgement (Q12).
- **Machine load.** About three builds at once is the measured limit; the flaky re-run must take only recorded flaky tests as input, or it becomes a way to retry real failures (#1052). It depends on #1052's test identity field on `failures.jsonl` testing rows; until that exists, no red counts as flaky and every red stops the push (D40).
- **Step 14 has no evidence yet.** No wave ended in the v6.3 run; the closing tasks are restartable from `manage-closing` rows, and the first real run's end is their test.
- **Workers waiting on a question count as working for ever.** The app then never wakes the manager on its own; the watcher is the only wake-up, which is why D13 makes it a check.

## Documentation Warnings

- **model registry** (.bkit/core/.bkit/prompts.md § orchestrators 'fable, by hand' row names claude-f…) — `.bkit/core/.bkit/prompts.md`
  - Evidence: design-input-1.md § Decided by the owner (Who runs the loop) and Q2; the model id was not probed against the live model list in this run
  - Action: In the build, probe the live model list, then update the row and add a /bkit-manage orchestrator row with the launch line

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #260`
