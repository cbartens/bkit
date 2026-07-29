---
description: "Ship Feature — Autonomous merge and archive"
---
<!-- bkit:managed v4.11.0 — do NOT edit; run `bkit upgrade` to refresh -->

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
> - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND rows to `.bkit/friction.jsonl` in `.bkit/jsonl.md` format → continue or escalate; logging does NOT replace **Failure Path**.
> - **Deferred work:** NEVER silently drop deferred work, ALWAYS append rows to `docs/deferrals.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Discovered bugs:** NEVER silently drop discovered bugs, ALWAYS append rows to `docs/failures.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Flaky tests:** ANY tests passing only on retry / failing intermittently, ALWAYS append rows to `docs/failures.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls. **Else** → **Failure Path**.
> - **Resume:** On start, fold `$BOOK_ROOT/.../status.jsonl` — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log; fold to derive the run array. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS | FAIL | CONCERNS`), `failures`, `attempt`, `strategy` (`STANDARD | PIVOT | FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
> - **Locks:** Acquire `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's folded `$BOOK_ROOT/.../status.jsonl`: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` and last step <30min idle → **Failure Path**; `IN_PROGRESS` and last step >=30min idle → stale, clean. **Dev lock:** hold `$REPO_ROOT/.bkit/.dev.lock` across every dev critical section (checkout / stage / commit / push of `dev` in the main checkout); acquire with `set -C`, release via `trap` that removes `.dev.lock` on `EXIT`.
> - **Status branch:** All steps write `$BOOK_ROOT/.../status.jsonl` (bookkeeping never rides the branch — #384). `BOOK_ROOT` resolves the single tree every status/artifact write targets: `RUNTIME_DEVPUSHES=true` → `$REPO_ROOT` (dev tree); `RUNTIME_DEVPUSHES=false` → current working branch tree (bookkeeping lands with the phase-close PR per #341 shape A). Staging is path-scoped via `BOOK_PATHS` (frozen allow-list: 9 book paths + any present host skill mirror); NEVER stage all files (the `-A` flag) or blanket `docs/`. `dev` commit and push ONCE per run: Close → `docs({FID}): ship DONE bkit [skip ci]`; **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktrees:** **If** `RUNTIME_WORKTREES=true` (mint mode) → setup `cd`s into `.worktrees/{FID}` , **else** adopt current branch in place `WORKTREE_PATH=$REPO_ROOT`; no `git worktree add`; cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, bare `git push --force`, and ANY force-push to `dev` / `main`. **ALLOWED** as the Step 4 B2 (conflict-resolve) companion: `git push --force-with-lease` to the personal `feat/{FID}` / `fix/{FID}` branch ONLY. Pre `git push`: assert `{BRANCH}` non-empty; never force-push a shared branch.
> - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** `RUNTIME_GITHUBCLI` = false in `runtime-resolved` row in `$BOOK_ROOT/.../status.jsonl` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `gh repo view --json nameWithOwner` → `get_me` and parse `git remote`; `gh pr create` → `create_pull_request`; `gh pr view {N} --json …` → `pull_request_read` (`get`, minimal fields); `gh pr list --head X` → `list_pull_requests`; `gh pr merge {N} --squash --match-head-commit` → `merge_pull_request` (explicit skip-token-free `commit_message`; pass validated head SHA); `gh pr edit {N} --title` → `update_pull_request`; `gh pr update-branch {N}` → `update_pull_request_branch`; `gh run list --branch X` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Record via `bkit_transport_fallback_row FROM TO REASON ASSERTED_BY AT`. Tracker calls ALWAYS stay on MCP; NEVER invent `gh` read-paths for trackers.


> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (methods `add_project_item` / `update_project_item`), `mcp__github__projects_list` (method `list_project_items`) — needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.githubProject` config; absent either → board status sync silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; all writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.


> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** `MAX_MERGE_ATTEMPT` sourced via `bkit-counter-bus-config.sh` (its single definition) in the fenced shell routing block below; `bkit-ship-timeouts.sh` carries the timeout / poll / lock constants.
> - **Large Diff Guard:** When a Read line passes `git diff origin/dev..HEAD` to a subagent, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   # BOOK_ROOT — the single tree every status/artifact write targets.
   # RUNTIME_DEVPUSHES=true (worktree present, modes 1–2) → dev tree ($REPO_ROOT);
   # RUNTIME_DEVPUSHES=false (mode 3, cloud) → current working branch tree.
   WT_TOP=$(git rev-parse --show-toplevel 2>/dev/null || echo "$REPO_ROOT")
   if [ -n "${RUNTIME_DEVPUSHES:-}" ] && [ "$RUNTIME_DEVPUSHES" = "false" ]; then
     BOOK_ROOT="$WT_TOP"
   else
     BOOK_ROOT="$REPO_ROOT"
   fi
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   # Abort any in-progress rebase BEFORE appending status — a mid-rebase abort
   # discards writes that preceded it (Finding 4 / Comment 1 mechanism 2).
   if git rev-parse --git-path rebase-merge >/dev/null 2>&1 || git rev-parse --git-path rebase-apply >/dev/null 2>&1; then
     git rebase --abort
   fi
   [ -f "$STATUS" ] && jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed",workflow:"ship",at:$t}' >> "$STATUS"
   LOCK="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   rm -f "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
   # .deferred-blocked is NOT removed here — it is the sentinel the Failure Path
   # step 4 reader checks to decide handover. Only Step 1 (workflow start) clears it.
   DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"
   DEADLINE=$(( $(date +%s) + 60 ))
   DEV_HELD=0
   while [ "$(date +%s)" -lt "$DEADLINE" ]; do
     if (set -C; printf '%s ship {FID}\n' "$(date -u +%FT%TZ)" > "$DEVLOCK") 2>/dev/null; then DEV_HELD=1; break; fi
     DEVLOCK_MTIME=$(stat -f %m "$DEVLOCK" 2>/dev/null || stat -c %Y "$DEVLOCK" 2>/dev/null || echo 0)
     [ $(( $(date +%s) - DEVLOCK_MTIME )) -ge 900 ] && { rm -f "$DEVLOCK"; continue; }
     sleep 5
   done
   if [ "$DEV_HELD" = 1 ]; then
     trap 'rm -f "$DEVLOCK"' EXIT
     git -C "$REPO_ROOT" pull --ff-only origin dev
     git -C "$REPO_ROOT" add $BOOK_PATHS
     git -C "$REPO_ROOT" commit -m "chore({FID}): ship FAILED bkit [skip ci]" -- $BOOK_PATHS
     git -C "$REPO_ROOT" push origin dev
   else
     echo "dev lock busy — ship FAILED status left uncommitted on dev; it rides along on the next dev push" >&2
   fi
   ```
2. Resolve merge state — `gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null` → `FAILED_STATE` (empty when `{PR_NUMBER}` unset).
   **Decide `{LABELS}`:**
   - **If** `FAILED_STATE` = MERGED → drop all `bkit:*` phase labels, add `bkit:merged` **and** `bkit:failed`.
   - **Else** → add `bkit:failed`; prior phase label persists, additive.
   `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
3. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **If** failure triggered by max-retry exhaustion (`[ -n "${MAX_VERIFY_ATTEMPT:-}" ]` / `[ -n "${MAX_TEST_ATTEMPT:-}" ]` / `[ -n "${MAX_DEBUG_ATTEMPT:-}" ]` / `[ -n "${MAX_MERGE_ATTEMPT:-}" ]` guards, counters unset before Step 2; do NOT false-evaluate as exceeded) **or** rebase failure sentinel previously existed **or** deferred-sweep block sentinel (`docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked`) previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`, `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
6. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add $BOOK_PATHS`.
9. `git commit -m "docs({FID}): ship aborted bkit [skip ci]" -- $BOOK_PATHS`.
10. Assert `{BRANCH}` non-empty and push (force-with-lease on personal branch, plain on `dev` / `main`): `B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac` — **If** push fails → do NOT claim success on tracker.
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ### Workflow Handover
    [ship-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md)
    {FID-ship-handover.md content verbatim}
    ```
12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

**Goal:** resolve `BOOK_ROOT` + `BOOK_PATHS` once, create outbox, preflight `actions: write`, record start row.

1. Acquire concurrency lock and resolve `BOOK_ROOT` + `BOOK_PATHS`:
   ```bash
   git fetch origin dev 2>/dev/null
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before ship" >&2; exit 1; }
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   # BOOK_ROOT — the single tree every status/artifact write targets.
   # RUNTIME_DEVPUSHES=true (worktree present, modes 1–2) → dev tree ($REPO_ROOT);
   # RUNTIME_DEVPUSHES=false (mode 3, cloud) → current working branch tree (#341 shape A).
   WT_TOP=$(git rev-parse --show-toplevel 2>/dev/null || echo "$REPO_ROOT")
   if [ -n "${RUNTIME_DEVPUSHES:-}" ] && [ "$RUNTIME_DEVPUSHES" = "false" ]; then
     BOOK_ROOT="$WT_TOP"
   else
     BOOK_ROOT="$REPO_ROOT"
   fi
   # BOOK_PATHS — frozen staging allow-list (path-scoped; never -A):
   #   docs/plans/{YYYYMM}/logs/{FID}/
   #   docs/completed.md
   #   docs/deferrals.jsonl
   #   docs/failures.jsonl
   #   docs/knowledge.jsonl
   #   docs/decisions.jsonl
   #   .bkit/friction.jsonl
   #   .agents/skills
   #   skills-lock.json
   BOOK_PATHS="docs/plans/$YYYYMM/logs/{FID}/ docs/completed.md docs/deferrals.jsonl docs/failures.jsonl docs/knowledge.jsonl docs/decisions.jsonl .bkit/friction.jsonl .agents/skills skills-lock.json"
   # Host skill mirrors — `npx skills remove` (Step 11) deletes these alongside
   # .agents/skills/<name>, so they must be stageable or the deletions leak into
   # the working tree. Appended only when present on disk OR tracked in the
   # index: staging a pathspec that matches neither is a fatal error, and
   # a claude-only consumer has no .cursor/.opencode mirror at all.
   for d in .claude/skills .cursor/skills .opencode/skills; do
     if [ -e "$d" ] || git ls-files --error-unmatch "$d" >/dev/null 2>&1; then
       BOOK_PATHS="$BOOK_PATHS $d"
     fi
   done
   # Outbox: outside every worktree so it survives `worktree remove --force`.
   OUTBOX="$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}"
   mkdir -p "$OUTBOX"
   # Clear stale sentinels from a prior run.
   rm -f "$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/.deferred-blocked"
   rm -f "$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/.rebase-failed"
   LOCK="$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS="$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
   if ! (set -C; printf '%s ship\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null; then
     LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
     SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
     . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
     if [ -f "$SRC" ]; then
       LAST=$(jq -s --arg w "$LOCK_WORKFLOW" "$BKIT_STATUS_FOLD"' fold | [.[] | select(.workflow==$w)] | last' "$SRC" 2>/dev/null || echo 'null')
     else
       LAST=$(jq --arg w "$LOCK_WORKFLOW" '[.[] | select(.workflow==$w)] | last' "$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.json" 2>/dev/null || echo 'null')
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
     (set -C; printf '%s ship\n' "$(date -u +%FT%TZ)" > "$LOCK") 2>/dev/null || { echo "Lock contended for {FID}" >&2; exit 1; }
   fi
   # Preflight actions:write permission once (needed for gh workflow run in Step 5).
   gh api /repos/{OWNER_REPO}/actions/permissions >/dev/null 2>&1 || echo "[bkit-ship] actions:write preflight — gh may lack dispatch permission" >&2
   ```
   **If** lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else**:
   Extract from session prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:ship"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels[].name` → `LABELS`, `body` → `DESCRIPTION`, `title` → `TITLE`, `html_url` → `URL`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
6. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
7. **If** NO `FID` → create `FID` from `{ISSUE_ID}` and kebab from title, no stopwords, <=3 tokens, lowercase; one `FID` for all artifacts once set. Format `{ISSUE_ID}-{slug}`.
   Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
8. Add `bkit:ship` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.progressOptionId}" } })`.
9. Write `ship-start-workflow` row to `$BOOK_ROOT/.../status.jsonl`:
   ```bash
   PARENT_SHA=$(git rev-parse HEAD)
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-input.md"]}' \
     >> "$STATUS"
   ```
10. Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
    `{BODY}` = fenced block below:
    ```comment
    ## Ship Workflow
    ### Step 1 — Start Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `FID`, `BOOK_ROOT`, `BOOK_PATHS`)
- [ ] `BOOK_ROOT` resolved (RUNTIME_DEVPUSHES-conditional)
- [ ] Outbox created (`$OUTBOX`)
- [ ] Issue ID resolved (`ISSUE_ID` non-empty when tracker wired; may be empty under `none`)
- [ ] Lock acquired (`$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] Stale sentinels cleared (`.deferred-blocked`, `.rebase-failed`)


- [ ] Issue update attempted (phase label `bkit:ship`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)


---

## 🤖 Step 2 — Verify PR (Worktree Setup + Regression Guard)

**Goal:** create/resume worktree (NO rebase — Path A reads it read-only), read `ENTRY_HEAD` + `mergeable`, emit `ship-worktree-setup` + `ship-regression-guard`. Bookkeeping never rides the branch (#384).

1. Create / resume worktree, or adopt current branch in place (NO rebase — Path A):
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_runtime_detect "$REPO_ROOT" "{FID}" || { echo "[bkit-runtime] runtime detect failed" >&2; exit 2; }
   bkit_runtime_assert_resolved || exit 2
   if [ "$RUNTIME_WORKTREES" = "true" ]; then
     git worktree prune
     WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
     if [ -d "$WORKTREE_PATH" ]; then
       cd "$WORKTREE_PATH"
       # Path A: NO rebase. The worktree is read-only until Step 4 (Path B).
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
     # Write ownership marker to outbox (outside the worktree — survives removal/crash).
     OUTBOX="$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}"
     mkdir -p "$OUTBOX"
     touch "$OUTBOX/.worktree-owned"
     for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
       [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
     done
     [ -d "$REPO_ROOT/.vale/styles/write-good" ] && cp -R "$REPO_ROOT/.vale/styles/write-good" "$WORKTREE_PATH/.vale/styles/"
     pnpm install --frozen-lockfile
   else
     WORKTREE_PATH="$REPO_ROOT"
     cd "$WORKTREE_PATH"
     [ "$(git branch --show-current)" != "dev" ] || { echo "Adopt mode: current branch is dev — refusing to work in place on dev" >&2; exit 1; }
     mkdir -p docs/plans/{YYYYMM}/logs/{FID}/
   fi
   bkit_runtime_row ship "$(date -u +%FT%TZ)" >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   ```
2. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
3. **If** `BRANCH` NOT `dev` **and** does NOT contain `{FID}` **and** does NOT contain `{ISSUE_ID}` (case-insensitive) → **Failure Path**.
4. `gh pr list --head "$(git branch --show-current)" --state all --json number,baseRefName,state --jq '[.[] | select(.state == "OPEN")] + [.[] | select(.state == "MERGED")] | .[0]'` → extract `PR_NUMBER`, `PR_BASE` and `state`. **If** `PR_NUMBER` empty → **Failure Path**. **If** `PR_BASE` != dev → **Failure Path**.
5. **Route:**
   - **If** `state` = MERGED → record the resume marker, then → **Step 9**:
     ```bash
     STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
     jq -nc --arg t "$(date -u +%FT%TZ)" \
       '{type:"ship-merged-on-entry", workflow:"ship", at:$t}' >> "$STATUS"
     ```
     This marker is what lets an auditor tell a MERGED-on-entry resume from a run
     that simply dropped rows: sub-step 8 below is skipped on this route, so the
     absence of `ship-worktree-setup` / `ship-regression-guard` is otherwise
     indistinguishable from a bookkeeping hole.
   - **Else** → next sub-step.
6. Read PR head SHA (`ENTRY_HEAD`) and mergeable state:
   ```bash
   ENTRY_HEAD=$(gh pr view {PR_NUMBER} --json headRefOid --jq .headRefOid 2>/dev/null)
   [ -z "$ENTRY_HEAD" ] && { echo "Cannot read PR head — query failed (403 = PAT scope)" >&2; exit 1; }
   MERGEABLE=$(gh pr view {PR_NUMBER} --json mergeable --jq .mergeable 2>/dev/null)
   ```
   **If** exit non-zero → **Failure Path**.
7. `gh pr view {PR_NUMBER} --json statusCheckRollup` → assert call succeeds. **If** query errors **or** any check failed **or** rollup empty → **Failure Path**.
8. Update status (bookkeeping to `$BOOK_ROOT`, NO branch commit — #384):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-input.md"]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-regression-guard", status:"DONE", verdict:"PASS", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
9. 
`mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   
`{BODY}` = fenced block below:

```comment
### Step 2 — Verify PR (Worktree Setup + Regression Guard)
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
[$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl)
```


### 🔒 Gate 2 — Verify PR

- [ ] Worktree created / resumed or current branch adopted (NO rebase — Path A)
- [ ] Branch non-empty (`BRANCH`, updated to worktree branch)
- [ ] On branch that passed eligibility
- [ ] `PR_NUMBER` non-empty; `PR_BASE` = dev
- [ ] `ENTRY_HEAD` read (PR head SHA at entry — frozen for the merge)
- [ ] `MERGEABLE` state read
- [ ] No PR CI failures confirmed
- [ ] Artifact written (`ship-input.md`, non-empty)
- [ ] Workflow status updated (`ship-worktree-setup`, `ship-regression-guard` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 2` section)


---

## 🤖 Step 3 — Base Check

**Goal:** classify Path A (dev is ancestor → merge directly) vs Path B (dev moved → integration required).

1. Determine whether `origin/dev` is an ancestor of the PR head:
   ```bash
   git fetch origin dev
   if git merge-base --is-ancestor origin/dev "$ENTRY_HEAD"; then
     BASE_PATH=A
   else
     BASE_PATH=B
   fi
   ```
2. **Route:**
   - **If** `BASE_PATH` = A → **Step 5** (skip integration — dev has not moved).
   - **If** `BASE_PATH` = B → **Step 4** (integration required).

### 🔒 Gate 3 — Base Check

- [ ] `origin/dev` fetched
- [ ] Ancestor verdict determined (`BASE_PATH` in `A|B`)

---

## 🧠 Step 4 — Integrate (Path B only)

**Run only if** `BASE_PATH` = B. Path A skips this step entirely.

1. **If** `MERGEABLE` = MERGEABLE (B1 — no textual conflict): refresh the PR head server-side:
   ```bash
   gh pr update-branch {PR_NUMBER} || { echo "[bkit-ship] gh pr update-branch failed for {PR_NUMBER} (403 = actions:write scope, network, branch protection) — PR head NOT integrated" >&2; exit 1; }
   ```
   → **Step 5** (re-validate the new head).
2. **If** `MERGEABLE` = CONFLICTING (B2 — textual conflict): resolve locally + push:
   1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
      Context: You are a subagent in the Ship phase. Textual conflict against `origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
      Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`.
      Update: Conflicted source files.
      Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
   2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
   3. Read `ship-conflict-resolve.md` until `<!-- verdict:end -->` → extract `Verdict` as `RESOLVE_VERDICT`.
   4. **If** `RESOLVE_VERDICT` = PASS → commit and push (B2 is the ONLY step that pushes to `feat/{FID}`):
      ```bash
      # B2 stages ALL working-tree changes — resolved source files first
      # (`-u`: modifications to tracked files = the conflict resolutions the
      # subagent wrote), then the bookkeeping allow-list (the
      # ship-conflict-resolve.md artifact lands under $BOOK_PATHS). This is
      # the ONLY commit that pushes feat/{FID}; every change here is
      # intentional by construction.
      git add -u && git add $BOOK_PATHS
      git commit -m "chore({FID}): conflict-resolve bkit [skip ci]"
      git push --force-with-lease origin "feat/{FID}"
      ```
      **Else** → **Failure Path** (non-mechanical conflict → handover).
3. **Subagent:** Invoke `@bkit-ship-conflict-resolve` (non-mechanical handover — see step 2.1 above for the pattern; this sub-step covers the case where `mergeable` resolution fails unexpectedly). → **Failure Path**.
4. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "${RESOLVE_VERDICT:-SKIP}" \
     '{type:"step-done", workflow:"ship", step:"ship-conflict-resolve", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md"]}' \
     >> "$STATUS"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Integrate (Path B) - Verdict: {RESOLVE_VERDICT}
   ```

### 🔒 Gate 4 — Integrate

- [ ] Path classified (B1 mergeable / B2 conflicting)
- [ ] B1: `gh pr update-branch` attempted
- [ ] B2: subagent invoked (`@bkit-ship-conflict-resolve`, no inline work)
- [ ] B2: artifact written (`ship-conflict-resolve.md`, non-empty)
- [ ] B2: verdict extracted and valid (`RESOLVE_VERDICT` in `PASS|FAIL`)
- [ ] B2: pushed to `feat/{FID}` via `--force-with-lease` (ONLY step that pushes the branch)
- [ ] Workflow status updated (step `ship-conflict-resolve` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 4` section)


---

## 🤖 Step 5 — Re-validate + Deferred Sweep

**Goal:** if the head moved (Path B integration), wait for CI at the new head; then run the pre-merge completeness sweep.

1. Re-validate on observed head movement (not path label — also covers moves ship did not cause):
   ```bash
   CURRENT_HEAD=$(gh pr view {PR_NUMBER} --json headRefOid --jq .headRefOid 2>/dev/null)
   if [ "$CURRENT_HEAD" != "$ENTRY_HEAD" ]; then
     # Head moved — dispatch CI unconditionally (CONFLICTING PRs fire nothing by
     # construction; buried [skip ci] poisons push-triggered dispatch identically).
     . "$REPO_ROOT/.bkit/scripts/bkit-ship-timeouts.sh"
     gh workflow run ci.yml --ref "feat/{FID}" || { echo "[bkit-ship] gh workflow run failed (403 = actions:write scope)" >&2; exit 1; }
     # Sample rate_limit before the poll loop (shapes code-20 message if exhausted).
     gh api rate_limit >/dev/null 2>&1
     DEADLINE=$(( $(date +%s) + ${SHIP_CI_WAIT_TIMEOUT_S:-1800} ))
     ATTEMPT=0
     while [ "$(date +%s)" -lt "$DEADLINE" ]; do
       ATTEMPT=$((ATTEMPT + 1))
       RUN_STATE=$(gh run list --branch "feat/{FID}" --workflow ci.yml --limit 1 --json status,conclusion --jq '.[0] // empty' 2>/dev/null)
       RUN_STATUS=$(echo "$RUN_STATE" | jq -r '.status // empty')
       [ "$RUN_STATUS" = "completed" ] && break
       sleep "${SHIP_POLL_INTERVAL_S:-30}"
     done
     if [ "$RUN_STATUS" != "completed" ]; then
        jq -nc --arg t "$(date -u +%FT%TZ)" --argjson attempt "$ATTEMPT" --argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}" \
          '{type:"ship-revalidate-timeout", workflow:"ship", at:$t, attempt:$attempt, timeout_s:$timeout}' \
          >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
       echo "[bkit-ship] CI did not complete within ${SHIP_CI_WAIT_TIMEOUT_S:-1800}s after $ATTEMPT polls" >&2
       exit 1
     fi
   fi
   ```
   **If** exit non-zero → **Failure Path**.
2. **Subagent:** Invoke `@bkit-ship-deferred-sweep` using `Agent` tool:
   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan*.md`, `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`, `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
3. Assert subagent Create file exists and is non-empty. **If** file empty → **Failure Path**.
4. Read `ship-deferred-sweep.md` until `<!-- verdict:end -->` → extract `Verdict` as `SWEEP_VERDICT`.
5. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SWEEP_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-deferred-sweep", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md"]}' \
     >> "$STATUS"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Re-validate + Deferred Sweep - Verdict: {SWEEP_VERDICT}
   ```
7. Route:
   - **If** `SWEEP_VERDICT` = PASS → Step 6.
   - **If** `SWEEP_VERDICT` = FAIL → write `.deferred-blocked` sentinel under `BOOK_ROOT` (the Failure Path step 4 reader checks this to route to `@bkit-debug-abort-handover`), then **Failure Path**:
     ```bash
     touch "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
     ```
   - **Else** → **Failure Path**.

### 🔒 Gate 5 — Re-validate + Deferred Sweep

- [ ] Head movement detected and CI re-validated (or head unchanged)
- [ ] CI completed at current head (no timeout exhaustion)
- [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
- [ ] Artifact written (`ship-deferred-sweep.md`, non-empty)
- [ ] Verdict extracted and valid (`SWEEP_VERDICT` in `PASS|FAIL`)
- [ ] Workflow status updated (step `ship-deferred-sweep` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 5` section)


---

## 🤖 Step 6 — Merge Gate + Merge PR

**Goal:** the ONLY merge precondition is `bkit-ship-gate.sh assert` at the current head; merge with `--match-head-commit`.

1. Derive `{MERGE_ATTEMPT}`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   . "$REPO_ROOT/.bkit/scripts/bkit-ship-timeouts.sh"
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   MERGE_ATTEMPT=$(counter_next "$STATUS" ship ship-merge-pr) || exit 2
   ```
2. Write pre-merge snapshot to outbox BEFORE the gate fires:
   ```bash
   GATE_HEAD=$(gh pr view {PR_NUMBER} --json headRefOid --jq .headRefOid 2>/dev/null)
   DEV_SHA=$(git rev-parse origin/dev)
   ANCESTOR=$(git merge-base --is-ancestor origin/dev "$GATE_HEAD" 2>/dev/null && echo true || echo false)
   CAPSTONE_RUN=$(gh run list --branch "feat/{FID}" --workflow ci.yml --limit 1 --json databaseId,url --jq '.[0] // {}' 2>/dev/null)
   MERGEABLE_STATE=$(gh pr view {PR_NUMBER} --json mergeable --jq .mergeable 2>/dev/null)
   jq -nc \
     --arg gateHead "$GATE_HEAD" --arg devSha "$DEV_SHA" --arg ancestor "$ANCESTOR" \
     --argjson capstone "$CAPSTONE_RUN" --arg mergeable "$MERGEABLE_STATE" \
     '{type:"ship-pre-merge-snapshot", workflow:"ship", gateHead:$gateHead, devSha:$devSha, ancestor:$ancestor, capstone:$capstone, mergeable:$mergeable}' \
     >> "$OUTBOX/pre-merge-snapshot.jsonl"
   ```
3. Run HEAD-Subject Assertion:
   ```bash
   PR_TITLE=$(gh pr view {PR_NUMBER} --json title --jq .title)
   if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
     echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2
     exit 1
   fi
   ```
   **If** assertion fails → **Failure Path**.
4. Assert the gate at the current head (the ONLY merge precondition):
   ```bash
   GATE_SH="$REPO_ROOT/.bkit/scripts/bkit-ship-gate.sh"
   # Export STATUS_PATH so the gate's override audit row lands in the canonical
   # BOOK_ROOT status log (not the literal-brace default the gate falls back to
   # when STATUS_PATH is unset). {YYYYMM}/{FID} are the standard agent-
   # substituted placeholders (same shape as every STATUS= assignment here).
   export STATUS_PATH="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   # `|| GATE_EXIT=$?` captures a refusal exit code without `set -e` aborting
   # before the routing block below runs. Initialised to 0 for the success path.
   GATE_EXIT=0
   # `--branch` is what makes code 14 (stale green at a superseded head)
   # separable from code 10 (never validated): the gate's head-keyed run query is
   # filtered server-side, so a moved head returns an empty list either way and
   # only a second, branch-scoped query can tell the two apart.
   bash "$GATE_SH" assert --head "$GATE_HEAD" --repo "{OWNER_REPO}" --branch "feat/{FID}" || GATE_EXIT=$?
   ```
   **If** `GATE_EXIT` != 0 → write a status row carrying the exit code, then route:
   ```bash
   jq -nc --arg t "$(date -u +%FT%TZ)" --argjson code "$GATE_EXIT" --arg head "$GATE_HEAD" \
     '{type:"ship-gate-refusal", workflow:"ship", at:$t, exitCode:$code, head:$head}' \
     >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   ```
   - A code 11 (in progress — poll), 14 (stale green), or 10 (no run) → **Step 5** (re-validate / poll — CI still running or head moved).
   - Any other refusal (12/13/15/16/20) → **Failure Path**.
5. Merge with empty body and `--match-head-commit` (server refuses if head moved). Thread the `bkit [auto route]` marker onto the squash `--subject` when `{LABELS}` (assert in scope — populated at Step 1, `bkit-ship.md:247`/`:250`) carries `bkit:auto`: the squash-merge commit is what actually lands on `dev`, and `bkit-cloud.yml`'s free-tier gate (#363) reads `head_commit.message` on that commit to admit the post-merge `dev` CI trigger — same idiom as `bkit-build.md:1261` / `bkit-debug.md:1262`, set and used in the SAME shell block (do not assume the value survives a Bash-tool-call boundary):
   ```bash
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   if [ "$(gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null)" != "MERGED" ]; then
     gh pr merge {PR_NUMBER} --squash --delete-branch --match-head-commit "$GATE_HEAD" \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})${AUTO_ROUTE_SUFFIX}" \
       --body ""
   fi
   ```
   The marker becomes permanent `dev` history (accepted — inherent to reading `head_commit.message`; do not "clean it up" later). When `bkit:auto` is absent (or `bkit:tracker none`, where `{LABELS}` is empty), `AUTO_ROUTE_SUFFIX` stays empty and the subject is unchanged.
6. `gh pr view {PR_NUMBER} --json state` → extract `state`.
7. Decide `MERGE_VERDICT`:
   - **If** `state` = MERGED → `MERGE_VERDICT` = PASS; `MERGE_FAILURES` = 0.
   - **Else** → `MERGE_VERDICT` = FAIL; `MERGE_FAILURES` = 1.
8. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   MERGE_ATTEMPT=$(counter_current "$STATUS" ship ship-merge-pr) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$MERGE_VERDICT" --argjson a "$MERGE_ATTEMPT" --argjson f "$MERGE_FAILURES" \
     '{type:"step-done", workflow:"ship", step:"ship-merge-pr", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
9. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 6 — Merge Gate + Merge PR - Verdict: {MERGE_VERDICT}
   ```
10. Route:

- **If** `state` = MERGED → Step 9.
- **If** `state` != MERGED — run counter-bus routing:
  ```bash
  REPO_ROOT=$(git rev-parse --show-toplevel)
  . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
  . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
  . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
  STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
  MERGE_ATTEMPT=$(counter_current "$STATUS" ship ship-merge-pr) || exit 2
  decide_next MERGE_ATTEMPT "$MERGE_ATTEMPT" "$MAX_MERGE_ATTEMPT" step-7 failure-path
  ```
  - **If** exit 0 (printed `step-7`) → Step 7.
  - **If** exit 1 (printed `failure-path`) → **Failure Path**.
  - **If** any other exit → **Failure Path**.
- **Else** → **Failure Path**.

### 🔒 Gate 6 — Merge Gate + Merge PR

- [ ] Pre-merge snapshot written to outbox (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run, `mergeable`)
- [ ] HEAD-Subject Assertion passed (no `[skip ci]` in PR title)
- [ ] Gate asserted at current head (`bkit-ship-gate.sh assert`, exit 0)
- [ ] PR merge attempted with `--match-head-commit` (server refuses on head drift)
- [ ] State extracted (`state`, MERGED or not)
- [ ] Verdict extracted and valid, failures extracted (`MERGE_VERDICT` in `PASS|FAIL`; `MERGE_FAILURES`)
- [ ] Workflow status updated (step `ship-merge-pr` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 6` section)


---

## 🧠 Step 7 — Failure Diagnose

**Run only if** `state` != MERGED.

1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
2. Assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
3. Read `ship-failure-diagnose-{MERGE_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
4. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   MERGE_ATTEMPT=$(counter_current "$STATUS" ship ship-merge-pr) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$MERGE_ATTEMPT" \
     '{type:"step-done", workflow:"ship", step:"ship-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-'"${MERGE_ATTEMPT}"'.md"]}' \
     >> "$STATUS"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 7 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Attempt: {MERGE_ATTEMPT}
   ```

### 🔒 Gate 7 — Failure Diagnose

- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted and valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`)
- [ ] Workflow status updated (step `ship-failure-diagnose` recorded with `parentSha`, `verdict`)


- [ ] Issue comment attempted (`Step 7` section)


---

## 🧠 Step 8 — Failure Remediate

**Run only if** `state` != MERGED. Code-level failures route back to build (via handover), NOT a source-file retry loop that re-merges identical remote content.

1. Read the `$BOOK_ROOT/.../status.jsonl` and extract `PRIOR_STRATEGY`:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PRIOR_STRATEGY=$(route_last_strategy "$STATUS" ship ship-failure-remediate) || exit 2
   STRATEGY=$(ladder_next "$PRIOR_STRATEGY") || exit 2
   ```
2. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Strategy: `{STRATEGY}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
3. Assert subagent Create file exists and is non-empty. **If** file empty → **Failure Path**.
4. Read `ship-failure-remediate-{MERGE_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
5. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   REPO_ROOT=$(git rev-parse --show-toplevel)
   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
   MERGE_ATTEMPT=$(counter_current "$STATUS" ship ship-merge-pr) || exit 2
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$MERGE_ATTEMPT" --arg strat "$STRATEGY" \
     '{type:"step-done", workflow:"ship", step:"ship-failure-remediate", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-'"${MERGE_ATTEMPT}"'-log.md"]}' \
     >> "$STATUS"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Strategy: {STRATEGY} - Attempt: {MERGE_ATTEMPT}
   ```
7. **If** `REMEDIATE_VERDICT` = PASS → Step 6 (re-run merge). **Else** → **Failure Path** (code-level failures route back to build via handover — NO source-file retry loop).

### 🔒 Gate 8 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`ship-failure-remediate-{MERGE_ATTEMPT}-log.md`, non-empty)
- [ ] Verdict extracted and valid, strategy extracted (`REMEDIATE_VERDICT` in `PASS|CONCERNS|FAIL`; `STRATEGY`)
- [ ] Workflow status updated (step `ship-failure-remediate` recorded with `parentSha`, `verdict`, `strategy`)


- [ ] Issue comment attempted (`Step 8` section)


---

## 🤖 Step 9 — Switch to Dev

**Run only if** `state` = MERGED.

1. Switch to `dev` and fast-forward — skipped when `RUNTIME_DEVPUSHES` != true:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   cd "$REPO_ROOT"
   [ "$(git config --get core.bare)" = "true" ] && [ -d "$REPO_ROOT/.git" ] && git config core.bare false
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_runtime_detect "$REPO_ROOT" "{FID}" || { echo "[bkit-runtime] runtime detect failed" >&2; exit 2; }
   bkit_runtime_assert_resolved || exit 2
   if [ "$RUNTIME_DEVPUSHES" != "true" ]; then
     echo "[bkit-ship] RUNTIME_DEVPUSHES=false (RUNTIME=$RUNTIME) — skipping local dev checkout/sync; the merge already landed server-side (Step 6)" >&2
   else
     DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"
     DEADLINE=$(( $(date +%s) + 600 ))
     until (set -C; printf '%s ship {FID}\n' "$(date -u +%FT%TZ)" > "$DEVLOCK") 2>/dev/null; do
       DEVLOCK_MTIME=$(stat -f %m "$DEVLOCK" 2>/dev/null || stat -c %Y "$DEVLOCK" 2>/dev/null || echo 0)
       [ $(( $(date +%s) - DEVLOCK_MTIME )) -ge 900 ] && { rm -f "$DEVLOCK"; continue; }
       [ "$(date +%s)" -ge "$DEADLINE" ] && { echo "dev lock held by: $(cat "$DEVLOCK" 2>/dev/null) — serialise this run or use a separate clone" >&2; exit 1; }
       sleep 10
     done
     # trap releases .dev.lock on EXIT (dev-tree serialisation)
     trap 'rm -f "$DEVLOCK"' EXIT
     [ "$RUNTIME_WORKTREES" = "true" ] && [ "$RUNTIME_DEVPUSHES" = "true" ] || { echo "Refusing local dev checkout: RUNTIME_WORKTREES='$RUNTIME_WORKTREES' RUNTIME_DEVPUSHES='$RUNTIME_DEVPUSHES'" >&2; exit 1; }
     git checkout dev
     [ "$(git branch --show-current)" = "dev" ] || { echo "Not on dev after checkout (on '$(git branch --show-current)') — aborting dev ops" >&2; exit 1; }
     git fetch origin dev
     AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
     if [ "$AHEAD" -gt 0 ]; then
       AHEAD_NON_SKIP=$(git log --format=%s origin/dev..dev | grep -cv '\[skip ci\]' || true)
       [ "$AHEAD_NON_SKIP" -gt 0 ] && {
         echo "Local dev is $AHEAD commits ahead of origin/dev, $AHEAD_NON_SKIP of them without [skip ci]:" >&2
         git log --oneline origin/dev..dev | grep -v '\[skip ci\]' >&2
         echo "Ship will not push these for you: a CI run on dev can cancel the in-flight run validating this merge." >&2
         echo "Reconcile manually, then re-run ship: git -C \"$REPO_ROOT\" pull --rebase origin dev && git -C \"$REPO_ROOT\" push origin dev" >&2
         exit 1
       }
       git pull --rebase origin dev
       git push origin dev
     else
       git pull --ff-only origin dev
     fi
     pnpm install --frozen-lockfile
   fi
   ```
   **If** exit non-zero → **Failure Path**.
2. Update status:
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-switch-to-dev", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
3. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Switch to Dev
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   ```

### 🔒 Gate 9 — Switch to Dev

- [ ] On `dev` branch
- [ ] Dev branch up to date with origin (`dev`)
- [ ] Workflow status updated (step `ship-switch-to-dev` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 9` section)


---

## 🧠 Step 10 — Update Docs & Summary

**Run only if** `state` = MERGED.

1. `git log origin/dev --oneline | head -5` → **If** NO squash SHA → **Failure Path**.
2. Assert `FID` non-empty before any path operations.
3. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-ship-update-docs`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
     Update: Doc files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
   - **Subagent:** Invoke `@bkit-ship-summary`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-*.md` (excluding `ship-update-docs.md`), `gh pr view {PR_NUMBER} --json title,body,additions,deletions,changedFiles,commits,mergedAt`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md`.
4. Wait for all subagents to complete → assert subagent Update / Create files exist, are non-empty, and resolved under working directory supplied in Context; do NOT trust paths reported by subagents. **If** any file empty → **Failure Path**.
5. Derive `UPDATE_DOCS_VERDICT`:
   ```bash
   COMPLETED_HIT=$(grep -c "docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/.*{FID}" docs/completed.md || echo 0)
   if [ "$COMPLETED_HIT" -gt 0 ]; then UPDATE_DOCS_VERDICT=PASS; else UPDATE_DOCS_VERDICT=FAIL; fi
   ```
   Read `ship-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
6. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg uv "$UPDATE_DOCS_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-update-docs", status:"DONE", verdict:$uv, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md"]}' \
     >> "$STATUS"
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg sv "$SUMMARY_VERDICT" \
     '{type:"step-done", workflow:"ship", step:"ship-summary", status:"DONE", verdict:$sv, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md"]}' \
     >> "$STATUS"
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Update Docs & Summary - Verdict: {SUMMARY_VERDICT} - Docs: {UPDATE_DOCS_VERDICT}
   [ship-summary.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md)
   {FID-ship-summary.md content verbatim}
   ```
8. Route:
   - **If** `UPDATE_DOCS_VERDICT` = PASS **or** CONCERNS **and** (`SUMMARY_VERDICT` = PASS **or** CONCERNS) → Step 11.
   - **If** `UPDATE_DOCS_VERDICT` = FAIL **or** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
   - **Else** → **Failure Path**.

### 🔒 Gate 10 — Update Docs & Summary

- [ ] Squash SHA verified on `origin/dev`
- [ ] Plans canonical at `docs/plans/{YYYYMM}/`
- [ ] Subagents invoked (`@bkit-ship-update-docs`, `@bkit-ship-summary`, no inline work)
- [ ] Artifact written (`ship-update-docs.md`, non-empty)
- [ ] Artifact written (`ship-summary.md`, non-empty)
- [ ] Verdict extracted and valid (`UPDATE_DOCS_VERDICT` in `PASS|FAIL`)
- [ ] Verdict extracted and valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (steps `ship-update-docs`, `ship-summary` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 10` section)


---

## 🤖 Step 11 — Prune Skills

**Run only if** `state` = MERGED.

1. Prune feature-specific skills — uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via the CLI:
   ```bash
   for skill_dir in .agents/skills/*/; do
     [ -d "$skill_dir" ] || continue
     skill=$(basename "$skill_dir")
     grep -qE "(^|[^A-Za-z0-9-])${skill}([^A-Za-z0-9-]|$)" .agents/skills.md || npx skills remove "$skill" -y
   done
   ```
   `npx skills remove` deletes the host mirrors (`.claude/skills`, `.cursor/skills`,
   `.opencode/skills`) alongside `.agents/skills/<name>`. Those mirror paths are in
   `BOOK_PATHS` (Step 1) so the Close-step staging carries the deletions. Without
   them the prune commit holds only `.agents/skills` + `skills-lock.json` and the
   mirror deletions leak into the working tree, where the next unrelated staging
   sweeps them into a foreign commit.
2. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   git status --short
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-prune-skills", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
3. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 11 — Prune Skills
   ```

### 🔒 Gate 11 — Prune Skills

- [ ] Feature-specific skills pruned
- [ ] Logs at `docs/plans/{YYYYMM}/logs/{FID}/` retained for manual cleanup
- [ ] Workflow status updated (step `ship-prune-skills` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 11` section)


---

## 🤖 Step 12 — Worktree Cleanup

**Run only if** `state` = MERGED.

1. Remove the feature worktree (ownership-scoped — only worktrees this run created):
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
   # Outbox lives outside every worktree so it survives `worktree remove --force`.
   OUTBOX="$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}"
   # Ownership bit: written at worktree creation (Step 2) to the outbox AND the
   # $BOOK_ROOT/.../status.jsonl row. Absent-default = "not mine" — never remove a worktree
   # this run did not create (design/plan/build/debug conventions untouched).
   if [ -d "$WORKTREE_PATH" ]; then
     if [ -f "$OUTBOX/.worktree-owned" ]; then
       git worktree remove "$WORKTREE_PATH" --force
       git worktree prune
     else
       echo "[bkit-ship] worktree $WORKTREE_PATH exists but ownership marker ($OUTBOX/.worktree-owned) absent — not mine, skipping removal" >&2
     fi
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
4. Update status (bookkeeping to `$BOOK_ROOT`):
   ```bash
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   PARENT_SHA=$(git rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-worktree-cleanup", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 12 — Worktree Cleanup
   ```

### 🔒 Gate 12 — Worktree Cleanup

- [ ] Worktree removed (`.worktrees/{FID}`, or was already absent, or ownership marker absent → skipped)
- [ ] Worktree prune executed (`git worktree prune`)
- [ ] Local `feat/{FID}` branch deleted (or already absent)
- [ ] Remote `origin/feat/{FID}` branch deleted (or already absent)
- [ ] Workflow status updated (step `ship-worktree-cleanup` recorded with `parentSha`)


- [ ] Issue comment attempted (`Step 12` section)


---

## 🤖 Step 13 — Close Workflow

1. Assert squash-merge CI run finished and its test tiers passed:
   ```bash
   SQUASH_SHA=$(gh pr view {PR_NUMBER} --json mergeCommit --jq .mergeCommit.oid)
   RUN=$(gh run list --branch dev --commit "$SQUASH_SHA" --json databaseId,status,conclusion --limit 1)
   RUN_ID=$(echo "$RUN" | jq -r '.[0].databaseId // empty')
   [ -z "$RUN_ID" ] && { echo "No CI run found for squash merge $SQUASH_SHA — feature merge not test-validated" >&2; exit 1; }
   RUN_STATUS=$(echo "$RUN" | jq -r '.[0].status // empty')
   [ "$RUN_STATUS" != "completed" ] && { echo "CI run $RUN_ID for squash merge $SQUASH_SHA has not completed (status: ${RUN_STATUS:-unknown}) — feature merge not test-validated" >&2; exit 1; }
   RUN_CONCLUSION=$(echo "$RUN" | jq -r '.[0].conclusion // empty')
   [ "$RUN_CONCLUSION" = "cancelled" ] && { echo "CI run $RUN_ID for squash merge $SQUASH_SHA was cancelled — feature merge not test-validated" >&2; exit 1; }
   TESTS_JOBS=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select(.name | startswith("bkit-tests")) | {name, conclusion}]')
   [ "$(echo "$TESTS_JOBS" | jq 'length')" -eq 0 ] && { echo "No bkit-tests* job on CI run $RUN_ID for squash merge $SQUASH_SHA — feature merge not test-validated" >&2; exit 1; }
   LIVE_NOT_OK=$(echo "$TESTS_JOBS" | jq -r '[.[] | select(.name == "bkit-tests-live") | select(.conclusion == "failure" or .conclusion == "cancelled") | "\(.name)=\(.conclusion)"] | join(", ")')
   if [ -n "$LIVE_NOT_OK" ]; then
     GATE_JOBS=$(echo "$TESTS_JOBS" | jq -c '[.[] | select(.name != "bkit-tests-live" and .name != "bkit-tests-check")]')
   else
     GATE_JOBS=$(echo "$TESTS_JOBS" | jq -c 'if any(.[]; .name == "bkit-tests-check") then map(select(.name == "bkit-tests-check")) else . end')
   fi
   TESTS_NOT_OK=$(echo "$GATE_JOBS" | jq -r '[.[] | select(.conclusion != "success") | "\(.name)=\(.conclusion // "null")"] | join(", ")')
   [ -n "$TESTS_NOT_OK" ] && { echo "Test tiers not green on CI run $RUN_ID for squash merge $SQUASH_SHA: $TESTS_NOT_OK — feature merge not test-validated" >&2; exit 1; }
   [ -n "$LIVE_NOT_OK" ] && echo "Live tier not green on CI run $RUN_ID ($LIVE_NOT_OK) — post-merge canary, not a merge gate; reproduce with /bkit-debug" >&2
   ```
   **If** exit non-zero → **Failure Path**.
2. Update status, write close telemetry, commit, and push (single path-scoped `[skip ci]` commit):
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"
   DEADLINE=$(( $(date +%s) + 600 ))
   until (set -C; printf '%s ship {FID}\n' "$(date -u +%FT%TZ)" > "$DEVLOCK") 2>/dev/null; do
     DEVLOCK_MTIME=$(stat -f %m "$DEVLOCK" 2>/dev/null || stat -c %Y "$DEVLOCK" 2>/dev/null || echo 0)
     [ $(( $(date +%s) - DEVLOCK_MTIME )) -ge 900 ] && { rm -f "$DEVLOCK"; continue; }
     [ "$(date +%s)" -ge "$DEADLINE" ] && { echo "dev lock held by: $(cat "$DEVLOCK" 2>/dev/null) — serialise this run or use a separate clone" >&2; exit 1; }
     sleep 10
   done
   trap 'rm -f "$DEVLOCK"' EXIT
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_runtime_detect "$REPO_ROOT" "{FID}" || { echo "[bkit-runtime] runtime detect failed" >&2; exit 2; }
   bkit_runtime_assert_resolved || exit 2
   if [ "$RUNTIME_DEVPUSHES" = "true" ]; then
     git -C "$REPO_ROOT" checkout dev
     [ "$(git -C "$REPO_ROOT" branch --show-current)" = "dev" ] || { echo "Not on dev after checkout (on '$(git -C "$REPO_ROOT" branch --show-current)') — aborting dev ops" >&2; exit 1; }
     WT="$REPO_ROOT"
   else
     echo "[bkit-ship] RUNTIME_DEVPUSHES=false (RUNTIME=$RUNTIME) — skipping local dev checkout/push for the close-workflow status/telemetry tail; recorded on the current branch instead" >&2
     WT=$(git rev-parse --show-toplevel)
   fi
   STATUS="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
   STATS="$WT/.bkit/stats.jsonl"
   FRICTION="$WT/.bkit/friction.jsonl"
   (cd "$WT" && pnpm bkit comply --phase=ship) || echo "[bkit-comply] grader unavailable, skipping"
   PARENT_SHA=$(git -C "$WT" rev-parse HEAD)
   jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '{type:"step-done", workflow:"ship", step:"ship-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}' \
     >> "$STATUS"
   jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"ship", at:$t}' >> "$STATUS"
   BKIT_VER=$(jq -r '.pinnedVersion // empty' "$REPO_ROOT/.bkit/version" 2>/dev/null); [ -z "$BKIT_VER" ] && BKIT_VER="unknown"
   REPO_SLUG=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]||; s|\.git$||' || echo "unknown/repo")
   COUNTER_VALUE=$(jq -s --arg wf "ship" '[.[] | select(.type=="workflow-started" and .workflow==$wf)] | length' "$STATUS" 2>/dev/null)
   case "$COUNTER_VALUE" in '' | *[!0-9]*) COUNTER_VALUE=1 ;; esac
   jq -nc \
     --arg repo "$REPO_SLUG" \
     --arg bkitVersion "$BKIT_VER" \
     --arg step "ship-close-workflow" \
     --arg counterName "SHIP_ATTEMPT" \
     --argjson counterValue "$COUNTER_VALUE" \
     --arg counterSource "shell-bus" \
     --arg parentSha "$PARENT_SHA" \
     '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "ship" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
     >> "$STATS" || echo "[bkit-telemetry] append failed: $STATS"
   SQUASH_SHA=$(gh pr view {PR_NUMBER} --json mergeCommit --jq .mergeCommit.oid 2>/dev/null || echo "")
   PR_DIFF_STAT=$(git -C "$WT" diff --shortstat "${SQUASH_SHA}^..${SQUASH_SHA}" 2>/dev/null || echo "")
   LINES_ADDED=$(echo "$PR_DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
   LINES_DELETED=$(echo "$PR_DIFF_STAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
   FILES_CHANGED=$(echo "$PR_DIFF_STAT" | grep -oE '[0-9]+ file' | grep -oE '[0-9]+' || echo "0")
   LINES_ADDED=${LINES_ADDED:-0}; LINES_DELETED=${LINES_DELETED:-0}; FILES_CHANGED=${FILES_CHANGED:-0}
   LINES_CHANGED=$((LINES_ADDED + LINES_DELETED))
   DEFERRALS_COUNT=$(jq -rs '[.[] | select(.kind=="deferral") | .key] | unique | length' "$WT/docs/deferrals.jsonl" 2>/dev/null || echo "0"); DEFERRALS_COUNT=$((DEFERRALS_COUNT + 0))
   FAILURES_COUNT=$(jq -rs '[.[] | select(.kind=="failure") | .key] | unique | length' "$WT/docs/failures.jsonl" 2>/dev/null || echo "0"); FAILURES_COUNT=$((FAILURES_COUNT + 0))
   TASK_COUNT=$(grep -h '^\- \[' "$WT/docs/plans/{YYYYMM}/{FID}-plan"*.md 2>/dev/null | wc -l | tr -dc '0-9'); TASK_COUNT=${TASK_COUNT:-0}
   SHIP_START=$(jq -rs '[.[] | select(.type=="workflow-started" and .workflow=="ship")] | last | .at // ""' "$STATUS" 2>/dev/null || echo "")
   if [ -n "$SHIP_START" ]; then
     START_S=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$SHIP_START" +%s 2>/dev/null || date -d "$SHIP_START" +%s 2>/dev/null || echo "0")
     DURATION_S=$(( $(date +%s) - START_S )); [ "$DURATION_S" -lt 0 ] && DURATION_S=0
   else
     DURATION_S=0
   fi
   SHIP_START_MS=$(( ${START_S:-0} * 1000 ))
   FRICTION_ADDED=$(jq -rs --argjson since "$SHIP_START_MS" '[.[] | select((.workflow=="ship") and (.ts>=$since)) | .key] | unique | length' "$FRICTION" 2>/dev/null || echo "0"); FRICTION_ADDED=$((FRICTION_ADDED + 0))
   DEFERRALS_ADDED=$(jq -rs --argjson since "$SHIP_START_MS" '[.[] | select((.workflow=="ship") and (.ts>=$since)) | .key] | unique | length' "$WT/docs/deferrals.jsonl" 2>/dev/null || echo "0"); DEFERRALS_ADDED=$((DEFERRALS_ADDED + 0))
   FAILURES_ADDED=$(jq -rs --argjson since "$SHIP_START_MS" '[.[] | select((.workflow=="ship") and (.ts>=$since)) | .key] | unique | length' "$WT/docs/failures.jsonl" 2>/dev/null || echo "0"); FAILURES_ADDED=$((FAILURES_ADDED + 0))
   COVERAGE=null
   for COV_TIER in unit integration e2e; do
     COV_SUMMARY="$WT/coverage/$COV_TIER/coverage-summary.json"
     [ -f "$COV_SUMMARY" ] || continue
     COV_STATS=$(jq -c 'if (.total.lines.pct|type)=="number" then {lines:.total.lines.pct,branches:.total.branches.pct,functions:.total.functions.pct,statements:.total.statements.pct} else empty end' "$COV_SUMMARY" 2>/dev/null) || continue
     [ -n "$COV_STATS" ] || continue
     COVERAGE=$(jq -nc --argjson cov "$COVERAGE" --arg tier "$COV_TIER" --argjson stats "$COV_STATS" '($cov // {}) + {($tier): $stats}')
   done
   jq -nc \
     --arg repo "$REPO_SLUG" \
     --arg bkitVersion "$BKIT_VER" \
     --arg step "ship-close-workflow" \
     --arg parentSha "$PARENT_SHA" \
     --argjson prNumber "{PR_NUMBER}" \
     --argjson linesAdded "$LINES_ADDED" \
     --argjson linesDeleted "$LINES_DELETED" \
     --argjson linesChanged "$LINES_CHANGED" \
     --argjson filesChanged "$FILES_CHANGED" \
     --argjson taskCount "$TASK_COUNT" \
     --argjson durationSeconds "$DURATION_S" \
     --argjson deferrals "$DEFERRALS_COUNT" \
     --argjson failures "$FAILURES_COUNT" \
     --argjson frictionAdded "$FRICTION_ADDED" \
     --argjson deferralsAdded "$DEFERRALS_ADDED" \
     --argjson failuresAdded "$FAILURES_ADDED" \
     --argjson coverage "$COVERAGE" \
     '. | .ts = (now*1000|floor) | .kind = "outcome" | .workflow = "ship" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .parentSha = $parentSha | .prNumber = $prNumber | .linesAdded = $linesAdded | .linesDeleted = $linesDeleted | .linesChanged = $linesChanged | .filesChanged = $filesChanged | .taskCount = $taskCount | .durationSeconds = $durationSeconds | .deferrals = $deferrals | .failures = $failures | .frictionAdded = $frictionAdded | .deferralsAdded = $deferralsAdded | .failuresAdded = $failuresAdded | (if $coverage != null then .coverage = $coverage else . end)' \
     >> "$STATS" || echo "[bkit-telemetry] append failed: $STATS"
   # Single path-scoped [skip ci] commit — flush all bookkeeping at once.
   git -C "$WT" add $BOOK_PATHS
   git -C "$WT" commit --allow-empty -m "docs({FID}): ship DONE bkit [skip ci]" -- $BOOK_PATHS
   LOCK="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   if [ "$RUNTIME_DEVPUSHES" = "true" ]; then
     git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   else
     echo "[bkit-ship] RUNTIME_DEVPUSHES=false — close-workflow status/telemetry commit stays on the current branch; the code merge already landed server-side at Step 6" >&2
   fi
   ```
3. Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed` if present → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`. Do NOT close the issue.
   **If** `bkit.githubProject` absent → log `GitHub project not configured in package.json` → skip. **Else** extract `{ owner, number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` → ensure on board `mcp__github__projects_write({ method: "add_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_type: "issue", item_owner: "{OWNER}", item_repo: "{REPO}", issue_number: {ISSUE_ID} })` → resolve numeric item id `mcp__github__projects_list({ method: "list_project_items", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: "{bkit.githubProject.number}, query: "{ISSUE_ID}" })` → entry whose content issue number == `{ISSUE_ID}` → numeric `id` → `{ITEM_ID}` → set status `mcp__github__projects_write({ method: "update_project_item", owner: "{bkit.githubProject.owner}", owner_type: "org", project_number: {bkit.githubProject.number}, item_id: {ITEM_ID}, updated_field: { id: {bkit.githubProject.statusFieldId}, value: "{bkit.githubProject.reviewOptionId}" } })`.
4. Build `{ARTIFACTS}` link list:
   ```bash
   RR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)"); BR=dev
   ARTIFACTS=$( { git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/" | grep -E "docs/plans/{YYYYMM}/{FID}-[^/]+$"; git -C "$RR" ls-tree -r --name-only "$BR" -- "docs/plans/{YYYYMM}/logs/{FID}/" | grep -E "/ship-[^/]+$"; } | while read -r f; do printf -- '- [%s](https://github.com/{OWNER_REPO}/blob/%s/%s)\n' "$(basename "$f")" "$BR" "$f"; done )
   printf '%s\n' "$ARTIFACTS"
   TELEMETRY=$( (cd "$RR" && pnpm bkit telemetry summary --phase=ship) 2>&1 || echo "[bkit-telemetry] summary unavailable" )
   printf '\n%s\n' "$TELEMETRY"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 13 — Close Workflow
   #### Artifacts
   {ARTIFACTS}
   #### Telemetry
   {TELEMETRY}
   ```
6. Final return: Display `ship-summary.md` content verbatim as final message to user; do NOT summarise or trim; do NOT auto-invoke. **HARD STOP**.
   Append issue link [{ISSUE_ID} {TITLE}]({URL})

### 🔒 Gate 13 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Logs retained at `docs/plans/{YYYYMM}/logs/{FID}/` for manual cleanup
- [ ] Worktree cleaned up
- [ ] Squash-merge CI run completed and not failed (`RUN_STATUS`, `RUN_CONCLUSION`)
- [ ] Test tiers green (`TESTS_NOT_OK` empty)
- [ ] Workflow status updated (`ship` `DONE`, step `ship-close-workflow` recorded with `parentSha`)
- [ ] Close telemetry committed (`.bkit/stats.jsonl` staged before push)
- [ ] Single path-scoped `[skip ci]` commit + push to `dev` when `RUNTIME_DEVPUSHES` = true; else close-workflow commit stays on the current branch
- [ ] Final return displayed (`ship-summary.md` content verbatim)


- [ ] Issue update attempted (phase label `bkit:merged`, status/state `In Review`; issue left open for human close)
- [ ] Artifact link list embedded in `Step 13` comment
- [ ] Telemetry report embedded via summary
- [ ] Issue comment attempted (`Step 13` section)

