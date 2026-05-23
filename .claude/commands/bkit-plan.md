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
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls. **Else** → **Failure Path**. `{OWNER}` + `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/` (existing) or `date +%Y%m` (fresh start). `{PARENT_YYYYMM}` discovered similarly from `{PARENT_FID}`.
> - **Resume:** On start, read status.json — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json` = central state file (dev's working copy); ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`; **If** `failures` field present → cross-field invariants apply: `PASS ⇒ failures=0`, `FAIL ⇒ failures>0`, `CONCERNS ⇒ failures≥0`. Step `strategy` = `STANDARD | PIVOT | FINAL`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's `status.json` via `cat "$REPO_ROOT/$STATUS_REL"`: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → **Failure Path**; `IN_PROGRESS` + last step ≥30min idle → stale, clean.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `docs({FID}): plan DONE bkit [skip ci]`; Failure Path → `chore({FID}): plan FAILED bkit [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.

> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (CI-router trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.

> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   [ -f "$STATUS" ] && { t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"; }
   git rebase --abort 2>/dev/null || true
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json" 2>/dev/null || true
   git -C "$REPO_ROOT" commit -m "chore({FID}): plan FAILED bkit [skip ci]" 2>/dev/null || true
   git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   ```
2. Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
3. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
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
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Push or reset before retrying." >&2; exit 1; }
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-2)}')
   [ -z "$YYYYMM" ] && YYYYMM=$(date +%Y%m)
   mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
   LOCK="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/.lock"
   STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.json"
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
   printf '%s plan\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** divergence check or lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. **If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:design", "bkit:auto"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open`/`closed`), `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
6. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
7. **If** NO `FID` → create `FID` from `{ISSUE_ID}` + kebab from title, no stopwords, ≤3 tokens, lowercase; one `FID` for all artifacts once set.
   **Format:** `{ISSUE_ID}-{slug}` — no prefix, slug ≤3 tokens, kebab, lowercase, no stopwords (e.g. `123-add-foo-bar`). Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.
8. Extract parent design `FID` from issue `DESCRIPTION` as `PARENT_FID`.
9. Add `bkit:{phase}` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.
10. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
    `{BODY}` = fenced block below:
    ```comment
    ## Plan Workflow
    ### Step 1 — Start Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/main/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `ISSUE_ID`, `FID`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] `PARENT_FID` extraction from issue description attempted
- [ ] Issue update attempted (phase label `bkit:plan`)
- [ ] Issue comment attempted (`Step 1` section)

---

## 🤖 Step 2 — Worktree Setup

1. Commit any uncommitted changes before new worktree branch:
   ```bash
   if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
     git status --short
     git add docs/plans/ .agents/friction.md
     git diff --cached --quiet || git commit -m "chore({FID}): pre-worktree uncommitted changes bkit [skip build]"
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
   mkdir -p docs/plans/{YYYYMM}/logs/{FID}/
   for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
     [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
   done
   [ -d "$REPO_ROOT/.vale/styles/write-good" ] && cp -R "$REPO_ROOT/.vale/styles/write-good" "$WORKTREE_PATH/.vale/styles/"
   pnpm install --frozen-lockfile
   ```
3. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
4. Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md` = session prompt + `DESCRIPTION` + `COMMENTS`. **If** `PARENT_FID` empty → standalone, do NOT append. **Else** append `docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md`; missing file → **Failure Path**.
5. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   mkdir -p "$(dirname "$STATUS")"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "plan" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"plan", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"plan-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"plan-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/{YYYYMM}/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/status.json)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] Artifact written (`plan-input.md`, non-empty)
- [ ] Parent design appended (if present)
- [ ] Workflow status updated (`plan` `IN_PROGRESS`, steps `plan-start-workflow` and `plan-worktree-setup` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🧠 Step 3 — Generate Plan

1. **Subagent:** Invoke `@bkit-plan-generate` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"plan-generate", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): generate-plan"
   ```
4. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Generate Plan
   [plan-v1-draft.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md)
   ```

### 🔒 Gate 3 — Generate Plan

- [ ] Subagent invoked (`@bkit-plan-generate`, no inline work)
- [ ] Artifact written (`plan-v1-draft.md`, non-empty)
- [ ] Workflow status updated (step `plan-generate` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Review Plan

1. Launch all three subagents in parallel using `Agent` tool. Each carries a distinct lens; reviews are merged downstream by `@bkit-plan-update` (max-wins on CRITICAL findings):
   - **Subagent:** Invoke `@bkit-plan-review-1`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md`.
   - **Subagent:** Invoke `@bkit-plan-review-2`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md`.
   - **Subagent:** Invoke `@bkit-plan-review-3`
     Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-review-1.md`, `plan-review-2.md`, and `plan-review-3.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `REVIEW_VERDICT` = worst of the three (`FAIL > CONCERNS > PASS`) and `REVIEW_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REVIEW_VERDICT" --argjson f "$REVIEW_FAILURES" \
     '.[-1].steps += [{step:"plan-review", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md","docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md","docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): review-plan"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Review Plan - Verdict: {REVIEW_VERDICT} - Failures: {REVIEW_FAILURES}
   ```

### 🔒 Gate 4 — Review Plan

- [ ] Subagents invoked (`@bkit-plan-review-1`, `@bkit-plan-review-2`, `@bkit-plan-review-3`, no inline work)
- [ ] Artifacts written (`plan-review-1.md`, `plan-review-2.md`, `plan-review-3.md`, non-empty)
- [ ] Verdicts extracted (`REVIEW_VERDICT`, `REVIEW_FAILURES`)
- [ ] Verdict valid (`REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-review-1.md`, `plan-review-2.md`, `plan-review-3.md`)
- [ ] Workflow status updated (step `plan-review` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Apply Review

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying review critiques. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations. Input critiques carry distinct lenses — merge across them, max-wins on CRITICAL findings.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-review-3.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v2-reviewed.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_REVIEW_VERDICT`. **If** `APPLY_REVIEW_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v2-reviewed.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_REVIEW_VERDICT" \
     '.[-1].steps += [{step:"plan-apply-review", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-review"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Apply Review - Verdict: {APPLY_REVIEW_VERDICT}
   [plan-v2-reviewed.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md)
   ```

### 🔒 Gate 5 — Apply Review

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Artifact written (`plan-v2-reviewed.md`, non-empty)
- [ ] Verdict extracted (`APPLY_REVIEW_VERDICT`)
- [ ] Verdict valid (`APPLY_REVIEW_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `plan-apply-review` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🧠 Step 6 — Scope Check

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-plan-scope-check-1`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md`.
   - **Subagent:** Invoke `@bkit-plan-scope-check-2`
     Context: You are a subagent in the Plan phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-scope-check-1.md` and `plan-scope-check-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `SCOPE_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `SCOPE_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SCOPE_VERDICT" --argjson f "$SCOPE_FAILURES" \
     '.[-1].steps += [{step:"plan-scope-check", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md","docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): scope-check"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 6 — Scope Check - Verdict: {SCOPE_VERDICT} - Failures: {SCOPE_FAILURES}
   ```

### 🔒 Gate 6 — Scope Check

- [ ] Subagents invoked (`@bkit-plan-scope-check-1`, `@bkit-plan-scope-check-2`, no inline work)
- [ ] Artifacts written (`plan-scope-check-1.md` and `plan-scope-check-2.md`, non-empty)
- [ ] Verdicts extracted (`SCOPE_VERDICT`, `SCOPE_FAILURES`)
- [ ] Verdict valid (`SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`plan-scope-check-1.md` and `plan-scope-check-2.md`)
- [ ] Workflow status updated (step `plan-scope-check` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🧠 Step 7 — Apply Scope

1. **Subagent:** Invoke `@bkit-plan-update` using `Agent` tool:
   Context: You are a subagent in the Plan phase applying scope-check critiques. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-scope-check-2.md`.
   Update: `docs/pending.md` (APPEND scope expansions if any).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v3-checked.md` until `<!-- verdict:end -->` → extract `Verdict` as `APPLY_SCOPE_VERDICT`. **If** `APPLY_SCOPE_VERDICT` not in `PASS|CONCERNS|FAIL` → invoke offending **subagent** again with `"Your prior output 'plan-v3-checked.md' has an invalid verdict. Re-emit ONLY 'Verdict: PASS|CONCERNS|FAIL' + '<!-- verdict:end -->' at top of that file. Do NOT redo work."` → wait for subagent and re-extract → **If** still invalid → **Failure Path**.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$APPLY_SCOPE_VERDICT" \
     '.[-1].steps += [{step:"plan-apply-scope", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): apply-scope"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 7 — Apply Scope - Verdict: {APPLY_SCOPE_VERDICT}
   [plan-v3-checked.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md)
   ```

### 🔒 Gate 7 — Apply Scope

- [ ] Subagent invoked (`@bkit-plan-update`, no inline work)
- [ ] Scope expansions in `docs/pending.md` (if any)
- [ ] Artifact written (`plan-v3-checked.md`, non-empty)
- [ ] Verdict extracted (`APPLY_SCOPE_VERDICT`)
- [ ] Verdict valid (`APPLY_SCOPE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `plan-apply-scope` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Complexity Check

1. **Subagent:** Invoke `@bkit-plan-complexity-check` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-complexity-check.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-complexity-check.md` until `<!-- verdict:end -->` → extract `Verdict` as `COMPLEXITY_VERDICT` (`SINGLE` = no split, `SPLIT` = partition required).
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$COMPLEXITY_VERDICT" \
     '.[-1].steps += [{step:"plan-complexity-check", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-complexity-check.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): complexity-check"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Complexity Check - Verdict: {COMPLEXITY_VERDICT}
   ```

### 🔒 Gate 8 — Complexity Check

- [ ] Subagent invoked (`@bkit-plan-complexity-check`, no inline work)
- [ ] Artifact written (`plan-complexity-check.md`, non-empty)
- [ ] `COMPLEXITY_VERDICT` extracted
- [ ] Workflow status updated (step `plan-complexity-check` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🧠 Step 9 — Complexity Split

**Run only if** Step 8 `COMPLEXITY_VERDICT` = SPLIT.

1. **Subagent:** Invoke `@bkit-plan-complexity-split` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Single versioned output: parent in `plan-v4-split.md`, child sub-plans in `plan-v4-1.md`, `plan-v4-2.md`, ..., `plan-v4-N.md`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-v3-checked.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md` (parent index with verdict header), `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-1.md` ... `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-N.md` (children).
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `plan-v4-split.md` until `<!-- verdict:end -->` → extract `Verdict` as `SPLIT_VERDICT`.
4. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SPLIT_VERDICT" \
     '.[-1].steps += [{step:"plan-complexity-split", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): complexity-split"
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Complexity Split - Verdict: {SPLIT_VERDICT}
   [plan-v4-split.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/plan-v4-split.md)
   ```
6. **If** `SPLIT_VERDICT` = PASS → Step 10.
7. **If** `SPLIT_VERDICT` = FAIL → **Failure Path**.
8. **Else** → **Failure Path**.

### 🔒 Gate 9 — Complexity Split

- [ ] Subagent invoked (`@bkit-plan-complexity-split`, no inline work)
- [ ] Artifact written (`plan-v4-split.md`, non-empty)
- [ ] Children written (`plan-v4-1.md` ... `plan-v4-N.md`, non-empty)
- [ ] Verdict extracted (`SPLIT_VERDICT`)
- [ ] Verdict valid (`SPLIT_VERDICT` in `PASS|FAIL`)
- [ ] Workflow status updated (step `plan-complexity-split` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🧠 Step 10 — Summary

1. Resolve highest plan version: `PLAN_FINAL=$(ls docs/plans/{YYYYMM}/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)`. **If** empty → **Failure Path**.
2. **Subagent:** Invoke `@bkit-plan-summary` using `Agent` tool:
   Context: You are a subagent in the Plan phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `{PLAN_FINAL}` (highest v{N}), glob `docs/plans/{YYYYMM}/logs/{FID}/plan-v4-*.md` (children if SPLIT), `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/plan-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/plan-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md`.
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `plan-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
5. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"plan-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary bkit [skip build] bkit [skip ci]"
   ```
6. Assert `{BRANCH}` non-empty and push:
   ```bash
   git push origin $(git branch --show-current)
   ```
7. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Summary - Verdict: {SUMMARY_VERDICT}
   [plan-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md)
   {plan-summary.md content verbatim}
   ```
8. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 11.
9. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
10. **Else** → **Failure Path**.

### 🔒 Gate 10 — Summary

- [ ] `PLAN_FINAL` resolved to highest `plan-v*.md` (excluding child `plan-v4-N.md`)
- [ ] Subagent invoked (`@bkit-plan-summary`, no inline work)
- [ ] Artifact written (`plan-summary.md`, non-empty)
- [ ] Verdict extracted (`SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `plan-summary` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🤖 Step 11 — Close Workflow

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. Copy final plan to canonical bucket:
   ```bash
   YYYYMM=$(ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-2)}')
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
2. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
3. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"plan-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. Squash-merge to dev and clean up:
   ```bash
   cd "$REPO_ROOT"
   git checkout dev
   git pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git merge --squash "feat/{FID}"
   git add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git commit -m "docs({FID}): plan DONE bkit [skip ci]"
   git push origin dev || { echo "dev push failed" >&2; exit 1; }
   git worktree remove "$REPO_ROOT/.worktrees/{FID}" --force
   git branch -D "feat/{FID}" 2>/dev/null || true
   git push origin --delete "feat/{FID}" 2>/dev/null || true
   git worktree prune
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   ```
5. GitHub no-op. Issue stays `open`; phase label set in `issue-update-phase` carries the completion signal until the next phase or terminal ship close (`issue-update-merged`).
6. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 11 — Close Workflow
   ```
7. **HARD STOP:** Plan requires human review. Do NOT invoke `/build`.

### 🔒 Gate 11 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] `SUMMARY_VERDICT` = PASS or CONCERNS confirmed
- [ ] Canonical plan copied (`docs/plans/{YYYYMM}/{FID}-plan.md`, verified on `dev` post-merge; same for each `{FID}-plan-N.md` if SPLIT — `{YYYYMM}` = creation month)
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] Workflow status updated (`plan` `DONE`, step `plan-close-workflow` recorded with `parentSha`)
- [ ] Changes merged to `dev` and pushed with `bkit [skip ci]`
- [ ] Worktree removed and feature branch deleted
- [ ] Issue update attempted (state `In Review`; phase label `Plan` preserved)
- [ ] Issue comment attempted (`Step 11` section)
