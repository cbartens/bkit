# Ship Feature (Workflow 5/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Merge feature PR to default integration branch.

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially unless stated otherwise.
> - **No Improv:** No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - **Auto-apply:** NEVER request human confirmation between steps. **If** single recommended option → document and proceed.
> - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{COMMENT_ID}`, `{COMMENT_BODY}`, `{OWNER_REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls. **Else** → **Failure Path**.
> - **Resume:** On start, read status.json — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`; **If** `failures` field present → cross-field invariants apply: `PASS ⇒ failures=0`, `FAIL ⇒ failures>0`, `CONCERNS ⇒ failures≥0`. Step `strategy` = `STANDARD | PIVOT | FINAL`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's `status.json`: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → **Failure Path**; `IN_PROGRESS` + last step ≥30min idle → stale, clean.
> - **Subagents:** Invoke using `@name` with `Task` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`, `list_issues`. Any `save_*` writes are best-effort; NEVER gate. **If** failure → retry once after 5s, then continue and apply edit with next scheduled write.
> - **Labels:** Linear issue phase `{LABELS}` (`Design`, `Plan`, `Build`, `Ship`, `Merged`) mutually exclusive — drop old phase before adding new. `Failed` (Failure Path) and `Debug` (Debug Workflow) are additive — phase label persists.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** Reference constant `MAX_MERGE_ATTEMPT` = 3 in retry checks below.
> - **Large Diff Guard:** When a Read line passes `git diff origin/dev..HEAD` to a subagent, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] && { t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"; }
   git rebase --abort 2>/dev/null || true
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   rm -f "docs/plans/logs/{FID}/.rebase-failed"
   git add "$STATUS" && git commit -m "chore({FID}): workflow failed status [skip build] [skip ci]"
   ```
2. Add `Failed` to `{LABELS}` (additive — phase label persists) → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **If** failure triggered by max-retry exhaustion (`[ -n "${MAX_VERIFY_ATTEMPT:-}" ]` / `[ -n "${MAX_TEST_ATTEMPT:-}" ]` / `[ -n "${MAX_DEBUG_ATTEMPT:-}" ]` / `[ -n "${MAX_MERGE_ATTEMPT:-}" ]` guards — counters unset before Step 2; do NOT false-evaluate as exceeded) **or** rebase failure sentinel previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Task` tool:
   Context: You are a subagent in the Ship Debug phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/ship-input.md`, glob `docs/plans/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/logs/{FID}/ship-failure-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/logs/{FID}/ship-handover.md`.
6. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): ship aborted [skip build] [skip ci]"`.
10. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)` — if push fails, do not claim success on Linear.
11. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### Workflow Handover
[ship-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/ship-handover.md)
{FID-ship-handover.md content verbatim}
```

