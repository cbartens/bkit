# CI Router

**Role:** Orchestrator — post-CI dispatcher.
**Scope:** Decide ship-vs-debug after CI completion and invoke the matching workflow — no code, no execution.

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
> - **Status:** `$REPO_ROOT/docs/plans/logs/{FID}/status.json` = central state file; ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `chore({FID}): ci-router DONE [skip ci]`; Failure Path → `chore({FID}): ci-router FAILED [skip ci]`.
> - **Tools:** Verify every return, do NOT assume success.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`, `list_issues`. Any `save_*` writes are best-effort; NEVER gate. **If** failure → retry once after 5s, then continue and apply edit with next scheduled write.
> - **Labels:** Linear issue phase `{LABELS}` (`Design`, `Plan`, `Build`, `Ship`, `Merged`) mutually exclusive — drop old phase before adding new. `Failed` (Failure Path) and `Debug` (Debug Workflow) are additive — phase label persists.
> - **Comments:** ONE Linear comment per workflow run; First step creates, all later steps ONLY append. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content.
> - **Timeouts:** **If** workflow or subagent run > 600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   if [ -f "$STATUS" ]; then
     t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
     git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
     git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json" 2>/dev/null || true
     git -C "$REPO_ROOT" commit -m "chore({FID}): ci-router FAILED [skip ci]" 2>/dev/null || true
     git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   fi
   ```
2. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Workflow Failure
   Step: {N} — {Step Name}; Sub-step: {M}
   Error: {error message / tool response}
   Stderr: {last 20 lines if shell}
   ```
3. **STOP**, no further downstream steps.

---

## 🤖 Step 1 — Start Workflow

1. Read invocation arguments `{CI_STATUS}` and `{PR_NUMBER}`. Assert both non-empty. **Else** → **Failure Path**.
2. Normalise `CI_STATUS`:
   ```bash
   case "$(echo "$CI_STATUS" | tr '[:upper:]' '[:lower:]')" in
     success|pass) CI_STATUS=PASS ;;
     failure|fail) CI_STATUS=FAIL ;;
     *) echo "Unrecognised CI_STATUS: $CI_STATUS" >&2; exit 1 ;;
   esac
   ```
   **If** the exit branch fires → **Failure Path**.
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
4. `gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,url --jq '.headRefName + "\t" + .headRefOid + "\t" + .state + "\t" + .url'` → split into `BRANCH`, `HEAD_SHA`, `PR_STATE`, `PR_URL`. Assert `BRANCH`, `HEAD_SHA`, `PR_URL` non-empty. **Else** → **Failure Path**.
5. **If** `PR_STATE` != OPEN → **Failure Path**.
6. **If** `BRANCH` does NOT start with `feat/` → **Failure Path**.
7. Extract `FID` from `BRANCH`: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID` != `BRANCH`. **Else** → **Failure Path**.
8. Resolve CI run id that triggered router:
   ```bash
   RUN_ID=$(gh run list --branch "$BRANCH" --limit 5 --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId")
   ```
   Assert `RUN_ID` non-empty. **Else** → **Failure Path**.
9. Extract Linear `ISSUE_ID` from `FID`:
   ```bash
   ISSUE_ID=$(echo "$FID" | grep -oE '^[a-z]+-[0-9]+' | tr '[:lower:]' '[:upper:]')
   ```
   Assert `ISSUE_ID` non-empty. **Else** → **Failure Path**.
10. Update status:
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
      '.[-1].steps += [{step:"ci-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    ```
11. `save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}"})` — `{BODY}` = fenced block below; capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`:
    ```comment
    ## CI Router
    ### Step 1 — Start Workflow - Status: {CI_STATUS}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`CI_STATUS` in `pass|fail`, `PR_NUMBER`, `PR_URL`, `OWNER_REPO`, `BRANCH`, `HEAD_SHA`, `RUN_ID`, `FID`, `ISSUE_ID`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] PR is OPEN and branch in `feat/**` namespace
