Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

Scope: the parts the revision adds or changes (D42-D56, changed D4/D9/D12/D13/D17/D27/D32/D36, § Lanes and composed runs, § Flow: hold, fix, prove, land, wake, the watcher and STALLED rows, the new data-model rows, WS-18, changed WS-1/WS-7..WS-12/WS-16, P-1/P-5/P-7). Every claim about a shipped agent, step, script or command was checked against the source on `dev`.

1. **Light lane as a composed run (D43, D44, design lines 336-362).**
   - Exists: `/bkit-build` (`.bkit/core/workflows/bkit-build.md`, mature, the default lane). It already has step skips driven by the session prompt (Step 6 `Skip if ... [skills=false]`, line 646) and a small-change route at Step 11 (lines 1089-1121: under 300 lines and 10 files, challenge-2 only).
   - Fit: from source, every menu agent except `tests` can be fed only by build's own scaffolding: a build status file, `build-input-{RUN}.md`, a plan in task-block form, `context brief`, the `{OUTBOX}` result file and the `steps stub` render (items 2-4 below). A composed run therefore re-runs build Steps 1-4, 7 and 11 with the same engine calls, but outside the workflow file. D44 turns down a lite mode of `/bkit-build` for two reasons. One is that open issues are rewriting `bkit-build.md`, which is a messy-existing-candidate reason. The other is that one pared-down shape fits neither a doc fix nor a small bug, which is a close-but-different reason. Both trigger the reuse caveat (CRITICAL C1).
   - Recommendation: `EXTEND-EXISTING`. Add a light route inside `/bkit-build`: a session-prompt token that skips Steps 5, 8-10 and the full Step 12 gate and runs both challenge reviewers whatever the size. `/bkit-build` covers more than 80% of a light run. The gap is that skip route and the forced second reviewer.
2. **`test-first` block (design line 352).**
   - Exists: `@bkit-build-plan-tests` plus `bkit tests red` / `tests green` (`.bkit/core/engine/commands/workflow/tests.ts:11-17`; `.bkit/core/.bkit/cli.md` § tests). This is test-first evidence keyed on one group's open tasks and their TEST FIRST lines. Also `@bkit-debug-failure-reproduce`.
   - Fit:
     - plan-tests reads `{WRITE_BRIEF}` from `bkit context brief --plan=... --group=... --tests-only --file={STATUS}` (`bkit-build.md:707`). `tests red` requires `--file --workflow --group --plan`. Neither runs without a plan in task-block form.
     - `@bkit-debug-failure-reproduce` reads `{CI_SELECTION_FILE}`, `debug-input-{DEBUG_ATTEMPT}.md` and the Step 4 `context-*` artefacts, takes `Mode: {DEBUG_MODE}`, and finishes with `steps finish --workflow=debug --attempt-of=debug-run-tests:current` (`.bkit/core/workflows/bkit-debug.md:556-569`). None of that exists outside `/bkit-debug`.
   - Recommendation: `USE-AS-IS` for plan-tests plus `tests red`/`green`, after `convert`. The done-check reuses `tests red`/`green` rather than adding a new one. Under the design's own menu rule (line 352), `@bkit-debug-failure-reproduce` stays off the menu.
3. **`write` and `verify` blocks.**
   - Exists: `@bkit-build-plan-tasks`, which reads `{BRIEF}` from `context brief --plan --next --file={STATUS}` (`bkit-build.md:693`, `:739`). `@bkit-build-plan-verify` reads glob `build-brief-{GROUP}-*.md`, `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` and the group's tests and tasks logs (`bkit-build.md:795`).
   - Fit: both need build's per-group artefacts and status rows.
   - Recommendation: `USE-AS-IS` only behind `convert` and build's group scaffolding. `verify` only makes sense inside a group loop, which the light run says it does not have (line 355).
