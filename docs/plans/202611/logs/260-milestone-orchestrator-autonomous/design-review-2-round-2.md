Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

Scope: only what the revision adds or changes (D42-D56, D4, D9, D12, D13, D17, D27, D32, D36, § Lanes and composed runs, § Flow: hold, fix, prove, land, wake, the watcher and STALLED text, the new data-model rows, WS-18, P-1, P-5, P-7). Line numbers are in `docs/plans/202611/260-milestone-orchestrator-autonomous-design.md`. "Detected by" is what the design says today, not what I would add.

<!-- prettier-ignore -->
| # | Component or flow | What fails | Detected by (as designed) | Blast radius |
| --- | --- | --- | --- | --- |
| F1a | Watcher heartbeat through the D42 wrapper (D17, D36, D42; lines 474, 493, 499, 414) | The manager process dies (crash, app quit, SIGKILL). `scripts/ci/bkit-test-awake.mjs` forwards TERM, INT and HUP to its child but never checks its own parent, and its `caffeinate -w` is bound to the wrapper's pid. The watcher's parent is now the wrapper, which is alive, so "exits when its parent process is gone" never fires. The watcher keeps writing `active.heartbeatAt` every 60 s until the 7200 s limit. | Nothing. The health line reads `heartbeat 1m · watcher live`. Only a stale "next report by" shows it, and that can be hours away. | One run. The lock stays live, so `manage kickoff --resume` from a new session is refused (D26 needs a heartbeat over 1800 s old). The owner must run `manage end` in his own terminal. The Mac stays awake. Every report's "last alive" is false. |
| F1b | Same heartbeat, manager alive but wedged | The app pauses messaging (`NEEDS-TYPED-PROMPT`), a permission card waits for a click, or a tool call hangs. The watcher is a separate process and goes on refreshing the heartbeat until something becomes due. | Only after the next watcher exit: the watcher stops writing once it exits and nobody restarts it, so `heartbeat stale` fires up to 7200 s plus 1800 s later (about 40 minutes under the old 600 s limit). Until then every report's "last alive" reads fresh. | Whole run, with a longer blind window than before. This is the shape of the v6.3 run's 379-minute stall, now behind a fresh heartbeat. |
| F1c | Watcher poll hangs (a `git diff`, `ps` or lock read under load; v6.3 load reached about 15) | The poll now computes the whole due list every 60 s, where the v6.3 `watch-builds.sh` only compared file times. A hung poll neither exits nor wakes the manager. D13's Stop hook checks only that the pid is live. | Heartbeat goes stale after 1800 s, but the only reader is the sleeping manager. | Whole run asleep until the owner notices the stale "next report by". |
| F1d | Watcher exit rule "exits only when the due list would gain an item" (D36) | "Gain" has no identity rule. The due lines carry ticking values (`quiet=41m`, `silent=22m`, `alive 14:02`, `clean=1 slots=3 queued=9 need=10`). If identity is the line text, one stalled worker is a new item every poll. | The `watch exit due-item` count in the counters, after the fact. | Cost, not correctness: D17's own figure is about 5 model calls and 1.2M input tokens per wake, so 60 wakes an hour is about 72M tokens an hour. |
| F1e | `active` is one JSON file with three kinds of writer (manager verbs, manager-session hooks, the watcher) (line 222) | A watcher's read-modify-write can overwrite `session` or `runToken` written by `kickoff --resume`; an old watcher outliving an adopt (F1a) can do this to the new manager's file; a watcher can recreate `active` after `manage end` removed it, turning the guard tier on with no run. | A malformed file keeps the tier on and names the parse error. A valid but wrong file is not detected. | One run; the guard tier and the session check. |
| F2 | STALLED redefinition (D32, line 290) | (a) A build held on purpose (D50) is quiet and trips STALLED after 35 minutes. (b) The v6.3 evidence in D32 says the largest builds needed a 50-minute limit; a fixed 2100 s alarms on them. (c) The exemption "neither waits for nor holds the tests lock" needs the waiter side. D8 adds a `holders` subcommand that prints holders only; the script already has `queue` (`bkit-machine-lock.sh` lines 40-41), which prints each waiting run and held place as `<who> — <checkout>`. (d) Any file change in the worktree resets the clock, so a looping test that writes logs hides a stuck worker. | STALLED itself, false in (a)-(c), missing in (d). | One worker or issue per occurrence; noise in the manager's turns. |
| F3a | Composed run has no workflow run (D44, § Lanes) | `liveReason` (`locks.ts:252-279`) returns `orphaned` when the child's log has no workflow run. A `light` child therefore holds no live per-FID lock, so a second session can start `/bkit-build #N` on the same issue and branch. The design does not say what creates the child's worktree, branch, `status.jsonl` or lock, or what "closed" means for a composed run. | Not detected. `manage-block` rows exist but nothing reads them for ownership. | One issue; breaks criterion 2 (no issue started twice) for every `light` child. |
| F3b | Light run outgrows its lane (the failure the v6.3 light run met first: 18 existing tests could not pass unchanged) | The run stops and `REROUTE` shows, but the design does not say what `/bkit-build` inherits: the branch with the composed run's commits, its worktree, or a fresh start. `manage next` prints the lightest lane from facts that do not include "a reroute happened", so the same child can be offered as `light` again. | `REROUTE` due item, `[bkit-manage] lane refused`, counters for reroutes. | One issue; a loop of light, stop, reroute, light. |
| F3c | Menu blocks run shipped agents outside their workflow | Checked against `.bkit/core/workflows/bkit-build.md` and `bkit-debug.md`: `@bkit-build-plan-tasks` reads a rendered group brief and expects the group's tests "written and recorded red"; `@bkit-build-plan-tests` reads a write brief; `@bkit-build-plan-verify` reads brief, diff, tests-green and decision files; `@bkit-debug-failure-reproduce` reads `{CI_SELECTION_FILE}`, `debug-input-N.md` and `context-*` files; both challenge agents read the plan and `tmp/bkit-diff-{FID}.md`, write a report plus a `Result:` JSON that `steps stub` renders, and `challenge merge` needs task-block form. The design acknowledges this in Risks and defers it to the plan. | Plan-time reading only. Nothing keeps the menu in step with an agent prompt after `bkit upgrade`. | Every `light` child. |
| F3d | Floor freshness "each newer than the last code change" | Timestamps compare badly with uncommitted edits and with rows written before a commit. A review that covered an earlier diff can pass the check. | `manage land-check`, but only as good as the comparison. | One landing. |
| F3e | Light landings and the batch push | A light child runs affected tests only, so a regression outside them first shows at the push hook. A red batch push stops at the first red with several landings behind it, and 15 to 20 minutes per failed push is the v6.3 cost. | `manage-pushed` result and `push reds` counter. Which landing is suspect is not shown. | A batch of landings. |
| F3f | `direct` lane (line 342) | "Only `*.md` files off the protected paths" treats agent-read instruction files as documentation: `.agents/rules.md`, `CLAUDE.md`, `.bkit/core/prompts/*.md` and `.claude/agents/*.md` are all `.md`, and bkit's own protected list names `.bkit/core/workflows/**` but not the prompts or rules. | The manager's one read. | Every agent in the clone, from one wording change. |
| F4 | Hold route (D50, lines 395-402) | A held child's worker dies or the child is parked, so `land-check` refuses the fix for ever (events are only `held`, `proved`, `woken`). Or the manager records a `proved` row naming any path. The proof is not tied to the fix's sha. The `woken` row is written after the go message, against D31's intent-first order. | `HELD` due item; no age alarm. | The fix and every other build waiting on a landing behind it. |
| F5a | Refused commands (D49, lines 291, 437) | The exact refused command goes into a public tracker comment. Refused commands are by construction the ones the permission system judged dangerous: credential reads, force pushes, `--no-verify`, `raise`. | None. | A secret or an exploitable detail on a public issue (`docs/security.md` § Public repo content; the run's own limit "no credential is printed"). |
| F5b | Same path | A refusal is a worker blocked on the owner, but `REFUSED` only "goes into the next report", and no Q7 trigger fires for it. Guard-tier refusals are also known to the engine, yet the design relies on the worker choosing to send `manage say --kind=refused`. | STALLED after 35 minutes at best. | One build, until the next push batch, question batch, park or run end. |
| F6 | `ASK-WORKERS` and `ARCHIVE-REFUSED` (D52, lines 292, 296) | The item "fires after each landing"; derived-on-read state has no fact saying the owner was asked or answered, so it either repeats on every `manage state` or vanishes. The archive attempt follows every landing, but the issue evidence says archive and clear were only measured on owner-typed turns; a refusal on any other turn is unmeasured, so `archive-refused` rows may be noise. The "send each call twice" quirk is not in the design. | The due list and the report. | Noise in every report; owner fatigue. |
| F7 | End-state yes (D47) | The three sentences are posted as an issue comment, but only `manage-report` and `manage-deviation` rows have the `UNPOSTED` retry. A failed post (the GitHub MCP returned 401 in this very design run) leaves the owner never seeing them. | `END-STATE-OWED` stays on the list, which looks like the owner has not answered. | One large issue waits. |
| F8 | Worker model from the registry (D48) | `.bkit/core/.bkit/prompts.md` § Orchestrators names `claude-sonnet-5-5` for `/build` and `/ship` and Opus for the rest; the v6.3 learnings say Opus workflow sessions "held up". The registry has no row for a composed run or for `/bkit-manage`. Sonnet orchestrators are documented there as prone to inlining drift. | The `manage-worker` `model` field and the report line for a different model. Drift itself shows only in a child's completeness check. | Every unattended build. |
| F9 | Wake-up rests on one observed run (D54) | An app release changes message or background-task wake behaviour. The previous design gated the build on live checks of C8 and C9; they are now accepted from one 52.5-hour session whose app version was not recorded. | Stale "next report by" only. | Whole run. |
| F10 | Guard-tier deny of `mcp__ccd_session_mgmt__set_session_permission_mode` (D12, WS-7) | The tool name appears only in the design. The issue's own brief names `mcp__ccd_session__start_session`; no spike, input or issue text records the permission-mode tool's name. The shipped guardrails matcher is `Bash` only (`.bkit/shared/.claude/settings.json`). A wrong name passes its fixture and denies nothing. | A fixture, which proves only the string. | The limit "a permission refusal is never lifted". |
| F11 | Idle-sleep hold (D42) | `bkit-test-awake.mjs` takes a sleep assertion only on macOS (`platform === "darwin"`, `caffeinate -is -w`); on Windows and Linux it is a plain pass-through. The preflight warns when the wrapper is absent, not when it is present and inert. | Nothing. | A run on a Windows desktop app sleeps with the owner's lid open. |

## Observability Coverage

Checked against the three things step 6 asks for: a structured log line with the `[Context]` prefix (`docs/observability.md` § Log Format), a counter, and a correlation id. "Has" means the design names it. The design's observability section (lines 368-383) was extended for the revision only by the `lane refused` pattern, the `due-item` exit reason and four counters.

<!-- prettier-ignore -->
| Failure mode | Log line with `[Context]` prefix | Counter | Correlation | Gap |
| --- | --- | --- | --- | --- |
| F1a orphan watcher | None. `[bkit-manage] heartbeat stale` cannot fire while the orphan writes. | `takeovers` only after the fact | `watch.pid` runToken | Lacks all three for the failure itself. No line says "watcher outlived its manager". |
| F1b wedged manager, live watcher | None until the stale line fires | None | None | Lacks all three. The two liveness facts (manager activity, watcher activity) are one timestamp, and no fact says "the watcher exited and nobody answered". |
| F1c hung watcher | None (`watcher-error` covers a crash, not a hang) | None | None | Lacks all three. |
| F1d wake storm | `[bkit-manage] watch exit {reason}` has it | `watcher exits per reason` has it | None | The reason `due-item` hides which item kind woke the manager, so the counter cannot show a storm's cause. |
| F1e two writers on `active` | Fail-closed parse error only | None | None | A valid-but-wrong `active` goes unseen. |
| F2 STALLED | The due line, no prefix line | None | worker name, FID, step | No counter for STALLED by cause (false alarm versus real); tuning the 2100 s needs one. |
| F3a/F3b composed run and reroute | `[bkit-manage] lane refused` has it | `landings per lane`, `reroutes` | child FID | A failed `manage block` is only a `pass`/`fail` row, with no log line and no counter. The lock gap in F3a has nothing. |
| F3e light landing red at push | `push stopped` lines exist | `push reds` | `manage-landed` carries `lane` | The report does not name which landings in the red batch were `light`. |
| F4 hold route | None | None | `manage-held` row | No age alarm, no counter, nothing for "held build whose fix was parked". |
| F5 refusals | `[bkit-guardrails] managed run {PARENT_FID} refused` has it (hook side) | `refused commands` | Parent FID | The hook line has the parent FID but not the child FID or session id, so it cannot be joined to a `manage-worker` row. Only the worker-reported path is recorded in `manage-heard`; the engine's own refusals are not written anywhere durable. |
| F6 worker stock | Due line | None | `manage-worker` | No row says "owner was asked at T"; no counter for archive refusals. |
| F7 end-state yes | Due line | None | `manage-question` kind `end-state` | Failed comment post has no retry row. |
| F8 model | Report line | None | `manage-worker.model` | Drift of a Sonnet orchestrator is left to each child's own completeness check. |
| F9 wake-up evidence | None | None | `manage-run.appVersion` | The app version is recorded but nothing compares it with the version the facts were observed on. |
| F10 tool-name deny | `[bkit-guardrails]` line has it | `refused commands` | Parent FID | The deny is verified only by a fixture. |

Existing coverage that the revision uses well and I found correct: the `Rules:` first line of `manage state`, the `watch exit {reason}` pattern, `manage-landed.lane`, and the counters for reroutes and landings per lane. The v6.3 figures the revision cites (39 context summaries, 52.5 hours, 28 and 115 turns, 0 `Not delivered`) are not checkable from this repository. I checked them only for internal consistency (see Verdict Reasoning).

## On-Call Ergonomics

"On-call" here is two readers: the manager session (acts on the due list) and the owner (reads reports on a phone, runs `manage end` or `manage kickoff --resume` from a terminal). For each new or changed alert: is the runbook obvious from the payload, is recovery automatic, idempotent or a judgement, and is the threshold tuned.

<!-- prettier-ignore -->
| Alert | Runbook obvious from the payload? | Recovery | Threshold and noise |
| --- | --- | --- | --- |
| `STALLED worker-NN #N quiet=41m step=…` (line 290) | Partly. It names worker, issue and step but not why quiet, and the manager's decision rule for it is not in WS-16's scope list. | Judgement (message the worker, replace it, park). Replacing a workflow worker is safe (`bkit status resume`); replacing a composed worker has no resume path stated (F3a). | 2100 s fixed. D32's own evidence says the largest builds needed 50 minutes; they will alarm. A held build trips it (F2a). |
| `REFUSED worker-03 #801 "exact command"` (line 291) | The payload is the command, which is the right content for the owner and the wrong content for a public comment (CRITICAL C4). | Owner judgement. The design gives no path from the item to an owner question (CRITICAL C5). | Event, not a threshold. |
| `ARCHIVE-REFUSED worker-02 "session title"` | Yes, it names the session and the action (owner archives it). | Manual, idempotent. | Likely noisy: attempted after every landing, evidence only covers owner-typed turns (F6). |
| `HELD worker-05 #833 waits-on=#840 proved=no` / `WAKE` | Yes for the state; no age and no "what if the fix is parked". | Judgement; `woken` is written after the message (F4). | Held builds also raise STALLED. |
| `REROUTE #812 light -> build reason=small-change-limit` | Reason is named. What `/bkit-build` starts from is not. | Semi-automatic: lane recorded as `build`. Not idempotent if `manage next` still prints `light` (F3b). | Event; fine once the loop is closed. |
| `END-STATE-OWED #790 size=L` | Yes. | Owner's yes; the manager asks in the next report. | Fine. Threshold (L) is an open question with a default. |
| `ASK-WORKERS clean=1 slots=3 queued=9 need=10` | Yes for the number. No for when it clears. | Owner types a turn; manager starts sessions. | Fires "after each landing" with no memory that the owner was asked (F6). |
| `Rules: v3 · re-read … · load the session tools again` | Yes. This is the best payload in the revision: one line, always first. | Automatic on the next turn. | Always present, so no noise. |
| `[bkit-manage] watch exit due-item` | No: the reason does not name the item. | Automatic wake. | The 7200 s limit is tuned from a measured 38-hour run. The identity rule is missing (F1d). |
| Report "last alive" and "next report by" (lines 414, 437) | Yes, in form. In substance "last alive" is now the watcher's pulse (F1). | Owner: `manage end` from his terminal, then a new session with `manage kickoff --resume`. `DETAILS.md` § recovery lists take over and end, but not "orphaned watcher" or "composed run left behind". | Tuned at 1800 s, which is now meaningless while any watcher lives. |
| `UNPOSTED` retry | Yes. | Automatic on each wake, so with a 7200 s watcher a failed post can wait up to two hours for its retry; the owner reads the missing report as a dead manager. | Retry interval is a side effect of the watcher limit, not a choice. |

## Operational Dependencies

Each is a new on-call burden the revision adds. None blocks the design by itself.

- **Alerts (due items) the manager must have a decision rule for in `bkit-manage.md`:** `REFUSED`, `ARCHIVE-REFUSED`, `HELD` / `WAKE`, `REROUTE`, `END-STATE-OWED`, and the redefined `STALLED`. WS-16 names only the app-note rule (D53) and read-only helpers as new text.
- **Log and grep patterns for `docs/observability.md` § Log Format:** `[bkit-manage] lane refused` (named) and `[bkit-manage] watch exit due-item` (named). Needed and not named: a failed `manage block`, an orphaned or hung watcher, a refusal joined to its child FID.
- **Runbook entries for `DETAILS.md` § recovery:** an orphaned watcher after a manager crash, a composed run left behind by a dead worker, a reroute, a held build whose fix was parked, and "the heartbeat is fresh but nothing moves".
- **Dashboards or reports:** one more report block (lanes per landing, rerouted issues, refused commands, workers needed, sessions to archive, word counts). One more health-line input if C1 is accepted (manager pulse and watcher pulse as two fields).
- **Config the owner or consumer must keep current:** `bkit.manage.protectedPaths` in `package.json` (a consumer that leaves the default has a default list that omits agent-instruction files, see O4).
- **Second place that describes each shipped subagent:** the block menu (D44's own stated sacrifice). It needs a drift test (O9), or every `bkit upgrade` that edits an agent prompt can silently break a block.
- **Records:** new `manage-*` row types (`manage-held`, `manage-away`, `manage-block`), a `docs/decisions.jsonl` row for the standing light lane (D43), and `counter` rows for lanes, reroutes, refusals and watcher exits.
- **Owner-side load:** a yes on the three-sentence end state for every issue of size L or larger; archiving refused sessions by title; typing a turn so worker sessions can be started (D52); answering refused-command questions.
- **Machine:** the watcher's launch line goes through `scripts/ci/bkit-test-awake.mjs` where adopted (macOS only); composed-run test runs take no tests lock.

## Verdict Reasoning

**CONCERNS.** Not PASS, because five CRITICAL gaps sit in the revised parts: the liveness signal no longer measures the manager (C1), the wake rule can storm (C2), the light lane has no owner for its lock, worktree or reroute (C3), and the refused-command path leaks into a public comment (C4) and has no escalation (C5). Not FAIL, because each is a missing rule that one design edit closes; none needs a different architecture. The unchanged core (run records, guard tier, due list, reports, takeover) is intact, and the lane work is the separable part: WS-18 and P-7 sit behind the rest, and the design says a lane "can be reviewed, shipped and switched off apart from the loop". Suggested order: close C1, C2, C4 and C5 before P-5 is planned; close C3 before P-7 is planned; P-1 to P-4 are unaffected, but P-1 should take on the two live checks in O7 and O8.

The question "Whether the parts added after the review get their own review before planning" (line 616) is open with A recommended. This review is half of A. The other half, a spike on the composed-run claims, is justified by what I found in source (F3c): four of the six agent blocks (`test-first`, `write`, `verify`, `convert`) read files that only a step command of their own workflow writes (a group brief, a write brief, `debug-input-N.md`, `build-input-{RUN}.md`), and the two reviewers need a plan file, `tmp/bkit-diff-{FID}.md` and a `Result:` JSON that `steps stub` renders. Spike targets: run `@bkit-build-challenge-1` and `-2` against an issue and a diff with no plan file and check the report survives `steps stub` and `challenge merge`; run `bkit manage block`'s done-check over a real `Result:` JSON; run `/bkit-ship` on a branch with no build run.

**Risks & Open Questions cross-check.** The four changed or new open questions (Stop block, `resume` source, "what counts as a large issue", "whether the added parts get their own review") each have lettered options on separate lines, a lettered Recommended and a Default if unanswered. No format finding. Coverage gaps: Risks does not mention F1a-F1e (heartbeat and wake), F3a-F3b (lock, worktree, reroute loop), F4 (hold deadlock), F5a-F5b (refused-command leak and escalation) or F10 (unsourced tool name). "Sleep is not observed as a failure" does not say the hold is macOS-only (F11). Each is raised below.

**Claims checked against this repository.**

- Confirmed: `scripts/ci/bkit-test-awake.mjs` exists and is the copy-and-own template of `.bkit/templates.md` § Local test sleep prevention; `bkit:test:file` is declared in `package.json` and described at `.bkit/templates.md:197` (not seeded; takes no tests lock); `bkit challenge gate` uses `CHALLENGE_SMALL = { lines: 300, files: 10 }` and excludes `docs/plans/**`, and a small change runs only `@bkit-build-challenge-2` (`challenge.ts:53-70`, `bkit-build.md:1089-1091`); all seven agents the menu names exist under `.claude/agents/`; `WORKFLOW_LOCK_IDLE_S` is 1800 at `locks.ts:43`; `liveReason` returns `orphaned` for a child with no workflow run; `/bkit-build` Step 2 feeds the issue description and comments to Plan Convert (`--description-file`, `--comments-file`, `NEWER_COMMENTS`), so D45 holds; decision `1012-v63-run-light-lane-for-small-one-fix-issues` exists (`docs/decisions.jsonl:972`).
- Narrower than the design states: that decision allows one reviewer, one run only, and excludes any "install, hook, permission or security surface"; the design runs two reviewers and makes it standing, and can check only paths, not the security surface (the design says so for permissions that no path names).
- Not found anywhere in the repo, the issue text, the input or the spike: `mcp__ccd_session_mgmt__set_session_permission_mode` (F10).
- Inaccurate or incomplete: D8's new `holders` subcommand overlaps the existing `queue` subcommand, which already prints held places and waiters (F2c). The `direct` lane's `*.md` test includes agent-instruction files (F3f). Success criterion 6 says every landed issue has a closed `/bkit-build` run or the floor's records, but `direct` has neither (line 342 asks only for a manager read).
- Internal consistency of the v6.3 figures: D17 counts 24 watcher results and D54 and the Reuse table count 28 watcher-started turns; D36 says the watcher ran about 38 hours and then computes the 315 wakes of a 600 s limit over "the same 52.5 hours" (38 hours gives about 228). 441 turns, 211 app-note, 115 message, 28 watcher and 39 summary turns add to 393, leaving 48 for owner-typed turns, which is plausible. The raw numbers are not checkable here; the plan should keep the transcript query that produced them.
- P-5's text contradicts itself: the title and deliverable say "with PR landing", the same paragraph says it starts only once the local-landing chain is on `dev` (D56), and its `Requires` lists plans only, so nothing in the plan graph holds it back. P-6's "switched on at kickoff once the chain is on `dev`" then has nothing to switch.

## CRITICAL

**C1. The heartbeat now measures the watcher, and the "orphan stops within one poll" claim is false once D42 is applied.** (HIGH. D17 line 474, D36 line 493, D42 line 499, § Run lifecycle line 414, WS-9, F1a, F1c, F1e.)

- The design says the watcher "exits when its parent process is gone, so no heartbeat outlives the manager's process by more than one poll", and also puts the watcher's launch line through `scripts/ci/bkit-test-awake.mjs`. The wrapper has no parent check (I read its source: it forwards TERM, INT and HUP, and runs `caffeinate -is -w <its own pid>`). With the wrapper in between, the watcher's parent is the wrapper. After a crash or a SIGKILL of the manager the wrapper is re-parented to pid 1 and stays alive, so the watcher keeps writing the heartbeat for up to 7200 s. D26's takeover needs a heartbeat older than 1800 s, so a new session cannot adopt the run, the Mac stays awake, and the report says "last alive 1m".
- WS-9's test ("an orphaned watcher stops within one poll") will pass if written against a direct launch and miss this one.
- A poll that hangs is not covered: `watcher-error` is a crash exit, and the Stop hook checks only that the pid is live. The poll is heavier than v6.3's (it computes the whole due list, including `git diff --name-only` per build, a tests-lock read and `bkit status resume` per child), and the v6.3 machine reached a load of about 15.
- `active` is one JSON file written by manager verbs, manager hooks and the watcher. Nothing says the watcher's write checks `runToken`, is atomic, or refuses to create the file. An old watcher that outlives an adopt can overwrite the new session and token, and one that outlives `manage end` can recreate `active`, which turns the clone-wide guard on with no run.
- Recommended fix (design text, one decision row): (1) the watcher exits when the manager's session process is gone, with that pid recorded in `active` at kickoff and resume, not when its immediate parent is gone; test it with the D42 wrapper in the launch line. (2) The watcher writes its own file (`watcherAt`), checks `runToken` before each write, never creates `active`, and exits when `active` is missing or carries another token; `manage end` and `manage kickoff --resume` stop the old watcher by `watch.pid`. (3) Each poll has a deadline of a few poll lengths; past it the watcher exits `watcher-error`. (4) Record each watcher exit (time, reason) and show `WAKE-UNANSWERED` on the health line when no manager activity follows it within 600 s. (5) Add the two log patterns (`[bkit-manage] watcher orphaned`, `[bkit-manage] wake unanswered`) and a counter to D30.
- Done when: D17/D36/D42 state the process rule, the file ownership and the poll deadline; WS-9's test names the wrapper case; D30 lists the patterns.

**C2. "Exits only when the due list would gain an item" has no identity rule, and the due lines carry ticking numbers.** (HIGH. D36 line 493, § Flow verb row 6 line 244, due list lines 284-304, F1d.)

- `STALLED worker-05 #833 quiet=41m`, `GO-UNACKED … silent=22m`, `Run: … alive 14:02` and `ASK-WORKERS clean=1 slots=3 queued=9 need=10` change every minute or every landing. If "gain an item" compares line text, one stalled worker wakes the manager on every 60 s poll. D17 puts a wake at about 5 model calls and 1.2M input tokens, so that is about 72M tokens an hour, on exactly the quiet-hours cost the 7200 s limit exists to remove. This is the alert-storm vector of the revision.
- Recommended fix: define identity as (kind, subject) with no numbers, for example `STALLED worker-05`, `REFUSED worker-03 #801`, `ASK-WORKERS`. The watcher keeps the set it saw at start and exits on a key that is new. State what makes a key leave the set (the item's own derivation, never a timer). Log `[bkit-manage] watch exit due-item:{kind}` and count exits per kind, so a storm names its cause.
- Done when: D36 and WS-9 state the identity rule, and WS-9 has a test that a stalled worker's growing `quiet=` causes one exit, not one per poll.

**C3. The `light` lane has no owner for its lock, worktree, branch or log, and its expected failure path (reroute) is unspecified.** (HIGH. § Lanes lines 336-363, D44 line 501, WS-18, F3a, F3b.)

- A composed run is "not a workflow". `liveReason` returns `orphaned` when the child's log holds no workflow run, so nothing marks a `light` child's per-FID lock live and a second session can start `/bkit-build #N` on the same issue and branch. That breaks success criterion 2 (no issue started twice) for every `light` child. The design never says what creates the child's worktree, branch and `status.jsonl`, what the `workflow-started` row is, or what "the composed run is closed" means (a close row, a lock release, the end of `LANDED-UNRECORDED` detection).
- The first light run in v6.3 ended in a stop (18 existing tests could not pass unchanged), so reroute is the common failure, not an edge. The design says `REROUTE` shows and the lane is "recorded again as `build`", and stops there. It does not say whether `/bkit-build` resumes the composed run's worktree (`bkit worktrees setup` creates or resumes `.worktrees/{FID}`), what Plan Convert sees of the composed run's commits, or what happens to red tests already written. And `manage next` prints the lightest lane from facts that omit "this child already rerouted", so the same XS or S child can come back as `light`: light, stop, reroute, light.
- Recommended fix: (1) say that a composed run opens the child's normal log with a `workflow-started` row for a `compose` run kind and takes the per-FID lock like any workflow, with `liveReason` reading the last `manage-block` row as its liveness; or say the lock is the manager's and name the check that refuses a second run. (2) Say how a composed run closes. (3) Add "a `REROUTE` row exists for this child" to the lane facts so the printed lightest lane is `build` after a reroute, and say that `/bkit-build` resumes the same worktree with the composed run's commits. (4) Count a reroute toward "two failed runs, then park".
- Done when: § Lanes states lock, worktree, log, close and reroute handoff, and a test covers a reroute followed by `manage next`.

**C4. The refused command is printed in a public report.** (HIGH. D49 line 506, § Reports line 437, § due list line 291, F5a.)

- A refusal comes from the permission system or from a guard-tier deny. The commands that get refused are the dangerous ones: a credential read, a forced push, `--no-verify`, `bkit:text:ceiling raise`. The design copies the exact command and the worker's session title into the next report, which is a comment on a public issue. `docs/security.md` § Public repo content and the run's own limit ("no credential is handled, read or printed") both rule that out. The command may hold a token typed into a `curl` line or an exploitable detail.
- Recommended fix: keep the verbatim command in `private.jsonl` and in chat for the owner, and put only the worker name, the issue and the refusing rule in the report, the way D2 already treats a possible weakness. Apply the scrub the tracker helper uses for diagnostics (`docs/observability.md` § Tracker reporting diagnostics: no raw provider errors, no credentials) to anything that reaches a comment. `manage-heard` already stores `raw?` only when rejected; say that a `refused` line's text is never stored in the committed log.
- Done when: D49 and § Reports say where the verbatim command lives, and `manage report` has a test that a refused line holding a token-shaped string never reaches report text (`manage report` already never reads `private.jsonl`).

**C5. A refused command has no path to the owner, and the engine's own refusals depend on the worker's goodwill.** (HIGH. D49 line 506, § Key Edge Cases line 35, § Reports Q7, F5b.)

- The input's limit is "a permission refusal in a worker is never lifted or routed around. It goes to the owner." The design makes it "goes into the next report", but Q7's triggers are a push batch, a batch of questions waiting, a parked issue and run end. A refusal alone triggers none of them, so a build blocked on the owner can sit until the next push, which can be hours, with nothing but STALLED (35 minutes of quiet) to show it. In the v6.3 run the manager asked the owner at once and got a yes.
- The guard tier already knows when it denies a command, yet the design records a refusal only if the worker sends `manage say --kind=refused`. A worker that routes around a deny, or just stops, leaves no row.
- Recommended fix: (1) A refusal becomes a `manage-question` of kind `decision` (options: allow this command, park the issue, stop the worker), so Q7's "a batch of questions waits" trigger posts the report and the owner sees it with the owner-question shape. (2) The guard tier writes each deny to a private `refusals.jsonl` beside `inbox.jsonl`; `manage state` folds it into `REFUSED`, with the worker's `manage say --kind=refused` as the route for app-level refusals the engine cannot see. (3) The `[bkit-guardrails]` refusal line also carries the child FID (from the cwd's `.worktrees/{FID}`) and the session id, so it joins to a `manage-worker` row.
- Done when: D49 states the question route and the engine-side record, and WS-7 has a fixture that a deny appears in `manage state` with no worker report.

## OPTIONAL

Not blockers. Each has a location and a done-when. Where a choice belongs to the owner it has lettered options, a Recommended and a Default if unanswered.

**O1. STALLED will alarm on the builds it was tuned against, and on a held build.** (MEDIUM. D32 line 489, line 290, F2.)

- D32's own evidence says the largest builds needed a 50-minute limit, and a fixed 2100 s (35 minutes) alarms on them. A held build (D50) is quiet by design. The tests-lock exemption needs the waiter side, and D8's new `holders` subcommand prints holders only; the shipped script already has `queue` (`scripts/ci/bkit-machine-lock.sh` lines 40-41), which prints each waiter and held place as `<who> — <checkout>`. Any file change in the worktree resets the clock, so a test that loops and writes logs hides a stuck worker.
- Fix: exempt a child with an open `manage-held` row; read waiters through `queue` and state why `holders` is still needed (or drop it, which also removes WS-6's new contract); count STALLED by outcome (acted on, dismissed, worker answered) so the limit can be tuned from the run's own data; and say that log writes under `tmp/` and `*.log` do not reset the clock.
- Open question: the STALLED limit.
  - A) Keep 2100 s for every step.
  - B) 2100 s, but 3000 s for a worker on the `build` or `ship` tests step, and no STALLED for a held build.
  - C) Make the limit a `bkit.manage` key with B as the default.
  - Recommended: B. It matches the 50-minute evidence the design cites, and the counter gives the data to move it.
  - Default if unanswered: B.
- Done when: D32 names the held exemption, the waiter source and the files that do not reset the clock, and a fixture covers a held build and a waiting build.

**O2. A hold has no age, no way out and no tie between the proof and the fix.** (MEDIUM. D50 line 507, § Flow lines 395-402, F4.)

- `HELD` has no age alarm. If the fix issue is parked or its worker dies, the held build waits for ever, because the events are only `held`, `proved` and `woken`. A `proved` row names a path, not the fix's sha, so a later commit can leave an old proof standing. The `woken` row is written after the go message, against D31's intent-first order, so a crash between the two re-sends the go message.
- Fix: add `released` (the fix is parked or abandoned, the hold ends and the held build is parked with the reason); `proved` carries the sha it was run against and `land-check` compares it with the fix's head; write `woken` before the message; show the hold's age on the `HELD` line and add a counter `held builds` with a "longer than 2 h" log line.
- Done when: § Flow lists the fourth event and the order, and a fixture covers a parked fix.

**O3. `ASK-WORKERS` and `ARCHIVE-REFUSED` have no memory.** (MEDIUM. D52 line 509, lines 292, 296, F6.)

- With state derived on every read and no fact for "the owner was asked at T", `ASK-WORKERS` either repeats on every `manage state` after each landing or vanishes. The issue evidence says archive and clear were measured only on owner-typed turns, so an `archive-refused` row after a manager-started turn may be a false alarm. The "send each call twice" quirk the issue records is not in the design.
- Fix: write a `manage-away` or `manage-question` row when the owner is asked and let the item's key depend on it (the item returns only when the need grows); log archive attempts with the turn kind (`owner-typed` or `app-note`); add a counter for archive refusals; state in the design whether the quirk is handled or left out.
- Done when: D52 states the "asked" fact and the turn kind it records.

**O4. The `direct` lane and the default protected-path list treat agent-instruction files as documentation.** (MEDIUM. § Lanes lines 342 and 350, F3f, success criterion 6.)

- `direct` is "only `*.md` files off the protected paths". The default list names hooks, CI files, the manifest and the lockfile; bkit's own repo adds `.bkit/core/workflows/**`, `.bkit/core/engine/install/**`, `.bkit/core/hooks/**` and `.bkit/shared/**`. It does not name `.agents/rules.md`, `CLAUDE.md`, `.bkit/core/prompts/**` or `.claude/agents/**`, which are all text files that every agent in the clone reads as instructions. One wording change in them reaches every run with no test, no review and no log row. A consumer that keeps the default list has no protection for its own rules file.
- Criterion 6 says every landed issue has a closed `/bkit-build` run or the floor's records; `direct` has neither (it asks for a manager read), so the criterion does not hold as written.
- Open question: what `direct` may touch.
  - A) Only `docs/**/*.md`, `README.md` and `*.md` files that no hook, workflow or agent reads.
  - B) Any `*.md` off the protected list, and add the agent-read files to the default list.
  - C) No `direct` lane.
  - Recommended: B, with the agent-read paths in the default so a consumer gets them.
  - Default if unanswered: A, the narrowest.
