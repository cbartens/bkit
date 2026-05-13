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
> - **Subagents:** Not used in this workflow — orchestrator dispatches sibling slash commands via the `Skill` tool (Claude) / `Task` tool (Cursor); never invokes agents.
> - **Tools:** Verify every return, do NOT assume success.
> - **Git:** Read-only — `gh pr view`, `gh run list`, `gh repo view`. No commits, no pushes, no worktree ops.
> - **Linear**: MCP tool names `get_issue`, `save_issue`, `save_comment`, `list_comments`. Any `save_*` writes are best-effort; NEVER gate. **If** failure → retry once after 5s, then continue and apply edit with next scheduled write.
> - **Comments:** Append-only. Reuse the most recent comment on `{ISSUE_ID}` whose body opens with `## Build Workflow`, `## Ship Workflow`, or `## Debug Workflow` as `{COMMENT_ID}`. NEVER rewrite, paraphrase, summarise, truncate, deduplicate, or reorder prior content. **If** no prior comment exists → create one.
> - **Timeouts:** **If** workflow run > 600 seconds → **Failure Path**.
> - **Dispatch:** The terminal step hands the session to `/bkit-ship` or `/bkit-debug`; the dispatched skill owns status.json + the Linear comment from that point on. The router does NOT track downstream progress.

---

## 🤖 Failure Path

1. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### CI Router Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Run URL: https://github.com/{OWNER_REPO}/actions/runs/{GHA_RUN_ID}
   ```
2. **STOP**, no dispatch.

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
10. `list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → find latest comment whose body opens with `## Build Workflow`, `## Ship Workflow`, or `## Debug Workflow` → `COMMENT_ID`, `COMMENT_BODY`. **If** none → `save_comment({ issueId: "{ISSUE_ID}", body: "## CI Router\n### Step 1 — Start Workflow\n" })` → capture returned `id` as `{COMMENT_ID}` and `body` as `{COMMENT_BODY}`.

### 🔒 Gate 1 — Start Workflow

- [ ] Placeholders non-empty (`CI_STATUS` ∈ `{pass, fail}`, `PR_NUMBER`, `OWNER_REPO`, `BRANCH`, `HEAD_SHA`, `FID`, `ISSUE_ID`, `LABELS`, `COMMENT_ID`, `COMMENT_BODY`)
- [ ] PR is `OPEN` and branch in `feat/**` namespace
- [ ] Issue comment located or created

---

## 🤖 Step 2 — Stale-Run Guard

1. `gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha'` → extract `LATEST_RUN_SHA`. Assert non-empty. **Else** → **Failure Path**.
2. **If** `LATEST_RUN_SHA` != `HEAD_SHA` → `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}` — then **STOP**:
   ```comment
   ### CI Router → no-op
   Reason: stale CI run (head SHA `{LATEST_RUN_SHA}` differs from PR head `{HEAD_SHA}`); newer commit already in flight.
   ```

### 🔒 Gate 2 — Stale-Run

- [ ] `LATEST_RUN_SHA` == `HEAD_SHA`

---

## 🤖 Step 3 — Linear `Auto` Opt-In Gate

1. **If** `Auto` NOT in `{LABELS}` → `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}` — then **STOP**:
   ```comment
   ### CI Router → no-op
   Reason: `Auto` label absent on `{ISSUE_ID}` — opt-in required for autonomous dispatch.
   ```

### 🔒 Gate 3 — Opt-In

- [ ] `Auto` ∈ `{LABELS}`

---

## 🤖 Step 4 — Append Decision

1. Resolve `DECISION`:
   ```bash
   if [ "$CI_STATUS" = "pass" ]; then DECISION="/bkit-ship {FID}"; else DECISION="/bkit-debug {FID} DEBUG_MODE=pr"; fi
   ```
2. `save_comment({ id: "{COMMENT_ID}", body: "{BODY}"})` — `{BODY}` = `COMMENT_BODY` + append fenced block below; capture returned `body` as `{COMMENT_BODY}`:
   ```comment
   ### CI Router → Dispatch - CI: {CI_STATUS} - Decision: {DECISION}
   Head SHA: `{HEAD_SHA}`
   Run URL: https://github.com/{OWNER_REPO}/actions/runs/{GHA_RUN_ID}
   ```

### 🔒 Gate 4 — Decision

- [ ] `DECISION` resolved (`/bkit-ship {FID}` or `/bkit-debug {FID} DEBUG_MODE=pr`)
- [ ] Issue comment attempted (`Step 4` section)

---

## 🤖 Step 5 — Dispatch

1. **If** `CI_STATUS` = `pass` → invoke `/bkit-ship {FID}` via `Skill` tool (Claude) / `Task` tool (Cursor). The dispatched workflow's Step 1 owns status.json and the Linear comment from this point on.
2. **Else** → invoke `/bkit-debug {FID}` via `Skill` tool (Claude) / `Task` tool (Cursor). The debug workflow auto-detects PR mode from `gh pr list --head $(git branch --show-current) --base dev` in its own Step 1.

### 🔒 Gate 5 — Dispatch

- [ ] Slash command invoked
- [ ] Router process exits cleanly (the dispatched workflow now owns the session)
