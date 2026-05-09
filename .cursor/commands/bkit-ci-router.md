# CI Router (Leaf Orchestrator)

**Role:** Leaf orchestrator running inside a GHA runner (dispatched by `bkit-ci-router.yml` via `claude-code-action@v1`).
**Scope:** Read `status.json`, run label gate + stale-run guard, dispatch `/bkit-ship {FID}` or `/bkit-debug {FID}`.

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
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{ISSUE_ID}`, `{BRANCH}`, `{COMMENT_ID}`, `{COMMENT_BODY}`, `{OWNER_REPO}`, `{PR_NUMBER}`, `{CONCLUSION}` non-empty before tool calls → else **Failure Path** with `Empty placeholder: {name}`.
> - **Resume:** On start, read status.json — pick up after last `DONE` step in active `IN_PROGRESS` workflow.
> - **Status:** `docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`.
> - **Locks:** Acquire `docs/plans/logs/{FID}/.router-lock` in first step; release in last step and Failure Path. Existing lock <2h old → **Failure Path** with `{FID} router already running`. Older lock → consider stale, remove and re-acquire. `.router-lock` is namespaced apart from `.lock` used by build/debug/ship.
> - **Tools:** Verify every return, do NOT assume success.
> - **Worktree:** Runner IS the worktree — no `.worktrees/{FID}` creation. `cd` into checkout root at start; verify `docs/plans/logs/{FID}/` accessible. If `docs/plans/logs/{FID}/status.json` missing → **Failure Path** with `status.json missing or malformed`.
> - **Git:** NEVER commit/push from the router. Router is read-only on disk except for `status.json` append and `.router-lock`.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`, `list_issues`. Any `save_*` writes are best-effort; NEVER gate. On failure → retry once after 5s → continue and apply edit with next scheduled write.
> - **Labels:** Phase labels (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Review`, `Failed`, `Merged`, `Router`) are mutually exclusive — drop old before adding new. Router does NOT add `Router` label; existing build/debug/ship label flip absorbs phase tracking.
> - **Comments:** ONE Linear comment per workflow run; Step 1 creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** Any step > 3600 seconds → **Failure Path** with `Step {N} timeout`.
> - **No MAX_DEBUG_ATTEMPT pre-check:** Router dispatches `/bkit-debug` unconditionally; the debug orchestrator's existing ceiling enforces handover. Router MUST NOT pre-empt by reading `MAX_DEBUG_ATTEMPT`.
> - **ANTHROPIC_API_KEY:** If the `claude-code-action@v1` step fails due to missing secret, the GHA step itself surfaces the error; this orchestrator documents the failure via the Failure Path and exits. Router cannot detect the missing secret pre-emptively.

---

## 🤖 Failure Path

1. Update status:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] && { t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"; }
   rm -f "docs/plans/logs/{FID}/.router-lock"
   ```
2. **If** `{COMMENT_ID}` non-empty → `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
   **Else** → `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` if `ISSUE_ID` non-empty.
3. **STOP**, no further downstream steps. (Router has no retry loop and no handover agent.)

---

## 🤖 Step 1 — Start Workflow

1. Read environment variables from runner context:
   ```bash
   BRANCH="${CI_RUN_HEAD_BRANCH:-}"
   CONCLUSION="${CI_RUN_CONCLUSION:-}"
   HEAD_SHA="${CI_RUN_HEAD_SHA:-}"
   CI_RUN_URL="${CI_RUN_URL:-}"
   ```
   Assert `BRANCH` matches `feat/**` pattern:
   ```bash
   [[ "$BRANCH" =~ ^feat/ ]] || { echo "Branch $BRANCH is not feat/**; no-op exit." >&2; exit 0; }
   ```
2. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
3. Derive `{FID}` from branch name by stripping the `feat/` prefix:
   ```bash
   FID=$(echo "$BRANCH" | sed 's|^feat/||')
   ```
   **If** `FID` empty or equals `BRANCH` (i.e. prefix was not stripped) → **Failure Path** with `Cannot derive FID from branch name: {BRANCH}`.
4. Read `status.json`:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   [ -f "$STATUS" ] || { echo "status.json missing"; exit 1; }
   jq . "$STATUS" > /dev/null 2>&1 || { echo "status.json malformed"; exit 1; }
   ISSUE_ID=$(jq -r '.[-1].issueId // ""' "$STATUS")
   COMMENT_ID=$(jq -r '.[-1].commentId // ""' "$STATUS")
   ```
   **If** `ISSUE_ID` empty → **Failure Path** with `missing issueId in status.json — Path A schema not written by upstream orchestrator`.
   **If** `COMMENT_ID` empty → **Failure Path** with `missing commentId in status.json — Path A schema not written by upstream orchestrator`.
5. Acquire router concurrency lock:
   ```bash
   LOCK="docs/plans/logs/{FID}/.router-lock"
   if [ -f "$LOCK" ]; then
     LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || stat -c %Y "$LOCK") ))
     [ $LOCK_AGE -lt 7200 ] && { echo "Router lock held for {FID} (age ${LOCK_AGE}s): $(cat $LOCK). Stale? rm $LOCK" >&2; exit 1; }
     rm -f "$LOCK"
   fi
   printf '%s ci-router\n' "$(date -u +%FT%TZ)" > "$LOCK"
   ```
   **If** lock acquisition exits non-zero → **Failure Path** with `{FID} router already running`.
6. Initialise `status.json` router entry:
   ```bash
   STATUS="docs/plans/logs/{FID}/status.json"
   if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "ci-router" ] \
      || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
     t=$(mktemp); jq --arg iid "$ISSUE_ID" --arg cid "$COMMENT_ID" \
       '. + [{workflow:"ci-router", startedAt:(now|todate), status:"IN_PROGRESS", issueId:$iid, commentId:$cid, steps:[]}]' \
       "$STATUS" > "$t" && mv "$t" "$STATUS"
   fi
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"start-workflow", status:"DONE", at:$t, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
7. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 1 — Start Workflow
Branch: {BRANCH}
Conclusion: {CONCLUSION}
Head SHA: {HEAD_SHA}
CI run: {CI_RUN_URL}
```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`OWNER_REPO`, `BRANCH`, `CONCLUSION`, `HEAD_SHA`, `FID`, `ISSUE_ID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] `BRANCH` matches `feat/**` (else no-op exit before gate)
- [ ] `status.json` parsed and `issueId` / `commentId` extracted
- [ ] Router lock acquired (`docs/plans/logs/{FID}/.router-lock`)
- [ ] Workflow status updated (`ci-router` `IN_PROGRESS`, step `start-workflow` recorded)
- [ ] Issue comment attempted (`Step 1` section)

---

## 🤖 Step 2 — Worktree Setup

> **Runner provides the worktree.** This orchestrator runs inside a GHA runner that already checked out the repo at `HEAD_SHA`. No `.worktrees/{FID}` directory is created — this is an explicit exception to the standard Worktree Setup step. The runner's checkout root is the working directory for all subsequent steps.

1. Verify checkout root is accessible:
   ```bash
   [ -d "docs/plans/logs/{FID}" ] || { echo "docs/plans/logs/{FID} not accessible in runner checkout"; exit 1; }
   ```
2. Capture `PR_NUMBER`:
   ```bash
   PR_NUMBER=$(gh pr list --head "$BRANCH" --base dev --json number --jq '.[0].number // ""')
   ```
   **If** `PR_NUMBER` empty → no open PR (ship may have already merged, or build never raised PR) → log "no open PR on branch {BRANCH}" and exit no-op.
3. Record step:
   ```bash
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"worktree-setup", status:"DONE", at:$t, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 2 — Worktree Setup
PR: #{PR_NUMBER}
Runner checkout: verified
```

### 🔒 Gate 2 — Worktree Setup

- [ ] `docs/plans/logs/{FID}/` accessible in runner checkout
- [ ] `PR_NUMBER` resolved (non-empty; else no-op exit logged)
- [ ] Workflow status updated (step `worktree-setup` recorded)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Label Gate

1. `get_issue({ id: "{ISSUE_ID}" })` → extract `labels` list. Assert `Auto` present:
   ```bash
   # (via MCP get_issue call — not shell)
   ```
   **If** `Auto` NOT in labels → append no-op comment and exit:
   ```comment
   ### bkit-ci-router → no-op (label `Auto` absent)
   Issue {ISSUE_ID} does not carry the `Auto` label. Router exits without dispatch.
   ```
   **Then** remove `.router-lock` and exit 0 (no-op; not a failure).
2. Extract `LABELS` for later use (drop `Auto` from phase set if present; `Auto` is additive non-phase).
3. Record step:
   ```bash
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"label-gate", status:"DONE", at:$t, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 3 — Label Gate
Label `Auto`: present ✓
```

### 🔒 Gate 3 — Label Gate

- [ ] `get_issue` called with `ISSUE_ID`
- [ ] Label `Auto` confirmed present (else no-op exit with comment, not Failure Path)
- [ ] Workflow status updated (step `label-gate` recorded)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🤖 Step 4 — Stale-Run Guard

1. Fetch most-recent CI run on branch and compare head SHAs:
   ```bash
   LATEST_SHA=$(gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha // ""')
   PR_HEAD_SHA=$(gh pr view "$PR_NUMBER" --json headRefOid --jq .headRefOid)
   ```
   **If** `LATEST_SHA` != `PR_HEAD_SHA` → stale run detected:
   ```comment
   ### bkit-ci-router → no-op (stale run)
   CI run head SHA {HEAD_SHA} ≠ PR head SHA {PR_HEAD_SHA}. A newer commit exists on {BRANCH}. Router exits without dispatch.
   ```
   **Then** remove `.router-lock` and exit 0 (no-op; not a failure).
   **If** `LATEST_SHA` empty or `PR_HEAD_SHA` empty → **Failure Path** with `Cannot verify head SHA parity`.
2. Record step:
   ```bash
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" \
     '.[-1].steps += [{step:"stale-run-guard", status:"DONE", at:$t, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 4 — Stale-Run Guard
PR head SHA: {PR_HEAD_SHA}
CI run head SHA: {LATEST_SHA}
Guard: passed ✓
```

### 🔒 Gate 4 — Stale-Run Guard

- [ ] `LATEST_SHA` and `PR_HEAD_SHA` both non-empty
- [ ] `LATEST_SHA` == `PR_HEAD_SHA` (else no-op exit with comment, not Failure Path)
- [ ] Workflow status updated (step `stale-run-guard` recorded)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🤖 Step 5 — Resolve PR & Conclusion

1. Set `CONCLUSION` from runner env (already captured in Step 1). Assert `CONCLUSION` ∈ `success | failure`:
   ```bash
   [[ "$CONCLUSION" == "success" || "$CONCLUSION" == "failure" ]] \
     || { echo "Unexpected conclusion: $CONCLUSION — exiting no-op"; exit 0; }
   ```
   `cancelled` → exit no-op (GHA filter already guards; belt-and-braces).
2. Decide dispatch target:
   ```bash
   if [ "$CONCLUSION" = "success" ]; then
     DISPATCH_SKILL="bkit-ship"
     DISPATCH_PROMPT="/bkit-ship {FID}"
   else
     DISPATCH_SKILL="bkit-debug"
     DISPATCH_PROMPT="/bkit-debug {FID}"
   fi
   ```
3. Record step:
   ```bash
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" --arg c "$CONCLUSION" --arg s "$DISPATCH_SKILL" \
     '.[-1].steps += [{step:"resolve-conclusion", status:"DONE", at:$t, conclusion:$c, dispatchSkill:$s, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 5 — Resolve PR & Conclusion
Conclusion: {CONCLUSION}
Dispatch target: /{DISPATCH_SKILL} {FID}
```

### 🔒 Gate 5 — Resolve PR & Conclusion

- [ ] `CONCLUSION` ∈ `success | failure` (else no-op exit)
- [ ] `DISPATCH_SKILL` and `DISPATCH_PROMPT` set
- [ ] Workflow status updated (step `resolve-conclusion` recorded with `conclusion` and `dispatchSkill`)
- [ ] Issue comment attempted (`Step 5` section)

---

## 🤖 Step 6 — Dispatch

1. Invoke the dispatch prompt in the same runner Claude Code session:
   ```bash
   # The claude-code-action@v1 runs THIS file as the leaf orchestrator.
   # Step 6 invokes the target skill using the Skill tool or equivalent
   # workflow invocation surface available in the runner context.
   ```
   Use `Skill` tool (if available in runner session tool surface) OR invoke `/bkit-ship {FID}` / `/bkit-debug {FID}` directly as a workflow command in this session.
   **Constraint:** Router MUST NOT check `MAX_DEBUG_ATTEMPT` before dispatching `/bkit-debug`. The debug orchestrator's own ceiling enforces the limit.
   **Constraint:** `ANTHROPIC_API_KEY` secret failure surfaces here as a tool error → **Failure Path** with `claude-code-action dispatch failed: ANTHROPIC_API_KEY likely missing or invalid`.
2. Assert dispatch invocation returned without error. **If** error → **Failure Path** with `Dispatch of {DISPATCH_SKILL} failed`.
3. Record step:
   ```bash
   t=$(mktemp); jq --arg t "$(date -u +%FT%TZ)" --arg s "$DISPATCH_SKILL" \
     '.[-1].steps += [{step:"dispatch", status:"DONE", at:$t, dispatchSkill:$s, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 6 — Dispatch
Dispatched: /{DISPATCH_SKILL} {FID}
GHA run: {CI_RUN_URL}
```

### 🔒 Gate 6 — Dispatch

- [ ] Dispatch invocation returned without error
- [ ] No `MAX_DEBUG_ATTEMPT` pre-check performed (debug ceiling is debug orchestrator's responsibility)
- [ ] `ANTHROPIC_API_KEY` failure path documented in step body
- [ ] Workflow status updated (step `dispatch` recorded with `dispatchSkill`)
- [ ] Issue comment attempted (`Step 6` section)

---

## 🤖 Step 7 — Close Workflow

1. Mark workflow done:
   ```bash
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
2. Release router lock:
   ```bash
   rm -f "docs/plans/logs/{FID}/.router-lock"
   ```
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + fenced block below; capture returned `body` as `{COMMENT_BODY}`:

```comment
### bkit-ci-router → Step 7 — Close Workflow
Router DONE. Dispatched /{DISPATCH_SKILL} {FID}.
CI run: {CI_RUN_URL}
```

### 🔒 Gate 7 — Close Workflow

- [ ] Workflow status updated (`ci-router` `DONE`)
- [ ] Router lock released (`docs/plans/logs/{FID}/.router-lock` removed)
- [ ] Issue comment attempted (`Step 7` section)