4. **`review` / `review-security` blocks.**
   - Exists: `@bkit-build-challenge-1` / `-2`. Their Read line is `docs/plans/{YYYYMM}/{FID}-plan.md, tmp/bkit-diff-{FID}.md`, the diff comes from `context diff --reset-log --artifact=... --step=build-challenge`, the report is rendered by `bkit steps stub --agent=... --result-file=...`, and the findings are merged into the plan by `challenge merge`. The challenge-1 prompt also writes findings as task blocks and skips "a finding that an existing plan task or test already covers".
   - Fit: the design's floor item 2 says the reviewers receive "the issue and the diff" (line 355). The shipped reviewers receive the plan and the diff. Outside build, their findings have no plan to merge into.
   - Recommendation: `ADAPT`. Keep the prompts and pass the plan that `convert` wrote. `manage block` reads the result JSON the way `challenge merge` does.
5. **`tests` block (design line 352: "the changed and affected test files through the repository's `bkit:test:file` script").**
   - Exists: `bkit tests run --gate=... --changed-since={sha} --file --workflow` and `bkit tests changed --base --fallback`. Both drive `bkit:gate:changed`, which runs "the tests that import the files, the tests that name their paths, and static checks" (`.bkit/core/.bkit/workflows.md:1753-1760`), and `tests run --file` appends a test-run status row. `bkit:test:file` runs one named file and finds no affected tests.
   - Recommendation: `USE-AS-IS` `tests run --changed-since={child base}`, which covers more than 80%. The gap is that the row needs a `--workflow` value the child's log accepts (Integration Risk).
6. **Small-change limit at `land-check` (line 344).**
   - Exists: `challengeGate()` and `diffNumstat()` (`.bkit/core/engine/commands/workflow/challenge.ts`, `CHALLENGE_SMALL = { lines: 300, files: 10 }`).
   - Fit: the `challenge gate` verb needs `--file` and appends a `challenge-gate` row with `workflow: "build"`, which would plant a build row in a light child's log.
   - Recommendation: `USE-AS-IS`, but call the two pure functions, not the verb.
7. **`bkit.manage.protectedPaths` (line 350).**
   - Exists: `BkitConfig` / `readBkitConfig` (`.bkit/core/engine/shared/settings.ts:112-140`, `:346`), with glob pathspec lists `minPushPaths` and `ciSkipPaths` as precedent. Also the land-check shared-inputs list (D25, line 893), whose default (package manifest and lockfile) overlaps this list's default.
   - Recommendation: `EXTEND-EXISTING`. Add one `manage` key in `BkitConfig`, and say how the protected and shared-inputs lists relate.
8. **Sleep hold for the watcher (D42).**
   - Exists: `scripts/ci/bkit-test-awake.mjs`. It is "Example. Copy into scripts/ci/ and own it. bkit install does not write this file." (line 2). It spawns the wrapped command as its child (`:282`), holds `/usr/bin/caffeinate -is -w <its own pid>` on darwin only (`:233-236`), and forwards SIGINT/SIGTERM/SIGHUP (`:276`).
   - Recommendation: `USE-AS-IS`, with the parent-check defect in CRITICAL C4.
9. **Watcher "exits when its parent process is gone" (D17, D36, WS-9 line 832).**
   - Exists: no parent-process check in `.bkit/core/engine` (text search for `ppid` found none outside tests). The awake wrapper's `processTable()` (`ps -A -o pid= -o ppid= -o stat= -o lstart=`) guards against pid reuse by start time. The engine cannot import that copy-and-own file.
   - Recommendation: `BUILD-CUSTOM` (small), following the wrapper's pid-plus-start-time pattern. The same pattern applies to the `watch.pid` liveness test.
