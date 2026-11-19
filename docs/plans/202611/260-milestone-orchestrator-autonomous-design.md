<!-- bkit:anchor
baseSha: b95c9b3881417a7c56eeaaec90bc68eac7aa65cf
baseRef: origin/dev
bkitVersion: 6.2.0
bkitLatest: 6.2.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Design: `/bkit-manage <issue>` — a manager session that drives a parent issue and its sub-issues to closed

## Related Issues

- #924 — Let every workflow land on local dev without pushing (open); design `docs/plans/202611/924-every-workflow-land-design.md`
- #849 — Keep local dev synchronized after workflow close (open)
- #936 — Publish mode and local start base (open)
- #937 — Local landing target with design / plan local close (open)
- #938 — Ship and debug in local mode (open)
- #905 — Model-independent orchestrators (open)
- #1001 — Build: the engine routes the Decision Pause answer (open)
- #1038 — Build: Try again on a red-gate pause re-runs the gate before another fix round (open)
- #958 — Agents and the orchestrator write their own .md files; the engine checks and counts (open)
- #910 — Bookkeeping: the engine keeps what the orchestrator remembers (open)
- #1052 — Builds under machine load: helper timers and gates fail on the load, not on the code (open)
- #1068 — Let the operator switch off any workflow step that is safe to skip (open)
- #324 — Automation triggers: self-healing loop, gates, scoped audits (open)
- #639 — Land parallel workflow closes on dev without colliding (closed)
- #753 — Managed agents (open)

`related-issues.md` recorded `Search unavailable.` (the GitHub MCP returned 401). The list above comes from `gh search issues` and `gh issue view` run on 2026-11-19. The #924 chain (#849, #936, #937) and its titles come from the design spike's `gh issue view` read on 2026-11-19 (`design-spike.md` § Evidence C2).

## Acceptance Scenario

Built from the input's `Draft Acceptance Scenario` (accepted by the owner as Q15 / Q18). Each change is a `Decisions` row (D19-D22, D37, D38, D55).

### Narrative

