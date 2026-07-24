---
description: "Plan Feature — Autonomous plan generation"
---

# Plan Feature (Workflow 2/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create plan in `docs/plans/{YYYYMM}/` (canonical month bucket, discovered or set at start) — no code, no execution.

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
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, `{WORKTREE_PATH}`, etc non-empty before tool calls (`{ISSUE_ID}` / `{STATE}` / `{LABELS}` only when tracker wired — empty under `none`; `{WORKTREE_PATH}` = absolute path set at worktree setup — mint mode (`CAN_WORKTREE=true`): `.worktrees/{FID}`; adopt mode (`CAN_WORKTREE=false`): `$REPO_ROOT`; required for subagent `Context` cwd). **Else** → **Failure Path**. `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/` (existing) or `date +%Y%m` (fresh start). `{PARENT_YYYYMM}` discovered similarly from `{PARENT_FID}`.
> - **Resume:** On start, fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`), `failures`, `attempt`, `strategy` (`STANDARD | PIVOT | FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded status.jsonl: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` and last step <30min idle → **Failure Path**; `IN_PROGRESS` and last step >=30min idle → stale, clean. **Dev lock:** hold `$REPO_ROOT/.bkit/.dev.lock` across every dev critical section (checkout / stage / commit / push of `dev` in the main checkout); acquire with `set -C`, release via `trap ... EXIT`.
> - **Status branch:** plan status.jsonl is committed on `{BRANCH}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, NO mid-lifecycle `dev` push. State reaches `dev` once via the Close Workflow's PR merge (D5(a) — gh-primary / `merge_pull_request`-fallback) → `docs({FID}): plan DONE` (no `[skip ci]` — §6d/OQ-D: the token would otherwise land as the PR title and fail the PR-title assertion; this is a knowing CI-cost reversal — the docs-only close now fires full CI on `dev`). Failure Path appends `workflow-failed` to the retained worktree copy (NO `dev` push); the tracker comment carries the failure signal.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}` (mint mode, `CAN_WORKTREE=true`) or adopts the current branch in place (`CAN_WORKTREE=false` → `WORKTREE_PATH=$REPO_ROOT`, no `git worktree add`); cwd persists across subsequent Bash calls. **If** step ever finds `pwd` != `{WORKTREE_PATH}` → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, bare `git push --force`, and ANY force-push to `dev` / `main`. **ALLOWED** as the Step 2 rebase companion: `git push --force-with-lease` to the personal `feat/{FID}` / `fix/{FID}` branch ONLY. Pre `git push`: assert `{BRANCH}` non-empty; never force-push a shared branch.
> - **gh→MCP fallback (#341 Flow 6, D4/D12/D13 — centrepiece change):** `gh` stays primary for the PR/CI/merge surface. **If** a gh command in that surface fails/errors while `GH_OK=false` (read from this run's `runtime-resolved` `status.jsonl` row, D21 — re-probing `gh` per block is prohibited) → use the mapped MCP tool: `gh repo view --json nameWithOwner`->`get_me` + parse `git remote` (identity); `gh pr create`->`create_pull_request`; `gh pr view {N} --json …`->`pull_request_read` (method `get`, minimal fields); `gh pr list --head X`->`list_pull_requests`; `gh pr merge {N} --squash`->`merge_pull_request` (**MUST** pass an explicit skip-token-free `commit_message`, D1); `gh pr edit {N} --title`->`update_pull_request`; `gh pr update-branch {N}`->`update_pull_request_branch`; `gh run list --branch X`->`actions_list`; `gh run view {id} --json jobs`->`actions_get`; `gh run view --log-failed`->`get_job_logs` (`failed_only=true`; standing default for the Playwright seam, OQ-B); `gh run download -n playwright-report`->`actions_get`'s `download_workflow_run_artifact` method (output shape verified live, T16 — fall back to `get_job_logs` until confirmed). The `actions_*`/`get_job_logs`/`download_workflow_run_artifact` names require the `actions` MCP toolset (C1, `.mcp.json`). Bounded to **max 1 gh->MCP transition per workflow run** — a DIFFERENT budget from a shape-A `push_files`/PR-close docs transport (that is a fallback for _git_, not _gh_, and does not count here). Record every transition via `bkit_transport_fallback_row FROM TO REASON ASSERTED_BY AT` appended to `status.jsonl`; success-assert with an **independent re-read** (MCP has no exit code — "the tool returned something" != "it worked"); retry with a mechanical backoff between attempts; request minimal output. **An empty/zero MCP read is INCONCLUSIVE, never authoritative absence** — corroborate with a second MCP signal (a `list_*` call) or report unavailable, logging the corroboration attempt as its OWN distinguishable state, never folded into "corroborated"/"unavailable" (D12). Trackers (issue/comment/label/projects) stay on MCP always (§6i) — this rule covers ONLY the gh-covered PR/CI/merge surface; never invent a `gh` read-path for trackers.

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

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   STATUS="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$STATUS" ] || STATUS="$REPO_ROOT/$REL"
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"plan",at:$t}' >> "$STATUS"
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
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
4. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && YYYYMM=$(date +%Y%m)
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if ! (set -C; printf '%s plan\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
     LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
     SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"
     . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
     if [ -f "$SRC" ]; then
       LAST=$(jq -s --arg w "$LOCK_WORKFLOW" "$BKIT_STATUS_FOLD"' fold | [.[] | select(.workflow==$w)] | last' "$SRC" 2>/dev/null || echo 'null')
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
     (set -C; printf '%s plan\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null || { echo "Lock contended for {FID}" >&2; exit 1; }
   fi
   ```
   **If** lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker github start -->
   Extract from session prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:plan"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Extract from session prompt: `<id>{ID}</id>`, `<linear_issue>{ID}</linear_issue>`, `Linear issue: {ID}`, `ISSUE-{ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__linear__save_issue({ title: "{task}", description: "{input}", team: "{LINEAR_TEAM}", assignee: "me", state: "In Progress", labels: ["bkit:plan"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**. `LINEAR_TEAM` = `bkit.linearTeam` from manifest.
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
6. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
7. **If** NO `FID` → create `FID` from `{ISSUE_ID}` and kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set. Format `{ISSUE_ID}-{slug}`.
   <!-- bkit:tracker github start -->
   Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Lowercase `{ISSUE_ID}`. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker false start -->
   `ISSUE_ID` unset → `{branch-suffix}-{slug}`. No strict regex assert.
   <!-- bkit:tracker false end -->
8. Extract parent design `FID` from issue `DESCRIPTION` as `PARENT_FID`.
9. <!-- bkit:tracker github start -->
   Add `bkit:plan` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Add `bkit:plan` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker github start -->
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   No-op (log `Board status carried by issue state — no separate update.`).
   <!-- bkit:tracker linear end -->
10. <!-- bkit:tracker github start -->
    `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker github end -->
    <!-- bkit:tracker linear start -->
    `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
    <!-- bkit:tracker linear end -->
    <!-- bkit:tracker true start -->
    `{BODY}` = fenced block below:
    ```comment
    ## Plan Workflow
    ### Step 1 — Start Workflow
    [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
    Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/main/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}
    ```
    <!-- bkit:tracker true end -->

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`)
- [ ] Issue ID resolved (`ISSUE_ID` non-empty when tracker wired; may be empty under `none`)
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] Parent FID extraction attempted (`PARENT_FID`, from issue description)

<!-- bkit:tracker true start -->

- [ ] Issue update attempted (phase label `bkit:plan`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch — NEVER push:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl
     git diff --cached --quiet -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl \
       || git commit -m "chore({FID}): pre-worktree uncommitted changes" -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl
   fi
   ```
   **If** primary checkout dirty / unpushed → NOT blocker; do NOT stash, clean, or route to **Failure Path** → create `feat/{FID}` branch off `origin/dev` instead (never `main` / current branch).
2. Create/resume the worktree (adopt-or-mint, D7/Flow 2 — `CAN_WORKTREE` is env-only, free to re-derive per block, D21):
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_runtime_detect "$REPO_ROOT" "{FID}" || { echo "[bkit-runtime] runtime detect failed" >&2; exit 2; }
   bkit_runtime_assert_resolved || exit 2
   if [ "$CAN_WORKTREE" = "true" ]; then
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
   else
     # Adopt mode (CAN_WORKTREE=false, e.g. claude.ai cloud sessions): no
     # `git worktree add` — mode 3's proxy-restricted push only allows the
     # CURRENT working branch, so work in place on it instead of minting.
     WORKTREE_PATH="$REPO_ROOT"
     cd "$WORKTREE_PATH"
     [ "$(git branch --show-current)" != "dev" ] || { echo "Adopt mode: current branch is dev — refusing to work in place on dev" >&2; exit 1; }
     mkdir -p docs/plans/{YYYYMM}/logs/{FID}/
   fi
   # Emit the durable `runtime-resolved` row NOW (same block as `bkit_runtime_detect`,
   # D21 — later blocks read this row back instead of re-probing gh; #341 T16 fix for
   # the never-emitted gap in docs/failures.jsonl key runtime-resolved-row-never-emitted-step1).
   bkit_runtime_row plan "$(date -u +%FT%TZ)" >> "docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   ```
3. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
4. Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md` = session prompt + `DESCRIPTION` + `COMMENTS`. **If** `PARENT_FID` empty → standalone, do NOT append. **Else** append `docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md`; missing file → **Failure Path**.
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
   . "$WT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   LATEST=$(jq -s "$BKIT_STATUS_FOLD"' fold | (.[-1] // {}) | {workflow, status}' "$STATUS" 2>/dev/null || echo '{}')
   if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "plan" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" --arg p "$(git rev-parse HEAD 2>/dev/null || echo '')" '{type:"workflow-started", workflow:"plan", at:$t, parentSha:$p}' >> "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"plan", step:"plan-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"plan", step:"plan-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-input.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
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
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   [docs/plans/{YYYYMM}/logs/{FID}/status.jsonl](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (mint: `.worktrees/{FID}`; adopt: `WORKTREE_PATH=$REPO_ROOT`), `pwd` == `{WORKTREE_PATH}`
- [ ] Branch non-empty (`BRANCH`, updated to worktree branch)
- [ ] Artifact written (`plan-input.md`, non-empty)
- [ ] Parent design appended (if present)
- [ ] Workflow status updated (`plan` `IN_PROGRESS`, steps `plan-start-workflow` and `plan-worktree-setup` recorded with `parentSha`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 2` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 3 — Generate Plan

1. **Subagent:** Invoke `@bkit-plan-generate` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"plan", step:"plan-generate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): generate-plan"
   ```
4. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Generate Plan
   [plan-v1-draft.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 3 — Generate Plan

- [ ] Subagent invoked (`@bkit-plan-generate`, no inline work)
- [ ] Artifact written (`plan-v1-draft.md`, non-empty)
- [ ] No PENDING placeholders remain (`plan-v1-draft.md`)
- [ ] Workflow status updated (step `plan-generate` recorded with `parentSha`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 3` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 4 — Fetch Context

1. `{QUERY}` = 3–6 keywords from `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md` (touched surfaces + feature nouns, no stopwords), space-separated. Derived here — tracker-independent — so the local-ledger scans below still have a query when no tracker is connected.
2. <!-- bkit:tracker github start -->
   `mcp__github__search_issues({ owner: "{OWNER}", repo: "{REPO}", query: "{QUERY} in:title,body", perPage: 15, sort: "updated", order: "desc" })` → top 15 `items`, drop any whose `number` == `{ISSUE_ID}`, keep first 10 → per hit `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {number} })` → write `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` → per hit `## #{number} — {title} ({state})` heading, the `body` from `items`, every comment verbatim; 0 hits → `None.`; on call error / timeout → `Search unavailable.`
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__list_issues({ query: "{QUERY}", team: "{LINEAR_TEAM}", limit: 15, orderBy: "updatedAt desc" })` → drop any whose `identifier` == `{ISSUE_ID}`, keep first 10 → per hit `mcp__linear__list_comments({ issueId: "{identifier}", orderBy: "createdAt desc", limit: 250 })` → write `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` → per hit `## {identifier} — {title} ({state.name})` heading, the `description` from `items`, every comment verbatim; 0 hits → `None.`; on call error / timeout → `Search unavailable.`
   <!-- bkit:tracker linear end -->
3. Scan `docs/deferrals.jsonl` for `{QUERY}` overlaps → write `docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md` (matching lines verbatim; a line matches when it contains >=2 distinct query terms, or the sole term when only one — reduces single-common-word noise; case-insensitive substring; 0 matches / file absent → `None.`):
   ```bash
   TERMS='{QUERY}'
   OUT="docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md"
   SRC="docs/deferrals.jsonl"
   if [ -f "$SRC" ]; then
     M=$(awk -v terms="$TERMS" 'BEGIN{n=split(tolower(terms),t,/[ ]+/); min=(n>=2?2:1)} {l=tolower($0); c=0; for(i=1;i<=n;i++) if(t[i]!="" && index(l,t[i])) c++; if(c>=min) print}' "$SRC")
     if [ -n "$M" ]; then printf '%s\n' "$M" > "$OUT"; else printf 'None.\n' > "$OUT"; fi
   else
     printf 'None.\n' > "$OUT"
   fi
   ```
4. Scan `docs/failures.jsonl` with the same rule → write `docs/plans/{YYYYMM}/logs/{FID}/related-failures.md`:
   ```bash
   TERMS='{QUERY}'
   OUT="docs/plans/{YYYYMM}/logs/{FID}/related-failures.md"
   SRC="docs/failures.jsonl"
   if [ -f "$SRC" ]; then
     M=$(awk -v terms="$TERMS" 'BEGIN{n=split(tolower(terms),t,/[ ]+/); min=(n>=2?2:1)} {l=tolower($0); c=0; for(i=1;i<=n;i++) if(t[i]!="" && index(l,t[i])) c++; if(c>=min) print}' "$SRC")
     if [ -n "$M" ]; then printf '%s\n' "$M" > "$OUT"; else printf 'None.\n' > "$OUT"; fi
   else
     printf 'None.\n' > "$OUT"
   fi
   ```
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"plan", step:"plan-fetch-context", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/related-issues.md","docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md","docs/plans/{YYYYMM}/logs/{FID}/related-failures.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): fetch-context"
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
   ### Step 4 — Fetch Context
   [related-issues.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/related-issues.md)
   [related-deferrals.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md)
   [related-failures.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/related-failures.md)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 4 — Fetch Context

- [ ] Related-issues search attempted when a tracker is connected (or `None` / `Search unavailable`)
- [ ] Artifacts written (`related-deferrals.md`, `related-failures.md`; `related-issues.md` when a tracker is connected)
- [ ] Workflow status updated (step `plan-fetch-context` recorded with `parentSha`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 4` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 5 — Review Plan

1. Launch all three subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-plan-review-1`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-failures.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md`.
   - **Subagent:** Invoke `@bkit-plan-review-2`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-failures.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md`.
   - **Subagent:** Invoke `@bkit-plan-review-3`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-failures.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md`.
2. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-review-1.md`, `plan-review-2.md`, and `plan-review-3.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `REVIEW_VERDICT` = worst of the three (`FAIL > CONCERNS > PASS`) and `REVIEW_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" --argjson f "$REVIEW_FAILURES" \
     '{type:"step-done", workflow:"plan", step:"plan-review", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md","docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md","docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): review-plan"
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
   ### Step 5 — Review Plan - Verdict: {REVIEW_VERDICT} - Failures: {REVIEW_FAILURES}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 5 — Review Plan

- [ ] Subagents invoked (`@bkit-plan-review-1`, `@bkit-plan-review-2`, `@bkit-plan-review-3`, no inline work)
- [ ] Artifacts written (`plan-review-1.md`, `plan-review-2.md`, `plan-review-3.md`, non-empty)
- [ ] Verdict extracted and valid, failures extracted (`REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`; `REVIEW_FAILURES`)
- [ ] No PENDING placeholders remain (`plan-review-1.md`, `plan-review-2.md`, `plan-review-3.md`)
- [ ] Workflow status updated (step `plan-review` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 5` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 6 — Apply Review

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying review critiques. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Input critiques carry distinct lenses — merge across them, max-wins on CRITICAL findings.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '{type:"step-done", workflow:"plan", step:"plan-apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-review"
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
   ### Step 6 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [plan-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 6 — Apply Review

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Artifact written (`plan-v2-reviewed.md`, non-empty)
- [ ] Verdict extracted and valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-v2-reviewed.md`)
- [ ] Workflow status updated (step `plan-apply-review` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 6` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 7 — Scope Check

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-plan-scope-check-1`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md`.
   - **Subagent:** Invoke `@bkit-plan-scope-check-2`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md`.
2. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-scope-check-1.md` and `plan-scope-check-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `SCOPE_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `SCOPE_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SCOPE_VERDICT" --argjson f "$SCOPE_FAILURES" \
     '{type:"step-done", workflow:"plan", step:"plan-scope-check", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md","docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): scope-check"
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
   ### Step 7 — Scope Check - Verdict: {SCOPE_VERDICT} - Failures: {SCOPE_FAILURES}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 7 — Scope Check

- [ ] Subagents invoked (`@bkit-plan-scope-check-1`, `@bkit-plan-scope-check-2`, no inline work)
- [ ] Artifacts written (`plan-scope-check-1.md` and `plan-scope-check-2.md`, non-empty)
- [ ] Verdict extracted and valid, failures extracted (`SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`; `SCOPE_FAILURES`)
- [ ] No PENDING placeholders remain (`plan-scope-check-1.md` and `plan-scope-check-2.md`)
- [ ] Workflow status updated (step `plan-scope-check` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 7` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 8 — Apply Scope

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying scope-check critiques. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md`.
   Update: `docs/deferrals.jsonl` (APPEND scope expansions if any).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-v3-checked.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_SCOPE_VERDICT`. **If** `APPLY_SCOPE_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v3-checked.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_SCOPE_VERDICT" \
     '{type:"step-done", workflow:"plan", step:"plan-apply-scope", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-scope"
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
   ### Step 8 — Apply Scope - Verdict: {APPLY_SCOPE_VERDICT}
   [plan-v3-checked.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md)
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 8 — Apply Scope

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Scope expansions in `docs/deferrals.jsonl` (if any)
- [ ] Artifact written (`plan-v3-checked.md`, non-empty)
- [ ] Verdict extracted and valid (`APPLY_SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-v3-checked.md`)
- [ ] Workflow status updated (step `plan-apply-scope` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 8` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 9 — Complexity Check

1. **Subagent:** Invoke `@bkit-plan-complexity-check` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-complexity-check.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-complexity-check.md` until `<!-- verdict:end -->` → extract `Verdict` as `COMPLEXITY_VERDICT` (`SINGLE` = no split, `SPLIT` = partition required).
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$COMPLEXITY_VERDICT" \
     '{type:"step-done", workflow:"plan", step:"plan-complexity-check", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-complexity-check.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): complexity-check"
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
   ### Step 9 — Complexity Check - Verdict: {COMPLEXITY_VERDICT}
   ```
   <!-- bkit:tracker true end -->

### 🔒 Gate 9 — Complexity Check

- [ ] Subagent invoked (`@bkit-plan-complexity-check`, no inline work)
- [ ] Artifact written (`plan-complexity-check.md`, non-empty)
- [ ] Verdict extracted and valid (`COMPLEXITY_VERDICT` in `SINGLE|SPLIT`)
- [ ] Workflow status updated (step `plan-complexity-check` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 9` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 10 — Complexity Split

**Run only if** Step 9 `COMPLEXITY_VERDICT` = SPLIT.

1. **Subagent:** Invoke `@bkit-plan-complexity-split` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Single versioned output: parent in `plan-v4-split.md`, child sub-plans in `plan-v4-1.md`, `plan-v4-2.md`, ..., `plan-v4-N.md`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md` (parent index with verdict header), `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-1.md` ... `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-N.md` (children).
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `plan-v4-split.md` until `<!-- verdict:end -->` → extract `Verdict` as `SPLIT_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SPLIT_VERDICT" \
     '{type:"step-done", workflow:"plan", step:"plan-complexity-split", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): complexity-split"
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
   ### Step 10 — Complexity Split - Verdict: {SPLIT_VERDICT}
   [plan-v4-split.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md)
   ```
   <!-- bkit:tracker true end -->
6. Route:
   - **If** `SPLIT_VERDICT` = PASS → Step 11.
   - **If** `SPLIT_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 10 — Complexity Split

- [ ] Subagent invoked (`@bkit-plan-complexity-split`, no inline work)
- [ ] Artifact written (`plan-v4-split.md`, non-empty)
- [ ] Children written (`plan-v4-1.md` ... `plan-v4-N.md`, non-empty)
- [ ] Verdict extracted and valid (`SPLIT_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-v4-split.md`)
- [ ] Workflow status updated (step `plan-complexity-split` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 10` section)

<!-- bkit:tracker true end -->

---

## 🧠 Step 11 — Summary

1. Resolve highest plan version: `PLAN_FINAL=$(ls docs/plans/{YYYYMM}/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)`. **If** empty → **Failure Path**.
2. **Subagent:** Invoke `@bkit-plan-summary` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `{PLAN_FINAL}` (highest v{N}), glob `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-*.md` (children if SPLIT), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/plan-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md`.
3. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Read `plan-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"plan", step:"plan-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary"
   ```
6. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`):
   ```bash
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
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
   ### Step 11 — Summary - Verdict: {SUMMARY_VERDICT}
   [plan-summary.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md)
   {plan-summary.md content verbatim}
   ```
   <!-- bkit:tracker true end -->
8. Route:
   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 12.
   - **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 11 — Summary

- [ ] Plan final resolved (`PLAN_FINAL` = highest `plan-v*.md`, excluding child `plan-v4-N.md`)
- [ ] Subagent invoked (`@bkit-plan-summary`, no inline work)
- [ ] Artifact written (`plan-summary.md`, non-empty)
- [ ] Verdict extracted and valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-summary.md`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `plan-summary` recorded with `parentSha`, `verdict`)

<!-- bkit:tracker true start -->

- [ ] Issue comment attempted (`Step 11` section)

<!-- bkit:tracker true end -->

---

## 🤖 Step 12 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Copy final plan to canonical bucket:
   ```bash
   YYYYMM=$(ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && YYYYMM=$(date +%Y%m)
   PLAN_FINAL=$(ls docs/plans/$YYYYMM/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)
   [ -z "$PLAN_FINAL" ] && { echo "No plan version found" >&2; exit 1; }
   mkdir -p "docs/plans/$YYYYMM"
   cp "$PLAN_FINAL" "docs/plans/$YYYYMM/{FID}-plan.md"
   for child in docs/plans/$YYYYMM/logs/{FID}/plan-v4-[0-9]*.md; do
     [ -f "$child" ] || continue
     N=$(basename "$child" | sed -E 's/plan-v4-([0-9]+)\.md/\1/')
     cp "$child" "docs/plans/$YYYYMM/{FID}-plan-${N}.md"
   done
   for f in docs/plans/$YYYYMM/{FID}-plan*.md; do
     [ -f "$f" ] || continue
     sed -i.bak -E 's|plan-v[0-9]+-split\.md|{FID}-plan.md|g; s|plan-v[0-9]+-([0-9]+)\.md|{FID}-plan-\1.md|g' "$f"
     rm -f "$f.bak"
   done
   ```
2. Update status and commit:
   ```bash
   WT=$(git rev-parse --show-toplevel)
   STATUS="$WT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"plan", step:"plan-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"plan", at:$t}' >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow"
   ```
3. Close shape A — land docs on `dev` via a skip-token-free PR merge (D5(a), #341 Flow 4/T13; supersedes the local `merge --squash -X ours` + direct `dev` push, which cannot run in `CAN_PUSH_DEV=false` runtimes and — per §6d — is why phase-close subjects no longer carry `[skip ci]`, since the token would otherwise land as the PR title and fail the PR-title assertion below):
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   cd "$REPO_ROOT"
   [ "$(git config --get core.bare)" = "true" ] && [ -d "$REPO_ROOT/.git" ] && git config core.bare false
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_runtime_detect "$REPO_ROOT" "{FID}" || { echo "[bkit-runtime] runtime detect failed" >&2; exit 2; }
   bkit_runtime_assert_resolved || exit 2
   STRAY_MAIN=$(git status --porcelain -uall -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep '^??' || true)
   [ -n "$STRAY_MAIN" ] && { echo "{FID} artifacts written to the main checkout instead of the worktree:" >&2; echo "$STRAY_MAIN" >&2; echo "Move them under .worktrees/{FID}/ or delete them, then re-run." >&2; exit 1; }
   git fetch origin dev "{BRANCH}"
   # Transport-independent prologue (Flow 4): STRAY guard FIRST, over the UNFILTERED diff — NOT
   # the allowlist-computed push set (that construction is a tautology that can never fail).
   STRAY=$(git diff --name-only "origin/dev...{BRANCH}" | grep -vE '^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$' || true)
   [ -n "$STRAY" ] && { echo "plan close-workflow diff carries non-doc files:" >&2; echo "$STRAY" >&2; exit 1; }
   EXISTING_PR=$(gh pr list --head "{BRANCH}" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
   if [ -n "$EXISTING_PR" ]; then
     PR_NUMBER="$EXISTING_PR"
   else
     gh pr create --base dev --head "{BRANCH}" --title "docs({FID}): plan DONE" --body "" || { echo "gh pr create failed" >&2; exit 1; }
     PR_NUMBER=$(gh pr list --head "{BRANCH}" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
   fi
   [ -n "$PR_NUMBER" ] || { echo "Could not resolve PR number for {BRANCH} -> dev" >&2; exit 1; }
   PR_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title)
   if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2; exit 1
   fi
   gh pr merge "$PR_NUMBER" --squash --delete-branch --subject "$PR_TITLE" --body "" || { echo "gh pr merge failed" >&2; exit 1; }
   MERGE_STATE=$(gh pr view "$PR_NUMBER" --json state --jq .state)
   [ "$MERGE_STATE" = "MERGED" ] || { echo "PR $PR_NUMBER did not reach MERGED (state=$MERGE_STATE)" >&2; exit 1; }
   LANDED_SHA=$(gh pr view "$PR_NUMBER" --json mergeCommit --jq .mergeCommit.oid)
   [ -n "$LANDED_SHA" ] || { echo "Could not resolve landed SHA for PR $PR_NUMBER" >&2; exit 1; }
   git fetch origin dev
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   CLOSE_TRANSPORT="gh"
   bkit_close_guard_scan_body "$LANDED_SHA" dev; SCAN_RC=$?
   case "$SCAN_RC" in
     0) SCAN_RESULT="clean" ;;
     1) SCAN_RESULT="skip-token-found" ;;
     *) echo "[bkit-close-guard] D24 scan errored (rc=$SCAN_RC) on $LANDED_SHA" >&2; exit 1 ;;
   esac
   bkit_close_guard_cross_check "$STATUS" "$CLOSE_TRANSPORT" || { echo "[bkit-close-guard] D25 cross-check FAILED" >&2; exit 1; }
   bkit_close_transport_row "A" "$LANDED_SHA" "$SCAN_RESULT" "$(date -u +%FT%TZ)" >> "$STATUS"
   [ "$SCAN_RESULT" = "clean" ] || { echo "[bkit-close-guard] D24 FATAL: landed commit $LANDED_SHA carries a CI-suppression token — routing to Failure Path" >&2; exit 1; }
   git show "origin/dev:docs/plans/$(date +%Y%m)/{FID}-plan.md" > /dev/null 2>&1 || { echo "Canonical plan missing on dev" >&2; exit 1; }
   for SPLIT_FILE in $(git ls-tree -r --name-only "$LANDED_SHA" -- "docs/plans/$(date +%Y%m)/" | grep -E "{FID}-plan-[0-9]+\.md$" || true); do
     git show "origin/dev:$SPLIT_FILE" > /dev/null 2>&1 || { echo "Canonical split plan missing on dev: $SPLIT_FILE" >&2; exit 1; }
   done
   if [ "$CAN_WORKTREE" = "true" ]; then
     git worktree remove "$REPO_ROOT/.worktrees/{FID}" --force
     git branch -D "{BRANCH}" 2>/dev/null || true
     git worktree prune
   else
     echo "[bkit-plan] adopt mode — no local worktree/branch to clean up ({BRANCH} already deleted server-side by --delete-branch)" >&2
   fi
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
4. <!-- bkit:tracker github start -->
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
5. <!-- bkit:tracker true start -->
   Build `{ARTIFACTS}` link list:
   ```bash
   RR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)"); BR=dev
   ARTIFACTS=$( { git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/" | grep -E "docs/plans/{YYYYMM}/{FID}-[^/]+$"; git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep -E "/plan-[^/]+$"; } | while read -r f; do printf -- '- [%s](https://github.com/{OWNER_REPO}/blob/%s/%s)\n' "$(basename "$f")" "$BR" "$f"; done )
   printf '%s\n' "$ARTIFACTS"
   TELEMETRY=$( (cd "$RR" && pnpm bkit telemetry summary --phase=plan) 2>&1 || echo "[bkit-telemetry] summary unavailable" )
   printf '\n%s\n' "$TELEMETRY"
   ```
   <!-- bkit:tracker true end -->
6. <!-- bkit:tracker github start -->
   `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — NEW comment, no edit.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker true start -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 12 — Close Workflow
   #### Artifacts
   {ARTIFACTS}
   #### Telemetry
   {TELEMETRY}
   ```
   <!-- bkit:tracker true end -->
7. Final return: Display `plan-summary.md` content verbatim as final message to user; do NOT summarise or trim; do NOT auto-invoke. **HARD STOP** — do NOT invoke `/build`.
   <!-- bkit:tracker true start -->
   Append issue link [{ISSUE_ID} {TITLE}]({URL})
   <!-- bkit:tracker true end -->

### 🔒 Gate 12 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Summary verdict confirmed (`SUMMARY_VERDICT` = PASS or CONCERNS)
- [ ] Canonical plan copied (`docs/plans/{YYYYMM}/{FID}-plan.md`, verified on `dev` post-merge; same for each `{FID}-plan-N.md` if SPLIT — `{YYYYMM}` = creation month)
- [ ] Workflow status updated (`plan` `DONE`, step `plan-close-workflow` recorded with `parentSha`)
- [ ] Close telemetry committed (`.bkit/stats.jsonl` staged before push)
- [ ] Changes merged to `dev` and pushed with `bkit [skip ci]`
- [ ] Changes merged to `dev` via PR (D5(a); no `[skip ci]` in the PR title/merge subject — §6d/OQ-D)
- [ ] D24 post-close scan clean + D25 cross-check passed + `close-transport` row recorded (shape A)
- [ ] Worktree removed and feature branch deleted (mint mode only — adopt mode has no worktree/branch to remove)
- [ ] Final return displayed (`plan-summary.md` content verbatim)

<!-- bkit:tracker true start -->

- [ ] Issue update attempted (status/state `In Review`, phase label `bkit:plan` unchanged)
- [ ] Artifact link list embedded in `Step 12` comment
- [ ] Telemetry report embedded via summary
- [ ] Issue comment attempted (`Step 12` section)

<!-- bkit:tracker true end -->
