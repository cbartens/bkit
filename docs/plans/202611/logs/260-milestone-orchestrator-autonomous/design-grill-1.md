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
