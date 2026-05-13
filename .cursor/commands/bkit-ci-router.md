# CI Router (Utility Command)

**Usage:** `/bkit-ci-router $CI_STATUS $PR_NUMBER`

- `$CI_STATUS` = `success` | `failure` (the `workflow_run.conclusion` from GHA, or equivalent from a Cursor dashboard trigger).
- `$PR_NUMBER` = the PR number associated with the completed CI run.

**Purpose:** Closes the gap between `bkit-build` Step 17 (push CI-trigger commit, exit) and the operator deciding ship vs. debug. Wakes on CI completion, validates state, dispatches the matching skill in the same session. Runs identically whether invoked from `claude-code-action` on a GHA runner or from a Cursor cloud agents dashboard trigger — both substitute the same args into the same slash-command surface.

**Role:** Orchestrator. Does not edit code, does not commit, does not call subagents. Pure dispatcher.

> [!CAUTION]
> **Read in full:** `.agents/rules.md`.
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute sequentially.
> - **Auto-apply:** NEVER request human confirmation between steps.
> - **Failures:** **If** any step or gate cannot pass → **Failure Path**.
> - **No-op exits:** Stale-run / label-absent / closed-PR conditions are NOT failures — emit a Linear no-op comment and exit 0. Reserved for **Failure Path**: missing args, missing API access, malformed PR state.
> - **Placeholders:** Assert `{CI_STATUS}`, `{PR_NUMBER}`, `{FID}`, `{BRANCH}`, `{HEAD_SHA}`, `{LABELS}` non-empty at the steps that introduce them.
> - **Linear:** MCP tool names `get_issue`, `save_comment`, `list_comments`. Comment-append is best-effort; never gate dispatch on a comment failure.
> - **Idempotency:** A re-run with identical args on the same PR head SHA must produce the same dispatch decision. Concurrency in the GHA wrapper (`cancel-in-progress: true`) prevents most overlap; this is the in-process belt-and-braces.
> - **Tools:** Verify every return; do NOT assume success.

---

## 🤖 Failure Path

1. Print a single-line failure summary to stderr: `[bkit-ci-router] FAIL: <reason>`.
2. Append to the existing Linear comment thread for `{FID}` (one append; no new comments):

   ```
   ### bkit-ci-router → FAILURE
   Reason: <reason>
   Run URL: ${GITHUB_SERVER_URL:-N/A}/${GITHUB_REPOSITORY:-N/A}/actions/runs/${GITHUB_RUN_ID:-N/A}
   ```

3. Exit non-zero. Do NOT dispatch ship/debug. Operator must investigate before any subsequent CI run can route.

---

## 🤖 Step 1 — Parse Arguments and Resolve FID

1. Read `$CI_STATUS` and `$PR_NUMBER` from invocation args. Assert both non-empty. **Else** → **Failure Path**.
2. Normalise `$CI_STATUS`: accept `success` / `pass` (case-insensitive) → `pass`; `failure` / `fail` → `fail`; anything else → **Failure Path** (`unrecognised CI_STATUS`).
3. Resolve `BRANCH` and `HEAD_SHA`:

   ```bash
   PR_JSON=$(gh pr view "$PR_NUMBER" --json headRefName,headRefOid,state,labels)
   BRANCH=$(echo "$PR_JSON" | jq -r '.headRefName')
   HEAD_SHA=$(echo "$PR_JSON" | jq -r '.headRefOid')
   PR_STATE=$(echo "$PR_JSON" | jq -r '.state')
   ```

4. **If** `PR_STATE != "OPEN"` → no-op exit (`PR closed before router fired`). Comment to Linear, exit 0.
5. Extract `FID` from branch name: `FID="${BRANCH#feat/}"`. Assert `FID` non-empty and `FID != BRANCH` (i.e., branch must start with `feat/`). **Else** → no-op exit (`branch not in feat/** namespace`).

### 🔒 Gate 1 — Arguments

