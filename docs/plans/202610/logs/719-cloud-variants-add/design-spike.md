Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

Ordered by blast radius. IDs match probe file names (`spike/c{N}-*.sh`); C5, C10, C11, C12 have no probe file.

<!-- prettier-ignore -->
| # | Unknown | Falsifiable claim | Design element resting on it | Status |
| --- | --- | --- | --- | --- |
| C1 | PoC 1 | `bkit fids parse --marker "<PR body>" --branch feat/<FID> --json` returns `fid` + `issueId` from the build / ship PR-body marker for github, linear and jira, incl. a Jira key with digits (`AB2-12`). | Router context job `feat/**` arm (replaces `bkit-cloud.yml:395-417` regex + branch fallback); SC2 Jira-digit keys; open question "branch fallback issue id". | `SETTLED` |
| C3 | PoC 1 | Under tracker github, `bkit issues fetch --json` with only `GH_TOKEN` set (no `BKIT_GH_TOKEN`, no gh keyring) returns a `labels` array; no credential → exit 80 `{"reason":"auth"}`; unknown issue → exit 80 `{"reason":"not-found"}`; issue-less FID → `{"skipped":"no-issue"}`; tracker none → `{"skipped":"tracker-none"}`. | `bkit_gate` outcome table (`pass`, `label-absent`, `no-issue`, `unreadable`); integration point `GH_TOKEN` = `github.token`; Decision "one gate path for GitHub too". | `SETTLED` |
| C4 | PoC 1 | Under tracker linear / jira, `bkit issues fetch --issue KEY --json` with the tracker key unset or invalid exits 80 with `{"reason":"auth"}`, against the real endpoints. | `bkit_gate` `unreadable` row naming `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY`; SC3. | `SETTLED` |
| C5 | PoC 1 | Under tracker linear / jira with a valid key, `bkit issues fetch --json` on a real issue returns `labels` containing `bkit:auto` when set, and the inputs the `terminal` fact needs (Linear `state.type`, Jira `statusCategory.key`). | Router gate `pass` / `label-absent` under linear / jira (SC2); `terminal` fact; guard Jira branch (SC4). | `BLOCKED` |
| C2 | PoC 1 | The design's widened FID regex equals engine `FID_PATTERNS.any` and, on runner bash + GNU grep, accepts `ab2-12-*` at both YAML site shapes (`[[ =~ ]]` guards, `dev` commit-scope `grep -oE`) where today's regex rejects it. | Router `dev` arm FID regex at `bkit-cloud.yml:230,318,327,398,414`; SC2. | `SETTLED` |
| C9 | U5 | A `codex` job cloned from the template `opencode` job shape (checkout → git user → agent CLI install → dispatch) plus `openai/codex-action@v1` reaches `/bkit-auto` Step 2 with `node_modules/.bin/bkit` present. | Components / Flows § Router agent jobs: "`codex` (new, cloned from `opencode`)". | `DISPROVEN` |
| C7 | U1 (CLI half) | `codex exec` loads the project `.codex/` layer (project `config.toml`, `.codex/agents/*.toml` subagents) when, and only when, the `CODEX_HOME` `config.toml` marks the project root trusted. | Open question "codex-action sandbox and actor check" widened to trust (review CRITICAL 2); candidate `codex-home` input → committed `config.toml`. | `SETTLED` |
| C10 | U1 (action half) | Inside `openai/codex-action@v1` on a GitHub runner, a `codex-home` `config.toml` trusting `$GITHUB_WORKSPACE` survives the action's `resolve-codex-home`, `write-proxy-config` and `drop-sudo` steps, so bkit subagents spawn. | Same open question; codex job doing real work. | `BLOCKED` |
| C11 | U3 | In the action, the chosen sandbox lets the agent `git push`, `gh pr comment` and reach tracker APIs; the write-access check passes for the actor of a `workflow_run` and a `workflow_dispatch`. | Open question option A (`sandbox: danger-full-access` + `allow-bots: true`). | `BLOCKED` |
| C8 | U2 | A `codex exec` prompt `$<skill> <phase> <arg>` invokes the repo skill `.agents/skills/<skill>/SKILL.md` non-interactively and the skill receives the arguments. | `codex` job `prompt: "$bkit-auto <phase> <arg>"` (Decision "`codex` job: ... prompt `$bkit-auto <phase> <arg>`"). | `SETTLED` |
| C6 | PoC 1 (guard) | With no bkit runtime, the guard GitHub branch (owner/repo from `git remote get-url origin`, issue from `feat/{FID}` leading digits, `curl` GitHub REST with `BKIT_GH_TOKEN`, `python3` parse) reads labels + state; a bad token surfaces as a non-zero `curl` exit, never as "label absent". | Session guard `preflight-tracker.sh` GitHub branch (SC4); fail-closed step 5. | `SETTLED` |
| C12 | U4 | Cursor injects `GITHUB_ISSUE_ID` for `@cursor` / its CI trigger, and `environment.json` `install` finishes before `sessionStart` on background agents. | Guard issue-id resolution (open question "no resolvable issue id"); guard Jira branch via `node_modules/.bin/bkit`. | `BLOCKED` |

