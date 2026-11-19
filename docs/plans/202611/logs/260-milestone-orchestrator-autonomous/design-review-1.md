Verdict: CONCERNS
Spike: true
Fingerprint: a02c55715ae13d4ad07eb423a2e1cc69e01081beeb45ac0909b38c68fdfb7292
<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

Scope: `design-v1-draft.md` for `/bkit-manage <issue>` (#260), read against `design-input-1.md` (session prompt, the 2026-11-19 issue comment, and the grill decisions, which are the newest text). Docs loaded: `.agents/docs.md`, `docs/architecture.md`, `docs/technology.md`, `docs/capabilities.md` (no rows for this area), `docs/decisions.jsonl` (targeted keys), and targeted sections of `.bkit/core/.bkit/workflows.md` and `.bkit/core/.bkit/jsonl.md`. `.bkit/workflows.md` (1,937 lines) and `.bkit/prompts.md` were read by section only. Index warnings: none; every doc the index lists for Design is present and filled in.

## Prior Art Search

<!-- prettier-ignore -->
| Capability | What exists (path, maturity) | Fit | Recommendation |
| --- | --- | --- | --- |
| Local landing for every child workflow, the manager's bookkeeping landing, the foreign-edit stop, batch-push support | `docs/plans/202611/924-every-workflow-land-design.md` (#924, open; split into #936 P1 publish mode and start base, #937 P2 local landing target with design / plan local close, #938 P3 ship and debug local, P4 batch-push support). It is a finished design with spikes C1-C8, not code yet. Today `land.ts` pushes design / plan closes, the roadmap mirror and ship's close straight to `origin/dev` (`.bkit/core/engine/commands/land.ts:1-9`). | Covers more than 80% of the run's landing needs: `landDirect` on the local target lands design / plan closes, `advanceLocalDev` stops with `blocked` `edited-files` / `occupied` and never touches foreign edits, a landing lock under the Git-common outbox, a `[skip ci]` tail guard and `bkit fids parse --range` for batch pushes. Gap: it lists "a bkit batch-push command" and "pushing dev (the owner does it)" as non-goals, so `manage push` is the remaining 20%, and that conflict needs a Decisions row. The draft cites only #938 and restates its own ship contract (`design-v1-draft.md:133-140`). | `EXTEND-EXISTING`: depend on #936 / #937 / #938 by name and point to the #924 design as the landing contract (CRITICAL 1). |
| Third answerer | `bkit decisions apply --by=headless\|owner\|rerun` (`.bkit/core/engine/commands/workflow/decisions.ts:523-548`), mature and used by build and ship. It reads only `build-decision-*.md` (`decisions.ts:87-90`, `:324`). | Fits build Decision Pauses only. It does not cover design grill, plan, debug or ship questions. Ship's Confirm Assumed Items step (`.bkit/core/workflows/bkit-ship.md:386-416`) asks "the owner" in the worker session and writes `--by=owner --confirm`. | `EXTEND-EXISTING`, plus a rule for every other ask point (CRITICAL 2). |
| Assumed marker readers | `open-decision.ts:104` (`/^Accept \(assumed\)/`) and `:150` (`ACCEPTED`), which feed `pending`, `summary.ts:591-592` and `tasks.ts`. | The draft's literal `Accept (assumed, by the manager)` matches neither regex. | `EXTEND-EXISTING`: keep `Accept (assumed)` as the prefix, or widen both regexes (CRITICAL 3). |
| Severity and fixability per pause item | Challenge task meta line `**Severity:** … · **Fixable:** …` (`.bkit/core/prompts/bkit-build-challenge-1.md:115`, parsed in `challenge.ts:95-180`); unfixable items are composed as hard blockers (`bkit-build.md:172`, `:178`). `ComposeItem` has no severity or fixable field (`decisions.ts:109-117`); `deferralRow` guesses severity from the text and defaults to MEDIUM (`decisions.ts:307`). | The refusal can be built from the hard-blocker marker and the plan's meta line. Verify gaps carry no severity at all. | `ADAPT` (CRITICAL 4). |
| Where each pause option leads | `DECISION_ROUTES` (`step-table.ts:217`), build only. | Fits build. Other workflows have no route table. | `EXTEND-EXISTING`, as the draft says (D6). |
| One manager per parent | `bkit locks acquire --kind=workflow`; liveness in `liveReason` (`locks.ts:251-279`) needs an `IN_PROGRESS` run whose last step row is under `WORKFLOW_LOCK_IDLE_S = 1800` (`locks.ts:42`). | A log holding only `manage-*` rows has no run, so its lock reads as `orphaned` and can be taken by a second `/bkit-manage #N`. | `EXTEND-EXISTING` with a manage liveness rule (CRITICAL 5). |
| Run records | `status.jsonl` fold ignores unknown types (`.bkit/core/.bkit/jsonl.md:397`). Workflow enums: `worktrees.ts:66`, `tracker.ts:1600`, `summary.ts:23`. | Fits. Each enum needs `manage` added. | `EXTEND-EXISTING`. |
| Private run files | `outboxRoot()` (`commands/lib.ts:1164`), § Tracker reporting boundary. | Fits. | `EXTEND-EXISTING`. |
| Children read | No sub-issue read in `tracker.ts` / `issues.ts` (text search for `sub_issue`, `subissue`, `sub-issue`, `children`: ADF nodes only). gh 2.102 exposes `gh issue view --json subIssues`, and REST `repos/{o}/{r}/issues/{n}/sub_issues` returned 3 children for #753 in this review. Linear `Issue.children` is an `IssueConnection` per third-party schema mirrors (not checked against introspection). Jira is not verified. | Small adapter addition. | `EXTEND-EXISTING`. |
| Size and priority | Projects v2 GraphQL in `tracker.ts:1296-1350` reads `Status` only; `moveOnBoard` fails as `scope` without `project` scope. | The fallback to `manager-sized` covers a token without `project` scope. | `EXTEND-EXISTING`. |
| Blocked-by | `bkit issues blocked-by` (`issues.ts:1026`, `:1135-1151`), all three trackers. | Use as is. | `USE-AS-IS`. |
| Test slots | Machine lock template `scripts/ci/bkit-machine-lock.sh` ("Example. Copy into scripts/ci/ and own it."), with `local_stack_lock_holder [name]` as a sourced function; the engine reads only the give-up status file (`lib.ts:170-173`); "An unwired repository takes no lock" (`.bkit/core/.bkit/workflows.md:1231`). | No engine reader for live holders, and no slots at all in an unwired repo. | `ADAPT` (CRITICAL 7). |
| Batch push | `bkit branches push --mode=dev` (`branches.ts:922-990`), `bkit ci min-push`, the push gate with receipts (`ci/push-gate.ts`), #924 P4. | Fits once #937 keeps every child landing local. | `EXTEND-EXISTING`. |
| Hard limits | `guardrails-deny.js` (argv-parsed git, `+refspec`), `guardrails-tiers.js` (ask tier), `guardrails-shell.js` (redirect targets, `KNOWN_WRITERS`), `gateguard-engine.js`. No workflow step tells an agent to run `branch -D`, `worktree remove --force`, `--force-with-lease`, `--no-verify` or `commit -n` (text search of `.bkit/core/workflows/` and `.bkit/core/prompts/`), so a managed tier does not refuse a workflow's own step. | Fits. | `EXTEND-EXISTING`. |
| Stop / SessionStart hooks | `.bkit/shared/.claude/settings.json:110-163` has `SessionStart` (no matcher), `PreToolUse`, `PreCompact`, and no `Stop`. Every entry is wrapped `test -f … && node … \|\| true`, so a hook can block only through JSON on stdout, never through exit 2. | Fits. | `EXTEND-EXISTING`. |
| Wake-up sources | Background `manage watch` (v6.3 practice). Claude Code `SendMessage` `notify_when_idle` (v2.1.236+, 12-hour expiry) sends one notice when a worker next goes idle. | `notify_when_idle` cannot see a stalled worker, so it can add to the watcher but cannot replace it. | `BUILD-CUSTOM` watcher; optionally `USE-AS-IS` `notify_when_idle` (OPTIONAL). |
| Desktop / local check | `runtime.ts:17`, `:89-132` (`CLAUDE_CODE_REMOTE`). | Add `CLAUDE_CODE_ENTRYPOINT`. | `EXTEND-EXISTING`. |
| Claude-only install | `renderClaudeAgentsCommands` (`install/modules/claude.ts:32-72`) lists every `bkit-*.md` with `listMdFiles`; workflow sources carry YAML frontmatter (`bkit-auto.md:1-3`). | A `hosts:` key is feasible; every renderer and the parity tests change. | `EXTEND-EXISTING`. |
| Finish estimate | `.bkit/stats.jsonl` holds 150 `outcome` rows, 75 of them for build, each with `time.totalMinutes` and `plan.total.tasks`. The draft names this data (`design-v1-draft.md:77`) but seeds a constant table from one run. | The measured data exists from day one; only the function is new. | `ADAPT`: seed from the outcome rows (CRITICAL 9). |
| Manager instructions | `/bkit-auto` takes `PHASE` as input (`bkit-auto.md:109`) and never chooses it or starts a session. | Does not cover the capability. The draft's reason ("would break its one-FID, every-host contract") reads as close-but-different. | `BUILD-CUSTOM`, with the reason restated (CRITICAL 10). |
| Report comments, mentions, pending list, closing tasks | `bkit issues comment` / `fetch` (`issues.ts:1075`, `:1200`), `decisions pending` (`decisions.ts:662`), `bkit-audit-deferrals.md`, `bkit-audit-testing.md`, `@bkit-utility-update-roadmap`. | Fits. | `USE-AS-IS`. |

## Stack Feasibility

The design can be built with the approved stack (Node.js ESM and TypeScript engine, Markdown workflows, Claude Code hooks, gh and the tracker adapters). It adds no runtime dependency and no new technology class. It depends on the following constraints:

- **Hooks in the desktop app.** PreToolUse hooks fire in the desktop app: this review's own Write call was answered by the bkit GateGuard PreToolUse hook. Hooks docs list `SessionStart` sources `startup`, `resume`, `clear`, `compact` and `fork`, and say a Stop hook blocks with `decision: "block"` and `reason`. Whether `Stop` and `SessionStart` `compact` fire in the Code tab is still unverified (Spike).
- **Session identity.** The env-vars doc says `CLAUDE_CODE_SESSION_ID` "matches the `session_id` field in the hook JSON input and is updated on `/clear`". The `active` file's session gate can therefore be built, and it goes inert after an owner `/clear`.
- **Effort and surface signals.** `CLAUDE_EFFORT` is documented with the levels `low`, `medium`, `high`, `xhigh` and `max`, and is "Only set when the current model supports" effort. This review's session reads `xhigh`. `CLAUDE_CODE_ENTRYPOINT` is undocumented (not in env-vars.md); this session reads `claude-desktop`.
- **Messaging.** The cross-session doc says: "When the receiving session is idle, Claude Code starts a new turn with the message." The same doc documents limits that can stop an unattended run: the burst refusal at 30 recent sends, a 50-message accepted queue, held messages that the desktop app drops at the 5-minute `dialogExpiry` when the two sessions' permission classes differ, and `Not delivered: this session keeps answering other sessions`, which needs a typed prompt. The desktop doc adds that the cross-session surface sees "the 20 most recently active sessions" and that archiving shows an approval card except in Auto and Bypass modes. bkit ships `acceptEdits` (decision `claude-sessions-stay-in-accept-edits-with-no-shell-network-ask-row`), so archiving needs the owner.
- **Starting sessions** stays owner-only (input, measured). No documented tool starts a Code-tab session.
- **Landing.** Local landing depends on the unbuilt #924 chain; PR landing works today.
- **Trackers.** Board fields need `project` scope. In this session `BKIT_GH_TOKEN` returned `Bad credentials` and the GitHub MCP returned 401, which is the kind of failure the preflight's tracker-access check exists to catch.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library / API | Maturity | Footprint | Types | License |
| --- | --- | --- | --- | --- |
| Claude Code hooks (`Stop`, `SessionStart` `compact` / `resume`, `PreToolUse`) | GA, documented; already used by bkit | None (host) | JSON stdin / stdout contract; the engine is TypeScript | Host terms; no code vendored |
| Claude Code cross-session messaging (`SendMessage`, `ListAgents`, `notify_when_idle`) | Documented; v2.1.224+ (macOS / Linux), `notify_when_idle` v2.1.236+, `@` mentions v2.1.232+ | None | Not applicable (tool calls) | Host terms |
| Claude desktop Code-tab session surface (list, message, archive) | Documented in desktop.md; start-session behaviour measured only (input) | None | Not applicable | Host terms |
| `CLAUDE_EFFORT`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_CODE_MESSAGING_SOCKET` | Documented | None | Strings | Host terms |
| `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_DESKTOP_APP_VERSION` | Undocumented, observed in this session | None | Strings | Host terms |
| gh CLI `issue view --json subIssues`, REST `sub_issues` | gh 2.102.0 here; REST call verified live | None (already required) | JSON | MIT (gh) |
| GitHub Projects v2 GraphQL fields | GA; needs `project` scope | None | JSON | Service terms |
| Linear GraphQL `Issue.children` | Present per third-party schema mirrors; not checked against introspection | None | JSON | Service terms |
| Jira parent links (JQL `parent =`) | Not verified in this review | None | JSON | Service terms |
| Node built-ins (`fs` polling or `fs.watch`, `child_process.spawnSync`) | Stable | None | `@types/node` | MIT |

No npm dependency is added, so bundle and install size change only by the engine's own `dist/` growth. Agent-read text grows by one workflow plus verb help, which needs the owner's `pnpm bkit:text:ceiling raise` (the draft's last open question).

## Integration Risk

Systems touched:

- **Engine:** `decisions.ts` / `open-decision.ts`, `locks.ts`, `status.ts` / `runs.ts`, `tracker.ts` / `issues.ts`, `runtime.ts`, `branches.ts` / `land.ts`, `registry.ts`, a new `manage.ts`, the five host renderers, `worktrees.ts`, and `summary.ts` enums.
- **Hooks:** `guardrails-*.js`, `gateguard-engine.js`, and `.bkit/shared/.claude/settings.json` (new `Stop` and matcher-scoped `SessionStart` entries).
- **Workflows:** `/bkit-build` Decision Pause step 4, `/bkit-ship` Confirm Assumed Items, and the design / plan close under local mode.
- **Docs:** `.bkit/workflows.md`, `.bkit/prompts.md` § Orchestrators, `.bkit/providers.md`, `.bkit/cli.md`, `DETAILS.md`, `docs/capabilities.md`.

Blast radius:

- **Every run, not just managed ones.** The assumed-marker parsers and `decisions apply` are read by every build and ship. A marker change that `open-decision.ts:104` / `:150` do not match silently drops manager assumptions from ship's confirm list.
- **Every agent session in the clone during a run.** The managed guard tier binds them all, including the owner's side sessions, and turns off on a stale heartbeat.
- **Every host renderer and the parity tests.** The `hosts:` filter touches the opencode-claude gate parity test in `install/modules/index.integration.test.ts`.
- **Every concurrent landing on the clone.** The landing model meets `land.ts`, which today publishes design / plan closes and roadmap mirrors to `origin/dev` from every child. Under local landing this splits local `dev` from `origin/dev`, and D10's plain push of local `dev` is then refused as non-fast-forward.

Monorepo fit: not applicable; bkit is a single package (`docs/technology.md` § Not used).

## PoC Approach

Run a throwaway spike in the Claude desktop app on a scratch consumer, not in bkit's checkout:

1. Have the owner start one manager and two workers (`use_worktree: false`).
2. Install a prototype `Stop` hook that blocks through JSON while a pid file is live.
3. Install a `SessionStart` hook with matcher `compact|resume` that injects a fixed line.
4. Force `/compact` and confirm that the line arrives and that `CLAUDE_CODE_SESSION_ID` equals the hook's `session_id`.
5. Have a worker send a one-line report while the manager is idle with a background watcher running, then again while it is busy. Record whether each starts a turn, waits, or is held.
6. Run about 60 scripted manager-worker exchanges with no typed prompt and record when, if ever, `Not delivered: this session keeps answering other sessions` appears.
7. Prototype `decisions apply --by=manager` on a fixture `build-decision` file and confirm that `decisions pending` lists the item.
8. Write a `status.jsonl` that holds only `manage-*` rows and confirm what `locks acquire` reports for it.

Build nothing into the product.

## Unknowns & Blockers

1. Whether `Stop` and `SessionStart` (`compact`, `resume`) fire in the desktop Code tab. The draft's fallbacks cover a miss, but D13's refusal of an idle turn does not. Needs running code.
2. Which channel workers use to reach the manager (the desktop session surface or `SendMessage`), and whether a message starts a turn on a manager whose only activity is a background watcher. Needs running code.
3. The threshold for `Not delivered: this session keeps answering other sessions` across a day of unattended exchanges, and whether the desktop session surface has the same pause. Needs running code.
4. Whether background-task completion wakes the manager while a worker counts as working (measured once in the v6.3 run, not documented).
5. The order in which #936, #937 and #938 land, and whether #924 P4's `bkit-cloud.yml` range read is needed before the first local batch push. This can be settled by reading the tracker and the #924 design.
6. Jira children read and Linear `children` arguments. These can be settled from the tracker docs or introspection.

## Verdict Reasoning

`CONCERNS`. The stack can carry the design:

- Every engine piece extends a mature command.
- Hooks fire in the desktop app.
- The session identity, effort and messaging primitives are documented.
- No new dependency is needed.

Nothing makes it infeasible. CRITICAL lists ten addressable caveats:

- **HIGH:** the landing model rests on #938 alone while the in-repo #924 design (#936, #937, #938) is the real dependency.
- **HIGH:** the third answerer leaves ship's owner-only confirm step and every non-build ask point without a recorded provenance.
- **MEDIUM:** the assumed marker breaks two parsers.
- **MEDIUM:** the refusal has no data source.
- **MEDIUM:** the lock liveness rule treats a manage run as orphaned.
- **MEDIUM:** the worker channel and the documented messaging limits are unspecified.
- **MEDIUM:** no slot-holder reader exists.
- **MEDIUM:** the guard tier fails open on a stale heartbeat.
- **MEDIUM reuse caveat:** the estimate.
- **LOW reuse caveat:** `/bkit-auto`.

`Spike` is `true` because unknowns 1-4 can be settled only by running code in the desktop app.

## CRITICAL

1. **HIGH — Local landing depends on the #924 chain, not on #938 alone** (`design-v1-draft.md:133`).
   - **What the draft does.** D9-D11 and the ship contract assume that only ship needs a local mode. Today `/bkit-design` and `/bkit-plan` close with `bkit branches land` (`bkit-design.md:599`, `bkit-plan.md:505`), and build publishes with `roadmap mirror` (`bkit-build.md:1396`). All of these push to `origin/dev` through `land.ts`.
   - **What goes wrong.** In a local-landing run, every design or plan child would publish on its own and spend a pre-push gate run and a CI run each, against Q12. Local `dev` would split from `origin/dev`, and D10's plain push of local `dev` would then be refused as non-fast-forward. D10 forbids rewriting local `dev`, so the run would have no way out.
   - **Missing path.** The manager's `feat/{PARENT_FID}` rows have no named route onto local `dev`.
   - **The existing answer.** `docs/plans/202611/924-every-workflow-land-design.md` already solves all of this: `landDirect` on the local target, `advanceLocalDev`'s `edited-files` and `occupied` stops, the landing lock, and P4 batch-push support. #938 itself names #936 and #937 as "Required first".
   - **Done when:**
     - The Reuse & Prior Art table and Related Issues name the #924 design, #936 and #937.
     - Local mode briefs every child with `publish=false`.
     - The manager's bookkeeping lands through the local target.
     - The draft's own ship contract is replaced by a pointer to the #924 design.
     - The push flow says who closes each child issue after the batch push, since a local ship leaves it open with `bkit:merged`.
     - A Decisions row records that `manage push` supersedes the #924 design's non-goal of "a bkit batch-push command".
2. **HIGH — The third answerer covers build decision files only** (`design-v1-draft.md:228`).
   - **What the draft does.** The "worker asks" flow lists a grill question and "any owner question" as ask points, but `decisions apply` reads only `build-decision-*.md` (`decisions.ts:87-90`, `:324`).
   - **Ship's confirm step.** It asks "the owner" in the worker session. A manager reply of Confirm would run `decisions apply --by=owner --confirm --reason="{human's words}"` (`bkit-ship.md:406`). That writes a `docs/decisions.jsonl` row reading "accepted by owner", so the manager's assumption becomes the owner's acceptance. This breaks the limit "a worker, watcher or app message is never the owner's approval" and the draft's own D19.
   - **Other ask points.** Design grill, plan, debug and the "Action needed" stops have no recorded-answerer path at all.
   - **Done when:**
     - The design names, for each workflow's ask points, how a manager answer is recorded as assumed: the grill's `Assumed` section, a decision file, or a status row.
     - The design says that ship's Confirm Assumed Items is never answered by the manager in a managed run. Either the engine refuses `--by=owner` while the run-active marker is fresh, or the step defers every item for the owner.
3. **MEDIUM — The literal `Accept (assumed, by the manager)` breaks the assumed-item readers** (`design-v1-draft.md:270`).
   - `open-decision.ts:104` sets `assumed` only on `/^Accept \(assumed\)/`, and `ACCEPTED` (`open-decision.ts:150`) needs `)` and then the end of the line or ` —`. Both fail on `, by the manager)`.
   - As a result, `pending`, the build summary (`summary.ts:591-592`) and ship's confirm list would not show manager assumptions. D5's claim of "no new reader" is false for that literal.
   - **Done when** the marker keeps the parsed prefix (for example `Accept (assumed) — by the manager: {reason}`), or the design lists both regex changes and their tests.
4. **MEDIUM — The HIGH / unfixable-MEDIUM refusal has no data source** (`design-v1-draft.md:230`).
   - Decision items carry no severity or fixable field (`ComposeItem`, `decisions.ts:109-117`). Severity is only guessed from the text, with MEDIUM as the default (`decisions.ts:307`), and verify gaps have no severity at all.
   - Unfixable items are already marked: they are hard blockers with `Recommended: none` (`bkit-build.md:172`, `:178`). Severity lives in the plan task's meta line (`challenge.ts:95-180`).
   - **Done when** the design states the rule per item kind (for example, refuse `Accept` on every hard blocker, and on every challenge item whose plan meta says HIGH or CRITICAL), or adds `severity` and `fixable` to `decisions compose` items, tracing the contract change through every `decisions compose` caller.
5. **MEDIUM — Lock liveness reads a manage run as orphaned** (`design-v1-draft.md:63`).
   - `liveReason` (`locks.ts:251-279`) counts a lock as live only for an `IN_PROGRESS` run whose last step row is under 1,800 s old.
   - D17 has no step rows and no `workflow-started` row, so `run === undefined` gives `orphaned`. A second `/bkit-manage #N` is then not refused with exit 8, and a quiet stretch over 30 minutes also reads as stale.
   - **Done when** the design names the manage liveness signal (`manage-*` rows or the `active` heartbeat) and where `liveReason` reads it.