- [ ] `CI_STATUS` ∈ `{pass, fail}`
- [ ] `PR_NUMBER` non-empty
- [ ] `BRANCH`, `HEAD_SHA`, `FID` extracted
- [ ] PR is `OPEN`

---

## 🤖 Step 2 — Stale-Run Guard

The CI completion event may carry a stale `HEAD_SHA` if newer commits landed mid-CI. The router only routes on the run matching the PR's _current_ head SHA.

1. Read the latest CI run head SHA for the branch:

   ```bash
   LATEST_RUN_SHA=$(gh run list --branch "$BRANCH" --limit 1 --json headSha --jq '.[0].headSha')
   ```

2. **If** `LATEST_RUN_SHA != HEAD_SHA` → no-op exit (`stale CI run, newer commit already in flight`). Comment to Linear, exit 0.

### 🔒 Gate 2 — Stale-Run

- [ ] `LATEST_RUN_SHA == HEAD_SHA`

---

## 🤖 Step 3 — Linear `Auto` Label Opt-In Gate

The router only dispatches when the operator has explicitly opted the issue in for automation.

1. Derive Linear issue id from `FID`. The bkit branch convention is `feat/{linear-issue-id}-{slug}` (e.g. `feat/bar-260-foo-bar`). Extract the issue id: `LINEAR_ISSUE_ID=$(echo "$FID" | grep -oE '^[a-z]+-[0-9]+' | tr '[:lower:]' '[:upper:]')`. Assert non-empty. **Else** → no-op exit (`branch slug does not begin with a Linear-issue id`).
2. Call Linear MCP `get_issue` with `{id: LINEAR_ISSUE_ID, includeRelations: false}` → extract `LABELS` array. **If** MCP call fails → **Failure Path** (`Linear API unreachable`).
3. **If** `LABELS` does not include `Auto` → no-op exit (`Auto label absent — opt-in required`). Comment to Linear, exit 0.

### 🔒 Gate 3 — Opt-In

- [ ] `LINEAR_ISSUE_ID` extracted
- [ ] `LABELS` fetched
- [ ] `Auto` ∈ `LABELS`

---

## 🤖 Step 4 — Append Router Decision to Linear Comment

Find the existing comment for this workflow (the build/ship/debug thread) and append a single router-decision line. Never create a new comment; never rewrite prior content.

1. `list_comments` for `LINEAR_ISSUE_ID`. Find the most recent comment authored by the bot user (or operator's bkit prefix); fall back to creating a new comment ONLY if no prior workflow comment exists for this `FID`.
2. Compose the decision block:

   ```
   ### bkit-ci-router → /bkit-{ship|debug} {FID}
   CI status: {pass|fail} on {HEAD_SHA[0:7]}
   Run URL: {GHA run URL or Cursor session URL}
   ```

3. `save_comment` (id-update path) to append. **If** save fails → log to stderr but continue; comment is observability, not a gate.

### 🔒 Gate 4 — Comment Append

- [ ] Decision block composed
- [ ] `save_comment` attempted (success or logged-failure)

---

## 🤖 Step 5 — Dispatch

The terminal action. The router's session continues into the dispatched workflow's own first step; from here on, the dispatched skill owns its status.json + Linear comment lifecycle. The router exits implicitly when the dispatched skill exits.

1. **If** `CI_STATUS == pass` → invoke `/bkit-ship {FID}` via the `Skill` tool (Claude) / `Task` tool (Cursor).
2. **Else** (`CI_STATUS == fail`) → invoke `/bkit-debug {FID}` with `DEBUG_MODE=pr` via the `Skill` / `Task` tool. The debug workflow detects PR mode from `gh pr list --head $(git branch --show-current) --base dev` in its own Step 1; passing `DEBUG_MODE=pr` is a hint, not a requirement.

### 🔒 Gate 5 — Dispatch

- [ ] Skill tool invoked with the matching slash command and `FID`
- [ ] Router exits cleanly (the dispatched workflow now owns the session)
