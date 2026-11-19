Verdict: FAIL
Fingerprint: b0dfafbf4650b359efbecdd0695b57b2ae980c6b9c0f6d583034cf4b21a8a81e
<!-- verdict:end -->

# Design Spike

Scope: the PoC Approach (items 1-8) and Unknowns & Blockers (items 1-6) of `design-review-1.md`, against `design-v1-draft.md`. Probes live in `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/spike/`. Docs loaded: `.agents/docs.md`, `.bkit/workflows.md` § Concurrency lock, `docs/technology.md` § Stack; every Design-phase doc the index lists is present (`wc -l`: `.bkit/workflows.md` 1937, `.bkit/prompts.md` 664, `docs/decisions.jsonl` 967, `docs/capabilities.md` 968, `docs/architecture.md` 152, `docs/technology.md` 81, `docs/security.md` 309). Index warnings: none.

## Claims

Ordered by blast radius.

<!-- prettier-ignore -->
| # | Claim a probe could disprove | Design elements resting on it | Result |
| --- | --- | --- | --- |
| C1 | A decision line written as `Accept (assumed, by the manager)` is listed by `bkit decisions pending` with no reader change. | D5 ("no new reader"), Data Model `manage-assumption`, Key Edge Case "recorded in the decision file as `assumed, by the manager`", Flow "a worker asks" step 4, ship's Confirm Assumed Items list. | `DISPROVEN` |
| C2 | Local landing becomes available once #938 lands; #938 is the only open dependency of the local-landing contract. | Architecture § "The `/bkit-ship` local-mode contract … stated so #938 can meet it", D9, D10, D11, Related Issues, Trade-offs "until #938 lands". | `DISPROVEN` |
| C3 | A worker's message starts a turn on a manager session that is idle except for a background `manage watch`, through a channel the worker can use. | Step 6 "Never go idle", `manage say` / `manage hear` (D7), the watcher's `worker-line` exit, Flow "a worker asks" steps 2-3. | `BLOCKED` |
| C4 | A `Stop` hook wrapped the bkit way (`test -f … && node … \|\| true`) refuses the end of a turn through `{"decision":"block","reason":…}` on stdout, once per turn (`stop_hook_active` guards the second stop), on the Claude Code build the desktop app bundles. | D13 Stop half, Key Edge Case "the turn is refused until a watcher runs". | `SETTLED` |
| C5 | That `Stop` hook fires for a session in the desktop app's Code tab. | D13 Stop half (the draft's fallbacks do not cover a missed Stop). | `BLOCKED` |
| C6 | A `SessionStart` hook with matcher on `compact` and `resume` fires on both sources, its `additionalContext` reaches the model, and `CLAUDE_CODE_SESSION_ID` in the hook's environment equals the hook's stdin `session_id` on every source. | D13 SessionStart half, Flow "context reset" step 1, the `active` file's session gate (Architecture § Hooks). | `SETTLED` |
| C7 | That `SessionStart` hook fires on `compact` and `resume` for a session in the desktop app's Code tab, with the same session-id match. | Same as C6, in the only surface the design supports (D15, D16). | `BLOCKED` |
| C8 | A background task's completion wakes the manager while a worker still counts as working. | `manage watch` as the only wake-up (Risks "Workers waiting on a question count as working for ever"), D13. | `BLOCKED` |
| C9 | A day of unattended manager-worker exchanges (about 60) never hits `Not delivered: this session keeps answering other sessions`. | The unattended loop as a whole (Narrative "while the owner is away"). | `BLOCKED` |
| C10 | `bkit locks acquire --kind=workflow --workflow=manage` refuses a second manager (exit 8) while the first one's log holds only fresh `manage-*` rows. | Reuse row "One manager per parent" (`EXTEND`, "refused with exit 8 while the first is live"), D17, preflight "with the parent lock held". | `DISPROVEN` |
| C11 | Linear exposes `Issue.children` as a paginated connection the adapter can query. | Reuse row "Sub-issue list", D24. | `SETTLED` |
| C12 | The Jira adapter's transport (Atlassian MCP at `https://mcp.atlassian.com/v2/mcp`, Bearer `BKIT_JIRA_API_KEY`) can list a parent's children with JQL `parent = KEY`. | Reuse row "Sub-issue list", D24. | `BLOCKED` |

