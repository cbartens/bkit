---
description: "Build Feature — Autonomous implementation"
---

# Build Feature (Workflow 3/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Build feature and raise PR for default integration branch.

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially unless stated otherwise.
> - **No Improv:** No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - **Auto-apply:** NEVER request human confirmation between steps. Single recommended option → document and proceed.
> - **Failures:** Any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{COMMENT_ID}`, `{COMMENT_BODY}`, `{OWNER_REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls → else **Failure Path** with `Empty placeholder: {name}`.
> - **Resume:** On start, read status.json — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`; When `failures` field present cross-field invariants apply: `PASS ⇒ failures=0`, `FAIL ⇒ failures>0`, `CONCERNS ⇒ failures≥0`. Step `strategy` = `STANDARD | PIVOT | FINAL`.
> - **Locks:** Acquire `docs/plans/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path. Existing lock <2h old → **Failure Path** with `{FID} workflow already running`. Older lock → consider stale, remove and re-acquire.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. If step ever finds `pwd` outside worktree → **Failure Path** with `Not in worktree`.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`. Any `save_*` writes are best-effort; NEVER gate. On failure → retry once after 5s → continue and apply edit with next scheduled write.
> - **Labels:** Linear issue phase `{LABELS}` (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Review`, `Failed`, `Merged`, `Router`) mutually exclusive — drop old label before adding new one.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** Any workflow or subagent run > 3600 seconds → **Failure Path** with `Step {N} timeout`.
> - **Limits:** Reference constants `MAX_VERIFY_ATTEMPT` = 3 and `MAX_TEST_ATTEMPT` = 3 in retry checks below.
> - **Large Diff Guard:** When Read line passes `git diff origin/dev..HEAD` to subagents, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

---

## 🤖 Failure Path

1. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] && { t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"; }
   rm -f "docs/plans/logs/{FID}/.lock"
   git add "$STATUS" && git commit -m "chore({FID}): workflow failed status [skip build] [skip ci]"
   ```
2. Add `Failed` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **If** failure triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, glob `docs/plans/logs/{FID}/build-*.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**)
   Create: `docs/plans/logs/{FID}/build-handover.md`
6. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): build aborted [skip build] [skip ci]"`.
10. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)` — if push fails, do not claim success on Linear.
11. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### Workflow Handover
[build-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/build-handover.md)
{build-handover.md content verbatim}
```

12. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Acquire concurrency lock:
   ```bash
   mkdir -p "docs/plans/logs/{FID}"
   LOCK="docs/plans/logs/{FID}/.lock"
   if [ -f "$LOCK" ]; then
     LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || stat -c %Y "$LOCK") ))
     [ $LOCK_AGE -lt 7200 ] && { echo "Lock held for {FID} (age ${LOCK_AGE}s): $(cat $LOCK). Stale? rm $LOCK" >&2; exit 1; }
     rm -f "$LOCK"
   fi
   printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** lock acquisition exits non-zero (existing lock <2h old) → **Failure Path** with `{FID} workflow already running`.
   `FID` hint (interrupted): `ls docs/plans/active/ | grep -oE '^[a-z0-9-]+(?=-plan)' | head -1`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `linearIssueId: {ID}`, `Linear issue: {ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `save_issue({ title: "{task}", description: "{input}", team: "Bartens", assignee: "me", state: "In Progress", labels: ["Build"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path** with `save_issue returned no id`.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else** → `get_issue({ id: "{ISSUE_ID}" })` → extract `STATE`, `LABELS`, `DESCRIPTION` → `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract `COMMENTS`.
6. From `get_issue` response → extract `relations` where `type` = `blocked_by` → **If** any issue `state` ≠ `Done` **or** `Cancelled` → **Failure Path** `Blocked by {ISSUE_ID}`.
7. **If** existing `docs/plans/drafts/{FID}-plan.md` or `docs/plans/active/{FID}-plan.md` → reuse `FID`. **Else** → **Failure Path** with `Build requires plan.`.
8. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path** with `Missing FID slug`.
9. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "build" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"build", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   git add -A && git commit --allow-empty -m "chore({FID}): start-workflow work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"start-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): start-workflow status"
   ```
10. Add `Build` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
11. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:

```comment
## Build Workflow
### Step 1 — Start Workflow
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
[docs/plans/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/status.json)
```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `ISSUE_ID`, `FID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] Not blocked by any related issues
- [ ] Workflow status updated (`build` `IN_PROGRESS`, step `start-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Progress`, label `Build`)
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
   git worktree prune  # clean stale entries first
   WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"

   if [ -d "$WORKTREE_PATH" ]; then
     cd "$WORKTREE_PATH"
     # Rebase on latest dev to keep feature branch current
     git fetch origin dev
     git rebase origin/dev || { echo "Rebase conflict — resolve manually"; exit 1; }
   else
     if git show-ref --verify --quiet "refs/heads/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" "feat/{FID}"
     elif git fetch origin "feat/{FID}" 2>/dev/null \
          && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then
       git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
     else
       git fetch origin dev
       git worktree add "$WORKTREE_PATH" -b "feat/{FID}" HEAD
     fi
     cd "$WORKTREE_PATH"
   fi

   mkdir -p docs/plans/logs/{FID}/
   for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
     [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
   done
   # Vale `write-good` package is gitignored (vendored via `vale sync`); seed from parent so pre-commit hook works
   [ -d "$REPO_ROOT/.vale/styles/write-good" ] && cp -R "$REPO_ROOT/.vale/styles/write-good" "$WORKTREE_PATH/.vale/styles/"
   # pnpm per-package node_modules symlinks are not inherited — create them (symlink-only, ~5s)
   pnpm install --frozen-lockfile
   ```

3. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
4. Move plans to active: `mv docs/plans/drafts/{FID}-*.md docs/plans/active/ 2>/dev/null || true`. Update internal path refs.
5. **Sub-plan count:**
   ```bash
   SUB_COUNT=$(ls docs/plans/active/{FID}-plan-*.md 2>/dev/null | wc -l)
   [ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
   ```
6. Init counters: `VERIFY_ATTEMPT` = 1, `TEST_ATTEMPT` = 1.
7. Create: `docs/plans/logs/{FID}/build-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/active/{FID}-plan.md`.
8. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-setup", status:"DONE", at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): worktree-setup status"
   ```
9. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] Plan files in `docs/plans/active/`
- [ ] Counters initialised (`SUB_COUNT` set, `VERIFY_ATTEMPT` = 1, `TEST_ATTEMPT` = 1)
- [ ] Artifact written (`build-input.md`, non-empty)
- [ ] Workflow status updated (step `worktree-setup` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Branch Sync

1. `git fetch origin`.
2. **If** feature branch → **if** `git log HEAD..origin/dev --oneline -- docs/` non-empty → `git merge origin/dev` (conflicts: prefer `dev` for `docs/`).
3. `git branch --show-current` → confirm `BRANCH`. Assert non-empty.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): branch-sync work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"branch-sync", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): branch-sync status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Branch Sync
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 3 — Branch Sync