10. **STALLED (D32, line 290).**
    - Exists: the v6.3 `watch-builds.sh` (`find -newer` over the worktree and the outbox, skipping `node_modules`/`.turbo`); the mtime rule in `workflowLockFresh` (`locks.ts:311-317`); and `bash scripts/ci/bkit-machine-lock.sh queue`, which prints "one `<who> — <checkout>` line per waiting run and held place, in queue order" (`scripts/ci/bkit-machine-lock.sh:40-41`). WS-6's planned `holders` subcommand lists holders only.
    - Recommendation: `EXTEND-EXISTING`. Read waiters from `queue` and holders from `holders`.
11. **Tool-name deny of the app's permission-mode tool (D12, D49, WS-7 line 792).**
    - Exists: the guard tiers (`.bkit/core/hooks/guardrails-shell.js`, `guardrails-tiers.js`) are argv parsers. The shipped `PreToolUse` matchers are `Edit|Write|MultiEdit|NotebookEdit` (gateguard), `Bash` (guardrails) and `Read|Bash` (readguard) (`.bkit/shared/.claude/settings.json:125-153`). Claude Code's hooks page says: "MCP tools follow the naming pattern `mcp__<server>__<tool>`" and that MCP tools "appear as regular tools in tool events (`PreToolUse`, ...)".
    - Recommendation: `EXTEND-EXISTING`. Add a new matcher entry that reaches the guardrails hook, plus a `tool_name` branch in that hook (CRITICAL C5).
12. **Denied commands word for word in the brief (D51).**
    - Exists: the deny lists in `guardrails-tiers.js` / `guardrails-deny.js`.
    - Recommendation: `EXTEND-EXISTING`. Render from that one source, never a copy.
13. **Task blocks posted as an issue comment (D45).**
    - Exists: build Step 4 sends issue comments newer than the plan to `@bkit-build-plan-convert` (via `NEWER_COMMENTS`), and `bkit tests plan-check` gates the result.
    - Recommendation: `USE-AS-IS`. The claim holds against source.
14. **Worker model from the registry (D48).**
    - Exists: `.bkit/core/.bkit/prompts.md` § Orchestrators, with rows for `/design`, `/plan` and `/debug` (Opus) and `/build` and `/ship` (Sonnet). There is no row for `composed` or `free-form`, both of which `manage-worker.command` allows (line 190).
    - Recommendation: `EXTEND-EXISTING`. Add the two rows or a rule.
15. **Landing a `direct` / `light` child (D46).**
    - Exists: `/bkit-ship`. Step 1 `worktrees setup` refuses a ship of `dev` or `main` (exit 7). Step 2 opens a PR when none exists. Step 5 warns "no plan ... sweeping best-effort" and carries on. Nothing requires a build summary.
    - Recommendation: `USE-AS-IS` in PR mode. Local mode is #938, which is open. The child must run on a `feat/{FID}` worktree, not commit on `dev` as the v6.3 light lane did.
16. **Hold proof (D50, line 401; WS-12 line 896).**
    - Exists: `bkit tests run --file=<status> --workflow`, which writes a test-run row the engine can read.
    - Recommendation: `EXTEND-EXISTING`. The `proved` event should point at a test-run row with a PASS verdict for the held build's failing check, not at a bare path (`manage-held.proof?`, line 206).

## Stack Feasibility

The changed parts can be built with the approved stack: the TypeScript engine on Node, the shipped Claude Code hooks, and the copy-and-own bash and Node templates. They need no new runtime and no new dependency. Five constraints apply:

