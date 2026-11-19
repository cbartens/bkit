## Session Prompt — this run's, newer than everything below

/bkit-design #260

## Issue comment — posted 2026-11-19T08:29:29.000Z

## What to design: `/bkit-manage <issue>` (2026-11-19)

This comment is the whole input for the design run. The body and the earlier comments stay as a record, and workflows no longer read them. The evidence behind each point is in three earlier comments: [learnings, first day](https://github.com/cbartens/bkit/issues/260#issuecomment-6971586597), [learnings, second day](https://github.com/cbartens/bkit/issues/260#issuecomment-7001418594) and [the job description](https://github.com/cbartens/bkit/issues/260#issuecomment-7003437308).

### Goal

One new command, `/bkit-manage <issue>`. It takes a parent issue and drives that issue and all its sub-issues to closed.

- The manager (the session that runs the command) writes no feature code. It picks the order, starts the work, answers the workers, reviews every result, lands it and keeps the tracker true.
- It asks the owner everything it can at the start.
- It answers the easy questions from workers itself. It escalates only the ones that need a human.
- A whole milestone can be run by treating it as the parent.

What to deliver: the instructions and rules that let the manager run an issue to close, plus the engine commands those instructions call.

### Decided by the owner on 2026-11-19

<!-- prettier-ignore -->
| Topic | Decision |
| --- | --- |
| Who runs the loop | A Claude session on the newest Fable model (today `claude-fable-5-2`) at `high` effort. The manager must be smart and must make judgements. An engine command that owns the loop and calls a model only at decision points is rejected. |
| Scope | The 14 steps below, and nothing more. |
| Questions | Workers must be able to ask. Questions are expected and are fine. Workers run as unattended command-line runs (`claude -p`, `codex exec`) are rejected, because such a run cannot ask anyone. |
| Hosts | It may only make sense on Claude with Fable: the host must support it, and the model must be strong enough at managing other agents. The owner is open to an exception to the `Provider parity` rule in `.agents/rules.md`. |
| Status reports | The manager posts each report as a new comment on the parent issue and puts the link to that comment in the chat. That is easy to open on a phone and leaves a record. No separate status page. |
| Progress | An overall progress bar in the format the other workflows print, plus an estimated finish time that gets firmer as work lands. |

Out of scope, so the design does not bring them back:

- a loop in the cloud that wakes on GitHub events;
- a record of the owner's preferences across repositories, and any learning from past answers;
- budget caps and cost control;
- named rollback paths for work that turns out wrong later;
- audit lenses pointed at the plan before the run starts;
- Claude Code "agent teams" (experimental, cannot resume after a disconnect, approves plans by itself).

### What the design builds on

- **The v6.3 run.** One manager session drove milestone v6.3 by hand from 2026-11-17. It started `/bkit-build` in separate worker sessions, up to three at once, and landed 19 issues on local `dev`. This command is that run without the hand work.
- **The five workflows.** `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug` and `/bkit-ship` stay as they are, step for step. The manager chooses which one an issue needs. It does not skip or reorder steps inside one.
- **Per-feature locks.** Workflows on different issues can run at the same time on one clone (`.bkit/core/.bkit/workflows.md` § Concurrency lock).
- **Resume.** A half-done build handed to a new session picks up at its step and redoes nothing (`bkit status resume`).
- **Assumed answers.** A build already records an answer taken without the owner as `Decision: Accept (assumed)`. Today it knows two answerers: the owner, and a headless run that takes every recommendation.

### The job, in 14 steps

<!-- prettier-ignore -->
| # | Step | What the manager does | What the engine should provide |
| --- | --- | --- | --- |
| 1 | Check the run may start | Folder, branch, version, previous work closed | A preflight that refuses with the reason. It also checks tracker access, open advisories and acceptances that expire during the run. |
| 2 | Opening round | Read every sub-issue with read-only helpers. Ask the owner every open decision once. | A kickoff that does not block: issues with nothing to ask start at once. A "settled without asking" table with sources, and a count of questions left. |
| 3 | Keep memory in files | Re-read the run's files after every context reset | A run-state file: slots in use, workers and what each runs, the queue, open questions, assumptions, items owed before a landing. |
| 4 | Order and lane | Bugs, then blockers, then smaller before larger. Lane per issue: direct commit, build, plan or design. | A proposal of the next issues from blocked-by links, priority, size and file overlap with running builds. |
| 5 | Start and feed workers | One worker session per issue, in the main checkout. A brief per issue: the commit to cut from, files it may and may not change, when to report. | The count of clean workers, so the request for more is a rule that fires. |
| 6 | Never go idle | Keep a wake-up running whenever work is in flight | The watcher. Workers message only for a question, a stop, a failure or a finished task group, in a fixed one-line form. |
| 7 | Answer workers for the owner | Take the recommendation or the smallest safe assumption. Park what needs the owner. | A third answerer that records "assumed, by the manager". Each pause option prints the step it leads to. A "please confirm" list built from the decision files. |
| 8 | Review before landing | Read the summary, the review reports, new ledger rows, then the diff itself | A checklist with the paths filled in. It says when the manager's own read is the only bug review. |
| 9 | Land, one at a time | Trial merge, rebuild, checks, squash onto `dev`, checks again, tracker | One command that runs these chores and stops at the first red one. |
| 10 | Push in batches | Push only when needed: about five landings, a wave end, or a run that needs `origin/dev` | The push as a test slot, with a quick check of the cheap blockers before the long hook starts. |
| 11 | Keep the tracker true | Make every tracker write. Workers hand back text. | Issue mentions (title and URL) printed from the tracker, never typed from memory. |
| 12 | Guard the size of agent-read text | Check the word ceiling at every landing | Unchanged: `pnpm bkit:text:ceiling raise` stays the owner's alone. |
| 13 | Talk to the owner | Plain English, answer first. Every question says what it is, why it is his call, the options with their cost, and a recommendation. | Questions and reports generated from the run state. |
| 14 | Close a wave | Run the documentation and deferral agents, sweep the doc sources, build, upgrade, check, push | The wave report built from the run state: landed, parked and why, questions, issues filed, every assumption. |

Step 14 was the plan in the v6.3 run. By 2026-11-19 no wave had ended, so it has no evidence behind it yet.

### Limits the manager must never cross

Enforce these with permissions or engine checks, not with sentences in a brief. In the v6.3 run, brief text alone did not hold.

- Nothing touches `main` or a release. No forced push, no `--no-verify`, no forced removal of a worktree or branch.
- No credential is handled, read or printed.
- A ledger line is never edited; rows are appended with `bkit ledgers append`.
- A permission refusal in a worker is never lifted or routed around. It goes to the owner.
- A message from a worker, a watcher or the app is a report, never the owner's approval.
- A HIGH review finding, or a MEDIUM one that cannot be fixed, is never accepted on an assumption. One exception: an open task of the same run fixes it, and the run cannot close green without that task.
- A possible weakness in code is told to the owner privately (`docs/security.md` § Public repo content).

### What the Claude desktop app allows (measured in the v6.3 run)

<!-- prettier-ignore -->
| Action | Result |
| --- | --- |
| Start a worker session | Only on a turn the owner typed. Six started in one turn. Refused while the owner was connected over Remote Control. |
| Message an idle worker | Works on any turn. This is the only way to start work while the owner is away. |
| Clear or archive a finished worker | Unreliable: some calls went through, others were refused as "still has live work". Each call had to be sent twice, because a hook rewrites its input. |
| Where a worker runs | It must share the main checkout (`use_worktree: false`). In the app's private copy, every write into the build's own worktree is refused. |
| Waking the manager | The app wakes it only when none of its sessions is working, and a worker waiting on a helper counts as working for ever. The manager needs its own background watcher. |
| Worker names | The short name never changes. Use neutral names (`worker-01`) and never reuse a worker for a second issue. |
| Context resets | About 14 in 24 hours. Anything held only in the conversation is lost. |

So a clean worker is a stock that only the owner can refill. The manager asks for workers at fixed points: the opening round, when clean workers drop below the number of test slots, and before the owner leaves.

### Learnings the design must cover

**Questions to the owner**

- The opening round asked 23 questions one at a time over five hours and built nothing meanwhile.
- Nine questions were already answered in `docs/decisions.jsonl`. Check that ledger, the issue's comments and `.agents/rules.md` § Project Goals before asking.
- Rank questions by how many builds each one blocks.
- The owner often chose against the recommendation, so a recommendation is not a default.
- Before a large build, post three plain sentences on the issue saying what will be true afterwards and who writes what, and wait for a yes. One large build ran twice because this was missing.

**Answering workers**

- The manager needs to know where each pause option leads. It overrode a "Stop" with "Try again" and the build looped.
- Tell a worker to wait on a question it sent up, not to fall back by itself.
- When the rules change mid-run, running workers do not see it. Number each version and message every live worker.
- Name the exact forbidden command in an instruction. A loose "no hand tick" later made a worker's permission check refuse the workflow's own step.

**Scheduling and machine load**

- Schedule by files, not by "this one runs alone". List each running build's changed files and each candidate's planned files, and offer the candidates with no overlap.
- Every test run is a slot: builds, resumes, the push, the manager's own checks. About three builds at once is the measured limit on the owner's machine.
- The manager hands out gate slots with a go message. Workers do not each poll `uptime`.
- A gate that is red only on tests already recorded as flaky in `docs/failures.jsonl` is re-run once before it counts. See [Builds under machine load: helper timers and gates fail on the load, not on the code](https://github.com/cbartens/bkit/issues/1052).
- Write the next briefs while the slots are full, so a freed slot is filled in the same turn.

**Landing and pushing**

- Use one landing model for a run, with the manager doing every push. Builds landed on local `dev` while plan and design runs pushed from `origin/dev`, and the two copies of `dev` split.
- Every landing changes the engine under every running build. Compare a landing's engine diff with the steps the running builds are in.
- A run can end FAILED while every gate is green, because of an engine gap. Such a failure does not count toward "two failed runs, then park".
- Do not change files under `docs/` in the main checkout while the push hook's tests run there. Queue ledger rows and append them afterwards.

**A shared repository**

- Other sessions edit and commit in the main checkout during a run. Before landing or pushing, check for edits and commits that are not the manager's. Never stash, restore or revert them.
- Tell a worker before touching its branch.

**Timing, for the estimate**

- A size S build took about two hours. Three started together landed within two and a half hours.
- About two builds an hour finish at three slots.
- The largest build needed two runs and more than 21 hours.

### Progress and status, as the owner asked

- **Format today:** `Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3` (`.bkit/core/.bkit/workflows.md` § Progress Lines). That line describes a position inside one workflow and carries no time.
- **New for this command:** one line for the whole run, counted over issues, with an estimated finish. The estimate starts as a range from the sub-issues' sizes and the measured hours per size, and narrows as issues land.
- **Reports:** each one is a new comment on the parent issue, with its link posted in the chat.

### Open questions for the design

1. **Engine or prompt.** Which of the 14 steps become `bkit manage <verb>` commands? Settle this first, because it sets how long the manager's instructions are. The judgement stays with the manager; counting, slots, chores and report rows have one right answer.
2. **Run state.** Where the file lives, its shape, and how the manager re-reads it after a context reset.
3. **Pinning the model.** No workflow pins its orchestrator's model today, and `.bkit/core/.bkit/prompts.md:286` says Fable is used by hand, outside any `/bkit-*` run. [Model-independent orchestrators](https://github.com/cbartens/bkit/issues/905) moves judgement out of orchestrators. This command is the opposite case by design, so say how the two fit.
4. **Hosts.** For OpenCode, Codex, Cursor and Antigravity, state what each lacks (starting a session, messaging an idle one, a wake-up, a strong enough model), with a source. That is the evidence for the exception. Say what `/bkit-manage` does on a host that cannot run it.
5. **Local landing.** Step 9 replaces `/bkit-ship` for local runs until [Ship and debug in local mode](https://github.com/cbartens/bkit/issues/938) lands. Decide whether this command waits for that issue or ships its own landing command.
6. **The third answerer.** What changes in `/bkit-build` so the manager can answer a pause, and so each option prints where it leads.
7. **Sub-issues and permission.** Nothing files a design's suggested plans as issues today. The rules allow issue creation only after the owner's yes, and `bkit:auto` is never put on an issue when it is created. Decide where the manager's permission for child issues comes from.
8. **The estimate.** The method, and what it shows before any issue has landed.
9. **Report timing.** When a report comment is posted: at a landing, with a batch of questions, at a wave end.
10. **Closing tasks.** The owner asked earlier for tasks that always run at the end: work through items that workers deferred without good reason; check that tests are not all mocks, and send the issue to debug if they are; update the roadmap so it names the best next issue. Place these in step 14 or drop them.
11. **Agent-read text.** A new workflow adds words. The owner's rule from the v6.3 run: shrinking applies to existing core features, not to new ones he asked for.

### Related issues

- [Ship and debug in local mode](https://github.com/cbartens/bkit/issues/938): step 9 depends on it.
- [Model-independent orchestrators](https://github.com/cbartens/bkit/issues/905): see open question 3.
- [Automation triggers: self-healing loop, gates, scoped audits](https://github.com/cbartens/bkit/issues/324): shares the cloud trigger idea that is out of scope here.
- [Builds under machine load: helper timers and gates fail on the load, not on the code](https://github.com/cbartens/bkit/issues/1052): the load failures above.

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Engine or prompt: A — every piece with one right answer (counting, slots, next-issue proposal, landing chores, progress line, report text, preflight) is a `bkit manage <verb>` command; the manager's instructions hold only judgement. The owner noted this is the existing `.agents/rules.md` § Project Goals "Engine over agents" rule applied to this command.
- Q2 Pinning the model: superseded by Q8. A command-file `model:` pin lasts only the turn that ran the command ("The session model resumes when you send your next prompt", https://code.claude.com/docs/en/slash-commands.md); wake-ups and worker messages start new turns. Hooks see `effort.level` on tool events; `model` only on SessionStart and not always (https://code.claude.com/docs/en/hooks.md). The reliable pin is the launch: `claude --model claude-fable-5-2 --effort high` or the app's model picker.
- Q3 Other hosts: Claude only. Checked: none of OpenCode, Codex, Cursor, Antigravity can run it in the same form. Codex — app subagent threads are viewable, not typeable (https://learn.chatgpt.com/docs/agent-configuration/subagents). OpenCode — no built-in wake-up (community plugins only); driving another session only via its HTTP server (https://opencode.ai/docs/server). Cursor — workers cannot push to the manager ("Webhooks are coming soon"), manager must poll, cloud agents only (https://cursor.com/docs/cloud-agent/api/endpoints). Antigravity — closest: typeable subagents, parent messaging, `/schedule` wake-up; but subagents are children of one conversation, no documented question tool, model tiers only inherit/flash/pro (https://antigravity.google/docs/subagents.md). `bkit install` writes `/bkit-manage` only for Claude; `.bkit/providers.md` records the exception and the gaps.
- Q4 Local landing: superseded by Q10.
- Q5 Permission to file sub-issues: A — one owner yes per run, asked in the opening round ("may I file the suggested plans of designs in this run as sub-issues of #N?"), stored in the run state, this run only; filed issues never get `bkit:auto`; each is listed in the next report.
- Q6 Closing tasks: A — all three: work through items workers deferred without good reason; check that tests are not all mocks and route the issue to `/bkit-debug` if they are; update the roadmap so it names the best next issue.
- Q7 Report timing: A — a new comment on the parent issue, link in chat, at each push batch, whenever a batch of questions waits for the owner, when an issue is parked, and at run end.
- Q8 Enforcing the model: B — no model or effort checks; the docs give the launch line (`claude --model claude-fable-5-2 --effort high`) and the preflight only warns.
- Q9 Which Claude surface: A — Claude desktop app (Code tab) only; the preflight refuses elsewhere with the reason. Every limitation of `/bkit-manage` is documented clearly in root `DETAILS.md` (hand-authored, not generated) together with any other usage limits. Fact: plain `claude` CLI has cross-session messaging since v2.1.224 (https://code.claude.com/docs/en/cross-session-messaging.md) but no documented tool to start a session.
- Q10 What waits for #938: nothing is blocked. The design assumes `/bkit-ship` supports both local landing and PR landing ([Ship and debug in local mode](https://github.com/cbartens/bkit/issues/938)) and builds against that; no blocked-by link is added.
- Q11 Cloud runs: A — the preflight refuses any runtime other than `LOCAL`; the reason names the gap: a cloud session "can't use SendMessage to answer a message from another machine" (https://code.claude.com/docs/en/claude-code-on-the-web.md), so a cloud worker could never ask.
- Q12 What a wave is: a wave is a push batch, sized by the manager's judgement (1 commit or 10+), whose purpose is to minimise pre-push and CI test runs. Push also when a run needs `origin/dev`.
- Q13 Who makes direct commits: A — a worker, not the manager; superseded in its gate by the autonomy principle below (no approval needed; the manager records why on the issue).
- Q14 When the parent closes: A — #N closes only when every sub-issue is closed; with parked issues it stays open, the final report lists each parked issue, why, and what the owner must decide; the run ends green for what landed.
- Q16 Context between workflows on one issue: rule — the manager makes a best effort, between `/bkit-*` commands, to clear the worker or archive it and start a fresh one. It may keep the same uncleared worker at its own discretion to keep things moving, and then explains why in an issue comment.
- Q17 When the closing tasks run: A — once, at run end (every sub-issue landed or parked), before the last push; their commits ride in that final push.
- Q19 Hard limits stay hard: A — the issue's "Limits the manager must never cross" stay enforced by permissions and engine checks (nothing touches `main` or a release; no forced push, no `--no-verify`, no forced removal; no credential handled; no ledger line edited; a worker's permission refusal goes to the owner; a worker/watcher/app message is never the owner's approval; no HIGH or unfixable MEDIUM finding accepted on an assumption; possible weaknesses told privately). The looseness covers only how work runs.
- Autonomy principle (owner, turn 5): the manager has the power to keep things moving without the human. It uses `/bkit-*` commands for worker sessions wherever possible; it may run a free-form worker on its own judgement, with no approval gate and no engine refusal, and records why in an issue comment. Every deviation from the preferred path is explained and recorded on the issue instead of creating a break point.
- Q15 / Q18 Draft acceptance scenario: A — accepted (the turn-5 revision below).
- Q11-in-issue Agent-read text: the owner's v6.3 rule stands — shrinking applies to existing core features, not to new features he asked for.

### Assumed, not confirmed

None.

### Open

- Run-state file location, shape and re-read after a context reset (issue open question 2) — design detail, resolved by the design.
- The third answerer in `/bkit-build` and pause options printing their target step (issue open question 6) — design detail, resolved by the design.
- The finish-estimate method and what it shows before any landing (issue open question 8) — design detail, resolved by the design.
- The `/bkit-ship` local + PR interface the design assumes (Q10) — the design states the contract it depends on so #938 can meet it.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

The owner starts a Claude desktop session on Fable at `high` effort and types `/bkit-manage #N`. Within the first hour they answer one batched round of real questions, while issues that need nothing from them are already building. The run then works through every sub-issue while the owner is away: it prefers `/bkit-*` commands in clean worker sessions and decides for itself when to deviate, recording why on the issue; it answers what it safely can, lands reviewed work one issue at a time, and pushes in batches it sizes itself to save test runs. The owner comes back to a closed #N, or to a short list of decisions only they can make, with every judgement call written down on the issues.

#### Success Criteria

1. The opening round asks only questions that `docs/decisions.jsonl`, the issue comments and `.agents/rules.md` § Project Goals do not already answer; issues with nothing to ask start before the owner replies.
2. After any context reset, the manager carries on from the run-state file alone; no issue is lost or started twice.
3. Every step with one right answer is a `bkit manage <verb>` command; every deviation (a free-form worker, a worker not cleared or replaced between commands) has an issue comment saying why.
4. No landing reaches `dev` without the review checklist, and no HIGH finding (or unfixable MEDIUM one) is accepted on an assumption.
5. Pushes carry as many landed issues as the manager judges safe; reports show one progress line counted over issues, plus a finish estimate that narrows as issues land.

#### Key Edge Cases

- A worker's question needs the owner while they are away: it is parked with its options and where each leads, and other issues keep moving.
- Another session commits in the main checkout during a landing or push: the landing stops and their work is left untouched.
- A landing changes the engine under running builds: the engine diff is compared with each build's current step before the next go message.
- A gate is red only on tests already recorded as flaky: it is re-run once, and an engine-gap failure does not count toward "two failed runs, then park".
- Clearing or archiving a worker fails, or no clean workers are left: the manager carries on in the same worker, records why, and asks the owner for workers at the fixed points.
- The repo lands locally or through PRs: one landing model is used for the whole run.

#### Process Sketch

- WHEN `/bkit-manage #N` starts outside the desktop app or off a local machine → THEN the preflight refuses with the reason; on the wrong model or effort it only warns.
- WHEN the opening round has read the sub-issues → THEN it shows the "settled without asking" table and asks the open questions in one batch, while issues with nothing to ask start.
- WHEN a slot frees up → THEN the next issue with no file overlap starts in a worker with a `/bkit-*` brief, or with a free-form brief whose reason is commented on the issue.
- WHEN a worker finishes a `/bkit-*` command and the issue needs the next one → THEN the manager clears or replaces the worker if it can, and otherwise comments why it did not.
- WHEN every sub-issue is landed or parked → THEN the closing tasks run, the final report is posted, and #N closes only if nothing is parked.
