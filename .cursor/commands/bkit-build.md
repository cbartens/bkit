<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Build Feature (Workflow 3/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Build feature and raise PR for default integration branch.

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
> - **Flaky tests:** ANY tests passing only on retry / failing intermittently, ALWAYS append rows to `docs/failures.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, `{WORKTREE_PATH}`, etc non-empty before tool calls (`{ISSUE_ID}` / `{STATE}` / `{LABELS}` only when tracker wired — empty under `none`; `{WORKTREE_PATH}` = absolute worktree path set at worktree setup, required for subagent `Context` cwd). **Else** → **Failure Path**. `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Resume:** On start, fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`), `failures`, `attempt`, `subPlan`, `strategy` (`STANDARD | PIVOT | FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded status.jsonl: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` and last step <30min idle → **Failure Path**; `IN_PROGRESS` and last step >=30min idle → stale, clean.
> - **Status branch:** build status.jsonl is committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, NO `dev` push.
> - **Subagents:** Invoke using `/name` with `Task` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, bare `git push --force`, and ANY force-push to `dev` / `main`. **ALLOWED** as the Step 2 rebase companion: `git push --force-with-lease` to the personal `feat/{FID}` / `fix/{FID}` branch ONLY. Pre `git push`: assert `{BRANCH}` non-empty; never force-push a shared branch.


> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — projects tools require the `projects` toolset enabled in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.


> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** `MAX_VERIFY_ATTEMPT` and `MAX_TEST_ATTEMPT` sourced via fenced shell routing blocks below.
> - **Large Diff Guard:** When Read line passes `git diff origin/dev..HEAD` to subagents, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   STATUS="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$STATUS" ] || STATUS="$REPO_ROOT/$REL"
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"build",at:$t}' >> "$STATUS"
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   rm -f "$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
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
4. **If** failure triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) **or** rebase failure sentinel previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `/bkit-debug-abort-handover` using `Task` tool:
   Context: You are a subagent in the Build Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
6. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): build aborted bkit [skip ci]"`.
10. Assert `{BRANCH}` non-empty and push abort commit — NEVER onto branch with open PR:
    ```bash
    B=$(git branch --show-current)
    EXISTING_PR=""
    if [ -n "$B" ] && [ "$B" != "dev" ] && [ "$B" != "main" ]; then
      EXISTING_PR=$(gh pr list --head "$B" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "PROBE_FAILED")
    fi
    if [ -z "$EXISTING_PR" ]; then
      case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
    else
      echo "[bkit-ci-gate] abort-guard: open PR on branch (or probe failed: $EXISTING_PR) — preserving last validated remote HEAD (no push)"
    fi
    ```
    — **If** push fails → do NOT claim success on tracker.
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ### Workflow Handover
    [build-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/build-handover.md)
    {build-handover.md content verbatim}
    ```
12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before build" >&2; exit 1; }
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if ! (set -C; printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
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
     (set -C; printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null || { echo "Lock contended for {FID}" >&2; exit 1; }
   fi
   ```
   **If** lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. Emit long-branch advisory:
   ```bash
   behind=$(git rev-list --count HEAD..origin/dev 2>/dev/null || echo 0)
   mb=$(git merge-base HEAD origin/dev 2>/dev/null)
   age=$([ -n "$mb" ] && git show -s --format=%ar "$mb" 2>/dev/null || echo "unknown")
   echo "[bkit-build] feature branch is ${behind} commits behind dev / ${age} since divergence"
   ```
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
4. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
5. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else**:
   Extract from session prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:build"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
6. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`, `title` → `TITLE`, `html_url` → `URL`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
7. Parse `{DESCRIPTION}` (already populated by `issue-read`) for `<!-- bkit:blocked-by start -->` ... `<!-- bkit:blocked-by end -->` block. **If** block absent → no blockers, proceed. **Else** extract each `- #N` line into `{BLOCKER_ISSUES}` array. For each `N` in `{BLOCKER_ISSUES}` → `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: N })` → extract `state`. **If** any blocker `state` != `"closed"` → **Failure Path**.
8. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID`. **Else** → **Failure Path**.
9. **If** NO `FID` → create `FID` from `{ISSUE_ID}` and kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set. Format `{ISSUE_ID}-{slug}`.
   Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
   **Else** → **Failure Path**.
10. Add `Build` phase to `{LABELS}` and drop old phase.
    Add `bkit:build` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
    **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ## Build Workflow
    ### Step 1 — Start Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`)
- [ ] Issue ID resolved (`ISSUE_ID` non-empty when tracker wired; may be empty under `none`)
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] Long-branch advisory emitted