The owner starts a Claude desktop session on Fable at `high` effort (`claude --model claude-fable-5-2 --effort high`, or the app's model picker) and types `/bkit-manage #N`. Within the first hour they answer one batched round of real questions, which includes a yes on the three-sentence end state of each large issue, while issues that need nothing from them are already building. The run then works through every sub-issue while the owner is away: it runs a full `/bkit-*` workflow for each issue in clean worker sessions, and decides for itself when to deviate, recording why on the issue; it answers what it safely can as its own recorded assumption, lands reviewed work one issue at a time, and pushes in batches it sizes itself to save test runs. The owner comes back to a closed #N, or to a short list of decisions only they can make, with every judgement call written down on the issues.

### Success Criteria

1. The opening round asks only questions that `docs/decisions.jsonl`, the issue comments and `.agents/rules.md` § Project Goals do not already answer, ranked by how many builds each blocks; issues with nothing to ask start before the owner replies.
2. After any context reset, the manager carries on from its run records alone (`bkit manage state`); no issue is lost or started twice.
3. Every step with one right answer is a `bkit manage <verb>` or an extended existing command; every deviation (a free-form worker, a worker not cleared or replaced between commands) has an issue comment saying why.
4. No landing reaches `dev` without the review checklist, and the engine refuses to record an assumed accept of a HIGH finding or an unfixable MEDIUM one; every answer a worker receives is recorded as the owner's or the manager's, never confused.
5. Pushes carry as many landed issues as the manager judges safe; each report shows one progress line counted over issues, plus a finish range that narrows as issues land.

### Key Edge Cases

- A worker's question needs the owner while they are away: it is parked with its options and the step each option leads to, and other issues keep moving.
- A worker receives the manager's answer to a pause: the answer is already recorded in the decision file as `Accept (assumed) — by the manager: {reason}` before the worker resumes, so the worker can never write it down as the owner's acceptance; in a managed run no agent session can record an answer as the owner's.
- The manager session dies, is cleared or is replaced: the latest report's "last alive" and "next report by" times show it to the owner, and a new manager session takes the run over with `bkit manage kickoff --resume` without starting any issue twice.
- Another session commits or edits in the main checkout during a landing or push: the landing or push stops, lists the foreign paths and commits, and leaves them untouched; a push never publishes a commit the run did not land without the owner's yes.
- A landing changes files that running builds depend on: the landing's diff is compared with each running build's changed files and step before its next go message.
- A gate is red only on tests already recorded as flaky (`docs/failures.jsonl`, `category: testing`): it is re-run once, and an engine-gap failure does not count toward "two failed runs, then park".
- Clearing or archiving a worker fails, or no clean workers are left: the manager carries on in the same worker, records why, asks the owner for the number of workers the due list prints at the fixed points, and names each session it could not archive by its title.
- A large issue is next in the queue and the owner has not said yes to its three-sentence end state: it waits, and other issues go first.
- A worker is refused a command by its permission mode or a hook: it reports the exact command, the refusal reaches the owner in the next report with the worker's session title, and the manager neither tries another route nor changes a permission.
- A running build is stuck on a defect that another issue fixes: the build is held, the fix is proven on a copy of the held build's plan and rows, landed, and the build is woken.
- The repo lands locally or through PRs: one landing model is chosen at kickoff and used for the whole run; PR landing is used until the whole local-landing chain (#849, #936, #937, #938) and #924 P4's `bkit fids parse --range` are on `dev`.
- The manager's turn would end with work in flight and no live watcher: the turn is refused until a watcher runs.

### Process Sketch

- WHEN `/bkit-manage #N` starts outside the Claude desktop app or off a local machine → THEN the preflight refuses with the reason; on an effort below `high` it only warns.
- WHEN the opening round has read the sub-issues → THEN it shows the "settled without asking" table and asks the open questions in one batch, while issues with nothing to ask start.
- WHEN a slot frees up → THEN the next issue with no file overlap starts in a worker on its recorded lane with a `/bkit-*` brief, or with a free-form brief whose reason is commented on the issue.
- WHEN a worker sends a question → THEN the manager records its own answer as an assumption and tells the worker to go on, or parks the question for the owner while other issues keep moving.
- WHEN a worker finishes a `/bkit-*` command and the issue needs the next one → THEN the manager clears or replaces the worker if it can, and otherwise comments why it did not.
- WHEN every sub-issue is landed or parked → THEN the closing tasks run, the final report is posted, and #N closes only if nothing is parked.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Manager instructions (judgement only) | None. Searched `.bkit/core/workflows/` (five phase workflows and `/bkit-auto`). `/bkit-auto` routes one FID to one phase and is rendered for every host. | `NEW` | No workflow drives other sessions. `/bkit-auto` takes the phase as input and never chooses it (`bkit-auto.md:109`), and it never starts, messages or answers another session, so it lacks the capability rather than merely a contract. New file `.bkit/core/workflows/bkit-manage.md`. |
| One-right-answer chores (`bkit manage <verb>`) | None. Searched `.bkit/core/engine/commands/registry.ts` and `commands/workflow/`. | `NEW` | No noun covers a run over many FIDs. New `.bkit/core/engine/commands/workflow/manage.ts`; every verb composes the existing commands below, so it adds no parallel mechanism. |
| Run records | `status.jsonl` and its fold (`.bkit/core/engine/ledgers/status.ts`); branch placement in `.bkit/core/.bkit/workflows.md` § `status.jsonl`; decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only`. | `EXTEND` | New `manage-*` row types in the parent FID's log, in the manager's own `feat/{PARENT_FID}` worktree, the same placement design and plan use. |
| Private run files | Git-common outbox, `outboxRoot()` in `.bkit/core/engine/commands/lib.ts`; `docs/architecture.md` § Tracker reporting boundary. | `EXTEND` | A `manage/{PARENT_FID}/` folder for the run-active marker, watcher pid and notes that must never be committed. |
| One manager per parent | `bkit locks acquire --kind=workflow` (§ Concurrency lock); liveness in `liveReason` (`locks.ts:251-279`). The spike showed a second `acquire --workflow=manage` against fresh `manage-*` rows exits 0 and reclaims the lock as `orphaned` (`design-spike.md` C10). | `EXTEND` (engine change) | `liveReason` gains a `manage` rule that reads the `active` heartbeat (D17), so a second `/bkit-manage #N` exits 8 with `route: stop` while the first is live. `manage` is added to the `locks acquire` help and to the workflow enums (`worktrees.ts:66`, `tracker.ts:1600`, `summary.ts:23`). |
| Sub-issue list | None in `.bkit/core/engine/commands/workflow/tracker.ts` or `issues.ts` (searched `sub_issue`, `subissue`, `sub-issue`). gh 2.102 has `gh issue view --json subIssues`; Linear `Issue.children` is an `IssueConnection` (`design-spike.md` C11); Jira is unverified (C12). | `EXTEND` | A children read in the existing adapter: GitHub through `gh issue view --json subIssues` (one gh call shape), Linear `children(first: 50)` with paging, Jira JQL `parent = KEY`. Same adapter, same error classes. |
| Size and priority | GitHub Project fields `Size`, `Priority`, `Estimate` on board 1 (`gh project field-list`); the engine reads only `Status` (`issues board`). | `EXTEND` | The board adapter reads the two fields; a tracker without them falls back to the manager's recorded size. |
| Blocked-by links | `bkit issues blocked-by`. | `EXTEND` | Used as is by `manage next`. |
| Third answerer | `bkit decisions apply --by=headless\|owner\|rerun` (`decisions.ts:523-548`), which reads only `build-decision-*.md` (`decisions.ts:87-90`, `:324`); readers key on `^Accept \(assumed\)` (`open-decision.ts:104`, `:150`). | `EXTEND` | `--by=manager` writes `Accept (assumed) — by the manager: {reason}`, which today's readers list unchanged (`design-spike.md` C1: `count: 1`), with the refusal rule in D5. Other workflows' ask points are recorded as in D34. |
| Where each pause option leads | `DECISION_ROUTES` in `.bkit/core/engine/commands/workflow/step-table.ts`; the `decisions route` command proposed in #1001. | `EXTEND` | One lookup function over `DECISION_ROUTES`, shared by #1001's command and `manage`. No second route table. |
| "Please confirm" list | `bkit decisions pending`. | `EXTEND` | Run over every child FID. |
| Test slots | Machine `tests` lock template `scripts/ci/bkit-machine-lock.sh` (copy-and-own, `local_stack_lock_holder` as a sourced function) and `BKIT_TEST_SLOTS` (§ Tests lock). The engine reads only the give-up status file (`lib.ts:170-173`); an unwired repository takes no lock. | `EXTEND` | The lock stays the slot authority. The template gains a `holders` subcommand whose I/O contract is recorded in `.bkit/templates.md`; `manage` reads holders through it. An unwired repository or a copy without the subcommand falls back to `BKIT_TEST_SLOTS` (D8). |
| Landing one issue | `/bkit-ship` in PR mode today. Local landing is the #924 design (`docs/plans/202611/924-every-workflow-land-design.md`), split into #936 (publish mode and start base), #937 (local landing target, `landDirect` on the local target, `advanceLocalDev` stops `edited-files` / `occupied`), #938 (ship and debug local) and P4 (batch-push support), with #849 first. | `EXTEND` | The #924 design is the landing contract. `manage land-check` runs only the checks ship does not do; the landing itself is ship. |
| Batch push | `bkit branches push --mode=dev` (`branches.ts:922-990`), `bkit ci min-push`, the pre-push hook, #924 P4 (`bkit fids parse --range`, absent today: exit 2). | `EXTEND` | `manage push` adds the foreign-commit check, the bookkeeping landing and the child-issue closes around them. It supersedes the #924 design's non-goal of a batch-push command for managed runs only (D35). |
| Bookkeeping commits | `bkit ledgers append`, `bkit ledgers commit`. | `EXTEND` | The manager's rows land as one bookkeeping commit per push batch. |
| Hard limits | `.bkit/core/hooks/guardrails-deny.js` (force push denied), `guardrails-tiers.js` (`--no-verify`, `reset --hard`, secret reads asked), `gateguard-engine.js` (edit hook), `.bkit/shared/.claude/settings.json` deny / ask lists. | `EXTEND` | A managed-run tier that turns the named ask rules into denies and adds `main` / release refs, forced worktree or branch removal and hand edits of ledger files, active while the run-active marker exists, whatever the heartbeat age (D12). |
| Never idle, re-read after a reset | `.bkit/shared/.claude/settings.json` `SessionStart` and `PreCompact` hooks; no `Stop` hook today. Every entry is wrapped `test -f … && node … \|\| true`, so a hook blocks only through JSON on stdout. The spike showed a wrapped `Stop` hook blocks through `{"decision":"block"}` once per stop (`stop_hook_active`), and a `SessionStart` hook on `compact` / `resume` injects context with `CLAUDE_CODE_SESSION_ID` equal to the stdin `session_id`, on the Code tab's `2.1.325` binary run headless (`design-spike.md` C4, C6). In the v6.3 manager session (Code tab, 2026-11-17 to 2026-11-19, 52.5 hours) bkit's command hooks ran: `SessionStart` on `compact` for 38 of 39 context summaries, its context reaching the model, plus one non-blocking hook error; `PreToolUse` 374 times. The `Stop` event fired 391 times for the app's own two callback hooks. No `resume` source and no bkit `Stop` hook were seen there. | `EXTEND` | A `Stop` entry, a `SessionStart` compact / resume entry and a `SessionEnd` entry, all inert unless the session is the registered manager. |
| Wake-up sources | Background `manage watch`; Claude Code `SendMessage` `notify_when_idle` (v2.1.236+, 12-hour expiry). The v6.3 manager's own watcher (`watch-builds.sh`: a 60 s poll over each build worktree and its outbox folder, exiting on a quiet build, an open decision file or a time limit) started 28 manager turns, each on time while builds ran; worker messages started 115 more; `Not delivered` appeared 0 times; `CronCreate`, `ScheduleWakeup` and `Monitor` were never called. The one stall of that run (379 minutes) came before any watcher existed; afterwards the longest silence was 56 minutes. | `EXTEND` | The watcher stays the wake-up and the only timer; no second timer is added. `notify_when_idle` is a second wake source for idle workers; it cannot see a stalled worker, so it never replaces the watcher. |
| Idle-sleep hold | `scripts/ci/bkit-test-awake.mjs` (copy-and-own, `.bkit/templates.md` § Local test sleep prevention), which holds off idle sleep while the command it wraps runs. The desktop app's keep-awake tool with `until: session_idle` lapses after about 5 idle minutes and stops idle sleep only. | `EXTEND` | `manage state` prints the watcher's launch line through the repository's adopted wrapper when it is present, so idle sleep is held off for as long as a watcher runs (D42). No new mechanism. |
| Plan without `/bkit-plan` | `/bkit-build` Step 4 Plan Convert (`@bkit-build-plan-convert`, checked by `bkit tests plan-check`), which reads the issue and the comments newer than the plan. | `EXTEND` | Task blocks posted on an issue reach the build through Plan Convert as they stand (D45). No new path. |
| Progress line | `progressLine` renderer (§ Progress Lines). | `EXTEND` | Same bar and rounding, counted over issues, with a finish range. |
| Finish estimate | No estimate function (searched the engine for `estimate`). `.bkit/stats.jsonl` holds measured `outcome` rows: 150 in this repo, 75 for build, each with `time.totalMinutes` and `plan.total.tasks`. | `EXTEND` | The estimate reads the build `outcome` rows from day one (D14); the function lives inside `manage.ts`. |
| Run counters | `counter` rows in `.bkit/stats.jsonl` (`.bkit/jsonl.md`), written by `bkit workflows close`. | `EXTEND` | `manage close` and `manage end` write the run's counters as `counter` rows (D30). |
| Flaky identities | The push gate's JUnit report (`BKIT_TEST_REPORT`, `junit.ts`); `failures.jsonl` testing rows carry no test identity field today; #1052 owns that scope. | `EXTEND` | The re-run takes test identities from the JUnit report and matches them against #1052's test identity field (D40). |
| Report comments | `bkit issues comment` (§ Comment Lifecycle). | `EXTEND` | A report is always a new comment, never an edit of a progress comment (owner decision). |
| Issue mentions | `bkit issues fetch`. | `EXTEND` | `manage mention` prints `#N — title (URL)` from the tracker. |
| Flaky re-run | `failures.jsonl` rows with `category: testing` (§ Categories); #1052. | `EXTEND` | One check, "every red test is a recorded flaky test", shared with #1052's scope. |
| Claude-only install | `renderClaudeAgentsCommands` in `.bkit/core/engine/install/modules/claude.ts`; the per-host renderers in `opencode.ts`, `codex.ts`. No per-workflow host filter exists. | `EXTEND` | A host allow-list on the workflow source that every renderer honours, plus a test that other hosts get no file. |
| Desktop-app and local check | `bkit runtime` classify (`runtime.ts`, `CLAUDE_CODE_REMOTE`). | `EXTEND` | Adds `CLAUDE_CODE_ENTRYPOINT`; seen as `claude-desktop` in this session (see Risks). |
| Closing tasks | `bkit-audit-deferrals.md`, `bkit-audit-testing.md`, `@bkit-utility-update-deferrals`, `@bkit-utility-update-roadmap`, `/bkit-debug`. | `EXTEND` | Each closing task runs an existing template, agent or workflow. |

## Architecture

Two `NEW` components, everything else an extension. The manager owns the loop and every judgement; the engine owns every count, slot, chore, check and rendered fact. The engine never decides what to do next and never writes the manager's words (decision `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`).

```mermaid
flowchart LR
    OWNER["Owner (desktop app chat, phone)"]
    subgraph APP["Claude desktop app, LOCAL"]
        MGR["Manager session: /bkit-manage, Fable, high"]
        W1["worker-01: /bkit-build #A"]
        W2["worker-02: /bkit-ship #B"]
        WATCH["bkit manage watch (background)"]
    end
    subgraph ENGINE["bkit CLI"]
        MANAGE["bkit manage <verb>"]
        EXIST["decisions / locks / status / issues / branches / ci / ledgers"]
    end
    HOOKS["Claude hooks: guardrails managed tier, Stop, SessionStart"]
    RECORDS["feat/PARENT worktree: status.jsonl manage-* rows"]
    OUTBOX["Git-common bkit-outbox/manage/PARENT: marker, watcher pid, private notes"]
    MAIN["Main checkout: local dev, child runs"]
    TRACKER["Tracker: parent issue, sub-issues, report comments"]
    OWNER --> MGR
    MGR -->|brief, go, answer| W1
    W1 -->|one-line report| MGR
    WATCH -->|exits when something is due| MGR
    MGR --> MANAGE
    W1 --> EXIST
    W2 --> EXIST
    MANAGE --> EXIST
    MANAGE --> RECORDS
    MANAGE --> OUTBOX
    MANAGE --> MAIN
    MANAGE --> TRACKER
    HOOKS --> OUTBOX
```

Components and boundaries:

- **`/bkit-manage` workflow** (`NEW`, `.bkit/core/workflows/bkit-manage.md`). Holds only judgement: lane choice per issue, whether to answer a worker or park the question, the review read of a diff, push timing, when to deviate and how to say why, and the shape of every owner question (what it is, why it is the owner's call, options with cost, a recommendation). It is not a numbered step pipeline: it states the loop once ("run `bkit manage state`, act on each due item, keep a watcher running") and one decision rule per kind of due item. Rendered for Claude only.
- **`bkit manage` noun** (`NEW`, `.bkit/core/engine/commands/workflow/manage.ts`, registered in `commands/registry.ts`). Verbs listed in Components / Flows. Each one composes existing commands; the only new logic is the `manage-*` fold, the due list, the file-overlap proposal, the estimate and the report text.
- **Run records** (`EXTEND`). The parent FID gets a normal log, `docs/plans/{YYYYMM}/logs/{PARENT_FID}/status.jsonl`, in the manager's own `feat/{PARENT_FID}` worktree, exactly where design and plan keep theirs. The manager writes no code there; the worktree holds only its records. This keeps every write out of the main checkout's `docs/` tree, where the push hook's tests run and where other sessions commit. Each child keeps its own log; the manager never copies a child's step.
- **Private run files** (`EXTEND`, `<git-common>/bkit-outbox/manage/{PARENT_FID}/`, owner-only `0700`). `active` (manager session id, run token, heartbeat, rules version), `watch.pid`, `inbox.jsonl` (worker lines appended by `manage say`, so the watcher sees a line even when the message itself is held or dropped) and `private.jsonl` for notes that must never reach a commit or a comment (a possible weakness waiting to be told to the owner, an owner answer that quotes one).
- **Landing** (`EXTEND`). `/bkit-ship` runs in a worker. The landing contract is the #924 design (`docs/plans/202611/924-every-workflow-land-design.md`), not a contract restated here. In local mode every child run is briefed with `publish=false`, so design and plan closes land through #937's local landing target instead of pushing, and ship squashes onto local `dev` and never pushes; in PR mode every workflow behaves as today. `manage land-check` runs before ship and `manage push` after a batch.
- **Hooks** (`EXTEND`, Claude hook drivers under `.bkit/core/hooks/` and `.bkit/shared/.claude/settings.json`).
  - The guardrails managed tier applies to every agent tool call in the clone while `active` exists, whatever its heartbeat age. Only `manage close` or `manage end` removes `active` (D12, D26).
  - An unreadable or malformed `active` keeps the tier on (fail closed), and the refusal names the parse error.
  - The `Stop`, `SessionStart` (`compact`, `resume`) and `SessionEnd` entries act only when the hook's `session_id` equals the one in `active`.
  - A manager-session hook event refreshes the heartbeat, as every `manage` verb does (D17).
  - Each refusal line carries the `[bkit-guardrails]` prefix, the parent FID and issue, the manager's last-alive time and the command that ends the run (`bkit manage end`).
- **Logging and counters** (`EXTEND`). `bkit manage` logs on stderr as `[bkit-manage]`; the hook tier logs as `[bkit-guardrails]` (D30).
- **Docs changed with the build.** `docs/observability.md` (§ Signals, § Alerts, § Log Format with a `[bkit-manage]` section and its grep patterns), `.bkit/workflows.md` § Concurrency lock (manage liveness) and § Tests lock (holders), `.bkit/templates.md` (the machine-lock `holders` subcommand), `.bkit/providers.md`, `.bkit/prompts.md` § Orchestrators, `.bkit/cli.md`, and a recovery section in `DETAILS.md` (take over a run, end or abandon a run, supersede a bad row, orphaned workers and the manager's worktree, comments not posting).
- **Tracker adapter** (`EXTEND`). Children read, `Size` / `Priority` field read, new-comment reports, mentions. Reads stay authoritative; writes stay best-effort (§ Tracker Writes Are Best-Effort).
- **Install** (`EXTEND`). A `hosts:` allow-list on the workflow source; OpenCode, Codex, Cursor and Antigravity render no `/bkit-manage` file. `.bkit/providers.md` records the exception and each host's gap with its source (Q3).

Local landing depends on the whole #924 chain, not on ship alone (`design-spike.md` C2): #938 is blocked by #936 and #937, #937 by #936 and #849, and #936 by #849; all five issues are open. What this design takes from the #924 design:

- The frozen publish mode per run (`publish=false` token or `bkit.workflows.{workflow}.publish.local`), so every child workflow lands on local `dev`.
- `landDirect` on the local target for design and plan closes and for the manager's bookkeeping, with `advanceLocalDev`'s `blocked` outcomes (`occupied`, `edited-files`) that leave foreign edits untouched.
- A local ship that leaves its issue open with `bkit:merged` and prints the landed sha as engine output and as a status row in the child's log.
- P4's `bkit fids parse --range`, so a batch push maps CI to each FID.
- Kickoff picks local landing only when all of these are on `dev`; otherwise it picks PR landing for the whole run (D9).

How this fits model-independent orchestrators (#905, issue open question 3): #905 moves judgement out of the five phase orchestrators into the engine, so they can run on any model. `/bkit-manage` is the one orchestrator whose job is judgement across issues, so it runs on the strongest model by design. The two depend on each other in one direction only: every chore #905 moves into the engine (#1001's route command, #910's bookkeeping) is one less thing the manager has to watch a worker do. `.bkit/core/.bkit/prompts.md` § Orchestrators gets one row for `/bkit-manage` (Fable at `high`, set at launch), and its "Fable, by hand" row is corrected to name `/bkit-manage` as the one workflow that runs on Fable.

## Data Model

**Stored: `manage-*` rows** in the parent's `status.jsonl` (append-only, `merge=union`, written only by `bkit manage` verbs and `bkit decisions apply --by=manager`). Only facts no other source holds are stored. A later row with the same identity supersedes an earlier one in the fold; nothing is edited.

<!-- prettier-ignore -->
| Row `type` | Identity | Fields | Written by |
| --- | --- | --- | --- |
| `manage-run` | parent + `event` | `parent`, `event` (`started` \| `adopted` \| `closed` \| `abandoned`), `children[]` (FIDs), `landing` (`local` \| `pr`), `rulesVersion`, `appVersion`, `session` (fingerprint), `reason?`, `at` | `manage kickoff` (`started`), `manage kickoff --resume` (`adopted`), `manage close` (`closed`), `manage end` (`abandoned`) |
| `manage-permission` | `what` | `what` (`file-sub-issues`), `ownerWords` (verbatim), `askedIn` (question id), `at` | `manage record --permission` |
| `manage-child` | `fid` | `fid`, `issue`, `lane` (`build` \| `plan` \| `design` \| `debug`), `size`, `sizeSource` (`tracker` \| `manager`), `priority`, `blockedBy[]`, `at` | `manage kickoff`, `manage record --lane` |
| `manage-question` | `id` | `id`, `kind` (`decision` \| `end-state`), `blocks[]` (FIDs), `title`, `options[]` (each with its cost), `recommended`, `status` (`open` \| `answered` \| `parked`), `at` | `manage record --question` |
| `manage-settled` | `question` | `question`, `answer`, `source` (decision key, comment URL or Project Goals bullet), `at` | `manage record --settled` |
| `manage-answer` | `question` | `question`, `by` (`owner` \| `manager`), `words` (owner: verbatim; manager: reason), `at` | `manage record --answer` |
| `manage-worker` | `name` + `fid` | `name` (`worker-NN`, never reused), `fid`, `command` (a `/bkit-*` command or `free-form`), `model`, `event` (`bound` \| `released` \| `cleared` \| `kept` \| `archive-refused`), `rulesVersion`, `session?`, `reason?`, `comment?` (URL, or `null` while unposted) | `manage worker`; `bound` is written before the manager first messages the worker |
| `manage-heard` | `at` | `worker`, `fid`, `kind` (`question` \| `stop` \| `failure` \| `refused` \| `group-done` \| `done`), `accepted`, `raw?` (only when rejected) | `manage hear` |
| `manage-assumption` | `fid` + `item` | `fid`, `askPoint` (`build-decision` \| `grill` \| `plan` \| `debug` \| `action-needed`), `decisionFile?`, `item`, `answer`, `leadsTo` (step), `reason` | `decisions apply --by=manager`; `manage record --answer --by=manager` for the other ask points (D34) |
| `manage-deviation` | `at` | `fid`, `what`, `why`, `comment` (URL, or `null` while unposted) | `manage record --deviation` |
| `manage-go` | `at` | `worker`, `fid`, `slot` (tests-lock holder name, or `estimated` in an unwired repo), `after` (landing sha it was checked against) | `manage go`, written before the manager sends the go message |
| `manage-landed` | `fid` | `fid`, `sha`, `size`, `lane`, `startedAt`, `landedAt` | `manage record --landed`, which reads the sha from the child's own log, never from the manager's copy |
| `manage-pushed` | range | `from`, `to`, `fids[]`, `result` | `manage push` |
| `manage-issue-closed` | `fid` | `fid`, `issue`, `result` (`closed` \| `failed`) | `manage push`, after a green push |
| `manage-parked` | `fid` | `fid`, `reason`, `ownerDecision`, `failedRuns` | `manage record --parked` |
| `manage-report` | `id` | `id`, `url` (or `null` while unposted), `reason` (`push` \| `questions` \| `parked` \| `stopped` \| `end`), `lastAlive`, `nextReportBy` | `manage report` (intent, `url: null`), then `manage report --posted` |
| `manage-flaky-rerun` | `at` | `push` (range), `tests[]` (identities), `first`, `second` (results) | `manage push` |
| `manage-stop-overridden` | `at` | `refusals` (count), `inFlight` (what was in flight) | the `Stop` hook, through `bkit manage record` |
| `manage-void` | `line` | `line` (number), `hash` (of the voided line), `reason`, `by` (`manager` \| `owner`) | `manage record --void`; the fold skips the named line |
| `manage-rules` | `version` | `version`, `change` | `manage record --rules` |
| `manage-filed` | `issue` | `issue`, `parent`, `fromDesign` | `manage file` |
| `manage-closing` | `task` | `task` (`deferrals` \| `mock-tests` \| `roadmap`), `status`, `result` | `manage close` |
| `manage-held` | `fid` | `fid`, `worker`, `waitsOn` (the fixing child's FID), `reason`, `event` (`held` \| `proved` \| `woken`), `proof?` (path of the record of the run on the copy) | `manage record --held` |
| `manage-away` | `at` | `ownerWords` (verbatim), `hours` | `manage record --away` |
Validation fails closed on write: a `manage` verb refuses to append a row of unknown type or with missing fields, and exits non-zero naming the field. Reads are lenient (D29):

- `manage state` skips a malformed or unknown line and prints `DEGRADED row {n} skipped: {reason}` as the first line of the briefing.
- The repair is a superseding row, never an edit: `manage record --void --line={n} --reason=…` appends a `manage-void` row carrying the line's hash, and a corrected row follows if one is needed.
- `manage record --void` refuses a line whose hash no longer matches, so a void cannot hit the wrong row after a merge.

The shared `status.jsonl` fold keeps ignoring unknown types, so child logs and other readers are unaffected.

**Derived on every read, never stored:** each child's phase and step (`bkit status resume` on the child's log), open pauses (`openDecision`), each running build's changed files (`git diff --name-only` against its base), slots in use (tests-lock holders; in an unwired repo, `BKIT_TEST_SLOTS` minus `manage-go` rows whose child has not finished, labelled `estimated`), the clean-worker count and the number of workers needed, the queue order, items owed before a landing, the progress line and the estimate. A stored copy of any of these is the drift that leaves an issue queued after it closed (`One home per fact`).

**Static tracker facts** (titles, URLs, sizes, priorities, blocked-by) are read once at kickoff and re-read only by `manage next --refresh` or when a landing closes an issue, so a wake-up does not fan out one tracker call per child.

**Private files** (`<git-common>/bkit-outbox/manage/{PARENT_FID}/`, `0700`, files `0600`): `active` = `{session, runToken, heartbeatAt, rulesVersion, parent}`; `watch.pid` = `{pid, runToken, startedAt}`; `inbox.jsonl` = `{at, worker, fid, line}`; `private.jsonl` = `{at, kind: "weakness" | "owner-quote", fid, text}`. Never committed, never posted. Cleanup is in Components / Flows § Run lifecycle.

**Estimate inputs** (D14), in order of preference:

1. Measured durations from `manage-landed` rows of this run and earlier manager runs, per size and lane.
2. Build `outcome` rows in `.bkit/stats.jsonl` (`time.totalMinutes`), bucketed by `plan.total.tasks`, for a child that has a plan.
3. A seed table of hour ranges per size in one engine constant (from the v6.3 run: size S about 2 hours; about two builds an hour at three slots; the largest build over 21 hours across two runs), only for a child with no plan and a size with no `manage-landed` rows. `outcome` rows carry no size, so they cannot stand in here.

## Components / Flows

### Verbs against the 14 steps

Verb names are indicative; the plan fixes them, named for what each does (decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do`).

<!-- prettier-ignore -->
| # | Step | Engine | Manager judgement |
| --- | --- | --- | --- |
| 1 | Check the run may start | `manage preflight`: refuses off the desktop app (`CLAUDE_CODE_ENTRYPOINT`), off `LOCAL` (`runtime classify`, with the cloud reason from Q11), with a tracker of `none`, without tracker access, with cross-session inbound messaging off, with the parent lock live, or with an earlier run of the same parent still open (it then names `manage kickoff --resume` and `manage end`); warns when the permission mode is neither `auto` (what sessions in the desktop app run in) nor `acceptEdits` (the default in the repository's JSON settings), because held messages between sessions of different classes are dropped after 5 minutes; lists open advisories and assumed accepts that expire during the run; picks the landing model (local only when the #924 chain and `fids parse --range` are present); warns when `CLAUDE_EFFORT` is below `high` in the order `low < medium < high < xhigh < max`, or unset (shown as unknown), and prints the launch line. No model check (Q8). | None. |
| 2 | Opening round | `manage kickoff`: reads the parent and its children, writes `manage-run` (`started`) and `manage-child` rows; `manage kickoff --resume` adopts an open run instead (§ Run lifecycle); lists for each candidate question the matching `docs/decisions.jsonl` keys and issue comments; renders the "settled without asking" table and the open questions ranked by builds blocked. Asks the sub-issue permission question (Q5) in the same batch, and lists each child of size L or larger as owing an end-state yes (D47). | Which questions are real; lane per issue; which issues start now; the three end-state sentences for each large issue. The manager may hand the first read of the sub-issues to read-only helpers that write their notes to files. |
| 3 | Memory in files | `manage state`: a fixed-size briefing (live workers, open questions, current batch, last landings, counts for the rest) followed by the due list. | Acts on each due item. |
| 4 | Order and lane | `manage next`: bugs, then blockers, then smaller before larger; drops candidates blocked by an open issue or whose planned files overlap a running build's changed files (an unplanned candidate shows `overlap: unknown`); holds a large child with no owner yes on its end state. | The lane (§ Lanes), and whether to override the order (recorded as a deviation). |
| 5 | Start and feed workers | `manage brief` renders the fact block of a brief (commit to cut from, the `publish=false` token in a local-landing run, files it may and may not change, report points, rules version, the `manage say` lines, the worker's model from the model registry, the guard tier's denied commands word for word, and the waiting rules (D51)); `manage worker` binds, releases and counts clean workers, and `manage worker --reconcile --sessions={ids}` compares the sessions the manager can see with the `manage-worker` rows. | The brief's prose; asking the owner for the number of workers the due list prints. |
| 6 | Never go idle | `manage watch` (background) polls every 60 s and exits only when the due list would gain an item (an item is its kind and its subject, never its printed values), with a reason code (`worker-line`, `slot-free`, `due-item`, `timeout` after 7200 s, `watcher-error`); a new status row in a child's log is never a reason by itself, because a build writes hundreds. While it runs it refreshes the heartbeat on every poll and exits when the manager's host process is gone or `active` no longer carries its run token (D17, D36); it refuses to start while `watch.pid` names a live process with this run's token. `manage state` prints the watcher's launch line, through the repository's sleep-prevention wrapper when one is adopted (D42). `manage say` prints a worker's one-line report and appends it to `inbox.jsonl`; `manage hear` records it. Workers send the line with `SendMessage`; the manager may also pass `notify_when_idle`. Stop hook refuses an idle turn (D13). | None. |
| 7 | Answer workers | `decisions apply --by=manager` for build pauses; `manage record --answer --by=manager` for every other ask point (D34); `decisions pending` over every child for the "please confirm" list; each option printed with the step it leads to. | Take the recommendation, the smallest safe assumption, or park. |
| 8 | Review before landing | `manage review`: the checklist with paths filled in (summary, review reports, new ledger rows, the diff); says when the manager's own read is the only bug review (a build whose challenge was skipped as small). | The read itself. |
| 9 | Land one at a time | `manage land-check` (foreign edits and commits, the landing diff against each running build's changed files and step, checklist done, word ceiling), then `/bkit-ship` in a worker. | Whether a running build may go on after a landing touched its inputs. |
| 10 | Push in batches | `manage push`: foreign-commit check, `ci min-push`, the bookkeeping landing, `branches push` under a tests slot, flaky re-run once (D40), then the close of each child issue in the batch. | When to push (Q12). |
| 11 | Tracker true | `manage mention`, `manage file` (refuses without `manage-permission`; never adds `bkit:auto`), `issues comment`. | Wording of comments. |
| 12 | Word ceiling | `land-check` runs the ceiling check when the repo declares the script; `pnpm bkit:text:ceiling raise` stays the owner's alone, and the guard tier refuses it in every agent session during a run. | None. |
| 13 | Talk to the owner | `manage report`: report text from the records, with the health line; `manage progress`: progress line and estimate. | The plain-English framing of each question. |
| 14 | Close | `manage close`: closing tasks, the final report, parent close only when every child is closed, counters, cleanup (§ Run lifecycle); refuses a green close while an open fix task is owed. `manage end`: ends or abandons an open run (§ Run lifecycle). | Which deferrals were unjustified. |

### Due list (`manage state`)

One line per due item, facts only, never a decision. Examples:

```text
Rules: v3 · re-read the /bkit-manage command file · load the session tools again
DEGRADED row 412 skipped: unexpected end of JSON
Run: ████░░░░░░ 40% · 8/19 landed · 2 parked · est. finish 18:30-22:10 (measured: S n=6) · alive 14:02 · next report by 15:30
GUARD-OFF since 13:40 manage-run open, active missing
HEARD-REJECTED worker-04 "raw line"
STALLED worker-05 #833 quiet=41m step=build:6
GO-UNACKED worker-02 #790 go=13:20 silent=22m
LANDED-UNRECORDED #771 sha=9f8e7d6
WORKER-UNBOUND session=4c1f… brief=#812
UNPOSTED 2 (report r7, deviation #790)
UNCLOSED #765 landed+pushed, issue open
STOP-OVERRIDDEN 13:55 refusals=3
NEEDS-TYPED-PROMPT messaging paused: "keeps answering other sessions"
REFUSED worker-03 #801 "exact command"
ARCHIVE-REFUSED worker-02 "session title"
HELD worker-05 #833 waits-on=#840 proved=no
END-STATE-OWED #790 size=L
ASK-WORKERS clean=1 slots=3 queued=9 need=10
START candidates=#812,#790 overlap=none
ANSWER worker-03 #801 Q2 options=[A Fix now -> step 7, B Accept -> step 11, C Stop -> parks]
GO worker-02 #790 slot=free after=a1b2c3d
REVIEW #777 missing=summary,ledger-rows
LANDED-UNPUSHED 5 needs-origin-dev=no
REPORT reason=questions(3)
STALE-BRIEF worker-01 rules=v2 current=v3
```

- `LANDED-UNPUSHED` is a fact; the push decision stays the manager's (Q12).
- `ANSWER` prints each option's target from the shared `DECISION_ROUTES` lookup.
- `Rules:` is always the first line: a context reset drops the workflow text and the schemas of tools the session loads on demand, and the line reaches the manager even when the `SessionStart` hook misses (Flow: context reset).
- `STALLED` fires when a bound child has written no status row and changed no file in its worktree or its outbox folder for 2100 s, and neither waits for nor holds the tests lock (D32).
- `REFUSED` carries the exact command a worker's permission mode or a hook refused; it goes into the next report and is never retried another way (D49).
- `ARCHIVE-REFUSED` names a released worker the app would not archive, by session title, for the owner to archive.
- `HELD` lists a build held for a fix (Flow: hold, fix, prove, land, wake); it becomes `WAKE` once the fix is proven on a copy and landed.
- `END-STATE-OWED` lists a child of size L or larger with no owner yes on its three sentences (D47).
- `ASK-WORKERS` fires at the opening round, when clean workers drop below the slot count, when a `manage-away` row is recorded, after each landing and at run end. `need` is the queued children plus two, less the clean workers; with a `manage-away` row the queued count is capped at slots times hours away, divided by the measured hours per build (D52).
- `GO-UNACKED` fires when a `manage-go` row has no later heard line and no new child status row within 10 minutes.
- `LANDED-UNRECORDED` fires when a child's log shows a landed sha and no `manage-landed` row exists; `manage record --landed` reads that sha from the child's log.
- `WORKER-UNBOUND` and `WORKER-GONE` come from `manage worker --reconcile`.
- `UNPOSTED` lists `manage-report` and `manage-deviation` rows with a `null` URL; the manager retries each on every wake through `bkit issues comment --post`, whose posted-once dedupe stops a second post.
- `UNCLOSED` lists pushed children whose issue close failed; it is retried the same way.
- `GUARD-OFF` fires when a `manage-run` is open but `active` is missing or the hook tier reports it cannot load.
- `NEEDS-TYPED-PROMPT` fires when a send returns `Not delivered: this session keeps answering other sessions`; the manager posts a report asking the owner to type one line.

Every reconciliation item outranks the work items, so a crash between an effect and its row is repaired before anything new starts.

### Flow: a worker asks

1. The worker reaches an ask point (a Decision Pause, a grill question, any owner question) in a FID the run has bound.
2. The engine command that composed the question prints the `manage say --kind=question` line and appends it to `inbox.jsonl`; the worker sends that line to the manager with `SendMessage` and ends its turn, waiting.
3. The watcher sees the new `inbox.jsonl` line and exits `worker-line` (or the message itself starts the manager's turn); `manage hear` records the line; the due list shows `ANSWER` with each option's target step.
4. The manager either records its answer as an assumption (D34: `decisions apply --by=manager --q= --answer=` for a build pause, which writes `Accept (assumed) — by the manager: {reason}` or the chosen route, plus a `manage-assumption` row) and messages the worker "go", or records `manage-question` with `status: parked` and tells the worker to wait.
5. The worker re-reads the decision file or the recorded answer on "go" and resumes at the step the route names (the existing "resume after the answers" path). A message alone never answers a pause.
6. `--by=manager` refuses `Accept` (D5) on:
   - every hard blocker (an item composed with `Recommended: none`);
   - every challenge item whose plan task meta line says `Severity: HIGH` or `CRITICAL`, or `Fixable: false`;
   - every verify gap, because verify gaps carry no severity and the refusal fails closed.
7. `Fix now` stays allowed on all of them, because its fix task keeps the run from closing green until done (the one exception in the limits).

### Ask points by workflow (D34)

Every answer the manager gives is recorded as assumed, by the manager, before the worker resumes:

<!-- prettier-ignore -->
| Ask point | Where the manager's answer is recorded |
| --- | --- |
| Build Decision Pause | The decision file, through `decisions apply --by=manager` (`Accept (assumed) — by the manager: {reason}` or the chosen route). |
| Design grill question | The grill's `Assumed` section, with the text `by the manager: {reason}`, written by the worker from the recorded `manage-answer`. |
| Plan, debug and "Action needed" stops | A `manage-answer` row (`by: manager`) and a `manage-assumption` row naming the ask point; the worker cites the row in its artefact. |
| Ship's Confirm Assumed Items | Never answered by the manager. In a managed run the step defers every item to the owner: it lists them in the next report's "please confirm" list and ship goes on with them still assumed. |

- While `active` exists, the engine refuses `decisions apply --by=owner` in every agent session, so no agent can write an owner acceptance during a run.
- The owner confirms deferred items, and accepts any item the manager may not accept, by running the line the report prints (`bkit decisions apply --by=owner …`) in his own terminal.
- `decisions pending` and the report tell a manager assumption from a headless one by the `by the manager:` text after the dash and by the `manage-assumption` row; `open-decision.ts` gains a `by` field parsed from that text, with no change to the prefix match.

### Lanes (D43-D46)

Every child runs a full `/bkit-*` workflow in a worker, and `/bkit-ship` lands it. The manager picks the lane and records it with `manage record --lane`:

<!-- prettier-ignore -->
| Lane | When | What runs |
| --- | --- | --- |
| `build` | An issue with one right fix. The default. | `/bkit-build #N`, from the issue text or from task blocks posted on the issue (D45). |
| `plan` | Plan Convert failed twice on the issue, or the change alters a contract that several children build against (in bkit's own repo: what workflow steps pass to each other). | `/bkit-plan #N`, then `build`. |
| `design` | More than one right fix, or a question only a design answers. | `/bkit-design #N`, then `plan` or `build`. |
| `debug` | A bug whose cause is not known. | `/bkit-debug #N`. |

- **No shortened runs (D44).** No lane runs fewer steps than its workflow. Switching off single workflow steps is the operator switch of #1068. Once that switch is on `dev`, `/bkit-manage` uses it for its children; who may switch a step off in a managed run is that issue's question. Until then every child costs a full run.
- **Free-form briefs.** A free-form worker stays a commented deviation (criterion 3). What it commits lands through the run's landing model, as every other child's work does (D46).

### Parent issue with its own work

The manager holds the workflow lock on `PARENT_FID`, so a worker's `/bkit-*` run on the parent's own FID is refused with exit 8. Work the parent itself needs is listed in the opening round and, with the Q5 permission, filed as a sub-issue.

### Observability (D30)

- **Log prefixes.** `bkit manage` writes diagnostics on stderr as `[bkit-manage]`; the managed hook tier as `[bkit-guardrails]`. Every line carries the parent FID.
- **Grep patterns** recorded in `docs/observability.md` § Log Format:
  - `[bkit-manage] guard off` (a `manage-run` is open and `active` is missing or unreadable);
  - `[bkit-manage] heartbeat stale` (over 1800 s);
  - `[bkit-manage] degraded row` (a skipped line in the run records);
  - `[bkit-manage] push stopped: foreign commit`;
  - `[bkit-manage] report unposted`;
  - `[bkit-manage] watch exit {reason}` (`worker-line`, `slot-free`, `due-item`, `timeout`, `watcher-error`);
  - `[bkit-guardrails] managed run {PARENT_FID} refused`.
- **Counters.** `manage close` and `manage end` write `counter` rows to `.bkit/stats.jsonl`: context resets survived, rejected worker lines, assumptions, deviations, flaky re-runs, push reds, parked issues, takeovers, stop overrides, landings per lane, refused commands and watcher exits per reason.
- **Command journal.** The read-only and high-frequency verbs (`state`, `watch`, `say`, `hear`, `progress`) write no `engine-call` rows, so the parent log does not grow by hundreds of rows a day. The plan reads the journal seam in `.bkit/core/engine/ledgers/journal.ts` before building this.
- **Completeness.** `bkit completeness check` and the CI status-hole sweep skip `manage` runs, which have no numbered steps; the write validation and the lenient fold in Data Model check them instead.
- **Docs.** `docs/observability.md` § Signals gains the `manage-*` rows, the due list, the heartbeat, the guard state, the report comments, `private.jsonl` and `HEARD-REJECTED`; § Alerts gains the report triggers, `GUARD-OFF` and a stale "next report by".

### Flow: land and push

1. A build finishes; the due list shows `REVIEW`; the manager reads what `manage review` lists, then the diff.
2. `manage land-check` passes → the manager briefs a worker with `/bkit-ship` in the run's landing model (`publish=false` for local, or PR mode); ship prints the landed sha and writes it in the child's log; `manage record --landed` copies it from there.
3. After each landing, the due list shows every running build whose changed files or step the landing touched; the manager judges each before its next `GO`.
4. At a push: `manage push` lists commits on local `dev` missing from `origin/dev`; any commit not named by a `manage-landed` row or the run's bookkeeping stops the push and is listed (see Risks); otherwise it runs `ci min-push`, lands the bookkeeping commit from the manager's worktree through the local landing target (`landDirect`), takes a tests slot and runs `branches push`. A red hook made only of recorded flaky tests is re-run once and audited (D40); any other red stops, is reported, and local `dev` is never rewritten.
5. After a green push, `manage push` closes each child issue in the batch through the tracker adapter (a local ship leaves it open with `bkit:merged`), writes a `manage-issue-closed` row per child and lists any failure as `UNCLOSED`.
6. `manage-pushed` and a report comment follow (Q7).
7. In PR mode each landing is its own PR merge, ship closes its issue as today, and the manager's bookkeeping lands with `bkit branches land` at each report point.

### Flow: hold, fix, prove, land, wake (D50)

For a running build stuck on a defect that another child fixes, or a landing that would change a shared input under a running build:

1. The manager tells the worker to hold and runs `manage record --held --fid= --waits-on=`; the due list shows `HELD`.
2. The fix runs on its own lane, as any child does.
3. Before the fix lands, a helper runs it against a scratch copy of the held build's plan and status rows; `manage record --held --proof=` records where that run's record is. `manage land-check` on the fix lists every build held for it and refuses while one has no proof.
4. The fix lands; the due list shows `WAKE`; the manager sends the go message and the row becomes `woken`.

### Flow: context reset

1. The `SessionStart` hook (sources `compact` and `resume`) sees the manager's session id and injects `manage state`.
2. Cover for a miss (the hook failed on 1 of 39 summaries in the v6.3 manager session): the workflow's loop starts every turn with `manage state`, and the watcher's exit output begins with the same briefing, so the turn that a wake-up starts has it in front of the manager.
3. The briefing's first line (`Rules:`) names the rules version, the command file to re-read and the session tools to load again.
4. Live workers briefed on an older rules version show as `STALE-BRIEF`; the manager messages each.
5. An owner `/clear` changes `CLAUDE_CODE_SESSION_ID`, so the manager-only hooks go inert until the session re-registers with `manage kickoff --resume` (`DETAILS.md` records this).

### Run lifecycle (takeover, end, cleanup)

- **Liveness (D17).** The one liveness source is `active.heartbeatAt`. Every `manage` verb and every manager-session hook event refreshes it, and a running watcher refreshes it on each 60 s poll. `manage kickoff` records the manager's host process (the per-session `claude` process: its pid and start time) in `active`. The watcher exits when that process is gone or when `active` no longer carries its run token, so no heartbeat outlives the manager's process by more than one poll. It never watches its own parent: launched through the sleep wrapper its parent is the wrapper, which lives exactly as long as the watcher does. `liveReason` reads it for workflow `manage`: under 1800 s (`WORKFLOW_LOCK_IDLE_S`) the lock is live and a second `acquire` exits 8 with `route: stop`.
- **Session check.** A `manage` verb run from a session other than `active.session` refuses with exit 8 and names `manage kickoff --resume`, so an old manager that wakes after a takeover cannot act.
- **`manage kickoff --resume` (adopt).** Allowed when the heartbeat is older than 1800 s, or when `active.session` matches the caller (a resumed or cleared session re-registering). It rewrites `active.session` and the run token, writes `manage-run` `adopted` with the old and new session, re-reads state, and runs `manage worker --reconcile`. Whether the owner may take over at once, before the 1800 s pass, is an open question.
- **`manage end` (end or abandon).** Writes `manage-run` `abandoned` with a reason, posts a final report, writes the counters, removes `active` and `watch.pid`, and releases the lock. The guard tier refuses it in every agent session except the registered manager, and the manager runs it only on an owner answer recorded as a `manage-answer` row; the owner can always run it from his own terminal.
- **`manage close`.** After the final report: writes `manage-run` `closed`, writes the counters, removes `active` and `watch.pid`, releases the lock.
- **`private.jsonl`.** Kept after close or end until the owner confirms he has read it (`manage end --private-read`), then deleted.
- **The manager's worktree.** `feat/{PARENT_FID}` and its branch are removed through the existing guarded worktree cleanup once the last bookkeeping commit is on `origin/dev`.

### Talking to the owner when the manager may be dead

- Every report and the progress line carry "last alive" (the heartbeat) and "next report by" (the latest time a Q7 trigger is expected: the high end of the earliest running build's estimate). It adds no report trigger beyond Q7. A latest comment past its "next report by" time is the alarm.
- The `SessionEnd` hook and a `Stop` hook that lets a turn end with work in flight (D13) each post one best-effort "manager stopped at {time}, reason {reason}" report (`reason: stopped`).
- A crash, a sleep or a hang fires no hook; the stale "next report by" time is then the only signal. Idle sleep is held off for as long as a watcher runs in a repository that has adopted the sleep-prevention wrapper (D42); a closed lid or a manual sleep still stops the run, and the preflight says so.
- A turn that an app note about a worker session starts runs `manage state` once and ends when nothing is due (D53).
- When a report or deviation comment fails to post, the manager prints its text in chat, keeps the row with `url: null` and retries at each wake (`UNPOSTED`).

### Estimate and progress (issue open question 8)

- Before any landing: for each open child, the low and high hours from the best source in Data Model § Estimate inputs (`outcome` rows by plan task count for a planned child, else the seed table by size); sum, divide by the slot count, floor at the longest blocked-by chain; the label names the source (`stats n=…` or `seed`).
- After landings: each size's range is replaced by the measured spread of `manage-landed` durations for that size (this run first, then earlier manager runs), so the range narrows as issues land; the label names the source and count.
- A child with no tracker size gets the manager's size from `manage-child`, labelled `manager-sized`.
- The progress line counts issues (`landed + parked` over `children`), uses the same ten-cell bar and rounding as § Progress Lines, and caps at 99% until the close.

### Reports (Q7, issue open question 9)

A new comment on the parent at each push batch, whenever a batch of questions waits for the owner, when an issue is parked, and at run end; the link goes in chat. Each report: the progress line (with "last alive" and "next report by"), one health line, landed (each with its lane), parked and why, open questions in the owner-question shape, each refused command with the worker's session title, the number of workers needed, sessions to archive by title, issues filed, every assumption (with who made it: manager or headless) and deviation with its comment link, and the count of flaky re-runs. In a repository that declares the word-ceiling script, the health line also carries the word counts against the ceiling. A possible weakness appears only as "told to the owner privately"; its text lives in `private.jsonl` and in chat. `manage report` never reads `private.jsonl`, so no report can carry its text.

Triggers that fire in the same manager turn fold into one comment. The health line is derived on read:

```text
Health: heartbeat 3m · guard on · watcher live (pid 4411) · tests lock: worker-02, worker-05 · landed-unpushed 4 · oldest open question 52m
```

A failed post is printed in chat and retried (`UNPOSTED`).

### Closing tasks (Q6, Q17)

Run once, when every child is landed or parked, before the last push: `bkit-audit-deferrals.md` over the run's deferrals (unjustified ones become work or a parked item); `bkit-audit-testing.md` over each landed child (a child whose tests are all mocks is routed to `/bkit-debug`); `@bkit-utility-update-roadmap` so `docs/roadmap.md` names the best next issue. Their commits ride the final push.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| D1. Run state = `manage-*` rows in the parent FID's `status.jsonl`, in the manager's own `feat/{PARENT_FID}` worktree; child state read live from each child's log. | A private journal in Git-common (ideate-2 A, ideate-3 A); one mutable JSON snapshot (ideate-1 B, ideate-3 B); the tracker as state (ideate-1 C, ideate-3 C); rows in the main checkout's `docs/` (ideate-2 B). | Decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only` puts engine facts in `status.jsonl`. The worktree placement is the one design and plan already use, and it removes the reason ideate-2 and ideate-3 gave for leaving `status.jsonl`: no write touches the main checkout's `docs/` while the push hook's tests run there or while other sessions commit there. Append-only with `merge=union` keeps every earlier fact when a later write fails. A snapshot loses updates and needs migrations; the tracker is best-effort and public. |
| D2. Only notes that must never be published (a possible weakness, an owner answer quoting one) go to `<git-common>/bkit-outbox/manage/{PARENT_FID}/private.jsonl`, owner-only. | Everything private (ideate-3 A); everything committed. | `docs/security.md` § Public repo content forbids committing exploitable details; `docs/architecture.md` § Tracker reporting boundary already splits authoritative checkout records from private outbox state. The split follows that boundary, so it is not a second home for the same fact. |
| D3. Store only facts no other source holds; derive steps, pauses, slots, changed files, queue, progress and estimate on every read. | Store them for speed. | A stored copy goes stale across a context reset and starts an issue twice or never lands it (`One home per fact`). Static tracker facts are read once at kickoff to keep wake-ups cheap. |
| D4. `bkit manage state` prints a fixed-size briefing and a due list of facts; it never decides. | Toolbox verbs with the loop's rules in the prompt (ideate-1 A, ideate-2 B); an engine-owned loop. | `Checks over instructions` and `Engine over agents`: the rules that did not hold as brief text in the v6.3 run become computed due items. The owner rejected an engine that owns the loop, so push timing and lane stay as facts for the manager to judge. Bounded output keeps the briefing cheap across about 18 resets a day (39 context summaries in the 52.5 hours of the v6.3 manager session). |
| D5. Third answerer = `bkit decisions apply --by=manager`, recorded the way `--by=headless` records an assumption, as `Accept (assumed) — by the manager: {reason}`, with a `manage-assumption` row. It refuses `Accept` on every hard blocker, on every challenge item whose plan meta line says `Severity: HIGH` or `CRITICAL` or `Fixable: false`, and on every verify gap; `Fix now` stays allowed. | The literal `Accept (assumed, by the manager)`; adding `severity` and `fixable` fields to `decisions compose` items; a manager-only decision format; the manager writes `Decision:` lines by hand. | The spike showed `decisions pending` lists 0 items for `Accept (assumed, by the manager) — …` and 1 for `Accept (assumed) — by the manager: …` (`design-spike.md` C1), so the kept prefix needs no reader change for pending, the build summary or ship's confirm list. The refusal reads markers that exist today (`Recommended: none` for hard blockers, the challenge meta line parsed in `challenge.ts:95-180`); verify gaps have no severity, so the refusal fails closed on them. `Fix now` is the one exception the limits allow, because its fix task keeps the run from closing green. If #958 moves decision lines into status rows first, `--by=manager` writes wherever `--by=headless` writes. |
| D6. Each pause option prints the step it leads to, from one lookup over `DECISION_ROUTES`, shared with #1001's `decisions route`. | The manager reads the workflow text; a second route table in `manage`. | The v6.3 run overrode a Stop with Try again and looped; #1001 already names `DECISION_ROUTES` as the only route table. |
| D7. Worker reports are engine-printed (`manage say`) and engine-recorded (`manage hear`); a malformed line is recorded as rejected and shown first in the due list. | Free text read by the manager. | A question lost to a typo stalls an issue silently; the fixed one-line form is the input's step 6. |
| D8. The machine `tests` lock is the slot authority; `manage go` hands out go messages against its holders, read through a `holders` subcommand of the copy-and-own `scripts/ci/bkit-machine-lock.sh` (one holder per line: name and since), whose I/O contract is recorded in `.bkit/templates.md`. An unwired repository, or a copy without the subcommand, counts `BKIT_TEST_SLOTS` minus unfinished `manage-go` rows, labelled `estimated`, with an advisory. | A manager-side slot counter as the authority; the engine reading the lock directory's layout. | Two schedulers disagree under load; the lock already spans builds, resumes and the push hook across repositories. The engine reads only the give-up status file today (`lib.ts:170-173`); a script subcommand is the `Stack-agnostic` way to expose a copy-and-own tool, and the layout belongs to the consumer's copy. |
| D9. Landing = `/bkit-ship` in a worker, against the #924 design as the landing contract; kickoff picks one landing model for the run: local only when #849, #936, #937, #938 and #924 P4's `bkit fids parse --range` are all on `dev`, else PR. | A `manage land` adapter that holds the chores until #938 (ideate-2 A); wait for #938; a contract restated here for #938 alone. | The spike showed #938 is blocked by #936 and #937, which depend on #849, all open (`design-spike.md` C2); before #937, `branches land` publishes design and plan closes to `origin/dev`, so a local run would split local `dev` from `origin/dev`. Without P4's range read (`fids parse --range` exits 2 today) a batch push has no per-FID CI mapping. Q10 settles landing through ship. PR mode works today; the build order is D56. An adapter would be a second landing implementation (`Improve over duplicate`). |
| D10. The batch push is `bkit branches push` of local `dev` (a plain push), preceded by a check that every commit on local `dev` missing from `origin/dev` is the run's own landing or bookkeeping; any other commit stops the push and is listed. | Replay the run's commits through `land.ts` (ideate-2 open friction); push whatever local `dev` holds. | `land.ts` states that local `dev` commits missing from `origin/dev` are never pushed as they stand. Replaying would leave local `dev` diverged from `origin/dev`; pushing everything would publish other sessions' work. The check keeps the `land.ts` rule without a second push path. D9's local-only-after-the-chain rule keeps every child landing local, so the plain push stays a fast-forward. |
| D11. The manager's rows and ledger appends live in its worktree and land as one bookkeeping commit per push batch through the local landing target (`landDirect`), plus the final close; in PR mode they land with `bkit branches land` at each report point. | Queue rows in the outbox and append them in the main checkout after the push. | Nothing is ever written into the main checkout's `docs/` during a push, so the v6.3 queue-and-flush rule needs no code. The local target is the #924 design's named route onto local `dev`. |
| D12. Hard limits = a managed-run tier in the shared guardrails hooks, active for every agent tool call in the clone while `active` exists, whatever the heartbeat age: deny pushes or ref updates naming `main` or a release tag, any force (`--force`, `--force-with-lease`, `+refspec`), `--no-verify` and `commit -n`, `git worktree remove --force`, `git branch -D`, edits to `*.jsonl` ledgers outside `bkit ledgers append`, `bkit:text:ceiling raise`, `bkit decisions apply --by=owner`, `bkit manage end` outside the registered manager, the app tool that changes a session's permission mode (`mcp__ccd_session_mgmt__set_session_permission_mode`, D49), and the credential reads the ask tier already names. Argv-parsed, as `guardrails-deny.js` already does. An unreadable `active` keeps the tier on. Only `manage close` or `manage end` removes `active`. | Rules scoped to registered session ids (ideate-2 A); a pass the owner gives one session from his terminal; global settings deny; brief text; turning the tier off on a stale heartbeat. | Clone-wide covers every worker with no registration step, and the owner chose it over registered sessions only: an agent session he runs beside the manager is bound too, so a release or a `--no-verify` commit during a run goes through his terminal or waits for `manage end`. Hooks bind agent tool calls only, so the owner's own terminal is unaffected. A pass would be one more way for the tier to be off. A global deny would bind every session outside a run, and `--no-verify` needs a hook anyway. A heartbeat goes stale exactly when the manager has died while workers still run, so a tier keyed on it would fail open then, against Q19 ("Hard limits stay hard"); the owner's `manage end` is the release instead. |
| D13. A `Stop` hook refuses to end the manager's turn while work is in flight and no live `manage watch` exists, through `{"decision":"block","reason":…}` on stdout; it blocks only when `stop_hook_active` is false and for at most 3 consecutive turns, then allows the stop, writes `manage-stop-overridden`, shows `STOP-OVERRIDDEN` and posts the stopped report. A `SessionStart` hook for `compact` and `resume` injects `manage state`. A `SessionEnd` hook posts the stopped report. All act only on the session id in `active`. | Sentences in the workflow; an unbounded refusal. | "Never go idle" and "re-read after a reset" are the two failures the v6.3 run hit most. The spike settled the block and the injection on the Code tab's `2.1.325` binary run headless (`design-spike.md` C4, C6). The v6.3 manager session showed the `Stop` event and bkit's `SessionStart` `compact` hook firing in the Code tab (Reuse & Prior Art); a bkit `Stop` hook's block and the `resume` source are still unseen there (D54). An unbounded refusal loops and burns tokens when "in flight" is miscounted. The cover for a SessionStart miss is the first-call rule plus the watcher printing the briefing (Components / Flows). |
| D14. Estimate = a range from measured `manage-landed` durations per size, else build `outcome` rows in `.bkit/stats.jsonl` bucketed by plan task count, else a seed table of hours per size; divided by slots and floored at the longest blocked-by chain; labelled with its source. | A seed table alone; a single date; a model guess; none before the first landing. | Gives the owner a range from the start that firms up, as asked. Measured `outcome` rows exist from day one (75 build rows here); they carry no size, so a child with no plan falls back to the seed table. The 21-hour outlier is why it is a range. |
| D15. Claude-only: a `hosts:` allow-list on the workflow source, honoured by every host renderer, with a test that the other four hosts render no `/bkit-manage` file. `.bkit/providers.md` records the exception and each host's gap with the sources from Q3. | Render a refusal stub on every host. | Q3 and Q9 settle Claude desktop only. A stub adds agent-read text for nothing; the test stops a later parity sweep from "fixing" the exception. |
| D16. The preflight refuses unless `CLAUDE_CODE_ENTRYPOINT` is `claude-desktop`, the runtime is `LOCAL` and cross-session inbound messaging is on; it warns when the permission mode is neither `auto` nor `acceptEdits`, and when `CLAUDE_EFFORT` is below `high` in the order `low < medium < high < xhigh < max` or unset (unknown). | Refuse on model too; warn only on surface; a plain string compare on effort. | Q9 and Q11 require refusal. Both variables are set in this design run's own desktop session (names checked 2026-11-19), and the spike's headless runs read `sdk-cli`, which the preflight refuses as intended. A command cannot see the model (Q2), so only the effort can be checked, and Q8 limits that to a warning; `xhigh` and `max` never warn. Inbound off means no worker can ask; mixed permission classes drop held messages after 5 minutes. Two modes are in use: the repository's JSON settings set `defaultMode: acceptEdits` (`.claude/settings.json`, shipped from `.bkit/shared/.claude/settings.json`), and sessions in the desktop app run in `auto` (owner, 2026-11-20; D51 records auto mode in the v6.3 run). A warning on `auto` would fire on every managed run, so neither of the two warns. Whether a message between a session in `auto` and one in `acceptEdits` is held is a WS-1 check. |
| D17. `/bkit-manage` takes the per-FID lock, writes status rows and posts reports, but is not a numbered step pipeline; its progress line is counted over issues. The lock's one liveness source is `active.heartbeatAt`, read by a `manage` rule in `liveReason` (`locks.ts`): live under 1800 s (`WORKFLOW_LOCK_IDLE_S`); refreshed by every `manage` verb, by every manager-session hook event, and by a running watcher on each 60 s poll. The watcher exits when the manager's host process (pid and start time, recorded in `active` at kickoff) is gone or `active` no longer carries its run token; it writes the heartbeat through a temp file and a rename, only while the token matches, and never creates `active`. | A sixth numbered workflow (ideate-2 C); a step row on every event; the existing liveness rule unchanged. | The 14 duties run at the same time, not in sequence; `bkit status resume` assumes a linear position and § Progress Lines cannot express "8 of 19 landed". The spike showed the existing rule reclaims a fresh manage-only run as `orphaned` (`design-spike.md` C10), so two managers could run one parent. The watcher keeps the heartbeat fresh itself during quiet hours of building, so the manager is never woken only to show it is alive: in the v6.3 manager session 19 of the 24 watcher results found nothing to do, and each such wake cost about 5 model calls and 1.2M input tokens read on a context of about 231k tokens. The host-process check stops an orphaned watcher from holding the lock for a dead manager. A check of the watcher's own parent cannot: the second-round spike killed the shell above a wrapped watcher, the wrapper was handed to pid 1 and stayed alive, and the watcher ran on with a live parent (`design-spike-round-2.md` in this design's logs). One source means the lock and the takeover rule cannot disagree. |
| D18. The manager's brief has an engine-rendered fact block and manager-written prose. | The engine renders the whole brief; the manager writes it all. | Decision `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`: the engine never writes the orchestrator's words. The facts (cut commit, allowed files, rules version) have one right answer. |
| D19. Acceptance: added the edge case that a worker never records the manager's answer as the owner's. | Draft without it. | The limit "a worker, watcher or app message is never the owner's approval" needs a visible outcome; ideate-3 named provenance as a cross-approach risk. |
| D20. Acceptance: the foreign-commit edge case now also stops a push that would publish another session's commit. | Draft covered only landings. | D10: a batch push of local `dev` is where another session's commit would be published. |
| D21. Acceptance: "the run-state file" became "its run records (`bkit manage state`)"; criterion 1 adds ranking by builds blocked; criterion 4 adds the engine refusal and answer provenance. | Draft wording. | D1 and D3 make the state a fold of rows plus live reads, not one file; ranking and the refusal are input requirements the draft criteria left implicit. |
| D22. Acceptance: the preflight warns on effort only, not model; added the edge cases "PR landing when ship has no local mode" and "an idle turn with no watcher is refused", and a process line for a worker's question. | Draft "on the wrong model or effort it only warns". | D16: no command can read the model. D9 and D13 add outcomes the owner will see. |
| D23. The sub-issue permission is one `manage-permission` row with the owner's words; `manage file` refuses without it and never adds `bkit:auto`; each filed issue is listed in the next report. | Ask per issue; standing permission. | Q5 as settled, made an engine check. |
| D24. Children, size and priority come from the tracker adapter (GitHub children through `gh issue view --json subIssues`); a child with no size gets the manager's recorded size, labelled `manager-sized`. | Size labels only; no estimate without sizes; raw REST `sub_issues` for GitHub. | The GitHub board has `Size` and `Priority` fields, Linear and Jira have their own; none is read today. One gh call shape keeps the adapter uniform; Linear `children` is a paged `IssueConnection` (`design-spike.md` C11). |
| D25. The landing check compares the landing's diff with each running build's changed files and with a configurable list of shared inputs (default: the package manifest and lockfile; bkit's own repo adds `.bkit/core/engine/**` and `dist/**`). | Compare engine files only (the v6.3 lesson as stated). | In a consumer repo the installed engine does not change under a running build; its shared inputs do. `Stack-agnostic` keeps the default free of stack names. |
| D26. A run can be adopted and ended: `manage kickoff --resume` (when the heartbeat is older than 1800 s, or the caller is the session in `active`) writes `manage-run` `adopted` and reconciles workers; `manage end` writes `manage-run` `abandoned`, writes counters, removes `active` and `watch.pid` and releases the lock. The preflight names both instead of only refusing an open run. | Refuse an open run with no way out; let any new kickoff reclaim the run. | A crash, an app update, an owner `/clear` or a new chat otherwise strands the run, orphans the workers and leaves the clone-wide guard on. Tying takeover to the same 1800 s heartbeat limit as the lock keeps one definition of a dead manager. |
| D27. Workers reach the manager with `SendMessage`; `manage say` also appends each line to `<outbox>/manage/{PARENT_FID}/inbox.jsonl`, and `manage watch` exits `worker-line` on a new line there. `notify_when_idle` is an extra wake source, never a replacement. | Rely on the message alone to start the manager's turn; replace the watcher with `notify_when_idle`. | Nothing else gives the watcher a line to see. The documented limits (held messages dropped at 5 minutes across permission classes, the 30-send burst refusal, the 50-message queue) can lose a message; the outbox copy survives them. The v6.3 manager session lost none (`Not delivered` 0 times; 115 worker messages each started a turn while a watcher ran), so the copy covers the documented limits, not an observed loss. `notify_when_idle` cannot see a stalled worker. |
| D28. Every report and the progress line carry "last alive" and "next report by"; the `SessionEnd` hook and a bounded `Stop` override post a best-effort "manager stopped" report. | Rely on the manager's own reports; a cloud watcher (excluded by the input). | Every owner signal comes from the manager, so a dead manager is otherwise silent. A latest comment past its "next report by" time is an alarm the owner can read on the phone without any new trigger beyond Q7. |
| D29. Writes are validated fail-closed; `manage state` reads leniently with a `DEGRADED row {n} skipped` banner; a bad line is superseded by a `manage-void` row carrying its hash, never edited. | Fail the whole fold on one bad line; allow hand repair. | `manage state` is the one recovery call after every reset, and hand edits of ledgers are a hard limit. The repo's other read paths already skip malformed lines with a named diagnostic (`[bkit-roadmap]`, `readRunsLenient`). |
| D30. Observability: `[bkit-manage]` and `[bkit-guardrails]` prefixes with grep patterns per failure mode, the parent FID on every hook refusal line, run counters as `counter` rows in `.bkit/stats.jsonl` at close or end, no `engine-call` journal rows from `state`, `watch`, `say`, `hear` and `progress`, manage runs skipped by the completeness check and the status-hole sweep, and `docs/observability.md` § Signals, § Alerts and § Log Format in the change list. | No named prefix; counters as report prose only. | `docs/observability.md` § Log Format requires one bracketed prefix per command noun, because consumer grep alerting keys on it. Counters in `stats.jsonl` reach `bkit stats`. High-frequency journaling would add hundreds of rows a day to every bookkeeping commit; a run without numbered steps would show holes on every sweep. |
| D31. Each side effect has a stated order: `manage-worker` `bound` and `manage-go` are written before the message they record; `manage-report` is written with `url: null` before the post; `manage-landed` is read from the child's log after ship. `manage state` shows `WORKER-UNBOUND`, `WORKER-GONE`, `GO-UNACKED` and `LANDED-UNRECORDED`, ranked above work items. | Write rows after the effect with no reconciliation. | A crash between an effect and its row otherwise starts or ships an issue twice, breaking criterion 2. An intent row plus a reconciliation item turns every crash window into a visible due item. |
| D32. The due list shows `STALLED worker-NN #N quiet={min} step={step}` when a bound child has written no status row and changed no file in its worktree or its outbox folder for 2100 s, neither waits for nor holds the tests lock, and is not held (D50). | React only to worker lines and status changes; the lock's 1800 s on status rows alone. | A dead session, a refused permission or a gate killed at the tests-lock hold limit sends no line. A long helper or gate writes files and no status row, and a build queued for a test slot writes neither, so status rows alone raise false alarms. The v6.3 manager's watcher measured quiet by file changes in the worktree and the outbox folder, and ran its limit at 35 minutes for most builds (50 for the largest) after starting at 25. |
| D33. `manage-report` and `manage-deviation` allow `url` / `comment` `null`; `UNPOSTED` retries on each wake through `bkit issues comment --post`; the text is also printed in chat. | Treat a failed post as posted; drop the row. | Tracker writes are best-effort, and the GitHub MCP returned 401 in this design run. Criterion 3 needs every deviation on the issue; the posted-once dedupe makes the retry safe. |
| D34. Every ask point records the manager's answer as assumed: build pauses in the decision file, grill questions in the grill's `Assumed` section, plan, debug and "Action needed" stops as `manage-answer` plus `manage-assumption` rows. Ship's Confirm Assumed Items is never answered by the manager: it defers every item to the owner, and while `active` exists the engine refuses `decisions apply --by=owner` in every agent session. | Extend `decisions apply` to every workflow; let the manager answer ship's confirm step. | `decisions apply` reads only `build-decision-*.md`. Ship's confirm step writes `--by=owner --confirm`, so a manager reply there would become the owner's acceptance in `docs/decisions.jsonl`, against Q19 ("a worker/watcher/app message is never the owner's approval"). The refusal makes that impossible; the owner confirms from his own terminal with the line the report prints. |
| D35. `manage push` is a batch-push command for managed runs only, superseding the #924 design's non-goal "a bkit batch-push command" (`715-no-batch-publish-verb`) for that scope; the build appends a `docs/decisions.jsonl` row that records the narrower scope. | Leave every push to the owner, as the #924 design does. | The owner's newer answers settle it: Q12 makes a wave a push batch sized by the manager, and the input requires "the manager doing every push". Outside a managed run the earlier decision stands. |
| D36. `manage watch` polls every 60 s, exits only when the due list would gain an item (an item is its kind and its subject, never its printed values), exits `watcher-error` on a crash, refuses to start while `watch.pid` names a live process carrying this run's token, and times out after 7200 s. | Four exit reasons; a bare pid file; a 600 s time limit; an exit on every child status row. | A crashed watcher must wake the manager so it is restarted; pids are reused, so the run token tells a live watcher from an unrelated process. The v6.3 manager ran its watcher on a 120-minute limit for about 38 hours: every time-limit exit arrived within 3 minutes of the limit while builds ran, and no build was stranded. A 600 s limit over the same 52.5 hours would add up to 315 wakes that find nothing, and an exit on every status row would add hundreds per build. |
| D37. Acceptance: the manager-answer edge case now names the marker `Accept (assumed) — by the manager: {reason}` and states that no agent session can record an owner answer during a run. | Draft wording `assumed, by the manager`. | D5 (the spike showed the draft literal is invisible to `decisions pending`) and D34. |
| D38. Acceptance: added the edge case "the manager session dies and a new session takes over"; the landing edge case now uses PR landing until the whole #924 chain and P4's range read are on `dev`. | Draft without a takeover outcome; PR landing "whenever ship offers no local mode". | D26 and D28 give the owner a visible outcome for a dead manager; D9 follows the spike's chain evidence. |
| D39. Cleanup: `manage close` and `manage end` remove `active` and `watch.pid`; `private.jsonl` stays until the owner confirms he read it; the `feat/{PARENT_FID}` worktree and branch go through the existing guarded worktree cleanup once the last bookkeeping commit is on `origin/dev`. | Leave the files and worktree for the owner. | A finished run would otherwise leave a clone-wide guard marker and a stale worktree. |
| D40. The flaky re-run takes failing test identities from the push gate's JUnit report (`BKIT_TEST_REPORT`), re-runs only when every one matches a `failures.jsonl` testing row by #1052's test identity field, and writes a `manage-flaky-rerun` row with both results; the report lists the count. | Re-run on any red; re-run without a record. | Without identities the re-run becomes a way to retry real failures (#1052); the row makes each re-run auditable. |
| D41. The parent issue's own work is filed as a sub-issue (with the Q5 permission), because the manager's lock on `PARENT_FID` refuses a worker's `/bkit-*` run on that FID. | Run the parent's work under its own FID. | One lock per FID; the refusal is the existing exit 8. |
| D42. In a repository that has adopted `scripts/ci/bkit-test-awake.mjs`, `manage state` prints the watcher's launch line through it, so idle sleep is held off while a watcher runs. The preflight warns when the wrapper is absent, and always says that a closed lid or a manual sleep stops the run. | A new sleep hold in the engine; the manager calls the desktop app's keep-awake tool on each turn; no hold. | The wrapper exists and already holds off sleep for test gates (`Improve over duplicate`). The app's tool with `until: session_idle` lapses after about 5 idle minutes, and a manager turn can be 2 hours away. The v6.3 session called that tool once and no watcher ran late, so sleep is not an observed failure on that machine; the hold costs one prefix on one launch line. |
| D43. Every child runs a full `/bkit-*` workflow in a worker (`build`, `plan`, `design` or `debug`), landed by `/bkit-ship`; the manager picks the lane (Components / Flows § Lanes). A free-form worker stays a commented deviation (criterion 3). | A `light` lane of fewer steps, as a composed run of shipped subagents outside the workflow or as a route inside `/bkit-build` for managed runs only; an engine rule that sets the lightest lane a child may take. | The owner's decision. The second review round found that a composed run leans on build at every step: the test writer, the code writer and both reviewers read build's plan file and briefs, and the engine calls take only `--workflow=build` with build's step names (the round-2 reports in this design's logs). It would rebuild build beside the workflow (`Improve over duplicate`). With four full workflows there is no lighter lane for an engine rule to bound, and the owner rejected an engine that owns the loop. |
| D44. No managed run shortens a workflow. Switching off single workflow steps is an operator switch for every workflow, owned by #1068; `/bkit-manage` uses that switch for its children once it is on `dev`, and until then every child costs a full run. | A shortening rule of `/bkit-manage`'s own (a composed run, or a lane list with a landing floor); never shortening a run. | The owner's decision. A switch inside the workflows serves the owner's own runs as well as managed ones, keeps one lock, one log and one resume path per run, and lets each workflow say which of its steps are safe to switch off. The cost until then is known: about 2 hours for a size S issue in the v6.3 run (Data Model § Estimate inputs). |
| D45. A plan may reach `/bkit-build` as task blocks posted in a comment on the issue; the manager never rewrites an issue body. `/bkit-plan` runs only when Plan Convert failed twice on the issue or the change alters a contract several children build against. | `/bkit-plan` for every issue above a size; the manager writes the plan file itself. | Plan Convert already turns the issue and its newer comments into the plan file, and `bkit tests plan-check` gates the result. The v6.3 manager ran `/bkit-plan` on 2 issues and sent every other one straight to `/bkit-build`. What a build from the issue skips is `/bkit-plan`'s two reviewers and its scope check, which is why contract changes stay on `plan`. A plan file written by the manager would put authoring into the one session that holds only judgement. |
| D46. What a free-form worker commits lands through the run's landing model, as every other child's work does; the manager never commits a child's change itself. | The manager commits a small change on local `dev` itself (the v6.3 practice, on the owner's "land freely" for that run); `bkit branches land` for such a change. | One landing implementation and one landing check (D9). The cost: in PR mode each such landing is a PR and a CI run. |
| D47. Before a child of size L or larger starts, the manager posts three plain sentences on the issue (what will be true afterwards, what stays as it is, who writes what) and the owner's yes is recorded as a `manage-answer`; `manage next` holds the child until then. The opening round batches these; a large child found later shows `END-STATE-OWED` and is asked in the next report. | Ask before every build; never ask. | In the v6.3 run the first build of one large issue produced a shape the owner had not meant; he saw it only once it was described in plain words, and it cost a second run. `Runs finish unattended` keeps the question off small issues. What counts as large is an open question. |
| D48. `manage brief` prints the model the registry names for the worker's command (`.bkit/core/.bkit/prompts.md` § Orchestrators); the manager starts the worker on it, `manage-worker` records the model, and the report lists any worker on a different one. | Every worker on the manager's model; every worker on Opus (the v6.3 brief). | The registry is the one home for model picks. The manager may pick a stronger model for one issue; the row makes that visible instead of silent. |
| D49. A worker reports a command its permission mode or a hook refused with `manage say --kind=refused`, carrying the exact command, which is kept in `private.jsonl` and never posted. The guard tier appends each of its own denies to `inbox.jsonl`, so a deny shows even when the worker sends no line. The due list shows `REFUSED`, a refusal that blocks a child is an owner question and a report trigger, the report names the worker's session title, the issue and the rule that refused, and the manager neither tries another route nor changes a session's permission mode; the guard tier denies the app's permission-mode tool in every agent session during a run. | The manager works around the refusal; the worker retries another way. | A refusal is the owner's permission system speaking. In the v6.3 run two review agents ran the owner-only `raise` command on scratch copies, one through a fake terminal. |
| D50. "Hold, fix, prove on a copy, land, wake" is a recorded route: `manage-held` rows, the `HELD` and `WAKE` due items, and a `manage land-check` refusal while a build held for the fix has no proof (Flow: hold, fix, prove, land, wake). | The manager remembers held builds; land the fix and hope. | In the v6.3 run this route got a build stuck on an engine bug back onto its planned route; a landing changes shared inputs under every running build (D25). |
| D51. The brief's engine-rendered fact block also carries the guard tier's denied commands word for word and the waiting rules: a worker messages the manager only with `manage say` lines; while it waits on a helper it sets a fallback timer (#1052 owns its length), stops timers by task id only, runs the step again once when the helper is silent, and sends a `failure` line on the second silence. | The manager writes these in the brief's prose. | In the v6.3 run 88 "still waiting on my helper" messages started 104 manager turns, a stalled helper left its session waiting for ever, and a brief that said "never use /bkit-debug" led auto mode to refuse the build's own `bkit-debug-failure-diagnose` agent. Rendered by the engine, the lines cannot be forgotten or paraphrased; `STALLED` is the check behind them. |
| D52. The clean-worker stock is an engine count: `ASK-WORKERS` prints the number needed and fires at the opening round, when clean workers drop below the slot count, when the owner says he is leaving (`manage record --away`), after each landing and at run end. After a landing the manager tries to archive the released worker; a refusal is recorded (`archive-refused`) and the report names the session by title. | The manager remembers to ask. | The desktop app starts a session only on a turn the owner typed, and it refused to archive or clear some finished sessions. In the v6.3 run the manager never asked and the owner had to offer three times. |
| D53. A turn that an app note about a worker session starts runs `manage state` once and ends when nothing is due. The briefing's first line names the rules version, the command file to re-read and the session tools to load again. | Treat every wake as a full review of the run. | Of the 441 manager turns in the v6.3 session, 211 were started by app notes that a session had finished a turn (158M input tokens read in all), and 39 followed a context summary at about 40 model calls each. A reset drops the workflow text and the schemas of tools loaded on demand. |
| D54. The v6.3 manager session stands as the observation for three spike claims: a worker's message wakes a manager that is idle apart from its watcher (C3), a background task's end wakes the manager while workers run (C8), and a day of exchanges does not pause messaging (C9). The live checks that remain are a bkit `Stop` hook's block in the Code tab (C5, still a gate), the `SessionStart` `resume` source with its session-id match (C7) and what notifies the owner. | Keep all five as owner-run checks, two of them gates. | 28 watcher-started turns, 115 message-started turns and 0 `Not delivered` in 52.5 hours on the Code tab are more than the single check WS-1 would have run. They are one run on one machine, so `manage-run` records the app version and `DETAILS.md` lists each fact with its date (Risks). |
| D55. Acceptance: the narrative names the full workflows and the end-state yes; edge cases added for a large issue with no yes, a refused command, a held build, and sessions the app would not archive. | The reviewed acceptance text without them. | D43, D47, D49, D50 and D52 each add an outcome the owner will see. |
| D56. Build order: P-1 to P-4 start at once. P-5 starts only when #849, #936, #937, #938 and #924 P4's `bkit fids parse --range` are on `dev`, and P-6 follows it directly, so the first managed run lands on local `dev` and pushes in batches. Kickoff still picks the landing model per run (D9). | Build P-5 at once and land through PRs until the chain is built; a landing command of `/bkit-manage`'s own. | The owner chose local landing first. A PR per issue costs a CI run per landing; the v6.3 run landed on local `dev` and pushed in batches. Q10 settles landing through ship; its "nothing is blocked" does not set the build order. A landing command of its own would be a second landing implementation. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Ideate-1 A: parent `status.jsonl` rows plus a fold over the child runs, thin verbs over existing commands. | `MERGED` | The backbone of the design (D1, D5, D8, D9). Its row placement moved from the main checkout to the manager's worktree, which answers the push-window risk it mitigated with an outbox queue. |
| Ideate-1 B / Ideate-3 B: one mutable run-state snapshot. | `REJECTED` | Copies child facts that go stale, loses updates under concurrent writers, and needs migrations; ideate-3's own mitigations turn it back into an append-only log. |
| Ideate-1 C / Ideate-3 C: the tracker (and git) as the run state. | `REJECTED` | Best-effort writes lose state, every wake-up fans out tracker calls, and private items cannot live in public comments. Kept from it: static tracker facts cached once at kickoff. |
| Ideate-2 A: private event ledger in Git-common plus a `tick` that lists what is due. | `MERGED` | Kept: the due list (D4), the resume hook (D13), the run-scoped guard (D12), the issue-counted progress line. Not kept: the private location for the whole state (D1), `manage land` holding the chores until #938 (D9), and rebuilding state from a report digest (deferred). |
| Ideate-2 B: tracked per-run ledger, chore verbs, the loop's rules in the prompt. | `REJECTED` | The rules that must hold would be sentences again, which the v6.3 run showed failing; its tracked ledger survives through ideate-1 A in a worktree that avoids its `docs/` churn. |
| Ideate-2 C: `/bkit-manage` as a sixth numbered workflow. | `REJECTED` | The duties are concurrent; linear resume and the step progress line do not fit (D17). Kept from it: the lock, status rows and comment posting. |
| Ideate-3 A: crash-only manager, append-only journal, views derived on read, limits held by hooks. | `MERGED` | Kept as the risk layer: derive-on-read (D3), fail-closed write validation (with a lenient read, D29), bounded briefing, `say` / `hear` (D7), the Stop hook (D13), private notes (D2), argv-parsed limits with a fixture per command. Its journal location gave way to D1, and its stale-heartbeat fallback gave way to a guard that stays on until the run is closed or ended (D12). |

## Trade-offs Accepted

- **Run records in the manager's worktree (D1).** Gain: one home for engine facts as the owner's doctrine requires, committed history for the wave report, no writes in the main checkout during pushes. Sacrifice: one more worktree per run, and the manager's records reach `dev` only with each push batch, so a clone lost between batches loses the unpushed rows (the report comments remain).
- **A due list of facts, not decisions (D4).** Gain: the manager cannot silently skip a rule that fires, and the prompt stays short. Sacrifice: the due-list rules are a second place where policy can sit; each one must stay a fact (a count, a free slot), never a "do this now".
- **Clone-wide limits while a run is open (D12).** Gain: workers are covered with no registration, and the limits hold even when a brief forgets them or the manager dies. Sacrifice: the owner's own agent sessions in the same clone are bound too until the run is closed or the owner runs `manage end` (see Risks).
- **Landing through `/bkit-ship` only (D9).** Gain: one landing implementation. Sacrifice: until #849, #936, #937, #938 and #924 P4's range read all land, a run lands through PRs, so pushes cannot be batched and each landing costs a CI run.
- **Owner-only confirmation during a run (D34).** Gain: no agent can write an owner acceptance. Sacrifice: ship's assumed items and any item the manager may not accept wait for the owner to run one printed line in his own terminal.
- **Verify gaps refused for assumed accept (D5).** Gain: the refusal fails closed where severity is unknown. Sacrifice: more items park or go to `Fix now` than a severity-aware rule would send there.
- **Stopping a push on any foreign commit (D10).** Gain: nothing the run did not land is published without the owner. Sacrifice: a push waits whenever another session committed to local `dev`, until the owner answers.
- **Claude desktop only (D15, D16).** Gain: it runs where the owner measured it works. Sacrifice: the first single-host workflow in bkit, held in place by a test instead of the `Provider parity` rule.
- **A range, not a date (D14).** Gain: honest from the first minute. Sacrifice: wide early ranges because of the 21-hour outlier.
- **Full workflows only (D43, D44).** Gain: one way to build, with every step's check, and no second definition of a reviewed change. Sacrifice: a small issue with one right fix costs a full run (about 2 hours for size S in the v6.3 run) until the step switch of #1068 exists.
- **A two-hour watcher limit (D36).** Gain: quiet hours cost no manager turns. Sacrifice: something the due list cannot see waits up to two hours for the manager's next look.
- **An owner yes before each large build (D47).** Gain: a wrong shape is caught in three sentences instead of a rebuild. Sacrifice: a large issue that surfaces while the owner is away waits for him.

## Risks & Open Questions

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
- **What to do when another session's commit sits on local `dev` at push time.** A batch push publishes everything on local `dev`, including commits the run did not make (D10).
  A) Stop the push, list the commits, and ask the owner in the next report — nothing is published without him; the push waits for his answer.
  B) Push only the run's own commits by replaying them — no wait; local `dev` and `origin/dev` then split, which the v6.3 run showed is painful.
  C) Push everything — no wait; publishes work nobody reviewed.
  Recommended: A — publishing is the owner's call, and the wait costs only the push, not the builds.
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
- **What happens if a bkit Stop hook's block is not honoured in the Code tab** (`design-spike.md` C5). The block works on the Code tab's own binary run headless. In the v6.3 manager session the `Stop` event fired 391 times in the Code tab and bkit's other command hooks ran there, but bkit ships no `Stop` hook today, so its block has not been seen in the Code tab. If it is not honoured, nothing stops the manager ending a turn with work in flight and no watcher, which is how the one stall of the v6.3 run began (379 minutes).
  A) Keep the hook and rely on the watcher and the first-call rule — partial cover; a manager that goes idle with no live watcher still sleeps until the owner types.
  B) Make it the plan's one gated live check: if the block is not honoured, stop the build and ask the owner — no silent gap; one short check before the hook is built.
  Recommended: B — the check is one session and a few minutes, and the failure it guards against is the costliest one seen.
  Default if unanswered: B.
- **What happens if SessionStart does not fire on resume in the Code tab** (`design-spike.md` C7). The `compact` source fired on 38 of 39 context summaries in the v6.3 manager session and its context reached the model; the `resume` source and the session-id match were not seen there.
  A) Keep the cover: every turn starts with `manage state`, the watcher's exit prints the briefing, and the briefing's first line carries the rules pointer — covers a miss at the cost of one call per turn.
  B) Gate the build on a live check, as for Stop — certainty; a delay for a risk the cover already handles.
  Recommended: A — the cover is in the design, and it was needed once in 39 summaries.
  Default if unanswered: A.
- **What counts as a large issue for the end-state yes** (D47). Before a large build starts, the manager posts three plain sentences on the issue and waits for the owner's yes. A lower bar means more questions in the opening round; a higher bar means a wrong shape can cost a rebuild.
  A) Size L and larger — few questions; a size M issue can still be built to a shape the owner did not mean.
  B) Size M and larger — catches more; about every second issue in a typical milestone asks.
  C) Every issue — catches all; the opening round becomes a read of every issue.
  Recommended: A — it matches the one case seen (a large issue that cost a second run) and keeps the opening round short.
  Default if unanswered: A.