6. **MEDIUM — The worker-to-manager channel and the messaging limits are unspecified** (`design-v1-draft.md:194`).
   - **The undefined exit.** `manage watch` exits on `worker-line`, but nothing writes a line the watcher can see: `manage say` only prints, and `manage hear` is run by the manager.
   - **The documented limits.** The draft's Risks omit all of these:
     - `Not delivered: this session keeps answering other sessions` needs a typed prompt.
     - The desktop app drops held messages at the 5-minute `dialogExpiry` when the two sessions' permission classes differ.
     - Sends are refused after a burst of 30.
     - At most 50 messages are queued.
     - The desktop listing shows only the 20 most recently active sessions.
     - Archiving needs an approval card in `acceptEdits`.
   - **Done when:**
     - The design names the tool workers use.
     - `manage say` also appends the line to the run's outbox so the watcher can exit on it.
     - Each limit has a Risks line with a fallback.
     - The preflight checks the permission-mode class or `crossSessionInbound`.
7. **MEDIUM — The engine cannot read the slot authority** (`design-v1-draft.md:273`).
   - D8 makes the machine `tests` lock the only slot authority, but the engine reads only the give-up status file (`lib.ts:170-173`).
   - Live holders are visible only through `local_stack_lock_holder` in a copy-and-own script, and an unwired repository takes no lock (`.bkit/core/.bkit/workflows.md:1231`).
   - **Done when** the design names the holder-read contract (a script subcommand or a lock-directory layout recorded in `.bkit/templates.md`) and the slot rule for an unwired repository (for example `BKIT_TEST_SLOTS` alone).