- **The composed run needs build's scaffolding.** No menu agent except `tests` receives its inputs outside its own workflow (Prior Art 2-4). Someone must create the `feat/{FID}` worktree (`worktrees setup` accepts only `design|plan|build|debug|ship`, `worktrees.ts:68`), take the FID lock, write the input file and status rows, run `convert` and `plan-check`, and supply `{OUTBOX}` plus the `steps stub` render. So `convert` is the baseline first block, not the fallback the design makes it at line 633. And the Trade-off line 539 ("skips Plan Convert's full plan") does not hold.
- **The guardrails hook never sees an MCP tool.** It is wired only for `Bash`, so the D49 deny needs a new matcher entry and a non-shell branch in the hook. Per the Claude Code hooks page, a `PreToolUse` matcher on an MCP tool name fires. What is not established is whether the desktop app's own session tools go through that path, and whether the name `mcp__ccd_session_mgmt__set_session_permission_mode` is exact. The name appears in no repo source outside this design and its diff.
- **Parent-process detection works on macOS and Linux**, through `ps -o ppid=` and `process.kill(pid, 0)`, the same way the awake wrapper already does it. But "parent" must mean the agent host process, not the direct parent (CRITICAL C4).
- **The heartbeat gets a second writer.** The watcher updating `active.heartbeatAt` beside the `manage` verbs makes two processes write one file. That needs a temp-file-and-rename write plus a run-token check before each write.
- **The watcher cannot compute every due item.** Items that need the app's session tools (`WORKER-GONE`, `WORKER-UNBOUND`, `ARCHIVE-REFUSED`) or a tracker read cannot be computed by a background shell command every 60 s. "Exits only when the due list would gain an item" therefore covers a subset, which the design must name.

## Library / API Evaluation

- **New third-party libraries: none.** Everything reuses in-repo code under the package's `MIT` licence (`package.json:55`), so footprint and types stay as they are: the engine is TypeScript, and the hooks and templates are plain JS and bash.
- **Claude Code hooks API.**
  - Mature and documented. The hooks page says: "MCP tools follow the naming pattern `mcp__<server>__<tool>`". It also says a server-prefix matcher needs `.*`, because "a matcher like `mcp__memory` ... is compared as an exact string and matches no tool".
  - Plugin-bundled servers use `mcp__plugin_<plugin-name>_<server-name>__<tool>`. So the exact server segment of the app's tool matters. A wrong segment fails silently and the deny never fires.
- **Desktop-app session tools (`mcp__ccd_session_mgmt__*`, `mcp__ccd_session__start_session`).**
  - Not documented in the repo or on the hooks page, and their names are taken from session observation.
  - How mature they are is unknown: whether the app routes them through `PreToolUse`, and whether their names are stable across app releases. Treat them as an unverified API, with a live check in WS-1.
- **`/usr/bin/caffeinate -is -w <pid>`.**
  - macOS only. The wrapper holds it only `if (platform === "darwin")` (`bkit-test-awake.mjs:233`).
  - On other hosts D42's hold does nothing. That is acceptable, because the design targets the desktop app on a Mac and the preflight warns.
- **`bkit-machine-lock.sh` (`queue`, the planned `holders`).** A copy-and-own template. A repository that has not adopted it has no data source for the STALLED exemption or for slots, and falls back to `BKIT_TEST_SLOTS`. The design already handles that for slots but says nothing about STALLED.

## Integration Risk

Systems touched by the changed parts, with blast radius:

- **Shared guard hooks and shipped `settings.json`. Blast radius: every agent session in every consumer clone.**
  - The new `PreToolUse` matcher is a drift-gated, host-rendered file.
  - The Provider parity and Claude-additions rules need the nearest OpenCode/Codex/Cursor/Antigravity equivalent, or a sourced "no equivalent". The design names neither.
  - A wrong matcher fails open with no signal.
- **`locks.ts` `liveReason` (`:252-267`, `WORKFLOW_LOCK_IDLE_S = 1800`). Blast radius: takeover for `manage`.**
  - With the watcher refreshing the heartbeat, "live" now means "the manager's process tree and its watcher are alive", not "the manager acted".
  - A manager that is wedged but still running keeps the lock live until the watcher's 7200 s timeout, and stays live for another 1800 s after that. During that time `kickoff --resume` from another session is refused.
  - If the parent check misfires (C4), an orphaned watcher holds the lock for up to 7200 + 1800 s after the manager died.
  - The "alive" time in the `Run:` line inherits the same meaning.