- **How the Jira children read is verified** (`design-spike.md` C12). The Jira key answered `401 invalid_token`, so listing a Jira parent's children with `parent = KEY` is unproven.
  A) Ship the Jira arm behind a live test that runs once a valid key exists — no delay for GitHub and Linear; Jira children stay unverified until then.
  B) Leave Jira out of the children read until verified; the preflight refuses a Jira parent — no unverified code; Jira users cannot run it.
  Recommended: A — the risk is confined to one adapter arm, and the read is a standard JQL query.
  Default if unanswered: A.

Risks and assumptions:

- **An owner answer cannot be proven by the engine.** Owner answers reach workers only through the manager, and tracker comments post under the owner's token. The engine can make a forged answer auditable (`manage-answer` carries the verbatim words and must follow a recorded question), not impossible. The limit "a message is never the owner's approval" rests partly on the manager's judgement.
- **Hook behaviour in the desktop app is partly verified.** The spike showed, on the Code tab's own `2.1.325` binary run headless, that a wrapped `Stop` hook blocks once per stop and that `SessionStart` injects context on `compact` and `resume` with a matching session id (`design-spike.md` C4, C6). The v6.3 manager session adds what the Code tab itself showed (Reuse & Prior Art). Still to be checked live in the plan's first task: a bkit `Stop` hook's block, the `SessionStart` `resume` source with its session-id match, and `SessionEnd` (open questions above).
- **The wake-up rests on one observed run.** A worker's message waking the manager (115 turns), a background task's end waking it while workers run (28 turns, each on time) and no messaging pause (`Not delivered` 0 times) come from one 52.5-hour session on one machine and one app version, which that session did not record. An app release can change any of them. `manage-run` records the app version, the stale "next report by" time is the owner's alarm, and `inbox.jsonl` keeps every worker line (D27, D54).
- **`/bkit-ship` on a branch with no build run is read, not run.** By its source, ship in PR mode accepts a `feat/{FID}` branch with no build run and only warns that no plan exists; it refuses `dev` and `main` (exit 7), so a free-form worker that commits works in a `feat/{FID}` worktree (D46). No such branch has been shipped live.
- **The deny of the app's permission-mode tool may not be enforceable.** The shipped guardrails hook is wired to `Bash` only, and whether a `PreToolUse` hook fires for the app's session tools is unseen (WS-1). If it does not fire, that limit rests on the workflow text alone.
- **What ends the watcher when the app quits is unseen.** The second-round spike measured the process tree of a background task (command, `/bin/zsh -c`, the per-session `claude` host, `disclaimer --pgroup`, the app) but could not end a session or quit the app. The host-process check (D17) covers a manager that dies; WS-1 records what the app itself signals.
- **Sleep is not observed as a failure.** No v6.3 watcher ran late. The hold (D42) works only in a repository that has adopted the wrapper, and nothing holds off a closed lid.
- **Documented messaging limits** (Claude Code cross-session and desktop docs), each with its fallback:
  - `Not delivered: this session keeps answering other sessions` needs a typed prompt → `NEEDS-TYPED-PROMPT` and a report asking the owner to type one line. It did not occur in the v6.3 manager session (`design-spike.md` C9).
  - Held messages are dropped at the 5-minute `dialogExpiry` when two sessions' permission classes differ → the preflight warns when the mode is neither `auto` nor `acceptEdits` (D16), WS-1 checks a message between a session in `auto` and one in `acceptEdits`, and the `inbox.jsonl` copy keeps worker lines.
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