12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   git fetch origin dev 2>/dev/null
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Push or reset before retrying." >&2; exit 1; }
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   mkdir -p "$REPO_ROOT/docs/plans/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   STATUS_REL="docs/plans/logs/{FID}/status.json"
   if [ -f "$LOCK" ]; then
     LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
     case "$LOCK_WORKFLOW" in
       plan|design) STATUS_JSON=$(cat "$REPO_ROOT/$STATUS_REL" 2>/dev/null || echo '[]') ;;
       *)           STATUS_JSON=$(git -C "$REPO_ROOT" show "feat/{FID}:$STATUS_REL" 2>/dev/null || echo '[]') ;;
     esac
     LAST=$(echo "$STATUS_JSON" | jq -r --arg w "$LOCK_WORKFLOW" '[.[] | select(.workflow==$w)] | last')
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
   `FID` hint (interrupted): `ls docs/plans/active/ | grep -oE '^[a-z0-9-]+(?=-plan)' | head -1`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `linearIssueId: {ID}`, `Linear issue: {ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `save_issue({ title: "{task}", description: "{input}", team: "Bartens", assignee: "me", state: "In Progress", labels: ["Ship"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else** → `get_issue({ id: "{ISSUE_ID}" })` → extract `STATE`, `LABELS`, `DESCRIPTION` → `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract `COMMENTS`.
6. **If** existing `docs/plans/active/{FID}-plan.md` → reuse `FID` and `docs/plans/logs/{FID}/`.
7. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
8. Add `Ship` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
9. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:
   ```comment
   ## Ship Workflow
   ### Step 1 — Start Workflow
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `ISSUE_ID`, `FID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`.lock` exists at `$REPO_ROOT/docs/plans/logs/{FID}/`)
- [ ] Issue update attempted (state `In Progress`, label `Ship`)
- [ ] Issue comment attempted (`Step 1` section)

---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add -- ':\!.DS_Store' ':\!*.log' ':\!*.swp' ':\!node_modules'
     git commit -m "chore({FID}): pre-worktree uncommitted changes"
   fi
   ```
2. Create/resume the worktree:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   git worktree prune
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"
   if [ -d "$WORKTREE_PATH" ]; then
     cd "$WORKTREE_PATH"
     rm -f "docs/plans/logs/{FID}/.rebase-failed"
     git fetch origin dev
     if ! git rebase --rebase-merges origin/dev; then
       CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
       if [ "$CONFLICT_FILES" = "pnpm-lock.yaml" ]; then
         git checkout --theirs pnpm-lock.yaml
         pnpm install --lockfile-only
         git add pnpm-lock.yaml
         if ! git rebase --continue; then
           git rebase --abort 2>/dev/null || true
           mkdir -p "docs/plans/logs/{FID}/"
           touch "docs/plans/logs/{FID}/.rebase-failed"
         fi
       else
         git rebase --abort 2>/dev/null || true
         echo "Rebase conflict" >&2
         mkdir -p "docs/plans/logs/{FID}/"
         touch "docs/plans/logs/{FID}/.rebase-failed"
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
   mkdir -p docs/plans/logs/{FID}/
   for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
     [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
   done
   [ -d "$REPO_ROOT/.vale/styles/write-good" ] && cp -R "$REPO_ROOT/.vale/styles/write-good" "$WORKTREE_PATH/.vale/styles/"
   pnpm install --frozen-lockfile
   ```
3. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
4. **If** `BRANCH` NOT `dev` **and** does NOT contain `{FID}` **and** does NOT contain `{ISSUE_ID}` (case-insensitive) → **Failure Path**.
5. `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'` → extract `PR_NUMBER`. **If** `PR_NUMBER` empty → **Failure Path**. Set `MERGE_ATTEMPT` = 0.
6. `gh pr view {PR_NUMBER} --json statusCheckRollup` → **If** any failures → **Failure Path**.
7. Create: `docs/plans/logs/{FID}/ship-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/active/{FID}-plan.md`.
8. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "ship" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"ship", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   git add -A && git commit --allow-empty -m "chore({FID}): start-workflow work"
   START_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$START_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"start-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): start-workflow status"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-setup", status:"DONE", at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): worktree-setup status"
   ```
9. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/status.json)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] On branch that passed eligibility
- [ ] Counters initialised (`PR_NUMBER` non-empty, `MERGE_ATTEMPT` = 0)
- [ ] No PR CI failures confirmed
- [ ] Artifact written (`ship-input.md`, non-empty)
- [ ] Workflow status updated (`ship` `IN_PROGRESS`, steps `start-workflow` + `worktree-setup` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🧠 Step 3 — Conflict Resolve

**Run only if:** Sentinel `docs/plans/logs/{FID}/.rebase-failed` exists after Step 2.

1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Task` tool:
   Context: You are a subagent in the Ship phase. Lockfile-only fast-path already attempted and did not match. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/ship-input.md`.
   Update: Conflicted source files.
   Create: `docs/plans/logs/{FID}/ship-conflict-resolve.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `ship-conflict-resolve.md` until `<!-- verdict:end -->` → extract `Verdict` as `RESOLVE_VERDICT`.
4. **If** `RESOLVE_VERDICT` = PASS → `rm -f "docs/plans/logs/{FID}/.rebase-failed"`. **Else** → **Failure Path**.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): conflict-resolve work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$RESOLVE_VERDICT" \
     '.[-1].steps += [{step:"conflict-resolve", status:"DONE", verdict:$v, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-conflict-resolve.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): conflict-resolve status"
   ```
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Conflict Resolve - Verdict: {RESOLVE_VERDICT}
   ```

### 🔒 Gate 3 — Conflict Resolve

- [ ] Subagent invoked (`@bkit-ship-conflict-resolve`, no inline work)
- [ ] Artifact written (`ship-conflict-resolve.md`, non-empty)
- [ ] `RESOLVE_VERDICT` extracted
- [ ] Verdict valid (`RESOLVE_VERDICT` in `PASS|FAIL`)
- [ ] Sentinel cleared on PASS
- [ ] Workflow status updated (step `conflict-resolve` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🤖 Step 4 — Merge PR

1. Increment `MERGE_ATTEMPT` + 1.
2. Inspect `dev` branch state and auto-commit any dirty paths before squash-merge:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
   if [ -n "$(git -C "$REPO_ROOT" status --porcelain | grep -v '^??')" ]; then
     git -C "$REPO_ROOT" status --short
     git -C "$REPO_ROOT" add -- ':\!.DS_Store' ':\!*.log' ':\!*.swp' ':\!node_modules'
     git -C "$REPO_ROOT" commit -m "chore: pre-merge uncommitted dev changes [skip build] [skip ci]"
   fi
   ```
3. Merge with empty body:
   ```bash
   gh pr merge {PR_NUMBER} --squash --delete-branch \
     --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
     --body ""
   PUSH_AT=$(date -u +%s)
   sleep 30
   RUN_ID=$(gh run list --branch dev --limit 5 \
     --json databaseId,createdAt,workflowName \
     --jq "[.[] | select((.createdAt | fromdateiso8601) > $PUSH_AT - 60)][0].databaseId")
   [ -z "$RUN_ID" ] && { echo "CI did not trigger on dev after merge at $PUSH_AT" >&2; exit 1; }
   ```
4. `gh pr view {PR_NUMBER} --json state` → extract `state`.
5. Set `MERGE_VERDICT` = PASS if `state` = MERGED, else FAIL. Set `MERGE_FAILURES` = 0 if PASS, else 1.
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): merge-pr attempt ${MERGE_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$MERGE_VERDICT" --argjson a "$MERGE_ATTEMPT" --argjson f "$MERGE_FAILURES" \
     '.[-1].steps += [{step:"merge-pr", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): merge-pr attempt ${MERGE_ATTEMPT} status"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 4 — Merge PR - Verdict: {MERGE_VERDICT}
   ```
8. **If** `state` = MERGED → Step 7.
9. **If** `state` != MERGED:
   - **If** `MERGE_ATTEMPT` <= `MAX_MERGE_ATTEMPT` → Step 5.
   - **Else** → **Failure Path**.
10. **Else** → **Failure Path**.

### 🔒 Gate 4 — Merge PR

- [ ] `MERGE_ATTEMPT` incremented
- [ ] PR merge attempted
- [ ] `state` extracted (MERGED or not)
- [ ] CI run triggered on dev (`RUN_ID` captured)
- [ ] Verdicts extracted (`MERGE_VERDICT`, `MERGE_FAILURES`)
- [ ] Verdict valid (`MERGE_VERDICT` in `PASS|FAIL`)
- [ ] HEAD on remote does NOT contain `[skip ci]`
- [ ] Workflow status updated (step `merge-pr` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Failure Diagnose

**Run only if** `state` != MERGED.

1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Task` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/ship-input.md`.
   Create: `docs/plans/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `ship-failure-diagnose-{MERGE_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${MERGE_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$MERGE_ATTEMPT" \
     '.[-1].steps += [{step:"failure-diagnose", status:"DONE", verdict:$v, attempt:$a, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-failure-diagnose-'"${MERGE_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): failure-diagnose attempt ${MERGE_ATTEMPT} status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 5 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Attempt: {MERGE_ATTEMPT}
   ```

### 🔒 Gate 5 — Failure Diagnose

- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`, non-empty)
- [ ] `DIAGNOSE_VERDICT` extracted
- [ ] Verdict valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`ship-failure-diagnose-{MERGE_ATTEMPT}.md`)
- [ ] Workflow status updated (step `failure-diagnose` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🧠 Step 6 — Failure Remediate

**Run only if** `state` != MERGED.

1. Read status.json and extract `PRIOR_STRATEGY`:
   ```bash
   PRIOR_STRATEGY=$(jq -r --arg s "failure-remediate" \
     '[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""' \
     docs/plans/logs/{FID}/status.json)
   ```
2. Set next `STRATEGY`:
   - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
   - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
   - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
   - **Else** → **Failure Path**.
3. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Task` tool:
   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Strategy: `{STRATEGY}`. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
   Update: Source files.
   Create: `docs/plans/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `ship-failure-remediate-{MERGE_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "fix({FID}): failure-remediate attempt ${MERGE_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$MERGE_ATTEMPT" --arg strat "$STRATEGY" \
     '.[-1].steps += [{step:"failure-remediate", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-failure-remediate-'"${MERGE_ATTEMPT}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): failure-remediate attempt ${MERGE_ATTEMPT} status"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 6 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Strategy: {STRATEGY} - Attempt: {MERGE_ATTEMPT}
   ```
8. **Re-run Step 4**.

### 🔒 Gate 6 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`ship-failure-remediate-{MERGE_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict and strategy extracted (`REMEDIATE_VERDICT`, `STRATEGY`)
- [ ] Workflow status updated (step `failure-remediate` recorded with `commitSha`, `verdict`, `strategy`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🤖 Step 7 — Switch to Dev

**Run only if** `state` = MERGED.

1. Switch to `dev` and fast-forward:
   ```bash
   git checkout dev
   git fetch origin dev
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Manual reconciliation required." >&2; exit 1; }
   git pull --ff-only origin dev
   pnpm install --frozen-lockfile
   ```
   **If** exit non-zero → **Failure Path**.
2. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): switch-to-dev work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"switch-to-dev", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): switch-to-dev status [skip build] [skip ci]"
   ```
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 7 — Switch to Dev
   [{OWNER_REPO}/tree/dev](https://github.com/{OWNER_REPO}/tree/dev)
   ```

### 🔒 Gate 7 — Switch to Dev

- [ ] On `dev` branch
- [ ] `dev` up to date with origin
- [ ] Workflow status updated (step `switch-to-dev` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Update Docs & Summary

**Run only if** `state` = MERGED.

1. Launch both subagents in parallel using `Task` tool:
   - **Subagent:** Invoke `@bkit-ship-update-docs`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/active/{FID}-plan*.md`, glob `docs/plans/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
     Update: doc files.
     Create: `docs/plans/logs/{FID}/ship-update-docs.md`.
   - **Subagent:** Invoke `@bkit-ship-summary`
     Context: You are a subagent in the Ship phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/ship-input.md`, glob `docs/plans/logs/{FID}/ship-*.md` (excluding `ship-update-docs.md`), `gh pr view {PR_NUMBER} --json title,body,additions,deletions,changedFiles,commits,mergedAt`.
     Create: `docs/plans/logs/{FID}/ship-summary.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Derive `UPDATE_DOCS_VERDICT`:
   ```bash
   COMPLETED_HIT=$(grep -c "docs/plans/completed/.*{FID}" docs/completed.md || echo 0)
   if [ "$COMPLETED_HIT" -gt 0 ]; then UPDATE_DOCS_VERDICT=PASS; else UPDATE_DOCS_VERDICT=FAIL; fi
   ```
   Read `ship-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): update-docs summary work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     --arg uv "$UPDATE_DOCS_VERDICT" \
     --arg sv "$SUMMARY_VERDICT" \
     '.[-1].steps += [
       {step:"update-docs", status:"DONE", verdict:$uv, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-update-docs.md"]},
       {step:"summary", status:"DONE", verdict:$sv, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/ship-summary.md"]}
     ]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): update-docs summary status [skip build] [skip ci]"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 8 — Update Docs & Summary - Verdict: {SUMMARY_VERDICT} - Docs: {UPDATE_DOCS_VERDICT}
   [ship-summary.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/logs/{FID}/ship-summary.md)
   {FID-ship-summary.md content verbatim}
   ```
6. **If** `UPDATE_DOCS_VERDICT` **and** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 9.
7. **If** `UPDATE_DOCS_VERDICT` = FAIL → **Failure Path**.
8. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
9. **Else** → **Failure Path**.

### 🔒 Gate 8 — Update Docs & Summary

- [ ] Subagents invoked (`@bkit-ship-update-docs`, `@bkit-ship-summary`, no inline work)
- [ ] Artifact written (`ship-update-docs.md`, non-empty)
- [ ] Artifact written (`ship-summary.md`, non-empty)
- [ ] Verdicts extracted (`UPDATE_DOCS_VERDICT`, `SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (steps `update-docs` and `summary` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🤖 Step 9 — Archive Docs

**Run only if** `state` = MERGED.

1. `git log origin/dev --oneline | head -5` → **If** NO squash SHA → **Failure Path**.
2. Assert `FID` non-empty before any path operations.
3. `YYYYMM=$(date +%Y%m) && mkdir -p docs/plans/completed/{YYYYMM}/`.
4. `mv docs/plans/active/{FID}-*.md docs/plans/completed/{YYYYMM}/`.
5. **Prune feature-specific skills** — remove any `.agents/skills/` folders not listed in `.agents/skills.md`:
   ```bash
   for skill_dir in .agents/skills/*/; do
     skill=$(basename "$skill_dir")
     grep -q "$skill" .agents/skills.md || rm -rf ".agents/skills/$skill"
   done
   ```
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git status --short
   git add -A && git commit --allow-empty -m "docs({FID}): archive docs work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"archive-docs", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): archive docs status [skip build] [skip ci]"
   git push origin dev
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 9 — Archive
   ```

### 🔒 Gate 9 — Archive Docs

- [ ] Plans moved to `docs/plans/completed/{YYYYMM}/`
- [ ] `docs/completed.md` updated
- [ ] Feature-specific skills pruned
- [ ] Logs at `docs/plans/logs/{FID}/` retained for manual cleanup
- [ ] Archive commit pushed to `dev`
- [ ] Workflow status updated (step `archive-docs` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🤖 Step 10 — Worktree Cleanup

**Run only if** `state` = MERGED.

1. Remove the feature worktree:
   ```bash
   REPO_ROOT=$(git rev-parse --show-toplevel)
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
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-cleanup work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-cleanup", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): worktree-cleanup status [skip build] [skip ci]"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 10 — Worktree Cleanup
   ```

### 🔒 Gate 10 — Worktree Cleanup

- [ ] Worktree removed (`.worktrees/{FID}`, or was already absent)
- [ ] `git worktree prune` executed
- [ ] Local `feat/{FID}` branch deleted (or already absent)
- [ ] Remote `origin/feat/{FID}` branch deleted (or already absent)
- [ ] Workflow status updated (step `worktree-cleanup` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🤖 Step 11 — Close Workflow

1. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
2. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"close-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): close-workflow status [skip build] [skip ci]"
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
3. Add `Merged` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "Done", labels: [{LABELS}] })`.
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 11 — Close Workflow
   ```

### 🔒 Gate 11 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] All documents archived and logs retained for manual cleanup
- [ ] Worktree cleaned up
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Workflow status updated (`ship` `DONE`, step `close-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `Done`, label `Merged`)
- [ ] Issue comment attempted (all step sections; single comment for the whole workflow run)