- **Two watchers after a `/clear` and re-register (line 410, 416).**
  - `kickoff --resume` rewrites the run token. The old watcher, still in the same process tree, carries the old token. The refusal rule ("while `watch.pid` names a live process with this run's token") then lets a second watcher start.
  - Both write heartbeats and both wake the manager. The old watcher needs to exit when `active.runToken` stops matching its own.
- **Children's `status.jsonl` (resume, completeness, takeover). Blast radius: every `light` child and every REROUTE.**
  - Run with build's engine calls (`--workflow=build`), a composed child's log looks like an open `/bkit-build` run with no close. A REROUTE to `/bkit-build #N` (line 294, 358) then meets an open run on the same FID: a resume at the wrong step, or a fresh run number beside it.
  - Run under a new workflow name, every call the blocks need (`steps finish`, `steps stub`, `tests red --workflow=build`, `worktrees setup`, `WORKFLOW_FLAG` "design, plan, build, debug, ship", `status.ts:58-63`) must accept that name.
  - Either way, `manage-block` rows sit in that log keyed `fid` + `block` (line 208). The "fixed and reviewed again once" route (line 358) writes a second `review` row under the same key, with no `sha` to show which code it saw.
- **The `manage land-check` floor. Blast radius: every non-build lane.**
  - The scope "any child with no closed `/bkit-build` run" (lines 353, 1009; D44) also catches `direct` children, which cannot produce a failing-first test for a docs-only change, and `debug`-lane children, which close through `/bkit-debug`. It also contradicts the lane table, which gives `direct` its own check (line 343).
  - As written, every `direct` and `debug` child gets `REROUTE` to `build` (line 294).
- **`/bkit-ship` (D46). Blast radius: every light landing.** PR mode works without a build run: the PR is opened when missing, and a missing plan only draws a warning. Local mode depends on #938, which is open.
- **Build order (D56). Blast radius: the whole product.**
  - P-5 now waits on five issues, all `OPEN` on 2026-11-19 (`gh issue view`): #849, #936, #937, #938, #924.
  - That gate lives only in P-5's Deliverable prose. P-5's `Requires` lists P-1 to P-4 only (lines 1092-1094), so plan tooling cannot see it.
  - P-5 is titled and scoped "with PR landing" yet waits on the local-landing chain, which only P-6 uses.
- **Monorepo fit.** bkit is one package with host-render mirrors. Each new matcher, hook branch and template subcommand needs its mirror and template copy refreshed in the same change. WS-6/WS-7 name the template, but not the settings render.

## PoC Approach

On a scratch clone, with a scratch FID and an XS issue that has one known fix:

1. Open a `feat/{FID}` worktree with `worktrees setup --workflow=build`, take the FID lock, and run `workflows start` and `workflows input`.
2. Dispatch `@bkit-build-plan-convert`, then run `tests plan-check`.
3. Run `context brief --tests-only`, dispatch `@bkit-build-plan-tests`, then run `tests red`.
4. Run `context brief --next`, then dispatch `@bkit-build-plan-tasks`.
5. Run `context diff`, dispatch both challenge reviewers with result files, then run `steps stub`.
6. Run `tests run --changed-since={base} --file`.

Record which calls refuse, which rows reach the child's log, and whether a later `/bkit-build #N` resumes or starts fresh. Then run `/bkit-ship` in PR mode on that branch.

Separately, in the desktop app:

- Launch a background watcher stub through `bkit-test-awake.mjs` that logs its parent-process chain every 60 s. End the session, then quit the app, and note which ancestor disappears and whether the stub is signalled.
- Register a logging `PreToolUse` hook on `mcp__ccd_.*`. Call one harmless session tool, and note whether the hook fires and the exact tool name it receives.

## Unknowns & Blockers