Every indexed document this design needed is present and filled in (`.agents/docs.md`, `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/capabilities.md`). One stale fact:

```jsonl
{
  "topic": "model registry",
  "gap": ".bkit/core/.bkit/prompts.md § Orchestrators 'Fable, by hand' row names claude-fable-5-1 and says no orchestrator pins Fable; the input names claude-fable-5-2 as the newest Fable and this design makes /bkit-manage run on it",
  "recommendedPath": ".bkit/core/.bkit/prompts.md",
  "alternativeEvidence": "design-input-1.md § Decided by the owner (Who runs the loop) and Q2; the model id was not probed against the live model list in this run",
  "action": "In the build, probe the live model list, then update the row and add a /bkit-manage orchestrator row with the launch line"
}
```

## Suggested Workstreams

### WS-1: Live desktop-app checks

#### Scope

The Code-tab checks the v6.3 manager session did not settle (D54), run before the hook code is built on them, each result recorded with its date and the `CLAUDE_CODE_DESKTOP_APP_VERSION` it was seen on:

- A bkit `Stop` hook blocks through `{"decision":"block"}` inside the Code tab (`design-spike.md` C5). This is a gate: if the block is not honoured, the build stops and the owner is asked (open question recommended B).
- `SessionStart` fires on `resume` with a session id that matches the hook's stdin (C7); a miss keeps the first-call cover.
- `SessionEnd` fires when a Code-tab session is closed.
- Whether the desktop app or the tracker notifies the owner of a report posted under his own token (open question "What should alert the owner").
- What ends, and what is signalled, when the manager's session ends and when the app quits, logged by a wrapped watcher stub (the second-round spike could not end a session).
- Whether a `PreToolUse` hook fires for the app's `mcp__ccd_*` session tools (D49).
- Whether a message between a session in `auto` and one in `acceptEdits` is delivered or held (D16).
- The record of what the v6.3 session observed for C3, C8 and C9, with its dates, in `DETAILS.md`.