- [ ] Blocker check attempted (not blocked by any related issues)
- [ ] Issue update attempted (phase label `bkit:build`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)


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
4. **If** sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` exists → **Failure Path**.
5. Sub-plan count:
   ```bash
   SUB_COUNT=$(ls docs/plans/{YYYYMM}/{FID}-plan-*.md 2>/dev/null | wc -l)
   [ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
   ```
6. Create: `docs/plans/{YYYYMM}/logs/{FID}/build-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
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
   . "$WT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   LATEST=$(jq -s "$BKIT_STATUS_FOLD"' fold | (.[-1] // {}) | {workflow, status}' "$STATUS" 2>/dev/null || echo '{}')
   if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "build" ] || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
     jq -nc --arg t "$(date -u +%FT%TZ)" --arg p "$(git rev-parse HEAD 2>/dev/null || echo '')" '{type:"workflow-started", workflow:"build", at:$t, parentSha:$p}' >> "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"build", step:"build-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"build", step:"build-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-input.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup bkit [skip ci]"
   ```
8. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/{YYYYMM}/logs/{FID}/status.jsonl](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] Branch non-empty (`BRANCH`, updated to worktree branch)
- [ ] Plan files in `docs/plans/{YYYYMM}/` (canonical bucket)
- [ ] Sub-plan count set (`SUB_COUNT`); counters derived per-block
- [ ] Artifact written (`build-input.md`, non-empty)
- [ ] Workflow status updated (`build` `IN_PROGRESS`, steps `build-start-workflow` and `build-worktree-setup` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 2` section)


---

## 🤖 Step 3 — Branch Sync

1. `git fetch origin`.
2. **If** feature branch **and** `git log HEAD..origin/dev --oneline -- docs/` non-empty → `git merge origin/dev` (conflicts: prefer `dev` for `docs/`).
3. `git branch --show-current` → confirm `BRANCH`. Assert non-empty.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"build", step:"build-branch-sync", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): branch-sync"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Branch Sync
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 3 — Branch Sync

- [ ] Docs not behind origin (`docs/` not behind `origin/dev`)
- [ ] On correct worktree branch
- [ ] Workflow status updated (step `build-branch-sync` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 3` section)


---

## 🧠 Step 4 — Install Skills

**Skip if** build input contains `[skills=false]`.

1. **Subagent:** Invoke `/bkit-build-install-skills` using `Task` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `.agents/skills.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"build", step:"build-install-skills", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): install-skills"
   ```
4. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Install Skills
   ```

### 🔒 Gate 4 — Install Skills