1. **Whether build's engine calls work for a composed child outside `bkit-build.md`.** This covers the status workflow name, the `steps finish`/`steps stub` step names, and what a later REROUTE or `/bkit-ship` reads from that log. Settled only by running the PoC chain.
2. **Which process tree the desktop app gives a background Bash task.** Which ancestor ends when the manager's session ends or the app quits, and whether the task is signalled. This decides what "parent process gone" can test (C4). Settled only by running code.
3. **Whether `PreToolUse` hooks fire for the app's own `mcp__ccd_*` session tools, and the exact name of the permission-mode tool.** The name appears in no source outside this design. Settled only by running code (C5).
4. **Carried over and still open (WS-1):** a bkit `Stop` hook's block in the Code tab (C5 of the spike), the `SessionStart` `resume` source with its session-id match (C7), and owner notification.
5. **Settled here by reading source, so no spike needed:**
   - `/bkit-ship` on a branch with no build run works in PR mode: it opens the PR and warns on a missing plan.
   - D45 holds: newer comments reach Plan Convert.
   - The `tests` and `test-first` done-checks can reuse `tests run --changed-since` and `tests red`/`green`.

## Verdict Reasoning

`CONCERNS`. Nothing in the changed parts is unbuildable with the approved stack, and no `FAIL` condition holds. But five addressable caveats must be settled in the design before planning:

- **C1, the reuse caveat** the protocol requires. D44 turns down a light route inside `/bkit-build` for messy-candidate and close-but-different reasons, while the composed run re-runs build's own steps.
- **C2: the menu claims fail against source.** The menu agents need build's plan, status and input scaffolding.
- **C3: the floor's scope** also refuses `direct` and `debug` children.
- **C4: the watcher's parent check** is defeated by its own launch line.
- **C5: the D49 deny never reaches the hook** that would enforce it.

The PoC fits in 200 words, so there is no size caveat. `Spike` is `true` because unknowns 1-3 can be settled only by running code.

## CRITICAL

- **C1 — Reuse caveat: the composed run versus a light route inside `/bkit-build`** (HIGH, fixable; `docs/plans/202611/260-milestone-orchestrator-autonomous-design.md:501`, D44; Reuse row `:98`).
  - The candidate is `.bkit/core/workflows/bkit-build.md`. It already skips steps from a session-prompt token (Step 6 `[skills=false]`, `:646`) and has a small-change reviewer route (Step 11, `:1089-1121`).
  - D44 turns down a lite mode for two reasons: `bkit-build.md` "which open issues are already rewriting" (messy existing candidate), and "one pared-down shape fits neither a doc fix nor a small bug" (close-but-different).
  - Yet from source, a composed run must call build's own Steps 1-4, 7 and 11 to feed its agents (C2). It becomes a second orchestration of the same agents, held in brief fact blocks, and it must track every change to build's dispatch lines.
  - DONE WHEN the design either (a) puts the light lane inside `/bkit-build` as a token-driven route: Steps 5 and 8-10 skipped, the full Step 12 gate replaced by `tests run --changed-since`, both challenge reviewers kept. It must then also say how that sits with the owner's "step for step" input against decision `1012-v63-run-light-lane-for-small-one-fix-issues`. Or (b) it keeps composed runs and records why build's own route cannot carry them, given that the menu agents need build's inputs anyway.