8. **MEDIUM — The hard limits fail open on a stale heartbeat** (`design-v1-draft.md:129`).
   - The managed tier turns off when `active`'s heartbeat is stale. That happens exactly when the manager has crashed while workers still run, which contradicts settled Q19 ("Hard limits stay hard").
   - **Done when** the tier stays on while an unclosed `manage-run` exists and an owner-run release ends it, or the design shows that a stale heartbeat also stops every bound worker.
9. **MEDIUM — Reuse caveat: the finish estimate is marked `NEW` while measured data exists** (`design-v1-draft.md:77`).
   - Candidate: `.bkit/stats.jsonl` `outcome` rows (75 build rows with `time.totalMinutes` and `plan.total.tasks`).
   - The draft names this data as the nearest prior art, then seeds a constant table from one run instead.
   - **Done when** the estimate seeds from the outcome rows (by plan task count or size) and keeps the constants only as the fallback when no rows exist, or the design states why the rows cannot be used.
10. **LOW — Reuse caveat: the reason for not using `/bkit-auto` is close-but-different** (`design-v1-draft.md:59`).
    - Candidate: `/bkit-auto` (`bkit-auto.md:109`).
    - **Done when** the Reuse row states what `/bkit-auto` lacks: it takes the phase as input and never chooses it, and it never starts or messages a session. It should not rest on the contract an extension would break.

