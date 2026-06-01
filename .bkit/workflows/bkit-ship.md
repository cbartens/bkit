---
description: "Ship Feature — Autonomous merge and archive"
---

# Ship Feature (Workflow 5/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Merge feature PR to default integration branch.

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
> - **Resume:** On start, fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`), `failures`, `attempt`, `strategy` (`STANDARD | PIVOT | FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded status.jsonl: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → **Failure Path**; `IN_PROGRESS` + last step >=30min idle → stale, clean.
> - **Status branch:** Steps 1-7 commit status.jsonl on `feat/{FID}` (`$(git rev-parse --show-toplevel)/.../status.jsonl`); Steps 8-12 append to the dev copy (`$REPO_ROOT/.../status.jsonl`). `dev` commit + push ONCE per run: Close → `docs({FID}): ship DONE bkit [skip ci]`; Failure Path → `chore({FID}): ship FAILED bkit [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.

<!-- bkit:tracker github start -->

> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) + `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-cloud trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.

<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->

> - **Tracker:** Linear via MCP server `linear` (configured in `.mcp.json` `mcpServers.linear`). Tool names: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. All `save_*` writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-cloud trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__linear__save_comment` (with `issueId`, no `id` — creates new comment). NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. No edit-in-place.

<!-- bkit:tracker linear end -->

> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** Reference constant `MAX_MERGE_ATTEMPT` = 3 in retry checks below.
> - **Large Diff Guard:** When a Read line passes `git diff origin/dev..HEAD` to a subagent, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"ship",at:$t}' >> "$STATUS"
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   rm -f "$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
   git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" 2>/dev/null || true
   git -C "$REPO_ROOT" commit -m "chore({FID}): ship FAILED bkit [skip ci]" 2>/dev/null || true
   git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
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
4. **If** failure triggered by max-retry exhaustion (`[ -n "${MAX_VERIFY_ATTEMPT:-}" ]` / `[ -n "${MAX_TEST_ATTEMPT:-}" ]` / `[ -n "${MAX_DEBUG_ATTEMPT:-}" ]` / `[ -n "${MAX_MERGE_ATTEMPT:-}" ]` guards — counters unset before Step 2; do NOT false-evaluate as exceeded) **or** rebase failure sentinel previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
6. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): ship aborted bkit [skip build] bkit [skip ci]"`.
10. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)` — if push fails, do not claim success on Linear.
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
    [ship-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md)
    {FID-ship-handover.md content verbatim}
    ```
    <!-- bkit:tracker true end -->
12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Push or reset before retrying." >&2; exit 1; }
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before ship" >&2; exit 1; }
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if [ -f "$LOCK" ]; then
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
     fi
     rm -f "$LOCK"
   fi
   printf '%s ship\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** divergence check or lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. <!-- bkit:tracker github start -->
   **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:design", "bkit:auto"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `<linear_issue>{ID}</linear_issue>`, `Linear issue: {ID}`, `ISSUE-{ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__linear__save_issue({ title: "{task}", description: "{input}", team: "{LINEAR_TEAM}", assignee: "me", state: "In Progress", labels: ["bkit:design", "bkit:auto"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**. `LINEAR_TEAM` = `bkit.linearTeam` from manifest.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** scan prompt for `<id>{ID}</id>` or `ISSUE-{ID}` → first match → `ISSUE_ID`. **If** no `ID` found → set `ISSUE_ID=""` and log `Tracker not wired — proceeding without issue ID.` Workflow continues with FID derived from branch name.
   <!-- bkit:tracker false end -->
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker github start -->
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open`/`closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`. Then `mcp__linear__list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract comments → `COMMENTS`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   No tracker wired — set `STATE`, `LABELS`, `DESCRIPTION`, `COMMENTS` all empty; the input artifact is built from the session prompt alone.
   <!-- bkit:tracker false end -->
6. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
7. **If** NO `FID` → create `FID` from `{ISSUE_ID}` + kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set.
   <!-- bkit:tracker github start -->
   Format `{ISSUE_ID}-{slug}` — slug <=3 tokens, kebab, lowercase, no stopwords. Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Format `{ISSUE_ID}-{slug}` — slug <=3 tokens, kebab, lowercase, no stopwords. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   Format `{ISSUE_ID}-{slug}` if `ISSUE_ID` set, else `{branch-suffix}-{slug}`. Slug <=3 tokens, kebab, lowercase. No strict regex assert.
   <!-- bkit:tracker false end -->