- **C2 — The menu agents' inputs exist only inside their own workflows** (HIGH, fixable; `:352`, `:355`, `:539`, `:633`; WS-18 `:1005-1006`).
  - plan-tests and plan-tasks need `context brief --plan ... --file={STATUS}` (`bkit-build.md:693`, `:707`).
  - plan-verify needs per-group brief and diff artefacts (`:795`).
  - Both challenge reviewers read the plan file and the diff artefact, and render through `steps stub`. The floor's claim that they receive "the issue and the diff" is false.
  - `@bkit-debug-failure-reproduce` needs `debug-input-*.md`, `{CI_SELECTION_FILE}` and a debug status (`bkit-debug.md:556-569`).
  - Plan Convert needs `build-input-{RUN}.md`.
  - The Trade-off "skips Plan Convert's full plan" (`:539`) therefore does not hold, and `convert` is the baseline, not a fallback (`:633`).
  - DONE WHEN the design:
    - names who creates the worktree, lock, `workflows start`/`input` rows, `{OUTBOX}` and the `steps stub` render for a light child, and which workflow name its rows carry;
    - makes `convert` plus `plan-check` the mandatory first block;
    - takes `@bkit-debug-failure-reproduce` and `verify` off the menu, or states how their inputs are met;
    - corrects floor item 2 and the Trade-off line.
- **C3 — The floor's scope catches `direct` and `debug` children** (HIGH, fixable; `:353`, `:1009`, `:294`, D44 `:501`).
  - "Refuses any child with no closed `/bkit-build` run" applies to a docs-only `direct` child, which has no failing-first test to give, and to a `debug`-lane child, which closes through `/bkit-debug`. Both then show `REROUTE` to `build`.
  - It also contradicts the lane table's own `direct` check (`:343`).
  - DONE WHEN the floor is scoped to `light` children and code-changing free-form work, `direct` keeps only its `*.md` and protected-path check, and a closed `/bkit-debug` run counts like a closed `/bkit-build` run.