Each check needs one scratch session started in the Code tab on a turn the owner typed; an agent session can run the rest of it and read the result from the scratch session's transcript.

#### Requires

[]

#### Rationale

A chronological boundary: the hooks (WS-8) rest on behaviour only a Code-tab session can show, and one open question makes the `Stop` check a gate on the build. It needs one owner-typed turn and writes no shipped code.

### WS-2: Run records and the `manage` noun

#### Scope

- `bkit manage` registered in `.bkit/core/engine/commands/registry.ts`, new `.bkit/core/engine/commands/workflow/manage.ts`, stderr prefix `[bkit-manage]` carrying the parent FID on every line.
- The `manage-*` row schema for every row type in Data Model, fail-closed write validation (unknown type or missing field exits non-zero naming the field), the lenient `manage-*` fold with the `DEGRADED row {n} skipped: {reason}` banner, supersede-by-identity, and `manage record --void --line= --reason=` with the hash check (D29). The shared `status.jsonl` fold keeps ignoring unknown types.
- The parent log `docs/plans/{YYYYMM}/logs/{PARENT_FID}/status.jsonl` as the run's one home (D1, open question "Where the run keeps its memory").
- `manage state`: the fixed-size briefing and the due-list framework (facts only, never a decision, reconciliation items ranked above work items, D4, D31); later workstreams add their due items to it.
- Derive-on-read helpers (D3): each child's phase and step through `bkit status resume`, open pauses through `openDecision`, each running build's changed files.
- The private outbox folder `<git-common>/bkit-outbox/manage/{PARENT_FID}/` (`0700`, files `0600`) and its read / write helpers.
- No `engine-call` journal rows for `state`, `watch`, `say`, `hear`, `progress` (read `.bkit/core/engine/ledgers/journal.ts` first); `bkit completeness check` and the CI status-hole sweep skip `manage` runs (D30).
- Docs in the same change: `.bkit/cli.md` `manage` noun entry, `docs/observability.md` § Log Format `[bkit-manage]` section with the `degraded row` pattern and § Signals for `manage-*` rows and the due list.