8. <!-- bkit:tracker github start -->

   Add `bkit:ship` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->

   Add `bkit:ship` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker github start -->

   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.

   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->

   No-op (log `Board status carried by issue state — no separate update.`).
   <!-- bkit:tracker linear end -->

9. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ## Ship Workflow
   ### Step 1 — Start Workflow
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`)
- [ ] `ISSUE_ID` resolved (non-empty when tracker wired; may be empty under `none`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
<!-- bkit:tracker true start -->
- [ ] Issue update attempted (phase label `bkit:ship`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add docs/ .bkit/friction.md
     git diff --cached --quiet || git commit -m "chore({FID}): pre-worktree uncommitted changes bkit [skip build] bkit [skip ci]"
   fi
   ```
2. Create/resume the worktree:
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
4. **If** `BRANCH` NOT `dev` **and** does NOT contain `{FID}` **and** does NOT contain `{ISSUE_ID}` (case-insensitive) → **Failure Path**.
5. `gh pr list --head "$(git branch --show-current)" --json number,baseRefName --jq '.[0]'` → extract `PR_NUMBER` and `PR_BASE`. **If** `PR_NUMBER` empty → **Failure Path**. **If** `PR_BASE` != dev → **Failure Path**. Set `MERGE_ATTEMPT` = 0.
6. `gh pr view {PR_NUMBER} --json statusCheckRollup` → assert call succeeds. **If** query errors **or** any check failed **or** rollup empty → **Failure Path**.
7. Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
8. Update status and commit:
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
   if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "ship" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-started", workflow:"ship", at:$t}' >> "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-input.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