- **C4 — The watcher's parent-process exit cannot fire under its own launch line** (HIGH, fixable; D17 `:474`, D42 `:499`, Run lifecycle `:414`, WS-9 `:832-833`).
  - Launched through `scripts/ci/bkit-test-awake.mjs`, the watcher's direct parent is the wrapper. The wrapper spawns it as a child (`:282`) and lives exactly as long as the watcher.
  - Without the wrapper, the direct parent is the Bash tool's shell, which also waits on it.
  - A manager killed without a signal therefore leaves the watcher refreshing the heartbeat until its 7200 s timeout, so the lock reads live for up to 7200 + 1800 s. That is the case D17's rationale says the check prevents.
  - After `/clear` and `kickoff --resume` (`:410`, `:416`), the old watcher carries a stale token, and a second watcher may start beside it.
  - DONE WHEN:
    - "parent" is defined as the agent host process, recorded at kickoff by pid plus start time (the wrapper's `ps ... lstart` pattern), or as an ancestor-chain rule;
    - the watcher also exits when `active.runToken` differs from its own;
    - each heartbeat write is a token-checked temp-file-and-rename;
    - WS-9's orphan test launches through the wrapper.
- **C5 — The D49 permission-mode-tool deny never reaches the guard** (HIGH, fixable; D12 `:469`, D49 `:506`, WS-7 `:792`).
  - The guardrails hook is wired for `Bash` only (`.bkit/shared/.claude/settings.json:125-153`), and its tiers parse argv, so an MCP tool call is never seen.
  - The tool name `mcp__ccd_session_mgmt__set_session_permission_mode` appears in no source outside this design and its diff.
  - The hooks page says an exact-string matcher must name the tool exactly, or it "matches no tool".
  - DONE WHEN:
    - WS-7 names the new `PreToolUse` matcher entry (an exact string or a `mcp__ccd_session_mgmt__.*` prefix) routed to the guardrails hook, with a `tool_name` branch and its fixture;
    - the host-parity line for OpenCode/Codex/Cursor/Antigravity is stated, as an equivalent or a sourced "no equivalent";
    - WS-1 adds a live check that the hook fires for the app's tool and that the name is exact.

## OPTIONAL

- **`tests` block** (MEDIUM; `:352`). Use `bkit tests run --changed-since={child base} --file` (`bkit:gate:changed`: importing tests, path-naming tests and static checks) instead of per-file `bkit:test:file`, which finds no affected tests. The run writes the test-run row the done-check reads.
- **`test-first` done-check** (MEDIUM; `:354`). Reuse `tests red` / `tests green` rather than a new check. They already prove "red at the tests step, green now" per named TEST FIRST test, which is one more reason `convert` comes first.
- **`manage-block` row** (MEDIUM; `:208`). Add `sha` (HEAD at the check) and an `attempt`. The key `fid` + `block` folds the second review into the first, and "newer than the last code change" (`:353`) can then be compared by commit, not by timestamp.
- **Small-change limit** (LOW; `:344`). Call `challengeGate()` / `diffNumstat()` directly. The `challenge gate` verb needs `--file` and writes a `workflow: "build"` row into the child's log.
- **`bkit.manage.protectedPaths`** (LOW; `:350`). Put it in `BkitConfig` beside `minPushPaths` / `ciSkipPaths`, and say how it relates to the land-check shared-inputs list (`:893`), whose default overlaps it (manifest and lockfile).
- **STALLED waiter exemption** (MEDIUM; D32 `:489`, `:290`). Read waiters from the existing `bkit-machine-lock.sh queue` (`:40-41`). WS-6's `holders` lists holders only. Also say what applies in a repository that has not adopted the lock.
- **The watcher's due-list subset** (MEDIUM; `:244`, WS-9 `:832`). Name which items the background watcher computes. Items that need the app's session tools or a tracker read (`WORKER-GONE`, `WORKER-UNBOUND`, `ARCHIVE-REFUSED`) cannot be computed by a shell process every 60 s. Guard `watch.pid` against pid reuse by start time.
- **D48 registry rows** (LOW; `:505`). `.bkit/core/.bkit/prompts.md` § Orchestrators has no row for the `composed` or `free-form` commands that `manage-worker.command` allows (`:190`). Add the rows, or a rule such as "composed takes the `/build` row".
- **D43 `direct` lane** (LOW; `:343`). "Wording or documentation only" can be checked only once the diff exists, so `manage next` cannot print `direct` from facts. "A leftover the owner has already decided" may be code, which the `*.md`-only check refuses. Say that `direct` is checked at the landing only.
- **D50 proof** (MEDIUM; `:206`, `:401`, `:896`). `proof?` is a path, so it is the manager's word. Unlike `manage block`, the engine never sees the held build's failing check pass. Point `proved` at a test-run row written by `bkit tests run --file=<copy status>` that has a PASS verdict.
- **D56 / P-5 dependency record** (MEDIUM; `:513`, `:1082-1094`). Put #849, #936, #937, #938 and #924 P4 into a form the plan tooling reads, not only the Deliverable prose. All five were `OPEN` on 2026-11-19. Also reconcile P-5's "with PR landing" title and scope with a gate that only local landing (P-6) needs.
- **D46 landing branch** (LOW; `:360`, `:503`). Say that a `direct` or `light` child runs on a `feat/{FID}` worktree: `/bkit-ship` refuses `dev` and `main` (exit 7). The v6.3 light lane committed on `dev` directly.

## OUT OF SCOPE

- **The owner's "step for step" answer** in `design-input-1.md` and the five-workflow lane list set against the composed light lane and decision `1012-v63-run-light-lane-for-small-one-fix-issues`. That is a scope and consistency question for the owner, not a buildability one. C1 names it only where it bears on which reuse route is allowed.
- **Where the v6.3 session figures come from.** The design cites 52.5 h, 441 turns, 211 app-note turns, 39 summaries, and 28/115 wake-ups (D17, D36, D53, D54). They appear in no supplied input and have no recorded artefact path. That is an evidence question for the other lens.
- **The light lane's 45-minute saving.** It is an estimate, and the design already labels it as one (`:635`).
- **The shipped hook wrappers' `test -f ... || true` form**, which passes a tool call when the hook file is missing. That is shipped behaviour this revision does not change, but it bears on D12's "an unreadable `active` keeps the tier on".