#### Requires

[]

#### Rationale

The data-model boundary: every other `manage` verb writes or reads these rows and appends to this due list, so the schema, fold and noun come first and stay in one module.

### WS-3: Run identity, liveness and takeover

#### Scope

- The `active` marker (`{session, runToken, heartbeatAt, rulesVersion, parent}`) and its heartbeat refresh on every `manage` verb (D17).
- The session check: a `manage` verb from a session other than `active.session` exits 8 and names `manage kickoff --resume`.
- The `manage` liveness rule in `liveReason` (`locks.ts:251-279`) reading `active.heartbeatAt` against `WORKFLOW_LOCK_IDLE_S`, so a second `acquire --workflow=manage` exits 8 with `route: stop` while the first is live; `manage` added to the `locks acquire` help and the workflow enums (`worktrees.ts:66`, `tracker.ts:1600`, `summary.ts:23`).
- The manager's own `feat/{PARENT_FID}` worktree, created at kickoff and holding only records.
- The adopt mechanics of `manage kickoff --resume` (D26): allowed when the heartbeat is older than 1800 s or the caller is `active.session`; rewrites `active.session` and the run token; writes `manage-run` `adopted` with old and new session. The open question on taking over before the 1800 s pass is settled here.
- `manage-run` rows carry `rulesVersion`, `appVersion` (`CLAUDE_CODE_DESKTOP_APP_VERSION`) and the session fingerprint.
- Docs in the same change: `.bkit/workflows.md` § Concurrency lock (manage liveness), `docs/observability.md` `heartbeat stale` pattern.

