---
description: "Plan Feature — Autonomous plan generation"
---

# Plan Feature (Workflow 2/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create plan in `docs/plans/drafts/` — no code, no execution.

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
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **STOP**, no further downstream steps.

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
   printf '%s plan\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** lock acquisition exits non-zero (existing lock <2h old) → **Failure Path** with `{FID} workflow already running`.
   `FID` hint (interrupted): `ls docs/plans/active/ | grep -oE '^[a-z0-9-]+(?=-plan)' | head -1`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `linearIssueId: {ID}`, `Linear issue: {ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `save_issue({ title: "{task}", description: "{input}", team: "Bartens", assignee: "me", state: "In Progress", labels: ["Plan"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path** with `save_issue returned no id`.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else** → `get_issue({ id: "{ISSUE_ID}" })` → extract `STATE`, `LABELS`, `DESCRIPTION` → `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract `COMMENTS`.
6. **If** existing `docs/plans/drafts/{FID}-plan.md` → reuse `FID` and `docs/plans/logs/{FID}/`.
7. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path** with `Missing FID slug`.
8. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "plan" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"plan", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   git add "$STATUS" && git commit --allow-empty -m "chore({FID}): start-workflow work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"start-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): start-workflow status"
   ```
9. Add `Plan` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
10. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`.

```comment
## Plan Workflow
### Step 1 — Start Workflow
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
[docs/plans/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/status.json)
```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `ISSUE_ID`, `FID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] Workflow status updated (`plan` `IN_PROGRESS`, step `start-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Progress`, label `Plan`)
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
4. Create: `docs/plans/logs/{FID}/plan-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/drafts/{FID}-design.md`.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-setup", status:"DONE", at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): worktree-setup status"
   ```
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] Artifact written (`plan-input.md`, non-empty)
- [ ] Workflow status updated (step `worktree-setup` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🧠 Step 3 — Generate Plan

1. **Subagent:** Invoke `@bkit-plan-generate` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/plan-input.md`
   Create: `docs/plans/logs/{FID}/plan-v1-draft.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): generate-plan work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"generate-plan", status:"DONE", attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-v1-draft.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): generate-plan status"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 3 — Generate Plan
   [plan-v1-draft.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/plan-v1-draft.md)
   ```

### 🔒 Gate 3 — Generate Plan

- [ ] Subagent invoked (`@bkit-plan-generate`, no inline work)
- [ ] Artifact written (`plan-v1-draft.md`, non-empty)
- [ ] Workflow status updated (step `generate-plan` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Review Plan

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-plan-review-1`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/plan-v1-draft.md`, `docs/plans/logs/{FID}/plan-input.md`
     Create: `docs/plans/logs/{FID}/plan-review-1.md`
   - **Subagent:** Invoke `@bkit-plan-review-2`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/plan-v1-draft.md`, `docs/plans/logs/{FID}/plan-input.md`
     Create: `docs/plans/logs/{FID}/plan-review-2.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-review-1.md` and `plan-review-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `REVIEW_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `REVIEW_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): review-plan work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" --argjson f "$REVIEW_FAILURES" \
     '.[-1].steps += [{step:"review-plan", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-review-1.md","docs/plans/logs/{FID}/plan-review-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): review-plan status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 4 — Review Plan - Verdict: {REVIEW_VERDICT} - Failures: {REVIEW_FAILURES}
   ```

### 🔒 Gate 4 — Review Plan

- [ ] Subagents invoked (`@bkit-plan-review-1`, `@bkit-plan-review-2`, no inline work)
- [ ] Artifacts written (`plan-review-1.md` and `plan-review-2.md`, non-empty)
- [ ] Verdicts extracted (`REVIEW_VERDICT`, `REVIEW_FAILURES`)
- [ ] Verdict valid (`REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-review-1.md` and `plan-review-2.md`)
- [ ] Workflow status updated (step `review-plan` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Apply Review

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying review critiques. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/plan-v1-draft.md`, `docs/plans/logs/{FID}/plan-review-1.md`, `docs/plans/logs/{FID}/plan-review-2.md`
   Create: `docs/plans/logs/{FID}/plan-v2-reviewed.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **if** still invalid → **Failure Path** with `Subagent verdict invalid after retry`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): apply-review work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '.[-1].steps += [{step:"apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-v2-reviewed.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): apply-review status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 5 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [plan-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/plan-v2-reviewed.md)
   ```

### 🔒 Gate 5 — Apply Review

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Artifact written (`plan-v2-reviewed.md`, non-empty)
- [ ] `APPLY_REVIEW_VERDICT` extracted
- [ ] Verdict valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `apply-review` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🧠 Step 6 — Scope Check

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-plan-scope-check-1`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/plan-v2-reviewed.md`
     Create: `docs/plans/logs/{FID}/plan-scope-check-1.md`
   - **Subagent:** Invoke `@bkit-plan-scope-check-2`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/plan-v2-reviewed.md`
     Create: `docs/plans/logs/{FID}/plan-scope-check-2.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-scope-check-1.md` and `plan-scope-check-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `SCOPE_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `SCOPE_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): scope-check work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SCOPE_VERDICT" --argjson f "$SCOPE_FAILURES" \
     '.[-1].steps += [{step:"scope-check", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-scope-check-1.md","docs/plans/logs/{FID}/plan-scope-check-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): scope-check status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 6 — Scope Check - Verdict: {SCOPE_VERDICT} - Failures: {SCOPE_FAILURES}
   ```

### 🔒 Gate 6 — Scope Check

- [ ] Subagents invoked (`@bkit-plan-scope-check-1`, `@bkit-plan-scope-check-2`, no inline work)
- [ ] Artifacts written (`plan-scope-check-1.md` and `plan-scope-check-2.md`, non-empty)
- [ ] Verdicts extracted (`SCOPE_VERDICT`, `SCOPE_FAILURES`)
- [ ] Verdict valid (`SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-scope-check-1.md` and `plan-scope-check-2.md`)
- [ ] Workflow status updated (step `scope-check` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🧠 Step 7 — Apply Scope

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying scope-check critiques. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/plan-v2-reviewed.md`, `docs/plans/logs/{FID}/plan-scope-check-1.md`, `docs/plans/logs/{FID}/plan-scope-check-2.md`
   Update: `docs/pending.md` (APPEND scope expansions if any)
   Create: `docs/plans/logs/{FID}/plan-v3-checked.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v3-checked.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_SCOPE_VERDICT`. **If** `APPLY_SCOPE_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v3-checked.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **if** still invalid → **Failure Path** with `Subagent verdict invalid after retry`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): apply-scope work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_SCOPE_VERDICT" \
     '.[-1].steps += [{step:"apply-scope", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-v3-checked.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): apply-scope status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 7 — Apply Scope - Verdict: {APPLY_SCOPE_VERDICT}
   [plan-v3-checked.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/plan-v3-checked.md)
   ```

### 🔒 Gate 7 — Apply Scope

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Scope expansions in `docs/pending.md` (if any)
- [ ] Artifact written (`plan-v3-checked.md`, non-empty)
- [ ] `APPLY_SCOPE_VERDICT` extracted
- [ ] Verdict valid (`APPLY_SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `apply-scope` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Complexity Check

1. **Subagent:** Invoke `@bkit-plan-complexity-check` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/plan-v3-checked.md`
   Create: `docs/plans/logs/{FID}/plan-complexity-check.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-complexity-check.md` until `<!-- verdict:end -->` → extract `Verdict` as `COMPLEXITY_VERDICT` (`SINGLE` = no split, `SPLIT` = partition required).
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): complexity-check work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$COMPLEXITY_VERDICT" \
     '.[-1].steps += [{step:"complexity-check", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-complexity-check.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): complexity-check status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 8 — Complexity Check - Verdict: {COMPLEXITY_VERDICT}
   ```

### 🔒 Gate 8 — Complexity Check

- [ ] Subagent invoked (`@bkit-plan-complexity-check`, no inline work)
- [ ] Artifact written (`plan-complexity-check.md`, non-empty)
- [ ] `COMPLEXITY_VERDICT` extracted
- [ ] Workflow status updated (step `complexity-check` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🧠 Step 9 — Complexity Split

**Run only if** Step 8 `COMPLEXITY_VERDICT` = SPLIT.

1. **Subagent:** Invoke `@bkit-plan-complexity-split` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Single versioned output: parent in `plan-v4-split.md`, child sub-plans in `plan-v4-1.md`, `plan-v4-2.md`, ..., `plan-v4-N.md`. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/plan-v3-checked.md`
   Create: `docs/plans/logs/{FID}/plan-v4-split.md` (parent index with verdict header), `docs/plans/logs/{FID}/plan-v4-1.md` ... `docs/plans/logs/{FID}/plan-v4-N.md` (children)
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v4-split.md` until `<!-- verdict:end -->` → extract `Verdict` as `SPLIT_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): complexity-split work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SPLIT_VERDICT" \
     '.[-1].steps += [{step:"complexity-split", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-v4-split.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): complexity-split status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 9 — Complexity Split - Verdict: {SPLIT_VERDICT}
   [plan-v4-split.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/plan-v4-split.md)
   ```
6. **If** `SPLIT_VERDICT` = PASS → Step 10.
7. **If** `SPLIT_VERDICT` = FAIL → **Failure Path** with `Plan split verdict: FAIL`.
8. **Else** → **Failure Path** with `Unexpected plan split verdict: {SPLIT_VERDICT}`.

### 🔒 Gate 9 — Complexity Split

- [ ] Subagent invoked (`@bkit-plan-complexity-split`, no inline work)
- [ ] Artifact written (`plan-v4-split.md`, non-empty)
- [ ] Children written (`plan-v4-1.md` ... `plan-v4-N.md`, non-empty)
- [ ] `SPLIT_VERDICT` extracted
- [ ] Verdict valid (`SPLIT_VERDICT` in `PASS|FAIL`)
- [ ] Workflow status updated (step `complexity-split` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🧠 Step 10 — Summary

1. Resolve highest plan version: `PLAN_FINAL=$(ls docs/plans/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)`. **If** empty → **Failure Path** with `No plan version found`.
2. **Subagent:** Invoke `@bkit-plan-summary` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `${PLAN_FINAL}` (highest v{N}), glob `docs/plans/logs/{FID}/plan-v4-*.md` (children if SPLIT), `docs/plans/logs/{FID}/status.json`, `docs/plans/logs/{FID}/plan-input.md`, glob `docs/plans/logs/{FID}/plan-*.md`
   Create: `docs/plans/logs/{FID}/plan-summary.md`
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `plan-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): summary work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"summary", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/plan-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): summary status [skip build] [skip ci]"
   ```
6. Assert `{BRANCH}` non-empty and push:
   ```bash
   git push origin $(git branch --show-current)
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 10 — Summary - Verdict: {SUMMARY_VERDICT}
   [plan-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/plan-summary.md)
   {plan-summary.md content verbatim}
   ```
8. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 11.
9. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path** with `Plan summary verdict: FAIL`.
10. **Else** → **Failure Path** with `Unexpected plan summary verdict: {SUMMARY_VERDICT}`.

### 🔒 Gate 10 — Summary

- [ ] `PLAN_FINAL` resolved to highest `plan-v*.md` (excluding child `plan-v4-N.md`)
- [ ] Subagent invoked (`@bkit-plan-summary`, no inline work)
- [ ] Artifact written (`plan-summary.md`, non-empty)
- [ ] `SUMMARY_VERDICT` extracted
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `summary` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🤖 Step 11 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Copy final plan to drafts:
   ```bash
   PLAN_FINAL=$(ls docs/plans/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)
   [ -z "$PLAN_FINAL" ] && { echo "No plan version found" >&2; exit 1; }
   mkdir -p docs/plans/drafts
   cp "$PLAN_FINAL" "docs/plans/drafts/{FID}-plan.md"
   for child in docs/plans/logs/{FID}/plan-v4-[0-9]*.md; do
     [ -f "$child" ] || continue
     N=$(basename "$child" | sed -E 's/plan-v4-([0-9]+)\.md/\1/')
     cp "$child" "docs/plans/drafts/{FID}-plan-${N}.md"
   done
   for f in docs/plans/drafts/{FID}-plan*.md; do
     [ -f "$f" ] || continue
     sed -i.bak -E 's|plan-v[0-9]+-split\.md|{FID}-plan.md|g; s|plan-v[0-9]+-([0-9]+)\.md|{FID}-plan-\1.md|g' "$f"
     rm -f "$f.bak"
   done
   ```
2. Commit drafts in worktree:
   ```bash
   git add docs/plans/drafts/{FID}-plan*.md
   git diff --cached --quiet || git commit -m "docs({FID}): close-workflow drafts"
   ```
3. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
4. Sync to dev and prune worktree:
   ```bash
   cd "$REPO_ROOT"
   git checkout dev
   git pull origin dev
   git merge "$BRANCH" --no-edit
   git push origin dev
   git worktree remove "$REPO_ROOT/.worktrees/{FID}" --force
   git branch -D "feat/{FID}" 2>/dev/null || true
   git push origin --delete "feat/{FID}" 2>/dev/null || true
   git worktree prune
   ```
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"close-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): close-workflow status [skip build] [skip ci]"
   rm -f "docs/plans/logs/{FID}/.lock"
   ```
6. Add `Review` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 11 — Close Workflow
   ```
8. **HARD STOP:** Plan requires human review. Do NOT invoke `/build`.

### 🔒 Gate 11 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] `SUMMARY_VERDICT` = PASS or CONCERNS confirmed
- [ ] Canonical plan copied (`docs/plans/drafts/{FID}-plan.md`, verified on `dev` post-merge; same for each `{FID}-plan-N.md` if SPLIT)
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Changes merged to `dev` and pushed
- [ ] Worktree removed and feature branch deleted
- [ ] Workflow status updated (`plan` `DONE`, step `close-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Review`, label `Review`)
- [ ] Issue comment attempted (`Step 11` section)
