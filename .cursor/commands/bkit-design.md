# Design Feature (Workflow 1/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create design in `docs/plans/drafts/` — no plans, no code, no execution.

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
> - **Subagents:** Invoke using `@name` with `Task` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. If step ever finds `pwd` outside worktree → **Failure Path** with `Not in worktree`.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`. Any `save_*` writes are best-effort; NEVER gate. On failure → retry once after 5s → continue and apply edit with next scheduled write.
> - **Labels:** Linear issue phase `{LABELS}` (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Review`, `Failed`, `Merged`, `Router`) mutually exclusive — drop old label before adding new one.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append.
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
   printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** lock acquisition exits non-zero (existing lock <2h old) → **Failure Path** with `{FID} workflow already running`.
   `FID` hint (interrupted): `ls docs/plans/active/ | grep -oE '^[a-z0-9-]+(?=-plan)' | head -1`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `linearIssueId: {ID}`, `Linear issue: {ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `save_issue({ title: "{task}", description: "{input}", team: "Bartens", assignee: "me", state: "In Progress", labels: ["Design"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path** with `save_issue returned no id`.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else** → `get_issue({ id: "{ISSUE_ID}" })` → extract `STATE`, `LABELS`, `DESCRIPTION` → `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract `COMMENTS`.
6. **If** existing `docs/plans/drafts/{FID}-plan.md` → reuse `FID` and `docs/plans/logs/{FID}/`.
7. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set.
8. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "design" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"design", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   git add -A && git commit --allow-empty -m "chore({FID}): start-workflow work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"start-workflow", status:"DONE", at:$t, commitSha:$sha, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): start-workflow status"
   ```
9. Add `Design` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
10. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`.

```comment
## Design Workflow
### Step 1 — Start Workflow
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
[docs/plans/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/status.json)
```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `ISSUE_ID`, `FID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] Workflow status updated (`design` `IN_PROGRESS`, step `start-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Progress`, label `Design`)
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
4. Create: `docs/plans/logs/{FID}/design-input.md` = session prompt + `DESCRIPTION` + `COMMENTS`.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-setup", status:"DONE", at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-input.md"]}]' \
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
- [ ] Artifact written (`design-input.md`, non-empty)
- [ ] Workflow status updated (step `worktree-setup` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🧠 Step 3 — Brainstorm & Ideate

1. Launch both subagents in parallel using `Task` tool:
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-1`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-input.md`
     Create: `docs/plans/logs/{FID}/design-brainstorm-ideate-1.md`
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-2`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-input.md`
     Create: `docs/plans/logs/{FID}/design-brainstorm-ideate-2.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): brainstorm-ideate work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"brainstorm-ideate", status:"DONE", attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-brainstorm-ideate-1.md","docs/plans/logs/{FID}/design-brainstorm-ideate-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): brainstorm-ideate status"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 3 — Brainstorm & Ideate
   ```

### 🔒 Gate 3 — Brainstorm & Ideate

- [ ] Subagents invoked (`@bkit-design-brainstorm-ideate-1`, `@bkit-design-brainstorm-ideate-2`, no inline work)
- [ ] Artifacts written (`design-brainstorm-ideate-1.md` and `design-brainstorm-ideate-2.md`, non-empty)
- [ ] Workflow status updated (step `brainstorm-ideate` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Generate Design

1. **Subagent:** Invoke `@bkit-design-generate` using `Task` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/logs/{FID}/design-brainstorm-ideate-2.md`
   Create: `docs/plans/logs/{FID}/design-v1-draft.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): design-generate work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-generate", status:"DONE", attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-v1-draft.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): design-generate status"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 4 — Generate Design
   [design-v1-draft.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-v1-draft.md)
   ```

### 🔒 Gate 4 — Generate Design

- [ ] Subagent invoked (`@bkit-design-generate`, no inline work)
- [ ] Artifact written (`design-v1-draft.md`, non-empty)
- [ ] Workflow status updated (step `design-generate` recorded with `commitSha`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Design Review

1. Launch both subagents in parallel using `Task` tool:
   - **Subagent:** Invoke `@bkit-design-review-1`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-input.md`
     Create: `docs/plans/logs/{FID}/design-review-1.md`
   - **Subagent:** Invoke `@bkit-design-review-2`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-input.md`
     Create: `docs/plans/logs/{FID}/design-review-2.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `design-review-1.md` and `design-review-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` from each → compute `REVIEW_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`).
