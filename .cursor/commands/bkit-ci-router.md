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
> - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does NOT mean silent.
> - **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
> - **Friction:** Watch own context + subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → APPEND to `.agents/friction.md`. Log first, then continue or escalate; logging does NOT replace **Failure Path**.
> - **Gates:** Verify all gates before next step. Skipped gate = invalid work → close gap.
> - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty before tool calls. **Else** → **Failure Path**. `{OWNER}` + `{REPO}` derived from `{OWNER_REPO}` at Step 1. `{YYYYMM}` = canonical month bucket for this FID; discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.
> - **Status:** `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json` = central state file; ONE entry per step with `parentSha` captured at step START. Workflow `status` = `IN_PROGRESS | DONE | FAILED`. Step `status` = `DONE | FAILED`. Step `verdict` = `PASS | FAIL | CONCERNS`.
> - **Status branch:** `status.json` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json`. Per-step: file-only write on dev working copy + commit on `feat/{FID}`. `dev` commit + push ONCE per run: Close Workflow → `chore({FID}): ci-router DONE bkit [skip ci]`; Failure Path → `chore({FID}): ci-router FAILED bkit [skip ci]`.
> - **Tools:** Verify every return, do NOT assume success.
> - **Git:** Orchestrator commits right after every subgent return; subagents do NOT commit. NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Destructive git **PROHIBITED:** `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop`, `git push --force` (any flavour). Pre `git push`: assert `{BRANCH}` non-empty.

> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (CI-router trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.

> - **Timeouts:** **If** workflow or subagent run > 600 seconds → **Failure Path**.

---

## 🤖 Failure Path

1. Update status, commit, and push:
   ```bash
   REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   if [ -f "$STATUS" ]; then
     t=$(mktemp); jq '.[-1] |= (. + {status:"FAILED"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
     git -C "$REPO_ROOT" pull --ff-only origin dev 2>/dev/null || true
     git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json" 2>/dev/null || true
     git -C "$REPO_ROOT" commit -m "chore({FID}): ci-router FAILED bkit [skip ci]" 2>/dev/null || true
     git -C "$REPO_ROOT" push origin dev 2>/dev/null || true
   fi
   ```
2. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
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
3. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty. Derive `OWNER="${OWNER_REPO%/*}"` and `REPO="${OWNER_REPO#*/}"`. Assert both non-empty.
4. `gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,url --jq '.headRefName + "\t" + .headRefOid + "\t" + .state + "\t" + .url'` → split into `BRANCH`, `HEAD_SHA`, `PR_STATE`, `PR_URL`. Assert `BRANCH`, `HEAD_SHA`, `PR_URL` non-empty. **Else** → **Failure Path**.
5. **If** `PR_STATE` != OPEN → **Failure Path**.
6. **If** `BRANCH` does NOT start with `feat/` → **Failure Path**.
7. Extract `FID` from `BRANCH`: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID` != `BRANCH`. **Else** → **Failure Path**.
8. Resolve CI run id that triggered router:
   ```bash
   RUN_ID=$(gh run list --branch "$BRANCH" --limit 5 --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId")
   ```
   Assert `RUN_ID` non-empty. **Else** → **Failure Path**.
9. Extract `ISSUE_ID` from PR body metadata (preferred) or `FID` slug (fallback):
   When `bkit-build` opens the PR, the body template includes a metadata marker:

```html
<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->
```

HTML comment, invisible in rendered PR body. Downstream workflows (debug, ship, ci-router) resolve issue ID and FID by reading PR body via `mcp__github__pull_request_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER} })` and parsing the marker.

**Fail-closed:** missing or malformed marker → terminate workflow + remove PR label `bkit:auto`.
   **Fallback** (`bkit-build` was run pre-metadata, or metadata missing): parse `FID`:
   ```bash
   # tracker-specific — github FIDs are `{N}-{slug}`; linear FIDs are `{prefix}-{N}-{slug}`
   ISSUE_ID=$(echo "$FID" | grep -oE '^[a-z]+-[0-9]+|^[0-9]+' | head -1)
   ```
   Assert `ISSUE_ID` non-empty. **Else** → **Failure Path**.
10. Update status:
    ```bash
    REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
    YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-2)}')
    [ -z "$YYYYMM" ] && { echo "No YYYYMM bucket found for {FID} — ci-router runs post-build" >&2; exit 1; }
    mkdir -p "$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}"
    STATUS="$REPO_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.json"
    [ -f "$STATUS" ] || echo '[]' > "$STATUS"
    if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "ci-router" ] || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "IN_PROGRESS" ]; then
      t=$(mktemp); jq '. + [{workflow:"ci-router", startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
    fi
    PARENT_SHA=$(git rev-parse HEAD)
    t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
      '.[-1].steps += [{step:"ci-start-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[]}]' \
      "$STATUS" > "$t" && mv "$t" "$STATUS"
    ```
11. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
    `{BODY}` = fenced block below:
    ```comment
    ## CI Router
    ### Step 1 — Start Workflow - Status: {CI_STATUS}
    [{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
    [{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})
    [{OWNER_REPO}/actions/run/{RUN_ID}](https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID})
    ```

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`CI_STATUS` in `pass|fail`, `PR_NUMBER`, `PR_URL`, `OWNER_REPO`, `OWNER`, `REPO`, `BRANCH`, `HEAD_SHA`, `RUN_ID`, `FID`, `ISSUE_ID`)
- [ ] PR is OPEN and branch in `feat/**` namespace
- [ ] Workflow status updated (`ci-router` `IN_PROGRESS`, step `ci-start-workflow` recorded with `parentSha`; file-only write)
- [ ] Issue comment attempted (`Step 1` section, fresh comment)

