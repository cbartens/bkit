diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index fd54bb04f..c5864a2f9 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -47,11 +47,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 
@@ -63,7 +63,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -90,7 +90,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-abort-handover.md` using `view_file` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -277,7 +277,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -728,7 +728,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -746,7 +746,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -761,12 +761,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -783,11 +781,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -810,102 +807,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md` using `view_file` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md` using `view_file` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -915,7 +834,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -928,7 +847,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 96b995f46..2c0f2ad3f 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -47,11 +47,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 
@@ -63,7 +63,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -90,7 +90,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -277,7 +277,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -728,7 +728,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -746,7 +746,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -761,12 +761,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -783,11 +781,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -810,102 +807,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -915,7 +834,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -928,7 +847,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts b/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
index 92eaee3e5..d3a4e1191 100644
--- a/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
@@ -622,8 +622,6 @@ const COUNTER_STEP_MAP: Record<string, string[]> = {
   "plan-review": ["plan-review"],
   "plan-apply-review": ["plan-apply-review"],
   "ship-merge-pr": ["ship-merge-pr"],
-  "ship-failure-diagnose": ["ship-merge-pr"],
-  "ship-failure-remediate": ["ship-merge-pr"],
 };
 
 interface MappingViolation {
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 98c0582aa..48edca1eb 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -232,7 +232,7 @@ describe("ship reconciliation and retry contracts", () => {
       expect(block).toContain("--exceeded=failure-path");
       expect(block).toContain("Step 3");
       expect(block).not.toContain("--continue=step-9");
-      expect(block).not.toContain("Step 11");
+      expect(block).not.toContain("Failure Diagnose");
     }
     expect(revalidate.indexOf("exit 21")).toBeLessThan(revalidate.indexOf("Hold `validatedHead`"));
     expect(step(ship, 3)).toContain("branches sync --reconcile-feature");
@@ -246,7 +246,7 @@ describe("ship reconciliation and retry contracts", () => {
     }
   });
 
-  it("passes the actual merge target and defers branch deletion to guarded close", () => {
+  it("ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close", () => {
     const ship = readShip();
     const resolver = fs.readFileSync(
       path.join(REPO_ROOT, ".bkit/core/prompts/bkit-ship-conflict-resolve.md"),
@@ -261,7 +261,7 @@ describe("ship reconciliation and retry contracts", () => {
     const mergeCommands = fencedLinesByStep(ship).filter(({ line }) => /prs merge\b/.test(line));
     expect(mergeCommands.length).toBeGreaterThan(0);
     for (const { line } of mergeCommands) expect(line).not.toContain("--delete-branch");
-    expect(step(ship, 14)).toMatch(/workflows close[^\n]*--flush[^\n]*--branch=/);
+    expect(step(ship, 12)).toMatch(/workflows close[^\n]*--flush[^\n]*--branch=/);
   });
 
   it("routes MCP safety facts through engine decisions with transport accounting", () => {
@@ -326,12 +326,12 @@ describe("ship reconciliation and retry contracts", () => {
 });
 
 // ---------------------------------------------------------------------------
-// FROZEN — canonical 14 ship-* step-key set
+// FROZEN — canonical 12 ship-* step-key set
 // ---------------------------------------------------------------------------
 //
 // Step NUMBERS may move; KEYS may not.
 //
-// 14 keys total (the canonical ship step set), in run order. Keys are added,
+// 12 keys total (the canonical ship step set), in run order. Keys are added,
 // never renamed.
 
 export const CANONICAL_SHIP_STEP_KEYS: readonly string[] = [
@@ -345,8 +345,6 @@ export const CANONICAL_SHIP_STEP_KEYS: readonly string[] = [
   "ship-prune-skills",
   "ship-bookkeeping-push",
   "ship-merge-pr",
-  "ship-failure-diagnose",
-  "ship-failure-remediate",
   "ship-switch-to-dev",
   "ship-close-workflow",
 ] as const;
@@ -379,8 +377,7 @@ describe("bkit-ship.md — push-timing invariant (feature-branch pushes before m
   // after merging origin/dev locally),
   // the one pre-merge bookkeeping commit (Commit + Push Bookkeeping) that carries
   // docs, summaries, ledgers and skill removals onto the PR so the merge lands
-  // them on `dev`, the regenerate round after a red CI run (Step 10), and a
-  // Failure Remediate fix.
+  // them on `dev`, and the regenerate round after a red CI run (Step 10).
   // Every one of them is plain: the merge adds commits on top of the pushed
   // head, so nothing in ship ever needs `--force-with-lease`
   // (`bkit branches push --mode=feature`).
@@ -410,7 +407,6 @@ describe("bkit-ship.md — push-timing invariant (feature-branch pushes before m
       [
         "Base Check",
         "Commit + Push Bookkeeping",
-        "Failure Remediate",
         "Integrate (Path B only)",
         "Merge Gate + Merge PR",
         "Verify PR (Worktree Setup + Regression Guard)",
@@ -631,11 +627,11 @@ describe("bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --
 });
 
 // ---------------------------------------------------------------------------
-// POSITIVE — canonical 14 ship-* step-key set
+// POSITIVE — canonical 12 ship-* step-key set
 // ---------------------------------------------------------------------------
 
-describe("bkit-ship.md — canonical 14 ship-* step-key set", () => {
-  it("publishes the canonical 14 ship-* step-key set (no invented names)", () => {
+describe("bkit-ship.md — canonical 12 ship-* step-key set", () => {
+  it("bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names)", () => {
     // Finding 7: agents invent step names. Every canonical key is written, and
     // nothing else is. `ship-close-workflow` is written by `workflows close --flush`
     // (commands/workflow/workflows.test.ts); every other key by a
@@ -855,11 +851,10 @@ describe("bkit-ship.md — Failure Path single-write contract", () => {
     }
   });
 
-  it("wires bkit ledgers into exactly 2 bash regions", () => {
-    // Commit + Push Bookkeeping and the Failure Remediate fix commit. The Integrate
-    // merge commit, the Failure Path flush, the re-validate bookkeeping check and the
-    // close flush run inside commands.
-    expect(ledgersBlocks(readShip())).toHaveLength(2);
+  it("wires bkit ledgers into exactly 1 bash region", () => {
+    // Commit + Push Bookkeeping. The Integrate merge commit, the Failure Path flush,
+    // the re-validate bookkeeping check and the close flush run inside commands.
+    expect(ledgersBlocks(readShip())).toHaveLength(1);
   });
 
   it("every bkit ledgers stage / commit stops the step on a non-zero exit", () => {
@@ -924,8 +919,8 @@ describe("bkit-ship.md — issue-less runs and the main guard", () => {
     expect(between).toContain("**Failure Path**");
   });
 
-  it("Step 14.3 labels skip when ISSUE_ID is empty", () => {
-    const lines = section(readShip(), /^## .*Step 14 — Close Workflow/, /^### .*Gate/).split("\n");
+  it("Step 12.3 labels skip when ISSUE_ID is empty", () => {
+    const lines = section(readShip(), /^## .*Step 12 — Close Workflow/, /^### .*Gate/).split("\n");
     const start = lines.findIndex((l) => /^3\. /.test(l));
     const end = nextAfter(lines, start, /^4\. /);
     expect(start).toBeGreaterThanOrEqual(0);
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 0aa72fa95..c0f3645cb 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1054,7 +1054,7 @@ describe("verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6)
 });
 
 describe("status route --require=strategy", () => {
-  it("is used at exactly the five strategy-routing sites", () => {
+  it("status route --require=strategy is used at exactly the four strategy-routing sites", () => {
     const sites = ["build", "debug", "ship"].flatMap((name) =>
       commandLines(workflow(name), "status route")
         .filter((l) => l.includes("--require=strategy"))
@@ -1065,7 +1065,6 @@ describe("status route --require=strategy", () => {
       "build-plan-gaps-remediate",
       "build-plan-gaps-remediate-holistic",
       "debug-failure-diagnose",
-      "ship-failure-remediate",
     ]);
   });
 });
@@ -1157,15 +1156,28 @@ describe("diff per reader", () => {
 describe("ship", () => {
   const ship = workflow("ship");
 
+  it("ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12", () => {
+    expect(ship).not.toContain("Failure Diagnose");
+    expect(ship).not.toContain("Failure Remediate");
+    expect(ship).not.toContain("ship-failure");
+    const numbers = ship
+      .split("\n")
+      .filter((l) => /^## \S+ Step \d+ — /.test(l))
+      .map((l) => Number(/Step (\d+) —/.exec(l)![1]));
+    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
+    expect(section(ship, /Step 12 — /)).toContain("Close Workflow");
+    expect(section(ship, /Step 11 — /)).toContain("Update Local Dev");
+  });
+
   it("post-merge check reads the capstone job alone, at the squash commit", () => {
-    const close = section(ship, /Step 14 — Close Workflow/);
+    const close = section(ship, /Step 12 — Close Workflow/);
     expect(close).toContain(
       '"{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"',
     );
   });
 
   it("the close removes the worktree and deletes the branch through the command, then leaves it", () => {
-    const close = section(ship, /Step 14 — Close Workflow/);
+    const close = section(ship, /Step 12 — Close Workflow/);
     expect(close).toContain('--branch="{SHIP_BRANCH}"');
     expect(close).toContain('cd "{REPO_ROOT}"; exit $rc');
     expect(ship).not.toContain('"{BKIT}" worktrees remove');
@@ -1175,9 +1187,9 @@ describe("ship", () => {
   });
 
   it("brings local dev level through `branches sync-dev`, never a checkout", () => {
-    const step13 = section(ship, /Step 13 — Update Local Dev/);
-    expect(step13).toContain('"{BKIT}" branches sync-dev || exit 1');
-    expect(step13).not.toContain('cd "{REPO_ROOT}"');
+    const step11 = section(ship, /Step 11 — Update Local Dev/);
+    expect(step11).toContain('"{BKIT}" branches sync-dev || exit 1');
+    expect(step11).not.toContain('cd "{REPO_ROOT}"');
   });
 
   it("skill prune warns and carries on rather than stopping the ship", () => {
@@ -1199,7 +1211,7 @@ describe("ship", () => {
   });
 
   it("closes through `workflows close --flush`", () => {
-    const close = section(ship, /Step 14 — Close Workflow/);
+    const close = section(ship, /Step 12 — Close Workflow/);
     expect(close).toContain('"{BKIT}" workflows close --workflow=ship');
     expect(close).toContain('--flush --token="{LOCK_TOKEN}"');
     expect(close).not.toContain("gh pr create");
@@ -2034,10 +2046,14 @@ describe("fix loops ask only when the last round made no progress", () => {
     expect(step3).toContain("`LOOP_POINT` = `soak`, `LOOP_FIX` = `debug-failure-soak`");
   });
 
-  it("ship takes a merge fix round without asking when the diagnosis found the cause", () => {
-    const step11 = section(workflow("ship"), /Step 11 — Failure Diagnose/);
-    expect(step11).toContain("Hold `verdict` as `DIAGNOSE_VERDICT`");
-    expect(step11).toContain("**If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS →");
+  it("ship asks the Merge Question only when the merge attempts are used up", () => {
+    const question = section(workflow("ship"), /Merge Question/);
+    expect(question).toContain("when `ship.merge.maxAttempts` is used up");
+    expect(question).not.toContain("diagnosis");
+    expect(question).not.toContain("Step 11");
+    expect(question).not.toContain("return to the calling step");
+    expect(question).not.toMatch(/`Try again`\s+\*\*and\*\*\s+`LIMIT_NEXT`/);
+    expect(question).toContain("counters grant");
   });
 });
 
diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 0cbc5d32f..b637ec238 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -112,36 +112,15 @@ function pathBStatus(): string {
   ].join("\n");
 }
 
-/** Build a MERGED-on-entry status.jsonl (Step 2 detects MERGED → Step 13). */
+/** Build a MERGED-on-entry status.jsonl (Step 2 detects MERGED → Step 11). */
 function mergedOnEntryStatus(): string {
   return [
     row("ship-start-workflow"),
-    // Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED) — BEFORE sub-step
+    // Step 2 routes to Step 11 at sub-step 5 (`state` = MERGED) — BEFORE sub-step
     // 8 writes ship-worktree-setup + ship-regression-guard, so neither appears.
     // The explicit marker identifies this path.
     JSON.stringify({ type: "ship-merged-on-entry", workflow: "ship", at: "2026-07-29T00:00:00Z" }),
-    // Steps 3–12 skipped entirely — PR was already merged
-    row("ship-switch-to-dev"),
-    row("ship-close-workflow"),
-  ].join("\n");
-}
-
-/** Build a retry-loop Path B status (merge failed, diagnosed, remediated, retried). */
-function retryLoopPathBStatus(): string {
-  return [
-    row("ship-start-workflow"),
-    row("ship-worktree-setup"),
-    row("ship-regression-guard"),
-    row("ship-conflict-resolve", { verdict: "PASS" }),
-    row("ship-deferred-sweep"),
-    row("ship-update-docs"),
-    row("ship-summary"),
-    row("ship-prune-skills"),
-    row("ship-bookkeeping-push"),
-    row("ship-merge-pr", { verdict: "FAIL", attempt: 1, failures: 1 }),
-    row("ship-failure-diagnose", { verdict: "PASS", attempt: 1 }),
-    row("ship-failure-remediate", { verdict: "PASS", attempt: 1, strategy: "STANDARD" }),
-    row("ship-merge-pr", { verdict: "PASS", attempt: 2, failures: 0 }),
+    // Steps 3–10 skipped entirely — PR was already merged
     row("ship-switch-to-dev"),
     row("ship-close-workflow"),
   ].join("\n");
@@ -310,7 +289,7 @@ describe("classifyRun", () => {
     expect(classifyRun(observed, false)).toBe("PATH_B");
   });
 
-  it("classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes)", () => {
+  it("classifies a MERGED-on-entry run (Step 2 routed to Step 11 before its writes)", () => {
     // bkit-ship.md Step 2 routes on `state` = MERGED at sub-step 5, BEFORE
     // sub-step 8 writes ship-worktree-setup + ship-regression-guard — so a real
     // MERGED-on-entry resume carries neither.
@@ -362,20 +341,16 @@ describe("classifyRun", () => {
 describe("computeMandatoryForPath", () => {
   const universe = [...SHIP_STEP_ORDER];
 
-  it("Path A excludes conflict-resolve + retry-loop steps", () => {
+  it("Path A excludes conflict-resolve", () => {
     const mandatory = computeMandatoryForPath("PATH_A", universe);
     expect(mandatory.has("ship-conflict-resolve")).toBe(false);
-    expect(mandatory.has("ship-failure-diagnose")).toBe(false);
-    expect(mandatory.has("ship-failure-remediate")).toBe(false);
     expect(mandatory.has("ship-merge-pr")).toBe(true);
     expect(mandatory.has("ship-close-workflow")).toBe(true);
   });
 
-  it("Path B includes conflict-resolve, excludes retry-loop steps", () => {
+  it("Path B includes conflict-resolve", () => {
     const mandatory = computeMandatoryForPath("PATH_B", universe);
     expect(mandatory.has("ship-conflict-resolve")).toBe(true);
-    expect(mandatory.has("ship-failure-diagnose")).toBe(false);
-    expect(mandatory.has("ship-failure-remediate")).toBe(false);
   });
 
   it("MERGED-on-entry excludes the entire middle", () => {
@@ -484,23 +459,15 @@ describe("detectHoles", () => {
     expect(unexpected).toContain("ship-resume-human-override");
   });
 
-  it("does NOT flag absence of failure-diagnose/remediate (retry-loop steps)", () => {
+  it("detectHoles reports a pre-change run's ship-failure rows as unexpected and no step as missing", () => {
     const observed = new Set([
-      "ship-start-workflow",
-      "ship-worktree-setup",
-      "ship-regression-guard",
-      "ship-deferred-sweep",
-      "ship-update-docs",
-      "ship-summary",
-      "ship-prune-skills",
-      "ship-bookkeeping-push",
-      "ship-merge-pr",
-      "ship-switch-to-dev",
-      "ship-close-workflow",
+      ...universe.filter((step) => step !== "ship-conflict-resolve"),
+      "ship-failure-diagnose",
+      "ship-failure-remediate",
     ]);
-    const { missing } = detectHoles(observed, universe, "PATH_A");
-    expect(missing).not.toContain("ship-failure-diagnose");
-    expect(missing).not.toContain("ship-failure-remediate");
+    const { missing, unexpected } = detectHoles(observed, universe, "PATH_A");
+    expect(missing).toEqual([]);
+    expect(unexpected).toEqual(["ship-failure-diagnose", "ship-failure-remediate"]);
   });
 
   it("aborted run: flags pre-abort holes but not post-abort absences", () => {
@@ -569,11 +536,29 @@ describe("auditStatusJsonl (end-to-end)", () => {
     expect(report.unexpected).toEqual([]);
   });
 
-  it("retry-loop Path B: no holes (failure steps optional)", () => {
-    const report = auditStatusJsonl(retryLoopPathBStatus(), shipMd);
+  it("a pre-change run's ship-failure rows are unexpected against the current ship workflow", () => {
+    const status = [
+      row("ship-start-workflow"),
+      row("ship-worktree-setup"),
+      row("ship-regression-guard"),
+      row("ship-conflict-resolve", { verdict: "PASS" }),
+      row("ship-deferred-sweep"),
+      row("ship-update-docs"),
+      row("ship-summary"),
+      row("ship-prune-skills"),
+      row("ship-bookkeeping-push"),
+      row("ship-merge-pr", { verdict: "FAIL", attempt: 1, failures: 1 }),
+      row("ship-failure-diagnose", { verdict: "PASS", attempt: 1 }),
+      row("ship-failure-remediate", { verdict: "PASS", attempt: 1, strategy: "STANDARD" }),
+      row("ship-merge-pr", { verdict: "PASS", attempt: 2, failures: 0 }),
+      row("ship-switch-to-dev"),
+      row("ship-close-workflow"),
+    ].join("\n");
+    const report = auditStatusJsonl(status, shipMd);
     expect(report.path).toBe("PATH_B");
     expect(report.missing).toEqual([]);
-    expect(report.unexpected).toEqual([]);
+    expect(report.unexpected).toEqual(["ship-failure-diagnose", "ship-failure-remediate"]);
+    expect([...report.sourceUniverse].sort()).toEqual([...SHIP_STEP_ORDER].sort());
   });
 
   it("holey fixture: ship-regression-guard missing surfaces in advisory report", () => {
@@ -755,7 +740,7 @@ describe("step conditionality", () => {
     plan: [8],
     build: [6, 9, 13, 14, 15, 16],
     debug: [4, 5, 6, 7, 8, 9, 10, 11],
-    ship: [4, 11, 12, 13],
+    ship: [4, 11],
   } as const;
 
   it("classifies a step conditional only under the column-0 marker rule", () => {
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index b598e4399..1b4997fb2 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -12,12 +12,10 @@
 // Path-conditional expectations:
 //   - Path A (dev is ancestor): skips ship-conflict-resolve.
 //   - Path B (dev moved): includes ship-conflict-resolve.
-//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 13): skips the entire
+//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 11): skips the entire
 //     middle (base check, integrate, deferred-sweep, the pre-merge docs /
 //     summary / prune / bookkeeping-push steps, merge-pr).
 //   - Aborted (workflow-failed row present): no post-abort holes expected.
-//   - ship-failure-diagnose / ship-failure-remediate are NEVER mandatory — they
-//     appear only in the merge-retry loop.
 //
 // Usage (advisory CI step or manual):
 //   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
@@ -53,22 +51,17 @@ export const SHIP_STEP_ORDER = [
   "ship-prune-skills",
   "ship-bookkeeping-push",
   "ship-merge-pr",
-  "ship-failure-diagnose",
-  "ship-failure-remediate",
   "ship-switch-to-dev",
   "ship-close-workflow",
 ] as const;
 
-/** Steps that appear only in the merge-retry loop — never mandatory, never holes. */
-const RETRY_LOOP_STEPS = new Set<string>(["ship-failure-diagnose", "ship-failure-remediate"]);
-
 /** The step that Path A skips (dev is ancestor → no integration needed). */
 const PATH_B_ONLY_STEPS = new Set<string>(["ship-conflict-resolve"]);
 
 /**
  * The steps a MERGED-on-entry resume skips entirely.
  *
- * bkit-ship.md Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED), which
+ * bkit-ship.md Step 2 routes to Step 11 at sub-step 5 (`state` = MERGED), which
  * is BEFORE sub-step 8 writes `ship-worktree-setup` + `ship-regression-guard` —
  * so those two are absent too, not just the middle. The pre-merge docs,
  * summary, prune and bookkeeping-push steps (6-8) ride the PR, so a PR that is
@@ -84,7 +77,6 @@ const MERGED_ON_ENTRY_SKIP = new Set<string>([
   "ship-prune-skills",
   "ship-bookkeeping-push",
   "ship-merge-pr",
-  // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
 ]);
 
 // ---------------------------------------------------------------------------
@@ -967,20 +959,16 @@ export function computeMandatoryForPath(path: RunPath, sourceUniverse: string[])
 
   switch (path) {
     case "PATH_A":
-      // Skip conflict-resolve + retry-loop steps
-      return new Set(
-        [...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s) && !RETRY_LOOP_STEPS.has(s)),
-      );
+      // Skip conflict-resolve
+      return new Set([...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s)));
 
     case "PATH_B":
-      // Include conflict-resolve, skip retry-loop steps
-      return new Set([...universe].filter((s) => !RETRY_LOOP_STEPS.has(s)));
+      // Include conflict-resolve
+      return new Set(universe);
 
     case "MERGED_ON_ENTRY":
-      // Skip the entire middle + retry-loop steps
-      return new Set(
-        [...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)),
-      );
+      // Skip the entire middle
+      return new Set([...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s)));
 
     case "COMPLETED":
       // Non-ship runs derive their mandatory set from the contract (auditRun)
@@ -1029,8 +1017,8 @@ export function detectHoles(
     if (lastObservedIdx < 0) return { missing: [], unexpected };
 
     // For aborted runs, expected = everything before the last step, minus
-    // retry-loop steps and minus conflict-resolve (unless it was observed)
-    const skipSet = new Set<string>([...RETRY_LOOP_STEPS]);
+    // conflict-resolve (unless it was observed)
+    const skipSet = new Set<string>();
     if (!observed.has("ship-conflict-resolve")) skipSet.add("ship-conflict-resolve");
 
     const missing: string[] = [];
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 75bb8b1dc..357faee30 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -2707,7 +2707,7 @@ function syncVerb(ctx: RunContext): number {
 }
 
 /**
- * Ship Step 13: after the merge, bring local dev up to origin/dev by a pure
+ * Ship Step 11: after the merge, bring local dev up to origin/dev by a pure
  * fast-forward without checking anything out, then a frozen install when the
  * main checkout is on dev and moved. Never pushes.
  */
diff --git a/.bkit/core/engine/commands/workflow/progress.integration.test.ts b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
index c3a3f6680..638facf47 100644
--- a/.bkit/core/engine/commands/workflow/progress.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
@@ -311,9 +311,9 @@ describe("workflow progress command wiring", () => {
         point: "ship.merge",
         title: "Merge Gate + Merge PR",
         number: 10,
-        total: 14,
-        percent: 71,
-        bar: "███████░░░",
+        total: 12,
+        percent: 83,
+        bar: "████████░░",
       },
       {
         workflow: "build",
@@ -384,7 +384,7 @@ describe("workflow progress command wiring", () => {
     }
   });
 
-  it("progress specialized completion producers", async () => {
+  it("workflow progress command wiring progress specialized completion producers", async () => {
     const contextCwd = repo("debug");
     write(contextCwd, ".agents/context.md", "# Context\n<!-- bkit:end -->\n");
     write(contextCwd, `${LOG}/context-related-1.md`, "No related issues.\n");
@@ -468,7 +468,7 @@ describe("workflow progress command wiring", () => {
     expect(flushed.code).toBe(0);
     expect
       .soft(flushed.json.progressLine)
-      .toBe("Progress: ██████████ 100% · Step 14/14 Close Workflow");
+      .toBe("Progress: ██████████ 100% · Step 12/12 Close Workflow");
     expect(flushed.out).toHaveLength(1);
     expect(fs.existsSync(ship.worktree)).toBe(false);
     const landed = git(ship.remote, "show", `dev:${STATUS}`)
@@ -477,7 +477,7 @@ describe("workflow progress command wiring", () => {
     expect(landed.filter((row) => row.step === "ship-close-workflow")).toHaveLength(1);
   });
 
-  it("progress accepts the ship base-check regression guard gate", async () => {
+  it("workflow progress command wiring progress accepts the ship base-check regression guard gate", async () => {
     const cwd = repo("ship");
     fs.appendFileSync(
       path.join(cwd, STATUS),
@@ -494,11 +494,11 @@ describe("workflow progress command wiring", () => {
       "--placeholder=BASE_PATH=A",
     ]);
     expect(result.code).toBe(0);
-    expect(result.json?.progressLine).toBe("Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check");
+    expect(result.json?.progressLine).toBe("Progress: ███░░░░░░░ 25% · Step 3/12 Base Check");
     expect(domainRows(cwd)).toEqual(before);
   });
 
-  it("progress gate only completions", async () => {
+  it("workflow progress command wiring progress gate only completions", async () => {
     vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
     vi.stubEnv("GIT_EXEC_PATH", "");
     const cwd = repo("ship");
@@ -507,8 +507,8 @@ describe("workflow progress command wiring", () => {
     fs.appendFileSync(path.join(cwd, STATUS), jsonl([setup, book]));
     const before = domainRows(cwd);
     for (const [step, number, expected] of [
-      ["ship-worktree-setup", "3", "Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check"],
-      ["ship-bookkeeping-push", "9", "Progress: ██████░░░░ 64% · Step 9/14 Re-validate"],
+      ["ship-worktree-setup", "3", "Progress: ███░░░░░░░ 25% · Step 3/12 Base Check"],
+      ["ship-bookkeeping-push", "9", "Progress: ████████░░ 75% · Step 9/12 Re-validate"],
     ]) {
       const result = await run(cwd, [
         "steps",
diff --git a/.bkit/core/engine/commands/workflow/step-table.test.ts b/.bkit/core/engine/commands/workflow/step-table.test.ts
index 60b9b35fe..37e9653c1 100644
--- a/.bkit/core/engine/commands/workflow/step-table.test.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.test.ts
@@ -58,10 +58,10 @@ const setUp = (workflow: ResumableWorkflow) => [
 ];
 
 describe("workflow progress", () => {
-  it("runProgress flat workflow", () => {
+  it("workflow progress runProgress flat workflow", () => {
     expect(runProgress({ workflow: "ship", step: "ship-merge-pr" })).toMatchObject({
-      percent: 71,
-      progressLine: "Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR",
+      percent: 83,
+      progressLine: "Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR",
     });
   });
 
@@ -116,8 +116,8 @@ describe("workflow progress", () => {
     }
   });
 
-  it("runProgress all workflow numbers", () => {
-    const totals = { design: 12, plan: 8, build: 16, debug: 11, ship: 14 };
+  it("workflow progress runProgress all workflow numbers", () => {
+    const totals = { design: 12, plan: 8, build: 16, debug: 11, ship: 12 };
     for (const workflow of Object.keys(totals) as ResumableWorkflow[]) {
       for (const position of WORKFLOW_STEPS[workflow]) {
         const result = runProgress({ workflow, number: position.number });
@@ -128,10 +128,10 @@ describe("workflow progress", () => {
       }
     }
     expect(runProgress({ workflow: "ship", number: 3 }).progressLine).toBe(
-      "Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check",
+      "Progress: ███░░░░░░░ 25% · Step 3/12 Base Check",
     );
     expect(runProgress({ workflow: "ship", number: 9 }).progressLine).toBe(
-      "Progress: ██████░░░░ 64% · Step 9/14 Re-validate",
+      "Progress: ████████░░ 75% · Step 9/12 Re-validate",
     );
     expect(runProgress({ workflow: "build", step: "build-plan-tests" }).percent).toBe(
       runProgress({ workflow: "build", step: "build-plan-tasks" }).percent,
@@ -152,15 +152,15 @@ describe("workflow progress", () => {
     expect(empty).toEqual(missing);
   });
 
-  it("runProgress attempt suffix", () => {
+  it("workflow progress runProgress attempt suffix", () => {
     expect(
       runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 1, max: 3 }).progressLine,
-    ).toBe("Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR");
+    ).toBe("Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR");
     expect(
       runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2, max: 3 }).progressLine,
-    ).toBe("Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3");
+    ).toBe("Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR · Attempt 2 of 3");
     expect(runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2 }).progressLine).toBe(
-      "Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2",
+      "Progress: ████████░░ 83% · Step 10/12 Merge Gate + Merge PR · Attempt 2",
     );
   });
 
@@ -294,17 +294,18 @@ describe("bkit status resume", () => {
     });
   });
 
-  it.each([
-    ["PASS", { step: "ship-failure-remediate", number: 12, after: "ship-failure-remediate" }],
-    ["FAIL", { step: "ship-merge-pr", number: 10, after: "ship-failure-remediate" }],
-  ])("a ship failure-remediate %s row resumes at %o", async (verdict, expected) => {
+  it("bkit status resume ignores ship rows for the removed failure steps", async () => {
     const file = log([
       ...setUp("ship"),
       done("ship", "ship-merge-pr"),
       done("ship", "ship-failure-diagnose"),
-      done("ship", "ship-failure-remediate", { verdict }),
+      done("ship", "ship-failure-remediate", { verdict: "PASS" }),
     ]);
-    expect((await resume("ship", file)).json).toMatchObject(expected);
+    expect((await resume("ship", file)).json).toMatchObject({
+      step: "ship-merge-pr",
+      number: 10,
+      after: "ship-merge-pr",
+    });
   });
 
   it("a retry decision with no loop row before it places no resume point", async () => {
diff --git a/.bkit/core/engine/commands/workflow/step-table.ts b/.bkit/core/engine/commands/workflow/step-table.ts
index 9d199831a..3436db7c9 100644
--- a/.bkit/core/engine/commands/workflow/step-table.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.ts
@@ -176,25 +176,15 @@ export const WORKFLOW_STEPS: Readonly<Record<ResumableWorkflow, readonly Workflo
     { step: "ship-prune-skills", number: 7, title: "Prune Skills" },
     { step: "ship-bookkeeping-push", number: 8, title: "Commit + Push Bookkeeping" },
     { number: 9, title: "Re-validate" },
-    // The merge gate reads the PR state again: a merged PR goes on to Step 13.
+    // The merge gate reads the PR state again: a merged PR goes on to Step 11.
     {
       step: "ship-merge-pr",
       number: 10,
       title: "Merge Gate + Merge PR",
       resumeAt: "ship-merge-pr",
     },
-    { step: "ship-failure-diagnose", number: 11, title: "Failure Diagnose" },
-    // A PASS fix is committed and pushed at Step 12 sub-step 4 (a re-run commits nothing
-    // new), then re-validated at Step 9; any other verdict re-reads the PR at Step 10.
-    {
-      step: "ship-failure-remediate",
-      number: 12,
-      title: "Failure Remediate",
-      resumeAt: "ship-merge-pr",
-      resumeOnVerdict: { PASS: "ship-failure-remediate" },
-    },
-    { step: "ship-switch-to-dev", number: 13, title: "Update Local Dev" },
-    { step: "ship-close-workflow", number: 14, title: "Close Workflow" },
+    { step: "ship-switch-to-dev", number: 11, title: "Update Local Dev" },
+    { step: "ship-close-workflow", number: 12, title: "Close Workflow" },
   ],
 };
 
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 82744a2d2..a3531d7c5 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -903,7 +903,7 @@ describe("bkit steps gate checks attempt / strategy / scope where the step write
   });
 
   it("names every missing field at once", async () => {
-    const r = await rowThenGate("ship", "ship-failure-remediate", []);
+    const r = await rowThenGate("build", "build-failure-remediate", []);
     expect(r.err).toContain("row is missing attempt, strategy");
   });
 
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 5df738b8c..935e38ea3 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -425,8 +425,6 @@ export const ROW_FIELDS: Record<string, readonly RowField[]> = {
   "debug/debug-summary": ["attempt"],
   "ship/ship-summary": ["attempt"],
   "ship/ship-merge-pr": ["attempt"],
-  "ship/ship-failure-diagnose": ["attempt"],
-  "ship/ship-failure-remediate": ["attempt", "strategy"],
 };
 
 /** The required fields missing (absent or empty) from a row. */
@@ -480,11 +478,7 @@ function progressPoint(workflow: string, step: string, soak: boolean): AskPoint
     if (["debug-run-tests", "debug-failure-diagnose", "debug-failure-remediate"].includes(step))
       return "debug.fix";
   }
-  if (
-    workflow === "ship" &&
-    ["ship-merge-pr", "ship-failure-diagnose", "ship-failure-remediate"].includes(step)
-  )
-    return "ship.merge";
+  if (workflow === "ship" && ["ship-merge-pr"].includes(step)) return "ship.merge";
   return undefined;
 }
 
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index ad09bb51f..e95fcaf90 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -3125,14 +3125,14 @@ describe("bkit workflows summary", () => {
     `# Plan\n\n<!-- bkit:group 1 start -->\n### GROUP 1: Work\n${tasks.join("\n")}\n<!-- bkit:group 1 end -->\n`;
 
   /** A github-tracked tree with one build run's status rows. */