## Method

Spike dir `S` = `docs/plans/202610/logs/719-cloud-variants-add/spike/`. Host: macOS (Darwin 25.6.0), Node via fnm, `dist/` at branch HEAD `cbc8cb225` (last rebuilt with the `fids.ts` change in `17f9527d6`). Every probe deletes its fixtures on exit; `c7` via `clean`.

<!-- prettier-ignore -->
| # | What was built | Where it ran | Exact command |
| --- | --- | --- | --- |
| C1 | `S/c1-fids-parse.sh`: per-tracker fixture git repo (`package.json` `bkit.tracker.default`), real `dist/cli.js fids parse --marker --branch --json`; marker cases github `#719`, linear `ENG-42`, jira `AB2-12` and `PROJ-7`; branch-only cases jira + github. | Host | `bash S/c1-fids-parse.sh` |
| C2 | `S/c2-fid-regex.sh`: host prints engine `FID_PATTERNS.any` from `dist/commands/workflow/fids.js` vs design string; `inner` mode runs both regex shapes (new vs today's) on 7 FIDs. | Host (engine) + `docker run ubuntu:24.04` (bash 5.2.21, GNU grep 3.11 — the `ubuntu-latest` shells) | `bash S/c2-fid-regex.sh` |
| C3 | `S/c3-fetch-github.sh`: real `dist/cli.js issues fetch --json` against cbartens/bkit; `GH_CONFIG_DIR` = empty dir (no keyring), `BKIT_GH_TOKEN` / `GITHUB_TOKEN` unset, token passed only as `GH_TOKEN`; cases a-e; tracker-none fixture for e. | Host, real GitHub API, cwd = worktree root (origin `cbartens/bkit`) | `direnv exec . bash S/c3-fetch-github.sh` |
| C4 | `S/c4-fetch-linear-jira.sh`: linear + jira fixtures (`jira.site` `example.atlassian.net`), keys unset, then invalid keys. | Host, real `api.linear.app` / Atlassian MCP endpoint | `bash S/c4-fetch-linear-jira.sh` |
| C5 | Not built. `direnv exec . sh -c '[ -n "${VAR}" ] && echo set \|\| echo unset'` for `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`. | Host | (presence check only) |
| C6 | `S/c6-guard-github.sh`: the design's guard read path in bash + `curl` + `python3`, good token then `invalid-probe-token`. | Host, real GitHub REST | `direnv exec . bash S/c6-guard-github.sh` |
| C7 | `S/c7-codex-trust.sh`: nested git fixture `fx-c7` with `.codex/config.toml` (`developer_instructions` marker), `.codex/agents/probe-agent.toml`, `.codex/hooks.json` (`SessionStart`, `UserPromptSubmit` → `touch`); two fresh `CODEX_HOME`s (`auth.json` symlinked to `~/.codex/auth.json`, nothing else), one with `[projects."<fx-c7>"] trust_level = "trusted"`. Phases: `prompt` (`codex debug prompt-input`, no model call), `spawn` (real `codex exec`, ask to spawn `probe-agent`), `hooks` (real `codex exec`). | Host, codex-cli 0.165.0, ChatGPT login, model `gpt-6.1-sol` | `bash S/c7-codex-trust.sh setup && bash S/c7-codex-trust.sh prompt`; `bash S/c7-codex-trust.sh spawn </dev/null` (run 1 used `--ephemeral`, run 2 without); `bash S/c7-codex-trust.sh hooks </dev/null`; `cd fx-c7 && CODEX_HOME=<trusted> codex exec --ephemeral -s read-only --color never --json "Reply with exactly OK"` |
| C8 | `S/c8-codex-skill.sh`: nested git fixture with `.agents/skills/probe-auto/SKILL.md` (reply `PROBE-SKILL-RAN-C8 phase={PHASE} arg={ARG}`); untrusted + trusted `CODEX_HOME`; `codex debug prompt-input` listing check, then `codex exec '$probe-auto ship 42'`. | Host, codex-cli 0.165.0 | `bash S/c8-codex-skill.sh` |
| C9 | `S/c9-codex-job-deps.sh`: (a) Ruby YAML parse of the template `opencode` job steps (placeholders replaced); (b) Ruby YAML parse of `openai/codex-action` `action.yml` at commit `bdf19a4a223ec2549a3e2274a0cf61556bc07675` (tag `v1`), install lines per step; (c) `git clone` of this branch (tracked files only, as `actions/checkout` leaves), then the exact `bkit-auto` Step 2 command. | Host + `raw.githubusercontent.com` | `bash S/c9-codex-job-deps.sh` |
| C10, C11 | Not built: needs a scratch GitHub repo, `OPENAI_API_KEY` repo secret and live workflow runs. `OPENAI_API_KEY` presence-checked via direnv. Read-only look at the action's `Resolve Codex home` / `Write Codex proxy config` / `Run codex exec` step text to scope the blocker (not used as evidence). | Host | (presence check only) |
| C12 | Not built: needs a live Cursor background agent. `CURSOR_API_KEY` presence-checked via direnv. | Host | (presence check only) |

## Evidence

Captured stdout + stderr verbatim. `[...]` marks lines cut for length; no cut line carries a result.

### C1

```text
== tracker=github marker='<!-- bkit:issue=#719 bkit:fid=719-cloud-variants-add -->' branch='feat/719-cloud-variants-add'
{"fid":"719-cloud-variants-add","issueId":"719","source":"marker","tracker":"github"}
exit=0
== tracker=linear marker='<!-- bkit:issue=ENG-42 bkit:fid=eng-42-some-slug -->' branch='feat/eng-42-some-slug'
{"fid":"eng-42-some-slug","issueId":"ENG-42","source":"marker","tracker":"linear"}
exit=0
== tracker=jira marker='<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-some-slug -->' branch='feat/ab2-12-some-slug'
{"fid":"ab2-12-some-slug","issueId":"AB2-12","source":"marker","tracker":"jira"}
exit=0
== tracker=jira marker='<!-- bkit:issue=PROJ-7 bkit:fid=proj-7-x -->' branch='feat/proj-7-x'
{"fid":"proj-7-x","issueId":"PROJ-7","source":"marker","tracker":"jira"}
exit=0
== branch-only fallback (no marker, no .bkit/issues.jsonl feature row)
== tracker=jira marker='' branch='feat/ab2-12-some-slug'
[bkit-fids] no well-formed jira bkit:fid marker — trying the branch
{"fid":"ab2-12-some-slug","issueId":null,"source":"branch","tracker":"jira"}
exit=0
== tracker=github marker='' branch='feat/719-cloud-variants-add'
[bkit-fids] no well-formed github bkit:fid marker — trying the branch
{"fid":"719-cloud-variants-add","issueId":null,"source":"branch","tracker":"github"}
exit=0
```

### C2

```text
engine any = ^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$
design new = ^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$
MATCH engine==design
24.04: Pulling from library/ubuntu
bash=5.2.21(1)-release grep=grep (GNU grep) 3.11
719-cloud-variants-add   guard new=yes old=yes | scope new=719-cloud-variants-add   old=719-cloud-variants-add
eng-42-some-slug         guard new=yes old=yes | scope new=eng-42-some-slug         old=eng-42-some-slug
ab2-12-some-slug         guard new=yes old=no  | scope new=ab2-12-some-slug         old=<none>
proj-7-x                 guard new=yes old=yes | scope new=proj-7-x                 old=proj-7-x
feat-no-number           guard new=no  old=no  | scope new=<none>                   old=<none>
Ab2-12-x                 guard new=no  old=no  | scope new=<none>                   old=<none>
12                       guard new=no  old=no  | scope new=<none>                   old=<none>
docker exit=0
```

### C3

```text
gh gh version 2.102.0 (2026-09-30)
== a) GH_TOKEN only, --issue 719
{"title":"Cloud variants: add --auto=codex and allow any tracker","url":"https://github.com/cbartens/bkit/issues/719","state":"open","labels":["enhancement","bkit:design"],"files":{"description":"/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/work-c3/out/a/issue-description.md","comments":"/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/work-c3/out/a/issue-comments.json","facts":"/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/work-c3/out/a/issue-facts.json"}}
exit=0
== b) no token at all, --issue 719
[bkit-issues] tracker read failed (auth): gh api: To get started with GitHub CLI, please run:  gh auth login
Alternatively, populate the GH_TOKEN environment variable with a GitHub API authentication token.
{"reason":"auth"}
exit=80
== c) GH_TOKEN only, unknown issue 99999999
[bkit-issues] tracker read failed (not-found): gh api: gh: Not Found (HTTP 404)
{"reason":"not-found"}
exit=80
== d) GH_TOKEN only, issue-less FID --fid probe-slug
{"skipped":"no-issue"}
exit=0
== e) tracker none fixture, --fid 719-cloud-variants-add
{"skipped":"tracker-none"}
exit=0
== labels type in (a) facts file
list ['enhancement', 'bkit:design'] open
```

`git status --short` after the run: only `design-spike.md` and `spike/` untracked — `fetch` wrote nothing outside `--outbox`.

### C4

```text
== linear, BKIT_LINEAR_API_KEY unset, --issue ENG-42
[bkit-issues] tracker read failed (auth): BKIT_LINEAR_API_KEY is not set
{"reason":"auth"}
exit=80
== jira, BKIT_JIRA_API_KEY unset, --issue AB2-12
[bkit-issues] tracker read failed (auth): BKIT_JIRA_API_KEY is not set
{"reason":"auth"}
exit=80
== jira, BKIT_JIRA_API_KEY=invalid, --issue AB2-12
[bkit-issues] tracker read failed (auth): HTTP 401
{"reason":"auth"}
exit=80
== linear, BKIT_LINEAR_API_KEY=invalid, --issue ENG-42
[bkit-issues] tracker read failed (auth): linear: Authentication required, not authenticated
{"reason":"auth"}
exit=80
```

### C5

```text
BKIT_LINEAR_API_KEY unset
BKIT_JIRA_API_KEY unset
```

### C6

```text
origin=https://github.com/cbartens/bkit.git slug=cbartens/bkit branch=feat/719-cloud-variants-add issue=719
== good token
curl exit=0
labels= ['enhancement', 'bkit:design'] state= open has_bkit_auto= False terminal= False
py exit=0
== bad token
curl exit=56 out=curl: (56) The requested URL returned error: 401
```

### C7

`prompt` phase (`codex debug prompt-input`, no model call):

```text
== CODEX_HOME=codex-home-untrusted codex debug prompt-input
exit=0
PROJECT-CONFIG-MARKER-C7 occurrences=0
PROBE-AGENT-DESC-C7 occurrences=0
[...] (skills_instructions line, system skills only)
== CODEX_HOME=codex-home-trusted codex debug prompt-input
exit=0
PROJECT-CONFIG-MARKER-C7 occurrences=1
PROBE-AGENT-DESC-C7 occurrences=1
                  "description": "Agent type override for the new agent. Omit unless explicitly asked. The selected role applies regardless of how much parent history is inherited.\nAvailable roles:\nprobe-agent: {\nProbe subagent PROBE-AGENT-DESC-C7. Use when asked to spawn probe-agent.\n}\ndefault: {\nDefault agent.\n}\nexplorer: {[...]
[...] (skills_instructions line, system skills only)
```

`spawn` run 1 (with `--ephemeral`), trusted home only:

```text
2026-10-29T02:36:03.547599Z ERROR codex_core::tools::router: error=agent_name must use only lowercase letters, digits, and underscores
2026-10-29T02:36:06.183692Z ERROR codex_core::tools::router: error=collab spawn failed: Fatal error: failed to load model context for thread 01a18583-a7a1-7001-8861-f2365dbfcd2f: invalid thread-store request: no rollout found for thread id 01a18583-a7a1-7001-8861-f2365dbfcd2f
codex
NO-PROBE-AGENT
```

`spawn` run 2 (no `--ephemeral`):

```text
== CODEX_HOME=codex-home-untrusted codex exec spawn probe-agent
Reading additional input from stdin...
OpenAI Codex v0.165.0
--------
workdir: /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/fx-c7
model: gpt-6.1-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: none
reasoning summaries: none
session id: 01a18583-fadb-75a2-bd66-569ef3d4d88f
--------
user
Spawn the custom subagent named probe-agent (agent type probe-agent) with the task 'say hello', wait for it, then reply with exactly its reply text and nothing else. If no agent named probe-agent is available, reply exactly NO-PROBE-AGENT.
codex
NO-PROBE-AGENT
tokens used
2,021
NO-PROBE-AGENT
exit=0
== CODEX_HOME=codex-home-trusted codex exec spawn probe-agent
Reading additional input from stdin...
OpenAI Codex v0.165.0
--------
workdir: /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/fx-c7
model: gpt-6.1-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: none
reasoning summaries: none
session id: 01a18584-122b-7702-b2a3-291a818b5e53
--------
user
Spawn the custom subagent named probe-agent (agent type probe-agent) with the task 'say hello', wait for it, then reply with exactly its reply text and nothing else. If no agent named probe-agent is available, reply exactly NO-PROBE-AGENT.
2026-10-29T02:36:32.071537Z ERROR codex_core::tools::router: error=agent_name must use only lowercase letters, digits, and underscores
collab: Wait
codex
PROBE-AGENT-REPLY-C7
tokens used
32,343
PROBE-AGENT-REPLY-C7
exit=0
```

`hooks` phase (a third variant adding `--dangerously-bypass-hook-trust` as a positive control was denied by the session permission classifier: `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Safety Bypass Flag].`):

```text
== untrusted codex exec
OK
OK
sessionstart_fired=no userprompt_fired=no
== trusted codex exec
OK
OK
sessionstart_fired=no userprompt_fired=no
```

Trusted `--json` run (no hook notice emitted):

```text
Reading additional input from stdin...
{"type":"thread.started","thread_id":"01a18584-e162-7cd1-8133-4d33014d9b5f"}
{"type":"turn.started"}
{"type":"item.completed","item":{"id":"item_0","type":"agent_message","text":"OK"}}
{"type":"turn.completed","usage":{"input_tokens":15758,"cached_input_tokens":7168,"cache_write_input_tokens":0,"output_tokens":5,"reasoning_output_tokens":0}}
README.md
```

### C8

```text
== CODEX_HOME=codex-home-c8-untrusted
skill listed in prompt-input: 1
$probe-auto ship 42
codex
PROBE-SKILL-RAN-C8 phase=ship arg=42
tokens used
2,216
PROBE-SKILL-RAN-C8 phase=ship arg=42
exit=0
== CODEX_HOME=codex-home-c8-trusted
skill listed in prompt-input: 1
$probe-auto ship 42
codex
PROBE-SKILL-RAN-C8 phase=ship arg=42
tokens used
2,216
PROBE-SKILL-RAN-C8 phase=ship arg=42
exit=0
```

### C9

```text
== (a) template opencode job steps
0: name=nil uses="actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1" run_first_line=""
1: name="Configure git user" uses=nil run_first_line="git config user.name 'bkit-auto[bot]'"
2: name="Install opencode" uses=nil run_first_line="npm install -g @opencode/cli@2.0.26"
3: name="Dispatch /bkit-auto on opencode runner" uses=nil run_first_line="opencode run \"/bkit-auto $BKIT_PHASE $BKIT_ARG\""
== (b) openai/codex-action action.yml steps (v1 → commit bdf19a4a223ec2549a3e2274a0cf61556bc07675)
curl exit=0
0: name="Validate Windows safety strategy" uses=nil install_lines=""
1: name="Ensure Node.js available" uses="actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f" install_lines=""
2: name="Check repository write access" uses=nil install_lines=""
3: name="Install Codex CLI" uses=nil install_lines="npm install -g \"@openai/codex@${CODEX_VERSION}\""
4: name="Install Codex Responses API proxy" uses=nil install_lines="npm install -g \"@openai/codex-responses-api-proxy@${CODEX_VERSION}\""
5: name="Resolve Codex home" uses=nil install_lines=""
6: name="Determine server info path" uses=nil install_lines=""
7: name="Check Responses API proxy status" uses=nil install_lines=""
8: name="Start Responses API proxy" uses=nil install_lines=""
9: name="Wait for Responses API proxy" uses=nil install_lines=""
10: name="Read server info" uses=nil install_lines=""
11: name="Write Codex proxy config" uses=nil install_lines=""
12: name="Enable Linux user namespaces for bubblewrap" uses=nil install_lines=""
13: name="Drop sudo privilege, if appropriate" uses=nil install_lines=""
14: name="Verify sudo privilege removed" uses=nil install_lines=""
15: name="Run codex exec" uses=nil install_lines=""
== (c) fresh clone, bkit-auto Step 2 command
clone exit=0
ls: node_modules: No such file or directory
/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/c9-codex-job-deps.sh: line 29: /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike/work-c9/checkout/node_modules/.bin/bkit: No such file or directory
step2 exit=127
```

### C10, C11, C12

```text
OPENAI_API_KEY unset
CURSOR_API_KEY unset
```

## Design Impact

- **C9 → Components / Flows § Router agent jobs, `codex` (new, cloned from `opencode`).** The cloned step list (checkout `dev`, git user, vale, `openai/codex-action`) leaves no `node_modules`: the template `opencode` job has 4 steps and none installs repo dependencies; `openai/codex-action@v1` has 16 steps and installs only `@openai/codex` and `@openai/codex-responses-api-proxy`; on a fresh checkout the exact `bkit-auto` Step 2 command exits 127 (`node_modules/.bin/bkit: No such file or directory`), which `bkit-auto` routes to Failure Path. Evidence supports: add `actions/setup-node` (`{{NODE_VERSION}}`) + `pnpm/action-setup` + `pnpm install --frozen-lockfile` steps to the `codex` job before the `openai/codex-action` step (the action's own `Drop sudo privilege` is its step 13, so installs must precede the action), and add a `{{NODE_VERSION}}` placeholder row for this job.
- **Out-of-scope find (propose separately, not bundled):** the shipped template `opencode` job has the same 4-step list (C9 (a)), so on a fresh runner its `/bkit-auto` dispatch would hit the same Step 2 exit 127. Not run live here.

## Unsettled

<!-- prettier-ignore -->
| # | Needs | Risk carried into the design |
| --- | --- | --- |
| C5 | `BKIT_LINEAR_API_KEY` and `BKIT_JIRA_API_KEY` (both `unset` in direnv), a Linear workspace and a Jira site (`bkit.tracker.jira.site`) each with one issue labelled `bkit:auto` in a started state and one in a done-category state renamed away from `Done` (e.g. `Shipped`). | Router `pass` / `label-absent` under linear / jira and the `terminal` fact are unproven end to end; only the failure classes (C4) are proven. A wrong `labels` shape would read as `unreadable` (fail closed, green run), not a false dispatch, but SC2 for linear / jira would fail silently. |
| C10 | Scratch GitHub repo, `OPENAI_API_KEY` repo secret, a live `workflow_dispatch` of the codex job with `codex-home` pointing at a committed `config.toml`. | Without trust the codex agent runs with no project config and no `.codex/agents/*.toml` subagents (C7: untrusted → `NO-PROBE-AGENT`), so bkit phases that spawn subagents fail or degrade while the job can still go green. Facts from C7 that shape the candidate: the trust key is the absolute project-root path (runner: `$GITHUB_WORKSPACE`, so a static committed file must hard-code it or a pre-action step must write it); the action writes its own proxy config into the same codex home (step `Write Codex proxy config`, `write-proxy-config --codex-home`), and whether that keeps a `[projects]` table is unproven; project trust alone did not fire `.codex/hooks.json` hooks locally (no positive control — see C7 Evidence), consistent with the design's "codex runner hooks likely inactive". |
| C11 | Same live repo: one `workflow_dispatch` and one `workflow_run` started by a human push, plus one by a bot-authored commit; agent asked to `git push`, `gh pr comment`, and run a tracker verb. | Codex job goes green having changed nothing (sandbox blocks network) or is refused by the write-access check for the `workflow_run` actor. Design open question default A stays unverified. |
| C12 | A Cursor account with background agents on a scratch GitHub repo (`CURSOR_API_KEY` `unset`), `@cursor` on an issue and the Cursor CI trigger, with a `sessionStart` hook dumping env + `ls node_modules/.bin/bkit`. | If Cursor injects no `GITHUB_ISSUE_ID` and its CI checkout is not `feat/{FID}`, every such session runs under "not verified" (open question default A) with `bkit:auto` unchecked; if `install` has not finished at `sessionStart`, the Jira guard HARD STOPs every Jira background session. |

## Verdict Reasoning

`FAIL` because C9 is `DISPROVEN`: the `codex` job as drafted (cloned from `opencode`, plus `openai/codex-action`) has no step that installs the repo's dependencies, and the first `/bkit-auto` command exits 127 on a fresh checkout. The fix the evidence supports is small (dependency-install steps before the action), so the design needs a revision of one job, not a rethink.

The load-bearing router claims hold under real runs: `fids parse` recovers FID + issue id for all three marker shapes incl. `AB2-12` (C1); `issues fetch` gives the gate every outcome it maps on GitHub with only `GH_TOKEN` (C3) and the `auth` failure class on real Linear / Jira endpoints (C4); the widened regex equals the engine pattern and works on runner bash + GNU grep (C2); the dependency-free GitHub guard read works and fails closed on a bad token (C6). Codex CLI mechanics hold locally: `$bkit-auto <phase> <arg>`-style skill invocation works with no trust (C8), and a `CODEX_HOME` `config.toml` trust entry is what makes `.codex/agents/*.toml` subagents available (C7).

Four claims stay `BLOCKED` (C5, C10, C11, C12) for want of tracker keys, an `OPENAI_API_KEY` + live GitHub runner, and a live Cursor background agent; these alone would have made the verdict `CONCERNS`.

Caveats on settled claims: C3 used a personal token in `GH_TOKEN`, not an Actions `github.token`; C7 and C8 ran codex-cli 0.165.0 on macOS with ChatGPT login, while the action installs a floating `@openai/codex` (`codex-version` default `""`) with API-key auth on Linux. The local `ubuntu:24.04` Docker image pulled for C2 stays in the host's image cache.