#### Requires

[WS-2]

#### Rationale

One definition of a live manager serves the lock, the takeover and the guard marker; splitting it would give them three ways to disagree. Removing `active` is left to WS-13 so this workstream does not depend on reports.

### WS-4: Tracker children and field reads

#### Scope

- A children read in the existing tracker adapter (`.bkit/core/engine/commands/workflow/tracker.ts` / `issues.ts`): GitHub through `gh issue view --json subIssues`, Linear `children(first: 50)` with paging, Jira JQL `parent = KEY` behind a live test that runs once a valid key exists (open question "How the Jira children read is verified", recommended A). Same error classes as today.
- The board adapter reads `Size` and `Priority` (GitHub Project fields; Linear and Jira equivalents), with a missing field returned as absent so callers can fall back (D24).
- A `#N — title (URL)` mention render from `bkit issues fetch`.
- Docs in the same change: `.bkit/trackers.md` for the children read and field read.

#### Requires

[]

#### Rationale

The tracker-adapter boundary: a read extension with its own per-tracker risk (Jira unverified), useful on its own and independent of every `manage` row.

### WS-5: Manager answerer in decisions

#### Scope

- `bkit decisions apply --by=manager` writing `Accept (assumed) — by the manager: {reason}` or the chosen route, plus a `manage-assumption` row (D5).
- The refusal of `Accept` on every hard blocker (`Recommended: none`), every challenge item whose meta line says `Severity: HIGH` / `CRITICAL` or `Fixable: false` (`challenge.ts:95-180`), and every verify gap; `Fix now` stays allowed.
- The refusal of `decisions apply --by=owner` in every agent session while `active` exists (D34).
- `open-decision.ts` gains a `by` field parsed from the text after the dash, with no change to the `^Accept \(assumed\)` prefix match.
- One route lookup over `DECISION_ROUTES` in `step-table.ts`, shared with #1001's `decisions route` (D6); no second table.
- `bkit decisions pending` run over every child FID for the "please confirm" list.
- Re-read #958 and #1001 at build time and extend whatever decision shape is on `dev` then (Risks).
- Docs in the same change: `.bkit/cli.md` for `--by=manager`.

#### Requires

[WS-2, WS-3]

#### Rationale

The decision-record boundary: provenance of every answer (owner, manager, headless) lives in one command and one reader, which is why it is separate from the verbs that ask.

### WS-6: Test-slot holders

#### Scope

- A `holders` subcommand on the copy-and-own `.bkit/templates/scripts/ci/bkit-machine-lock.sh` (one holder per line: name and since), its I/O contract in `.bkit/templates.md`, and bkit's own adopted copy under `scripts/ci/` refreshed in the same change.
- An engine reader for that subcommand that reports "unwired" or "no subcommand" instead of guessing (D8).
- Docs in the same change: `.bkit/workflows.md` § Tests lock (holders).

#### Requires

[]

#### Rationale

The consumer-owned template boundary: a copy-and-own script change with its own rollout (consumers re-adopt the copy), and the slot authority for every later go message.

### WS-7: Managed-run guard tier

#### Scope

- A managed-run tier in the shared guardrails hooks (`.bkit/core/hooks/guardrails-deny.js`, `guardrails-tiers.js`, `gateguard-engine.js`) and `.bkit/shared/.claude/settings.json`, active for every agent tool call in the clone while `active` exists, whatever the heartbeat age, and fail-closed on an unreadable or malformed `active` with the parse error named (D12).
- Argv-parsed denies: pushes or ref updates naming `main` or a release tag, any force (`--force`, `--force-with-lease`, `+refspec`), `--no-verify` and `commit -n`, `git worktree remove --force`, `git branch -D`, `*.jsonl` ledger edits outside `bkit ledgers append`, `bkit:text:ceiling raise`, `bkit decisions apply --by=owner`, `bkit manage end` outside the registered manager, and the credential reads the ask tier names; a fixture per command.
- A tool-name deny of `mcp__ccd_session_mgmt__set_session_permission_mode` in the same tier, with its fixture (D49): a second `PreToolUse` matcher that names the tool (the shipped guardrails matcher is `Bash` only) and a branch in the hook on the tool name; built only if WS-1 shows the hook fires for the app's session tools.
- Each deny of the tier appended to `inbox.jsonl` (D49).
- Refusal lines with the `[bkit-guardrails]` prefix, parent FID and issue, last-alive time and `bkit manage end`.
- The `GUARD-OFF` due item (a `manage-run` open while `active` is missing or the tier cannot load).
- The clone-wide scope (D12).
- Docs in the same change: `docs/observability.md` `[bkit-guardrails] managed run {PARENT_FID} refused` and `guard off` patterns, § Alerts `GUARD-OFF`; `.bkit/instructions.md` for the hook text.

#### Requires

[WS-2, WS-3]

#### Rationale

The hard-limits boundary: one hook tier with its own fixtures and its own failure mode (binding sessions outside the run), keyed only on the `active` marker.

### WS-8: Manager session hooks

#### Scope

- A `Stop` entry that refuses to end the manager's turn while work is in flight and no live `manage watch` exists, only when `stop_hook_active` is false and for at most 3 consecutive turns, then allows the stop, writes `manage-stop-overridden` through `bkit manage record`, shows `STOP-OVERRIDDEN` and posts the stopped report (D13).
- A `SessionStart` entry for `compact` and `resume` that injects `manage state`.
- A `SessionEnd` entry that posts the best-effort "manager stopped at {time}, reason {reason}" report (D28).
- All three inert unless the hook's `session_id` equals `active.session`; each manager-session event refreshes the heartbeat; each wrapped `test -f … && node … || true` as the existing entries are.
- The build follows WS-1's results: when the `Stop` block is not honoured it stops and asks the owner; when `resume` does not fire, the cover stays (the first-call rule, the watcher's briefing and the `Rules:` line).
- Docs in the same change: `.bkit/instructions.md` hook text; `DETAILS.md` note that an owner `/clear` changes the session id and leaves the hooks inert until `manage kickoff --resume`.

#### Requires

[WS-1, WS-3, WS-9, WS-11]

#### Rationale

The host-event boundary: the three Claude hook drivers share one session-match rule and one live verification, and differ from the guard tier, which binds every session.

### WS-9: Worker coordination and wake-up

#### Scope

