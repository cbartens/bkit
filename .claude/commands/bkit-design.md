---
description: "Design Feature — Autonomous design phase"
---
<!-- bkit:managed v4.7.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Design Feature (Workflow 1/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create design in `docs/plans/{YYYYMM}/` (canonical month bucket, set at start) — no plans, no code, no execution.

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
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, `{WORKTREE_PATH}`, etc non-empty before tool calls (`{ISSUE_ID}` / `{STATE}` / `{LABELS}` only when tracker wired — empty under `none`; `{WORKTREE_PATH}` = absolute worktree path set at worktree setup, required for subagent `Context` cwd). **Else** → **Failure Path**. `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; set ONCE at first workflow start (`date +%Y%m`) and discovered by downstream workflows via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Resume:** On start, fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`), `failures`, `attempt`, `strategy` (`STANDARD | PIVOT | FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded status.jsonl: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` and last step <30min idle → **Failure Path**; `IN_PROGRESS` and last step >=30min idle → stale, clean. **Dev lock:** hold `$REPO_ROOT/.bkit/.dev.lock` across every dev critical section (checkout / stage / commit / push of `dev` in the main checkout); acquire with `set -C`, release via `trap ... EXIT`.
> - **Status branch:** design status.jsonl is committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, NO mid-lifecycle `dev` push. State reaches `dev` once via the Close Workflow squash-merge → `docs({FID}): design DONE bkit [skip ci]`. Failure Path appends `workflow-failed` to the retained worktree copy (NO `dev` push); the tracker comment carries the failure signal.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, bare `git push --force`, and ANY force-push to `dev` / `main`. **ALLOWED** as the Step 2 rebase companion: `git push --force-with-lease` to the personal `feat/{FID}` / `fix/{FID}` branch ONLY. Pre `git push`: assert `{BRANCH}` non-empty; never force-push a shared branch.


> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.


> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   STATUS="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$STATUS" ] || STATUS="$REPO_ROOT/$REL"
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"design",at:$t}' >> "$STATUS"
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
2. Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
3. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(date +%Y%m)
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if ! (set -C; printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
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
     (set -C; printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null || { echo "Lock contended for {FID}" >&2; exit 1; }
   fi
   ```
   **If** lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else**:
   Extract from session prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:design"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`, `title` → `TITLE`, `html_url` → `URL`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
6. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
7. **If** NO `FID` → create `FID` from `{ISSUE_ID}` and kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set. Format `{ISSUE_ID}-{slug}`.
   Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
8. Add `bkit:design` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.
9. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ## Design Workflow
   ### Step 1 — Start Workflow
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`)
- [ ] Issue ID resolved (`ISSUE_ID` non-empty when tracker wired; may be empty under `none`)
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)


- [ ] Issue update attempted (phase label `bkit:design`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)


---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch — NEVER push:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl
     git diff --cached --quiet -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl \
       || git commit -m "chore({FID}): pre-worktree uncommitted changes" -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl
   fi
   ```
   **If** primary checkout dirty / unpushed → NOT blocker; do NOT stash, clean, or route to **Failure Path** → create `feat/{FID}` branch off `origin/dev` instead (never `main` / current branch).
2. Create/resume the worktree:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   git worktree prune
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
   if [ -d "$WORKTREE_PATH" ]; then
     cd "$WORKTREE_PATH"
     git fetch origin dev
     git rebase --rebase-merges origin/dev || { echo "Rebase conflict — resolve manually"; exit 1; }
   else
     if git show-ref --verify --quiet "refs/heads/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" "feat/{FID}"
     elif git fetch origin "feat/{FID}" 2>/dev/null \
          && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
     else
       git fetch origin dev
       git worktree add "$WORKTREE_PATH" -b "feat/{FID}" origin/dev
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
3. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
4. Create: `docs/plans/{YYYYMM}/logs/{FID}/design-input.md` = session prompt + `DESCRIPTION` + `COMMENTS`.
5. Update status and commit:
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
   if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "design" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" --arg p "$(git rev-parse HEAD 2>/dev/null || echo '')" '{type:"workflow-started", workflow:"design", at:$t, parentSha:$p}' >> "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-input.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   [docs/plans/{YYYYMM}/logs/{FID}/status.jsonl](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] Branch non-empty (`BRANCH`, updated to worktree branch)
- [ ] Artifact written (`design-input.md`, non-empty)
- [ ] Workflow status updated (`design` `IN_PROGRESS`, steps `design-start-workflow` and `design-worktree-setup` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 2` section)


---

## 🧠 Step 3 — Brainstorm & Ideate

1. `{QUERY}` = 3–6 keywords from `docs/plans/{YYYYMM}/logs/{FID}/design-input.md` (feature nouns, no stopwords) → `mcp__github__search_issues({ owner: "{OWNER}", repo: "{REPO}", query: "{QUERY} in:title,body", perPage: 15, sort: "updated", order: "desc" })` → top 15 `items`, drop any whose `number` == `{ISSUE_ID}`, keep first 10 → per hit `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {number} })` → write `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` → per hit `## #{number} — {title} ({state})` heading, the `body` from `items`, every comment verbatim; 0 hits → `None.`; on call error / timeout → `Search unavailable.`
2. Launch all three subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-1`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`.
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-2`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`.
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-3`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`.
3. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-brainstorm-ideate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md","docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md","docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): brainstorm-ideate"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Brainstorm & Ideate
   ```

### 🔒 Gate 3 — Brainstorm & Ideate

- [ ] Subagents invoked (`@bkit-design-brainstorm-ideate-1`, `@bkit-design-brainstorm-ideate-2`, `@bkit-design-brainstorm-ideate-3`, no inline work)
- [ ] Artifacts written (`design-brainstorm-ideate-1.md`, `design-brainstorm-ideate-2.md`, `design-brainstorm-ideate-3.md`, non-empty)
- [ ] Workflow status updated (step `design-brainstorm-ideate` recorded with `parentSha`)


- [ ] Related-issues search attempted
- [ ] Issue comment attempted (`Step 3` section)


---

## 🧠 Step 4 — Generate Design

1. **Subagent:** Invoke `@bkit-design-generate` using `Agent` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Inputs carry distinct lenses — merge across them, do NOT collapse to a consensus.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-generate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-generate"
   ```
4. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Generate Design
   [design-v1-draft.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md)
   ```

### 🔒 Gate 4 — Generate Design

- [ ] Subagent invoked (`@bkit-design-generate`, no inline work)
- [ ] Artifact written (`design-v1-draft.md`, non-empty)
- [ ] Workflow status updated (step `design-generate` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 4` section)


---

## 🧠 Step 5 — Design Review

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-design-review-1`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/design-review-1.md`.
   - **Subagent:** Invoke `@bkit-design-review-2`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/design-review-2.md`.
2. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `design-review-1.md` and `design-review-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` from each → compute `REVIEW_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`).
4. **If** any `Verdict` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-review-{N}.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
5. **If** `REVIEW_VERDICT` = FAIL → **Failure Path**.
6. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" \
     '{type:"step-done", workflow:"design", step:"design-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-review-1.md","docs/plans/{YYYYMM}/logs/{FID}/design-review-2.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-review"
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Design Review - Verdict: {REVIEW_VERDICT}
   ```

### 🔒 Gate 5 — Design Review

- [ ] Subagents invoked (`@bkit-design-review-1`, `@bkit-design-review-2`, no inline work)
- [ ] Artifacts written (`design-review-1.md` and `design-review-2.md`, non-empty)
- [ ] Verdict extracted and valid (`REVIEW_VERDICT` = worst-of-two; each review's `Verdict` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`design-review-1.md` and `design-review-2.md`)
- [ ] Routed correctly (FAIL → Failure Path; PASS/CONCERNS → Step 6)
- [ ] Workflow status updated (step `design-review` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 5` section)


---

## 🧠 Step 6 — Apply Review

1. **Subagent:** Invoke `@bkit-design-update` using `Agent` tool:
   Context: You are a subagent in the Design phase applying review critiques. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-review-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-review-2.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v2-reviewed.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `design-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '{type:"step-done", workflow:"design", step:"design-apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-v2-reviewed.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-review"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 6 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [design-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/design-v2-reviewed.md)
   ```

### 🔒 Gate 6 — Apply Review

- [ ] Subagent invoked (`@bkit-design-update`, no inline work)
- [ ] Artifact written (`design-v2-reviewed.md`, non-empty)
- [ ] Verdict extracted and valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `design-apply-review` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 6` section)


---

## 🧠 Step 7 — Design Organise

1. **Subagent:** Invoke `@bkit-design-organise` using `Agent` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/design-v2-reviewed.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v3-organised.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `design-v3-organised.md` until `<!-- verdict:end -->` → extract `Verdict` as `ORGANISE_VERDICT`. **If** `ORGANISE_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-v3-organised.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. **If** `ORGANISE_VERDICT` = FAIL → **Failure Path**.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$ORGANISE_VERDICT" \
     '{type:"step-done", workflow:"design", step:"design-organise", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-v3-organised.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-organise"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 7 — Design Organise - Verdict: {ORGANISE_VERDICT}
   [design-v3-organised.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/design-v3-organised.md)
   ```

### 🔒 Gate 7 — Design Organise

- [ ] Subagent invoked (`@bkit-design-organise`, no inline work)
- [ ] Artifact written (`design-v3-organised.md`, non-empty)
- [ ] Verdict extracted and valid (`ORGANISE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `design-organise` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 7` section)


---

## 🧠 Step 8 — Summary

1. Resolve highest design version: `DESIGN_FINAL=$(ls docs/plans/{YYYYMM}/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`. **If** empty → **Failure Path**.
2. **Subagent:** Invoke `@bkit-design-summary` using `Agent` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `{DESIGN_FINAL}` (highest v{N}), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/design-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/design-summary.md`.
3. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Read `design-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"design", step:"design-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/design-summary.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary bkit [skip ci]"
   ```
6. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`):
   ```bash
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Summary - Verdict: {SUMMARY_VERDICT}
   [design-summary.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/design-summary.md)
   {design-summary.md content verbatim}
   ```