9. <!-- bkit:tracker github start -->
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
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] On branch that passed eligibility
- [ ] Counters initialised (`PR_NUMBER` non-empty, `MERGE_ATTEMPT` = 0)
- [ ] PR base verified (`PR_BASE` = dev)
- [ ] No PR CI failures confirmed
- [ ] Artifact written (`ship-input.md`, non-empty)
- [ ] Workflow status updated (`ship` `IN_PROGRESS`, steps `ship-start-workflow` and `ship-worktree-setup` recorded with `parentSha`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 2` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 3 — Regression Guard

1. Resolve current and prior CI runs and assert no previously-failing CI step is now `skipped`, `cancelled` or missing:
   ```bash
   BRANCH_NAME=$(git branch --show-current)
   HEAD_SHA=$(gh pr view {PR_NUMBER} --json headRefOid --jq '.headRefOid')
   CURRENT_RUN_ID=$(gh run list --branch "$BRANCH_NAME" --workflow CI --limit 5 \
     --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId // \"\"")
   PRIOR_RUN_ID=$(gh run list --branch "$BRANCH_NAME" --workflow CI --status failure --limit 25 \
     --json databaseId,createdAt --jq "[.[] | select((.databaseId | tostring) != \"$CURRENT_RUN_ID\")] | sort_by(.createdAt) | reverse | .[0].databaseId // \"\"")
   REGRESSION_VERDICT=PASS
   if [ -z "$CURRENT_RUN_ID" ]; then
     REGRESSION_VERDICT=FAIL
   elif [ -n "$PRIOR_RUN_ID" ]; then
     PRIOR_FAILED_STEPS=$(gh run view "$PRIOR_RUN_ID" --json jobs \
       --jq '[.jobs[].steps[] | select(.conclusion == "failure") | .name] | unique | join("\n")')
     CURRENT_STEPS_JSON=$(gh run view "$CURRENT_RUN_ID" --json jobs --jq '[.jobs[].steps[] | {name, conclusion}]')
     while IFS= read -r STEP; do
       [ -z "$STEP" ] && continue
       CONCLUSION=$(echo "$CURRENT_STEPS_JSON" | jq -r --arg n "$STEP" '[.[] | select(.name == $n)] | .[0].conclusion // "missing"')
       if [ "$CONCLUSION" != "success" ]; then
         REGRESSION_VERDICT=FAIL
       fi
     done <<< "$PRIOR_FAILED_STEPS"
   fi
   ```
   **If** `REGRESSION_VERDICT` = FAIL → **Failure Path**.
2. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REGRESSION_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-regression-guard", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): regression-guard"
   ```
3. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Regression Guard - Verdict: {REGRESSION_VERDICT}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 3 — Regression Guard

- [ ] `CURRENT_RUN_ID` resolved from PR HEAD SHA
- [ ] `PRIOR_RUN_ID` resolved or no prior failed CI run on branch
- [ ] Previously-failing CI steps re-asserted in current run
- [ ] Verdict determined (`REGRESSION_VERDICT`)
- [ ] Verdict valid (`REGRESSION_VERDICT` in `PASS|FAIL`)
- [ ] Workflow status updated (step `ship-regression-guard` recorded with `parentSha`, `verdict`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 3` section)
<!-- bkit:tracker true end -->

---

## 🧠 Step 4 — Conflict Resolve

**Run only if:** Sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` exists after Step 2.

1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
   Context: You are a subagent in the Ship phase. Lockfile-only fast-path already attempted and did not match. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`.
   Update: Conflicted source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `ship-conflict-resolve.md` until `<!-- verdict:end -->` → extract `Verdict` as `RESOLVE_VERDICT`.
4. **If** `RESOLVE_VERDICT` = PASS → `rm -f "docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"`. **Else** → **Failure Path**.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$RESOLVE_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-conflict-resolve", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): conflict-resolve"
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
   ### Step 4 — Conflict Resolve - Verdict: {RESOLVE_VERDICT}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 4 — Conflict Resolve

- [ ] Subagent invoked (`@bkit-ship-conflict-resolve`, no inline work)
- [ ] Artifact written (`ship-conflict-resolve.md`, non-empty)
- [ ] Verdict extracted (`RESOLVE_VERDICT`)
- [ ] Verdict valid (`RESOLVE_VERDICT` in `PASS|FAIL`)
- [ ] Sentinel cleared on PASS
- [ ] Workflow status updated (step `ship-conflict-resolve` recorded with `parentSha`, `verdict`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 4` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 5 — Merge PR

1. Increment `MERGE_ATTEMPT` + 1.
2. Inspect `dev` branch state and auto-commit any dirty paths before squash-merge:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   if [ -n "$(git -C "$REPO_ROOT" status --porcelain | grep -v '^??')" ]; then
     git -C "$REPO_ROOT" status --short
     git -C "$REPO_ROOT" add -- ':(exclude).DS_Store' ':(exclude)*.log' ':(exclude)*.swp' ':(exclude)node_modules'
     git -C "$REPO_ROOT" commit -m "chore: pre-merge uncommitted dev changes bkit [skip build] bkit [skip ci]"
   fi
   ```
3. Run HEAD-Subject Assertion:
   ```bash
   PR_TITLE=$(gh pr view {PR_NUMBER} --json title --jq .title)
   if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]|\[skip build\]'; then
     echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2
     echo "Fix: remove the suppressing tag from the PR title. Use 'bkit [force build]' if a Vercel-only skip is needed." >&2
     exit 1
   fi
   ```
   **If** assertion fails → **Failure Path**.
4. Merge with empty body:
   ```bash
   (
     cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
     gh pr merge {PR_NUMBER} --squash --delete-branch \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
       --body ""
   )
   PUSH_AT=$(date -u +%s)
   sleep 30
   RUN_ID=$(gh run list --branch dev --limit 5 \
     --json databaseId,createdAt,workflowName \
     --jq "[.[] | select((.createdAt | fromdateiso8601) > $PUSH_AT - 60)][0].databaseId")
   [ -z "$RUN_ID" ] && { echo "CI did not trigger on dev after merge at $PUSH_AT" >&2; exit 1; }
   ```
5. `gh pr view {PR_NUMBER} --json state` → extract `state`.
6. Set `MERGE_VERDICT` = PASS if `state` = MERGED, else FAIL. Set `MERGE_FAILURES` = 0 if PASS, else 1.
7. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$MERGE_VERDICT" --argjson a "$MERGE_ATTEMPT" --argjson f "$MERGE_FAILURES" \
     '{type:"step-done", workflow:"ship", step:"ship-merge-pr", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): merge-pr attempt ${MERGE_ATTEMPT}"
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
   ### Step 5 — Merge PR - Verdict: {MERGE_VERDICT}
   ```
   <!-- bkit:tracker true end -->
9. **If** `state` = MERGED → Step 8.
10. **If** `state` != MERGED:
    - **If** `MERGE_ATTEMPT` <= `MAX_MERGE_ATTEMPT` → Step 6.
    - **Else** → **Failure Path**.
11. **Else** → **Failure Path**.

### 🔒 Gate 5 — Merge PR

- [ ] `MERGE_ATTEMPT` incremented
- [ ] HEAD-Subject Assertion passed
- [ ] PR merge attempted
- [ ] `state` extracted (MERGED or not)
- [ ] CI run triggered on dev (`RUN_ID` captured)
- [ ] Verdicts extracted (`MERGE_VERDICT`, `MERGE_FAILURES`)
- [ ] Verdict valid (`MERGE_VERDICT` in `PASS|FAIL`)
- [ ] HEAD on remote does NOT contain `bkit [skip ci]`
- [ ] Workflow status updated (step `ship-merge-pr` recorded with `parentSha`, `verdict`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 5` section)
<!-- bkit:tracker true end -->

---

## 🧠 Step 6 — Failure Diagnose

**Run only if** `state` != MERGED.

1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `ship-failure-diagnose-{MERGE_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$MERGE_ATTEMPT" \
     '{type:"step-done", workflow:"ship", step:"ship-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-'"${MERGE_ATTEMPT}"'.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${MERGE_ATTEMPT}"
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
   ### Step 6 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Attempt: {MERGE_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 6 — Failure Diagnose

- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted (`DIAGNOSE_VERDICT`)
- [ ] Verdict valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`)
- [ ] Workflow status updated (step `ship-failure-diagnose` recorded with `parentSha`, `verdict`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 6` section)
<!-- bkit:tracker true end -->

---

## 🧠 Step 7 — Failure Remediate

**Run only if** `state` != MERGED.

1. Read status.jsonl and extract `PRIOR_STRATEGY`:
   ```bash
   FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
   PRIOR_STRATEGY=$(jq -s -r --arg s "failure-remediate" "$FOLD"' fold | [.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""' \
     "$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl")
   ```
2. Set next `STRATEGY`:
   - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
   - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
   - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
   - **Else** → **Failure Path**.
3. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Strategy: `{STRATEGY}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `ship-failure-remediate-{MERGE_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
6. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$MERGE_ATTEMPT" --arg strat "$STRATEGY" \
     '{type:"step-done", workflow:"ship", step:"ship-failure-remediate", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-'"${MERGE_ATTEMPT}"'-log.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-remediate attempt ${MERGE_ATTEMPT}"
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
   ### Step 7 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Strategy: {STRATEGY} - Attempt: {MERGE_ATTEMPT}
   ```
   <!-- bkit:tracker true end -->
8. **Re-run Step 5**.

### 🔒 Gate 7 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`ship-failure-remediate-{MERGE_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict and strategy extracted (`REMEDIATE_VERDICT`, `STRATEGY`)
- [ ] Workflow status updated (step `ship-failure-remediate` recorded with `parentSha`, `verdict`, `strategy`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 7` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 8 — Switch to Dev

**Run only if** `state` = MERGED.

1. Switch to `dev` and fast-forward:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   cd "$REPO_ROOT"
   [ "$(git config --get core.bare)" = "true" ] && [ -d "$REPO_ROOT/.git" ] && git config core.bare false
   git checkout dev
   [ "$(git branch --show-current)" = "dev" ] || { echo "Not on dev after checkout (on '$(git branch --show-current)') — aborting dev ops" >&2; exit 1; }
   git fetch origin dev
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   if [ "$AHEAD" -gt 0 ]; then
     AHEAD_NON_SKIP=$(git log --format=%s origin/dev..dev | grep -cv '\[skip ci\]' || true)
     [ "$AHEAD_NON_SKIP" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev (non-skip-ci). Manual reconciliation required." >&2; exit 1; }
     git pull --rebase origin dev
     git push origin dev
   else
     git pull --ff-only origin dev
   fi
   pnpm install --frozen-lockfile
   ```
   **If** exit non-zero → **Failure Path**.
2. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-switch-to-dev", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
3. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Switch to Dev
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 8 — Switch to Dev

- [ ] On `dev` branch
- [ ] `dev` up to date with origin
- [ ] Workflow status updated (step `ship-switch-to-dev` recorded with `parentSha`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 8` section)
<!-- bkit:tracker true end -->

---

## 🧠 Step 9 — Update Docs & Summary

**Run only if** `state` = MERGED.

1. `git log origin/dev --oneline | head -5` → **If** NO squash SHA → **Failure Path**.
2. Assert `FID` non-empty before any path operations.
3. Launch both subagents in parallel using `Agent` tool. Plan/design artifacts are already at their canonical `docs/plans/{YYYYMM}/` location — no archive step needed:
   - **Subagent:** Invoke `@bkit-ship-update-docs`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
     Update: Doc files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
   - **Subagent:** Invoke `@bkit-ship-summary`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-*.md` (excluding `ship-update-docs.md`), `gh pr view {PR_NUMBER} --json title,body,additions,deletions,changedFiles,commits,mergedAt`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md`.
4. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Derive `UPDATE_DOCS_VERDICT`:
   ```bash
   COMPLETED_HIT=$(grep -c "docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/.*{FID}" docs/completed.md || echo 0)
   if [ "$COMPLETED_HIT" -gt 0 ]; then UPDATE_DOCS_VERDICT=PASS; else UPDATE_DOCS_VERDICT=FAIL; fi
   ```
   Read `ship-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg uv "$UPDATE_DOCS_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-update-docs", status:"DONE", verdict:$uv, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md"]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg sv "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-summary", status:"DONE", verdict:$sv, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "docs({FID}): update-docs-summary"
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
   ### Step 9 — Update Docs & Summary - Verdict: {SUMMARY_VERDICT} - Docs: {UPDATE_DOCS_VERDICT}
   [ship-summary.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md)
   {FID-ship-summary.md content verbatim}
   ```
   <!-- bkit:tracker true end -->
8. Read `Recommended Next Step` section from `docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` → extract `{NEXT_STEP}` without heading. **If** missing → set `{NEXT_STEP}` = `No next-step recommendation`.
9. Final return: Present `{NEXT_STEP}` verbatim in final message to user — do NOT auto-invoke.
10. **If** `UPDATE_DOCS_VERDICT` **and** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 10.
11. **If** `UPDATE_DOCS_VERDICT` = FAIL → **Failure Path**.
12. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
13. **Else** → **Failure Path**.

### 🔒 Gate 9 — Update Docs & Summary

- [ ] Squash SHA verified on `origin/dev`
- [ ] Plans canonical at `docs/plans/{YYYYMM}/` (no archive step; created at design start)
- [ ] Subagents invoked (`@bkit-ship-update-docs`, `@bkit-ship-summary`, no inline work)
- [ ] Artifact written (`ship-update-docs.md`, non-empty)
- [ ] Artifact written (`ship-summary.md`, non-empty)
- [ ] Verdicts extracted (`UPDATE_DOCS_VERDICT`, `SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (steps `ship-update-docs`, `ship-summary` recorded with `parentSha`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 9` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 10 — Prune Skills

**Run only if** `state` = MERGED.

1. Prune feature-specific skills — uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via the CLI (keeps `skills-lock.json` and `package.json` in sync):
   ```bash
   for skill_dir in .agents/skills/*/; do
     skill=$(basename "$skill_dir")
     grep -q "$skill" .agents/skills.md || npx skills remove "$skill" -y
   done
   ```
2. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   git status --short
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-prune-skills", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): prune-skills"
   ```
3. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Prune Skills
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 10 — Prune Skills

- [ ] Feature-specific skills pruned
- [ ] Logs at `docs/plans/{YYYYMM}/logs/{FID}/` retained for manual cleanup
- [ ] Workflow status updated (step `ship-prune-skills` recorded with `parentSha`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 10` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 11 — Worktree Cleanup

**Run only if** `state` = MERGED.

1. Remove the feature worktree:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
   if [ -d "$WORKTREE_PATH" ]; then
     git worktree remove "$WORKTREE_PATH" --force
     git worktree prune
   fi
   ```
2. Delete local feature branch:
   ```bash
   git branch -D "feat/{FID}" 2>/dev/null || true
   ```
3. Delete remote feature branch and prune tracking ref:
   ```bash
   git push origin --delete "feat/{FID}" 2>/dev/null || true
   git fetch --prune origin 2>/dev/null || true
   ```
4. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-worktree-cleanup", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
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
   ### Step 11 — Worktree Cleanup
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 11 — Worktree Cleanup

- [ ] Worktree removed (`.worktrees/{FID}`, or was already absent)
- [ ] `git worktree prune` executed
- [ ] Local `feat/{FID}` branch deleted (or already absent)
- [ ] Remote `origin/feat/{FID}` branch deleted (or already absent)
- [ ] Workflow status updated (step `ship-worktree-cleanup` recorded with `parentSha`)
<!-- bkit:tracker true start -->
- [ ] Issue comment attempted (`Step 11` section)
<!-- bkit:tracker true end -->

---

## 🤖 Step 12 — Close Workflow

1. Sweep `.bkit/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
2. Assert squash-merge CI run completed `bkit-tests`:
   ```bash
   SQUASH_SHA=$(gh pr view {PR_NUMBER} --json mergeCommit --jq .mergeCommit.oid)
   RUN=$(gh run list --branch dev --commit "$SQUASH_SHA" --json databaseId,status,conclusion --limit 1)
   RUN_ID=$(echo "$RUN" | jq -r '.[0].databaseId // empty')
   [ -z "$RUN_ID" ] && { echo "No CI run found for squash merge $SQUASH_SHA — feature merge not test-validated" >&2; exit 1; }
   RUN_CONCLUSION=$(echo "$RUN" | jq -r '.[0].conclusion // empty')
   [ "$RUN_CONCLUSION" = "cancelled" ] && { echo "CI run $RUN_ID for squash merge $SQUASH_SHA was cancelled — feature merge not test-validated" >&2; exit 1; }
   [ "$RUN_CONCLUSION" = "failure" ] && { echo "CI run $RUN_ID for squash merge $SQUASH_SHA concluded failure — feature merge not test-validated" >&2; exit 1; }
   TESTS_CONCLUSION=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select(.name | test("test"; "i"))][0].conclusion // empty')
   [ "$TESTS_CONCLUSION" = "failure" ] && { echo "bkit-tests job failed on CI run $RUN_ID for squash merge $SQUASH_SHA — feature merge is red" >&2; exit 1; }
   [ "$TESTS_CONCLUSION" = "skipped" ] && { echo "bkit-tests job skipped on CI run $RUN_ID for squash merge $SQUASH_SHA — feature merge not test-validated" >&2; exit 1; }
   ```
   **If** exit non-zero → **Failure Path**.
3. Update status, batch-commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"ship", at:$t}' >> "$STATUS"
   git -C "$REPO_ROOT" add -A
   git -C "$REPO_ROOT" commit --allow-empty -m "docs({FID}): ship DONE bkit [skip ci]"
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
4. <!-- bkit:tracker github start -->

   Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed` if present → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`. Do NOT close the issue.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->

   Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed` if present → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`. Do NOT set Done.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker github start -->

   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.reviewOptionId}" } })`.

   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->

   No-op (log `Board status carried by issue state — no separate update.`).
   <!-- bkit:tracker linear end -->

5. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 12 — Close Workflow
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 12 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] All documents archived and logs retained for manual cleanup
- [ ] Worktree cleaned up
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Squash-merge CI run completed `bkit-tests` (not cancelled, not failed, not skipped)
- [ ] Workflow status updated (`ship` `DONE`, step `ship-close-workflow` recorded with `parentSha`)
- [ ] Changes pushed to `dev` with `bkit [skip ci]`
<!-- bkit:tracker true start -->
- [ ] Issue update attempted (phase label `bkit:merged`, status/state `In Review`; issue left open for human close)
- [ ] Issue comment attempted (`Step 12` section)
<!-- bkit:tracker true end -->
