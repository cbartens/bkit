---
description: "Build Feature — Autonomous implementation"
---

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
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls. **Else** → **Failure Path**. `{OWNER}` + `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Resume:** On start, read status.json — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json` = central state file; ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`; **If** `failures` field present → cross-field invariants apply: `PASS ⇒ failures=0`, `FAIL ⇒ failures>0`, `CONCERNS ⇒ failures≥0`. Step `strategy` = `STANDARD | PIVOT | FINAL`.
> - **Locks:** Acquire `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` in first step right after `mkdir -p` of logs dir; release in last step and Failure Path; assert lock file is absent before exiting (else **Failure Path** with `Lock removal failed`). **If** existing lock — cross-check its owning workflow's `status.json` via `cat "$REPO_ROOT/$STATUS_REL"`: `DONE` or `FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → **Failure Path**; `IN_PROGRESS` + last step ≥30min idle → stale, clean.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `chore({FID}): build DONE bkit [skip ci]`; Failure Path → `chore({FID}): build FAILED bkit [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.

<!-- bkit:tracker rule-block start -->

> _Tracker not wired — skip._

<!-- bkit:tracker rule-block end -->

> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** Reference constants `MAX_VERIFY_ATTEMPT` = 3 and `MAX_TEST_ATTEMPT` = 3 in retry checks below.
> - **Large Diff Guard:** When Read line passes `git diff origin/dev..HEAD` to subagents, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

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
   rm -f "$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
   git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json" 2>/dev/null || true
   git -C "$REPO_ROOT" commit -m "chore({FID}): build FAILED bkit [skip ci]" 2>/dev/null || true
   git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   ```
2. <!-- bkit:tracker issue-update-failed start -->
   _Tracker not wired — skip._
   <!-- bkit:tracker issue-update-failed end -->
3. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
4. **If** failure triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) **or** rebase failure sentinel previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.json`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
6. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): build aborted bkit [skip build] bkit [skip ci]"`.
10. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)` — if push fails, do not claim success on Linear.
11. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
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
   AHEAD=$(git rev-list --count origin/dev..dev 2>/dev/null || echo 0)
   [ "$AHEAD" -gt 0 ] && { echo "Local dev is $AHEAD commits ahead of origin/dev. Push or reset before retrying." >&2; exit 1; }
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before build" >&2; exit 1; }
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
   printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** divergence check or lock acquisition exits non-zero → **Failure Path**.
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
5. <!-- bkit:tracker issue-id-extraction start -->
   _Tracker not wired — skip ISSUE_ID resolution._
   <!-- bkit:tracker issue-id-extraction end -->
6. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker issue-read start -->
   _Tracker not wired — skip issue read._
   <!-- bkit:tracker issue-read end -->
7. <!-- bkit:tracker issue-blockers-check start -->
   _Tracker not wired — skip blocker check._
   <!-- bkit:tracker issue-blockers-check end -->
8. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID`. **Else** → **Failure Path**.
9. **If** NO `FID` → create `FID` → lowercase Linear `ISSUE_ID` and kebab from title, no stopwords, ≤3 tokens, lowercase (e.g. `bar-123-word1-word2-word3`); one `FID` for all artifacts once set.
   <!-- bkit:tracker fid-format start -->
   _Tracker not wired — skip FID format assertion._
   <!-- bkit:tracker fid-format end -->
   **Else** → **Failure Path**.
10. Add `Build` phase to `{LABELS}` and drop old phase.
    <!-- bkit:tracker issue-update-phase start -->
    _Tracker not wired — skip issue update._
    <!-- bkit:tracker issue-update-phase end -->
    <!-- bkit:tracker issue-update-status start -->
    _Tracker not wired — skip status/state update._
    <!-- bkit:tracker issue-update-status end -->
11. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below:
    ```comment
    ## Build Workflow
    ### Step 1 — Start Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `ISSUE_ID`, `FID`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] Not blocked by any related issues
- [ ] Long-branch advisory emitted
- [ ] Issue update attempted (phase label `bkit:build`, status/state `In Progress`)
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
4. **If** sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` exists → **Failure Path**.
5. Sub-plan count:
   ```bash
   SUB_COUNT=$(ls docs/plans/{YYYYMM}/{FID}-plan-*.md 2>/dev/null | wc -l)
   [ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
   ```
6. Init counters: `VERIFY_ATTEMPT` = 0, `TEST_ATTEMPT` = 0, `CHALLENGE_REMEDIATE_ATTEMPT` = 0.
7. Create: `docs/plans/{YYYYMM}/logs/{FID}/build-input.md` = session prompt + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
8. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "build" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"build", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"build-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"build-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-input.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
9. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Worktree Setup
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   [docs/plans/{YYYYMM}/logs/{FID}/status.json](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/status.json)
   ```

### 🔒 Gate 2 — Worktree Setup

- [ ] Worktree created/resumed (`.worktrees/{FID}`, `pwd` inside worktree)
- [ ] `BRANCH` non-empty (updated to worktree branch)
- [ ] Plan files in `docs/plans/{YYYYMM}/` (canonical bucket)
- [ ] Counters initialised (`SUB_COUNT` set, `VERIFY_ATTEMPT` = 0, `TEST_ATTEMPT` = 0, `CHALLENGE_REMEDIATE_ATTEMPT` = 0)
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
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"build-branch-sync", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): branch-sync"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Branch Sync
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 3 — Branch Sync

- [ ] `docs/` not behind `origin/dev`
- [ ] On correct worktree branch
- [ ] Workflow status updated (step `build-branch-sync` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🧠 Step 4 — Install Skills

**Skip if** build input contains `[skills=false]`.

1. **Subagent:** Invoke `@bkit-build-install-skills` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `.agents/skills.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"build-install-skills", status:"DONE", attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): install-skills"
   ```
4. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
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
2. **If** `SUB_COUNT` >= 2 → loop `SUB_PLAN` from 1 to `SUB_COUNT` using `{FID}-plan-{SUB_PLAN}.md`. Reset `VERIFY_ATTEMPT` = 0 at start of each `SUB_PLAN`.

Per-step summary file naming for sub-plan loop steps: `{step}-{SUB_PLAN}-{ATTEMPT}.md` (e.g. `plan-verify-1-2.md` = sub-plan 1, attempt 2).

---

### 🧠 Step 5 — Plan Execute

3. **Subagent:** Invoke `@bkit-build-plan-execute` using `Agent` tool:
   Context: You are a subagent in the Build phase. Execute sub-plan `{SUB_PLAN}`/`{SUB_COUNT}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{SUB_PLAN}-log.md`.
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `build-plan-execute-{SUB_PLAN}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `EXECUTE_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$EXECUTE_VERDICT" --argjson sp "$SUB_PLAN" \
     '.[-1].steps += [{step:"build-plan-execute", status:"DONE", verdict:$v, attempt:1, subPlan:$sp, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-'"${SUB_PLAN}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): plan-execute sub-plan ${SUB_PLAN}"
   ```
7. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Plan Execute - Verdict: {EXECUTE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT}
   ```

### 🔒 Gate 5 — Plan Execute

- [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
- [ ] Artifact written (`build-plan-execute-{SUB_PLAN}-log.md`, non-empty)
- [ ] Source files implemented
- [ ] `EXECUTE_VERDICT` extracted
- [ ] Workflow status updated (step `build-plan-execute` recorded with `parentSha`, `verdict`, `subPlan`)
- [ ] Issue comment attempted (`Step 5` section)

---

### 🧠 Step 6 — Plan Verify

8. Increment `VERIFY_ATTEMPT` + 1.
9. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Single plan verification. Sub-plan `{SUB_PLAN}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{SUB_PLAN}-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-*-log.md`, `git diff origin/dev..HEAD`(apply **Large Diff Guard**; filter to changes relevant to this sub-plan's checklist; ignore changes outside scope).
   Update:`docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`.
10. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
11. Read `build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `VERIFY_VERDICT` and `Failures` as `VERIFY_FAILURES`.
12. Update status and commit:
    ```bash
    STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
    PARENT_SHA=$(git rev-parse HEAD)
    t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$VERIFY_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --argjson f "$VERIFY_FAILURES" \
      '.[-1].steps += [{step:"build-plan-verify", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'.md"]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    git add -A && git commit --allow-empty -m "chore({FID}): plan-verify sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT}"
    ```
13. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below:
    ```comment
    ### Step 6 — Plan Verify - Verdict: {VERIFY_VERDICT} - Failures: {VERIFY_FAILURES} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT}
    ```
14. **If** `VERIFY_VERDICT` = PASS:
    - **If** more sub-plans remain (`SUB_PLAN` < `SUB_COUNT`) → next `SUB_PLAN` → Step 5.
    - **Else** → Step 8.
15. **If** `VERIFY_VERDICT` = CONCERNS or FAIL:
    - **If** `VERIFY_ATTEMPT` <= `MAX_VERIFY_ATTEMPT` → Step 7.
    - **Else** → **Failure Path**.
16. **Else** → **Failure Path**.

### 🔒 Gate 6 — Plan Verify

- [ ] `VERIFY_ATTEMPT` incremented
- [ ] Subagent invoked (`@bkit-build-plan-verify`, no inline work)
- [ ] Artifact written (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`, non-empty)
- [ ] Verdicts extracted (`VERIFY_VERDICT`, `VERIFY_FAILURES`)
- [ ] Verdict valid (`VERIFY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`)
- [ ] Workflow status updated (step `build-plan-verify` recorded with `parentSha`, `verdict`, `attempt`, `subPlan`)
- [ ] Issue comment attempted (`Step 6` section)

---

### 🧠 Step 7 — Plan Gaps Remediate

**Run only if** Step 6 `VERIFY_VERDICT` = FAIL.

17. Read status.json and extract `PRIOR_STRATEGY`:
    ```bash
    PRIOR_STRATEGY=$(jq -r --arg s "plan-gaps-remediate" --argjson sp "$SUB_PLAN" \
      '[.[] | .steps[] | select(.step==$s and .subPlan==$sp and .status=="DONE")] | last.strategy // ""' \
      docs/plans/{YYYYMM}/logs/{FID}/status.json)
    ```
18. Set next `STRATEGY`:
    - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
    - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
    - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
    - **Else** → **Failure Path**.
19. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Sub-plan `{SUB_PLAN}`, attempt `{VERIFY_ATTEMPT}`. Strategy: `{STRATEGY}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
    Read:`docs/plans/{YYYYMM}/{FID}-plan-{SUB_PLAN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-*-log.md`.
    Update: Source files.
    Create:`docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md`.
20. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
21. Read `build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`, and `Strategy` as `STRATEGY`.
22. Update status and commit:
    ```bash
    STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
    PARENT_SHA=$(git rev-parse HEAD)
    t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$VERIFY_ATTEMPT" --argjson sp "$SUB_PLAN" --arg strat "$STRATEGY" \
      '.[-1].steps += [{step:"build-plan-gaps-remediate", status:"DONE", verdict:$v, attempt:$a, subPlan:$sp, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-'"${SUB_PLAN}"'-'"${VERIFY_ATTEMPT}"'-log.md"]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    git add -A && git commit --allow-empty -m "chore({FID}): plan-gaps-remediate sub-plan ${SUB_PLAN} attempt ${VERIFY_ATTEMPT}"
    ```
23. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below:
    ```comment
    ### Step 7 — Plan Gaps Remediate - Verdict: {REMEDIATE_VERDICT} - Sub-plan: {SUB_PLAN}/{SUB_COUNT} - Attempt: {VERIFY_ATTEMPT} - Strategy: {STRATEGY}
    ```
24. Re-run Step 6.

### 🔒 Gate 7 — Plan Gaps Remediate

- [ ] Subagent invoked (`@bkit-build-plan-gaps-remediate`, no inline work)
- [ ] Artifact written (`build-plan-gaps-remediate-{SUB_PLAN}-{VERIFY_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] Verdict and strategy extracted (`REMEDIATE_VERDICT`, `STRATEGY`)
- [ ] Workflow status updated (step `build-plan-gaps-remediate` recorded with `parentSha`, `verdict`, `attempt`, `subPlan`, `strategy`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Plan Verify Holistic

**Run only if** `SUB_COUNT` >= 2. **Skip if** `SINGLE_PLAN` = true.

1. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Holistic plan verification (master and sub-plans). Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, all `docs/plans/{YYYYMM}/{FID}-plan-N.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**; review full feature diff for cross-sub-plan integration).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-plan-verify-holistic.md` until `<!-- verdict:end -->` → extract `Verdict` as `HOLISTIC_VERDICT` and `Failures` as `HOLISTIC_FAILURES`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$HOLISTIC_VERDICT" --argjson f "$HOLISTIC_FAILURES" \
     '.[-1].steps += [{step:"build-plan-verify-holistic", status:"DONE", verdict:$v, attempt:1, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): plan-verify-holistic"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Plan Verify Holistic - Verdict: {HOLISTIC_VERDICT} - Failures: {HOLISTIC_FAILURES}
   ```
6. **If** `HOLISTIC_VERDICT` = PASS or CONCERNS → Step 9.
7. **If** `HOLISTIC_VERDICT` = FAIL → **Failure Path**.
8. **Else** → **Failure Path**.

### 🔒 Gate 8 — Plan Verify Holistic

- [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
- [ ] Artifact written (`build-plan-verify-holistic.md`, non-empty)
- [ ] Verdicts extracted (`HOLISTIC_VERDICT`, `HOLISTIC_FAILURES`)
- [ ] Verdict valid (`HOLISTIC_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-plan-verify-holistic.md`)
- [ ] Workflow status updated (step `build-plan-verify-holistic` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)

---

## 🧠 Step 9 — Build Challenge

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-build-challenge-1`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md`.
   - **Subagent:** Invoke `@bkit-build-challenge-2`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
2. Wait for all subagents to complete. Assert both files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge-1.md` and `build-challenge-2.md` (until `<!-- verdict:end -->` each) → extract `Verdict` and `Failures` from each → compute `CHALLENGE_VERDICT` = worst of the two (`FAIL > CONCERNS > PASS`) and `CHALLENGE_FAILURES` = sum of failures from each.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" --arg v "$CHALLENGE_VERDICT" --argjson f "$CHALLENGE_FAILURES" \
     '.[-1].steps += [{step:"build-challenge", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md","docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
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

1. **Subagent:** Invoke `@bkit-build-challenge-reconcile` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_VERDICT` and `Failures` as `CHALLENGE_FAILURES`. `CHALLENGE_VERDICT` must be in `PASS|CONCERNS|FAIL` (canonical challenge verdict; NO `BLOCK`/`WARN`).
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_VERDICT" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" --argjson f "$CHALLENGE_FAILURES" \
     '.[-1].steps += [{step:"build-challenge-reconcile", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-reconcile attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Reconcile Build Challenge - Verdict: {CHALLENGE_VERDICT} - Failures: {CHALLENGE_FAILURES} - Attempt: {CHALLENGE_REMEDIATE_ATTEMPT}
   ```
6. **If** `CHALLENGE_VERDICT` = PASS → Step 13.
7. **If** `CHALLENGE_VERDICT` = CONCERNS AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11.
8. **If** `CHALLENGE_VERDICT` = CONCERNS AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13.
9. **If** `CHALLENGE_VERDICT` = FAIL AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11.
10. **If** `CHALLENGE_VERDICT` = FAIL AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → **Failure Path**.
11. **Else** → **Failure Path**.

### 🔒 Gate 10 — Reconcile Build Challenge

- [ ] Subagent invoked (`@bkit-build-challenge-reconcile`, no inline work)
- [ ] Artifact written (`build-challenge.md`, non-empty)
- [ ] Verdicts extracted (`CHALLENGE_VERDICT`, `CHALLENGE_FAILURES`)
- [ ] Verdict valid (`CHALLENGE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`build-challenge.md`)
- [ ] Workflow status updated (step `build-challenge-reconcile` recorded with `parentSha`, `verdict`, `attempt`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🧠 Step 11 — Build Challenge Remediate

**Run only if** Step 10 `CHALLENGE_VERDICT` = CONCERNS or FAIL **and** `CHALLENGE_REMEDIATE_ATTEMPT` < 1.

1. Increment `CHALLENGE_REMEDIATE_ATTEMPT` + 1.
2. **Subagent:** Invoke `@bkit-build-challenge-remediate` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md`.
3. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
4. Read `build-challenge-remediate-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_CHALLENGE_VERDICT`.
5. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_CHALLENGE_VERDICT" --argjson a "$CHALLENGE_REMEDIATE_ATTEMPT" \
     '.[-1].steps += [{step:"build-challenge-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-remediate attempt ${CHALLENGE_REMEDIATE_ATTEMPT}"
   ```
6. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 11 — Build Challenge Remediate - Verdict: {REMEDIATE_CHALLENGE_VERDICT} - Attempt: {CHALLENGE_REMEDIATE_ATTEMPT}
   ```
7. **If** `REMEDIATE_CHALLENGE_VERDICT` = FAIL → **Failure Path**.
8. **Else** → Step 12.

### 🔒 Gate 11 — Build Challenge Remediate

- [ ] `CHALLENGE_REMEDIATE_ATTEMPT` incremented
- [ ] Subagent invoked (`@bkit-build-challenge-remediate`, no inline work)
- [ ] Artifact written (`build-challenge-remediate-log.md`, non-empty)
- [ ] Source files modified or classify-gate FAIL recorded
- [ ] `REMEDIATE_CHALLENGE_VERDICT` extracted (in `PASS|CONCERNS|FAIL`)
- [ ] Workflow status updated (step `build-challenge-remediate` recorded with `parentSha`, `verdict`, `attempt`)
- [ ] Issue comment attempted (`Step 11` section)

---

## 🧠 Step 12 — Build Challenge Tests

**Run only if** Step 10 `CHALLENGE_VERDICT` = CONCERNS or FAIL.

1. **Subagent:** Invoke `@bkit-build-challenge-tests` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md` (if exists), `docs/plans/{YYYYMM}/logs/{FID}/build-challenge.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-remediate-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-tests.md`, test files.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-challenge-tests.md` until `<!-- verdict:end -->` → extract `Verdict` as `CHALLENGE_TESTS_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$CHALLENGE_TESTS_VERDICT" \
     '.[-1].steps += [{step:"build-challenge-tests", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-challenge-tests.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): build-challenge-tests"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 12 — Build Challenge Tests - Verdict: {CHALLENGE_TESTS_VERDICT}
   ```
6. **If** `CHALLENGE_VERDICT` = FAIL → **Re-run Step 9**. **Else** → Step 13.

### 🔒 Gate 12 — Build Challenge Tests

- [ ] Subagent invoked (`@bkit-build-challenge-tests`, no inline work)
- [ ] Artifact written (`build-challenge-tests.md`, non-empty)
- [ ] Test files created/updated
- [ ] `CHALLENGE_TESTS_VERDICT` extracted
- [ ] Workflow status updated (step `build-challenge-tests` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 12` section)
- [ ] Routing applied (re-run Step 9 if `CHALLENGE_VERDICT` = FAIL; else Step 13)

---

## 🤖 Step 13 — Run Tests

1. Increment `TEST_ATTEMPT` + 1.
2. Run verbatim — do NOT modify quoting, filter, or glob:
   ```bash
   if [ -f turbo.json ]; then
     pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue
   else
     set -e
     for s in typecheck test format:check lint:slop lint:prose; do
       if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1; then pnpm "$s"; fi
     done
   fi
   ```
3. Set `TEST_VERDICT` and `TEST_FAILURES` from exit code: **If** all tests passed `TEST_VERDICT` = PASS and `TEST_FAILURES` = 0. **Else** `TEST_VERDICT` = FAIL and `TEST_FAILURES` = count of failing test suites (≥1).
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$TEST_VERDICT" --argjson a "$TEST_ATTEMPT" --argjson f "$TEST_FAILURES" \
     '.[-1].steps += [{step:"build-run-tests", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): run-tests attempt ${TEST_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 13 — Run Tests - Verdict: {TEST_VERDICT} - Failures: {TEST_FAILURES} - Attempt: {TEST_ATTEMPT}
   ```
6. **If** all tests PASS → Step 16.
7. **If** some tests FAIL:
   - **If** `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT` → Step 14.
   - **Else** → **Failure Path**.
8. **Else** → **Failure Path**.

### 🔒 Gate 13 — Run Tests

- [ ] `TEST_ATTEMPT` incremented
- [ ] Tests executed (turbo path if `turbo.json`, else single-package script fallback)
- [ ] Verdicts extracted (`TEST_VERDICT`, `TEST_FAILURES`)
- [ ] Workflow status updated (step `build-run-tests` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 13` section)