- [ ] `docs/` not behind `origin/dev`
- [ ] On correct worktree branch
- [ ] Workflow status updated (step `branch-sync` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Install Skills

**Skip if** build input contains `[skills=false]`.

1. **Subagent:** Invoke `@bkit-build-install-skills` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `.agents/skills.md`
   Create: `docs/plans/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash)
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): install-skills work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"install-skills", status:"DONE", attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-install-skills.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): install-skills status [skip build] [skip ci]"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 4 — Install Skills
   ```

### 🔒 Gate 4 — Install Skills

- [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
- [ ] Artifact written (`build-install-skills.md`, non-empty)
- [ ] New skills installed (or no new skills noted)
- [ ] Workflow status updated (step `install-skills` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 4` section)

---

## Sub-Plan Loop — Steps 5–7

1. **If** `SINGLE_PLAN` = true → execute once using `{FID}-plan.md` with `SUB_PLAN` = 1.
2. **If** `SUB_COUNT` >= 2 → loop `SUB_PLAN` from 1 to `SUB_COUNT` using `{FID}-plan-${SUB_PLAN}.md`. Reset `VERIFY_ATTEMPT` = 1 at start of each `SUB_PLAN`.

Per-step summary file naming for sub-plan loop steps: `{step}-{SUB_PLAN}-{ATTEMPT}.md` (e.g. `plan-verify-1-2.md` = sub-plan 1, attempt 2).

---

### 🧠 Step 5 — Plan Execute

3. **Subagent:** Invoke `@bkit-build-plan-execute` using `Agent` tool:
   Context: You are a subagent in the Build phase. Execute sub-plan ${SUB_PLAN}/${SUB_COUNT}. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/build-input.md`, `docs/plans/active/{FID}-plan.md`, `docs/plans/active/{FID}-plan-${SUB_PLAN}.md`
   Update: source files
   Create: `docs/plans/logs/{FID}/build-plan-execute-${SUB_PLAN}-log.md`
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `build-plan-execute-${SUB_PLAN}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `EXECUTE_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "feat({FID}): plan-execute sub-plan ${SUB_PLAN} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$EXECUTE_VERDICT" --argjson sp "$SUB_PLAN" \
     '.[-1].steps += [{step:"plan-execute", status:"DONE", verdict:$v, attempt:1, subPlan:$sp, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-plan-execute-'"${SUB_PLAN}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): plan-execute sub-plan ${SUB_PLAN} status"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 5 — Plan Execute - Verdict: {EXECUTE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT}
   ```

### 🔒 Gate 5 — Plan Execute

- [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
- [ ] Artifact written (`build-plan-execute-${SUB_PLAN}-log.md`, non-empty)
- [ ] Source files implemented
- [ ] `EXECUTE_VERDICT` extracted
- [ ] Workflow status updated (step `plan-execute` recorded with `commitSha`, `verdict`, `subPlan`)
- [ ] Issue comment attempted (`Step 5` section)

---

### 🧠 Step 6 — Plan Verify

8. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Single plan verification. Sub-plan ${SUB_PLAN}, attempt ${VERIFY_ATTEMPT}. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"`→ verify with`pwd`→ use for all subsequent file operations.
Read:`docs/plans/active/{FID}-plan-${SUB_PLAN}.md`, `docs/plans/logs/{FID}/build-plan-execute-${SUB_PLAN}-log.md`, glob `docs/plans/logs/{FID}/build-plan-verify-${SUB_PLAN}-*.md`, glob `docs/plans/logs/{FID}/build-plan-gaps-remediate-${SUB_PLAN}-\*-log.md`, `git diff origin/dev..HEAD`(apply **Large Diff Guard**; filter to changes relevant to this sub-plan's checklist; ignore changes outside scope)
Update:`docs/plans/active/{FID}-plan-${SUB_PLAN}.md`
   Create: `docs/plans/logs/{FID}/build-plan-verify-${SUB_PLAN}-${VERIFY_ATTEMPT}.md`
9. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
10. Read `build-plan-verify-${SUB_PLAN}-${VERIFY_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `VERIFY_VERDICT` and `Failures` as `VERIFY_FAILURES`.
11. Update status and commit:

```bash
STATUS="docs/plans/logs/{FID}/status.json"
git add -A && git commit --allow-empty -m "chore({FID}): plan-verify sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT} work"
SHA=$(git rev-parse HEAD)
t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$VERIFY_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --argjson f "$VERIFY_FAILURES" \
  '.[-1].steps += [{step:"plan-verify", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, failures:$f, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-plan-verify-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'.md"]}]' \
  "$STATUS" > "$t" && mv "$t" "$STATUS"
git add "$STATUS" && git commit -m "chore({FID}): plan-verify sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT} status"
```

12. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### Step 6 — Plan Verify - Verdict: {VERIFY_VERDICT} - Failures: {VERIFY_FAILURES} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT}
```

13. **If** `VERIFY_VERDICT` = PASS:

- **If** more sub-plans remain (`SUB_PLAN` < `SUB_COUNT`) → next `SUB_PLAN` → Step 5.
- **Else** → Step 8.

14. **If** `VERIFY_VERDICT` = CONCERNS or FAIL:

- **If** `VERIFY_ATTEMPT` <= `MAX_VERIFY_ATTEMPT` → Step 7.
- **Else** → **Failure Path**.

15. **Else** → **Failure Path** with `Unexpected build plan-verify verdict: {VERIFY_VERDICT}`.

### 🔒 Gate 6 — Plan Verify

- [ ] Subagent invoked (`@bkit-build-plan-verify`, no inline work)
- [ ] Artifact written (`build-plan-verify-${SUB_PLAN}-${VERIFY_ATTEMPT}.md`, non-empty)
- [ ] Verdicts extracted (`VERIFY_VERDICT`, `VERIFY_FAILURES`)
- [ ] Verdict valid (`VERIFY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-plan-verify-${SUB_PLAN}-${VERIFY_ATTEMPT}.md`)
- [ ] Workflow status updated (step `plan-verify` recorded with `commitSha`, `verdict`, `attempt`, `subPlan`)
- [ ] Issue comment attempted (`Step 6` section)

---

### 🧠 Step 7 — Plan Gaps Remediate

**Run only if** Step 6 `VERIFY_VERDICT` = FAIL.

16. Read prior strategy from status.json and select next `STRATEGY`:

```bash
PRIOR_STRATEGY=$(jq -r --arg s "plan-gaps-remediate" --argjson sp "$SUB_PLAN" \
  '[.[] | .steps[] | select(.step==$s and .subPlan==$sp and .status=="DONE")] | last.strategy // ""' \
  docs/plans/logs/{FID}/status.json)
```

- **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
- **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
- **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
- **Else** → **Failure Path** with `Unexpected prior strategy: ${PRIOR_STRATEGY}`.

17. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Sub-plan ${SUB_PLAN}, attempt ${VERIFY_ATTEMPT}. Strategy: ${STRATEGY}. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"`→ verify with`pwd`→ use for all subsequent file operations.
Read:`docs/plans/active/{FID}-plan-${SUB_PLAN}.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/build-plan-verify-${SUB_PLAN}-${VERIFY_ATTEMPT}.md`, glob `docs/plans/logs/{FID}/build-plan-gaps-remediate-${SUB_PLAN}-\*-log.md`Update: source files
Create:`docs/plans/logs/{FID}/build-plan-gaps-remediate-${SUB_PLAN}-${VERIFY_ATTEMPT}-log.md`
18. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
19. Read `build-plan-gaps-remediate-${SUB_PLAN}-${VERIFY_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
20. Update status and commit:

```bash
STATUS="docs/plans/logs/{FID}/status.json"
git add -A && git commit --allow-empty -m "fix({FID}): plan-gaps-remediate sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT} work"
SHA=$(git rev-parse HEAD)
t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --arg strat "$STRATEGY" \
  '.[-1].steps += [{step:"plan-gaps-remediate", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, strategy:$strat, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-plan-gaps-remediate-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'-log.md"]}]' \
  "$STATUS" > "$t" && mv "$t" "$STATUS"
git add "$STATUS" && git commit -m "chore({FID}): plan-gaps-remediate sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT} status"
```

21. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### Step 7 — Plan Gaps Remediate - Verdict: {REMEDIATE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT} - Strategy: {STRATEGY}
```

22. Increment `VERIFY_ATTEMPT` + 1.
23. **Re-run Step 6**.

### 🔒 Gate 7 — Plan Gaps Remediate

- [ ] Subagent invoked (`@bkit-build-plan-gaps-remediate`, no inline work)
- [ ] Artifact written (`build-plan-gaps-remediate-${SUB_PLAN}-${VERIFY_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict and strategy extracted (`REMEDIATE_VERDICT`, `STRATEGY`)
- [ ] `VERIFY_ATTEMPT` incremented before re-run
- [ ] Workflow status updated (step `plan-gaps-remediate` recorded with `commitSha`, `verdict`, `attempt`, `subPlan`, `strategy`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Plan Verify Holistic

**Run only if** `SUB_COUNT` >= 2. **Skip if** `SINGLE_PLAN` = true.

1. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Holistic plan verification (master and sub-plans). Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, all `docs/plans/active/{FID}-plan-N.md`, glob `docs/plans/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/logs/{FID}/build-plan-gaps-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**; review full feature diff for cross-sub-plan integration)
   Create: `docs/plans/logs/{FID}/build-plan-verify-holistic.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-plan-verify-holistic.md` until `<!-- verdict:end -->` → extract `Verdict` as `HOLISTIC_VERDICT` and `Failures` as `HOLISTIC_FAILURES`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): plan-verify-holistic work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$HOLISTIC_VERDICT" --argjson f "$HOLISTIC_FAILURES" \
     '.[-1].steps += [{step:"plan-verify-holistic", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-plan-verify-holistic.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): plan-verify-holistic status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 8 — Plan Verify Holistic - Verdict: {HOLISTIC_VERDICT} - Failures: {HOLISTIC_FAILURES}
   ```
6. **If** `HOLISTIC_VERDICT` = PASS or CONCERNS → Step 9.
7. **If** `HOLISTIC_VERDICT` = FAIL → **Failure Path** with `Build holistic-verification verdict: FAIL`.
8. **Else** → **Failure Path** with `Unexpected build holistic-verification verdict: {HOLISTIC_VERDICT}`.

### 🔒 Gate 8 — Plan Verify Holistic

- [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
- [ ] Artifact written (`build-plan-verify-holistic.md`, non-empty)
- [ ] Verdicts extracted (`HOLISTIC_VERDICT`, `HOLISTIC_FAILURES`)
- [ ] Verdict valid (`HOLISTIC_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-plan-verify-holistic.md`)
- [ ] Workflow status updated (step `plan-verify-holistic` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🧠 Step 9 — Build Challenge

1. **Subagent:** Invoke `@bkit-build-challenge` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/build-input.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**)
   Create: `docs/plans/logs/{FID}/build-challenge.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_VERDICT` and `Failures` as `CHALLENGE_FAILURES`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): challenge work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_VERDICT" --argjson f "$CHALLENGE_FAILURES" \
     '.[-1].steps += [{step:"challenge", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-challenge.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): challenge status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 9 — Build Challenge - Verdict: {CHALLENGE_VERDICT} - Failures: {CHALLENGE_FAILURES}
   ```
6. **If** `CHALLENGE_VERDICT` = PASS → Step 12.
7. **If** `CHALLENGE_VERDICT` = CONCERNS → Step 10 (challenge-remediate).
8. **If** `CHALLENGE_VERDICT` = FAIL → **Failure Path** (CRITICAL finding, human review required).
9. **Else** → **Failure Path** with `Unexpected build challenge verdict: {CHALLENGE_VERDICT}`.

### 🔒 Gate 9 — Build Challenge

- [ ] Subagent invoked (`@bkit-build-challenge`, no inline work)
- [ ] Artifact written (`build-challenge.md`, non-empty)
- [ ] Verdicts extracted (`CHALLENGE_VERDICT`, `CHALLENGE_FAILURES`)
- [ ] Verdict valid (`CHALLENGE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-challenge.md`)
- [ ] Workflow status updated (step `challenge` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🧠 Step 10 — Build Challenge Remediate

**Run only if** Step 9 `CHALLENGE_VERDICT` = CONCERNS.

1. **Subagent:** Invoke `@bkit-build-challenge-remediate` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/build-challenge.md`
   Update: source files
   Create: `docs/plans/logs/{FID}/build-challenge-remediate-log.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge-remediate-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_CHALLENGE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "fix({FID}): challenge-remediate work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_CHALLENGE_VERDICT" \
     '.[-1].steps += [{step:"challenge-remediate", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-challenge-remediate-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): challenge-remediate status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 10 — Build Challenge Remediate - Verdict: {REMEDIATE_CHALLENGE_VERDICT}
   ```

### 🔒 Gate 10 — Build Challenge Remediate

- [ ] Subagent invoked (`@bkit-build-challenge-remediate`, no inline work)
- [ ] Artifact written (`build-challenge-remediate-log.md`, non-empty)
- [ ] Source files modified
- [ ] `REMEDIATE_CHALLENGE_VERDICT` extracted
- [ ] Workflow status updated (step `challenge-remediate` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🧠 Step 11 — Build Challenge Tests

**Run only if** Step 9 `CHALLENGE_VERDICT` = CONCERNS.

1. **Subagent:** Invoke `@bkit-build-challenge-tests` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/build-plan-verify-holistic.md` (if exists), `docs/plans/logs/{FID}/build-challenge.md`, `docs/plans/logs/{FID}/build-challenge-remediate-log.md`, glob `docs/plans/logs/{FID}/build-plan-verify-*.md`
   Create: `docs/plans/logs/{FID}/build-challenge-tests.md`, test files
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge-tests.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_TESTS_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "test({FID}): generate-tests work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_TESTS_VERDICT" \
     '.[-1].steps += [{step:"challenge-tests", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-challenge-tests.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): challenge-tests status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 11 — Build Challenge Tests - Verdict: {CHALLENGE_TESTS_VERDICT}
   ```

### 🔒 Gate 11 — Build Challenge Tests

- [ ] Subagent invoked (`@bkit-build-challenge-tests`, no inline work)
- [ ] Artifact written (`build-challenge-tests.md`, non-empty)
- [ ] Test files created/updated
- [ ] `CHALLENGE_TESTS_VERDICT` extracted
- [ ] Workflow status updated (step `challenge-tests` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 11` section)

---

## 🤖 Step 12 — Run Tests

1. Run verbatim — do NOT modify quoting, filter, or glob:
   ```bash
   if [ -f turbo.json ]; then
     pnpm turbo lint typecheck test --filter='...[origin/dev]'
   else
     set -e
     for s in typecheck test format:check lint:slop lint:prose; do
       if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1; then pnpm "$s"; fi
     done
   fi
   ```
2. Set `TEST_VERDICT` and `TEST_FAILURES` from exit code: **If** all tests passed `TEST_VERDICT` = PASS and `TEST_FAILURES` = 0. **Else** `TEST_VERDICT` = FAIL and `TEST_FAILURES` = count of failing test suites (≥1).
3. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): run-tests attempt ${TEST_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$TEST_VERDICT" --argjson a "$TEST_ATTEMPT" --argjson f "$TEST_FAILURES" \
     '.[-1].steps += [{step:"run-tests", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): run-tests attempt ${TEST_ATTEMPT} status"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 12 — Run Tests - Verdict: {TEST_VERDICT} - Failures: {TEST_FAILURES} - Attempt: {TEST_ATTEMPT}
   ```
5. **If** all tests PASS → Step 15.
6. **If** some tests FAIL:
   - **If** `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT` → Step 13.
   - **Else** → **Failure Path**.
7. **Else** → **Failure Path**.

### 🔒 Gate 12 — Run Tests

- [ ] Tests executed (turbo path if `turbo.json`, else single-package script fallback)
- [ ] Verdicts extracted (`TEST_VERDICT`, `TEST_FAILURES`)
- [ ] Workflow status updated (step `run-tests` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 12` section)

---

## 🧠 Step 13 — Failure Diagnose

**Run only if** Step 12 tests FAIL.

1. Read prior strategy from status.json and select next `STRATEGY`:

   ```bash
   PRIOR_STRATEGY=$(jq -r --arg s "failure-diagnose" \
     '[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""' \
     docs/plans/logs/{FID}/status.json)
   ```

   - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
   - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
   - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
   - **Else** → **Failure Path** with `Unexpected prior strategy: ${PRIOR_STRATEGY}`.

2. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Strategy: ${STRATEGY}. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"`→ verify with`pwd`→ use for all subsequent file operations.
Read:`docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/build-input.md`Create:`docs/plans/logs/{FID}/build-failure-diagnose-${TEST_ATTEMPT}.md`
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `build-failure-diagnose-${TEST_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${TEST_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$TEST_ATTEMPT" --arg strat "$STRATEGY" \
     '.[-1].steps += [{step:"failure-diagnose", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-failure-diagnose-'"${TEST_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): failure-diagnose attempt ${TEST_ATTEMPT} status"
   ```
6. Add `Debug: Build` to `{LABELS}` → `save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })`.
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 13 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Strategy: {STRATEGY} - Attempt: {TEST_ATTEMPT}
   ```

### 🔒 Gate 13 — Failure Diagnose

- [ ] `STRATEGY` computed before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`build-failure-diagnose-${TEST_ATTEMPT}.md`, non-empty)
- [ ] `DIAGNOSE_VERDICT` extracted
- [ ] Verdict valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`build-failure-diagnose-${TEST_ATTEMPT}.md`)
- [ ] Workflow status updated (step `failure-diagnose` recorded with `commitSha`, `verdict`, `strategy`)
- [ ] Issue comment attempted (`Step 13` section)

---

## 🧠 Step 14 — Failure Remediate

**Run only if** Step 12 tests FAIL.

1. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/build-failure-diagnose-${TEST_ATTEMPT}.md`
   Update: source and test files
   Create: `docs/plans/logs/{FID}/build-failure-remediate-${TEST_ATTEMPT}-log.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-failure-remediate-${TEST_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "fix({FID}): failure-remediate attempt ${TEST_ATTEMPT} work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$TEST_ATTEMPT" \
     '.[-1].steps += [{step:"failure-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-failure-remediate-'"${TEST_ATTEMPT}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): failure-remediate attempt ${TEST_ATTEMPT} status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 14 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Attempt: {TEST_ATTEMPT}
   ```
6. Increment `TEST_ATTEMPT` + 1.
7. **Re-run Step 12**.

### 🔒 Gate 14 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`build-failure-remediate-${TEST_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] `REMEDIATE_VERDICT` extracted
- [ ] `TEST_ATTEMPT` incremented before re-run
- [ ] Workflow status updated (step `failure-remediate` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 14` section)

---

## 🧠 Step 15 — Summary

**Run only if** all Step 12 tests PASS.

1. **Subagent:** Invoke `@bkit-build-summary` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/active/{FID}-plan.md`, `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/build-input.md`, glob `docs/plans/logs/{FID}/build-*.md`, `git log --oneline origin/dev..HEAD` (commit subjects only)
   Create: `docs/plans/logs/{FID}/build-summary.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): summary work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"summary", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/build-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): summary status [skip build] [skip ci]"
   ```
5. Assert `{BRANCH}` non-empty. `git push -u origin $(git branch --show-current)`.
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 15 — Summary - Verdict: {SUMMARY_VERDICT}
   [build-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/build-summary.md)
   {build-summary.md content verbatim}
   ```
7. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
8. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path** with `Build summary verdict: FAIL`.
9. **Else** → **Failure Path** with `Unexpected build summary verdict: {SUMMARY_VERDICT}`.

### 🔒 Gate 15 — Summary

- [ ] Subagent invoked (`@bkit-build-summary`, no inline work)
- [ ] Artifact written (`build-summary.md`, non-empty)
- [ ] `SUMMARY_VERDICT` extracted
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `summary` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 15` section)

---

## 🤖 Step 16 — Create PR

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. `git fetch origin dev`.
2. **If** `git diff origin/dev --name-only | grep -q '^supabase/migrations/'` **and** `git show -s --format=%B HEAD | grep -qF '[force build]'` fails → amend or `git commit --allow-empty` with `[force build]` → `git push`.
3. Create PR:
   ```bash
   gh pr create --base dev --title "feat({FID}): {summary}" --body "$(cat <<'EOF'
   <!-- bkit:start -->
   https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/active/{FID}-plan.md
   <!-- bkit:end -->
   EOF
   )"
   ```
4. **If** `gh pr create` fails → retry once. **If** still fails → **Failure Path**.
5. Extract `PR_URL` and `PR_NUMBER` from created PR. Assert both non-empty.
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): create-pr work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg u "$PR_URL" \
     '.[-1].steps += [{step:"create-pr", status:"DONE", at:$t, commitSha:$sha, artifacts:[$u]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): create-pr status [skip build] [skip ci]"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 16 — Create PR
   [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
   ```

### 🔒 Gate 16 — Create PR

- [ ] PR created (`PR_URL`, `PR_NUMBER` non-empty)
- [ ] PR body contains plan-link URL (wrapped in `<!-- bkit:start -->` / `<!-- bkit:end -->` markers)
- [ ] Workflow status updated (step `create-pr` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 16` section)

---

## 🤖 Step 17 — Close Workflow

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
   git add "$STATUS" && git commit -m "chore({FID}): close-workflow status trigger CI"
   rm -f "docs/plans/logs/{FID}/.lock"
   git push origin "$(git branch --show-current)"
   ```
3. Add `Review` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 17 — Close Workflow
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 17 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] HEAD on remote does NOT contain `[skip ci]`
- [ ] Workflow status updated (`build` `DONE`, step `close-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Review`, label `Review`)
- [ ] Issue comment attempted (all step sections; single comment for the whole workflow run)
