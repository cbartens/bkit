---
description: "CI Router — Auto-dispatch /bkit-ship (CI pass) or /bkit-debug (CI fail) after CI completion"
---

# CI Router (Utility Command)

**Role:** Orchestrator — post-CI dispatcher.
**Scope:** Decide ship-vs-debug after CI completion and invoke the matching skill in the same session.

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially unless stated otherwise.
> - **No Improv:** No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - **Auto-apply:** NEVER request human confirmation between steps. **If** single recommended option → document and proceed.
> - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **No-op exits:** Stale-run, label-absent, branch-out-of-namespace, and closed-PR conditions append a single Linear no-op note and STOP cleanly — they are NOT failures.
> - **Friction:** Watch own context for repeated tool failures, malformed `gh` payloads, MCP timeouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{CI_STATUS}`, `{PR_NUMBER}`, `{OWNER_REPO}`, `{BRANCH}`, `{HEAD_SHA}`, `{ISSUE_ID}`, `{FID}`, `{LABELS}`, `{COMMENT_ID}`, `{COMMENT_BODY}` non-empty before tool calls. **Else** → **Failure Path**.
> - **Subagents:** Not used in this workflow — orchestrator dispatches sibling slash commands via the `Skill` tool; never invokes agents.
> - **Tools:** Verify every return, do NOT assume success.
> - **Status:** `$REPO_ROOT/docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Router-only step verdicts use `OK | SKIP` for no-op skip cases.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/logs/{FID}/status.json`. Steps 1-4: file-only write on the runner's working copy of `feat/{FID}`. Single commit + push deferred to Step 5 (dispatch) and Failure Path. Commit messages: Step 5 → `docs({FID}): ci-router DONE [skip ci]`; Failure Path → `chore({FID}): ci-router FAILED [skip ci]`. `[skip ci]` is load-bearing — prevents the router from triggering itself recursively via its own push.
> - **Git:** Read-only for repo state queries (`gh pr view`, `gh run list`, `gh repo view`). Write allowed for status.json commit + push at Step 5 and Failure Path only. NEVER stage anything other than `docs/plans/logs/{FID}/status.json`; NEVER use `--no-verify`. Destructive git **PROHIBITED**.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`. Any `save_*` writes are best-effort; NEVER gate. **If** failure → retry once after 5s, then continue and apply edit with next scheduled write.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** **If** workflow run > 600 seconds → **Failure Path**.
> - **Dispatch:** The terminal step hands the session to `/bkit-ship` or `/bkit-debug`; the dispatched skill starts its own `## Ship Workflow` / `## Debug Workflow` Linear comment and appends fresh `status.json` entries from that point on. The router does NOT track downstream progress.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   if [ -f "$STATUS" ]; then
     t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
     git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json" 2>/dev/null || true
     git -C "$REPO_ROOT" commit -m "chore({FID}): ci-router FAILED [skip ci]" 2>/dev/null || true
     git -C "$REPO_ROOT" push origin "$(git -C "$REPO_ROOT" branch --show-current)" 2>/dev/null || true
   fi
   ```
2. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   Run URL: https://github.com/{OWNER_REPO}/actions/runs/{GHA_RUN_ID}
   ```
3. **STOP**, no dispatch.

---

## 🤖 Step 1 — Start Workflow

