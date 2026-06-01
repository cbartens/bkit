---
description: "Cloud — Phase-routed dispatch of any bkit phase"
---

# Cloud

**Role:** Orchestrator — phase-routed cloud dispatcher.
**Scope:** Route an invocation to the matching bkit phase skill. Two classes: **CI-driven** (`ship` on CI pass, `debug` on CI fail — routed by PR) and **dispatched** (`design`/`plan`/`build` — routed by tracker issue). The invoked skill ingests its own brief from the tracker (MCP-only, tracker-agnostic). No code, no execution.

> **Invocation:** `/bkit-cloud {PHASE} {ARG}` — `{PHASE}` in `ship|debug|design|plan|build`; `{ARG}` is the open PR number (`ship`/`debug`) or the tracker issue number/id (`design`/`plan`/`build`). The `bkit-cloud.yml` workflow resolves both before dispatch: CI pass→`ship`, CI fail→`debug` with `{ARG}` the open PR; `workflow_dispatch` passes `{PHASE}` + issue directly.
>
> **Phase classes:** `ship`/`debug` = **CI-class** (Steps 1–4: guard + opt-in gate + dispatch). `design`/`plan`/`build` = **brief-class** (Step 1 resolves the issue, Step 4 invokes the skill — guard + opt-in gate are skipped; the human `workflow_dispatch` is the opt-in, and the skill owns its own `status.jsonl`/worktree/FID).

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially unless stated otherwise.
> - **No Improv:** No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - **Auto-apply:** NEVER request human confirmation between steps. **If** single recommended option → document and proceed.
> - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does NOT mean silent.
> - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.bkit/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls (`{ISSUE_ID}` / `{STATE}` / `{LABELS}` only when tracker wired — empty under `none`). **Else** → **Failure Path**. `{OWNER}` + `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`).
> - **Status branch:** the `cloud` run's status.jsonl is dev-located (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`). `dev` commit + push ONCE per run: Dispatch → `docs({FID}): cloud DONE bkit [skip ci]`; Failure Path → `chore({FID}): cloud FAILED bkit [skip ci]`.
> - **Tools:** Verify every return, do NOT assume success.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.


> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) + `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-cloud trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.


> - **Timeouts:** **If** workflow or subagent run > 600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   if [ -f "$STATUS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"cloud",at:$t}' >> "$STATUS"
     git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
     git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" 2>/dev/null || true
     git -C "$REPO_ROOT" commit -m "chore({FID}): cloud FAILED bkit [skip ci]" 2>/dev/null || true
     git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   fi
   ```
2. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
3. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Read invocation arguments `{PHASE}` and `{ARG}`. Assert both non-empty. **Else** → **Failure Path**.
2. Normalise + classify `PHASE`:
   ```bash
   # CI-status aliases (success->ship, failure->debug) let the Cursor dashboard paste
   # `/bkit-cloud $CI_STATUS $PR_NUMBER` literally; the GHA half passes ship/debug directly.
   case "$(echo "$PHASE" | tr '[:upper:]' '[:lower:]')" in
     ship|success|pass)  PHASE=ship;   CLASS=ci ;;
     debug|failure|fail) PHASE=debug;  CLASS=ci ;;
     design)             PHASE=design; CLASS=brief ;;
     plan)               PHASE=plan;   CLASS=brief ;;
     build)              PHASE=build;  CLASS=brief ;;
     *) echo "Unrecognised PHASE: $PHASE" >&2; exit 1 ;;
   esac
   ```
   **If** the exit branch fires → **Failure Path**.
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
4. **Brief-class (`design`/`plan`/`build`):** brief-class dispatch is tracker-required — it is reached only when a tracker issue routes the run (`none` never applies `bkit:auto`, so CI auto-routing never gets here), so `$ARG` is always a tracker issue id. Set `ISSUE_ID="$ARG"`; assert non-empty (**Else** → **Failure Path**). Skip sub-steps 5–10 — no PR/FID/`status.jsonl` here; the dispatched skill owns FID/worktree/`status.jsonl` and ingests its own brief. Post the Step 1 comment (sub-step 11), then Gate 1.
5. **CI-class (`CLASS` = ci — `ship`/`debug`) — sub-steps 5–10 resolve the PR context.** `{ARG}` is the open PR number: set `PR_NUMBER="$ARG"`.
6. `gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,url --jq '.headRefName + "\t" + .headRefOid + "\t" + .state + "\t" + .url'` → split into `BRANCH`, `HEAD_SHA`, `PR_STATE`, `PR_URL`. Assert `BRANCH`, `HEAD_SHA`, `PR_URL` non-empty. **Else** → **Failure Path**.
7. **If** `PR_STATE` != OPEN → **Failure Path**. **If** `BRANCH` does NOT start with `feat/` → **Failure Path**.
8. Extract `FID` from `BRANCH`: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID` != `BRANCH`. **Else** → **Failure Path**.
9. Resolve CI run id that triggered the workflow:
   ```bash
   RUN_ID=$(gh run list --branch "$BRANCH" --limit 5 --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId")
   ```
   Assert `RUN_ID` non-empty. **Else** → **Failure Path**.
10. Extract `ISSUE_ID` from PR body metadata (preferred) or `FID` slug (fallback), then init status:
    
    Read PR body via `mcp__github__pull_request_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER} })` → parse the marker below → extract `ISSUE_ID` + `FID`:

    ```html
    <!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->
    ```

    **If** marker missing or malformed → terminate workflow.

    **Fallback** (`bkit-build` was run pre-metadata, or metadata missing): parse `FID`:

    ```bash
    # tracker-specific — github FIDs are `{N}-{slug}`; linear FIDs are `{prefix}-{N}-{slug}`
    ISSUE_ID=$(echo "$FID" | grep -oE '^[a-z]+-[0-9]+|^[0-9]+' | head -1)
    ```

    Assert `ISSUE_ID` non-empty **when a tracker is wired** (under `none` the FID carries no issue id, so `ISSUE_ID` stays empty and tracker calls remain no-ops — do NOT Failure-Path on it). Then update status:

    ```bash
    REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
    YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
    [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — ship/debug run post-build" >&2; exit 1; }
    mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
    STATUS="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
    if [ -f "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.json" ] && [ ! -f "$STATUS" ]; then
      jq -c '.[] as $w | ($w.workflow) as $wf
        | {type:"workflow-started",workflow:$wf,at:$w.startedAt}
        , ($w.steps[] | {type:"step-done",workflow:$wf} + .)
        , (if $w.status=="DONE" then {type:"workflow-done",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
           elif $w.status=="FAILED" then {type:"workflow-failed",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
           else empty end)' "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.json" > "$STATUS"
    fi
    [ -f "$STATUS" ] || : > "$STATUS"
    FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
    LATEST=$(jq -s "$FOLD"' fold | (.[-1] // {}) | {workflow, status}' "$STATUS" 2>/dev/null || echo '{}')
    if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "cloud" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
      jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-started", workflow:"cloud", at:$t}' >> "$STATUS"
    fi
    PARENT_SHA=$(git rev-parse HEAD)
    jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
      '{type:"step-done", workflow:"cloud", step:"cloud-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
      >> "$STATUS"
    ```

11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below (CI-class includes the branch/PR/run links; brief-class omits them — there is no PR):
    ```comment
    ## bkit Cloud
    ### Step 1 — Start Workflow - Phase: {PHASE}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] `PHASE` in `ship|debug|design|plan|build`; `CLASS` set (`ci` for ship/debug, `brief` for design/plan/build)
- [ ] `OWNER_REPO`, `OWNER`, `REPO` non-empty; `ISSUE_ID` resolved (non-empty when tracker wired; may be empty under `none`)
- [ ] CI-class only: `PR_NUMBER`, `PR_URL`, `BRANCH`, `HEAD_SHA`, `RUN_ID`, `FID` non-empty; PR OPEN and branch in `feat/**`; status updated (`cloud` `IN_PROGRESS`, step `cloud-start-workflow` recorded with `parentSha`; file-only write)
- [ ] Issue comment attempted (`Step 1` section, fresh comment)

---

## 🤖 Step 2 — Dispatch

**CI-class** (`ship`/`debug`): runs only after `bkit-cloud.yml`'s two gates pass (free-tier `bkit [auto route]` marker + in-job `bkit:auto` label re-check). **Brief-class** (`design`/`plan`/`build`): runs directly after Step 1 — `workflow_dispatch` is the opt-in; YAML gates skipped.

1. **CI-class only** — update status, commit, and push (brief-class skips this; the dispatched skill owns its own `status.jsonl`):
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg ph "$PHASE" \
     '{type:"step-done", workflow:"cloud", step:"cloud-dispatch", status:"DONE", at:$t, parentSha:$p, phase:$ph, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"cloud", at:$t}' >> "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   git -C "$REPO_ROOT" commit -m "docs({FID}): cloud DONE bkit [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
2. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Dispatch - Phase: {PHASE}
   ```
3. Invoke matching phase skill via `Skill` tool → exit (dispatched skill owns session). Route by `{PHASE}`:
   - `ship` → `/bkit-ship {FID}`
   - `debug` → `/bkit-debug {FID}`
   - `design` → `/bkit-design {ISSUE_ID}`
   - `plan` → `/bkit-plan {ISSUE_ID}`
   - `build` → `/bkit-build {ISSUE_ID}`
     **IF** `{PHASE}` matches none of above → **Failure Path**.

### 🔒 Gate 2 — Dispatch

- [ ] CI-class only: workflow status updated (`cloud` `DONE`, step `cloud-dispatch` recorded with `parentSha`, `phase`) and pushed to `dev` with `bkit [skip ci]`
- [ ] Issue comment attempted (`Step 2` section)
- [ ] The phase skill matching `{PHASE}` was invoked with the correct argument (`{FID}` for ship/debug, `{ISSUE_ID}` for design/plan/build)
- [ ] Orchestrator exits and the dispatched skill owns the session
