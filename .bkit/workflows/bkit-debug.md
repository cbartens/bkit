---
description: "Debug Feature — Autonomous diagnosis and remediation"
---

# Debug Feature (Workflow 4/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Remediate feature failures and push to branch.

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
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, `{WORKTREE_PATH}`, etc non-empty before tool calls (`{ISSUE_ID}` / `{STATE}` / `{LABELS}` only when tracker wired — empty under `none`; `{WORKTREE_PATH}` = absolute worktree path set at worktree setup, required for subagent `Context` cwd). **Else** → **Failure Path**. `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Resume:** On start, fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|FAIL|CONCERNS`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`); `debugAttempt` is carried by a `workflow-meta` event. **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded status.jsonl: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` and last step <30min idle → **Failure Path**; `IN_PROGRESS` and last step >=30min idle → stale, clean.
> - **Status branch:** debug status.jsonl is committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, NO `dev` push.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, bare `git push --force`, and ANY force-push to `dev` / `main`. **ALLOWED** as the Step 2 rebase companion: `git push --force-with-lease` to the personal `feat/{FID}` / `fix/{FID}` branch ONLY. Pre `git push`: assert `{BRANCH}` non-empty; never force-push a shared branch.

<!-- bkit:tracker github start -->

> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.

<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->

> - **Tracker:** Linear via MCP server `linear` (configured in `.mcp.json` `mcpServers.linear`). Tool names: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. All `save_*` writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__linear__save_comment` (with `issueId`, no `id` — creates new comment). NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. No edit-in-place.

<!-- bkit:tracker linear end -->

> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** Three attempt counters (mode-matched pairs): `DEBUG_ATTEMPT` / `MAX_DEBUG_ATTEMPT` (cross-invocation index; `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` starts a fresh run in `SOAK`), `NORMAL_ATTEMPT` / `MAX_NORMAL_ATTEMPT` (bounds the NORMAL diagnose → remediate loop), `SOAK_ATTEMPT` / `MAX_SOAK_ATTEMPT` (bounds the SOAK loop; resets to 0 each time `SOAK` is entered). All `MAX_*` constants sourced via fenced shell routing blocks below.
> - **Modes:** `PUSH_MODE` (`PR|LOCAL`) decided at Step 1; `DEBUG_MODE` (`NORMAL|SOAK`) at Step 1. `DEBUG_MODE` selects fix step: `NORMAL` → Diagnose (5) and Remediate (6); `SOAK` → Failure Remediate Soak (7). Entry: `[soak]` / soak criteria / `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` → `SOAK`. `NORMAL` switches to `SOAK` mid-run when the diagnose agent sets `Mode: SOAK`, or when the NORMAL loop exhausts `MAX_NORMAL_ATTEMPT`; either switch resets `SOAK_ATTEMPT` = 0 (fresh budget). `SOAK` is terminal.
> - **Large Diff Guard:** When a Read line passes `git diff origin/dev..HEAD` to a subagent, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   STATUS="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$STATUS" ] || STATUS="$REPO_ROOT/$REL"
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"debug",at:$t}' >> "$STATUS"
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   rm -f "$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
   ```
2. <!-- bkit:tracker github start -->
   Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
   <!-- bkit:tracker linear end -->
3. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
   <!-- bkit:tracker true end -->
