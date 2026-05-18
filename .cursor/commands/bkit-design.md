# Design Feature (Workflow 1/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create design in `docs/plans/drafts/` — no plans, no code, no execution.

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
> - **Status:** `$REPO_ROOT/docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`; **If** `failures` field present → cross-field invariants apply: `PASS ⇒ failures=0`, `FAIL ⇒ failures>0`, `CONCERNS ⇒ failures≥0`. Step `strategy` = `STANDARD | PIVOT | FINAL`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's `status.json` via `cat "$REPO_ROOT/$STATUS_REL"`: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → **Failure Path**; `IN_PROGRESS` + last step ≥30min idle → stale, clean.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `docs({FID}): design DONE [skip ci]`; Failure Path → `chore({FID}): design FAILED [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Task` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`, `list_issues`. Any `save_*` writes are best-effort; NEVER gate. **If** failure → retry once after 5s, then continue and apply edit with next scheduled write.
> - **Labels:** Linear issue phase `{LABELS}` (`Design`, `Plan`, `Build`, `Ship`, `Merged`) mutually exclusive — drop old phase before adding new. `Failed` (Failure Path) and `Debug` (Debug Workflow) are additive — phase label persists.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] && { t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"; }
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json" 2>/dev/null || true
   git -C "$REPO_ROOT" commit -m "chore({FID}): design FAILED [skip ci]" 2>/dev/null || true
   git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   ```
2. Add `Failed` to `{LABELS}` (prior phase label persists) → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
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
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Push or reset before retrying." >&2; exit 1; }
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   mkdir -p "$REPO_ROOT/docs/plans/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   STATUS_REL="docs/plans/logs/{FID}/status.json"
   if [ -f "$LOCK" ]; then
     LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
     STATUS_JSON=$(cat "$REPO_ROOT/$STATUS_REL" 2>/dev/null || echo '[]')
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
   printf '%s design\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** divergence check or lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls docs/plans/active/ | grep -oE '^[a-z0-9-]+(?=-plan)' | head -1`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `linearIssueId: {ID}`, `Linear issue: {ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `save_issue({ title: "{task}", description: "{input}", team: "Bartens", assignee: "me", state: "In Progress", labels: ["Design"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else** → `get_issue({ id: "{ISSUE_ID}" })` → extract `STATE`, `LABELS`, `DESCRIPTION` → `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract `COMMENTS`.
6. **If** existing `docs/plans/drafts/{FID}-plan.md` → reuse `FID` and `docs/plans/logs/{FID}/`.
7. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
8. Add `Design` phase to `{LABELS}` and drop old phase → `save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.
9. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:
   ```comment
   ## Design Workflow
   ### Step 1 — Start Workflow
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `ISSUE_ID`, `FID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/logs/{FID}/.lock` exists)
- [ ] Issue update attempted (state `In Progress`, label `Design`)
- [ ] Issue comment attempted (`Step 1` section)

---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add docs/plans/ .agents/friction.md
     git diff --cached --quiet || git commit -m "chore({FID}): pre-worktree uncommitted changes [skip build]"
   fi
   ```
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
       git worktree add "$WORKTREE_PATH" -b "feat/{FID}" HEAD
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
4. Create: `docs/plans/logs/{FID}/design-input.md` = session prompt + `DESCRIPTION` + `COMMENTS`.
5. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   mkdir -p "$(dirname "$STATUS")"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "design" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"design", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/status.json)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] Artifact written (`design-input.md`, non-empty)
- [ ] Workflow status updated (`design` `IN_PROGRESS`, steps `design-start-workflow` and `design-worktree-setup` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🧠 Step 3 — Brainstorm & Ideate

1. Launch all three subagents in parallel using `Task` tool. Each carries a distinct lens; the synthesiser merges across them:
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-1`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-input.md`.
     Create: `docs/plans/logs/{FID}/design-brainstorm-ideate-1.md`.
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-2`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-input.md`.
     Create: `docs/plans/logs/{FID}/design-brainstorm-ideate-2.md`.
   - **Subagent:** Invoke `@bkit-design-brainstorm-ideate-3`
     Context: You are a subagent in the Design phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-input.md`.
     Create: `docs/plans/logs/{FID}/design-brainstorm-ideate-3.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-brainstorm-ideate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-brainstorm-ideate-1.md","docs/plans/logs/{FID}/design-brainstorm-ideate-2.md","docs/plans/logs/{FID}/design-brainstorm-ideate-3.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): brainstorm-ideate"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Brainstorm & Ideate
   ```

### 🔒 Gate 3 — Brainstorm & Ideate

- [ ] Subagents invoked (`@bkit-design-brainstorm-ideate-1`, `@bkit-design-brainstorm-ideate-2`, `@bkit-design-brainstorm-ideate-3`, no inline work)
- [ ] Artifacts written (`design-brainstorm-ideate-1.md`, `design-brainstorm-ideate-2.md`, `design-brainstorm-ideate-3.md`, non-empty)
- [ ] Workflow status updated (step `design-brainstorm-ideate` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Generate Design

1. **Subagent:** Invoke `@bkit-design-generate` using `Task` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations. Inputs carry distinct lenses — merge across them, do NOT collapse to a consensus.
   Read: `docs/plans/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/logs/{FID}/design-brainstorm-ideate-3.md`.
   Create: `docs/plans/logs/{FID}/design-v1-draft.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-generate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-v1-draft.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-generate"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 4 — Generate Design
   [design-v1-draft.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-v1-draft.md)
   ```

### 🔒 Gate 4 — Generate Design

- [ ] Subagent invoked (`@bkit-design-generate`, no inline work)
- [ ] Artifact written (`design-v1-draft.md`, non-empty)
- [ ] Workflow status updated (step `design-generate` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Design Review

1. Launch both subagents in parallel using `Task` tool:
   - **Subagent:** Invoke `@bkit-design-review-1`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-input.md`.
     Create: `docs/plans/logs/{FID}/design-review-1.md`.
   - **Subagent:** Invoke `@bkit-design-review-2`
     Context: You are a subagent in the Design phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-input.md`.
     Create: `docs/plans/logs/{FID}/design-review-2.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `design-review-1.md` and `design-review-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` from each → compute `REVIEW_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`).
4. **If** any `Verdict` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-review-{N}.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
5. **If** `REVIEW_VERDICT` = FAIL → **Failure Path**.
6. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" \
     '.[-1].steps += [{step:"design-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-review-1.md","docs/plans/logs/{FID}/design-review-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-review"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 5 — Design Review - Verdict: {REVIEW_VERDICT}
   ```

### 🔒 Gate 5 — Design Review

- [ ] Subagents invoked (`@bkit-design-review-1`, `@bkit-design-review-2`, no inline work)
- [ ] Artifacts written (`design-review-1.md` and `design-review-2.md`, non-empty)
- [ ] Verdict extracted (`REVIEW_VERDICT`, worst-of-two)
- [ ] Verdict valid (each review's `Verdict` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`design-review-1.md` and `design-review-2.md`)
- [ ] Routed correctly (FAIL → Failure Path; PASS/CONCERNS → Step 6)
- [ ] Workflow status updated (step `design-review` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🧠 Step 6 — Apply Review

1. **Subagent:** Invoke `@bkit-design-update` using `Task` tool:
   Context: You are a subagent in the Design phase applying review critiques. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/design-v1-draft.md`, `docs/plans/logs/{FID}/design-review-1.md`, `docs/plans/logs/{FID}/design-review-2.md`.
   Create: `docs/plans/logs/{FID}/design-v2-reviewed.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `design-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '.[-1].steps += [{step:"design-apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-v2-reviewed.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-review"
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 6 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [design-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-v2-reviewed.md)
   ```

### 🔒 Gate 6 — Apply Review

- [ ] Subagent invoked (`@bkit-design-update`, no inline work)
- [ ] Artifact written (`design-v2-reviewed.md`, non-empty)
- [ ] Verdict extracted (`APPLY_REVIEW_VERDICT`)
- [ ] Verdict valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `design-apply-review` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🧠 Step 7 — Design Organise

1. **Subagent:** Invoke `@bkit-design-organise` using `Task` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/logs/{FID}/design-v2-reviewed.md`.
   Create: `docs/plans/logs/{FID}/design-v3-organised.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `design-v3-organised.md` until `<!-- verdict:end -->` → extract `Verdict` as `ORGANISE_VERDICT`. **If** `ORGANISE_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'design-v3-organised.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. **If** `ORGANISE_VERDICT` = FAIL → **Failure Path**.
5. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$ORGANISE_VERDICT" \
     '.[-1].steps += [{step:"design-organise", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-v3-organised.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-organise"
   ```
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 7 — Design Organise - Verdict: {ORGANISE_VERDICT}
   [design-v3-organised.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-v3-organised.md)
   ```

### 🔒 Gate 7 — Design Organise

- [ ] Subagent invoked (`@bkit-design-organise`, no inline work)
- [ ] Artifact written (`design-v3-organised.md`, non-empty)
- [ ] Verdict extracted (`ORGANISE_VERDICT`)
- [ ] Verdict valid (`ORGANISE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `design-organise` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Summary

1. Resolve highest design version: `DESIGN_FINAL=$(ls docs/plans/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`. **If** empty → **Failure Path**.
2. **Subagent:** Invoke `@bkit-design-summary` using `Task` tool:
   Context: You are a subagent in the Design phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `{DESIGN_FINAL}` (highest v{N}), `docs/plans/logs/{FID}/status.json`, glob `docs/plans/logs/{FID}/design-*.md`.
   Create: `docs/plans/logs/{FID}/design-summary.md`.
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `design-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"design-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/logs/{FID}/design-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary [skip build] [skip ci]"
   ```
6. Assert `{BRANCH}` non-empty and push:
   ```bash
   git push origin $(git branch --show-current)
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 8 — Summary - Verdict: {SUMMARY_VERDICT}
   [design-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/design-summary.md)
   {design-summary.md content verbatim}
   ```
8. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 9.
9. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
10. **Else** → **Failure Path**.

### 🔒 Gate 8 — Summary

- [ ] `DESIGN_FINAL` resolved to highest `design-v*.md`
- [ ] Subagent invoked (`@bkit-design-summary`, no inline work)
- [ ] Artifact written (`design-summary.md`, non-empty)
- [ ] Verdict extracted (`SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `design-summary` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🤖 Step 9 — Design Workstream Issues

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Read `design-v3-organised.md` section `Design Workstreams`. For each workstream block `WS-{N}: {NAME}` → extract `{N}`, `{NAME}`, full `Scope` content as `{SCOPE}`, `Requires` values `[]` or `[WS-{N}, ...]` as `{REQUIRES}` , full `Rationale` content as `{RATIONALE}`. Set `WORKSTREAMS` array. **If** zero workstreams parsed → **Failure Path**.
2. `list_issues({ parentId: "{ISSUE_ID}", limit: 250 })` → `EXISTING` map of `WS-{N}` → `{ id, title }` matched by `^WS-{N}:` prefix in title.
3. Per workstream `WS-{N}` in `WORKSTREAMS`:
   - **If** `EXISTING[WS-{N}]` present → `save_comment({ issueId: "{EXISTING[WS-{N}].id}", body: "{BODY}"})` — `{BODY}` = fenced block below:
   ```comment
   ## Workstream Update — {FID}
   **Parent issue:** {ISSUE_ID}
   **Parent design:** [docs/plans/drafts/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/drafts/{FID}-design.md)
   **Workstream:** WS-{N} — {NAME}
   **Requires:** {REQUIRES}
   ### Scope
   {SCOPE}
   ### Rationale
   {RATIONALE}
   ```
   Set `WORKSTREAM_ISSUE_ID[WS-{N}]` = `EXISTING[WS-{N}].id`.
   - **Else** → `save_issue({ parentId: "{ISSUE_ID}", team: "Bartens", title: "WS-{N}: {NAME}", description: "{DESCRIPTION}"})` — `{DESCRIPTION}` = fenced block below:
   ```description
   ## Workstream Create — {FID}
   **Parent issue:** {ISSUE_ID}
   **Parent design:** [docs/plans/drafts/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/drafts/{FID}-design.md)
   **Workstream:** WS-{N} — {NAME}
   **Requires:** {REQUIRES}
   ### Scope
   {SCOPE}
   ### Rationale
   {RATIONALE}
   ```
   Capture returned `id` as `WORKSTREAM_ISSUE_ID[WS-{N}]`. **If** `id` empty → **Failure Path**.
4. **For** each `EXISTING[WS-{K}]` whose `WS-{K}` is NOT in `WORKSTREAMS` → `save_comment({ issueId: "{EXISTING[WS-{K}].id}", body: "{BODY}"})` — `{BODY}` = fenced block below:
   ```comment
   ## Workstream Delete — {FID}
   **Parent issue:** {ISSUE_ID}
   **Parent design:** [docs/plans/drafts/{FID}-design.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/drafts/{FID}-design.md)
   No longer in current design. Body left unchanged.
   ```
5. **For** each workstream `WS-{N}` with non-empty `Requires` → resolve `BLOCKED_BY` = `[WORKSTREAM_ISSUE_ID[WS-X] for X in Requires]`. **If** any entry empty → **Failure Path**. `save_issue({ id: "{WORKSTREAM_ISSUE_ID[WS-{N}]}", blockedBy: BLOCKED_BY })`.
6. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-workstream-issues", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): design-workstream-issues [skip build]"
   ```
7. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 9 — Design Workstream Issues
   ```

### 🔒 Gate 9 — Design Workstream Issues

- [ ] Workstreams parsed (`WORKSTREAMS` non-empty)
- [ ] Existing children listed (`list_issues` attempted)
- [ ] Per workstream resolved (`WORKSTREAM_ISSUE_ID` populated, no empty ids)
- [ ] Stale children commented (orphaned workstreams notified)
- [ ] Issues BlockedBy edges attempted (per `Requires`)
- [ ] Workflow status updated (step `design-workstream-issues` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🤖 Step 10 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Copy final design to drafts:
   ```bash
   DESIGN_FINAL=$(ls docs/plans/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)
   [ -z "$DESIGN_FINAL" ] && { echo "No design version found" >&2; exit 1; }
   DRAFT="docs/plans/drafts/{FID}-design.md"
   mkdir -p docs/plans/drafts
   cp "$DESIGN_FINAL" "$DRAFT"
   [ -s "$DRAFT" ] || { echo "Draft empty: $DRAFT" >&2; exit 1; }
   ```
2. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
3. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"design-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. Squash-merge to dev and clean up:
   ```bash
   cd "$REPO_ROOT"
   git checkout dev
   git pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git merge --squash "feat/{FID}"
   git add "docs/plans/logs/{FID}/status.json"
   git commit -m "docs({FID}): design DONE [skip ci]"
   git push origin dev || { echo "dev push failed" >&2; exit 1; }
   git show "dev:docs/plans/drafts/{FID}-design.md" > /dev/null 2>&1 || { echo "Canonical design missing on dev" >&2; exit 1; }
   git worktree remove "$REPO_ROOT/.worktrees/{FID}" --force
   git branch -D "feat/{FID}" 2>/dev/null || true
   git push origin --delete "feat/{FID}" 2>/dev/null || true
   git worktree prune
   LOCK="$REPO_ROOT/docs/plans/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
5. `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })` — `{LABELS}` unchanged.
6. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 10 — Close Workflow
   ```
7. **HARD STOP:** Design requires human review. Do NOT invoke `/plan`.

### 🔒 Gate 10 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] `SUMMARY_VERDICT` = PASS or CONCERNS confirmed
- [ ] Canonical design copied (`docs/plans/drafts/{FID}-design.md`, verified on `dev` post-merge)
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Workflow status updated (`design` `DONE`, step `design-close-workflow` recorded with `parentSha`)
- [ ] Changes merged to `dev` and pushed with `[skip ci]`
- [ ] Worktree removed and feature branch deleted
- [ ] Issue update attempted (state `In Review`; phase label `Design` preserved)
- [ ] Issue comment attempted (`Step 10` section)