- Done when: § Lanes names the paths, and criterion 6 says what a `direct` landing leaves behind (a `manage-landed` row with `lane=direct` and the manager's read recorded as a `manage-block`-style row).

**O5. A failed post of the end-state yes is never retried, and a retried report waits up to the watcher limit.** (MEDIUM. D47 line 504, F7, `UNPOSTED` row in On-Call Ergonomics.)

- Only `manage-report` and `manage-deviation` rows have the `UNPOSTED` retry. The three sentences go out as an issue comment, and a failed post (the GitHub MCP returned 401 in this design run) leaves the owner never seeing them while `END-STATE-OWED` still reads as "he has not answered". Retries run on each wake, so with the watcher's 7200 s limit a failed report post can wait about two hours, and the owner reads the missing report as a dead manager.
- Fix: give `manage-question` kind `end-state` the same posted flag and retry; make the retry a due item (`UNPOSTED report`) that the watcher counts as new, so the wake comes on the next poll; show "posting failed" next to "next report by".
- Done when: D47 and § Reports say that every owner-facing comment has the posted flag, and WS-12 has a fixture for a failed end-state post.

**O6. The worker-model registry has no row for a composed run or for the manager.** (MEDIUM. D48 line 505, F8.)

- `.bkit/core/.bkit/prompts.md` § Orchestrators names `claude-sonnet-5-5` for `/build` and `/ship` and Opus for the rest, and notes that Sonnet orchestrators drift on inlining. A composed run (D44) is an orchestrator the registry does not list, so `manage` has no source for its model and will use the `light` child's default. The v6.3 learnings say Opus workflow sessions "held up".
- Fix: add a registry row for the composed run and for the manager; state in D48 which model a `light` child gets and that the report names any child whose model differs from the registry row; test that `manage` reads the registry and never a literal.
- Done when: § Orchestrators has the two rows and D48 names the source.

**O7. The Stop-hook block (C5) stays a gate; add the app version comparison, and say what a failed check does.** (MEDIUM. D54 line 511, WS-1, P-1, F9.)

- D54 keeps the `Stop` hook's block in the Code tab as a live check and records the app version in `manage-run`. Nothing compares the recorded version with the version the facts were observed on, so a later app release changes the behaviour with no warning. A gate that has no failure path says only "gate".
- Fix: P-1 runs this check first and records the app version and date in `DETAILS.md`; `manage preflight` warns when the running version differs from the recorded one (no block); state in WS-1 what the build does when the Stop block fails (fall back to the heartbeat and the report as the only liveness signals, and say so on the health line).
- Done when: P-1 lists the check and its failure path, and preflight has the version warning.

**O8. The `SessionStart` `resume` source and the owner notification (C7 and what notifies the owner) need dated checks too.** (MEDIUM. D54 line 511, P-1.)

- The remaining live checks include the `SessionStart` `resume` source with its session-id match, and what notifies the owner when a run needs him. Takeover (D26) and `manage kickoff --resume` rest on the first; every "owner is waiting" signal rests on the second. Neither was observed by the v6.3 run.
- Fix: P-1 runs both on the Code tab, records the result with the app version, and WS-1's test names them; where the owner notification is only a banner or a push, the report's "next report by" is the only reliable cue and the design should say so.
- Done when: P-1's checks list matches D54's.

**O9. The block menu is a second description of each shipped subagent, with no drift check.** (MEDIUM. § Lanes line 352, D44, WS-18, F3c.)

- D44 names the second description as its own stated sacrifice. The agents read files their own workflows write: `@bkit-build-plan-tasks` a rendered group brief and tests "recorded red"; `@bkit-build-plan-tests` a write brief; `@bkit-build-plan-verify` a brief, a diff, a tests-green record and decision files; `@bkit-debug-failure-reproduce` `{CI_SELECTION_FILE}`, `debug-input-N.md` and `context-*` files; both challenge agents a plan file and `tmp/bkit-diff-{FID}.md`, and each writes a report plus a `Result:` JSON that `steps stub` renders and `challenge merge` merges only in task-block form. A `bkit upgrade` that edits any of these prompts can break a block with nothing to catch it.
- Fix: a `bkit check` item that, for each menu block, lists the agent file it names, confirms the file exists and records a hash of its "Read" lines; fail when the hash moves without a menu edit. Spike before P-7 (see Verdict Reasoning).
- Done when: WS-18 lists the drift check and the spike result.

**O10. "Each newer than the last code change" compares timestamps that do not mean what the check needs.** (MEDIUM. § Lanes line 353, F3d.)

- A review run against an earlier diff, uncommitted edits made after the review, and rows written before a commit all compare wrongly by time.
- Fix: each floor row (`test-first`, `review`, `tests`, `verify`) records the head sha, plus a hash of the diff for uncommitted work, that it covered; `manage land-check` compares those with the head it is about to land.
- Done when: § Lanes and WS-18 say the floor compares shas, and a fixture covers a review that preceded a later commit.

**O11. A red batch push cannot say which landing broke it, and a `light` landing is the likeliest.** (MEDIUM. D46, F3e.)

- A light child runs affected tests only. A regression outside them first appears at the push hook. The v6.3 cost of a failed push is 15 to 20 minutes, and a batch stops at the first red with several landings behind it. The report does not name which landings in the batch were `light`.
- Fix: `manage-pushed` lists the landing ids and their lanes, and the red line names the `light` and `direct` landings first; the manager's next step after a red push is to bisect from those (instruction text, not engine).
- Done when: § Reports lists landings with lanes in the push block.

**O12. The guard-tier deny names a tool that no source in the repository or issue gives.** (MEDIUM. D12 line 469, WS-7, F10.)

- `mcp__ccd_session_mgmt__set_session_permission_mode` appears only in the design. The issue's brief names `mcp__ccd_session__start_session`. The shipped guardrails hook matcher is `Bash` only (`.bkit/shared/.claude/settings.json`), so denying an MCP tool needs a second matcher the design does not list, and a wrong name passes a fixture that checks only the string.
- Fix: P-1 records the tool's real name from the app's deferred-tool list (copy the line) and the date; WS-7 adds the `mcp__` matcher to the managed-run hook and a test that the deny fires on the recorded name; if the tool cannot be named, say that the limit rests on the permission system alone and downgrade the claim.
- Done when: the design names the source of the tool name, and WS-7 lists the matcher change.

**O13. The idle-sleep hold works on macOS only and the preflight cannot tell.** (LOW. D42 line 499, F11.)

- `scripts/ci/bkit-test-awake.mjs` takes a sleep assertion only when `platform === "darwin"` (`caffeinate -is -w`); on Windows and Linux it is a pass-through. The preflight warns when the wrapper is absent, not when it is present and inert, and Risks says only that "sleep is not observed as a failure".
- Fix: preflight warns on a non-darwin platform ("the run will sleep with the lid closed"); Risks names the platform limit; the health line reads `awake: no` on such a host.
- Done when: the preflight warning and the Risks line exist.

**O14. Risks & Open Questions leaves out the heart of the revision's failure modes, and the new on-call text has a gap.** (MEDIUM. Risks and Open Questions, § Observability line 368, § recovery in `DETAILS.md`.)

- Not in Risks: F1a-F1e (heartbeat and wake), F3a and F3b (lock, worktree, reroute loop), F4 (hold deadlock), F5a and F5b (refused command leak and escalation), F10 (tool name) and F11 (sleep on non-macOS).
- Not in the log-pattern list (§ Observability): a failed `manage block` (it is only a `pass` or `fail` row today), an orphaned or hung watcher, a wake with no answer, a refusal joined to its child FID. Not in the `DETAILS.md` recovery section: an orphaned watcher after a manager crash, a composed run left behind by a dead worker, a reroute, a held build whose fix was parked, and "the heartbeat is fresh but nothing moves".
- Fix: add one Risks row per failure mode above with its detector; add the four patterns and their counters to § Observability and `docs/observability.md` § Log Format; add the five recovery entries to WS-16's list.
- Done when: each C1-C5 and O-item in this review that the owner accepts has a Risks row, a pattern and a recovery line.

**O15. The v6.3 figures disagree with each other, and P-5's text disagrees with D56.** (LOW. D17, D36, D54, Reuse table, P-5 line 1082, P-6 line 1096.)

- D17 counts 24 watcher results; D54 and the Reuse table count 28 watcher-started turns. D36 says the watcher ran about 38 hours and then works out the 315 wakes of a 600 s limit over "the same 52.5 hours"; 38 hours gives about 228. The turn counts (441 total; 211 app-note, 115 message, 28 watcher, 39 summary) add to 393, which leaves 48 owner-typed turns, plausible. The raw numbers cannot be checked from this repository.
- P-5's title and deliverable say "with PR landing", the same paragraph says it starts only after #849, #936, #937, #938 and #924 P4 are on `dev` (D56), and `Requires` lists plans only, so nothing in the plan graph holds it back. P-6's "switched on at kickoff once the chain is on `dev`" then has nothing to switch.
- Fix: keep the transcript query behind the figures in `DETAILS.md` and make D17, D36 and D54 use one count and one duration; rename P-5, and add the five issues to its `Requires` so the plan graph carries D56.
- Done when: the figures agree, and P-5's title, deliverable and `Requires` say the same thing.

## OUT OF SCOPE

Outside the operability lens or outside the revision's scope. Deferred to the owner or to other reviewers.

- **The owner has not confirmed the light lane as a standing rule.** Decision `1012-v63-run-light-lane-for-small-one-fix-issues` (`docs/decisions.jsonl:972`) covered one run, one reviewer, and excluded any "install, hook, permission or security surface". D43 makes the lane standing, runs two reviewers and can check only paths. The owner's later "Yes, light lane" answer is the only support for the wider rule, and D43 plans a new decisions row. A reviewer of scope or product should check that the row records the wider scope, not the old one.
  - A) Record D43 as the standing rule, as designed.
  - B) Record it as standing for XS and S issues only, with the security-surface exclusion kept, and revisit after the first two managed runs.
  - C) Keep it as a per-run choice at kickoff.
  - Recommended: B. It keeps the 1012 exclusion that the design can enforce only by path.
  - Default if unanswered: A, as designed.
- **The input says the five phase workflows stay step for step.** The `light` lane sets that aside for small issues. The owner's later "Yes, light lane" resolves it; it is a consistency note for the scope reviewer, not an operability gap.
- **Delivery risk of D56's prerequisites.** P-5 starts only when #849, #936, #937, #938 and #924 P4 are on `dev`; those five are open work outside this design. If one slips, P-5, P-6 and P-7 slip with it. This is planning risk, not run operability.
- **Host parity.** `/bkit-manage` is Claude desktop only (D15, D16), and the guard-tier deny of the app's session-management tool has no equivalent on the other four hosts. The project rule asks for a sourced "no equivalent" where a Claude-only guard is added; D15 points to Q3's sources and a test that the other hosts render nothing. I did not check the Q3 sources. A parity reviewer should.
- **The v6.3 evidence itself.** I could check the figures only for internal consistency (O15), not against the session transcript, which is not in this repository.
- **Security of the guard tier's deny list** (what the guard tier should deny, beyond the one tool name in O12) belongs to a security review.