4. **If** any `Verdict` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-review-{N}.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → Wait for subagent and re-extract and **if** still invalid → **Failure Path** with `Subagent verdict invalid after retry`.
5. **If** `REVIEW_VERDICT` = FAIL → **Failure Path** with `Design review verdict: FAIL`.
6. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): design-review work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" \
     '.[-1].steps += [{step:"design-review", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-review-1.md","docs/plans/logs/{FID}/design-review-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): design-review status"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 5 — Design Review - Verdict: {REVIEW_VERDICT}
   ```

### 🔒 Gate 5 — Design Review

- [ ] Subagents invoked (`@bkit-design-review-1`, `@bkit-design-review-2`, no inline work)
- [ ] Artifacts written (`design-review-1.md` and `design-review-2.md`, non-empty)
- [ ] `REVIEW_VERDICT` extracted (worst-of-two)
- [ ] Verdict valid (each review's `Verdict` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`design-review-1.md` and `design-review-2.md`)
- [ ] Routed correctly (FAIL → Failure Path; PASS/CONCERNS → Step 6)
- [ ] Workflow status updated (step `design-review` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🧠 Step 6 — Apply Review

1. **Subagent:** Invoke `@bkit-design-update` using `Task` tool:
   Context: You are a subagent in the Design phase applying review critiques. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-review-1.md`, `docs/plans/logs/{FID}/design-review-2.md`
   Create: `docs/plans/logs/{FID}/design-v2-reviewed.md`
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `design-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → Wait for subagent and re-extract and **if** still invalid → **Failure Path** with `Subagent verdict invalid after retry`.
4. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): apply-review work"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '.[-1].steps += [{step:"apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-v2-reviewed.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): apply-review status"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 6 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [design-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-v2-reviewed.md)
   ```

### 🔒 Gate 6 — Apply Review

- [ ] Subagent invoked (`@bkit-design-update`, no inline work)
- [ ] Artifact written (`design-v2-reviewed.md`, non-empty)
- [ ] `APPLY_REVIEW_VERDICT` extracted
- [ ] Verdict valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `apply-review` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🧠 Step 7 — Summary

1. Resolve highest design version: `DESIGN_FINAL=$(ls docs/plans/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`. **If** empty → **Failure Path** with `No design version found`.
2. **Subagent:** Invoke `@bkit-design-summary` using `Task` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `${DESIGN_FINAL}` (highest v{N}), `docs/plans/logs/{FID}/status.json`, glob `docs/plans/logs/{FID}/design-*.md`
   Create: `docs/plans/logs/{FID}/design-summary.md`
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `design-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "docs({FID}): summary work [skip build] [skip ci]"
   SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg sha "$SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"summary", status:"DONE", verdict:$v, attempt:1, at:$t, commitSha:$sha, artifacts:["docs/plans/logs/{FID}/design-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add "$STATUS" && git commit -m "chore({FID}): summary status [skip build] [skip ci]"
   ```
6. Assert `{BRANCH}` non-empty and push:
   ```bash
   git push origin $(git branch --show-current)
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 7 — Summary - Verdict: {SUMMARY_VERDICT}
   [design-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-summary.md)
   {design-summary.md content verbatim}
   ```
8. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 8.
9. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path** with `Design summary verdict: FAIL`.
10. **Else** → **Failure Path** with `Unexpected design summary verdict: {SUMMARY_VERDICT}`.

### 🔒 Gate 7 — Summary

- [ ] `DESIGN_FINAL` resolved to highest `design-v*.md`
- [ ] Subagent invoked (`@bkit-design-summary`, no inline work)
- [ ] Artifact written (`design-summary.md`, non-empty)
- [ ] `SUMMARY_VERDICT` extracted
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `summary` recorded with `commitSha`, `verdict`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🤖 Step 8 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

> [!CAUTION]
> **HARD STOP:** Design requires human review. Do NOT invoke `/plan`.

1. Copy final design to drafts:
   ```bash
   DESIGN_FINAL=$(ls docs/plans/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)
   [ -z "$DESIGN_FINAL" ] && { echo "No design version found" >&2; exit 1; }
   mkdir -p docs/plans/drafts
   cp "$DESIGN_FINAL" "docs/plans/drafts/{FID}-design.md"
   ```
2. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
3. Sync to dev and prune worktree:
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
4. Update status and commit:
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
5. Add `Review` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`.
   ```comment
   ### Step 8 — Close Workflow
   ```

### 🔒 Gate 8 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] `SUMMARY_VERDICT` = PASS or CONCERNS confirmed
- [ ] Canonical design copied (`docs/plans/drafts/{FID}-design.md`, verdict header stripped)
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Changes merged to `dev` and pushed
- [ ] Worktree removed and feature branch deleted
- [ ] Workflow status updated (`design` `DONE`, step `close-workflow` recorded with `commitSha`)
- [ ] Issue update attempted (state `In Review`, label `Review`)
- [ ] Issue comment attempted (`Step 8` section)
