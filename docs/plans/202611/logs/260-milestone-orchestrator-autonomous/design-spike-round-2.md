Verdict: FAIL

<!-- verdict:end -->

# Design Spike

Scope: the unknowns in `tmp/260/review/design-review-1.md` § PoC Approach and § Unknowns & Blockers (items 1-4; item 5 the review settled by reading source and lists as needing no spike), against `docs/plans/202611/260-milestone-orchestrator-autonomous-design.md` as revised (`tmp/260/260-design-revision.diff`). Probe code and captured output live in `tmp/260/review/spike/`. Docs loaded: `.agents/rules.md` (from `bkit:end`), `.agents/docs.md`, `.bkit/workflows.md` (§ status.jsonl, § Concurrency lock, the `/bkit-build` steps table, § Local gate scripts, § Group gate, the tests lock), the `.bkit/prompts.md` rows for the build agents, and the `docs/decisions.jsonl` row `1012-v63-run-light-lane-for-small-one-fix-issues`. Only the headings of `docs/architecture.md`, `docs/technology.md` and `docs/security.md` were loaded, not their bodies.

## Claims

Ordered by blast radius. Each claim is numbered here; the review's own caveats are called C1-C5 and are cited by that name.

**Claim 1. A composed `light` child can run build's engine calls outside `bkit-build.md` (review Unknown 1).** Rests on D43, D44, D46, WS-18, the floor at `manage land-check`, `manage block` rows "in the child's own `status.jsonl`", and the REROUTE line.