8. Route:
   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 9.
   - **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 8 — Summary

- [ ] Design final resolved (`DESIGN_FINAL` = highest `design-v*.md`)
- [ ] Subagent invoked (`@bkit-design-summary`, no inline work)
- [ ] Artifact written (`design-summary.md`, non-empty)
- [ ] Verdict extracted and valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `design-summary` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 8` section)


---

## 🤖 Step 9 — Design Workstream Issues


**Run only if** uppercase `{LABELS}` contains MILESTONE **and** (`SUMMARY_VERDICT` = PASS **or** CONCERNS).

1. Read `design-v3-organised.md` section `Suggested Workstreams`. For each workstream block `WS-{N}: {NAME}` → extract `{N}`, `{NAME}`, full `Scope` content as `{SCOPE}`, `Requires` values `[]` or `[WS-{N}, ...]` as `{REQUIRES}` , full `Rationale` content as `{RATIONALE}`. Set `WORKSTREAMS` array. **If** zero workstreams parsed → **Failure Path**.
2. `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `milestone.number` as `{MILESTONE_NUMBER}`, `milestone.title` as `{MILESTONE_TITLE}`. **If** `{MILESTONE_NUMBER}` empty → **Failure Path** with `Milestone not set on parent #{ISSUE_ID}`. Then `mcp__github__search_issues({ owner: "{OWNER}", repo: "{REPO}", query: "is:issue milestone:\"{MILESTONE_TITLE}\" in:title WS-", perPage: 100 })` → extract `items` array. Each entry has `number` (user-facing #N), `title`, `state`.
   → `EXISTING` map of `WS-{N}` → `{ id, title }` matched by `^WS-{N}:` prefix in title.
3. Per workstream `WS-{N}` in `WORKSTREAMS`:
   - **If** `EXISTING[WS-{N}]` present → set `{TARGET_ISSUE_ID}` = `EXISTING[WS-{N}].id`.
     `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {TARGET_ISSUE_ID}, body: "{BODY}" })` — NEW comment on `{TARGET_ISSUE_ID}`.
     `{BODY}` = fenced block below:
     ```comment
     ## Workstream Update — {FID}
     **Parent issue:** {ISSUE_ID}
     **Parent design:** [docs/plans/{YYYYMM}/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-design.md)
     **Workstream:** WS-{N} — {NAME}
     **Requires:** {REQUIRES}
     ### Scope
     {SCOPE}
     ### Rationale
     {RATIONALE}
     ```
     Set `WORKSTREAM_ISSUE_ID[WS-{N}]` = `EXISTING[WS-{N}].id`.
   - **Else** → set `{WS_TITLE}` = `WS-{N}: {NAME}`, `{WS_BODY}` = description block below.
       `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{WS_TITLE}", body: "{WS_BODY}", labels: ["bkit:design"], milestone: {MILESTONE_NUMBER} })` → capture `number` as `{WS_ISSUE_ID}`.
     Description block:
     ```description
     ## Workstream Create — {FID}
     **Parent issue:** {ISSUE_ID}
     **Parent design:** [docs/plans/{YYYYMM}/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-design.md)
     **Workstream:** WS-{N} — {NAME}
     **Requires:** {REQUIRES}
     ### Scope
     {SCOPE}
     ### Rationale
     {RATIONALE}
     ```
     Set `WORKSTREAM_ISSUE_ID[WS-{N}]` = `{WS_ISSUE_ID}`. **If** `{WS_ISSUE_ID}` empty → **Failure Path**.
4. **For** each `EXISTING[WS-{K}]` whose `WS-{K}` is NOT in `WORKSTREAMS` → set `{TARGET_ISSUE_ID}` = `EXISTING[WS-{K}].id`.
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {TARGET_ISSUE_ID}, body: "{BODY}" })` — NEW comment on `{TARGET_ISSUE_ID}`.
   `{BODY}` = fenced block below:
   ```comment
   ## Workstream Delete — {FID}
   **Parent issue:** {ISSUE_ID}
   **Parent design:** [docs/plans/{YYYYMM}/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-design.md)
   No longer in current design. Body left unchanged.
   ```
5. **For** each workstream `WS-{N}` with non-empty `Requires` → resolve `{BLOCKED_BY_LIST}` from `[WORKSTREAM_ISSUE_ID[WS-X] for X in Requires]`. **If** any entry empty → **Failure Path**. Set `{ISSUE_ID}` = `{WORKSTREAM_ISSUE_ID[WS-{N}]}` for this call.
   
   Encode blocked-by via issue body marker block:
   1. `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `body` as `{CURRENT_BODY}`.
   2. Compute `{NEW_BODY}`: **If** `{CURRENT_BODY}` contains `<!-- bkit:blocked-by start -->` ... `<!-- bkit:blocked-by end -->` → replace between markers. **Else** → append `\n\n<!-- bkit:blocked-by start -->\n## Blocked by\n{BLOCKED_BY_LIST}\n<!-- bkit:blocked-by end -->` where each `{BLOCKED_BY_LIST}` entry is `- #N` on its own line.
   3. `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{NEW_BODY}" })`.


6. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-workstream-issues", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-workstream-issues"
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Design Workstream Issues
   ```

### 🔒 Gate 9 — Design Workstream Issues

- [ ] Workstreams parsed (`WORKSTREAMS` non-empty)
- [ ] Parent milestone target read (assignment ref resolved)
- [ ] Existing workstreams listed (milestone issues read attempted)
- [ ] Per workstream resolved (`WORKSTREAM_ISSUE_ID` populated, no empty ids)
- [ ] Stale children commented (orphaned workstreams notified)
- [ ] Blocked-by edges attempted (per `Requires`)
- [ ] Workflow status updated (step `design-workstream-issues` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 9` section)


---

## 🤖 Step 10 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Copy final design to canonical bucket:
   ```bash
   YYYYMM=$(date +%Y%m)
   DESIGN_FINAL=$(ls docs/plans/$YYYYMM/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)
   [ -z "$DESIGN_FINAL" ] && { echo "No design version found" >&2; exit 1; }
   CANONICAL="docs/plans/$YYYYMM/{FID}-design.md"
   cp "$DESIGN_FINAL" "$CANONICAL"
   [ -s "$CANONICAL" ] || { echo "Canonical empty: $CANONICAL" >&2; exit 1; }
   ```
2. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"design", step:"design-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"design", at:$t}' >> "$STATUS"
   STATS="$REPO_ROOT/.bkit/stats.jsonl"
   BKIT_VER=$(jq -r '.pinnedVersion // empty' "$REPO_ROOT/.bkit/version" 2>/dev/null); [ -z "$BKIT_VER" ] && BKIT_VER="unknown"
   REPO_SLUG=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]||; s|\.git$||' || echo "unknown/repo")
   jq -nc \
     --arg repo "$REPO_SLUG" \
     --arg bkitVersion "$BKIT_VER" \
     --arg step "design-close-workflow" \
     --arg counterName "DESIGN_ATTEMPT" \
     --argjson counterValue 1 \
     --arg counterSource "model-self-report" \
     --arg parentSha "$PARENT_SHA" \
     '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "design" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
     >> "$STATS" || echo "[bkit-telemetry] append failed: $STATS"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow"
   ```
3. Squash-merge to dev and clean up:
   ```bash
   cd "$REPO_ROOT"
   [ "$(git config --get core.bare)" = "true" ] && [ -d "$REPO_ROOT/.git" ] && git config core.bare false
   DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"
   DEADLINE=$(( $(date +%s) + 600 ))
   until (set -C; printf '%s design {FID}\n' "$(date -u +%FT%TZ)" > "$DEVLOCK") 2>/dev/null; do
     DEVLOCK_MTIME=$(stat -f %m "$DEVLOCK" 2>/dev/null || stat -c %Y "$DEVLOCK" 2>/dev/null || echo 0)
     [ $(( $(date +%s) - DEVLOCK_MTIME )) -ge 900 ] && { rm -f "$DEVLOCK"; continue; }
     [ "$(date +%s)" -ge "$DEADLINE" ] && { echo "dev lock held by: $(cat "$DEVLOCK" 2>/dev/null) — serialise this run or use a separate clone" >&2; exit 1; }
     sleep 10
   done
   trap 'rm -f "$DEVLOCK"' EXIT
   git checkout dev
   [ "$(git branch --show-current)" = "dev" ] || { echo "Not on dev after checkout (on '$(git branch --show-current)') — aborting dev ops" >&2; exit 1; }
   STRAY_MAIN=$(git status --porcelain -uall -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep '^??' || true)
   [ -n "$STRAY_MAIN" ] && { echo "{FID} artifacts written to the main checkout instead of the worktree:" >&2; echo "$STRAY_MAIN" >&2; echo "Move them under .worktrees/{FID}/ or delete them, then re-run." >&2; exit 1; }
   git pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git merge --squash -X ours "feat/{FID}"
   STRAY=$(git diff --cached --name-only | grep -vE '^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$' || true)
   [ -n "$STRAY" ] && { echo "design close-workflow staged non-doc files:" >&2; echo "$STRAY" >&2; exit 1; }
   git add "docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   git commit -m "docs({FID}): design DONE bkit [skip ci]"
   git push origin dev || { echo "dev push failed" >&2; exit 1; }
   git show "dev:docs/plans/$(date +%Y%m)/{FID}-design.md" > /dev/null 2>&1 || { echo "Canonical design missing on dev" >&2; exit 1; }
   git worktree remove "$REPO_ROOT/.worktrees/{FID}" --force
   git branch -D "feat/{FID}" 2>/dev/null || true
   git push origin --delete "feat/{FID}" 2>/dev/null || true
   git worktree prune
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
4. No issue changes.
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.reviewOptionId}" } })`.
5. Build `{ARTIFACTS}` link list:
   ```bash
   RR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)"); BR=dev
   ARTIFACTS=$( { git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/" | grep -E "docs/plans/{YYYYMM}/{FID}-[^/]+$"; git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep -E "/design-[^/]+$"; } | while read -r f; do printf -- '- [%s](https://github.com/{OWNER_REPO}/blob/%s/%s)\n' "$(basename "$f")" "$BR" "$f"; done )
   printf '%s\n' "$ARTIFACTS"
   TELEMETRY=$(bash "$RR/.bkit/scripts/bkit-workflow-telemetry.sh" design {YYYYMM} {FID})
   printf '\n%s\n' "$TELEMETRY"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Close Workflow
   #### Artifacts
   {ARTIFACTS}
   #### Telemetry
   {TELEMETRY}
   ```
7. Final return: Display `design-summary.md` content verbatim as final message to user; do NOT summarise or trim; do NOT auto-invoke. **HARD STOP** — do NOT invoke `/plan`.
   Append issue link [{ISSUE_ID} {TITLE}]({URL})

### 🔒 Gate 10 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Summary verdict confirmed (`SUMMARY_VERDICT` = PASS or CONCERNS)
- [ ] Canonical design copied (`docs/plans/{YYYYMM}/{FID}-design.md`, verified on `dev` post-merge — `{YYYYMM}` = creation month)
- [ ] Workflow status updated (`design` `DONE`, step `design-close-workflow` recorded with `parentSha`)
- [ ] Changes merged to `dev` and pushed with `bkit [skip ci]`
- [ ] Worktree removed and feature branch deleted
- [ ] Final return displayed (`design-summary.md` content verbatim)


- [ ] Issue update attempted (status/state `In Review`, phase label `bkit:design` unchanged)
- [ ] Artifact link list embedded in `Step 10` comment
- [ ] Issue comment attempted (`Step 10` section)