- `manage brief`: the engine-rendered fact block (cut commit, files it may and may not change, report points, rules version, the worker's model from the registry, the denied commands word for word, the waiting rules, the `manage say` lines) under manager-written prose (D18, D48, D51).
- `manage worker`: bind (written before the first message), release, `cleared`, `kept`, `archive-refused`, the clean-worker count, never-reused `worker-NN` names, and `--reconcile --sessions={ids}`, wired into WS-3's `kickoff --resume` adopt.
- `manage say` (prints the one-line report and appends it to `inbox.jsonl`) and `manage hear` (records it as `manage-heard`, a malformed line as rejected), with the `refused` kind for a command the worker's host denied (D7, D27, D49).
- `manage watch` in the background: a 60 s poll; an exit only when the due list would gain an item (an item is its kind and its subject, never its printed values), with reasons `worker-line`, `slot-free`, `due-item`, `timeout` after 7200 s, `watcher-error`; `watch.pid` with the run token, and a refusal to start while a live watcher carries this token; a heartbeat write on each poll; an exit when the manager's host process is gone or the run token has changed, with a test that a watcher launched through the wrapper stops within one poll of the host process ending; the heartbeat written by temp file and rename under a token check; the briefing at the head of its exit output (D17, D36).
- The watcher's launch line through `scripts/ci/bkit-test-awake.mjs` where the repository has adopted it, else an advisory naming the wrapper (D42).
- `manage go` against the WS-6 holders, written as `manage-go` before the go message; in an unwired repository `BKIT_TEST_SLOTS` minus unfinished `manage-go` rows, labelled `estimated`, with an advisory.
- `manage-rules` rows (`manage record --rules`) and `STALE-BRIEF`.
- `manage record --away` and the worker stock: `ASK-WORKERS` with `need=` at each point D52 names, and the archive attempt after each landing.
- Due items: `HEARD-REJECTED`, `REFUSED`, `STALLED` (no status row and no file change in the child's worktree or outbox for 2100 s, never while it waits for or holds the tests lock or is held, D32), `GO-UNACKED` (10 minutes), `WORKER-UNBOUND`, `WORKER-GONE`, `ARCHIVE-REFUSED`, `ASK-WORKERS`, `GO`, `NEEDS-TYPED-PROMPT`.
- Docs in the same change: `docs/observability.md` `watch exit {reason}` pattern and `HEARD-REJECTED` signal; `.bkit/cli.md`.

#### Requires

[WS-2, WS-3, WS-6]

#### Rationale

The manager-to-worker boundary: briefs, bindings, report lines, go messages and the wake-up form one protocol, and the watcher is the wake-up that WS-1 checks.

### WS-10: Preflight, kickoff and queue

#### Scope

- `manage preflight` (D16): refuses off `CLAUDE_CODE_ENTRYPOINT=claude-desktop` (refuse and name the missing variable, open question recommended A), off `LOCAL` through `bkit runtime` classify (gains `CLAUDE_CODE_ENTRYPOINT`), with tracker `none` or no tracker access, with inbound messaging off, with the parent lock live, or with an open earlier run (naming `manage kickoff --resume` and `manage end`); warns when the permission mode is neither `auto` nor `acceptEdits`, and on `CLAUDE_EFFORT` below `high` in the order `low < medium < high < xhigh < max` or unset; lists open advisories and assumed accepts that expire during the run; picks the landing model (PR until WS-17's chain probe finds the #924 chain); prints the launch line. No model check.
- `manage kickoff`: reads the parent and children (WS-4), caches static tracker facts once, writes `manage-run` `started` and `manage-child` rows, lists matching `docs/decisions.jsonl` keys and issue comments per candidate question, renders the "settled without asking" table and the open questions ranked by builds blocked, asks the Q5 sub-issue permission in the same batch, lists the parent's own work as a sub-issue to file (D41), and settles the `--milestone=<name>` open question (recommended A).
- The end-state question: kickoff marks each child of size L or larger, the manager posts the three plain sentences of D47 on the issue, records them as a `manage-question` of kind `end-state`, and `manage next` holds the child until its `manage-answer`; the `END-STATE-OWED` due item (D47).
- Task blocks posted as an issue comment for a `build`-lane child with no plan (D45).
- `manage record --lane` (`build`, `plan`, `design`, `debug`; D43), `--question`, `--settled`, `--answer` (owner words verbatim, must follow a recorded question), `--permission`, `--parked`, `--deviation` (D34 for non-build ask points with `--by=manager`).
- `manage next` (+ `--refresh`): bugs, then blockers, then smaller before larger; drops candidates blocked by an open issue (`bkit issues blocked-by`) or whose planned files overlap a running build (`overlap: unknown` when unplanned).
- Due items: `START`, `ANSWER` (each option's target from WS-5's route lookup).
- Docs in the same change: `.bkit/cli.md`.

#### Requires

[WS-2, WS-3, WS-4, WS-5]

#### Rationale

The run-start and scheduling boundary: everything the opening round and the queue need, in the order the owner sees it in the first hour.

### WS-11: Owner reports, progress and estimate

#### Scope

- `manage report` (intent row with `url: null`, then `--posted`): text from the records, the triggers of Q7 folded per turn, the health line (heartbeat, guard, watcher pid, tests-lock holders, landed-unpushed, oldest open question), landed, parked and why, open questions in the owner-question shape, issues filed, every assumption with who made it, deviations with links, flaky re-run count, refused commands with the session's title, the number of workers needed, the sessions to archive by title, word counts on the health line when the repo declares the ceiling script, and the "please confirm" list with the `bkit decisions apply --by=owner …` line to run. Never reads `private.jsonl`.
- `UNPOSTED` for `manage-report` and `manage-deviation` rows, retried on each wake through `bkit issues comment --post`, text also printed in chat (D33); the `REPORT` due item.
- `manage progress`: the ten-cell bar over issues (`landed + parked` over `children`), capped at 99% until close, "last alive" and "next report by" (D28).
- The estimate inside `manage.ts` (D14, open question "How the finish time is estimated"): measured `manage-landed` durations per size, else build `outcome` rows bucketed by `plan.total.tasks`, else the seed-table constant; divided by slots, floored at the longest blocked-by chain, labelled with its source; `manager-sized` for children without a tracker size.
- `manage mention` and `manage file` (refuses without `manage-permission`, never adds `bkit:auto`, writes `manage-filed`).
- The `private.jsonl` write path for weaknesses and owner quotes (D2).
- Docs in the same change: `docs/observability.md` `report unposted` pattern, § Alerts for report triggers and a stale "next report by".

#### Requires

[WS-2, WS-3, WS-4, WS-5, WS-6, WS-9]

#### Rationale

The owner-facing boundary: every word the owner reads on the phone is rendered here from the records, so report text, progress and estimate share one renderer and one privacy rule.

### WS-12: Review, landing check and PR-mode landing

#### Scope

- `manage review`: the checklist with paths filled in (summary, review reports, new ledger rows, diff), flagging when the manager's read is the only bug review; the `REVIEW` due item.
- `manage land-check`: foreign edits and commits in the main checkout (listed, left untouched), the landing diff against each running build's changed files and step, a configurable shared-inputs list (default package manifest and lockfile; bkit's own repo adds `.bkit/core/engine/**` and `dist/**`, D25), checklist done, and the word-ceiling script when the repo declares it.
- Landing through `/bkit-ship` in a worker in PR mode (D9); `manage record --landed` reads the sha from the child's own log; `LANDED-UNRECORDED`.
- The after-landing due list of running builds whose inputs the landing touched.
- The hold route (D50): `manage record --held` with `held`, `proved` and `woken` events; `land-check` refuses a fix that a held build waits on until a `proved` row names the proof (the held build's failing check passing on a copy with the fix applied); the `HELD` and `WAKE` due items.
- PR-mode bookkeeping: the manager's rows land with `bkit branches land` at each report point (D11).
- Re-read #938's ship output at build time and read the landed sha from whatever shape is on `dev`.
- Docs in the same change: `.bkit/cli.md`.

#### Requires

[WS-2, WS-9, WS-10, WS-11]

#### Rationale

The landing boundary in the mode that works today: review, the pre-landing check and the per-issue landing need nothing from the #924 chain.

### WS-13: Run close and end

#### Scope

- `manage close`: the closing tasks once every child is landed or parked (`bkit-audit-deferrals.md`, `bkit-audit-testing.md` with mock-only children routed to `/bkit-debug`, `@bkit-utility-update-roadmap`), each restartable from `manage-closing` rows; the final report; parent close only when every child is closed; refusal of a green close while an open fix task is owed; `manage-run` `closed`.
- `manage end`: `manage-run` `abandoned` with a reason, final report, run only on an owner answer recorded as `manage-answer` (or from the owner's terminal).
- Both: run counters as `counter` rows in `.bkit/stats.jsonl` (context resets survived, rejected lines, assumptions, deviations, flaky re-runs, push reds, parked, takeovers, stop overrides), removal of `active` and `watch.pid`, lock release (D26, D30, D39).
- `manage end --private-read` deleting `private.jsonl`; removal of `feat/{PARENT_FID}` through the existing guarded worktree cleanup once the last bookkeeping commit is on `origin/dev`.
- Docs in the same change: `docs/observability.md` § Signals for counters.

#### Requires

[WS-3, WS-11, WS-12]

#### Rationale

The run-end boundary: the only two verbs that turn the guard off, plus the cleanup and counters that both share.

### WS-14: Managed-run ask points in phase workflows

#### Scope

- Engine commands that compose an owner question print the `manage say --kind=question` line in a bound FID (Flow: a worker asks).
- Design grill: the `Assumed` section with `by the manager: {reason}` written from the recorded `manage-answer` (D34).
- Plan, debug and "Action needed" stops: the worker cites the `manage-answer` / `manage-assumption` rows in its artefact.
- Ship's Confirm Assumed Items in a managed run: defers every item to the owner's "please confirm" list and goes on with them still assumed.
- The `Contract changes` trace (`grep -l` across `.bkit/core/workflows/`, `.bkit/core/prompts/`, `.bkit/core/docs/templates/`) through resume, no-plan convert, per-group loop and remediation paths, with `.bkit/workflows.md` and `.bkit/prompts.md` index updates.

#### Requires

[WS-5, WS-9, WS-10]

#### Rationale

The existing-workflow boundary: these edits touch the five phase workflows a worker runs, not the manager, and carry their own contract-change trace.

### WS-15: Per-workflow host allow-list

#### Scope

- A `hosts:` allow-list on the workflow source honoured by every host renderer (`claude.ts` `renderClaudeAgentsCommands`, `opencode.ts`, `codex.ts`, and the Cursor and Antigravity renderers) (D15).
- A test that OpenCode, Codex, Cursor and Antigravity render no `/bkit-manage` file.
- `.bkit/providers.md` records the exception and each host's gap with its Q3 source.

#### Requires

[]

#### Rationale

The install-engine boundary: a renderer feature with its own cross-host risk and test, releasable before any workflow uses it.

### WS-16: `/bkit-manage` workflow and operator docs

#### Scope

- `.bkit/core/workflows/bkit-manage.md` with `hosts: [claude]`: the loop stated once ("run `bkit manage state`, act on each due item, keep a watcher running"), one decision rule per kind of due item, the owner-question shape, brief prose, deviation commenting, `notify_when_idle` as an extra wake source, the `manage state` first-call rule, the rule for a turn started by an app session note (run `manage state`; with nothing due, end the turn with no other call, D53), and read-only helpers on a cheaper model for the first read of the issues.
- `.bkit/workflows.md` catalog entry; `.bkit/core/.bkit/prompts.md` § Orchestrators row for `/bkit-manage` (Fable at `high`, launch line) and the corrected "Fable, by hand" row after probing the live model list (Documentation Warnings).
- `DETAILS.md` recovery section (take over, end or abandon, supersede a bad row, orphaned workers and the manager's worktree, comments not posting) and the measured desktop-app facts with dates.
- `.bkit/core/.bkit/` doc sources only, then the session-end `upgrade` re-render.
- The single owner question for `pnpm bkit:text:ceiling raise` once the build's text is final (open question recommended A).

#### Requires

[WS-7, WS-8, WS-9, WS-10, WS-11, WS-12, WS-13, WS-14, WS-15]

#### Rationale

The judgement layer: written last, against verbs and due items that exist, so it names real commands and stays short.

### WS-17: Local landing and batch push

#### Scope

- The kickoff probe that picks local landing only when #849, #936, #937, #938 and #924 P4's `bkit fids parse --range` are on `dev` (D9, D56).
- The `publish=false` token in every child brief of a local-landing run, so design and plan closes land through #937's local target and ship squashes onto local `dev`.
- `manage push` (D10, D35): the foreign-commit check (any local `dev` commit missing from `origin/dev` and not named by a `manage-landed` row or bookkeeping stops the push and is listed; open question recommended A), `ci min-push`, the bookkeeping commit from the manager's worktree through `landDirect`, `branches push` under a tests slot, stop at the first red without rewriting local `dev`, the close of each child issue after a green push (`manage-issue-closed`, `UNCLOSED`), `manage-pushed` and a report.
- The flaky re-run (D40): identities from the JUnit report (`BKIT_TEST_REPORT`) matched against #1052's test identity field on `failures.jsonl` testing rows, re-run once, `manage-flaky-rerun`; until #1052's field exists no red counts as flaky.
- `LANDED-UNPUSHED` due item; the final push after WS-13's closing tasks.
- A `docs/decisions.jsonl` row recording D35's narrower scope against `715-no-batch-publish-verb`.
- Docs in the same change: `docs/observability.md` `push stopped: foreign commit` pattern, `.bkit/cli.md`.

#### Requires

[WS-6, WS-9, WS-10, WS-11, WS-12, WS-13]

#### Rationale

The landing-model boundary: everything that exists only in local mode depends on five open issues outside this design (#849, #936, #937, #938, #924 P4) plus #1052, and switches on at kickoff only when they are on `dev`.

## Suggested Plans

### P-1: Live desktop-app checks

#### Deliverable

Recorded results for a bkit `Stop` hook's block (C5), the `SessionStart` `resume` source (C7), `SessionEnd` and owner notification on the Code tab, with the app version and date, the v6.3 observations for C3, C8 and C9 written into `DETAILS.md`, and a go or stop on the one gated check (the `Stop` block) before hook code is built.

#### Covers

[WS-1]

#### Requires

[]

### P-2: Tracker children and field reads

#### Deliverable

The tracker adapter lists a parent's sub-issues on GitHub, Linear and Jira (Jira behind its live test) and reads `Size` and `Priority`, plus the issue mention render.

#### Covers

[WS-4]

#### Requires

[]

### P-3: Machine-lock `holders` subcommand

#### Deliverable

The copy-and-own `bkit-machine-lock.sh` template and bkit's own copy gain `holders`, with its I/O contract in `.bkit/templates.md` and an engine reader that reports an unwired or older copy.

#### Covers

[WS-6]

#### Requires

[]

### P-4: Per-workflow host allow-list

#### Deliverable

Every host renderer honours a `hosts:` allow-list on a workflow source, with a test that unlisted hosts render no file and `.bkit/providers.md` recording the exception.

#### Covers

[WS-15]

#### Requires

[]

### P-5: `/bkit-manage` with PR landing

#### Deliverable

A working `/bkit-manage <issue>` on the Claude desktop app that drives a parent and its sub-issues to closed with PR landing: the `manage` noun and run records, liveness and takeover, the manager answerer, the managed-run guard tier, the manager session hooks, worker coordination and the watcher, preflight, kickoff and queue, reports, progress and estimate, review and landing check, close and end, the phase-workflow ask points, the workflow file and its operator docs. It starts once #849, #936, #937, #938 and #924 P4 are on `dev` (D56).

#### Covers

[WS-2, WS-3, WS-5, WS-7, WS-8, WS-9, WS-10, WS-11, WS-12, WS-13, WS-14, WS-16]

#### Requires

[P-1, P-2, P-3, P-4]

### P-6: Local landing and batch push for managed runs

#### Deliverable

Managed runs land each issue on local `dev` and push in manager-sized batches with the foreign-commit check, bookkeeping landing, child-issue closes and the audited flaky re-run, switched on at kickoff once #849, #936, #937, #938 and #924 P4 are on `dev` (the flaky re-run stays inert until #1052's test identity field exists).

#### Covers

[WS-17]

#### Requires

[P-3, P-5]