---

## 🤖 Step 2 — Stale-Run Guard

1. `gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha'` → extract `LATEST_RUN_SHA`. Assert non-empty. **Else** → **Failure Path**.
2. **If** `LATEST_RUN_SHA` != `HEAD_SHA` → set `GUARD_VERDICT` = FAIL. **Else** → `GUARD_VERDICT` = PASS.
3. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$GUARD_VERDICT" \
     '.[-1].steps += [{step:"ci-stale-run-guard", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. **If** `GUARD_VERDICT` = FAIL → update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE bkit [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 2 — Stale-Run Guard - Verdict: {GUARD_VERDICT}
   ```
6. **If** `GUARD_VERDICT` = FAIL → **STOP**, no further downstream steps.

### 🔒 Gate 2 — Stale-Run Guard

- [ ] `LATEST_RUN_SHA` == `HEAD_SHA`
- [ ] Verdict determined (`GUARD_VERDICT`)
- [ ] Workflow status updated (step `ci-stale-run-guard` recorded with `parentSha`, `verdict`; workflow closed to `DONE` on FAIL)
- [ ] On FAIL, workflow status pushed to `dev` with `bkit [skip ci]`
- [ ] Issue comment attempted (`Step 2` section)

---

## 🤖 Step 3 — Opt-In Gate

**Run only if** Step 2 `GUARD_VERDICT` = PASS.

1. `mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open`/`closed`), `labels[].name` → `LABELS`, `body` → `DESCRIPTION`. Then `mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.
   **If** call fails → retry once. **If** still fails → **Failure Path**.
2. **If** `bkit:auto` not in `{LABELS}` → set `AUTO_VERDICT` = FAIL → run kill-switch propagation:
   After reading issue (`issue-read`): **If** `bkit:auto` NOT in `LABELS` → kill switch active → remove PR label `bkit:auto` if PR exists (`mcp__github__update_pull_request({ owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER}, labels: [labels minus bkit:auto] })`) → terminate workflow normally (current run finishes, no further automation).
   **Else** → `AUTO_VERDICT` = PASS.
3. Update status:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$AUTO_VERDICT" \
     '.[-1].steps += [{step:"ci-opt-in-gate", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   ```
4. **If** `AUTO_VERDICT` = FAIL → update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE bkit [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 3 — Opt-In Gate - Verdict: {AUTO_VERDICT}
   ```
6. **If** `AUTO_VERDICT` = FAIL → **STOP**, no further downstream steps.

### 🔒 Gate 3 — Opt-In Gate

- [ ] Label `bkit:auto` present in issue `{LABELS}` (else kill-switch propagated)
- [ ] Verdict determined (`AUTO_VERDICT`)
- [ ] Workflow status updated (step `ci-opt-in-gate` recorded with `parentSha`, `verdict`; workflow closed to `DONE` on FAIL)
- [ ] On FAIL, workflow status pushed to `dev` with `bkit [skip ci]`
- [ ] Issue comment attempted (`Step 3` section)

---

## 🤖 Step 4 — Dispatch Workflow

**Run only if** Step 2 `GUARD_VERDICT` = PASS **and** Step 3 `AUTO_VERDICT` = PASS.

1. Update status, commit, and push:
   ```bash
   STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"
   PARENT_SHA=$(git rev-parse HEAD)
   t=$(mktemp); jq --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg cs "$CI_STATUS" \
     '.[-1].steps += [{step:"ci-dispatch-workflow", status:"DONE", at:$t, parentSha:$p, ciStatus:$cs, artifacts:[]}]' \
     "$STATUS" > "$t" && mv "$t" "$STATUS"
   t=$(mktemp); jq '.[-1] |= (. + {status:"DONE"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
   git -C "$REPO_ROOT" pull --ff-only origin dev || { echo "dev fast-forward failed" >&2; exit 1; }
   git -C "$REPO_ROOT" add "docs/plans/{YYYYMM}/logs/{FID}/status.json"
   git -C "$REPO_ROOT" commit -m "docs({FID}): ci-router DONE bkit [skip ci]"
   git -C "$REPO_ROOT" push origin dev || { echo "dev push failed" >&2; exit 1; }
   ```
2. **If** `CI_STATUS` = PASS → `DISPATCH_TARGET` = SHIP.
3. **If** `CI_STATUS` = FAIL → `DISPATCH_TARGET` = DEBUG.
4. **If** `CI_STATUS` != PASS **and** `CI_STATUS` != FAIL → **Failure Path**.
5. `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.
   `{BODY}` = fenced block below:
   ```comment
   ### Step 4 — Dispatch Workflow - Target: {DISPATCH_TARGET}
   ```
6. **If** `DISPATCH_TARGET` = SHIP → invoke `/bkit-ship {FID}` via `Task` tool.
7. **If** `DISPATCH_TARGET` = DEBUG → invoke `/bkit-debug {FID}` via `Task` tool.

### 🔒 Gate 4 — Dispatch Workflow

- [ ] Workflow status updated (`ci-router` `DONE`, step `ci-dispatch-workflow` recorded with `parentSha`, `ciStatus`)
- [ ] Workflow status pushed to `dev` with `bkit [skip ci]`
- [ ] Issue comment attempted (`Step 4` section)
- [ ] Slash command for ship or debug workflow invoked
- [ ] Router exits and dispatched workflow owns session