- [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
- [ ] Artifact written (`build-install-skills.md`, non-empty)
- [ ] New skills installed (or no new skills noted)
- [ ] Workflow status updated (step `build-install-skills` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 4` section)


---

## Sub-Plan Loop — Steps 5–7

1. **If** `SINGLE_PLAN` = true → execute once using `{FID}-plan.md` with `SUB_PLAN` = 1.
2. **If** `SUB_COUNT` >= 2 → loop `SUB_PLAN` from 1 to `SUB_COUNT` using `{FID}-plan-{SUB_PLAN}.md`. Verify derive filters on `SUB_PLAN` → fresh budget per sub-plan.

Per-step summary file naming for sub-plan loop steps: `{step}-{SUB_PLAN}-{ATTEMPT}.md`.

---

### 🧠 Step 5 — Plan Execute

3. **Subagent:** Invoke `/bkit-build-plan-execute` using `Task` tool:
   Context: You are a subagent in the Build phase. Execute sub-plan `{SUB_PLAN}` / `{SUB_COUNT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{SUB_PLAN}-log.md`.
4. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
5. Read `build-plan-execute-{SUB_PLAN}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `EXECUTE_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$EXECUTE_VERDICT" --argjson sp "$SUB_PLAN" \
     '{type:"step-done", workflow:"build", step:"build-plan-execute", status:"DONE", verdict:$v, attempt:1, subPlan:$sp, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-'"${SUB_PLAN}"'-log.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): plan-execute sub-plan ${SUB_PLAN}"
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Plan Execute - Verdict: {EXECUTE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT}
   ```

### 🔒 Gate 5 — Plan Execute

- [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
- [ ] Artifact written (`build-plan-execute-{SUB_PLAN}-log.md`, non-empty)
- [ ] Source files implemented
- [ ] Verdict extracted and valid (`EXECUTE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`build-plan-execute-{SUB_PLAN}-log.md`)
- [ ] Workflow status updated (step `build-plan-execute` recorded with `parentSha`, `verdict`, `subPlan`)


- [ ] Issue comment attempted (`Step 5` section)


---

### 🧠 Step 6 — Plan Verify

8. Derive `{VERIFY_ATTEMPT}`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   VERIFY_ATTEMPT=$(counter_next "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN") || exit 2
   ```
9. **Subagent:** Invoke `/bkit-build-plan-verify` using `Task` tool:
   Context: You are a subagent in the Build phase. Single plan verification. Sub-plan `{SUB_PLAN}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{SUB_PLAN}-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**; filter to changes relevant to this sub-plan's checklist; ignore changes outside scope).
   Update: `docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`.
10. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
11. Read `build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `VERIFY_VERDICT` and `Failures` as `VERIFY_FAILURES`.
12. Update status and commit:
    ```bash
    STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
    PARENT_SHA=$(git rev-parse HEAD)
    REPO_ROOT=$(git rev-parse --show-toplevel)
    . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
    . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
    VERIFY_ATTEMPT=$(counter_next "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN") || exit 2
    jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$VERIFY_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --argjson f "$VERIFY_FAILURES" \
      '{type:"step-done", workflow:"build", step:"build-plan-verify", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'.md"]}' \
      >> "$STATUS"
    git add -A && git commit --allow-empty -m "chore({FID}): plan-verify sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT}"
    ```
13. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ### Step 6 — Plan Verify - Verdict: {VERIFY_VERDICT} - Failures: {VERIFY_FAILURES} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT}
    ```
14. **If** `VERIFY_VERDICT` = PASS:
    - **If** more sub-plans remain (`SUB_PLAN` < `SUB_COUNT`) → next `SUB_PLAN` → Step 5.
    - **Else** → Step 8.
15. **If** `VERIFY_VERDICT` = CONCERNS or FAIL — run counter-bus routing:
    ```bash
    REPO_ROOT=$(git rev-parse --show-toplevel)
    . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
    . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
    . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
    STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
    VERIFY_ATTEMPT=$(counter_current "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN") || exit 2
    decide_next VERIFY_ATTEMPT "$VERIFY_ATTEMPT" "$MAX_VERIFY_ATTEMPT" step-7 failure-path
    ```
    - **If** exit 0 (printed `step-7`) → Step 7.
    - **If** exit 1 (printed `failure-path`) → **Failure Path**.
    - **If** any other exit → **Failure Path**.
16. **Else** → **Failure Path**.

### 🔒 Gate 6 — Plan Verify

- [ ] Verify attempt derived (active run, this sub-plan)
- [ ] Subagent invoked (`@bkit-build-plan-verify`, no inline work)
- [ ] Artifact written (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted and valid, failures extracted (`VERIFY_VERDICT` in `PASS|CONCERNS|FAIL`; `VERIFY_FAILURES`)
- [ ] No PENDING placeholders remain (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`)
- [ ] Workflow status updated (step `build-plan-verify` recorded with `parentSha`, `verdict`, `attempt`, `subPlan`)


- [ ] Issue comment attempted (`Step 6` section)


---

### 🧠 Step 7 — Plan Gaps Remediate

**Run only if** Step 6 `VERIFY_VERDICT` = CONCERNS or FAIL.

17. Read status.jsonl and extract `PRIOR_STRATEGY`:
    ```bash
    REPO_ROOT=$(git rev-parse --show-toplevel)
    . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
    . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
    STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
    PRIOR_STRATEGY=$(route_last_strategy "$STATUS" build build-plan-gaps-remediate --sub-plan "$SUB_PLAN") || exit 2
    STRATEGY=$(ladder_next "$PRIOR_STRATEGY") || exit 2
    ```
18. **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `Task` tool:
    Context: You are a subagent in the Build phase. Sub-plan `{SUB_PLAN}`, attempt `{VERIFY_ATTEMPT}`. Strategy: `{STRATEGY}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-*-log.md`.
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md`.
19. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
20. Read `build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
21. Update status and commit:
    ```bash
    STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
    PARENT_SHA=$(git rev-parse HEAD)
    REPO_ROOT=$(git rev-parse --show-toplevel)
    . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
    . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
    VERIFY_ATTEMPT=$(counter_current "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN") || exit 2
    jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --arg strat "$STRATEGY" \
      '{type:"step-done", workflow:"build", step:"build-plan-gaps-remediate", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'-log.md"]}' \
      >> "$STATUS"
    git add -A && git commit --allow-empty -m "chore({FID}): plan-gaps-remediate sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT}"
    ```
22. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ### Step 7 — Plan Gaps Remediate - Verdict: {REMEDIATE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT} - Strategy: {STRATEGY}
    ```
23. Re-run Step 6.

### 🔒 Gate 7 — Plan Gaps Remediate

- [ ] Subagent invoked (`@bkit-build-plan-gaps-remediate`, no inline work)
- [ ] Artifact written (`build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict extracted and valid, strategy extracted (`REMEDIATE_VERDICT` in `PASS|CONCERNS|FAIL`; `STRATEGY`)
- [ ] Workflow status updated (step `build-plan-gaps-remediate` recorded with `parentSha`, `verdict`, `attempt`, `subPlan`, `strategy`)


- [ ] Issue comment attempted (`Step 7` section)


---

## 🧠 Step 8 — Plan Verify Holistic

**Run only if** `SUB_COUNT` >= 2. **Skip if** `SINGLE_PLAN` = true.

1. **Subagent:** Invoke `/bkit-build-plan-verify` using `Task` tool:
   Context: You are a subagent in the Build phase. Holistic plan verification (master and sub-plans). Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, all `docs/plans/{YYYYMM}/{FID}-plan-N.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**; review full feature diff for cross-sub-plan integration).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
2. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `build-plan-verify-holistic.md` until `<!-- verdict:end -->` → extract `Verdict` as `HOLISTIC_VERDICT` and `Failures` as `HOLISTIC_FAILURES`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$HOLISTIC_VERDICT" --argjson f "$HOLISTIC_FAILURES" \
     '{type:"step-done", workflow:"build", step:"build-plan-verify-holistic", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): plan-verify-holistic"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Plan Verify Holistic - Verdict: {HOLISTIC_VERDICT} - Failures: {HOLISTIC_FAILURES}
   ```
6. Route:
   - **If** `HOLISTIC_VERDICT` = PASS or CONCERNS → Step 9.
   - **If** `HOLISTIC_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 8 — Plan Verify Holistic

- [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
- [ ] Artifact written (`build-plan-verify-holistic.md`, non-empty)
- [ ] Verdict extracted and valid, failures extracted (`HOLISTIC_VERDICT` in `PASS|CONCERNS|FAIL`; `HOLISTIC_FAILURES`)
- [ ] No PENDING placeholders remain (`build-plan-verify-holistic.md`)
- [ ] Workflow status updated (step `build-plan-verify-holistic` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 8` section)


---

## 🧠 Step 9 — Build Challenge

1. Launch both subagents in parallel using `Task` tool:
   - **Subagent:** Invoke `/bkit-build-challenge-1`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md`.
   - **Subagent:** Invoke `/bkit-build-challenge-2`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
2. Wait for all subagents to complete. Assert both files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge-1.md` and `build-challenge-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `CHALLENGE_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `CHALLENGE_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   CHALLENGE_REMEDIATE_ATTEMPT=$(counter_count "$STATUS" build build-challenge-remediate) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" --arg v "$CHALLENGE_VERDICT" --argjson f "$CHALLENGE_FAILURES" \
     '{type:"step-done", workflow:"build", step:"build-challenge", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md","docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Build Challenge - Verdict: {CHALLENGE_VERDICT} - Failures: {CHALLENGE_FAILURES} - Attempt: {CHALLENGE_REMEDIATE_ATTEMPT}
   ```
6. → Step 10.

### 🔒 Gate 9 — Build Challenge

- [ ] Subagents invoked (`@bkit-build-challenge-1`, `@bkit-build-challenge-2`, no inline work)
- [ ] Artifacts written (`build-challenge-1.md` and `build-challenge-2.md`, non-empty)
- [ ] Workflow status updated (step `build-challenge` recorded with `parentSha`, `attempt`)


- [ ] Issue comment attempted (`Step 9` section)


---

## 🧠 Step 10 — Reconcile Build Challenge

1. **Subagent:** Invoke `/bkit-build-challenge-reconcile` using `Task` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `build-challenge.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_VERDICT` and `Failures` as `CHALLENGE_FAILURES`. `CHALLENGE_VERDICT` must be in `PASS|CONCERNS|FAIL` (canonical challenge verdict; NO `BLOCK` / `WARN`).
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   CHALLENGE_REMEDIATE_ATTEMPT=$(counter_count "$STATUS" build build-challenge-remediate) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_VERDICT" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" --argjson f "$CHALLENGE_FAILURES" \
     '{type:"step-done", workflow:"build", step:"build-challenge-reconcile", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-reconcile attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Reconcile Build Challenge - Verdict: {CHALLENGE_VERDICT} - Failures: {CHALLENGE_FAILURES} - Attempt: {CHALLENGE_REMEDIATE_ATTEMPT}
   ```
6. **If** `CHALLENGE_VERDICT` = PASS → Step 13.
7. **If** `CHALLENGE_VERDICT` = CONCERNS or FAIL — counter-bus routing (`counter_count` on `build-challenge-remediate`; 0 legal; `MAX_CHALLENGE_REMEDIATE_ATTEMPT` = 1 → `THRESHOLD` = 0):
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   CHALLENGE_REMEDIATE_ATTEMPT=$(counter_count "$STATUS" build build-challenge-remediate) || exit 2
   THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))
   if [ "$CHALLENGE_VERDICT" = "FAIL" ]; then
     decide_next CHALLENGE_REMEDIATE_ATTEMPT "$CHALLENGE_REMEDIATE_ATTEMPT" "$THRESHOLD" step-11 failure-path
   else
     decide_next CHALLENGE_REMEDIATE_ATTEMPT "$CHALLENGE_REMEDIATE_ATTEMPT" "$THRESHOLD" step-11 step-13
   fi
   ```
   - **If** `CHALLENGE_VERDICT` = CONCERNS: exit 0 (printed `step-11`) → Step 11; exit 1 (printed `step-13`) → Step 13.
   - **If** `CHALLENGE_VERDICT` = FAIL: exit 0 (printed `step-11`) → Step 11; exit 1 (printed `failure-path`) → **Failure Path**.
   - **If** any other exit → **Failure Path**.
8. **Else** → **Failure Path**.

### 🔒 Gate 10 — Reconcile Build Challenge

- [ ] Subagent invoked (`@bkit-build-challenge-reconcile`, no inline work)
- [ ] Artifact written (`build-challenge.md`, non-empty)
- [ ] Verdict extracted and valid, failures extracted (`CHALLENGE_VERDICT` in `PASS|CONCERNS|FAIL`; `CHALLENGE_FAILURES`)
- [ ] No PENDING placeholders remain (`build-challenge.md`)
- [ ] Workflow status updated (step `build-challenge-reconcile` recorded with `parentSha`, `verdict`, `attempt`)


- [ ] Issue comment attempted (`Step 10` section)


---

## 🧠 Step 11 — Build Challenge Remediate

**Run only if** Step 10 (`CHALLENGE_VERDICT` = CONCERNS **or** FAIL).

1. Re-read Step 10 challenge verdict; derive `{CHALLENGE_REMEDIATE_ATTEMPT}`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   CHALLENGE_VERDICT=$(route_last_verdict "$STATUS" build build-challenge-reconcile) || exit 2
   case "$CHALLENGE_VERDICT" in CONCERNS|FAIL) ;; *) exit 2 ;; esac
   CHALLENGE_REMEDIATE_ATTEMPT=$(counter_next "$STATUS" build build-challenge-remediate) || exit 2
   ```
2. **Subagent:** Invoke `/bkit-build-challenge-remediate` using `Task` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md`.
3. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Read `build-challenge-remediate-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_CHALLENGE_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   CHALLENGE_REMEDIATE_ATTEMPT=$(counter_next "$STATUS" build build-challenge-remediate) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_CHALLENGE_VERDICT" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" \
     '{type:"step-done", workflow:"build", step:"build-challenge-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-remediate attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 11 — Build Challenge Remediate - Verdict: {REMEDIATE_CHALLENGE_VERDICT} - Attempt: {CHALLENGE_REMEDIATE_ATTEMPT}
   ```
7. Route:
   - **If** `REMEDIATE_CHALLENGE_VERDICT` = FAIL → **Failure Path**.
   - **Else** → Step 12.

### 🔒 Gate 11 — Build Challenge Remediate

- [ ] Challenge-remediate attempt derived (active run)
- [ ] Subagent invoked (`@bkit-build-challenge-remediate`, no inline work)
- [ ] Artifact written (`build-challenge-remediate-log.md`, non-empty)
- [ ] Source files modified or classify-gate FAIL recorded
- [ ] Verdict extracted and valid (`REMEDIATE_CHALLENGE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `build-challenge-remediate` recorded with `parentSha`, `verdict`, `attempt`)


- [ ] Issue comment attempted (`Step 11` section)


---

## 🧠 Step 12 — Build Challenge Tests

**Run only if** Step 10 `CHALLENGE_VERDICT` = CONCERNS or FAIL.

1. **Subagent:** Invoke `/bkit-build-challenge-tests` using `Task` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md` (if exists), `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-tests.md`, test files.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `build-challenge-tests.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_TESTS_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_TESTS_VERDICT" \
     '{type:"step-done", workflow:"build", step:"build-challenge-tests", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-tests.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-tests"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 12 — Build Challenge Tests - Verdict: {CHALLENGE_TESTS_VERDICT}
   ```
6. Route:
   - **If** `CHALLENGE_VERDICT` = FAIL → **Re-run Step 9**.
   - **Else** → Step 13.

### 🔒 Gate 12 — Build Challenge Tests

- [ ] Subagent invoked (`@bkit-build-challenge-tests`, no inline work)
- [ ] Artifact written (`build-challenge-tests.md`, non-empty)
- [ ] Test files created/updated
- [ ] Verdict extracted and valid (`CHALLENGE_TESTS_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `build-challenge-tests` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 12` section)


- [ ] Routing applied (re-run Step 9 if `CHALLENGE_VERDICT` = FAIL; else Step 13)

---

## 🤖 Step 13 — Run Tests

1. Derive `{TEST_ATTEMPT}`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   TEST_ATTEMPT=$(counter_next "$STATUS" build build-run-tests) || exit 2
   ```
2. Run verbatim — do NOT modify quoting, filter, or glob:
   ```bash
   COV_UNIT=0
   jq -e '.scripts["test:coverage:unit"]' package.json >/dev/null 2>&1 && COV_UNIT=1
   if [ -f turbo.json ]; then
     TEST_SCOPE="pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue"
   else
     TEST_SCOPE=""
     for s in typecheck test format:check lint:slop lint:prose; do
       jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1 && TEST_SCOPE="${TEST_SCOPE:+$TEST_SCOPE && }pnpm $s"
     done
   fi
   [ "$COV_UNIT" = 1 ] && TEST_SCOPE="${TEST_SCOPE:+$TEST_SCOPE && }pnpm test:coverage:unit"
   echo "TEST_SCOPE=$TEST_SCOPE"
   eval "$TEST_SCOPE"
   ```
3. Decide `TEST_VERDICT` and `TEST_FAILURES` from exit code:
   - **If** all tests passed → `TEST_VERDICT` = PASS, `TEST_FAILURES` = 0.
   - **Else** → `TEST_VERDICT` = FAIL, `TEST_FAILURES` = count of failing test suites (>=1).
4. Extract `TEST_SCOPE` from run block `TEST_SCOPE=` line.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   TEST_ATTEMPT=$(counter_next "$STATUS" build build-run-tests) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$TEST_VERDICT" --arg sc "$TEST_SCOPE" --argjson a "$TEST_ATTEMPT" --argjson f "$TEST_FAILURES" \
     '{type:"step-done", workflow:"build", step:"build-run-tests", status:"DONE", verdict:$v, scope:$sc, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): run-tests attempt ${TEST_ATTEMPT}"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 13 — Run Tests - Verdict: {TEST_VERDICT} - Failures: {TEST_FAILURES} - Scope: {TEST_SCOPE} - Attempt: {TEST_ATTEMPT}
   ```
7. Route:
   - **If** all tests PASS → Step 16.
   - **If** some tests FAIL — run counter-bus routing:
     ```bash
     REPO_ROOT=$(git rev-parse --show-toplevel)
     . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
     STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
     TEST_ATTEMPT=$(counter_current "$STATUS" build build-run-tests) || exit 2
     decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path
     ```
     - **If** exit 0 (printed `step-14`) → Step 14.
     - **If** exit 1 (printed `failure-path`) → **Failure Path**.
     - **If** any other exit → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 13 — Run Tests

- [ ] Test attempt derived (active run)
- [ ] Tests executed (turbo path if `turbo.json`)
- [ ] Test results extracted (`TEST_VERDICT`, `TEST_FAILURES`, `TEST_SCOPE`)
- [ ] Workflow status updated (step `build-run-tests` recorded with `parentSha`, `verdict`, `scope`)


- [ ] Issue comment attempted (`Step 13` section)


---

## 🧠 Step 14 — Failure Diagnose

**Run only if** Step 13 tests FAIL.

1. Read status.jsonl and extract `PRIOR_STRATEGY`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PRIOR_STRATEGY=$(route_last_strategy "$STATUS" build build-failure-diagnose) || exit 2
   STRATEGY=$(ladder_next "$PRIOR_STRATEGY") || exit 2
   ```
2. **Subagent:** Invoke `/bkit-debug-failure-diagnose` using `Task` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Strategy: `{STRATEGY}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
3. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
4. Read `build-failure-diagnose-{TEST_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   TEST_ATTEMPT=$(counter_current "$STATUS" build build-run-tests) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$TEST_ATTEMPT" --arg strat "$STRATEGY" \
     '{type:"step-done", workflow:"build", step:"build-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-'"${TEST_ATTEMPT}"'.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${TEST_ATTEMPT}"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 14 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Strategy: {STRATEGY} - Attempt: {TEST_ATTEMPT}
   ```

### 🔒 Gate 14 — Failure Diagnose

- [ ] Strategy computed before invocation (`STRATEGY`)
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`build-failure-diagnose-{TEST_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted and valid (`DIAGNOSE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-failure-diagnose-{TEST_ATTEMPT}.md`)
- [ ] Workflow status updated (step `build-failure-diagnose` recorded with `parentSha`, `verdict`, `strategy`)


- [ ] Issue comment attempted (`Step 14` section)


---

## 🧠 Step 15 — Failure Remediate

**Run only if** Step 13 tests FAIL.

1. **Subagent:** Invoke `/bkit-debug-failure-remediate` using `Task` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
   Update: Source and test files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `build-failure-remediate-{TEST_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   TEST_ATTEMPT=$(counter_current "$STATUS" build build-run-tests) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$TEST_ATTEMPT" \
     '{type:"step-done", workflow:"build", step:"build-failure-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-'"${TEST_ATTEMPT}"'-log.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-remediate attempt ${TEST_ATTEMPT}"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 15 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Attempt: {TEST_ATTEMPT}
   ```
6. **Re-run Step 13**.

### 🔒 Gate 15 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`build-failure-remediate-{TEST_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict extracted and valid (`REMEDIATE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `build-failure-remediate` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 15` section)


---

## 🧠 Step 16 — Summary

**Run only if** all Step 13 tests PASS.

1. **Subagent:** Invoke `/bkit-build-summary` using `Task` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `git log --oneline origin/dev..HEAD` (commit subjects only).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-summary.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `build-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"build", step:"build-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-summary.md"]}' \
     >> "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary"
   ```
5. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push -u origin "$B" ;; *) git push -u --force-with-lease origin "$B" ;; esac`.
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 16 — Summary - Verdict: {SUMMARY_VERDICT}
   [build-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/build-summary.md)
   {build-summary.md content verbatim}
   ```
7. Route:
   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 17.
   - **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 16 — Summary

- [ ] Subagent invoked (`@bkit-build-summary`, no inline work)
- [ ] Artifact written (`build-summary.md`, non-empty)
- [ ] Verdict extracted and valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-summary.md`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `build-summary` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 16` section)


---

## 🤖 Step 17 — Close Workflow & Create PR

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. `git fetch origin dev`.
   Probe for pre-existing open PR on `{BRANCH}` before `gh pr create`:
   ```bash
   BRANCH_NOW=$(git branch --show-current)
   EXISTING_PR=$(gh pr list --head "$BRANCH_NOW" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
   if [ -n "$EXISTING_PR" ]; then
     echo "feat/{FID} already has open PR #${EXISTING_PR} to dev — build re-run/resume cannot blind-create. Resume via /bkit-debug or close the stale PR." >&2; exit 1
   fi
   ```
   **If** exit non-zero → **Failure Path**.
2. **If** `git diff origin/dev --name-only | grep -q '^supabase/migrations/'` **and** `git show -s --format=%B HEAD | grep -qF '[force build]'` fails → amend or `git commit --allow-empty` with `bkit [force build]` → push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac`.
3. Re-read labels → update status, write close telemetry, commit, run HEAD-Subject Assertion, and push to the feature branch in one block (set and use `AUTO_ROUTE_SUFFIX` in same shell):
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
   ```bash
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   BKIT_AUTO_ROUTE_FILE=$(mktemp)
   printf '%s' "$AUTO_ROUTE_SUFFIX" > "$BKIT_AUTO_ROUTE_FILE"
   echo "BKIT_AUTO_ROUTE_FILE=$BKIT_AUTO_ROUTE_FILE" >> "$GITHUB_ENV" 2>/dev/null || true
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   WT=$(git rev-parse --show-toplevel)
   STATUS="$WT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"build", at:$t}' >> "$STATUS"
   STATS="$WT/.bkit/stats.jsonl"
   BKIT_VER=$(jq -r '.pinnedVersion // empty' "$REPO_ROOT/.bkit/version" 2>/dev/null); [ -z "$BKIT_VER" ] && BKIT_VER="unknown"
   REPO_SLUG=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]||; s|\.git$||' || echo "unknown/repo")
   COUNTER_VALUE=$(jq -s --arg wf "build" '[.[] | select(.type=="workflow-started" and .workflow==$wf)] | length' "$STATUS" 2>/dev/null)
   case "$COUNTER_VALUE" in '' | *[!0-9]*) COUNTER_VALUE=1 ;; esac
   jq -nc \
     --arg repo "$REPO_SLUG" \
     --arg bkitVersion "$BKIT_VER" \
     --arg step "build-close-workflow" \
     --arg counterName "BUILD_ATTEMPT" \
     --argjson counterValue "$COUNTER_VALUE" \
     --arg counterSource "shell-bus" \
     --arg parentSha "$(git rev-parse HEAD)" \
     '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "build" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
     >> "$STATS" || echo "[bkit-telemetry] append failed: $STATS"
   bash "$WT/.bkit/scripts/bkit-workflow-telemetry.sh" build {YYYYMM} {FID} >/dev/null
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow${AUTO_ROUTE_SUFFIX}"
   HEAD_MSG=$(git log -1 --pretty=%B)
   if echo "$HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "HEAD-Subject Assertion FAILED: close-workflow HEAD message contains a CI-suppressing token." >&2; exit 1
   fi
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
   ```
4. Create PR:
   ```bash
   gh pr create --base dev --title "feat({FID}): {summary}" --body "$(cat <<'EOF'
   <!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->
   <!-- bkit:start -->
   https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-plan.md
   <!-- bkit:end -->
   EOF
   )"
   ```
5. **If** `gh pr create` fails → retry once. **If** still fails → **Failure Path**.
6. Extract `PR_URL` and `PR_NUMBER` from created PR. Assert both non-empty.
7. `PR_BASE=$(gh pr view {PR_NUMBER} --json baseRefName --jq .baseRefName)`. **If** `PR_BASE` != dev → **Failure Path**.
8. Run PR-title Assertion, record `build-create-pr`, run the CI-Dispatch Gate, and record `build-close-workflow` in one block:
   ```bash
   STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   AUTO_ROUTE_SUFFIX=""
   if [ -n "${BKIT_AUTO_ROUTE_FILE:-}" ] && [ -f "$BKIT_AUTO_ROUTE_FILE" ]; then
     AUTO_ROUTE_SUFFIX=$(cat "$BKIT_AUTO_ROUTE_FILE")
     rm -f "$BKIT_AUTO_ROUTE_FILE"
   else
     echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   fi
   PR_TITLE=$(gh pr view {PR_NUMBER} --json title --jq .title)
   if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2
     echo "Fix: remove the suppressing tag from the PR title." >&2
     exit 1
   fi
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg u "$PR_URL" \
     '{type:"step-done", workflow:"build", step:"build-create-pr", status:"DONE", at:$t, parentSha:$p, artifacts:[$u]}' \
     >> "$STATUS"
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
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     --arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD" --argjson a "$CI_ATTEMPTS" \
     --arg r "$CI_REASON" --argjson rt "$CI_RETRIGGER" \
     '{type:"step-done", workflow:"build", step:"build-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[],
       ciDispatch: ({outcome:$o, head:$h, attempts:$a, retrigger:$rt} + (if $r=="" then {} else {reason:$r} end))}' \
     >> "$STATUS"
   case "$CI_OUTCOME" in unresolved) echo "[bkit-ci-gate] FATAL: unresolved verdict — routing to Failure Path" >&2; exit 1 ;; esac
   ```
9. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
   ```comment
   ### Step 17 — Create PR
   [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
   ```
10. No issue changes.
    **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.reviewOptionId}" } })`.
11. Re-read issue labels post-push:
    `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
    After reading issue (`issue-read`): **If** `bkit:auto` NOT in `LABELS` → kill switch active → terminate workflow normally (current run finishes, no further automation).
12. Build `{ARTIFACTS}` link list:
    ```bash
    RR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)"); BR=$(git branch --show-current)
    ARTIFACTS=$( { git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/" | grep -E "docs/plans/{YYYYMM}/{FID}-[^/]+$"; git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep -E "/build-[^/]+$"; } | while read -r f; do printf -- '- [%s](https://github.com/{OWNER_REPO}/blob/%s/%s)\n' "$(basename "$f")" "$BR" "$f"; done )
    printf '%s\n' "$ARTIFACTS"
    TELEMETRY=$( (cd "$RR" && pnpm bkit telemetry summary --phase=build) 2>&1 || echo "[bkit-telemetry] summary unavailable" )
    printf '\n%s\n' "$TELEMETRY"
    ```
13. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ### Step 17 — Close Workflow & Create PR
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    #### Artifacts
    {ARTIFACTS}
    #### Telemetry
    {TELEMETRY}
    ```
14. Final return: Display `build-summary.md` content verbatim as final message to user; do NOT summarise or trim; do NOT auto-invoke.
    Append issue link [{ISSUE_ID} {TITLE}]({URL})

### 🔒 Gate 17 — Close Workflow & Create PR


- [ ] Auto-label presence re-read BEFORE close-workflow commit (`bkit:auto` pre-commit label read for marker sourcing)


- [ ] HEAD-Subject Assertion passed (close-workflow commit is the CI-triggering HEAD)
- [ ] Close telemetry committed (`.bkit/stats.jsonl` staged before push)
- [ ] Lock removed
- [ ] Close-workflow commit pushed to `feat/{FID}` (no PR yet → no CI)
- [ ] Open-PR probe ran (no pre-existing open PR, or probe fell through)
- [ ] PR created (`PR_URL`, `PR_NUMBER` non-empty)
- [ ] PR base verified (`PR_BASE` = dev)
- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk


- [ ] Marker `bkit [auto route]` present (if label `bkit:auto` present at close time)


- [ ] PR-title Assertion passed
- [ ] CI-Dispatch gate ran (step `build-close-workflow` recorded with `ciDispatch`)
- [ ] Workflow status updated (`build` `DONE`, step `build-create-pr` recorded with `PR_URL` artifact, step `build-close-workflow` recorded with `parentSha` and `ciDispatch` verdict)
- [ ] Final return displayed (`build-summary.md` content verbatim)


- [ ] Issue update attempted (status/state `In Review`, phase label `bkit:build` unchanged)
- [ ] Kill-switch propagation checked (post-push re-read of `bkit:auto` label on issue)
- [ ] Artifact link list embedded in `Step 17` comment
- [ ] Telemetry report embedded via summary
- [ ] Issue comment attempted (`Step 17` sections)

