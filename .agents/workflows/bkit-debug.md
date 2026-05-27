---
description: "Debug Feature — Autonomous diagnosis and remediation"
---

# Debug Feature (Workflow 4/6)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Remediate feature failures and push to branch.

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
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `chore({FID}): debug DONE bkit [skip ci]`; Failure Path → `chore({FID}): debug FAILED bkit [skip ci]`.
> - **Subagents:** Invoke using `@name` with `Agent` tool. Orchestrator provides context; subagent executes and writes directly. **PROHIBITED:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Setup `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. **If** step ever finds `pwd` outside worktree → **Failure Path**.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.

<!-- bkit:tracker rule-block start -->

> _Tracker not wired — skip._

<!-- bkit:tracker rule-block end -->

> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
> - **Limits:** Reference constants `MAX_DEBUG_ATTEMPT` = 3 and `MAX_TEST_ATTEMPT` = 3 in retry checks below.
> - **Large Diff Guard:** When a Read line passes `git diff origin/dev..HEAD` to a subagent, compute `DIFF_LINES=$(git diff origin/dev..HEAD | wc -l)`. **If** > 10000 → per-file budget mode (`--stat` → top 20 files by lines changed; `head -500` per file; cap 50 000 total lines; flag "partial diff coverage" in subagent verdict). **Else** → full diff.

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
   git -C "$REPO_ROOT" commit -m "chore({FID}): debug FAILED bkit [skip ci]" 2>/dev/null || true
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
4. **If** failure triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) **or** `OBSERVE_MODE` = analyse **or** rebase failure sentinel previously existed → step 5. **Else** → step 12.
5. **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.json`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-*.md`, `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-handover.md`.
6. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
7. `git status --short` → remove unintended files.
8. `git add -A`.
9. `git commit -m "docs({FID}): debug aborted bkit [skip build] bkit [skip ci]"`.
10. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)` — if push fails, do not claim success on Linear.
11. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below:
    ```comment
    ### Workflow Handover
    [debug-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-handover.md)
    {FID-debug-handover.md content verbatim}
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
   [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — plan must exist before debug" >&2; exit 1; }
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
   printf '%s debug\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** divergence check or lock acquisition exits non-zero → **Failure Path**.
   `FID` hint (interrupted): `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/*/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-1)}'`.
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
3. `git branch --show-current` → extract initial `BRANCH`. Assert non-empty.
4. <!-- bkit:tracker issue-id-extraction start -->
   _Tracker not wired — skip ISSUE_ID resolution._
   <!-- bkit:tracker issue-id-extraction end -->
5. **If** `LABELS`, `DESCRIPTION`, `COMMENTS` already set by AGENTS.md → skip. **Else**:
   <!-- bkit:tracker issue-read start -->
   _Tracker not wired — skip issue read._
   <!-- bkit:tracker issue-read end -->
6. `gh pr list --head $(git branch --show-current) --base dev --json number --jq '.[0].number'` → extract `PR_NUMBER`. **If** `PR_NUMBER` non-empty → `DEBUG_MODE` = pr. **Else** → `DEBUG_MODE` = local.
7. Extract `DEBUG_ATTEMPT` and `PRIOR_OBSERVE_MODE` from most recent `workflow == "debug"` entry:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   DEBUG_ATTEMPT=$(jq -r '[.[] | select(.workflow=="debug")] | last.debugAttempt // 0' "$STATUS" 2>/dev/null || echo 0)
   PRIOR_OBSERVE_MODE=$(jq -r '[.[] | select(.workflow=="debug") | .steps[] | select(.step=="worktree-setup")] | last.observeMode // "off"' "$STATUS" 2>/dev/null || echo off)
   ```
8. Set `OBSERVE_MODE`:
   - **If** `PRIOR_OBSERVE_MODE` = instrument → `OBSERVE_MODE` = analyse.
   - **If** `DEBUG_ATTEMPT` > `MAX_DEBUG_ATTEMPT` → `OBSERVE_MODE` = instrument.
   - **Else** → `OBSERVE_MODE` = off.
9. **If** existing `docs/plans/{YYYYMM}/{FID}-plan.md` → reuse `FID` and `docs/plans/{YYYYMM}/logs/{FID}/`.
10. **If** NO `FID` → create `FID` from `{ISSUE_ID}` + kebab from title, no stopwords, ≤3 tokens, lowercase; one `FID` for all artifacts once set.
    <!-- bkit:tracker fid-format start -->
    _Tracker not wired — skip FID regex assert._
    <!-- bkit:tracker fid-format end -->
11. <!-- bkit:tracker issue-update-debug start -->
    _Tracker not wired — skip._
    <!-- bkit:tracker issue-update-debug end -->
    <!-- bkit:tracker issue-update-status start -->
    _Tracker not wired — skip status/state update._
    <!-- bkit:tracker issue-update-status end -->
12. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below:
    ```comment
    ## Debug Workflow
    ### Step 1 — Start Workflow - Debug: {DEBUG_MODE} - Observe: {OBSERVE_MODE} - Attempt: {DEBUG_ATTEMPT}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `ISSUE_ID`, `FID`)
- [ ] Local `dev` NOT ahead of `origin/dev`
- [ ] Lock acquired (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` exists)
- [ ] `DEBUG_MODE` decided
- [ ] `PR_NUMBER` extracted (`DEBUG_MODE` = pr only)
- [ ] `DEBUG_ATTEMPT` read from status.json (`0` if first run)
- [ ] `PRIOR_OBSERVE_MODE` read from prior worktree-setup step (`off` if none)
- [ ] `OBSERVE_MODE` decided (off | instrument | analyse)
- [ ] Issue update attempted (additive label `bkit:debug`, status/state `In Progress`)
- [ ] Issue comment attempted (`Step 1` section)

---

## 🤖 Step 2 — Worktree Setup

1. Create/resume the worktree:
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
       git worktree add "$WORKTREE_PATH" -b "fix/{FID}" origin/dev
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
2. `git branch --show-current` → update `BRANCH` to worktree branch. Assert non-empty.
3. **If** sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` exists → **Failure Path**.
4. **If** `BRANCH` NOT `dev` **and** does NOT contain `{FID}` **and** does NOT contain `{ISSUE_ID}` (case-insensitive) → **Failure Path**
5. Init counter: `TEST_ATTEMPT` = 0.
6. Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md` = session prompt + Debug: `DEBUG_MODE` + Observe: `OBSERVE_MODE` + `DESCRIPTION` + `COMMENTS` + `docs/plans/{YYYYMM}/{FID}-plan.md`.
7. Update status and commit:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   [ -f "$STATUS" ] || echo '[]' > "$STATUS"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "debug" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq '. + [{workflow:"debug", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --argjson da "$DEBUG_ATTEMPT" \
     '.[-1].steps += [{step:"debug-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {debugAttempt:$da})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg dm "$DEBUG_MODE" --arg om "$OBSERVE_MODE" \
     '.[-1].steps += [{step:"debug-worktree-setup", status:"DONE", at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-input-'"${DEBUG_ATTEMPT}"'.md"], debugMode:$dm, observeMode:$om}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): worktree-setup"
   ```
8. <!-- bkit:tracker comment-post-step start -->
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
- [ ] On branch that passed eligibility
- [ ] Counters initialised (`TEST_ATTEMPT` = 0)
- [ ] Artifact written (`debug-input-{DEBUG_ATTEMPT}.md`, non-empty)
- [ ] Workflow status updated (`debug` `IN_PROGRESS` with `debugAttempt`, steps `debug-start-workflow` and `debug-worktree-setup` recorded with `parentSha`, `debug-worktree-setup` with `debugMode`, `observeMode`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Fetch Context

1. Discover CI run for branch:
   ```bash
   RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId,conclusion 2>/dev/null || echo "[]")
   RUN_ID=$(echo "$RUN_JSON" | jq -r '.[0].databaseId // ""')
   RUN_CONCLUSION=$(echo "$RUN_JSON" | jq -r '.[0].conclusion // ""')
   ```
2. **If** `RUN_ID` non-empty **and** `RUN_CONCLUSION` != `success` → fetch CI logs → **if** output non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md`:
   ```bash
   CI_LOGS=$(gh run view "$RUN_ID" --log-failed 2>/dev/null)
   [ -n "$CI_LOGS" ] && printf '%s' "$CI_LOGS" > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md"
   ```
3. **If** last-passing-CI SHA exists and diff output non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md`:
   ````bash
   LAST_PASS_SHA=$(gh run list --branch dev --workflow ci.yml --status success --limit 5 --json headSha --jq '.[0].headSha // ""' 2>/dev/null)
   if [ -n "$LAST_PASS_SHA" ]; then
     DIFF_STAT=$(git diff "$LAST_PASS_SHA..HEAD" --stat 2>/dev/null)
     if [ -n "$DIFF_STAT" ]; then
       {
         printf '# Diff vs last-passing CI on dev (last-passing-sha: %s)\n\n' "$LAST_PASS_SHA"
         printf '```\n%s\n```\n' "$DIFF_STAT"
       } > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md"
     fi
   fi
   ````
4. Run local test suite → **if** test output non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md`:
   ```bash
   TEST_OUTPUT=$(pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue 2>&1 || true)
   [ -n "$TEST_OUTPUT" ] && printf '%s' "$TEST_OUTPUT" > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md"
   ```
5. **If** `RUN_ID` non-empty **and** `RUN_CONCLUSION` != `success` → detect e2e job failure → **if** failed download outputs, combine every text file under `test-results/` verbatim, and write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md`:
   ```bash
   E2E_FAILED=$(gh run view "$RUN_ID" --json jobs --jq '[.jobs[] | select((.name | test("e2e"; "i")) or (.steps // [] | any(.name | test("e2e|playwright"; "i")))) | select(.conclusion=="failure")] | length' 2>/dev/null || echo 0)
   if [ "${E2E_FAILED:-0}" -gt 0 ]; then
     E2E_DIR="docs/plans/{YYYYMM}/logs/{FID}/debug-e2e-${DEBUG_ATTEMPT}"
     mkdir -p "$E2E_DIR"
     gh run download "$RUN_ID" -n playwright-report -D "$E2E_DIR" 2>/dev/null || true
     if [ -n "$(ls -A "$E2E_DIR" 2>/dev/null)" ]; then
       E2E_LOG="docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md"
       SCAN_ROOT="$E2E_DIR/test-results"; [ -d "$SCAN_ROOT" ] || SCAN_ROOT="$E2E_DIR"
       {
         echo "# Playwright Report (run ${RUN_ID}, attempt ${DEBUG_ATTEMPT})"
         echo
         echo "Scanned: ${SCAN_ROOT#$E2E_DIR/} (text files only; binary artifacts listed below)"
         find "$SCAN_ROOT" -type f \( -name "*.md" -o -name "*.json" -o -name "*.txt" -o -name "*.log" -o -name "*.xml" \) | sort | while read -r f; do
           rel="${f#$E2E_DIR/}"
           printf '\n===== file: %s =====\n' "$rel"
           cat "$f"
           echo
         done
         printf '\n===== binary artifacts (not inlined; full tree under %s/) =====\n' "${E2E_DIR#docs/plans/logs/}"
         find "$E2E_DIR" -type f \( -name "*.html" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webm" -o -name "*.zip" \) | sed "s|^$E2E_DIR/||" | sort
       } > "$E2E_LOG"
       [ -s "$E2E_LOG" ] || rm -f "$E2E_LOG"
     else
       rmdir "$E2E_DIR" 2>/dev/null || true
     fi
   fi
   ```
6. Detect runtime logs fetch example from the **first** `debug-fetch` block **after** `<!-- bkit:end -->`:
   ````bash
   FETCH_EXAMPLE=$(sed -n '/^<!-- bkit:end -->/,$p' docs/observability.md 2>/dev/null | awk '/^<!-- debug-fetch:start -->/,/^<!-- debug-fetch:end -->/' | sed -n '/^```/,/^```/p' | sed '/^```/d')
   ````
7. **If** `FETCH_EXAMPLE` non-empty → use it as starting template → customise per failure context (severity, freshness, limit) → execute via Bash → capture stdout (prefer JSON) → **if** output non-empty write to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-${DEBUG_ATTEMPT}.md`:
   ```bash
   RUNTIME_LOGS=$({customised command} 2>/dev/null)
   [ -n "$RUNTIME_LOGS" ] && printf '%s' "$RUNTIME_LOGS" > "docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-${DEBUG_ATTEMPT}.md"
   ```
8. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   ARTIFACTS=()
   for f in "docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-${DEBUG_ATTEMPT}.md" "docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-${DEBUG_ATTEMPT}.md"; do
     [ -s "$f" ] && ARTIFACTS+=("$f")
   done
   [ ${#ARTIFACTS[@]} -gt 0 ] && FETCH_VERDICT=PASS || FETCH_VERDICT=FAIL
   ARTIFACTS_JSON=$(printf '%s\n' "${ARTIFACTS[@]}" | jq -R . | jq -s 'map(select(. != ""))')
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$FETCH_VERDICT" --argjson a "$DEBUG_ATTEMPT" --argjson arts "$ARTIFACTS_JSON" \
     '.[-1].steps += [{step:"debug-fetch-context", status:"DONE", verdict:$v, at:$t, parentSha:$p, attempt:$a, artifacts:$arts}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): fetch-context attempt ${DEBUG_ATTEMPT}"
   ```
9. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below — ONLY add artifact links if present:
   ```comment
   ### Step 3 — Fetch Context - Verdict: {FETCH_VERDICT}
   [debug-context-ci-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-ci-{DEBUG_ATTEMPT}.md)
   [debug-context-diff-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-diff-{DEBUG_ATTEMPT}.md)
   [debug-context-tests-local-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-local-{DEBUG_ATTEMPT}.md)
   [debug-context-tests-e2e-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-tests-e2e-{DEBUG_ATTEMPT}.md)
   [debug-context-runtime-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-{DEBUG_ATTEMPT}.md)
   ```

### 🔒 Gate 3 — Fetch Context

- [ ] `RUN_ID` discovery attempted
- [ ] CI logs fetch attempted
- [ ] Diff vs last-passing CI on `dev` attempted
- [ ] Local test suite run attempted
- [ ] Playwright artifact download attempted (if e2e job failed)
- [ ] Runtime logs example fetch detection attempted
- [ ] Customised runtime logs fetch attempted (if example present)
- [ ] Artifacts written (if output available, `debug-context-ci-{DEBUG_ATTEMPT}.md`, `debug-context-diff-{DEBUG_ATTEMPT}.md`, `debug-context-tests-local-{DEBUG_ATTEMPT}.md`, `debug-context-tests-e2e-{DEBUG_ATTEMPT}.md`, `debug-context-runtime-{DEBUG_ATTEMPT}.md`)
- [ ] `FETCH_VERDICT` derived
- [ ] Workflow status updated (step `debug-fetch-context` recorded with `parentSha`, `verdict`, `artifacts`)
- [ ] Issue comment attempted (`Step 3` section, links only for written artifacts)

---

## 🧠 Step 4 — Failure Diagnose

**Run only if** `OBSERVE_MODE` = off.

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
   Context: You are a subagent in the Debug phase. Debug: `{DEBUG_MODE}`. Strategy: `{STRATEGY}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/logs/{FID}/status.json`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-input-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-context-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-*-log.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-{TEST_ATTEMPT}.md`.
4. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
5. Read `debug-failure-diagnose-{TEST_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `DIAGNOSE_VERDICT`.
6. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$DIAGNOSE_VERDICT" --argjson a "$TEST_ATTEMPT" --arg strat "$STRATEGY" \
     '.[-1].steps += [{step:"debug-failure-diagnose", status:"DONE", verdict:$v, attempt:$a, strategy:$strat, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-'"${TEST_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): failure-diagnose attempt ${TEST_ATTEMPT}"
   ```
7. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Failure Diagnose - Verdict: {DIAGNOSE_VERDICT} - Strategy: {STRATEGY} - Attempt: {TEST_ATTEMPT}
   ```

### 🔒 Gate 4 — Failure Diagnose

- [ ] `STRATEGY` computed before invocation
- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
- [ ] Artifact written (`debug-failure-diagnose-{TEST_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted (`DIAGNOSE_VERDICT`)
- [ ] Verdict valid (`DIAGNOSE_VERDICT` in `PASS|FAIL`)
- [ ] No PENDING placeholders remain (`debug-failure-diagnose-{TEST_ATTEMPT}.md`)
- [ ] Workflow status updated (step `debug-failure-diagnose` recorded with `parentSha`, `verdict`, `strategy`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🧠 Step 5 — Failure Remediate

**Run only if** `OBSERVE_MODE` = off.

1. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Debug: `{DEBUG_MODE}`. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read:`docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-{TEST_ATTEMPT}.md`.
   Update: Source files.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-{TEST_ATTEMPT}-log.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `debug-failure-remediate-{TEST_ATTEMPT}-log.md` until `<!-- verdict:end -->` → extract `Verdict` as `REMEDIATE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$REMEDIATE_VERDICT" --argjson a "$TEST_ATTEMPT" \
     '.[-1].steps += [{step:"debug-failure-remediate", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-'"${TEST_ATTEMPT}"'-log.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   FIX_DESC=$(grep -m1 '^DONE — Step' "docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-${TEST_ATTEMPT}-log.md" 2>/dev/null \
     | sed -E 's/^DONE — Step [0-9]+: //; s/ — .*$//' \
     | tr -d '\r\n`"\\' \
     | sed -E 's/[[:space:]]+$//' \
     | cut -c1-72)
   [ -z "$FIX_DESC" ] && FIX_DESC="failure-remediate attempt ${TEST_ATTEMPT}"
   VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "fix({FID}): ${FIX_DESC}${VERBOSE_SUFFIX}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 5 — Failure Remediate - Verdict: {REMEDIATE_VERDICT} - Attempt: {TEST_ATTEMPT}
   ```

### 🔒 Gate 5 — Failure Remediate

- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
- [ ] Artifact written (`debug-failure-remediate-{TEST_ATTEMPT}-log.md`, non-empty)
- [ ] Source files modified
- [ ] `REMEDIATE_VERDICT` extracted
- [ ] Workflow status updated (step `debug-failure-remediate` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🤖 Step 6 — Run Tests

**Run only if** `OBSERVE_MODE` = off.

1. Increment `TEST_ATTEMPT` + 1.
2. Run verbatim:
   ```bash
   if [ -f turbo.json ]; then
     pnpm turbo lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue
   else
     set -e
     for s in typecheck test format:check lint:slop lint:prose test:integration test:e2e; do
       if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1; then pnpm "$s"; fi
     done
   fi
   ```
3. Set `TEST_VERDICT` and `TEST_FAILURES` from exit code: **If** all tests passed `TEST_VERDICT` = PASS and `TEST_FAILURES` = 0. **Else** `TEST_VERDICT` = FAIL and `TEST_FAILURES` = count of failing test suites (≥1).
4. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$TEST_VERDICT" --argjson a "$TEST_ATTEMPT" --argjson f "$TEST_FAILURES" \
     '.[-1].steps += [{step:"debug-run-tests", status:"DONE", verdict:$v, attempt:$a, failures:$f, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 6 — Run Tests - Verdict: {TEST_VERDICT} - Failures: {TEST_FAILURES} - Attempt: {TEST_ATTEMPT}
   ```
6. **If** all tests PASS → Step 7.
7. **If** some tests FAIL:
   - **If** `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT` → Step 4.
   - **Else** → **Failure Path**.
8. **Else** → **Failure Path**.

### 🔒 Gate 6 — Run Tests

- [ ] `TEST_ATTEMPT` incremented
- [ ] Tests executed (PR debug or full suite)
- [ ] Verdicts extracted (`TEST_VERDICT`, `TEST_FAILURES`)
- [ ] Workflow status updated (step `debug-run-tests` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 6` section)
- [ ] Loop branch decided (FAIL and `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT` → Step 4)

---

## 🤖 Step 7 — Push Remediation

**Run only if** `OBSERVE_MODE` = off **and** all Step 5 tests PASS.

1. Increment `DEBUG_ATTEMPT` + 1.
2. Update status (file-only — no commit between Step 5 and the push):
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --argjson da "$DEBUG_ATTEMPT" \
     '.[-1].steps += [{step:"debug-push-remediation", status:"DONE", attempt:$da, at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {debugAttempt:$da})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
3. **If** `DEBUG_MODE` = pr **and** `[verbose ci]` NOT in pr title → append `bkit [verbose ci]` to PR title:
   ```bash
   if [ "$DEBUG_MODE" = "pr" ] && [ -n "$PR_NUMBER" ]; then
     CURRENT_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title 2>/dev/null || echo "")
     case "$CURRENT_TITLE" in
       *"[verbose ci]"*) ;;
       *) [ -n "$CURRENT_TITLE" ] && gh pr edit "$PR_NUMBER" --title "${CURRENT_TITLE} bkit [verbose ci]" || true ;;
     esac
   fi
   ```
4. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)`.
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 7 — Push Remediation - Attempt: {DEBUG_ATTEMPT}
   ```

### 🔒 Gate 7 — Push Remediation

- [ ] `DEBUG_ATTEMPT` incremented
- [ ] Step 5 `fix({FID}): {description}` commit pushed as branch HEAD (no intermediate `chore` commit between fix and push)
- [ ] `debugAttempt` persisted to status.json (no PR-body marker write)
- [ ] PR title contains `[verbose ci]` (if `DEBUG_MODE` = pr)
- [ ] Workflow status updated (step `debug-push-remediation` recorded with `parentSha`)
- [ ] Issue comment attempted (`Step 7` section)

---

## 🧠 Step 8 — Summary

**Run only if** `OBSERVE_MODE` = off **and** all Step 5 tests PASS.

1. **Subagent:** Invoke `@bkit-debug-summary` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/status.json`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-*.md`, `git log --oneline origin/dev..HEAD` (commit subjects only), `git diff origin/dev..HEAD` (apply **Large Diff Guard**).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `debug-summary.md` until `<!-- verdict:end -->` → extract `Verdict` as `SUMMARY_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$SUMMARY_VERDICT" \
     '.[-1].steps += [{step:"debug-summary", status:"DONE", verdict:$v, attempt:1, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "chore({FID}): summary${VERBOSE_SUFFIX}"
   ```
5. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)`.
6. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 8 — Summary - Verdict: {SUMMARY_VERDICT}
   [debug-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md)
   {FID-debug-summary.md content verbatim}
   ```
7. Read `Recommended Next Step` section from `docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md` → extract `{NEXT_STEP}` without heading. **If** missing → set `{NEXT_STEP}` = `No next-step recommendation`.
   <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Recommended Next Step
   {NEXT_STEP}
   ```
8. Final return: Present `{NEXT_STEP}` verbatim in final message to user — do NOT auto-invoke.
9. **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 12.
10. **If** `SUMMARY_VERDICT` = FAIL → **Failure Path**.
11. **Else** → **Failure Path**.

### 🔒 Gate 8 — Summary

- [ ] Subagent invoked (`@bkit-debug-summary`, no inline work)
- [ ] Artifact written (`debug-summary.md`, non-empty)
- [ ] Verdict extracted (`SUMMARY_VERDICT`)
- [ ] Verdict valid (`SUMMARY_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] Summary commit pushed to branch
- [ ] Workflow status updated (step `debug-summary` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 8` section)
- [ ] Next-step handoff comment attempted (dedicated `Recommended Next Step` comment)
- [ ] `{NEXT_STEP}` surfaced verbatim in the final return to the user (advisory, not auto-invoked)

---

## 🧠 Step 9 — Observe Instrument

**Run only if** `OBSERVE_MODE` = instrument.

1. **Subagent:** Invoke `@bkit-debug-observe-instrument` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Observe Instrument mode — `DEBUG_ATTEMPT` exhausted at `{DEBUG_ATTEMPT}/${`MAX_DEBUG_ATTEMPT`}`; this is the single observation pass before terminal handover. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-*-log.md`.
   Update: Source files (instrumentation only).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-observe-instrument-{DEBUG_ATTEMPT}.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Derive `OBSERVE_INSTRUMENT_VERDICT`:
   ```bash
   if [ -f turbo.json ]; then
     pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue
   else
     set -e
     for s in typecheck test; do
       if jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1; then pnpm "$s"; fi
     done
   fi
   ```
   **If** pass → `OBSERVE_INSTRUMENT_VERDICT` = PASS. **Else** `OBSERVE_INSTRUMENT_VERDICT` = FAIL → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$OBSERVE_INSTRUMENT_VERDICT" --argjson a "$DEBUG_ATTEMPT" \
     '.[-1].steps += [{step:"debug-observe-instrument", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-observe-instrument-'"${DEBUG_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   git add -A && git commit --allow-empty -m "chore({FID}): observe-instrument attempt ${DEBUG_ATTEMPT}${VERBOSE_SUFFIX}"
   ```
5. **If** `DEBUG_MODE` = pr **and** `[verbose ci]` NOT in pr title → append `bkit [verbose ci]` to PR title:
   ```bash
   if [ "$DEBUG_MODE" = "pr" ] && [ -n "$PR_NUMBER" ]; then
     CURRENT_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title 2>/dev/null || echo "")
     case "$CURRENT_TITLE" in
       *"[verbose ci]"*) ;;
       *) [ -n "$CURRENT_TITLE" ] && gh pr edit "$PR_NUMBER" --title "${CURRENT_TITLE} bkit [verbose ci]" || true ;;
     esac
   fi
   ```
6. Assert `{BRANCH}` non-empty. `git push origin $(git branch --show-current)`.
7. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 9 — Observe Instrument - Verdict: {OBSERVE_INSTRUMENT_VERDICT}
   [observe-instrument-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-observe-instrument-{DEBUG_ATTEMPT}.md)
   ```
8. Close workflow → Step 12.

### 🔒 Gate 9 — Observe Instrument

- [ ] Subagent invoked (`@bkit-debug-observe-instrument`, no inline work)
- [ ] Artifact written (`debug-observe-instrument-{DEBUG_ATTEMPT}.md`, non-empty)
- [ ] Source files modified with `[DEBUG-OBSERVE]` lines
- [ ] `DEBUG_ATTEMPT` NOT incremented
- [ ] Verdict extracted (`OBSERVE_INSTRUMENT_VERDICT`)
- [ ] Verdict valid (`OBSERVE_INSTRUMENT_VERDICT` in `PASS|FAIL`)
- [ ] Commit pushed to branch (no `bkit [skip ci]`)
- [ ] PR title contains `[verbose ci]` (if `DEBUG_MODE` = pr)
- [ ] Workflow status updated (step `debug-observe-instrument` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 9` section)

---

## 🧠 Step 10 — Observe Analyse

**Run only if** `OBSERVE_MODE` = analyse.

1. **Subagent:** Invoke `@bkit-debug-observe-analyse` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Observe Analyse mode — read CI logs from prior instrumented run, summarise evidence into per-step disk summary. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-context-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/debug-observe-instrument-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-observe-analyse-{DEBUG_ATTEMPT}.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Read `debug-observe-analyse-{DEBUG_ATTEMPT}.md` until `<!-- verdict:end -->` → extract `Verdict` as `OBSERVE_ANALYSE_VERDICT`.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$OBSERVE_ANALYSE_VERDICT" --argjson a "$DEBUG_ATTEMPT" \
     '.[-1].steps += [{step:"debug-observe-analyse", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-observe-analyse-'"${DEBUG_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): observe-analyse attempt ${DEBUG_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 10 — Observe Analyse - Verdict: {OBSERVE_ANALYSE_VERDICT}
   [observe-analyse-{DEBUG_ATTEMPT}.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/debug-observe-analyse-{DEBUG_ATTEMPT}.md)
   ```

### 🔒 Gate 10 — Observe Analyse

- [ ] Subagent invoked (`@bkit-debug-observe-analyse`, no inline work)
- [ ] Artifact written (`debug-observe-analyse-{DEBUG_ATTEMPT}.md`, non-empty)
- [ ] Verdict extracted (`OBSERVE_ANALYSE_VERDICT`)
- [ ] Verdict valid (`OBSERVE_ANALYSE_VERDICT` in `PASS|CONCERNS|FAIL`)
- [ ] No PENDING placeholders remain (`debug-observe-analyse-{DEBUG_ATTEMPT}.md`)
- [ ] Workflow status updated (step `debug-observe-analyse` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 10` section)

---

## 🧠 Step 11 — Observe Revert

**Run only if** `OBSERVE_MODE` = analyse.

1. **Subagent:** Invoke `@bkit-debug-observe-revert` using `Agent` tool:
   Context: You are a subagent in the Debug phase. Observe Revert mode — strip every `[DEBUG-OBSERVE]` line; lint/typecheck/test gate must pass. Switch into working directory `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/debug-observe-instrument-*.md`.
   Update: Source files (revert only).
   Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-observe-revert-{DEBUG_ATTEMPT}.md`.
2. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
3. Derive `OBSERVE_REVERT_VERDICT` verdict:
   ```bash
   GREP_HITS=$(git grep -c '\[DEBUG-OBSERVE\]' | awk -F: '{s+=$NF} END {print s+0}')
   if [ -f turbo.json ]; then
     pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue && TEST_OK=1 || TEST_OK=0
   else
     ( set -e; for s in typecheck test; do jq -e ".scripts[\"$s\"]" package.json >/dev/null 2>&1 && pnpm "$s"; done ) && TEST_OK=1 || TEST_OK=0
   fi
   [ "$GREP_HITS" = "0" ] && [ "$TEST_OK" = "1" ] && OBSERVE_REVERT_VERDICT=PASS || OBSERVE_REVERT_VERDICT=FAIL
   ```
   **If** `OBSERVE_REVERT_VERDICT` = FAIL → **Failure Path**.
4. Update status and commit:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$OBSERVE_REVERT_VERDICT" --argjson a "$DEBUG_ATTEMPT" \
     '.[-1].steps += [{step:"debug-observe-revert", status:"DONE", verdict:$v, attempt:$a, at:$t, parentSha:$p, artifacts:["docs/plans/{YYYYMM}/logs/{FID}/debug-observe-revert-'"${DEBUG_ATTEMPT}"'.md"]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   git add -A && git commit --allow-empty -m "chore({FID}): observe-revert attempt ${DEBUG_ATTEMPT}"
   ```
5. <!-- bkit:tracker comment-post-step start -->
   _Tracker not wired — skip comment post._
   <!-- bkit:tracker comment-post-step end -->
   `{BODY}` = fenced block below:
   ```comment
   ### Step 11 — Observe Revert - Verdict: {OBSERVE_REVERT_VERDICT}
   ```
6. → **Failure Path**. Failure Path's `debug-abort-handover` writes the canonical `{FID}-handover.md`, commits with `bkit [skip ci]`, posts handover content to Linear, and terminates the workflow.

### 🔒 Gate 11 — Observe Revert

- [ ] Subagent invoked (`@bkit-debug-observe-revert`, no inline work)
- [ ] Artifact written (`debug-observe-revert-{DEBUG_ATTEMPT}.md`, non-empty)
- [ ] Markers cleared (`git grep 'DEBUG-OBSERVE'` → no matches)
- [ ] `OBSERVE_REVERT_VERDICT` extracted
- [ ] Workflow status updated (step `debug-observe-revert` recorded with `parentSha`, `verdict`)
- [ ] Issue comment attempted (`Step 11` section)
- [ ] Routed to **Failure Path**

---

## 🤖 Step 12 — Close Workflow

**Run only if** `OBSERVE_MODE` = off **or** `OBSERVE_MODE` = instrument. **Skip if** `OBSERVE_MODE` = analyse.

1. Sweep `.agents/friction.md` for current workflow entries → ensure each has valid `Recovery` and `Status`.
2. **If** `DEBUG_MODE` = pr **and** `OBSERVE_MODE` = off **and** `[verbose ci]` in PR title → strip the marker (with optional `bkit ` attribution prefix) from PR title:
   ```bash
   if [ "$DEBUG_MODE" = "pr" ] && [ -n "$PR_NUMBER" ] && [ "$OBSERVE_MODE" = "off" ]; then
     CURRENT_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq .title 2>/dev/null || echo "")
     NEW_TITLE=$(printf '%s' "$CURRENT_TITLE" | sed -E 's/ ?(bkit )?\[verbose ci\]//')
     [ -n "$CURRENT_TITLE" ] && [ "$NEW_TITLE" != "$CURRENT_TITLE" ] && gh pr edit "$PR_NUMBER" --title "$NEW_TITLE" || true
   fi
   ```
3. Re-read issue labels to determine `bkit [auto route]` marker (**before** the close-workflow commit — authoritative "at close time" signal for PR-mode; also before the create-pr commit for local-mode):
   <!-- bkit:tracker issue-read start -->
   _Tracker not wired — skip._
   <!-- bkit:tracker issue-read end -->
   ```bash
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   ```
4. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"debug-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]
      | .[-1] |= (. + {status:"DONE"})' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
   # PR-mode: close-workflow commit IS the loud HEAD at CI time — carry the auto-route marker here.
   # local-mode: the create-pr commit (step 9 below) is the CI-triggering HEAD — marker goes there instead.
   PR_MODE_AUTO_SUFFIX=""; [ "$DEBUG_MODE" = "pr" ] && PR_MODE_AUTO_SUFFIX="$AUTO_ROUTE_SUFFIX"
   git add -A && git commit --allow-empty -m "chore({FID}): close-workflow${VERBOSE_SUFFIX}${PR_MODE_AUTO_SUFFIX}"
   LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
   rm -f "$LOCK"
   [ ! -f "$LOCK" ] || { echo "Lock removal failed: $LOCK" >&2; exit 1; }
   git push origin "$(git branch --show-current)"
   ```
5. Capture branch state:
   ```bash
   CURRENT=$(git branch --show-current)
   PR_URL=""
   PR_NUMBER=""
   EXISTING_PR=""
   if [ "$CURRENT" != "dev" ] && [ "$CURRENT" != "main" ]; then
     EXISTING_PR=$(gh pr list --head "$CURRENT" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
   fi
   ```
6. Set `TRIGGER_PR`:
   - **If** `CURRENT` = `dev` **or** `main` → push to trigger branch (CI fires) → `TRIGGER_PR` = 0.
   - **If** `EXISTING_PR` non-empty (`DEBUG_MODE` = pr) → push fires `pull_request` event → `TRIGGER_PR` = 0.
   - **Else** (`DEBUG_MODE` = local, feature branch, no PR) → `TRIGGER_PR` = 1.
7. **If** `TRIGGER_PR` = 1 → create PR:
   ```bash
   gh pr create --base dev --title "feat({FID}): debug-remediated" --body "$(cat <<'EOF'
   <!-- bkit:start -->
   https://github.com/{OWNER_REPO}/blob/main/docs/plans/{YYYYMM}/{FID}-plan.md
   <!-- bkit:end -->
   EOF
   )"
   ```
8. **If** `TRIGGER_PR` = 1 **and** `gh pr create` fails → retry once. **If** still fails → **Failure Path**.
9. **If** `TRIGGER_PR` = 1 → extract `PR_URL` and `PR_NUMBER` from created PR; assert both non-empty.
10. **If** `TRIGGER_PR` = 1 → update status, commit, and push:
    ```bash
    PARENT_SHA=$(git rev-parse HEAD)
    t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg u "$PR_URL" \
      '.[-1].steps += [{step:"debug-create-pr", status:"DONE", at:$t, parentSha:$p, artifacts:[$u]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"
    # local-mode: create-pr commit IS the CI-triggering HEAD — carry the auto-route marker.
    # AUTO_ROUTE_SUFFIX was read in step 3 above (before the close-workflow commit).
    LOCAL_MODE_AUTO_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && LOCAL_MODE_AUTO_SUFFIX="$AUTO_ROUTE_SUFFIX"
    git add -A && git commit --allow-empty -m "chore({FID}): create-pr${VERBOSE_SUFFIX}${LOCAL_MODE_AUTO_SUFFIX}"
    git push origin "$(git branch --show-current)"
    ```
11. Update status, commit, and push:

```bash
git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
git -C "$REPO_ROOT" commit -m "chore({FID}): debug DONE bkit [skip ci]"
git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
```

11. **If** `OBSERVE_MODE` = off:
    <!-- bkit:tracker issue-update-review start -->
    _Tracker not wired — skip._
    <!-- bkit:tracker issue-update-review end -->
    <!-- bkit:tracker issue-update-status start -->
    _Tracker not wired — skip status/state update._
    <!-- bkit:tracker issue-update-status end -->
12. **If** `PR_NUMBER` is set (PR-mode only): re-read issue labels to check kill-switch:
    <!-- bkit:tracker issue-read start -->
    _Tracker not wired — skip._
    <!-- bkit:tracker issue-read end -->
    **If** `bkit:auto` NOT in `{LABELS}`:
    <!-- bkit:tracker kill-switch-check start -->
    _Tracker not wired — kill switch inactive._
    <!-- bkit:tracker kill-switch-check end -->
13. <!-- bkit:tracker comment-post-step start -->
    _Tracker not wired — skip comment post._
    <!-- bkit:tracker comment-post-step end -->
    `{BODY}` = fenced block below — ONLY add PR link if `TRIGGER_PR` = 1:
    ```comment
    ### Step 12 — Close Workflow
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/run/{RUN_ID})
    ```

### 🔒 Gate 12 — Close Workflow

- [ ] All "Update:" and "Create:" artifacts from steps above exist on disk
- [ ] Friction entries swept (`Recovery`, `Status` added/updated)
- [ ] PR title `[verbose ci]` stripped (if `DEBUG_MODE` = pr and `OBSERVE_MODE` = off)
- [ ] `bkit:auto` presence re-read BEFORE close-workflow commit (pre-commit label read for marker sourcing)
- [ ] HEAD-Subject Assertion passed (HEAD clause invoked for the CI-triggering commit per mode: PR-mode → close-workflow commit; local-mode → create-pr commit; asserts no CI-suppressor; `bkit [auto route]` + `bkit [verbose ci]` are legitimate and pass)
- [ ] HEAD on remote does NOT contain `bkit [skip ci]`; `bkit [auto route]` present on the CI-triggering commit iff issue carried `bkit:auto` at close time
- [ ] `TRIGGER_PR` determined
- [ ] If PR created (`PR_URL`, `PR_NUMBER` non-empty)
- [ ] If PR created workflow status updated (step `debug-create-pr` recorded with `parentSha`)
- [ ] If PR created, changes pushed to `feat/{FID}`
- [ ] Workflow status updated (`debug` `DONE`, step `debug-close-workflow` recorded with `parentSha`)
- [ ] Workflow status pushed to `dev` with `bkit [skip ci]`
- [ ] If `OBSERVE_MODE` = off issue update attempted (phase label `bkit:debug` preserved, status/state `In Review`)
- [ ] Kill-switch propagation checked if `PR_NUMBER` set (`bkit:auto` label presence verified on issue)
- [ ] Issue comment attempted (`Step 12` section)