- **1a. SETTLED.** Build's engine calls run end to end for a composed child outside `bkit-build.md`, and leave the floor's evidence in the child's own `status.jsonl`, provided every call uses `--workflow=build` and build's own step names. The calls covered are locks, worktrees setup, workflows start and input, steps done and finish, plan-check, context brief, tests red and green, context diff, steps stub for both challenge reviewers, and `tests run --changed-since --file`. The evidence left is a red with the test's blob, green PASS, two reviewer reports, and a changed-files `test-run` PASS. The design never states the workflow name. The engine fixes it:
  - `worktrees setup` and `workflows start` refuse `--workflow=light` with exit 2.
  - `tests red` and `tests run` accept `--workflow=light` without complaint, and write rows tagged `workflow: light` into the same log.
  - `tests run` accepts a step name build does not have (`--step=light-tests`).
  - `status resume --workflow=build` on the composed child's log reports `step: build-start-workflow`, `number: 1` even after the plan-tasks step is done. So "each child's phase and step (`bkit status resume` on the child's log)" shows a composed child as sitting at build Step 1.
- **1b. SETTLED.** A REROUTE `/bkit-build #N` on the stopped light child's FID can start, and runs from build Step 1, once the composed child has released the FID lock. Two conditions the design does not state:
  - While the composed child still holds the lock, `/bkit-build` Step 1 is refused with exit 8 (`route: stop`) until the lock is released or has been idle for 30 minutes.
  - After release, the REROUTE build does not start a fresh run. It resumes the composed run's open build run (`resumed: true`, `run: 1`, `lastDoneStep: build-plan-tasks`, with an "incomplete: 1 evidence hole(s)" warning), so the light run's rows end up in the REROUTE build's run 1.
- **1c. BLOCKED.** Dispatching the shipped subagents outside their workflow was not tried: `@bkit-build-plan-convert`, `@bkit-build-plan-tests`, `@bkit-build-plan-tasks`, `@bkit-build-challenge-1` and `@bkit-build-challenge-2`. This run has no agent-dispatch tool, so their outputs were hand-written fixtures. Claims 1a and 1b cover the engine calls only.
- **1d. BLOCKED.** `/bkit-ship` in PR mode on the composed child's branch.

**Claim 2. What "parent process gone" can detect in the desktop app's process tree (review Unknown 2, caveat C4).** Rests on D17, D36, D42, WS-9, and the `manage watch` exit rule, with its test that "an orphaned watcher stops within one poll".

- **2a. SETTLED.** The desktop app gives a background Bash task this ancestor chain:
  1. the command
  2. the Bash tool's `/bin/zsh -c` shell
  3. the per-session `claude` host process (pid 45501)
  4. `disclaimer --pgroup` (45496)
  5. `/Applications/Claude.app/Contents/MacOS/Claude` (64951)
  6. `launchd`

  Launched through `scripts/ci/bkit-test-awake.mjs` (D42), the watcher's own parent is the wrapper process, not the shell.
- **2b. DISPROVEN.** The claim was: under the D42 launch line, the watcher's parent process goes away when the manager's side of the tree goes away, so "the watcher exits when its parent process is gone" stops an orphaned watcher within one poll.
  - With the wrapper: the shell above the wrapper was SIGKILLed. The wrapper was reparented to pid 1 and stayed alive. The watcher's parent stayed the live wrapper, the watcher received no signal, and it ran to "finished normally". A check on the watcher's own parent cannot fire.
  - Without the wrapper: the watcher itself was reparented to pid 1, so the same check would have seen it.
- **2c. BLOCKED.** It is not known which ancestor ends when the manager's session ends or the app quits, or whether the background task, the wrapper or the watcher is signalled then.

**Claim 3. The D49 permission-mode deny (review Unknown 3, caveat C5).** Rests on D12, D49 and WS-7.

- **3a. SETTLED.** The permission-mode tool's exact name is `mcp__ccd_session_mgmt__set_session_permission_mode`.
- **3b. BLOCKED.** It is not known whether a `PreToolUse` hook fires for the app's own `mcp__ccd_*` session tools, or what tool name such a hook would receive.

**Claim 4. The WS-1 carry-overs (review Unknown 4).** Rests on D13, the `SessionStart` resume path and owner notification.

- **4a. BLOCKED.** It is not known whether a bkit `Stop` hook's `{"decision":"block"}` is honoured in the Code tab.
- **4b. BLOCKED.** It is not known whether the `SessionStart` hook receives the `resume` source together with a session id that matches the run's.
- **4c. BLOCKED.** Owner notification was not tried.

## Method

**Claim 1.** Three single-file scripts were used, run from the spike directory with `sh c2-chain.sh`:

- `tmp/260/review/spike/c2-chain.sh` drives the chain.
- `c2-setup.sh` builds the scratch repositories.
- `c2-fixture-plan.md` is a one-group, one-task plan in task-block form, standing in for convert's output.

`c2-setup.sh` creates a scratch bare origin (`spike/c2/origin.git`, branch `dev`) and a scratch consumer (`spike/c2/consumer`):

- tracker `none`, `worktrees.install false`
- a buggy `src/add.js` (`return a - b`)
- `bkit` linked as `node_modules/.bin/bkit -> {REPO}/dist/cli.js`
- a `bkit:test:file` script that meets `.bkit/workflows.md` § Local gate scripts: it runs the one file and writes JUnit to `$BKIT_TEST_REPORT`
- a `bkit:gate:changed` script that meets the same contract: it runs the tests when a source or test file is among its arguments, exits 0 otherwise, and writes JUnit into `$BKIT_TEST_REPORT_DIR`

The chain follows the review's PoC steps 1-6. Hand-written fixtures stand in for each subagent's output (the plan, the new test, the fix, the two reviewers' result files). The REROUTE half then replays build Steps 1-2 on the same FID: `locks acquire`, `worktrees setup`, `workflows start` and `status resume`.

There were three runs; only the third counts:

- `c2-chain.out`: the consumer scripts broke the contract. `bkit:test:file` wrote no JUnit, and `node --test test/` ran `.md` paths.
- `c2-chain-2.out`: JUnit was fixed, but on Node v24.16.0 `node --test test/` loads the folder as a module.
- `c2-chain-3.out`: the scripts meet the contract. This is the evidence run.

Claims 1c and 1d were not run.

**Claim 2.**

- `tmp/260/review/spike/c3-watcher-stub.sh` logs its full ancestor chain (`ps -o pid=,ppid=,lstart=,command=`), and any HUP, TERM or INT it receives, every 5 s for N rounds.
- Run A, a background Bash task: `node scripts/ci/bkit-test-awake.mjs sh .../c3-watcher-stub.sh .../c3-wrapped.log 5 8`.
- Runs B and C, background tasks: the same line logging to `c3-orphan-wrapped.log`, and the stub with no wrapper logging to `c3-orphan-bare.log`. While each ran, a foreground `sh tmp/260/review/spike/c3-orphan.sh <match> <log>` found that background task's own `/bin/zsh -c` shell. It refuses any other parent. It sent SIGKILL to that one shell only, waited 7 s, and printed the child's new parent and the log tail.
- The manager session, the host process and the app were not ended or quit. The Context does not allow that.

**Claim 3.**

- `tmp/260/review/spike/c1-session-args.mjs` parses this session's host argv (`ps -ww`). It lists the `mcp__ccd_*` names in `--allowedTools`, checks them for `set_session_permission_mode`, and lists the `--settings` keys.
- `c1-names.mjs` scans `~/.claude/projects/*/*.jsonl` for `deferred_tools_delta` attachments that add or remove the target name.
- `c1-transcripts.mjs` counts `hookName` values across transcripts and lists the settings hook matchers.
- Each ran with `node <file>`. No hook was registered, because that needs a settings change the Context forbids.

**Claim 4.** Not run. See Unsettled.

## Evidence

**Claim 1a**, from `tmp/260/review/spike/c2-chain-3.out` (`$C` = the scratch consumer):

The new workflow name is refused by the start calls:

```
== worktrees setup --workflow=light (a new workflow name)
[bkit-worktrees] --workflow must be design|plan|build|debug|ship
-> exit=2
== workflows start --workflow=light
[bkit-workflows] --workflow must be design, plan, build, debug, ship
-> exit=2
```

With `--workflow=build` the run starts, and the floor's records land:

```
== workflows start --workflow=build
resumed: false
run: 1
-> exit=0
== tests plan-check (after convert fixture)
-> exit=0
== steps finish build-plan-tests
verdict: PASS
-> exit=0
== tests red --workflow=light
[bkit-tests] bkit:lint:file is not declared — the tests are not linted before their red
enforced: true
attempt: 1
-> exit=0
== tests red --workflow=build
enforced: true
attempt: 1
-> exit=0
== steps finish build-plan-tasks
verdict: PASS
-> exit=0
== tests green --workflow=build
enforced: true
verdict: PASS
gaps: []
-> exit=0
== context diff (challenge input)
filesChanged: 3
-> exit=0
== steps stub bkit-build-challenge-1
findings: 0
-> exit=0
== steps stub bkit-build-challenge-2
findings: 0
-> exit=0
== tests run --changed-since --workflow=light
[bkit-tests] running pnpm bkit:gate:changed (15 changed files) — full output in $C/.git/bkit-outbox/dev-light-lane-probe/light-tests.log
-> exit=0
== tests run --changed-since --workflow=build --step=light-tests
-> exit=0
== tests run --changed-since --workflow=build --step=build-run-tests
-> exit=0
```

The rows in the child's `status.jsonl`, listed as type, workflow, step, verdict and group:

```
workflow-started build
session build
runtime-resolved build
step-done build build-start-workflow
step-done build build-worktree-setup
step-done build build-plan-convert
step-done build build-group-start  1
step-done build build-plan-tests PASS 1
step-done light build-tests-red  1
step-done build build-tests-red  1
step-done build build-plan-tasks PASS 1
test-run light light-tests PASS
test-run build light-tests PASS
test-run build build-run-tests PASS
engine-call rows: 22
```

The red record. This is from the second run, which had the same plan and test. Its red file was read before the scratch tree was deleted:

```
| 1 | `test/add.test.js` "add returns the sum" | red | failure: Expected values to be strictly equal: -1 !== 5 |
{"type":"step-done","workflow":"build","step":"build-tests-red","status":"DONE",...,"tests":[{"task":1,"test":"test/add.test.js","testName":"add returns the sum","state":"red","blob":"a8c08e5a642796cf78f7990a87049b7bcdb06b57","block":"1b4c932e465d1cf0c43eb25b79a9f8eebaab1feb"}],"uncommitted":true}
```

The `test-run` rows, third run, cut at 260 characters:

```
{"type":"test-run","workflow":"light","at":"2026-11-19T12:55:43Z","step":"light-tests","run":1,"verdict":"PASS","exitCode":0,"failures":0,"scope":"pnpm bkit:gate:changed (15 changed files)",...
{"type":"test-run","workflow":"build","at":"2026-11-19T12:55:45Z","step":"build-run-tests","attempt":1,"run":1,"verdict":"PASS","exitCode":0,"failures":0,"scope":"pnpm bkit:gate:changed (15 changed files)",...
```

The 15 changed files that `--changed-since={base}` passed to the gate include the run's own log artefacts. The full list:

```
> sh scripts/gate-changed.sh .bkit/friction.jsonl docs/plans/202611/dev-light-lane-probe-plan.md docs/plans/202611/logs/dev-light-lane-probe/build-brief-1-1.md ... docs/plans/202611/logs/dev-light-lane-probe/build-tests-red-1-x.md src/add.js test/add.test.js
```

The composed child's position as `status resume` reports it:

```
== status resume --workflow=build
step: build-start-workflow
number: 1
title: Start Workflow
-> exit=0
```

**Claim 1b**, from `c2-chain-3.out`, the REROUTE half:

```
== locks acquire (as /bkit-build Step 1, lock still held)
route: stop
message: build has held dev-light-lane-probe since 2026-11-19T12:55:28Z and last stepped at 2026-11-19T12:55:40Z. Nothing changed; this run can start again once that run ends or has been idle 30 minutes.
[bkit-locks] workflow already running for dev-light-lane-probe (workflow=build, idle 6s)
-> exit=8
== workflows start (as /bkit-build Step 2)
[bkit-workflows] [bkit-workflows] previous run (build run 1, closed never) was incomplete: 1 evidence hole(s), 0 step hole(s); see: bkit completeness check --workflow=build --file=docs/plans/202611/logs/dev-light-lane-probe/status.jsonl
resumed: true
run: 1
lastDoneStep: build-plan-tasks
openDecision: null
-> exit=0
== status resume after the REROUTE's start
step: build-start-workflow
number: 1
title: Start Workflow
-> exit=0
```

The lines between those two, from the second run, which is identical in shape:

```
== locks release (composed child's token)
released: true
-> exit=0
== locks acquire (as /bkit-build Step 1, after release)
route: go
-> exit=0
== worktrees setup (as /bkit-build Step 2)
[bkit-worktrees] committed the light record left uncommitted before the resume rebase
mode: resumed
-> exit=0
```

**Claim 2a**, from `tmp/260/review/spike/c3-wrapped.log`, round 0, columns pid, ppid, lstart, command:

```
83661 83562 Thu Nov 19 22:48:08 2026     sh {REPO}/tmp/260/review/spike/c3-watcher-stub.sh ~/Documents/
83562 83538 Thu Nov 19 22:48:08 2026     node scripts/ci/bkit-test-awake.mjs sh {REPO}/tmp/260/review/spike/c3-watcher
83538 45501 Thu Nov 19 22:48:08 2026     /bin/zsh -c source ~/.claude/shell-snapshots/snapshot-zsh-1795085184482-vauq4a.sh 2>/dev/null
45501 45496 Thu Nov 19 20:46:14 2026     ~/Library/Application Support/Claude/claude-code/2.1.325/485fdac4332e/claude.app/Contents/MacO
45496 64951 Thu Nov 19 20:46:14 2026     /Applications/Claude.app/Contents/Helpers/disclaimer --pgroup -- ~/Library/Application Support
64951     1 Sat Nov 14 11:48:17 2026     /Applications/Claude.app/Contents/MacOS/Claude
    1     0 Mon Nov  9 07:57:39 2026     /sbin/launchd
```

The end of the same log, with nothing killed:

```
22:48:48 watcher 83661 finished normally
wrapper exit=0
```

**Claim 2b**, wrapped, from the foreground `c3-orphan.sh` output and `c3-orphan-wrapped.log`:

```
before: child=72925 its parent shell=72923
72923 45501 Thu Nov 19 22:49:44 2026     /bin/zsh -c source ~/.claude/shell-snapshots/snapshot-zsh-179508
kill -KILL 72923 exit=0
after 7s: child=72925
72925     1 Thu Nov 19 22:49:44 2026     node scripts/ci/bkit-test-awake.mjs sh {REPO}/tmp/260/review/spike/c3-watcher
```

```
--- 22:50:09 round 5 watcher pid 72943 ---
72943 72925 Thu Nov 19 22:49:44 2026     sh {REPO}/tmp/260/review/spike/c3-watcher-stub.sh ~/Documents/
72925     1 Thu Nov 19 22:49:44 2026     node scripts/ci/bkit-test-awake.mjs sh {REPO}/tmp/260/review/spike/c3-watcher
    1     0 Mon Nov  9 07:57:39 2026     /sbin/launchd
22:50:14 watcher 72943 finished normally
```

No signal line appears in the log. The wrapper's `wrapper exit=` line never appeared, because the shell that would have printed it was dead.

Unwrapped, from `c3-orphan.sh` output and `c3-orphan-bare.log`:

```
before: child=29953 its parent shell=29938
kill -KILL 29938 exit=0
after 7s: child=29953
29953     1 Thu Nov 19 22:51:15 2026     sh {REPO}/tmp/260/review/spike/c3-watcher-stub.sh ~/Documents/
```

```
--- 22:51:20 round 1 watcher pid 29953 ---
29953     1 Thu Nov 19 22:51:15 2026     sh {REPO}/tmp/260/review/spike/c3-watcher-stub.sh ~/Documents/
    1     0 Mon Nov  9 07:57:39 2026     /sbin/launchd
22:51:35 watcher 29953 finished normally
```

**Claim 3a**, from `node c1-names.mjs`:

```
target=mcp__ccd_session_mgmt__set_session_permission_mode
transcriptFilesOfferingIt=725 deltaRowsAddingIt=1319 deltaRowsRemovingIt=0
firstSeen=2026-10-16T23:23:49.040Z lastSeen=2026-11-19T12:43:04.975Z
cliVersionsOnThoseRows=2.1.317:378 2.1.309:438 2.1.325:497 2.1.308:5 2.1.299:1
allSessionMgmtNamesOffered=mcp__ccd_session_mgmt__archive_session mcp__ccd_session_mgmt__clear_session mcp__ccd_session_mgmt__delete_session mcp__ccd_session_mgmt__detach_session mcp__ccd_session_mgmt__export_transcript mcp__ccd_session_mgmt__get_session mcp__ccd_session_mgmt__get_usage mcp__ccd_session_mgmt__list_events mcp__ccd_session_mgmt__list_sessions mcp__ccd_session_mgmt__search_session_transcripts mcp__ccd_session_mgmt__send_message mcp__ccd_session_mgmt__set_remote_control mcp__ccd_session_mgmt__set_session_effort mcp__ccd_session_mgmt__set_session_fast_mode mcp__ccd_session_mgmt__set_session_model mcp__ccd_session_mgmt__set_session_output_style mcp__ccd_session_mgmt__set_session_permission_mode mcp__ccd_session_mgmt__set_session_title mcp__ccd_session_mgmt__stop_session mcp__ccd_session_mgmt__unarchive_session
exit=0
```

From `node c1-session-args.mjs`, about this session's host (35 `mcp__ccd_*` names listed in `--allowedTools`, not repeated here):

```
pid=45501 argvBytes=4175
ccdToolNamesInArgv=35
contains 'set_session_permission_mode': false
contains 'permission_mode': false
settingsKeys=ultracode,deniedMcpServers,sandbox
exit=0
```

**Claim 3b**, from `node c1-transcripts.mjs`, which gives the context for why it is blocked:

```
~/Documents/GitHub/bkit/.claude/settings.json SessionStart matcher=null
~/Documents/GitHub/bkit/.claude/settings.json PreToolUse matcher="Edit|Write|MultiEdit|NotebookEdit"
~/Documents/GitHub/bkit/.claude/settings.json PreToolUse matcher="Bash"
~/Documents/GitHub/bkit/.claude/settings.json PreToolUse matcher="Read|Bash"
~/Documents/GitHub/bkit/.claude/settings.json PreCompact matcher=null
---
14089 "hookName":"PreToolUse:Bash"
6764 "hookName":"PreToolUse:Edit"
6194 "hookName":"PreToolUse:Write"
1982 "hookName":"PreToolUse:Read"
```

No hook in these settings matches an MCP tool, so the transcripts can neither show nor rule out a `PreToolUse` firing for `mcp__ccd_*`.

**Claims 1c, 1d, 2c, 4a-4c:** no output. They were not run.

## Design Impact

**Claim 2b** invalidates the watcher exit rule as written:

- D17: "The watcher exits when its parent process is gone, so no heartbeat outlives the manager's process by more than one poll."
- Components / Flows step 6 says the same, as does WS-9's "an exit when its parent process is gone, with a test that an orphaned watcher stops within one poll".

These three combine with D42's launch line through `scripts/ci/bkit-test-awake.mjs`. Under that line the watcher's parent is the wrapper. The wrapper waits on the watcher, so it outlives the watcher unless something kills it. When the side of the tree above it died, the wrapper was reparented to pid 1 and stayed alive. The watcher saw the same live parent and no signal, and ran on. A watcher that keeps refreshing `active.heartbeatAt` after the manager is gone keeps the FID lock live, and the run cannot be adopted.

What the evidence supports instead: the watcher checks the manager's own process, not its own parent. The manager's process here is the per-session `claude` host (pid 45501, start time `Thu Nov 19 20:46:14 2026`). Two ways to do that:

- Record the host's pid and start time when the watcher launches, and exit when that pid is gone or carries a different start time.
- Exit when that host no longer appears in the watcher's ancestor chain.

The unwrapped run shows that a chain-based check sees the break: the watcher was reparented to pid 1. Whether either check fires on a real session end or app quit is claim 2c, which is BLOCKED. If the app instead kills the whole process group when the session ends (`disclaimer --pgroup` points that way, but nothing here measured it), the watcher would die by signal and the check would never be needed. That is unproven.

No other claim is DISPROVEN. Claims 1a and 1b settled with conditions the design does not state. They are not invalidations, but the design has to state them:

- A composed child must take the FID lock and start its log as `--workflow=build` with build's step names. `worktrees setup` and `workflows start` refuse any other name. `tests red` and `tests run` accept `--workflow=light` without complaint, and would write rows that build's own steps do not read.
- `status resume` reports a composed child as at build Step 1, so the due list needs the `manage-block` rows, not `status resume`, to place it.
- `tests run --changed-since={base}` hands the gate the run's own `docs/plans/**` log files, and `.bkit/friction.jsonl` too. The gate has to ignore them.
- A light stop must release the FID lock. Otherwise the REROUTE `/bkit-build` is refused with exit 8 for up to 30 minutes.
- The REROUTE build resumes the composed run's build run 1 and inherits its rows (`lastDoneStep: build-plan-tasks`, "1 evidence hole(s)"). It does not start a fresh run. The design must say whether that is wanted, or have the composed run close its build run with a stop before the reroute.

## Unsettled

- **1c, the shipped subagents dispatched outside their workflow.**
  - Needs: a session with an agent-dispatch tool running `@bkit-build-plan-convert`, `@bkit-build-plan-tests`, `@bkit-build-plan-tasks` and both challenge reviewers against the scratch consumer, with the inputs a composed brief supplies.
  - Risk: a menu agent that needs build-only inputs fails or improvises. The design already defers this to a plan-time check per block (Risks, WS-18).
- **1d, `/bkit-ship` in PR mode on a branch with no closed build run.**
  - Needs: a GitHub remote the run may push to, and PR write access.
  - Risk: ship needs a build artefact the composed run did not write (D46, WS-18). The review settled the PR-mode entry by reading source only.
- **2c, what ends and what is signalled on a real session end or app quit.**
  - Needs: the owner ends a session (and separately quits the app) while a wrapped watcher stub logs its chain.
  - Risk: unless this is measured, neither the replacement check in Design Impact nor reliance on a process-group kill is shown to stop a watcher outliving the manager.
- **3b, whether `PreToolUse` fires for `mcp__ccd_*`, and the name it receives.**
  - Needs: a logging `PreToolUse` hook on `mcp__ccd_.*` registered in a Claude settings file, then one harmless session tool call. Changing settings is forbidden here.
  - Risk: if the hook never fires, the D49 deny is not enforced, and a worker could change its own permission mode.
- **4a, 4b and 4c, the WS-1 carry-overs.**
  - Needs: `Stop` and `SessionStart` hooks registered in settings, an owner-typed Code-tab session, a resume of it, and a notification target.
  - Risk: D13's stop-guard and the resume path rest on hook behaviour that has never been seen in the Code tab.

## Verdict Reasoning

`FAIL`, because claim 2b is DISPROVEN. Under the launch line D42 prescribes, the watcher's own parent is the sleep-prevention wrapper. In the probe the wrapper outlived the shell above it and stayed alive, reparented to pid 1. So D17's "exits when its parent process is gone" did not fire, and the watcher ran to completion with no signal. That is the failure caveat C4 predicted, now with captured output, and the revised design does not yet address it.

Claims 1a, 1b, 2a and 3a are SETTLED: 1a and 1b with conditions the design must state, listed in Design Impact. Claims 1c, 1d, 2c, 3b, 4a, 4b and 4c are BLOCKED. Each needs a service, a session action or a settings change this run does not have.

Cleanup: the scratch repositories `tmp/260/review/spike/c2/consumer` and `tmp/260/review/spike/c2/origin.git` were deleted before this verdict was set (`rm exit=0`). Nothing was installed. `git status --short` in the main checkout was empty afterwards.