## OPTIONAL

- **Effort warning.** Order the levels `low < medium < high < xhigh < max`, so that `xhigh` and `max` never warn. Treat an unset `CLAUDE_EFFORT` as unknown and warn on it.
- **`notify_when_idle`.** Add `SendMessage`'s `notify_when_idle` as a second wake source for idle workers. It never replaces the watcher, because it cannot see a stalled worker.
- **`/clear` in `DETAILS.md`.** Record that an owner `/clear` changes `CLAUDE_CODE_SESSION_ID`, so the manager-only hooks go inert until the manager registers again.
- **Parent with its own work.** Say what happens when the parent issue itself needs work: the manager's lock on `PARENT_FID` refuses a worker's `/bkit-*` run on the same FID.
- **Failed report comment.** Name the fallback when a report comment fails (tracker writes are best-effort): post the report text in chat and retry at the next report point.
- **Flaky re-run contract.** The re-run needs the failing tests' identities from the push gate (the JUnit report path `BKIT_TEST_REPORT` in `junit.ts`) and a test identity field on `failures.jsonl` testing rows. State that contract, or point to #1052 for it.
- **Children read.** Prefer `gh issue view --json subIssues` over raw REST for GitHub, so the adapter keeps one gh call shape.

## OUT OF SCOPE