- [ ] Workflow status updated (`ci-router` `IN_PROGRESS`, step `ci-start-workflow` recorded with `parentSha`; file-only write)
- [ ] Issue comment attempted (`Step 1` section, fresh comment)

---

## 🤖 Step 2 — Stale-Run Guard

1. `gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha'` → extract `LATEST_RUN_SHA`. Assert non-empty. **Else** → **Failure Path**.
2. **If** `LATEST_RUN_SHA` != `HEAD_SHA` → set `GUARD_VERDICT` = FAIL. **Else** → `GUARD_VERDICT` = PASS.
3. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$GUARD_VERDICT" \
     '.[-1].steps += [{step:"ci-stale-run-guard", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. **If** `GUARD_VERDICT` = FAIL → update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 2 — Stale-Run Guard - Verdict: {GUARD_VERDICT}
   ```
6. **If** `GUARD_VERDICT` = FAIL → **STOP**, no further downstream steps.

### 🔒 Gate 2 — Stale-Run Guard

- [ ] `LATEST_RUN_SHA` == `HEAD_SHA`
- [ ] Verdict determined (`GUARD_VERDICT`)
- [ ] Workflow status updated (step `ci-stale-run-guard` recorded with `parentSha`, `verdict`; workflow closed to `DONE` on FAIL)
- [ ] On FAIL, workflow status pushed to `dev` with `[skip ci]`
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Opt-In Gate

**Run only if** Step 2 `GUARD_VERDICT` = PASS.

1. `get_issue({ id: "{ISSUE_ID}" })` → extract `LABELS`. **If** call fails → retry once. **If** still fails → **Failure Path**.
2. **If** `Auto` not in `{LABELS}` → set `AUTO_VERDICT` = FAIL. **Else** → `AUTO_VERDICT` = PASS.
3. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$AUTO_VERDICT" \
     '.[-1].steps += [{step:"ci-opt-in-gate", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. **If** `AUTO_VERDICT` = FAIL → update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 3 — Opt-In Gate - Verdict: {AUTO_VERDICT}
   ```
6. **If** `AUTO_VERDICT` = FAIL → **STOP**, no further downstream steps.

### 🔒 Gate 3 — Opt-In Gate

- [ ] Label `Auto` present in `{LABELS}`
- [ ] Verdict determined (`AUTO_VERDICT`)
- [ ] Workflow status updated (step `ci-opt-in-gate` recorded with `parentSha`, `verdict`; workflow closed to `DONE` on FAIL)
- [ ] On FAIL, workflow status pushed to `dev` with `[skip ci]`
- [ ] Issue comment attempted (`Step 3` section)

---

## 🤖 Step 4 — Dispatch Workflow

**Run only if** Step 2 `GUARD_VERDICT` = PASS **and** Step 3 `AUTO_VERDICT` = PASS.

1. Update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg cs "$CI_STATUS" \
     '.[-1].steps += [{step:"ci-dispatch-workflow", status:"DONE", at:$t, parentSha:$p, ciStatus:$cs, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
2. **If** `CI_STATUS` = PASS → `DISPATCH_TARGET` = SHIP.
3. **If** `CI_STATUS` = FAIL → `DISPATCH_TARGET` = DEBUG.
4. **If** `CI_STATUS` != PASS **and** `CI_STATUS` != FAIL → **Failure Path**.
5. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### Step 4 — Dispatch Workflow - Target: {DISPATCH_TARGET}
   ```
6. **If** `DISPATCH_TARGET` = SHIP → invoke `/bkit-ship {FID}` via `Task` tool.
7. **If** `DISPATCH_TARGET` = DEBUG → invoke `/bkit-debug {FID}` via `Task` tool.

### 🔒 Gate 4 — Dispatch Workflow

- [ ] Workflow status updated (`ci-router` `DONE`, step `ci-dispatch-workflow` recorded with `parentSha`, `ciStatus`)
- [ ] Workflow status pushed to `dev` with `[skip ci]`
- [ ] Issue comment attempted (`Step 4` section)
- [ ] Slash command for ship or debug workflow invoked
- [ ] Router exits and dispatched workflow owns session
