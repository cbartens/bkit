<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Auto

**Role:** Orchestrator — phase-routed auto-dispatcher.
**Scope:** Route an invocation to the matching bkit phase skill.

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially unless stated otherwise.
> - **No Improv:** No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - **Auto-apply:** NEVER request human confirmation between steps. **If** single recommended option → document and proceed.
> - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does NOT mean silent.
> - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND rows to `.bkit/friction.jsonl` in `.bkit/jsonl.md` format → continue or escalate; logging does NOT replace **Failure Path**.
> - **Deferred work:** NEVER silently drop deferred work, ALWAYS append rows to `docs/deferrals.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Discovered bugs:** NEVER silently drop discovered bugs, ALWAYS append rows to `docs/failures.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**. `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1.
> - **Tools:** Verify every return, do NOT assume success.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.


> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.


> - **Timeouts:** **If** workflow or subagent run > 600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
2. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Read invocation arguments `{PHASE}` and `{ARG}`. Assert both non-empty. **Else** → **Failure Path**.
2. Normalise `PHASE`, determine `MODE`:
   ```bash
   case "$(echo "$PHASE" | tr '[:upper:]' '[:lower:]')" in
     ship|success|pass)  PHASE=ship;   MODE=CI ;;
     debug|failure|fail) PHASE=debug;  MODE=CI ;;
     design)             PHASE=design; MODE=BRIEF ;;
     plan)               PHASE=plan;   MODE=BRIEF ;;
     build)              PHASE=build;  MODE=BRIEF ;;
     *) echo "Unrecognised PHASE: $PHASE" >&2; exit 1 ;;
   esac
   ```
   **If** exit branch fires → **Failure Path**.
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
4. **If** `MODE` = BRIEF → set `ISSUE_ID="$ARG"`. **If** `ISSUE_ID` empty → **Failure Path**. **Else** → step 11.
5. **If** `MODE` = CI → set `PR_NUMBER="$ARG"`.
6. `gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,url --jq '.headRefName + "\t" + .headRefOid + "\t" + .state + "\t" + .url'` → split into `BRANCH`, `HEAD_SHA`, `PR_STATE`, `PR_URL`. Assert `BRANCH`, `HEAD_SHA`, `PR_URL` non-empty. **Else** → **Failure Path**.
7. **If** `PR_STATE` != OPEN → **Failure Path**. **If** `BRANCH` does NOT start with `feat/` → **Failure Path**.
8. Extract `FID` from `BRANCH`: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID` != `BRANCH`. **Else** → **Failure Path**.
9. Resolve CI run id that triggered the workflow:
   ```bash
   RUN_ID=$(gh run list --branch "$BRANCH" --limit 5 --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId")
   ```
   Assert `RUN_ID` non-empty. **Else** → **Failure Path**.
10. Extract `ISSUE_ID` from PR body metadata (preferred) or `FID` slug (fallback):
     Read PR body via `mcp__github__pull_request_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER} })` → parse marker below → extract `ISSUE_ID` and `FID`:
    ```html
    <!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->
    ```
    **If** marker missing or malformed → **Failure Path**.
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below (`MODE` = BRIEF omits the branch/PR/run links):
    ```comment
    ## bkit Auto
    ### Step 1 — Start Workflow - Phase: {PHASE}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Phase and mode determined (`PHASE`, `MODE`)
- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`)
- [ ] Issue ID non-empty (`ISSUE_ID`, if tracker wired)
- [ ] CI placeholders non-empty (`PR_NUMBER`, `PR_URL`, `BRANCH`, `HEAD_SHA`, `RUN_ID`, `FID`, if `MODE` = CI)


- [ ] Issue comment attempted (`Step 1` section)


---

## 🤖 Step 2 — Dispatch

1. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Dispatch - Phase: {PHASE}
   ```
2. Invoke matching phase skill via `Task` tool → exit. Route by `{PHASE}`:
   - `ship` → `/bkit-ship {FID}`
   - `debug` → `/bkit-debug {FID}`
   - `design` → `/bkit-design {ISSUE_ID}`
   - `plan` → `/bkit-plan {ISSUE_ID}`
   - `build` → `/bkit-build {ISSUE_ID}`
     **If** `{PHASE}` matches none of above → **Failure Path**.

### 🔒 Gate 2 — Dispatch


- [ ] Issue comment attempted (`Step 2` section)


- [ ] The phase skill matching `{PHASE}` was invoked with the correct argument (`{FID}` for ship/debug, `{ISSUE_ID}` for design/plan/build)
- [ ] Orchestrator exits and the dispatched skill owns the session