4. **If** worktree `.worktrees/{FID}` exists **and** (failure triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_NORMAL_ATTEMPT` / `MAX_SOAK_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) **or** `DEBUG_MODE` = SOAK **or** rebase failure sentinel previously existed) → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-*.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-handover.md`.
6. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): debug aborted bkit [skip ci]"`.
10. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac` — **If** push fails → do NOT claim success on tracker.
11. <!-- bkit:tracker github start -->
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    `{BODY}` = fenced block below:
    ```comment
    ### Workflow Handover
    [debug-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-handover.md)
    {FID-debug-handover.md content verbatim}
    ```
    <!-- bkit:tracker true end -->
12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before debug" >&2; exit 1; }
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if ! (set -C; printf '%s debug\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
     LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
     SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"
     FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
     if [ -f "$SRC" ]; then
       LAST=$(jq -s --arg w "$LOCK_WORKFLOW" "$FOLD"' fold | [.[] | select(.workflow==$w)] | last' "$SRC" 2>/dev/null || echo 'null')
     else
       LAST=$(jq --arg w "$LOCK_WORKFLOW" '[.[] | select(.workflow==$w)] | last' "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.json" 2>/dev/null || echo 'null')
     fi
     LAST_STATUS=$(echo "$LAST" | jq -r '.status // ""')
     LAST_AT=$(echo "$LAST" | jq -r '.steps | last | .at // ""')
     if [ "$LAST_STATUS" = "IN_PROGRESS" ] && [ -n "$LAST_AT" ]; then
       LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_AT" +%s 2>/dev/null || date -d "$LAST_AT" +%s)
       IDLE=$(( $(date +%s) - LAST_EPOCH ))
       [ "$IDLE" -lt 1800 ] && { echo "Workflow already running for {FID} (workflow=$LOCK_WORKFLOW, idle ${IDLE}s)" >&2; exit 1; }
     else
       LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || stat -c %Y "$LOCK" 2>/dev/null || echo 0) ))
       [ "$LOCK_AGE" -lt 1800 ] && { echo "Workflow already running for {FID} (workflow=$LOCK_WORKFLOW, lock age ${LOCK_AGE}s)" >&2; exit 1; }
     fi
     rm -f "$LOCK"
     (set -C; printf '%s debug\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null || { echo "Lock contended for {FID}" >&2; exit 1; }
   fi
   ```
   **If** lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker github start -->
   Extract from session prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:debug"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Extract from session prompt: `<id>{ID}</id>`, `<linear_issue>{ID}</linear_issue>`, `Linear issue: {ID}`, `ISSUE-{ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__linear__save_issue({ title: "{task}", description: "{input}", team: "{LINEAR_TEAM}", assignee: "me", state: "In Progress", labels: ["bkit:debug"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**. `LINEAR_TEAM` = `bkit.linearTeam` from manifest.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   Scan session prompt for `<id>{ID}</id>` or `ISSUE-{ID}` → first match → `ISSUE_ID`. **If** no `ID` found → set `ISSUE_ID=""` and log `Tracker not wired — proceeding without issue ID.` Workflow continues with FID derived from branch name.
   <!-- bkit:tracker false end -->
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker github start -->
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`, `title` → `TITLE`, `html_url` → `URL`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`, `title` → `TITLE`, `url` → `URL`. Then `mcp__linear__list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   No tracker wired — set `STATE`, `LABELS`, `DESCRIPTION`, `COMMENTS` all empty; the input artifact is built from the session prompt alone.
   <!-- bkit:tracker false end -->
6. `gh pr list --head $(git branch --show-current) --base dev --json number --jq '.[0].number'` → extract `PR_NUMBER`. Decide `PUSH_MODE`:
   - **If** `PR_NUMBER` non-empty → `PUSH_MODE` = PR.
   - **Else** → `PUSH_MODE` = LOCAL.
7. Extract `PRIOR_DEBUG_ATTEMPT` from most recent `workflow == "debug"` entry and set this invocation's `DEBUG_ATTEMPT`:
   ```bash
   STATUS_REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"
   FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
   PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$FOLD"' fold | [.[] | select(.workflow=="debug")] | last.debugAttempt // 0' "$SRC" 2>/dev/null || echo 0)
   DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))
   ```
8. Decide `DEBUG_MODE`:
   - Default `DEBUG_MODE` = NORMAL.
   - **If** `[soak]` in session prompt → `DEBUG_MODE` = SOAK.
   - **If** any `debug-failure-soak` step recorded for the current `DEBUG_ATTEMPT` → `DEBUG_MODE` = SOAK.
   - Otherwise run counter-bus routing for `DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` check:
     ```bash
     REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
     THRESHOLD=$((MAX_DEBUG_ATTEMPT - 1))
     decide_next DEBUG_ATTEMPT "$DEBUG_ATTEMPT" "$THRESHOLD" NORMAL SOAK 2>/dev/null
     ```
     - **If** exit 0 (printed `NORMAL`) → `DEBUG_MODE` = NORMAL.
     - **If** exit 1 (printed `SOAK`) → `DEBUG_MODE` = SOAK.
9. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
10. **If** NO `FID` → create `FID` from `{ISSUE_ID}` and kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set. Format `{ISSUE_ID}-{slug}`.
    <!-- bkit:tracker github start -->
    Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    Lowercase `{ISSUE_ID}`. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker false start -->
    `ISSUE_ID` unset → `{branch-suffix}-{slug}`. No strict regex assert.
    <!-- bkit:tracker false end -->
11. <!-- bkit:tracker github start -->
    Add `bkit:debug` to `{LABELS}` (additive — phase label persists) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    Add `bkit:debug` to `{LABELS}` (additive — phase label persists) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker github start -->
    **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    No-op (log `Board status carried by issue state — no separate update.`).
    <!-- bkit:tracker linear end -->
12. <!-- bkit:tracker github start -->
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    `{BODY}` = fenced block below:
    ```comment
    ## Debug Workflow
    ### Step 1 — Start Workflow - Mode: {DEBUG_MODE} - Push: {PUSH_MODE} - Attempt: {DEBUG_ATTEMPT}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```
    <!-- bkit:tracker true end -->

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`)
- [ ] Issue ID resolved (`ISSUE_ID` non-empty when tracker wired; may be empty under `none`)
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] Push mode decided and valid (`PUSH_MODE` in `PR|LOCAL`)
- [ ] PR number extracted (`PR_NUMBER`, if `PUSH_MODE` = PR)
- [ ] Debug attempt incremented (`DEBUG_ATTEMPT` = prior + 1, folded from status.jsonl; `1` if first run)
- [ ] Debug mode decided and valid (`DEBUG_MODE` in `NORMAL|SOAK`)

<!-- bkit:tracker true start -->

- [ ] Issue update attempted (additive label `bkit:debug`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 2 — Worktree Setup

1. Create/resume the worktree:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   git worktree prune
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
   if [ -d "$WORKTREE_PATH" ]; then
     cd "$WORKTREE_PATH"
     rm -f "docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
     git fetch origin dev
     if ! git rebase --rebase-merges origin/dev; then
       CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
       if [ "$CONFLICT_FILES" = "pnpm-lock.yaml" ]; then
         git checkout --theirs pnpm-lock.yaml
         pnpm install --lockfile-only
         git add pnpm-lock.yaml
         if ! git rebase --continue; then
           git rebase --abort 2>/dev/null || true
           mkdir -p "docs/plans/{YYYYMM}/logs/{FID}/"
           touch "docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
         fi
       else
         git rebase --abort 2>/dev/null || true
         echo "Rebase conflict" >&2
         mkdir -p "docs/plans/{YYYYMM}/logs/{FID}/"
         touch "docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
       fi
     fi
   else
     if git show-ref --verify --quiet "refs/heads/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" "feat/{FID}"
     elif git fetch origin "feat/{FID}" 2>/dev/null \
          && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
     else
       git fetch origin dev
       git worktree add "$WORKTREE_PATH" -b "fix/{FID}" origin/dev
     fi
     cd "$WORKTREE_PATH"
   fi
   mkdir -p docs/plans/{YYYYMM}/logs/{FID}/
   for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
     [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
   done
   [ -d "$REPO_ROOT/.vale/styles/write-good" ] && cp -R "$REPO_ROOT/.vale/styles/write-good" "$WORKTREE_PATH/.vale/styles/"
   pnpm install --frozen-lockfile
   ```
2. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
3. **If** sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` exists → **Failure Path**.
4. **If** `BRANCH` NOT `dev` **and** does NOT contain `{FID}` **and** does NOT contain `{ISSUE_ID}` (case-insensitive) → **Failure Path**
5. Init counters: `NORMAL_ATTEMPT` = 0, `SOAK_ATTEMPT` = 0.
6. Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
7. Update status and commit:
   ```bash
   DIR="docs/plans/{YYYYMM}/logs/{FID}"
   WT=$(git rev-parse --show-toplevel)
   STATUS="$WT/$DIR/status.jsonl"
   mkdir -p "$WT/$DIR"
   if [ -f "$WT/$DIR/status.json" ] && [ ! -f "$STATUS" ]; then
     jq -c '.[] as $w | ($w.workflow) as $wf
       | {type:"workflow-started",workflow:$wf,at:$w.startedAt}
       , ($w.steps[] | {type:"step-done",workflow:$wf} + .)
       , (if $w.status=="DONE" then {type:"workflow-done",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
          elif $w.status=="FAILED" then {type:"workflow-failed",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
          else empty end)' "$WT/$DIR/status.json" > "$STATUS"
   fi
   [ -f "$STATUS" ] || : > "$STATUS"
   FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
   LATEST=$(jq -s "$FOLD"' fold | (.[-1] // {}) | {workflow, status}' "$STATUS" 2>/dev/null || echo '{}')
   if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "debug" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-started", workflow:"debug", at:$t}' >> "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"debug", step:"debug-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" --argjson da "$DEBUG_ATTEMPT" '{type:"workflow-meta", workflow:"debug", at:$t, debugAttempt:$da}' >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg dm "$DEBUG_MODE" --arg pm "$PUSH_MODE" \
     '{type:"step-done", workflow:"debug", step:"debug-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-input-'"${DEBUG_ATTEMPT}"'.md"], debugMode:$dm, pushMode:$pm}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
8. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/{YYYYMM}/logs/{FID}/status.jsonl](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] Branch non-empty (`BRANCH`, updated to worktree branch)
- [ ] On branch that passed eligibility
- [ ] Counters initialised (`NORMAL_ATTEMPT` = 0, `SOAK_ATTEMPT` = 0)
- [ ] Artifact written (`debug-input-{DEBUG_ATTEMPT}.md`, non-empty)
- [ ] Workflow status updated (`debug` `IN_PROGRESS` with `debugAttempt`, steps `debug-start-workflow` and `debug-worktree-setup` recorded with `parentSha`, `debug-worktree-setup` with `debugMode`, `pushMode`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 2` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 3 — Run Tests

1. Increment `NORMAL_ATTEMPT` + 1.
2. Run verbatim:
   ```bash
   TESTS_LIVE=""
   if ! grep -q '\[live=off\]' "docs/plans/{YYYYMM}/logs/{FID}/debug-input-${DEBUG_ATTEMPT}.md" 2>/dev/null; then
     for s in test:integration:live test:e2e:live test:live; do
       if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1 || { [ -f turbo.json ] && pnpm turbo run "$s" --dry-run >/dev/null 2>&1; }; then TESTS_LIVE="$TESTS_LIVE $s"; fi
     done
   fi
   if [ -f turbo.json ]; then
     TEST_SCOPE="pnpm turbo lint typecheck test test:integration test:e2e${TESTS_LIVE} --filter='...[origin/dev]' --continue"
   else
     TEST_SCOPE=""
     for s in typecheck test format:check lint:slop lint:prose test:integration test:e2e${TESTS_LIVE}; do
       jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1 && TEST_SCOPE="${TEST_SCOPE:+$TEST_SCOPE && }pnpm $s"
     done
   fi
   echo "TEST_SCOPE=$TEST_SCOPE"
   eval "$TEST_SCOPE"
   ```
3. Decide `TEST_VERDICT` and `TEST_FAILURES` from exit code:
   - **If** all tests passed → `TEST_VERDICT` = PASS, `TEST_FAILURES` = 0.
   - **Else** → `TEST_VERDICT` = FAIL, `TEST_FAILURES` = count of failing test suites (>=1).
4. Extract `TEST_SCOPE` from run block `TEST_SCOPE=` line.
5. Update status:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$TEST_VERDICT" --arg sc "$TEST_SCOPE" --argjson a "$NORMAL_ATTEMPT" --argjson f "$TEST_FAILURES" \
     '{type:"step-done", workflow:"debug", step:"debug-run-tests", status:"DONE", verdict:$v, scope:$sc, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
6. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Run Tests - Verdict: {TEST_VERDICT} - Failures: {TEST_FAILURES} - Scope: {TEST_SCOPE} - Attempt: {NORMAL_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->
7. Route:
   - **If** `TEST_VERDICT` = PASS **and** `NORMAL_ATTEMPT` > 1 → Step 8.
   - **If** `TEST_VERDICT` = PASS **and** `NORMAL_ATTEMPT` = 1 → Step 9.
   - **If** `TEST_VERDICT` = FAIL **and** `DEBUG_MODE` = NORMAL — run counter-bus routing:
     ```bash
     REPO_ROOT=$(git rev-parse --show-toplevel)
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
     decide_next NORMAL_ATTEMPT "$NORMAL_ATTEMPT" "$MAX_NORMAL_ATTEMPT" step-4 soak-escalation 2>/dev/null
     ```
     - **If** exit 0 (printed `step-4`) → Step 4.
     - **If** exit 1 (printed `soak-escalation`) — NORMAL exhausted; final SOAK escalation:
       ```bash
       REPO_ROOT=$(git rev-parse --show-toplevel)
       . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
       DEBUG_MODE=SOAK
       counter_reset SOAK_ATTEMPT
       ```
       → set `DEBUG_MODE` = SOAK, `SOAK_ATTEMPT` reset to 0 → Step 4.
   - **If** `TEST_VERDICT` = FAIL **and** `DEBUG_MODE` = SOAK — run counter-bus routing:
     ```bash
     REPO_ROOT=$(git rev-parse --show-toplevel)
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
     check_max SOAK_ATTEMPT "$SOAK_ATTEMPT" "$MAX_SOAK_ATTEMPT" 2>/dev/null
     ```
     - **If** exit 0 (within budget) → Step 4.
     - **If** exit 1 (SOAK exhausted) → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 3 — Run Tests

- [ ] Test attempt incremented (`NORMAL_ATTEMPT` + 1)
- [ ] Tests executed (turbo path if `turbo.json`)
- [ ] Test results extracted (`TEST_VERDICT`, `TEST_FAILURES`, `TEST_SCOPE`)
- [ ] Empirical fail-then-pass observable when `live` in `TEST_SCOPE` (iteration-1 `TEST_VERDICT` = FAIL → later PASS)
- [ ] Workflow status updated (step `debug-run-tests` recorded with `parentSha`, `verdict`, `scope`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 3` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 4 — Fetch Context

**Run only if** `TEST_VERDICT` = FAIL.

1. Discover CI run for branch and extract `RUN_SHA`:
   ```bash
   RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId,conclusion,headSha 2>/dev/null || echo "[]")
   RUN_ID=$(echo "$RUN_JSON" | jq -r '.[0].databaseId // ""')
   RUN_CONCLUSION=$(echo "$RUN_JSON" | jq -r '.[0].conclusion // ""')
   RUN_SHA=$(echo "$RUN_JSON" | jq -r '.[0].headSha // ""')
   ```
2. **If** `RUN_ID` non-empty **and** `RUN_CONCLUSION` != `success` → fetch failed jobs / steps, error-annotation subset, and failed-step logs → **if** logs non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md`:
   ````bash
   FAILED_STEPS=$(gh run view "$RUN_ID" --json conclusion,jobs \
     --jq '[.jobs[] | select(.conclusion=="failure") | {job: .name, steps: [.steps[] | select(.conclusion=="failure") | .name]}]' 2>/dev/null)
   CI_LOGS=$(gh run view "$RUN_ID" --log-failed 2>/dev/null)
   [ -z "$CI_LOGS" ] && CI_LOGS=$(gh run view "$RUN_ID" --log 2>/dev/null)
   ERR_SUBSET=$(printf '%s' "$CI_LOGS" | grep -E '##\[error\]|::error' 2>/dev/null)
   if [ -n "$CI_LOGS" ]; then
     {
       printf '# CI failure (run %s, headSha %s, attempt %s)\n\n' "$RUN_ID" "${RUN_SHA:-unknown}" "${DEBUG_ATTEMPT}"
       printf '## Failed jobs/steps\n```json\n%s\n```\n\n' "${FAILED_STEPS:-[]}"
       [ -n "$ERR_SUBSET" ] && printf '## Error annotations\n```\n%s\n```\n\n' "$ERR_SUBSET"
       printf '## Failed-step logs\n```\n%s\n```\n' "$CI_LOGS"
     } > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md"
   fi
   ````
3. **If** last-passing-CI SHA exists and diff output non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md`:
   ````bash
   LAST_PASS_SHA=$(gh run list --branch dev --workflow ci.yml --status success --limit 5 --json headSha --jq '.[0].headSha // ""' 2>/dev/null)
   if [ -n "$LAST_PASS_SHA" ]; then
     DIFF_STAT=$(git diff "$LAST_PASS_SHA..HEAD" --stat 2>/dev/null)
     if [ -n "$DIFF_STAT" ]; then
       {
         printf '# Diff vs last-passing CI on dev (last-passing-sha: %s)\n\n' "$LAST_PASS_SHA"
         printf '```\n%s\n```\n' "$DIFF_STAT"
       } > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md"
     fi
   fi
   ````
4. **If** current run output captured → write local test output to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md`:
   ```bash
   TEST_OUTPUT=$(pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue 2>&1 || true)
   [ -n "$TEST_OUTPUT" ] && printf '%s' "$TEST_OUTPUT" > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md"
   ```
5. **If** `RUN_ID` non-empty **and** `RUN_CONCLUSION` != `success` → detect e2e job failure → **if** failed, download outputs, combine every text file under `test-results/` verbatim, and write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md`:
   ```bash
   E2E_FAILED=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select((.name | test("e2e"; "i")) or (.steps // [] | any(.name | test("e2e|playwright"; "i")))) | select(.conclusion=="failure")] | length' 2>/dev/null || echo 0)
   if [ "${E2E_FAILED:-0}" -gt 0 ]; then
     E2E_DIR="docs/plans/{YYYYMM}/logs/{FID}/debug-e2e-${DEBUG_ATTEMPT}"
     mkdir -p "$E2E_DIR"
     gh run download "$RUN_ID" -n playwright-report -D "$E2E_DIR" 2>/dev/null || true
     if [ -n "$(ls -A "$E2E_DIR" 2>/dev/null)" ]; then
       E2E_LOG="docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md"
       SCAN_ROOT="$E2E_DIR/test-results"; [ -d "$SCAN_ROOT" ] || SCAN_ROOT="$E2E_DIR"
       {
         echo "# Playwright Report (run ${RUN_ID}, attempt ${DEBUG_ATTEMPT})"
         echo
         echo "Scanned: ${SCAN_ROOT#$E2E_DIR/} (text files only; binary artifacts listed below)"
         find "$SCAN_ROOT" -type f \( -name "*.md" -o -name "*.json" -o -name "*.txt" -o -name "*.log" -o -name "*.xml" \) | sort | while read -r f; do
           rel="${f#$E2E_DIR/}"
           printf '\n===== file: %s =====\n' "$rel"
           cat "$f"
           echo
         done
         printf '\n===== binary artifacts (not inlined; full tree under %s/) =====\n' "${E2E_DIR#docs/plans/logs/}"
         find "$E2E_DIR" -type f \( -name "*.html" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webm" -o -name "*.zip" \) | sed "s|^$E2E_DIR/||" | sort
       } > "$E2E_LOG"
       [ -s "$E2E_LOG" ] || rm -f "$E2E_LOG"
     else
       rmdir "$E2E_DIR" 2>/dev/null || true
     fi
   fi
   ```
6. List every `debug-fetch` block name after `<!-- bkit:end -->` in `.agents/config.md`:
   ```bash
   SECTION=$(sed -n '/^<!-- bkit:end -->/,$p' .agents/config.md 2>/dev/null)
   FETCH_NAMES=$(printf '%s\n' "$SECTION" | awk '/^<!-- debug-fetch:start/ { n=$0; sub(/^<!-- debug-fetch:start[ ]*/,"",n); sub(/[ ]*-->$/,"",n); print n }')
   ```
7. **For each** block in `FETCH_NAMES` → extract fenced body by name → use as starting template → customise per failure context (severity, freshness, limit) → execute via Bash → capture stdout (prefer JSON) and stderr → write stdout when non-empty, else the `[debug-fetch:<name>] skipped` stderr breadcrumb, to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-<name>-${DEBUG_ATTEMPT}.md`:
   ````bash
   BLOCK=$(printf '%s\n' "$SECTION" | awk -v want="$NAME" '
     /^<!-- debug-fetch:start/ { n=$0; sub(/^<!-- debug-fetch:start[ ]*/,"",n); sub(/[ ]*-->$/,"",n); cur=(n==want); next }
     /^<!-- debug-fetch:end -->$/ { cur=0; next }
     cur' | sed -n '/^```/,/^```/p' | sed '/^```/d')
   SUFFIX="${NAME:+$NAME-}"
   ERRF=$(mktemp)
   RUNTIME_LOGS=$({customised BLOCK} 2>"$ERRF")
   SKIP=$(grep -m1 '^\[debug-fetch:' "$ERRF"); rm -f "$ERRF"
   OUT="docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-${SUFFIX}${DEBUG_ATTEMPT}.md"
   if [ -n "$RUNTIME_LOGS" ]; then printf '%s' "$RUNTIME_LOGS" > "$OUT"; elif [ -n "$SKIP" ]; then printf '%s\n' "$SKIP" > "$OUT"; fi
   ````
8. <!-- bkit:tracker github start -->
   `{QUERY}` = 3–6 keywords from error signature / symptom (error class, failing-test name, exception terms; no stopwords) → `mcp__github__search_issues({ owner: "{OWNER}", repo: "{REPO}", query: "{QUERY} in:title,body", perPage: 15, sort: "updated", order: "desc" })` → top 15 `items`, drop any whose `number` == `{ISSUE_ID}`, keep first 10 → per hit `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {number} })` → write `docs/plans/{YYYYMM}/logs/{FID}/debug-context-related-${DEBUG_ATTEMPT}.md` → per hit `## #{number} — {title} ({state})` heading, the `body` from `items`, every comment verbatim; 0 hits → `None.`; on call error / timeout → `Search unavailable.`
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `{QUERY}` = 3–6 keywords from error signature / symptom (error class, failing-test name, exception terms; no stopwords) → `mcp__linear__list_issues({ query: "{QUERY}", team: "{LINEAR_TEAM}", limit: 15, orderBy: "updatedAt desc" })` → drop any whose `identifier` == `{ISSUE_ID}`, keep first 10 → per hit `mcp__linear__list_comments({ issueId: "{identifier}", orderBy: "createdAt desc", limit: 250 })` → write `docs/plans/{YYYYMM}/logs/{FID}/debug-context-related-${DEBUG_ATTEMPT}.md` → per hit `## {identifier} — {title} ({state.name})` heading, the `description` from `items`, every comment verbatim; 0 hits → `None.`; on call error / timeout → `Search unavailable.`
   <!-- bkit:tracker linear end -->
9. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   ARTIFACTS=()
   for f in "docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-*-${DEBUG_ATTEMPT}.md"; do
     [ -s "$f" ] && ARTIFACTS+=("$f")
   done
   [ ${#ARTIFACTS[@]} -gt 0 ] && FETCH_VERDICT=PASS || FETCH_VERDICT=FAIL
   ARTIFACTS_JSON=$(printf '%s\n' "${ARTIFACTS[@]}" | jq -R . | jq -s 'map(select(. != ""))')
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$FETCH_VERDICT" --argjson a "$DEBUG_ATTEMPT" --argjson arts "$ARTIFACTS_JSON" \
     '{type:"step-done", workflow:"debug", step:"debug-fetch-context", status:"DONE", verdict:$v, at:$t, parentSha:$p, attempt:$a, artifacts:$arts}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): fetch-context attempt ${DEBUG_ATTEMPT}"
   ```
10. <!-- bkit:tracker github start -->
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    `{BODY}` = fenced block below — ONLY add artifact links if present:
    ```comment
    ### Step 4 — Fetch Context - Verdict: {FETCH_VERDICT}
    [debug-context-ci-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-{DEBUG_ATTEMPT}.md)
    [debug-context-diff-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-{DEBUG_ATTEMPT}.md)
    [debug-context-tests-local-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-{DEBUG_ATTEMPT}.md)
    [debug-context-tests-e2e-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-{DEBUG_ATTEMPT}.md)
    [debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md)
    [debug-context-related-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-related-{DEBUG_ATTEMPT}.md)
    ```
    <!-- bkit:tracker true end -->
11. Route:
    - **If** `DEBUG_MODE` = SOAK → Step 7.
    - **Else** → Step 5.

### 🔒 Gate 4 — Fetch Context

- [ ] Run details discovery attempted (`RUN_ID`, `RUN_SHA`)
- [ ] CI logs fetch attempted
- [ ] Diff vs last-passing CI on `dev` attempted
- [ ] Local test output captured
- [ ] Playwright artifact download attempted (if e2e job failed)
- [ ] Runtime `debug-fetch` blocks enumerated, customised, and executed
- [ ] Runtime artifacts written (if output available)
- [ ] Fetch verdict derived (`FETCH_VERDICT`)
- [ ] Workflow status updated (step `debug-fetch-context` recorded with `parentSha`, `verdict`, `artifacts`)

<!-- bkit:tracker true start -->

- [ ] Related-issues search attempted
- [ ] Issue comment attempted (`Step 4` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 5 — Failure Diagnose

**Run only if** `DEBUG_MODE` != SOAK.

1. Read status.jsonl and extract `PRIOR_STRATEGY`:
   ```bash
   FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
   PRIOR_STRATEGY=$(jq -s -r --arg s "debug-failure-diagnose" "$FOLD"' fold | [.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""' \
     "$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl")
   ```
2. Decide `STRATEGY`:
   - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
   - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
   - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
   - **Else** → **Failure Path**.
3. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Strategy: `{STRATEGY}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-input-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-context-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-*-log.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-{NORMAL_ATTEMPT}.md`.
4. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
5. Read `debug-failure-diagnose-{NORMAL_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT` and `Mode` as `DIAGNOSE_MODE`.
6. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$NORMAL_ATTEMPT" --arg strat "$STRATEGY" \
     '{type:"step-done", workflow:"debug", step:"debug-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-'"${NORMAL_ATTEMPT}"'.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${NORMAL_ATTEMPT}"
   ```
7. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Mode: {DIAGNOSE_MODE} - Strategy: {STRATEGY}  - Attempt: {NORMAL_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->
8. Route:
   - **If** `DEBUG_MODE` = NORMAL **and** `DIAGNOSE_MODE` = SOAK → set `DEBUG_MODE` = SOAK, reset `SOAK_ATTEMPT` = 0 → Step 7.
   - **Else** → Step 6.

### 🔒 Gate 5 — Failure Diagnose

- [ ] Strategy computed before invocation (`STRATEGY`)
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`debug-failure-diagnose-{NORMAL_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted and valid (`DIAGNOSE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Mode extracted and valid (`DIAGNOSE_MODE` in `NORMAL|SOAK`)
- [ ] No PENDING placeholders remain (`debug-failure-diagnose-{NORMAL_ATTEMPT}.md`)
- [ ] Workflow status updated (step `debug-failure-diagnose` recorded with `parentSha`, `verdict`, `strategy`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 5` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 6 — Failure Remediate

**Run only if** `DEBUG_MODE` != SOAK.

1. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-{NORMAL_ATTEMPT}.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-{NORMAL_ATTEMPT}-log.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `debug-failure-remediate-{NORMAL_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$NORMAL_ATTEMPT" \
     '{type:"step-done", workflow:"debug", step:"debug-failure-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-'"${NORMAL_ATTEMPT}"'-log.md"]}' \
     >> "$STATUS"
   FIX_DESC=$(grep -m1 '^DONE — Step' "docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-${NORMAL_ATTEMPT}-log.md" 2>/dev/null \
     | sed -E 's/^DONE — Step [0-9]+: //; s/ — .*$//' \
     | tr -d '\r\n`"\\' \
     | sed -E 's/[[:space:]]+$//' \
     | cut -c1-72)
   [ -z "$FIX_DESC" ] && FIX_DESC="failure-remediate attempt ${NORMAL_ATTEMPT}"
   VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "fix({FID}): ${FIX_DESC}${VERBOSE_SUFFIX}"
   ```
5. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 6 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Attempt: {NORMAL_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->
6. Run tests → Step 3.

### 🔒 Gate 6 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`debug-failure-remediate-{NORMAL_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict extracted and valid (`REMEDIATE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Fix committed as `fix({FID}): {description}` (HEAD for the next Run Tests / Push)
- [ ] Workflow status updated (step `debug-failure-remediate` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 6` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 7 — Failure Remediate Soak

**Run only if** `DEBUG_MODE` = SOAK.

1. Increment `SOAK_ATTEMPT` + 1.
2. **Subagent:** Invoke `@bkit-debug-failure-soak` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-input-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-context-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-soak-*-log.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-soak-{NORMAL_ATTEMPT}-log.md`.
3. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Read `debug-failure-soak-{NORMAL_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `SOAK_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SOAK_VERDICT" --argjson a "$NORMAL_ATTEMPT" --argjson sa "$SOAK_ATTEMPT" \
     '{type:"step-done", workflow:"debug", step:"debug-failure-soak", status:"DONE", verdict:$v, attempt:$a, soakAttempt:$sa, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-failure-soak-'"${NORMAL_ATTEMPT}"'-log.md"]}' \
     >> "$STATUS"
   FIX_DESC=$(grep -m1 '^DONE' "docs/plans/{YYYYMM}/logs/{FID}/debug-failure-soak-${NORMAL_ATTEMPT}-log.md" 2>/dev/null \
     | sed -E 's/^DONE[^:]*: //; s/ — .*$//' \
     | tr -d '\r\n`"\\' \
     | sed -E 's/[[:space:]]+$//' \
     | cut -c1-72)
   [ -z "$FIX_DESC" ] && FIX_DESC="soak attempt ${NORMAL_ATTEMPT}"
   VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "fix({FID}): soak ${FIX_DESC}${VERBOSE_SUFFIX}"
   ```
6. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 7 — Failure Remediate Soak - Verdict: {SOAK_VERDICT} - Soak Attempt: {SOAK_ATTEMPT}/{MAX_SOAK_ATTEMPT} - Normal Attempt: {NORMAL_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->
7. Run tests → Step 3.

### 🔒 Gate 7 — Failure Remediate Soak

- [ ] Soak iteration counter incremented (`SOAK_ATTEMPT` + 1, bounded by `MAX_SOAK_ATTEMPT`)
- [ ] Subagent invoked (`@bkit-debug-failure-soak`, one accumulating context reading prior soak logs, no inline work)
- [ ] Artifact written (`debug-failure-soak-{NORMAL_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict extracted and valid (`SOAK_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Fix committed as `fix({FID}): soak {description}`
- [ ] Workflow status updated (step `debug-failure-soak` recorded with `parentSha`, `verdict`, `soakAttempt`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 7` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 8 — Push Remediation

**Run only if** `TEST_VERDICT` = PASS **and** `NORMAL_ATTEMPT` > 1.

1. Update status:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --argjson a "$NORMAL_ATTEMPT" \
     '{type:"step-done", workflow:"debug", step:"debug-push-remediation", status:"DONE", attempt:$a, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
2. **If** `PUSH_MODE` = PR **and** `[verbose ci]` NOT in pr title → append `bkit [verbose ci]` to PR title:
   ```bash
   if [ "$PUSH_MODE" = "PR" ] && [ -n "$PR_NUMBER" ]; then
     CURRENT_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title 2>/dev/null || echo "")
     case "$CURRENT_TITLE" in
       *"[verbose ci]"*) ;;
       *) [ -n "$CURRENT_TITLE" ] && gh pr edit "$PR_NUMBER" --title "${CURRENT_TITLE} bkit [verbose ci]" || true ;;
     esac
   fi
   ```
3. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac`.
4. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Push Remediation - Attempt: {DEBUG_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 8 — Push Remediation

- [ ] Step 6 or Step 7 `fix({FID}): {description}` commit pushed as branch HEAD (no intermediate `chore` commit between fix and push)
- [ ] PR title contains `[verbose ci]` (if `PUSH_MODE` = PR)
- [ ] Workflow status updated (step `debug-push-remediation` recorded with `parentSha`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 8` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 9 — Summary

**Run only if** `TEST_VERDICT` = PASS.

1. **Subagent:** Invoke `@bkit-debug-summary` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-*.md`, `git log --oneline origin/dev..HEAD` (commit subjects only), `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `debug-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Emit telemetry summary:
   ````bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   SUMMARY="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md"
   TELEMETRY_SUMMARY=$(pnpm bkit telemetry summary --phase=debug 2>&1 || echo "[bkit-telemetry] summary unavailable, skipping")
   printf '\n## Telemetry Summary\n\n```\n%s\n```\n' "$TELEMETRY_SUMMARY" >> "$SUMMARY"
   ````
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"debug", step:"debug-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md"]}' \
     >> "$STATUS"
   VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "chore({FID}): summary${VERBOSE_SUFFIX}"
   ```
6. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac`.
7. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Summary - Verdict: {SUMMARY_VERDICT}
   [debug-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md)
   {FID-debug-summary.md content verbatim}
   ```
   <!-- bkit:tracker true end -->
8. Route:
   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 10.
   - **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 9 — Summary

- [ ] Subagent invoked (`@bkit-debug-summary`, no inline work)
- [ ] Artifact written (`debug-summary.md`, non-empty)
- [ ] Verdict extracted and valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `debug-summary` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 9` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 10 — Close Workflow

**Run only if** `TEST_VERDICT` = PASS.

1. **If** `PUSH_MODE` = PR **and** `[verbose ci]` in PR title → strip the marker (with optional `bkit ` attribution prefix) from PR title:
   ```bash
   if [ "$PUSH_MODE" = "PR" ] && [ -n "$PR_NUMBER" ]; then
     CURRENT_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title 2>/dev/null || echo "")
     NEW_TITLE=$(printf '%s' "$CURRENT_TITLE" | sed -E 's/ ?(bkit )?\[verbose ci\]//')
     [ -n "$CURRENT_TITLE" ] && [ "$NEW_TITLE" != "$CURRENT_TITLE" ] && gh pr edit "$PR_NUMBER" --title "$NEW_TITLE" || true
   fi
   ```
2. Re-read labels → update status, commit, run HEAD-Subject Assertion, and push in one block (set and use `AUTO_ROUTE_SUFFIX` in same shell):
   <!-- bkit:tracker github start -->
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`. Then `mcp__linear__list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker linear end -->
   ```bash
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   BKIT_AUTO_ROUTE_FILE=$(mktemp)
   printf '%s' "$AUTO_ROUTE_SUFFIX" > "$BKIT_AUTO_ROUTE_FILE"
   echo "BKIT_AUTO_ROUTE_FILE=$BKIT_AUTO_ROUTE_FILE" >> "$GITHUB_ENV" 2>/dev/null || true
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   TESTS_LIVE_SKIPPED=""
   echo "$TEST_SCOPE" | grep -qw live || TESTS_LIVE_SKIPPED="No live tests ran, runtime-only defects not gated (not declared or opted out)."
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"debug", at:$t}' >> "$STATUS"
   STATS="$REPO_ROOT/.bkit/stats.jsonl"
   BKIT_VER=$(jq -r '.pinnedVersion // empty' "$REPO_ROOT/.bkit/version" 2>/dev/null); [ -z "$BKIT_VER" ] && BKIT_VER="unknown"
   REPO_SLUG=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]||; s|\.git$||' || echo "unknown/repo")
   jq -nc \
     --arg repo "$REPO_SLUG" \
     --arg bkitVersion "$BKIT_VER" \
     --arg step "debug-close-workflow" \
     --arg counterName "DEBUG_ATTEMPT" \
     --argjson counterValue 1 \
     --arg counterSource "model-self-report" \
     --arg parentSha "$PARENT_SHA" \
     '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "debug" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
     >> "$STATS" || echo "[bkit-telemetry] append failed: $STATS"
   VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   PR_MODE_AUTO_SUFFIX=""; [ "$PUSH_MODE" = "PR" ] && PR_MODE_AUTO_SUFFIX="$AUTO_ROUTE_SUFFIX"
   if git diff origin/dev..HEAD -- . ':(exclude)docs/plans' | grep -qE '^\+.*\[DEBUG-OBSERVE\]'; then
     echo "No-leak Assertion FAILED: [DEBUG-OBSERVE] instrumentation survived into the debug diff — soak did not strip it." >&2; exit 1
   fi
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow${VERBOSE_SUFFIX}${PR_MODE_AUTO_SUFFIX}"
   HEAD_MSG=$(git log -1 --pretty=%B)
   if echo "$HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "HEAD-Subject Assertion FAILED: close-workflow HEAD message contains a CI-suppressing token." >&2; exit 1
   fi
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
   if [ "$PUSH_MODE" = "PR" ]; then
     PR_NUMBER=$(gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
     RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"
     PUSHED_HEAD_MSG=$(git log -1 --pretty=%B)
     # --- CI-Dispatch Gate shared kernel ---
     POLL_BUDGET_S=60; POLL_INTERVAL_S=10
     PUSHED_HEAD=$(git rev-parse HEAD)
     CI_OUTCOME=""; CI_REASON=""; CI_RETRIGGER="false"; CI_ATTEMPTS=0; GH_ALL_ERRORED="true"
     echo "[bkit-ci-gate] polling for a bkit CI check on $PUSHED_HEAD (budget ${POLL_BUDGET_S}s, interval ${POLL_INTERVAL_S}s)"
     poll_dispatch() {
       local out rc
       out=$(gh pr view "$PR_NUMBER" --json statusCheckRollup --jq \
         '[.statusCheckRollup[]? | select(.name // .context // "" | test("bkit-tests|decide"; "i"))] | length' 2>/dev/null); rc=$?
       [ "$rc" -ne 0 ] && { echo "err"; return; }
       GH_ALL_ERRORED="false"
       [ "${out:-0}" -gt 0 ] 2>/dev/null && echo "found" || echo "none"
     }
     elapsed=0
     while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
       CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_dispatch)
       echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
       [ "$R" = "found" ] && { CI_OUTCOME="dispatched"; break; }
       sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
     done
     # --- end CI-Dispatch Gate shared kernel ---
     if [ -z "$CI_OUTCOME" ]; then
       if [ "$GH_ALL_ERRORED" = "true" ]; then
         CI_OUTCOME="unresolved"; CI_REASON="gh-error"
         echo "[bkit-ci-gate] unresolved(gh-error): every poll iteration errored — gh unavailable/unauthed"
       elif echo "$PUSHED_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
         CI_OUTCOME="unresolved"; CI_REASON="timeout-dirty"
         echo "[bkit-ci-gate] unresolved(timeout-dirty): no run and pushed HEAD carries a suppressor — refusing to re-trigger a dirty HEAD"
       else
           [ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ] || { CI_OUTCOME="unresolved"; CI_REASON="autoroute-mismatch"; }
         if [ -z "$CI_OUTCOME" ]; then
           git commit --allow-empty -m "chore({FID}): re-trigger${RETRIGGER_SUFFIX}"; CI_RETRIGGER="true"
           B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
           PUSHED_HEAD=$(git rev-parse HEAD); elapsed=0
           echo "[bkit-ci-gate] re-trigger pushed ($PUSHED_HEAD); re-polling"
           while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
             CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_dispatch)
             echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
             [ "$R" = "found" ] && { CI_OUTCOME="self-healed"; break; }
             sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
           done
             RETRIGGER_HEAD_MSG=$(git log -1 --pretty=%B)
           if echo "$RETRIGGER_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
             CI_OUTCOME="unresolved"; CI_REASON="retrigger-suppressed"
             echo "[bkit-ci-gate] unresolved(retrigger-suppressed): re-trigger HEAD itself carries a suppressor — cannot confirm no-ci vs. suppression"
           else
             [ -z "$CI_OUTCOME" ] && { CI_OUTCOME="no-ci"
               echo "[bkit-ci-gate] no-ci: clean re-trigger dispatched nothing — repo has no CI workflow for this event (logged pass)"; }
           fi
         fi
       fi
     fi
     echo "[bkit-ci-gate] verdict: ${CI_OUTCOME}${CI_REASON:+(${CI_REASON})} head=$PUSHED_HEAD attempts=$CI_ATTEMPTS retrigger=$CI_RETRIGGER"
       PARENT_SHA_CLOSE=$(git rev-parse HEAD)
     jq -nc --arg p "$PARENT_SHA_CLOSE" --arg t "$(date -u +%FT%TZ)" --arg lr "$TESTS_LIVE_SKIPPED" \
       --arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD" --argjson a "$CI_ATTEMPTS" \
       --arg r "$CI_REASON" --argjson rt "$CI_RETRIGGER" \
       '{type:"step-done", workflow:"debug", step:"debug-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[],
         ciDispatch: ({outcome:$o, head:$h, attempts:$a, retrigger:$rt} + (if $r=="" then {} else {reason:$r} end))} +
         (if $lr == "" then {} else {testsLiveSkipped:$lr} end)' \
       >> "$STATUS"
     case "$CI_OUTCOME" in unresolved) echo "[bkit-ci-gate] FATAL: unresolved verdict — routing to Failure Path" >&2; exit 1 ;; esac
   else
     jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg lr "$TESTS_LIVE_SKIPPED" \
       '{type:"step-done", workflow:"debug", step:"debug-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]} + (if $lr == "" then {} else {testsLiveSkipped:$lr} end)' \
       >> "$STATUS"
   fi
   ```
3. Capture branch state:
   ```bash
   CURRENT=$(git branch --show-current)
   PR_URL=""
   PR_NUMBER=""
   EXISTING_PR=""
   if [ "$CURRENT" != "dev" ] && [ "$CURRENT" != "main" ]; then
     EXISTING_PR=$(gh pr list --head "$CURRENT" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
   fi
   ```
4. Set `TRIGGER_PR`:
   - **If** `CURRENT` = `dev` **or** `main` → push to trigger branch (CI fires) → `TRIGGER_PR` = 0.
   - **If** `PUSH_MODE` = PR → push fires `pull_request` event → `TRIGGER_PR` = 0.
   - **If** `PUSH_MODE` = LOCAL → `TRIGGER_PR` = 1.
   - **Else** → **Failure Path**.
5. **If** `TRIGGER_PR` = 1 → create PR:
   ```bash
   gh pr create --base dev --title "feat({FID}): debug-remediated" --body "$(cat <<'EOF'
   <!-- bkit:start -->
   https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-plan.md
   <!-- bkit:end -->
   EOF
   )"
   ```
6. **If** `TRIGGER_PR` = 1 **and** `gh pr create` fails → retry once. **If** still fails → **Failure Path**.
7. **If** `TRIGGER_PR` = 1 → extract `PR_URL` and `PR_NUMBER` from created PR; assert both non-empty.
8. **If** `TRIGGER_PR` = 1 → update status, commit, run HEAD-Subject Assertion, and push in one block (set and use `AUTO_ROUTE_SUFFIX` in same shell):
   ```bash
   PARENT_SHA=$(git rev-parse HEAD)
   VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   AUTO_ROUTE_SUFFIX=""
   if [ -n "${BKIT_AUTO_ROUTE_FILE:-}" ] && [ -f "$BKIT_AUTO_ROUTE_FILE" ]; then
     AUTO_ROUTE_SUFFIX=$(cat "$BKIT_AUTO_ROUTE_FILE")
     rm -f "$BKIT_AUTO_ROUTE_FILE"
   else
     echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   fi
   LOCAL_MODE_AUTO_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && LOCAL_MODE_AUTO_SUFFIX="$AUTO_ROUTE_SUFFIX"
   git add -A && git commit --allow-empty -m "chore({FID}): create-pr${VERBOSE_SUFFIX}${LOCAL_MODE_AUTO_SUFFIX}"
   HEAD_MSG=$(git log -1 --pretty=%B)
   if echo "$HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "HEAD-Subject Assertion FAILED: create-pr HEAD message contains a CI-suppressing token." >&2; exit 1
   fi
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
   RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"
   PUSHED_HEAD_MSG=$(git log -1 --pretty=%B)
   # --- CI-Dispatch Gate shared kernel ---
   POLL_BUDGET_S=60; POLL_INTERVAL_S=10
   PUSHED_HEAD=$(git rev-parse HEAD)
   CI_OUTCOME=""; CI_REASON=""; CI_RETRIGGER="false"; CI_ATTEMPTS=0; GH_ALL_ERRORED="true"
   echo "[bkit-ci-gate] polling for a bkit CI check on $PUSHED_HEAD (budget ${POLL_BUDGET_S}s, interval ${POLL_INTERVAL_S}s)"
   poll_dispatch() {
     local out rc
     out=$(gh pr view "$PR_NUMBER" --json statusCheckRollup --jq \
       '[.statusCheckRollup[]? | select(.name // .context // "" | test("bkit-tests|decide"; "i"))] | length' 2>/dev/null); rc=$?
     [ "$rc" -ne 0 ] && { echo "err"; return; }
     GH_ALL_ERRORED="false"
     [ "${out:-0}" -gt 0 ] 2>/dev/null && echo "found" || echo "none"
   }
   elapsed=0
   while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
     CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_dispatch)
     echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
     [ "$R" = "found" ] && { CI_OUTCOME="dispatched"; break; }
     sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
   done
   # --- end CI-Dispatch Gate shared kernel ---
   if [ -z "$CI_OUTCOME" ]; then
     if [ "$GH_ALL_ERRORED" = "true" ]; then
       CI_OUTCOME="unresolved"; CI_REASON="gh-error"
       echo "[bkit-ci-gate] unresolved(gh-error): every poll iteration errored — gh unavailable/unauthed"
     elif echo "$PUSHED_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
       CI_OUTCOME="unresolved"; CI_REASON="timeout-dirty"
       echo "[bkit-ci-gate] unresolved(timeout-dirty): no run and pushed HEAD carries a suppressor — refusing to re-trigger a dirty HEAD"
     else
       [ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ] || { CI_OUTCOME="unresolved"; CI_REASON="autoroute-mismatch"; }
       if [ -z "$CI_OUTCOME" ]; then
         git commit --allow-empty -m "chore({FID}): re-trigger${RETRIGGER_SUFFIX}"; CI_RETRIGGER="true"
         B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
         PUSHED_HEAD=$(git rev-parse HEAD); elapsed=0
         echo "[bkit-ci-gate] re-trigger pushed ($PUSHED_HEAD); re-polling"
         while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
           CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_dispatch)
           echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
           [ "$R" = "found" ] && { CI_OUTCOME="self-healed"; break; }
           sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
         done
         RETRIGGER_HEAD_MSG=$(git log -1 --pretty=%B)
         if echo "$RETRIGGER_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
           CI_OUTCOME="unresolved"; CI_REASON="retrigger-suppressed"
           echo "[bkit-ci-gate] unresolved(retrigger-suppressed): re-trigger HEAD itself carries a suppressor — cannot confirm no-ci vs. suppression"
         else
           [ -z "$CI_OUTCOME" ] && { CI_OUTCOME="no-ci"
             echo "[bkit-ci-gate] no-ci: clean re-trigger dispatched nothing — repo has no CI workflow for this event (logged pass)"; }
         fi
       fi
     fi
   fi
   echo "[bkit-ci-gate] verdict: ${CI_OUTCOME}${CI_REASON:+(${CI_REASON})} head=$PUSHED_HEAD attempts=$CI_ATTEMPTS retrigger=$CI_RETRIGGER"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg u "$PR_URL" \
     --arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD" --argjson a "$CI_ATTEMPTS" \
     --arg r "$CI_REASON" --argjson rt "$CI_RETRIGGER" \
     '{type:"step-done", workflow:"debug", step:"debug-create-pr", status:"DONE", at:$t, parentSha:$p, artifacts:[$u],
       ciDispatch: ({outcome:$o, head:$h, attempts:$a, retrigger:$rt} + (if $r=="" then {} else {reason:$r} end))}' \
     >> "$STATUS"
   case "$CI_OUTCOME" in unresolved) echo "[bkit-ci-gate] FATAL: unresolved verdict — routing to Failure Path" >&2; exit 1 ;; esac
   ```
9. <!-- bkit:tracker github start -->
   No issue changes.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
   Update state ONLY; do NOT change labels → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review" })`.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker github start -->
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.reviewOptionId}" } })`.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
   No-op (log `Board status carried by issue state — no separate update.`).
    <!-- bkit:tracker linear end -->
10. **If** `PR_NUMBER` is set (PR-mode only) → re-read issue labels → check kill-switch:
    <!-- bkit:tracker github start -->
    `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`. Then `mcp__linear__list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract comments → `COMMENTS`.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    After reading issue (`issue-read`): **If** `bkit:auto` NOT in `LABELS` → kill switch active → terminate workflow normally (current run finishes, no further automation).
    <!-- bkit:tracker true end -->
11. <!-- bkit:tracker true start -->
    Build `{ARTIFACTS}` link list:
    ```bash
    RR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)"); BR=$(git branch --show-current)
    ARTIFACTS=$( { git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/" | grep -E "docs/plans/{YYYYMM}/{FID}-[^/]+$"; git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep -E "/debug-[^/]+$"; } | while read -r f; do printf -- '- [%s](https://github.com/{OWNER_REPO}/blob/%s/%s)\n' "$(basename "$f")" "$BR" "$f"; done )
    printf '%s\n' "$ARTIFACTS"
    ```
    <!-- bkit:tracker true end -->
12. <!-- bkit:tracker github start -->
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    `{BODY}` = fenced block below - ONLY add PR link if `TRIGGER_PR` = 1:
    ```comment
    ### Step 10 — Close Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/run/{RUN_ID})
    Artifacts:
    {ARTIFACTS}
    ```
    <!-- bkit:tracker true end -->
13. Final return: Display `debug-summary.md` content verbatim as final message to user; do NOT summarise or trim; do NOT auto-invoke.
    <!-- bkit:tracker true start -->
    Append issue link [{ISSUE_ID} {TITLE}]({URL})
    <!-- bkit:tracker true end -->

### 🔒 Gate 10 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] PR title `[verbose ci]` stripped (if `PUSH_MODE` = PR)

<!-- bkit:tracker true start -->

- [ ] `bkit:auto` presence re-read BEFORE close-workflow commit (pre-commit label read for marker sourcing)

<!-- bkit:tracker true end -->

- [ ] No-leak Assertion passed (no `[DEBUG-OBSERVE]` lines survive)
- [ ] HEAD-Subject Assertion passed

<!-- bkit:tracker true start -->

- [ ] Marker `bkit [auto route]` present (if label `bkit:auto` present at close time)

<!-- bkit:tracker true end -->

- [ ] Trigger-PR determined (`TRIGGER_PR`)
- [ ] If PR created (`PR_URL`, `PR_NUMBER` non-empty)
- [ ] If PR created workflow status updated (step `debug-create-pr` recorded with `parentSha`, `ciDispatch` verdict)
- [ ] If PR created, changes pushed to `feat/{FID}`
- [ ] CI-Dispatch gate ran (step `debug-close-workflow` / `debug-create-pr` recorded with `ciDispatch`)
- [ ] Workflow status updated (`debug` `DONE`, step `debug-close-workflow` recorded with `parentSha`, `testsLiveSkipped` if no live test, `ciDispatch` verdict if PR-mode)
- [ ] Workflow status committed on `feat/{FID}` (status.jsonl)
- [ ] Final return displayed (`debug-summary.md` content verbatim)

<!-- bkit:tracker true start -->

- [ ] Issue update attempted (status/state `In Review`, phase label `bkit:debug` unchanged)
- [ ] Kill-switch propagation checked if `PR_NUMBER` set (`bkit:auto` label presence verified on issue)
- [ ] Artifact link list embedded in `Step 10` comment
- [ ] Issue comment attempted (`Step 10` section)

<!-- bkit:tracker true end -->