1. Read invocation args `{CI_STATUS}` and `{PR_NUMBER}`. Assert both non-empty. **Else** → **Failure Path**.
2. Normalise `CI_STATUS`:
   ```bash
   case "$(echo "$CI_STATUS" | tr '[:upper:]' '[:lower:]')" in
     success|pass) CI_STATUS=pass ;;
     failure|fail) CI_STATUS=fail ;;
     *) echo "Unrecognised CI_STATUS: $CI_STATUS" >&2; exit 1 ;;
   esac
   ```
   **If** the exit branch fires → **Failure Path**.
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
4. `gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,number --jq '.headRefName + "\t" + .headRefOid + "\t" + .state'` → split into `BRANCH`, `HEAD_SHA`, `PR_STATE`. Assert `BRANCH`, `HEAD_SHA` non-empty. **Else** → **Failure Path**.
5. **If** `PR_STATE` != `OPEN` → append `### CI Router → no-op` Linear note (reason `PR not OPEN`) and **STOP**.
6. **If** `BRANCH` does NOT start with `feat/` → append `### CI Router → no-op` Linear note (reason `branch out of feat/** namespace`) and **STOP**.
7. Extract `FID` from `BRANCH`: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID` != `BRANCH`. **Else** → **Failure Path**.
8. Extract Linear `ISSUE_ID` from `FID`:
   ```bash
   ISSUE_ID=$(echo "$FID" | grep -oE '^[a-z]+-[0-9]+' | tr '[:lower:]' '[:upper:]')
   ```
   Assert non-empty. **Else** → **Failure Path**.
9. `get_issue({ id: "{ISSUE_ID}" })` → extract `LABELS`. **If** MCP call fails → **Failure Path**.
10. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:
    ```comment
    ## CI Router
    ### Step 1 — Start Workflow
    CI: `{CI_STATUS}` on `{HEAD_SHA}` (PR #{PR_NUMBER})
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    ```
11. Initialise workflow + record step in `status.json` (file-only — commit + push deferred to Step 5):
    ```bash
    REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
    mkdir -p "$REPO_ROOT/docs/plans/logs/{FID}"
    STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
    [ -f "$STATUS" ] || echo '[]' > "$STATUS"
    if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "ci-router" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
      t=$(mktemp); jq '. + [{workflow:"ci-router", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
    fi
    PARENT_SHA=$(git rev-parse HEAD)
    t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
      '.[-1].steps += [{step:"ci-router-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`CI_STATUS` ∈ `{pass, fail}`, `PR_NUMBER`, `OWNER_REPO`, `BRANCH`, `HEAD_SHA`, `FID`, `ISSUE_ID`, `LABELS`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] PR is `OPEN` and branch in `feat/**` namespace
- [ ] Issue comment attempted (`Step 1` section, fresh comment)
- [ ] Workflow status initialised (`ci-router` `IN_PROGRESS`, step `ci-router-start-workflow` recorded with `parentSha`)

---

## 🤖 Step 2 — Stale-Run Guard

1. `gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha'` → extract `LATEST_RUN_SHA`. Assert non-empty. **Else** → **Failure Path**.
2. **If** `LATEST_RUN_SHA` != `HEAD_SHA` → set `STEP_VERDICT` = `SKIP`. **Else** → `STEP_VERDICT` = `OK`.
3. Record step in `status.json` (file-only):
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$STEP_VERDICT" \
     '.[-1].steps += [{step:"ci-router-stale-run-guard", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. **If** `STEP_VERDICT` = `SKIP` → close workflow status + commit + push + append Linear no-op, then **STOP**:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin "$(git -C "$REPO_ROOT" branch --show-current)"
   ```
   Then `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Stale-Run Guard - Status: SKIP
   Reason: stale CI run (head SHA `{LATEST_RUN_SHA}` differs from PR head `{HEAD_SHA}`); newer commit already in flight.
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Stale-Run Guard - Status: OK
   ```

### 🔒 Gate 2 — Stale-Run

- [ ] `LATEST_RUN_SHA` == `HEAD_SHA`
- [ ] Step recorded in `status.json` (`ci-router-stale-run-guard` with `parentSha` + `verdict`)
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Linear `Auto` Opt-In Gate

1. **If** `Auto` NOT in `{LABELS}` → set `STEP_VERDICT` = `SKIP`. **Else** → `STEP_VERDICT` = `OK`.
2. Record step in `status.json` (file-only):
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$STEP_VERDICT" \
     '.[-1].steps += [{step:"ci-router-opt-in-gate", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
3. **If** `STEP_VERDICT` = `SKIP` → close workflow status + commit + push + append Linear no-op, then **STOP**:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin "$(git -C "$REPO_ROOT" branch --show-current)"
   ```
   Then `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Opt-In Gate - Status: SKIP
   Reason: `Auto` label absent on `{ISSUE_ID}` — opt-in required for autonomous dispatch.
   ```
4. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Opt-In Gate - Status: OK
   ```

### 🔒 Gate 3 — Opt-In

- [ ] `Auto` ∈ `{LABELS}`
- [ ] Step recorded in `status.json` (`ci-router-opt-in-gate` with `parentSha` + `verdict`)
- [ ] Issue comment attempted (`Step 3` section)

---

## 🤖 Step 4 — Append Decision

1. Resolve `DECISION`:
   ```bash
   if [ "$CI_STATUS" = "pass" ]; then DECISION="/bkit-ship {FID}"; else DECISION="/bkit-debug {FID} DEBUG_MODE=pr"; fi
   ```
2. Record step in `status.json` (file-only):
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg d "$DECISION" \
     '.[-1].steps += [{step:"ci-router-decision", status:"DONE", at:$t, parentSha:$p, decision:$d, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
3. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 4 — Decision - CI: {CI_STATUS} - Decision: {DECISION}
   Head SHA: `{HEAD_SHA}`
   Run URL: https://github.com/{OWNER_REPO}/actions/runs/{GHA_RUN_ID}
   ```

### 🔒 Gate 4 — Decision

- [ ] `DECISION` resolved (`/bkit-ship {FID}` or `/bkit-debug {FID} DEBUG_MODE=pr`)
- [ ] Step recorded in `status.json` (`ci-router-decision` with `parentSha` + `decision`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🤖 Step 5 — Dispatch

1. Close workflow status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg d "$DECISION" \
     '.[-1].steps += [{step:"ci-router-dispatch", status:"DONE", at:$t, parentSha:$p, decision:$d, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin "$(git -C "$REPO_ROOT" branch --show-current)"
   ```
2. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 5 — Dispatch
   Invoked: `{DECISION}`
   ```
3. **If** `CI_STATUS` = `pass` → invoke `/bkit-ship {FID}` via `Skill` tool. The dispatched workflow's Step 1 owns status.json and starts its own `## Ship Workflow` Linear comment from this point on.
4. **Else** → invoke `/bkit-debug {FID}` via `Skill` tool. The debug workflow auto-detects PR mode from `gh pr list --head $(git branch --show-current) --base dev` in its own Step 1 and starts its own `## Debug Workflow` Linear comment.

### 🔒 Gate 5 — Dispatch

- [ ] Workflow status closed (`ci-router` `DONE`, step `ci-router-dispatch` recorded with `parentSha` + `decision`)
- [ ] `status.json` committed + pushed with `[skip ci]`
- [ ] Issue comment attempted (`Step 5` section)
- [ ] Slash command invoked
- [ ] Router process exits cleanly (the dispatched workflow now owns the session)