## Method

All commands ran on the owner's laptop from a Bash tool inside a Claude desktop Code-tab session (`CLAUDE_CODE_ENTRYPOINT=claude-desktop`, `CLAUDE_CODE_DESKTOP_APP_VERSION=5.11492.5`, `CLAUDE_EFFORT=high`), against this worktree's built `dist/cli.js` (last `dist/` commit `4f6788739`). `SPIKE` = `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/spike`. `setup-consumer.sh` recreates the throwaway scratch consumer (a fresh `git init -b dev` repo at `SPIKE/consumer`) that C1 and C10 run against.

- **C1.** `SPIKE/setup-consumer.sh` copies a real assumed-accept decision file (`docs/plans/202611/logs/1008-plan-design-owner/build-decision-1-2.md`) into three fixture FIDs. `SPIKE/c6-variants.sh` rewrites only the `Decision:` line per FID (control: today's `Accept (assumed) — …`; draft: `Accept (assumed, by the manager) — …`; review proposal: `Accept (assumed) — by the manager: …`) and runs `node dist/cli.js decisions pending --fid=999-c6-{variant} --month=202611 --root={consumer} --json` for each. Command: `SPIKE/setup-consumer.sh && SPIKE/c6-variants.sh`.
- **C2.** Read the issue chain through the tracker with the owner's keyring login (`BKIT_GH_TOKEN` returned `Bad credentials`): `env -u GH_TOKEN gh issue view {924,936,937,938,849} -R cbartens/bkit --json number,title,state,closedAt,milestone`, each body's `bkit:blocked-by` block, and `env -u GH_TOKEN gh api repos/cbartens/bkit/issues/938/dependencies/blocked_by`. The engine's own reader was tried first: `env -u GH_TOKEN node dist/cli.js issues blocked-by --issue={938,937,936} --json`. Whether #924 P4's range read exists today: `node dist/cli.js fids parse --range=HEAD~3..HEAD --json`. `node dist/cli.js branches land --help` was checked for a local target.
- **C3, C8, C9.** No probe could run: each needs at least two Code-tab sessions the owner starts (the review's PoC step 1). Only the presence of the desktop messaging socket was checked: `ls -l "$CLAUDE_CODE_MESSAGING_SOCKET"`.
- **C4, C6.** The process tree showed that the Code tab runs Claude Code from `CLAUDE_CODE_EXECPATH` (`…/Application Support/Claude/claude-code/2.1.325/…/claude`, `2.1.325 (Claude Code)`; `~/.local/bin/claude` is a different build, `2.1.317`). `SPIKE/c1c2-run.sh` drives that exact binary headless (`-p --model haiku --setting-sources project --settings SPIKE/c1c2-settings.json --output-format json`) from the scratch consumer, so that bkit's own project hooks do not load. It drops the inherited desktop-session variables, so the child reports its own identity. `SPIKE/c1c2-settings.json` wires `SPIKE/c1c2-hook.cjs` to `Stop` and `SessionStart` (matcher `startup|compact|resume`) with bkit's `test -f … && node … || true` wrapper. The hook logs every call and blocks `Stop` while `SPIKE/watch.pid` exists and `stop_hook_active` is false. On `compact` and `resume` it injects `PROBE-{SOURCE}-LINE 7741`. Runs: a Stop block run with `watch.pid` present, a control run without it, a startup run, `--resume {id} "/compact"`, and `--resume {id}` asking for the injected lines. Command: `SPIKE/setup-consumer.sh && SPIKE/c1c2-run.sh`.
- **C5, C7.** No probe could run: firing in the Code tab needs an owner-started session that loads the probe hooks and is then compacted, resumed and left to end a turn. A subagent cannot end or compact its parent's turn.
- **C10.** `SPIKE/c7-lock.sh`, in the scratch consumer. Control: a `design` log with fresh `workflow-started` and `step-done` rows, then two `node dist/cli.js locks acquire --kind=workflow --workflow=design --fid=999-c7-control --month=202611 --json`. Case: the first `acquire --workflow=manage`, then three `manage-*` rows (`manage-run`, `manage-child`, `manage-go`) dated now, then a second `acquire --workflow=manage`. Command: `SPIKE/setup-consumer.sh && SPIKE/c7-lock.sh`.
- **C11.** `SPIKE/c9-linear-children.mjs` runs live introspection of `Issue` (`children` args and type) and a real `issues(filter: {children: {some: …}}) { children(first: 50) { nodes pageInfo } }` query against `https://api.linear.app/graphql` with `BKIT_LINEAR_API_KEY` (presence checked first with `direnv exec . sh -c '[ -n "${BKIT_LINEAR_API_KEY}" ] && echo set || echo unset'` → `set`). Command: `direnv exec . node SPIKE/c9-linear-children.mjs`.
- **C12.** `SPIKE/c9-jira-children.mjs` uses the same transport as `JiraSession` in `.bkit/core/engine/commands/workflow/tracker.ts`: `initialize`, `tools/list`, then the JQL search tool with `parent is not EMPTY` and `parent = {KEY}`. Key presence was checked with direnv (`BKIT_JIRA_API_KEY: set`). Command: `direnv exec . node SPIKE/c9-jira-children.mjs {jira-test-site}` (the owner's Jira test site host).

No library was installed. The run outputs (`hook-log.jsonl`, `c1-out.json`, `c1-err.txt`, `watch.pid`) were deleted after capture.

## Evidence

Output is quoted as captured. The one edit: the absolute path prefix `/Users/…/.worktrees/260-milestone-orchestrator-autonomous/docs/plans/202611/logs/260-milestone-orchestrator-autonomous/spike` is written as `{SPIKE}`.

**C1** (`c6-variants.sh`; a rerun from a fresh consumer gave the same counts 1 / 0 / 1):

```text
=== variant=control
Decision: Accept (assumed) — The test still checks the behaviour the issue asks for. (ask:false, LOCAL, 2026-11-19)
{"items":[{"file":"docs/plans/202611/logs/999-c6-control/build-decision-1-1.md","q":1,"title":"Task 3: keeps one progress comment when the status file moves to the main checkout","reason":"The test still checks the behaviour the issue asks for and passes in the full gate; making it fail first would mean undoing working code.","state":"pending"}],"count":1,"deferred":[]}
exit=0
=== variant=draft
Decision: Accept (assumed, by the manager) — The test still checks the behaviour the issue asks for.
{"items":[],"count":0,"deferred":[]}
exit=0
=== variant=review
Decision: Accept (assumed) — by the manager: The test still checks the behaviour the issue asks for.
{"items":[{"file":"docs/plans/202611/logs/999-c6-review/build-decision-1-1.md","q":1,"title":"Task 3: keeps one progress comment when the status file moves to the main checkout","reason":"The test still checks the behaviour the issue asks for and passes in the full gate; making it fail first would mean undoing working code.","state":"pending"}],"count":1,"deferred":[]}
exit=0
```

**C2** (issue chain):

```text
#924 state=OPEN closedAt=null milestone=v6.4 title=Let every workflow land on local dev without pushing
#936 state=OPEN closedAt=null milestone=v6.4 title=Publish mode and local start base
#937 state=OPEN closedAt=null milestone=v6.4 title=Local landing target with design / plan local close
#938 state=OPEN closedAt=null milestone=v6.4 title=Ship and debug in local mode
#849 state=OPEN title=Keep local dev synchronized after workflow close
```

The `bkit:blocked-by` blocks in the bodies (`gh issue view N --json body`):

```text
#938 body:
26:- #936 — Publish mode and local start base — https://github.com/cbartens/bkit/issues/936. Required first.
27:- #937 — Local landing target with design / plan local close — https://github.com/cbartens/bkit/issues/937. Required first: the landing target ship uses.
32:###### bkit:blocked-by start
34:- #936
35:- #937
36:###### bkit:blocked-by end
=== #936
###### bkit:blocked-by start
- #849
###### bkit:blocked-by end
=== #937
###### bkit:blocked-by start
- #849
- #936
###### bkit:blocked-by end
```

`gh api repos/cbartens/bkit/issues/938/dependencies/blocked_by` printed nothing (exit 0): GitHub's native dependency links are empty, and the chain lives only in the body block that `bkit issues blocked-by` reads. The engine's own reader could not run in this session:

```text
[bkit-issues] tracker read failed (auth): gh api: gh: Bad credentials (HTTP 401)
{"reason":"auth"}
exit=80
```

#924 P4's range read does not exist today:

```text
[bkit-fids] unknown flag --range
exit=2
```

`branches land --help` today: `bkit branches land — Design / plan close: squash the branch onto origin/dev in a throwaway worktree and push it as dev (retrying with backoff when dev moved), else the PR squash-merge; …` and `localDev      fast-forwarded | current | skipped (local commits, or git refused) | none (no local dev) | null (runtime does not push dev)`.

**C3, C8, C9:** no probe output. The surface exists in this session:

```text
srw-------@ 1 christian  wheel  0 Nov 19 18:40 /tmp/cc-socks/23727.sock
exit=0
```

This subagent has no `SendMessage` or `ListAgents` tool, and no second session to message.

**C4 and C6** (`c1c2-run.sh` on `2.1.325 (Claude Code)`, the binary the Code tab runs; process tree `/Applications/Claude.app/Contents/MacOS/Claude` → `Contents/Helpers/disclaimer` → `…/claude-code/2.1.325/485fdac4332e/claude.app/Contents/MacOS/claude` → `/bin/zsh`):

```text
=== C1 block (watch.pid present)
{"result":"WATCHED","session_id":"c346fac5-74a1-40d2-a6af-6fcb56db1404","num_turns":2,"is_error":false}
exit=0
=== C1 control (no watch.pid)
{"result":"READY","session_id":"bd63c15e-230b-45b2-aade-2a3c079fce1a","num_turns":1,"is_error":false}
exit=0
=== C2 run1 startup
{"result":"OK","session_id":"b1e72c47-22ce-460c-817d-53e475d515e7","num_turns":1,"is_error":false}
=== C2 run2 resume + /compact
{"result":"","session_id":"b1e72c47-22ce-460c-817d-53e475d515e7","num_turns":0,"is_error":false}
exit=0
=== C2 run3 resume, ask for probe lines
{"result":"No line in my context starts with `PROBE-`. Two lines contain it after a `SessionStart hook additional context:` prefix. Quoted verbatim:\n\nSessionStart hook additional context: PROBE-COMPACT-LINE 7741\n\nSessionStart hook additional context: PROBE-RESUME-LINE 7741","session_id":"b1e72c47-22ce-460c-817d-53e475d515e7","num_turns":1,"is_error":false}
exit=0
--- hook log
{"at":"2026-11-19T09:51:36.906Z","event":"SessionStart","source":"startup","stdinSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","envSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:40.818Z","event":"Stop","stdinSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","envSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","stopHookActive":false,"entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:42.743Z","event":"Stop","stdinSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","envSession":"c346fac5-74a1-40d2-a6af-6fcb56db1404","stopHookActive":true,"entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:43.756Z","event":"SessionStart","source":"startup","stdinSession":"bd63c15e-230b-45b2-aade-2a3c079fce1a","envSession":"bd63c15e-230b-45b2-aade-2a3c079fce1a","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:47.589Z","event":"Stop","stdinSession":"bd63c15e-230b-45b2-aade-2a3c079fce1a","envSession":"bd63c15e-230b-45b2-aade-2a3c079fce1a","stopHookActive":false,"entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:48.896Z","event":"SessionStart","source":"startup","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:52.634Z","event":"Stop","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","stopHookActive":false,"entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:51:54.044Z","event":"SessionStart","source":"resume","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:52:03.214Z","event":"SessionStart","source":"compact","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:52:04.323Z","event":"SessionStart","source":"resume","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","entrypoint":"sdk-cli"}
{"at":"2026-11-19T09:52:09.885Z","event":"Stop","stdinSession":"b1e72c47-22ce-460c-817d-53e475d515e7","envSession":"b1e72c47-22ce-460c-817d-53e475d515e7","stopHookActive":false,"entrypoint":"sdk-cli"}
runner-exit=0
```

An earlier inline run of the same steps gave the same shape: Stop block `"result":"WATCHED"` with `num_turns":2`, two Stop rows (`stopHookActive` false, then true), and a run-3 answer naming `PROBE-COMPACT-LINE 7741` and `PROBE-RESUME-LINE 7741`.

**C5, C7:** no probe output (see Unsettled).

**C10** (`c7-lock.sh`, first run; a rerun from a fresh consumer gave the same exits 0 / 8 / 0 / 0 and `reclaiming orphaned lock`):

```text
=== control: design run with a fresh step row
first:
{"kind":"workflow","path":"{SPIKE}/consumer/docs/plans/202611/logs/999-c7-control/.lock","month":"202611","token":"fd8935b7","reclaimed":null,"heldBy":null,"route":"go","message":""}
exit=0
second:
{"kind":"workflow","path":"{SPIKE}/consumer/docs/plans/202611/logs/999-c7-control/.lock","month":"202611","heldBy":{"workflow":"design","since":"2026-11-19T09:47:24Z","lastStepAt":"2026-11-19T09:47:23Z","idleSeconds":1,"line":"2026-11-19T09:47:24Z design 999-c7-control fd8935b7"},"token":null,"reclaimed":null,"route":"stop","message":"design has held 999-c7-control since 2026-11-19T09:47:24Z and last stepped at 2026-11-19T09:47:23Z. Nothing changed; this run can start again once that run ends or has been idle 30 minutes."}
[bkit-locks] workflow already running for 999-c7-control (workflow=design, idle 1s)
exit=8
=== manage: log holds only manage-* rows, written seconds ago
first:
{"kind":"workflow","path":"{SPIKE}/consumer/docs/plans/202611/logs/999-c7-manage/.lock","month":"202611","token":"e0c67229","reclaimed":null,"heldBy":null,"route":"go","message":""}
exit=0
second:
[bkit-locks] reclaiming orphaned lock for 999-c7-manage: 2026-11-19T09:47:24Z manage 999-c7-manage e0c67229
{"kind":"workflow","path":"{SPIKE}/consumer/docs/plans/202611/logs/999-c7-manage/.lock","month":"202611","token":"54b20647","reclaimed":{"holder":"2026-11-19T09:47:24Z manage 999-c7-manage e0c67229","reason":"orphaned"},"heldBy":null,"route":"go","message":""}
exit=0
```

`--workflow=manage` was accepted, although `locks acquire --help` lists only `design, plan, build, debug, ship`.

**C11** (`c9-linear-children.mjs`):

```text
introspection http 200
Issue.children {"name":"children","args":[{"name":"filter"},{"name":"before"},{"name":"after"},{"name":"first"},{"name":"last"},{"name":"includeArchived"},{"name":"orderBy"}],"type":{"name":null,"kind":"NON_NULL","ofType":{"name":"IssueConnection","kind":"OBJECT"}}}
Issue.parent {"name":"parent","type":{"name":"Issue","kind":"OBJECT","ofType":null}}
live children query http 200
live {"issues":{"nodes":[]}}
exit=0
```

**C12** (`c9-jira-children.mjs`):

```text
initialize http 401 "invalid_token"
raw {"error":"invalid_token"}
exit=1
```

## Design Impact

- **C1 invalidates D5's literal and its "no new reader" claim** (`design-v1-draft.md:270`, also `:37`, `:67`, `:228`). `decisions pending` listed 0 items for `Accept (assumed, by the manager) — …` and 1 item for the control. The same holds for every reader that keys on that prefix, so ship's Confirm Assumed Items would silently miss the manager's assumptions. The evidence supports `Accept (assumed) — by the manager: {reason}`: it was listed with `count: 1` and `state: pending` by today's reader, with no code change. The provenance then lives in the text after the dash and in the `manage-assumption` row. The design must say which reader, if any, tells a manager assumption apart from a headless one, because the prefix alone no longer does.
- **C2 invalidates the dependency statement behind D9-D11** (`design-v1-draft.md:133-140`, Related Issues `:5`). #938 is blocked by #936 and #937, #937 is blocked by #936 and #849, and #936 is blocked by #849. All five issues (#924, #936, #937, #938, #849) are open in milestone v6.4. The local-landing contract therefore cannot be "stated so #938 can meet it": #937 owns the local landing target. The design needs to name the chain #849 → #936 → #937 → #938 and point to `docs/plans/202611/924-every-workflow-land-design.md` as the landing contract. Today `branches land` publishes design and plan closes to `origin/dev` (its help text), so a local-landing run before #937 would split local `dev` from `origin/dev`. The evidence supports D9's PR-landing period as the only landing model until the whole chain lands, not just #938. P4's range read is also absent (`fids parse --range` → `unknown flag --range`, exit 2), so a first local batch push today has no per-FID CI mapping. Whether the design waits for P4 is a judgement the evidence leaves to the design.
- **C10 invalidates the "One manager per parent" `EXTEND` row and D17's use of the existing lock** (`design-v1-draft.md:63`, `:282`). A second `acquire --workflow=manage` seconds after the first, against a log holding fresh `manage-*` rows, exited 0 with `reclaimed.reason: "orphaned"` and took the lock. The control `design` run exited 8. So two managers can run the same parent today. The evidence supports a manage-specific liveness signal in `liveReason` (for example the newest `manage-*` row's `at`, or the `active` heartbeat) as a required engine change, plus an idle limit that fits a manager's quiet stretches. A side fact: `--workflow=manage` is accepted although the help text lists five names, so nothing refuses the new name.

## Unsettled

- **C3 (worker message wakes an idle manager).** Needs the review's PoC steps 1 and 5: the owner starts one manager and two workers in the Code tab (`use_worktree: false`), the manager runs a background watcher, and a worker sends a one-line report while the manager is idle and again while it is busy. Risk: if a message waits or is held instead of starting a turn, the watcher's `worker-line` exit is the only way a question reaches the manager, and `manage say` must also write to the outbox (review CRITICAL 6). Otherwise every worker question stalls until the next timeout.
- **C5 (Stop fires in the Code tab).** Needs an owner-started Code-tab session that loads `SPIKE/c1c2-settings.json`'s Stop entry and ends a turn with `watch.pid` present. C4 shows that the binary the Code tab runs honours the block, but in this run the hook saw `entrypoint: sdk-cli`, not `claude-desktop`, so the desktop host's turn driver is untested. Risk: D13's idle-turn refusal has no fallback. A missed Stop lets the manager go idle with work in flight, which is the most common v6.3 failure.
- **C7 (SessionStart compact / resume in the Code tab).** Needs the same owner-started session, then a forced `/compact` and a resume. The check is whether `PROBE-COMPACT-LINE` / `PROBE-RESUME-LINE` arrive and whether the hook's stdin `session_id` equals `CLAUDE_CODE_SESSION_ID`. Risk: lower than C5, because the draft's fallback (every turn starts with `manage state`; the watcher's exit prints the briefing) covers a miss.
- **C8 (background completion wakes the manager while a worker is working).** Needs a manager session with one worker mid-turn and a background `sleep`-style task that completes, to see whether a turn starts. Risk: if it does not wake, the watcher cannot wake the manager either. The only wake-up left is a worker message (C3) or the owner, and the design has no wake-up at all while every worker is busy.
- **C9 (`keeps answering other sessions` threshold).** Needs about 60 scripted manager-worker exchanges with no typed prompt (the review's PoC step 6). Risk: if the pause appears within a day, the run stops until the owner types, which breaks the "away all day" narrative. The design then needs a documented fallback (a report comment asking the owner to type one line) and a budget of exchanges per typed prompt.
- **C12 (Jira children).** Needs a valid `BKIT_JIRA_API_KEY` for the Atlassian MCP endpoint. The variable is set, but the endpoint answered `401 "invalid_token"`, so it is expired, revoked or for a different endpoint. A Jira test site with at least one parent-child pair is also needed. Risk: low; it is confined to the Jira arm of the children read, and the review already marks Jira as unverified.
- **C11 caveat (not unsettled).** The Linear workspace holds no issue with children, so the live query returned `nodes: []` without errors. The schema shape is settled, but a non-empty children listing was not exercised. Creating a test parent would be a tracker write, which needs the owner.

## Verdict Reasoning

`FAIL`, because three claims are `DISPROVEN` by captured output:

- **C1:** the draft's marker literal is invisible to `decisions pending` (`count: 0`).
- **C2:** #938 cannot land local mode alone; it is blocked by #936 and #937, which depend on #849, and all of them are open.
- **C10:** the existing lock reclaims a fresh manage-only run as `orphaned`, so a second manager is not refused.

Each failure has a fix the evidence already points to. The review's marker form passes today's reader. The #924 chain is the landing dependency. A manage liveness rule is needed in `liveReason`. Four claims held under an honest attempt: the Stop JSON block (C4) and the SessionStart compact / resume injection with session-id match (C6), both on the Code tab's own `2.1.325` binary, and the Linear `children` connection (C11). Six claims stay `BLOCKED`. Five of them (C3, C5, C7, C8, C9) need owner-started Code-tab sessions, so they are still the plan's first live task. C12 needs a valid Jira key.

## Notes

- Spike files kept for rerunning: `setup-consumer.sh`, `c6-variants.sh`, `c7-lock.sh`, `c1c2-run.sh`, `c1c2-hook.cjs`, `c1c2-settings.json`, `c9-linear-children.mjs`, `c9-jira-children.mjs`.
- `SPIKE/consumer/` (a nested `git init` repo holding the C1 / C10 fixtures and `.lock` files) is still on disk: the permission system denied the `rm -rf` cleanup command. It holds no dependency tree and no build output. Delete it before staging the spike folder, or `git add` will record it as an embedded repository.
- No secret value was printed. Key presence was checked by name only.
- The headless probe runs report `entrypoint: sdk-cli`, so D16's preflight (`CLAUDE_CODE_ENTRYPOINT` must be `claude-desktop`) would refuse a headless child, as intended. The Code-tab session itself reads `claude-desktop`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Local landing depends on the #849 -> #936 -> #937 -> #938 chain, not on #938 alone (C2 DISPROVEN)
  **Severity:** HIGH · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:133` · **Round:** 1
  - **DONE WHEN:** The design names #849, #936, #937 and #938 as the local-landing dependency chain, points to docs/plans/202611/924-every-workflow-land-design.md as the landing contract instead of restating a ship contract for #938, keeps PR landing as the only model until the whole chain lands, and states whether the first local batch push waits for #924 P4 (bkit fids parse --range, absent today: exit 2 unknown flag).
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Marker literal Accept (assumed, by the manager) is not listed by bkit decisions pending (C1 DISPROVEN)
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:270` · **Round:** 1
  - **DONE WHEN:** D5, the Key Edge Case, the Reuse row and Flow step 4 use a marker that keeps the parsed Accept (assumed) prefix (for example Accept (assumed) — by the manager: {reason}, which decisions pending listed with count 1), or the design lists the reader changes and their tests; the design says which reader distinguishes a manager assumption from a headless one.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** bkit locks acquire reclaims a fresh manage-only run as orphaned, so a second manager is not refused (C10 DISPROVEN)
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md:63` · **Round:** 1
  - **DONE WHEN:** The design changes the One manager per parent row from reuse to a named engine change: liveReason in locks.ts reads a manage liveness signal (newest manage-* row at, or the active heartbeat) with an idle limit that fits a manager, so a second acquire --workflow=manage on a live run exits 8 with route stop.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