-  function tree(steps: object[], plan?: string) {
+  function tree(steps: object[], plan?: string, workflow = "build") {
     const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-summary-")));
     dirs.push(cwd);
     write(cwd, "package.json", JSON.stringify({ bkit: { tracker: { default: "github" } } }));
     write(
       cwd,
       `${SREL}/status.jsonl`,
-      jsonl([{ type: "workflow-started", workflow: "build", at: START }, ...steps]),
+      jsonl([{ type: "workflow-started", workflow, at: START }, ...steps]),
     );
     if (plan !== undefined) write(cwd, `docs/plans/${M}/${SFID}-plan.md`, plan);
     return cwd;
@@ -3167,6 +3167,27 @@ describe("bkit workflows summary", () => {
     expect((await run(cwd, [...base, "--publish=maybe"])).code).toBe(2);
   });
 
+  it("lists ship-failure rows from a run started before their removal", async () => {
+    const cwd = tree(
+      [
+        done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" }),
+        done("ship-failure-diagnose", "2020-01-01T00:11:00Z", { workflow: "ship" }),
+        done("ship-failure-remediate", "2020-01-01T00:12:00Z", {
+          workflow: "ship",
+          verdict: "PASS",
+          strategy: "STANDARD",
+        }),
+      ],
+      undefined,
+      "ship",
+    );
+    const r = await summarize(cwd, "ship");
+    expect(r.code).toBe(0);
+    const md = fs.readFileSync(path.join(cwd, SREL, "ship-summary.md"), "utf-8");
+    expect(md).toContain("ship-failure-diagnose");
+    expect(md).toContain("ship-failure-remediate");
+  });
+
   it("summary is FAIL when a plan task is not done", async () => {
     const cwd = tree(
       [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 085312216..bd513a73e 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -45,16 +45,16 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 _No tracker connected, skip step._
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -81,7 +81,7 @@ _No tracker connected, skip step._
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -241,7 +241,7 @@ _No tracker connected, skip step._
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -687,7 +687,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -705,7 +705,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -720,12 +720,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -742,11 +740,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -769,102 +766,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -873,7 +792,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    Hold `head` as `SQUASH_SHA`.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -881,7 +800,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index e50dde25a..92e7725a9 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -45,11 +45,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 <!-- bkit:tracker github start -->
@@ -79,7 +79,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 <!-- bkit:tracker true end -->
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -108,7 +108,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -321,7 +321,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -774,7 +774,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -792,7 +792,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -807,12 +807,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -829,11 +827,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -856,102 +853,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -963,7 +882,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    <!-- bkit:tracker true end -->
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -978,7 +897,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 2d9533455..69c2d9b0e 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -4991,7 +4991,7 @@ Query each ledger with `bkit ledgers query --ledger=<name>`, which folds by `key
 ### result-path-cleared
 
 - workflow: repeatable
-- carriers: workflow all except `bkit-auto`
+- carriers: workflow all except `bkit-auto`, `bkit-ship`
 
 ```text
 Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
@@ -5801,7 +5801,7 @@ Stop here instead of trying one more set of attempts?`
 ### workflow-try-again-return
 
 - workflow: where-used
-- carriers: workflow `bkit-debug`, `bkit-ship`
+- carriers: workflow `bkit-debug`
 
 ```text
 **If** the answer is `Try again` → return to the calling step.
@@ -7013,7 +7013,7 @@ Read the strategy the diagnosis was written for:
 ### workflow-round-read-back
 
 - workflow: repeatable
-- carriers: workflow `bkit-build`, `bkit-ship`
+- carriers: workflow `bkit-build`
 
 ```text
 **If** `{{attempt}}` is not held (resumed into this step) → read the {{round}} round back:
@@ -7026,7 +7026,7 @@ Read the strategy the diagnosis was written for:
 ### workflow-strategy-held
 
 - workflow: repeatable
-- carriers: workflow `bkit-build`, `bkit-debug`, `bkit-ship`
+- carriers: workflow `bkit-build`, `bkit-debug`
 
 ```text
 `nextStrategy` as `STRATEGY`.
@@ -10576,7 +10576,6 @@ Find the branch's PR — open first, then merged:
 **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
 Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
-**If** `state` = MERGED → record the resume marker → Step 13:
 **Else** → next sub-step.
 Read the PR's head SHA:
 [honest-reporting] **If** `SHIP_OPENED_PR` = true → wait for CI on the new PR first, then assert its check rollup green:
@@ -10645,31 +10644,16 @@ Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated he
 **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
 **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
 [integration-merge] Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired<!-- bkit:tracker true start --> or `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
-**If** `state` = MERGED → Step 13.
 Merge gate asserted (`runs gate`)
 Failed arrivals counted against `ship.merge.maxAttempts` (`counters route`)
 Used-up merge step sent to the **Merge Question** in a session, or to the Failure Path
 A red CI run regenerated only when every failed step is a generated file (`branches regenerate`)
 PR merge attempted (`prs merge`)
 Ask the human in this session, in plain text, in one message:
-`ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-**Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
 `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
-**If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
 Asked only in a session with `ship.merge.ask` = true
 Wait and reply recorded (`status row`)
 Used-up limit given one more allowance only on `Try again` (`counters grant`)
-Ask before the fix round only when the diagnosis found no clear cause.
-**If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-**Else** → **Merge Question** → Step 12.
-Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-Derive the next strategy rung from `{STATUS}`:
-Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-Route on `verdict`:
-**If** `verdict` = PASS:
-Commit and push the fix, and NEVER force:
-Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-Fix committed and pushed
 Fast-forward local `dev` to `origin/dev`, then finish:
 Local `dev` synced (`branches sync-dev`)
 Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
@@ -10701,9 +10685,12 @@ Hold the same route, reason, verdict, failures and state as the gh-backed result
 **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
 **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
 **Else** → **Failure Path** on exhaustion.
-**Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
 Guarded cleanup and retained paths/refs reported, back in the repo root
+**If** `state` = MERGED → record the resume marker → Step 11:
+**If** `state` = MERGED → Step 11.
+**Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+**If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
 ```
 
 ### Prompts
diff --git a/.bkit/version b/.bkit/version
index 0d3bc0178..79bf5282c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -19,7 +19,7 @@
     ".claude/commands/bkit-debug.md": "374d4520e78a4421fa1e3227e3c5e184feb08706b2aaafdc290c6e0835c78333",
     ".claude/commands/bkit-design.md": "19fc3688e1f0063c2ff02b61921c6c3153f5d3892eb08c812643507539f8790a",
     ".claude/commands/bkit-plan.md": "21e65d37fb3fede54a1edbb0d6a71e589178a0d6991b007b24770aedf818afde",
-    ".claude/commands/bkit-ship.md": "83fe28b8c8777339d8cd7d1faa8528ed5d4804de187409fd11469c35cbcee5d7",
+    ".claude/commands/bkit-ship.md": "cd5d74a47ab60997bd3febe65058f6104a0444ae7676e87827d87d6065c06f13",
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
@@ -51,7 +51,7 @@
     ".cursor/commands/bkit-debug.md": "0c431c1245effbc9d70ab3d928cc739c8c6eb72807c6afcf51889dd16c2b83f6",
     ".cursor/commands/bkit-design.md": "50503d506d3be97b176612647f202e4428e43446a3e29c9f63c931ebdc32f2c1",
     ".cursor/commands/bkit-plan.md": "3ce05ec47616b860b785c128c5a80e3e81dda9951d84744a8f8c93063c3a91ed",
-    ".cursor/commands/bkit-ship.md": "dab8baaa8628fa12169af91a4afe0acd7ed110661a3b3f77da699a727b348631",
+    ".cursor/commands/bkit-ship.md": "34039286cfd30515dbcabdc2b0de3168ed02a835b317821b7804dcebaed65b05",
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
@@ -109,7 +109,7 @@
     ".opencode/commands/bkit-debug.md": "22160c578bd2f06c9e674fe524accae793a977d206185814d04ccd99e75bbc6d",
     ".opencode/commands/bkit-design.md": "43ef687878db97f39336b4e91ffe1adb845048999b5b686864898b4cc58a09a7",
     ".opencode/commands/bkit-plan.md": "afd4b5bb5a1c7d14ec9d4257ebe2f415e57c2e6ad625ec8c993c429acc886a42",
-    ".opencode/commands/bkit-ship.md": "047e1a1793d0a7d3b6ebb96e4226582f99abe3373bbd6a55162b77a08b81170f",
+    ".opencode/commands/bkit-ship.md": "c1d9cbcd11e7ea6cd6fd628080f514b396383b8f2a2e9078dbbdb88b8d9a546d",
     ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
     ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
     ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index b6a1fba6c..eeef0674e 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -46,11 +46,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 
@@ -62,7 +62,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -89,7 +89,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -276,7 +276,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -727,7 +727,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -745,7 +745,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -760,12 +760,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -782,11 +780,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -809,102 +806,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `@bkit-debug-failure-remediate` using `Agent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -914,7 +833,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -927,7 +846,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index b6edd28cb..7fb73e330 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -45,11 +45,11 @@ Ship Feature — Autonomous merge and archive
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 
@@ -61,7 +61,7 @@ Ship Feature — Autonomous merge and archive
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -88,7 +88,7 @@ Ship Feature — Autonomous merge and archive
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `Task` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -275,7 +275,7 @@ Ship Feature — Autonomous merge and archive
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -726,7 +726,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -744,7 +744,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -759,12 +759,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -781,11 +779,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -808,102 +805,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `/bkit-debug-failure-diagnose` using `Task` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `/bkit-debug-failure-remediate` using `Task` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -913,7 +832,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -926,7 +845,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 5b1a1ce01..51408ebb8 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -49,11 +49,11 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
-- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
+- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 12 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
-- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 14 ends in `{REPO_ROOT}`.
+- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → Step 2 `cd`s into `.worktrees/{FID}`. **Else** → adopt current branch in place, `WORKTREE_PATH=$REPO_ROOT`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**; Step 12 ends in `{REPO_ROOT}`.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 
@@ -65,7 +65,7 @@ $ARGUMENTS
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
+- **Limits:** `bkit.workflows.ship.merge` holds `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below. One count covers every failed arrival at the merge step — a merge-gate refusal (`ship-gate-refusal` rows, the regenerate round's red CI run included) or a failed merge (`ship-merge-pr` rows). Merge attempts used up with `ask` = true and not headless → the **Merge Question**, where `Try again` gives the merge step one more full allowance (`bkit counters grant`) and it asks again once that allowance is used up too; `ask` = false, or headless → **Failure Path**. Within the limit, ship never asks. Assumed items from build are asked once, at **Confirm Assumed Items**, whatever `ship.merge.ask` says.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -92,7 +92,7 @@ $ARGUMENTS
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `subagent` tool:
    Context: You are a subagent in the Ship Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-*-log.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
+   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md` (if present), `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md`.
 5. **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
    Flush the run's book to `dev` as one commit and one push. **Skip if** `FID` **or** `YYYYMM` is empty. Drop `--worktree` when `WORKTREE_PATH` is not set:
@@ -279,7 +279,7 @@ $ARGUMENTS
    - **Else** → **Failure Path**.
 
 3. Route:
-   - **If** `state` = MERGED → record the resume marker → Step 13:
+   - **If** `state` = MERGED → record the resume marker → Step 11:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-merged-on-entry >/dev/null
      ```
@@ -730,7 +730,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
-   - **If** `state` = MERGED → Step 13.
+   - **If** `state` = MERGED → Step 11.
    - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -748,7 +748,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path** on exhaustion.
-   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -763,12 +763,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
 ## 🤖 Merge Question
 
-Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held) and from Step 11 before a fix round the diagnosis found no clear cause. State the failure in plain English before the technical cause.
+Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held). State the failure in plain English before the technical cause.
 
 1. Ask the human in this session, in plain text, in one message:
-   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then the first question that matches:
-     - **If** `LIMIT_NEXT` is held → `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-     - **Else** → `**Q1 — Merge:** failed, and the diagnosis found no clear cause ({the diagnosis in one line}). Stop here instead of a fix round?`
+   - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
    - End the message with the line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 
@@ -785,11 +783,10 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` **and** `LIMIT_NEXT` is held → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
-   - **If** the answer is `Try again` → return to the calling step.
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
@@ -812,102 +809,24 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 ---
 
-## 🧠 Step 11 — Failure Diagnose
-
-**Run only if** `state` != MERGED.
-
-1. **Subagent:** Invoke `/bkit-debug-failure-diagnose` using `subagent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Result: `{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
-   Once the diagnosing agent has answered, render the merge-failure diagnosis from its result:
-   ```bash
-   "{BKIT}" steps stub --agent=bkit-debug-failure-diagnose --result-file="{OUTBOX}/ship-failure-diagnose-{MERGE_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md"
-   ```
-2. Finish (bookkeeping to `$BOOK_ROOT`):
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-diagnose --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-<attempt>.md" --commit=none --number=11 --post --title="Failure Diagnose"
-   ```
-   Hold `verdict` as `DIAGNOSE_VERDICT`.
-3. Ask before the fix round only when the diagnosis found no clear cause.
-   **If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS → narrate `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}, fix round taken without asking ({the diagnosed cause})` → Step 12.
-   **Else** → **Merge Question** → Step 12.
-
-### 🔒 Gate 11 — Failure Diagnose
-
-- [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix round asked only with `ask` = true, not headless, and a diagnosis verdict other than PASS
-
----
-
-## 🧠 Step 12 — Failure Remediate
-
-**Run only if** `state` != MERGED.
-
-1. Derive the next strategy rung from `{STATUS}`:
-   ```bash
-   "{BKIT}" status route --file="{STATUS}" --workflow=ship --step=ship-failure-remediate --require=strategy
-   ```
-   Hold `nextStrategy` as `STRATEGY`.
-2. **Subagent:** Invoke `/bkit-debug-failure-remediate` using `subagent` tool:
-   Context: You are a subagent in the Ship Debug phase. Merge failure during Ship workflow. `Strategy`: `{STRATEGY}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `{STATUS}`, `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-diagnose-{MERGE_ATTEMPT}.md`.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-{MERGE_ATTEMPT}-log.md`.
-3. Finish (bookkeeping to `$BOOK_ROOT`), which records the header's `Strategy`:
-   ```bash
-   "{BKIT}" steps finish --workflow=ship --step=ship-failure-remediate --file="{STATUS}" --attempt-of=ship-merge-pr:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-failure-remediate-<attempt>-log.md" --commit=none --number=12 --post --title="Failure Remediate"
-   ```
-4. Route on `verdict`:
-   - **If** `verdict` = PASS:
-     - **If** `MERGE_ATTEMPT` is not held (resumed into this step) → read the merge round back:
-       ```bash
-       "{BKIT}" counters derive --file="{STATUS}" --workflow=ship --step=ship-merge-pr --position=current
-       ```
-       Hold `value` as `MERGE_ATTEMPT`.
-     - Commit and push the fix, and NEVER force:
-
-       ```bash
-       "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
-         || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
-       "{BKIT}" branches push --mode=plain >/dev/null
-       ```
-
-       Route:
-       - **If** exit 81 → end turn, re-run this block.
-       - **If** exit 0 → continue with the next instruction.
-       - **Else** → **Failure Path**.
-
-     - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
-   - **Else** → **Failure Path**.
-
-### 🔒 Gate 12 — Failure Remediate
-
-- [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
-- [ ] Mechanical checks passed (`steps finish`)
-- [ ] Fix committed and pushed
-
----
-
-## 🤖 Step 13 — Update Local Dev
+## 🤖 Step 11 — Update Local Dev
 
 **Run only if** `state` = MERGED.
 
 1. Fast-forward local `dev` to `origin/dev`, then finish:
    ```bash
    "{BKIT}" branches sync-dev || exit 1
-   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=13 --post --title="Update Local Dev" --tree=dev
+   "{BKIT}" steps finish --workflow=ship --step=ship-switch-to-dev --file="{STATUS}" --commit=none --number=11 --post --title="Update Local Dev" --tree=dev
    ```
 
-### 🔒 Gate 13 — Update Local Dev
+### 🔒 Gate 11 — Update Local Dev
 
 - [ ] Local `dev` synced (`branches sync-dev`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🤖 Step 14 — Close Workflow
+## 🤖 Step 12 — Close Workflow
 
 1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
    ```bash
@@ -917,7 +836,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
-   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
+   "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
    ```
    Hold `landed.via` as `CLOSE_VIA`, `finalReturn` as `FINAL_RETURN`.
@@ -930,7 +849,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 4. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP**.
 5. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 14 — Close Workflow
+### 🔒 Gate 12 — Close Workflow
 
 ```bash
 "{BKIT}" steps gate --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl" --ref=origin/dev --workflow=ship --step=ship-close-workflow
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index c2948468c..a39cd9cec 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -12,12 +12,10 @@
 // Path-conditional expectations:
 //   - Path A (dev is ancestor): skips ship-conflict-resolve.
 //   - Path B (dev moved): includes ship-conflict-resolve.
-//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 13): skips the entire
+//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 11): skips the entire
 //     middle (base check, integrate, deferred-sweep, the pre-merge docs /
 //     summary / prune / bookkeeping-push steps, merge-pr).
 //   - Aborted (workflow-failed row present): no post-abort holes expected.
-//   - ship-failure-diagnose / ship-failure-remediate are NEVER mandatory — they
-//     appear only in the merge-retry loop.
 //
 // Usage (advisory CI step or manual):
 //   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
@@ -48,19 +46,15 @@ export const SHIP_STEP_ORDER = [
     "ship-prune-skills",
     "ship-bookkeeping-push",
     "ship-merge-pr",
-    "ship-failure-diagnose",
-    "ship-failure-remediate",
     "ship-switch-to-dev",
     "ship-close-workflow",
 ];
-/** Steps that appear only in the merge-retry loop — never mandatory, never holes. */
-const RETRY_LOOP_STEPS = new Set(["ship-failure-diagnose", "ship-failure-remediate"]);
 /** The step that Path A skips (dev is ancestor → no integration needed). */
 const PATH_B_ONLY_STEPS = new Set(["ship-conflict-resolve"]);
 /**
  * The steps a MERGED-on-entry resume skips entirely.
  *
- * bkit-ship.md Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED), which
+ * bkit-ship.md Step 2 routes to Step 11 at sub-step 5 (`state` = MERGED), which
  * is BEFORE sub-step 8 writes `ship-worktree-setup` + `ship-regression-guard` —
  * so those two are absent too, not just the middle. The pre-merge docs,
  * summary, prune and bookkeeping-push steps (6-8) ride the PR, so a PR that is
@@ -76,7 +70,6 @@ const MERGED_ON_ENTRY_SKIP = new Set([
     "ship-prune-skills",
     "ship-bookkeeping-push",
     "ship-merge-pr",
-    // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
 ]);
 /**
  * Step rows an engine verb writes itself, keyed by noun + verb: `tests red` writes the
@@ -755,14 +748,14 @@ export function computeMandatoryForPath(path, sourceUniverse) {
     const universe = new Set(sourceUniverse);
     switch (path) {
         case "PATH_A":
-            // Skip conflict-resolve + retry-loop steps
-            return new Set([...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s) && !RETRY_LOOP_STEPS.has(s)));
+            // Skip conflict-resolve
+            return new Set([...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s)));
         case "PATH_B":
-            // Include conflict-resolve, skip retry-loop steps
-            return new Set([...universe].filter((s) => !RETRY_LOOP_STEPS.has(s)));
+            // Include conflict-resolve
+            return new Set(universe);
         case "MERGED_ON_ENTRY":
-            // Skip the entire middle + retry-loop steps
-            return new Set([...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)));
+            // Skip the entire middle
+            return new Set([...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s)));
         case "COMPLETED":
             // Non-ship runs derive their mandatory set from the contract (auditRun)
             return new Set(universe);
@@ -800,8 +793,8 @@ export function detectHoles(observed, sourceUniverse, path) {
         if (lastObservedIdx < 0)
             return { missing: [], unexpected };
         // For aborted runs, expected = everything before the last step, minus
-        // retry-loop steps and minus conflict-resolve (unless it was observed)
-        const skipSet = new Set([...RETRY_LOOP_STEPS]);
+        // conflict-resolve (unless it was observed)
+        const skipSet = new Set();
         if (!observed.has("ship-conflict-resolve"))
             skipSet.add("ship-conflict-resolve");
         const missing = [];
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 154e91915..b07cd066c 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -2240,7 +2240,7 @@ function syncVerb(ctx) {
     return EXIT.OK;
 }
 /**
- * Ship Step 13: after the merge, bring local dev up to origin/dev by a pure
+ * Ship Step 11: after the merge, bring local dev up to origin/dev by a pure
  * fast-forward without checking anything out, then a frozen install when the
  * main checkout is on dev and moved. Never pushes.
  */
diff --git a/dist/commands/workflow/step-table.js b/dist/commands/workflow/step-table.js
index e67443893..8d10335b6 100644
--- a/dist/commands/workflow/step-table.js
+++ b/dist/commands/workflow/step-table.js
@@ -156,25 +156,15 @@ export const WORKFLOW_STEPS = {
         { step: "ship-prune-skills", number: 7, title: "Prune Skills" },
         { step: "ship-bookkeeping-push", number: 8, title: "Commit + Push Bookkeeping" },
         { number: 9, title: "Re-validate" },
-        // The merge gate reads the PR state again: a merged PR goes on to Step 13.
+        // The merge gate reads the PR state again: a merged PR goes on to Step 11.
         {
             step: "ship-merge-pr",
             number: 10,
             title: "Merge Gate + Merge PR",
             resumeAt: "ship-merge-pr",
         },
-        { step: "ship-failure-diagnose", number: 11, title: "Failure Diagnose" },
-        // A PASS fix is committed and pushed at Step 12 sub-step 4 (a re-run commits nothing
-        // new), then re-validated at Step 9; any other verdict re-reads the PR at Step 10.
-        {
-            step: "ship-failure-remediate",
-            number: 12,
-            title: "Failure Remediate",
-            resumeAt: "ship-merge-pr",
-            resumeOnVerdict: { PASS: "ship-failure-remediate" },
-        },
-        { step: "ship-switch-to-dev", number: 13, title: "Update Local Dev" },
-        { step: "ship-close-workflow", number: 14, title: "Close Workflow" },
+        { step: "ship-switch-to-dev", number: 11, title: "Update Local Dev" },
+        { step: "ship-close-workflow", number: 12, title: "Close Workflow" },
     ],
 };
 /**
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 06e5aa4ea..1063d1051 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -319,8 +319,6 @@ export const ROW_FIELDS = {
     "debug/debug-summary": ["attempt"],
     "ship/ship-summary": ["attempt"],
     "ship/ship-merge-pr": ["attempt"],
-    "ship/ship-failure-diagnose": ["attempt"],
-    "ship/ship-failure-remediate": ["attempt", "strategy"],
 };
 /** The required fields missing (absent or empty) from a row. */
 export function missingRowFields(workflow, step, row) {
@@ -363,8 +361,7 @@ function progressPoint(workflow, step, soak) {
         if (["debug-run-tests", "debug-failure-diagnose", "debug-failure-remediate"].includes(step))
             return "debug.fix";
     }
-    if (workflow === "ship" &&
-        ["ship-merge-pr", "ship-failure-diagnose", "ship-failure-remediate"].includes(step))
+    if (workflow === "ship" && ["ship-merge-pr"].includes(step))
         return "ship.merge";
     return undefined;
 }