- A tool that repairs an existing split between local `dev` and `origin/dev` (the #924 design defers it as `849-local-dev-recovery-tool`).
- #924 P4's `bkit-cloud.yml` range read for batch pushes. It is owner CI sign-off work inside #924, and a managed run only consumes it.
- A cloud trigger loop (#324), preference memory across repositories, and budget caps. The owner excluded all three.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Local landing depends on the #924 chain (#936, #937, #938), not #938 alone
  **Severity:** HIGH · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:133` · **Round:** 1
  - **DONE WHEN:** Reuse & Prior Art and Related Issues name docs/plans/202611/924-every-workflow-land-design.md, #936 and #937; local mode briefs every child with publish=false; the manager's bookkeeping lands through the local target; the draft's own ship contract is replaced by a pointer to the #924 design; the push flow names who closes each child issue after the batch push; a Decisions row records that manage push supersedes the #924 design's 'no bkit batch-push command' non-goal.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Third answerer covers build decision files only; ship's Confirm Assumed Items would record a manager reply as the owner's acceptance
  **Severity:** HIGH · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:228` · **Round:** 1
  - **DONE WHEN:** The design names, per workflow ask point (design grill, plan, debug, ship, Action needed stops), how a manager answer is recorded as assumed, and states that ship's Confirm Assumed Items is never answered by the manager in a managed run (the engine refuses --by=owner while the run-active marker is fresh, or the step defers every item for the owner).
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** The literal 'Accept (assumed, by the manager)' fails open-decision.ts:104 and :150, so pending, the build summary and ship's confirm list drop manager assumptions
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:270` · **Round:** 1
  - **DONE WHEN:** The marker keeps the parsed 'Accept (assumed)' prefix (for example 'Accept (assumed) — by the manager: {reason}'), or the design lists both regex changes in open-decision.ts with their tests.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** The HIGH / unfixable-MEDIUM refusal has no data source in decision items
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:230` · **Round:** 1
  - **DONE WHEN:** The design states the refusal rule per item kind using existing markers (refuse Accept on every hard blocker, and on every challenge item whose plan meta line says HIGH or CRITICAL; say what applies to verify gaps, which carry no severity), or adds severity and fixable fields to decisions compose items and traces that contract change through every compose caller.
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Lock liveness (locks.ts liveReason) reads a manage run with only manage-* rows as orphaned
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:63` · **Round:** 1
  - **DONE WHEN:** The design names the manage liveness signal (manage-* rows or the active heartbeat) and where liveReason reads it, so a second /bkit-manage #N exits 8 while the first is live and a quiet stretch over 1800 s is not read as stale.
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Worker-to-manager channel unspecified; the watcher's worker-line exit has no source; documented messaging limits are missing from Risks
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:194` · **Round:** 1
  - **DONE WHEN:** The design names the tool workers use to reach the manager; manage say also appends the line to the run's outbox so manage watch can exit on it; Risks give a fallback for each documented limit ('keeps answering other sessions' pause, 5-minute dialogExpiry drop of held messages in the desktop app, 30-send burst refusal, 50-message queue, 20-session listing, archive approval card in acceptEdits); the preflight checks the permission-mode class or crossSessionInbound.
  - **TEST FIRST:**
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** D8's slot authority has no engine reader for live tests-lock holders and no rule for an unwired repository
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:273` · **Round:** 1
  - **DONE WHEN:** The design names the holder-read contract (a machine-lock script subcommand or a lock-directory layout recorded in .bkit/templates.md) and the slot rule when the repository takes no tests lock.
  - **TEST FIRST:**
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** The managed guard tier turns off on a stale heartbeat, which contradicts settled Q19 'Hard limits stay hard'
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:129` · **Round:** 1
  - **DONE WHEN:** The tier stays on while an unclosed manage-run exists and an owner-run release ends it, or the design shows that a stale heartbeat also stops every bound worker.
  - **TEST FIRST:**
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** Reuse caveat: the finish estimate is marked NEW while .bkit/stats.jsonl outcome rows hold measured build durations
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:77` · **Round:** 1
  - **DONE WHEN:** The estimate seeds from .bkit/stats.jsonl build outcome rows (time.totalMinutes by plan.total.tasks or size) and keeps the constant table only as the fallback when no rows exist, or the design states why those rows cannot be used.
  - **TEST FIRST:**
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** Reuse caveat: the reason for not extending /bkit-auto is close-but-different
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:59` · **Round:** 1
  - **DONE WHEN:** The Reuse row for manager instructions states what /bkit-auto lacks (it takes the phase as input and never chooses it; it never starts or messages a session) instead of the contract an extension would break.
  - **TEST FIRST:**
<!-- bkit:task 10 end -->