---

## 🧠 Step 14 — Failure Diagnose

**Run only if** Step 13 tests FAIL.

1. Read status.json and extract `PRIOR_STRATEGY`:
   ```bash
   PRIOR_STRATEGY=$(jq -r --arg s "failure-diagnose" \
     '[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""' \
     docs/plans/{YYYYMM}/logs/{FID}/status.json)
   ```
2. Set next `STRATEGY`:
   - **If** `PRIOR_STRATEGY` empty → `STRATEGY` = STANDARD.
   - **If** `PRIOR_STRATEGY` = STANDARD → `STRATEGY` = PIVOT.
   - **If** `PRIOR_STRATEGY` = PIVOT → `STRATEGY` = FINAL.
   - **Else** → **Failure Path**.
3. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Strategy: `{STRATEGY}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`.
   Create:`docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `build-failure-diagnose-{TEST_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$TEST_ATTEMPT" --arg strat "$STRATEGY" \
     '.[-1].steps += [{step:"build-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-'"${TEST_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${TEST_ATTEMPT}"
   ```
7. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 14 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Strategy: {STRATEGY} - Attempt: {TEST_ATTEMPT}
   ```

### 🔒 Gate 14 — Failure Diagnose

- [ ] `STRATEGY` computed before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`build-failure-diagnose-{TEST_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted (`DIAGNOSE_VERDICT`)
- [ ] Verdict valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`build-failure-diagnose-{TEST_ATTEMPT}.md`)
- [ ] Workflow status updated (step `build-failure-diagnose` recorded with `parentSha`, `verdict`, `strategy`)
- [ ] Issue comment attempted (`Step 14` section)

---

## 🧠 Step 15 — Failure Remediate

**Run only if** Step 13 tests FAIL.

1. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
   Update: Source and test files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-failure-remediate-{TEST_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$TEST_ATTEMPT" \
     '.[-1].steps += [{step:"build-failure-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-'"${TEST_ATTEMPT}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-remediate attempt ${TEST_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 15 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Attempt: {TEST_ATTEMPT}
   ```
6. **Re-run Step 13**.

### 🔒 Gate 15 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`build-failure-remediate-{TEST_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] `REMEDIATE_VERDICT` extracted
- [ ] Workflow status updated (step `build-failure-remediate` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 15` section)

---

## 🧠 Step 16 — Summary

**Run only if** all Step 13 tests PASS.

1. **Subagent:** Invoke `@bkit-build-summary` using `Agent` tool:
   Context: You are a subagent in the Build phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/build-input.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `git log --oneline origin/dev..HEAD` (commit subjects only).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-summary.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `build-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"build-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/build-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): summary"
   ```
5. Assert `{BRANCH}` non-empty. `git push -u origin $(git branch --show-current)`.
6. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 16 — Summary - Verdict: {SUMMARY_VERDICT}
   [build-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/build-summary.md)
   {build-summary.md content verbatim}
   ```
7. Read `Recommended Next Step` section from `docs/plans/{YYYYMM}/logs/{FID}/build-summary.md` → extract `{NEXT_STEP}` without heading. **If** missing → set `{NEXT_STEP}` = `No next-step recommendation`.
   <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Recommended Next Step
   {NEXT_STEP}
   ```
8. Final return: Present `{NEXT_STEP}` verbatim in final message to user — do NOT auto-invoke.
9. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 17.
10. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
11. **Else** → **Failure Path**.

### 🔒 Gate 16 — Summary

- [ ] Subagent invoked (`@bkit-build-summary`, no inline work)
- [ ] Artifact written (`build-summary.md`, non-empty)
- [ ] Verdict extracted (`SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `build-summary` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 16` section)
- [ ] Next-step handoff comment attempted (dedicated `Recommended Next Step` comment)
- [ ] `{NEXT_STEP}` surfaced verbatim in the final return to the user (advisory, not auto-invoked)

---

## 🤖 Step 17 — Create PR

**Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.

1. `git fetch origin dev`.
2. **If** `git diff origin/dev --name-only | grep -q '^supabase/migrations/'` **and** `git show -s --format=%B HEAD | grep -qF '[force build]'` fails → amend or `git commit --allow-empty` with `bkit [force build]` → `git push`.
3. Create PR:
   ```bash
   gh pr create --base dev --title "feat({FID}): {summary}" --body "$(cat <<'EOF'
   <!-- bkit:tracker pr-body-marker start -->
   <!-- bkit:fid={FID} -->
   <!-- bkit:tracker pr-body-marker end -->
   <!-- bkit:start -->
   https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-plan.md
   <!-- bkit:end -->
   EOF
   )"
   ```
4. **If** `gh pr create` fails → retry once. **If** still fails → **Failure Path**.
5. Extract `PR_URL` and `PR_NUMBER` from created PR. Assert both non-empty.
6. `PR_BASE=$(gh pr view {PR_NUMBER} --json baseRefName --jq .baseRefName)`. **If** `PR_BASE` != dev → **Failure Path**.
7. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg u "$PR_URL" \
     '.[-1].steps += [{step:"build-create-pr", status:"DONE", at:$t, parentSha:$p, artifacts:[$u]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): create-pr"
   ```
8. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 17 — Create PR
   [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
   ```

### 🔒 Gate 17 — Create PR

- [ ] PR created (`PR_URL`, `PR_NUMBER` non-empty)
- [ ] PR base verified (`PR_BASE` = dev)
- [ ] Workflow status updated (step `build-create-pr` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 17` section)

---

## 🤖 Step 18 — Close Workflow

1. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
2. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"build-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow"
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   git push origin "$(git branch --show-current)"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "chore({FID}): build DONE bkit [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
3. <!-- bkit:tracker issue-update-review start -->
   _Tracker not wired — skip issue update._
   <!-- bkit:tracker issue-update-review end -->
   <!-- bkit:tracker issue-update-status start -->
   _Tracker not wired — skip status/state update._
   <!-- bkit:tracker issue-update-status end -->
4. Re-read issue labels to check kill-switch:
   <!-- bkit:tracker issue-read start -->
   _Tracker not wired — skip._
   <!-- bkit:tracker issue-read end -->
   **If** `bkit:auto` NOT in `{LABELS}`:
   <!-- bkit:tracker kill-switch-check start -->
   _Tracker not wired — kill switch inactive._
   <!-- bkit:tracker kill-switch-check end -->
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 18 — Close Workflow
   [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

### 🔒 Gate 18 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] HEAD on remote does NOT contain `bkit [skip ci]`
- [ ] Workflow status updated (`build` `DONE`, step `build-close-workflow` recorded with `parentSha`)
- [ ] Changes pushed to `feat/{FID}`
- [ ] Workflow status pushed to `dev` with `bkit [skip ci]`
- [ ] Issue update attempted (phase label `bkit:build` preserved, status/state `In Review`)
- [ ] Kill-switch propagation checked (`bkit:auto` label presence verified on issue)
- [ ] Issue comment attempted (`Step 18` section)
