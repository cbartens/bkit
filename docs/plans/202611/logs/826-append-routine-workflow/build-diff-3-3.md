diff --git a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
index 84be05ccd..d90cad828 100644
--- a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
@@ -40,12 +40,13 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 **Rules:** Copied word for word from `.agents/rules.md`.
@@ -59,7 +60,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
 2. **Skip if** `ISSUE_ID` empty. Add `bkit:failed` (prior phase label persists, additive):
    ```bash
@@ -90,7 +91,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
    Hold `phase` as `PHASE`, `mode` as `MODE`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `issueId` as `ISSUE_ID`, `fid` as `FID`, `prNumber` as `PR_NUMBER`, `branch` as `BRANCH`, `headSha` as `HEAD_SHA`, `prUrl` as `PR_URL`, `runId` as `RUN_ID`, `ref` as `REF` (`null` → empty).
 4. Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -103,6 +104,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -110,7 +112,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
@@ -126,5 +128,6 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 49bf9bf3c..2aec4f9ce 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -54,7 +54,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -340,7 +340,7 @@ description: "Build Feature — Autonomous implementation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -350,6 +350,7 @@ description: "Build Feature — Autonomous implementation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -382,7 +383,7 @@ description: "Build Feature — Autonomous implementation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1120,14 +1121,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1188,10 +1189,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
-7. **Skip if** `ISSUE_ID` empty. Comment:
+7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
    "{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 97cbba40a..7908c82fd 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -53,7 +53,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -231,7 +231,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -241,6 +241,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -272,7 +273,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -804,7 +805,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 10. **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
diff --git a/.agents/plugins/bkit/skills/bkit-design/SKILL.md b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
index 96b863e73..8b56f8ece 100644
--- a/.agents/plugins/bkit/skills/bkit-design/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
@@ -51,7 +51,7 @@ description: "Design Feature — Autonomous design phase"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -136,7 +136,7 @@ description: "Design Feature — Autonomous design phase"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -146,6 +146,7 @@ description: "Design Feature — Autonomous design phase"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -176,7 +177,7 @@ description: "Design Feature — Autonomous design phase"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -549,7 +550,7 @@ description: "Design Feature — Autonomous design phase"
    - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 12 — Close Workflow
diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index 5b90eee29..280f81917 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -51,7 +51,7 @@ description: "Plan Feature — Autonomous plan generation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -145,7 +145,7 @@ description: "Plan Feature — Autonomous plan generation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 8. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
 
@@ -156,6 +156,7 @@ description: "Plan Feature — Autonomous plan generation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -188,7 +189,7 @@ description: "Plan Feature — Autonomous plan generation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -467,7 +468,7 @@ description: "Plan Feature — Autonomous plan generation"
    - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 8 — Close Workflow
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 38d060955..5d2e0278b 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -51,7 +51,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -168,7 +168,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -198,6 +198,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.agents/skills/bkit-auto/SKILL.md b/.agents/skills/bkit-auto/SKILL.md
index 045704748..788cab5c7 100644
--- a/.agents/skills/bkit-auto/SKILL.md
+++ b/.agents/skills/bkit-auto/SKILL.md
@@ -40,12 +40,13 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 **Rules:** Copied word for word from `.agents/rules.md`.
@@ -59,7 +60,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
 2. **Skip if** `ISSUE_ID` empty. Add `bkit:failed` (prior phase label persists, additive):
    ```bash
@@ -90,7 +91,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
    Hold `phase` as `PHASE`, `mode` as `MODE`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `issueId` as `ISSUE_ID`, `fid` as `FID`, `prNumber` as `PR_NUMBER`, `branch` as `BRANCH`, `headSha` as `HEAD_SHA`, `prUrl` as `PR_URL`, `runId` as `RUN_ID`, `ref` as `REF` (`null` → empty).
 4. Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -103,6 +104,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -110,7 +112,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
@@ -126,5 +128,6 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 7f72456f6..c91c078c5 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -54,7 +54,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -340,7 +340,7 @@ description: "Build Feature — Autonomous implementation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -350,6 +350,7 @@ description: "Build Feature — Autonomous implementation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -382,7 +383,7 @@ description: "Build Feature — Autonomous implementation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1120,14 +1121,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1188,10 +1189,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
-7. **Skip if** `ISSUE_ID` empty. Comment:
+7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
    "{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 14619367b..2406d9f3f 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -53,7 +53,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -231,7 +231,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -241,6 +241,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -272,7 +273,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -804,7 +805,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 10. **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
diff --git a/.agents/skills/bkit-design/SKILL.md b/.agents/skills/bkit-design/SKILL.md
index fba0cf4c7..80df59108 100644
--- a/.agents/skills/bkit-design/SKILL.md
+++ b/.agents/skills/bkit-design/SKILL.md
@@ -51,7 +51,7 @@ description: "Design Feature — Autonomous design phase"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -136,7 +136,7 @@ description: "Design Feature — Autonomous design phase"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -146,6 +146,7 @@ description: "Design Feature — Autonomous design phase"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -176,7 +177,7 @@ description: "Design Feature — Autonomous design phase"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -549,7 +550,7 @@ description: "Design Feature — Autonomous design phase"
    - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 12 — Close Workflow
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index 416f4451c..71bd2a919 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -51,7 +51,7 @@ description: "Plan Feature — Autonomous plan generation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -145,7 +145,7 @@ description: "Plan Feature — Autonomous plan generation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 8. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
 
@@ -156,6 +156,7 @@ description: "Plan Feature — Autonomous plan generation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -188,7 +189,7 @@ description: "Plan Feature — Autonomous plan generation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -467,7 +468,7 @@ description: "Plan Feature — Autonomous plan generation"
    - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 8 — Close Workflow
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 9c17c3a76..bc3c039c4 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -51,7 +51,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -168,7 +168,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -198,6 +198,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 5494f981d..e12d206ce 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -208,7 +208,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
 
 ### `ledgers`
 
@@ -385,7 +385,7 @@ Start, fail, hand over, summarize and close a phase workflow run; promote and li
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
+| `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--session-dir` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
 | `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
 | `handover` | workflow | **`--workflow`** **`--fid`** `--month` `--push` `--flush` `--open-pr` `--ref` `--list-stray` `--worktree` `--owner-repo` `--post` | Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment. |
 | `close` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--pr-number` `--squash-sha` `--ref` `--owner-repo` `--outbox` `--record-step` `--message` `--label` `--verbose-ci-local` `--number` `--title` `--post` `--tree` `--ending` `--publish` `--flush` `--token` `--branch` `--session-dir` `--final-return` `--summary-file` `--summary` `--summary-missing` `--warning` `--line` `--suggest` | Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 030adbeca..458a2b954 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -208,7 +208,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
 
 ### `ledgers`
 
@@ -385,7 +385,7 @@ Start, fail, hand over, summarize and close a phase workflow run; promote and li
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
+| `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--session-dir` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
 | `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
 | `handover` | workflow | **`--workflow`** **`--fid`** `--month` `--push` `--flush` `--open-pr` `--ref` `--list-stray` `--worktree` `--owner-repo` `--post` | Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment. |
 | `close` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--pr-number` `--squash-sha` `--ref` `--owner-repo` `--outbox` `--record-step` `--message` `--label` `--verbose-ci-local` `--number` `--title` `--post` `--tree` `--ending` `--publish` `--flush` `--token` `--branch` `--session-dir` `--final-return` `--summary-file` `--summary` `--summary-missing` `--warning` `--line` `--suggest` | Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev. |
diff --git a/.bkit/core/.bkit/trackers.md b/.bkit/core/.bkit/trackers.md
index 31223e20a..8e9b83958 100644
--- a/.bkit/core/.bkit/trackers.md
+++ b/.bkit/core/.bkit/trackers.md
@@ -18,6 +18,14 @@
 >   - Add a `<!-- bkit:tracker <name> -->` block after the last tracker block at every call site, and extend `GROUP_RE` in `.bkit/core/engine/render/trackers.ts`.
 > - There is no `none` marker. No-tracker content goes in a `false` block.
 
+## Workflow comment delivery
+
+The engine may append routine reports to its own eligible progress comment. Ownership comes from an explicit repo-info session or an exact workflow run, never another active run. A later human or unrelated comment, missing ownership evidence, or a capacity rollover starts a new comment. Attention reports and terminal summaries always use new comments.
+
+The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
+
+Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable. Provider capacity limits remain conservative until a disposable, explicitly authorized live probe verifies them.
+
 ## Marker contract
 
 Workflow and prompt sources carry the variant for each wired tracker inline. The installer reads `bkit.tracker.default` from the consumer's manifest, and resolves the markers when it mirrors `.bkit/core/workflows/bkit-*.md` to every host's commands / skills and `.bkit/core/prompts/bkit-*.md` to every host's agents (`.bkit/core/engine/render/trackers.ts`). The mirrors are clean: no marker survives.
@@ -95,7 +103,7 @@ This renders `N. <body>` when a tracker is wired, and `N. _No tracker connected,
 | `issue-update-failed` | Failure Path additive `bkit:failed` | `issue_write` labels | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
 | `issue-update-merged` | Ship terminal — `bkit:merged` + In Review (issue left open; human closes) | `issue_write` `bkit:merged` (no close) | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
 | `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add / update item | no-op (state carries) | no-op (status carries) | skip |
-| `comment-post-step` | new comment per workflow step | `add_issue_comment` | `save_comment` | `addOrEditJiraIssueComment` | skip |
+| `comment-post-step` | engine-owned routine progress; create-only fallback | `add_issue_comment` | `save_comment` without `id` | `addOrEditJiraIssueComment` without `commentId` | skip |
 | `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | JQL `linkedIssues(KEY, "is blocked by") AND statusCategory != Done` | skip |
 | `kill-switch-check` | Terminate if `bkit:auto` absent; skipped when `ISSUE_ID` empty | label check | label check | label check | inactive |
 | `pr-body-metadata` | Parse PR-body issue / FID marker; FID-only marker (no issue) → `issueId: null`, `/bkit-auto` fails closed | `pull_request_read` + parse | same (GitHub PR) | same (GitHub PR) | FID-only, no fail-closed |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d093f2643..993e9b66b 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -40,6 +40,14 @@ Skill selection and activation within every workflow follow `.agents/skills.md`
 | `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
 | `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR number **or** FID slug for ship / debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; debug receives the exact held run reference; the same session continues into the dispatched skill |
 
+## Tracker reporting
+
+Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
+
+Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
+
+A published build prepares its close report before the push and includes that report in its single Create PR completion comment. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
+
 ## When to Run
 
 Choose by the state of the work. Procedure stays in the command file and in § Per-Phase Workflows.
diff --git a/.bkit/core/engine/audits/workflows/catalog-parity.test.ts b/.bkit/core/engine/audits/workflows/catalog-parity.test.ts
index bb1c535d0..bf252b287 100644
--- a/.bkit/core/engine/audits/workflows/catalog-parity.test.ts
+++ b/.bkit/core/engine/audits/workflows/catalog-parity.test.ts
@@ -10,6 +10,9 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { describe, expect, it } from "vitest";
 import { getBkitDocsRoot, getPromptsRoot, getWorkflowsRoot } from "../../shared/package-roots";
+import { applyCodexSkill } from "../../install/modules/codex";
+import { applyAntigravitySkill, applyOpencodeCommand, applyT1, applyT2 } from "../../render/hosts";
+import { substituteWorkflow } from "../../render/trackers";
 
 const PROMPTS_INDEX = path.join(getBkitDocsRoot(), "prompts.md");
 const WORKFLOWS_INDEX = path.join(getBkitDocsRoot(), "workflows.md");
@@ -53,3 +56,116 @@ describe("catalog parity — prompts", () => {
     expect(missing).toEqual([]);
   });
 });
+
+function renderedReportingWorkflows() {
+  return WORKFLOW_NAMES.flatMap((name) => {
+    const source = fs.readFileSync(path.join(getWorkflowsRoot(), `${name}.md`), "utf8");
+    return (["github", "linear", "jira", "none"] as const).flatMap((tracker) => {
+      const resolved = substituteWorkflow(source, tracker);
+      expect(resolved.orphans, `${name}/${tracker}`).toEqual([]);
+      return [
+        { host: "claude", body: resolved.output },
+        { host: "cursor", body: applyT2(applyT1(resolved.output)) },
+        { host: "codex", body: applyCodexSkill(source, name, tracker) },
+        { host: "antigravity", body: applyAntigravitySkill(resolved.output, name) },
+        { host: "opencode", body: applyOpencodeCommand(resolved.output) },
+      ].map((rendered) => ({
+        ...rendered,
+        name,
+        tracker,
+        label: `${name}/${tracker}/${rendered.host}`,
+      }));
+    });
+  });
+}
+
+type ReportingWorkflow = ReturnType<typeof renderedReportingWorkflows>[number];
+const isWired = (workflow: ReportingWorkflow) => workflow.tracker !== "none";
+const isUnwired = (workflow: ReportingWorkflow) => workflow.tracker === "none";
+const isAuto = (workflow: ReportingWorkflow) => workflow.name === "bkit-auto";
+const isPhase = (workflow: ReportingWorkflow) => workflow.name !== "bkit-auto";
+const isLinear = (workflow: ReportingWorkflow) => workflow.tracker === "linear";
+const isJira = (workflow: ReportingWorkflow) => workflow.tracker === "jira";
+
+function reportingCommands(body: string): string[] {
+  return [...body.matchAll(/```bash\n([\s\S]*?)```/g)].flatMap((match) =>
+    (match[1] ?? "")
+      .split("\n")
+      .filter((line) => /issues comment.*--post/.test(line) && !/--kind=failure/.test(line)),
+  );
+}
+
+function commentsClause(body: string): string {
+  return body.split("\n").find((line) => line.startsWith("- **Comments:**")) ?? "";
+}
+
+function commentGates(body: string): string[] {
+  return body
+    .split("\n")
+    .filter((line) => /^- \[[ x]\]/.test(line) && /comment|tracker.*(?:post|deliver)/i.test(line));
+}
+
+describe("rendered workflow comment contracts", () => {
+  it("renders explicit invocation association at fileless and lifecycle posting sites", () => {
+    const rendered = renderedReportingWorkflows();
+    expect(rendered).toHaveLength(6 * 4 * 5);
+    for (const { body, label } of rendered.filter(isUnwired)) {
+      expect(body, label).not.toMatch(
+        /mcp__github__add_issue_comment|mcp__linear__save_comment|mcp__jira__addOrEditJiraIssueComment/,
+      );
+    }
+    for (const { body, label } of rendered.filter(isWired)) {
+      const commands = reportingCommands(body);
+      expect(commands.length, label).toBeGreaterThan(0);
+      for (const command of commands) expect(command, label).toMatch(/--(?:session-dir|file)=/);
+    }
+    for (const { body, label } of rendered.filter(isWired).filter(isAuto)) {
+      expect(body, label).toMatch(
+        /auto[^\n]*(?:separate|distinct)[^\n]*(?:phase|invocation)|(?:phase|invocation)[^\n]*(?:separate|distinct)[^\n]*auto/i,
+      );
+    }
+    for (const { body, label } of rendered.filter(isWired).filter(isPhase)) {
+      const starts = [...body.matchAll(/^[^\n]*workflows start[^\n]*$/gm)];
+      expect(starts.length, label).toBeGreaterThan(0);
+      for (const start of starts) expect(start[0], label).toContain("--session-dir=");
+    }
+  });
+
+  it("renders engine progress authority with verbatim create only agent fallback", () => {
+    const rendered = renderedReportingWorkflows().filter(isWired);
+    for (const { body, label } of rendered) {
+      const clause = commentsClause(body);
+      expect(clause.length, label).toBeGreaterThan(0);
+      expect(clause, label).toMatch(/engine[^\n]*(?:append|edit|updat)/i);
+      expect(clause, label).toContain("commentFile");
+      expect(clause, label).toMatch(/byte-for-byte|verbatim/);
+      expect(clause, label).toMatch(/new comment|create-only/);
+      expect(clause, label).toMatch(/NEVER edit|never edit|do not edit/i);
+    }
+    for (const { body, label } of rendered.filter(isLinear))
+      expect(commentsClause(body), label).toMatch(/no `id`|without[^\n]*`id`/);
+    for (const { body, label } of rendered.filter(isJira))
+      expect(commentsClause(body), label).toMatch(/no `commentId`|without[^\n]*`commentId`/);
+  });
+
+  it("renders nonfatal comment fallback friction and attempted delivery gates", () => {
+    for (const { body, label } of renderedReportingWorkflows().filter(isWired)) {
+      const clause = commentsClause(body);
+      expect(clause, label).toMatch(
+        /nonfatal|non-fatal|never[^\n]*(?:stop|block)|does not[^\n]*(?:stop|block)/i,
+      );
+      expect(clause, label).toMatch(/friction/i);
+      expect(clause, label).toMatch(/best effort|best-effort/i);
+      expect(clause, label).toMatch(/continu/i);
+      expect(clause, label).not.toMatch(/(?:failure|error)[^\n]*→ \*\*Failure Path\*\*/i);
+      const gates = commentGates(body);
+      expect(gates.length, label).toBeGreaterThan(0);
+      for (const gate of gates) {
+        expect(gate, label).toMatch(/attempt|skip|not required|when applicable/i);
+        expect(gate, label).not.toMatch(
+          /successful delivery|comment (?:delivered|posted successfully)/i,
+        );
+      }
+    }
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index acd3cc4c7..23fb6a240 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -165,7 +165,11 @@ describe("bkit-local-gate-audit (#437)", () => {
     expect(body.lastIndexOf("roadmap mirror", pushAt)).toBeGreaterThanOrEqual(0);
     const retained = body.slice(closeAt + close.block.length, pushAt);
     expect(retained).toMatch(/`commentFile`[^\n]*`CLOSE_COMMENT_FILE`/);
-    expect(retained).toMatch(/`tracker`[^\n]*`CLOSE_TRACKER`/);
+    expect(close.block).not.toContain("--post");
+    expect(body).toMatch(
+      /issues comment[^\n]*--step-title="Create PR"[^\n]*--body-file="\{CLOSE_COMMENT_FILE\}"/,
+    );
+    expect(body).toMatch(/Hold this report's `commentFile`[^\n]*`tracker`[^\n]*`CLOSE_TRACKER`/);
     expect(retained).toMatch(/`finalReturn`[^\n]*`FINAL_RETURN`/);
     const release = commandRoutes(body.slice(pushAt), /\blocks release\b/);
     expect(release).toHaveLength(1);
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 7e77e62ce..c9ebca5fa 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -250,7 +250,9 @@ describe("Step 1 FID check", () => {
 describe("resume facts", () => {
   it("build resumes an open decision from `openDecision`, not a file scan", () => {
     const text = workflow("build");
-    expect(text).toContain("**If** Step 2's `workflows start` printed `openDecision` != null");
+    expect(text).toContain(
+      '**If** Step 2\'s `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null',
+    );
     expect(text).not.toContain("holds `Status: OPEN` → resume");
     for (const field of [
       "decision",
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index b59a28986..2f69af0f0 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -141,6 +141,8 @@ export interface RunContext {
   /** Parsed flags, keyed by camelCase name. */
   flags: Record<string, FlagValue>;
   cwd: string;
+  /** Explicit publishing ownership; never inferred from another active run. */
+  publication?: { invocation: string; workflow: string };
   /** The global `--json` flag was given. Taken by every verb, never declared in a verb's spec. */
   json: boolean;
   /** Human-readable line on stderr, tagged `[bkit-<noun>]`. */
diff --git a/.bkit/core/engine/commands/workflow/context.ts b/.bkit/core/engine/commands/workflow/context.ts
index 4fbfaab55..2c78ff508 100644
--- a/.bkit/core/engine/commands/workflow/context.ts
+++ b/.bkit/core/engine/commands/workflow/context.ts
@@ -1908,7 +1908,7 @@ export const contextCommand: CommandSpec = {
           commit: written.commit,
           ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
           comment,
-          commentFile: commentFileOf(ctx.cwd, comment),
+          commentFile: commentFileOf(ctx.cwd, comment, ctx),
         });
         return written.code;
       },
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 29a1c0146..f538f94cc 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -28,7 +28,9 @@ import {
   TRACKER_OUTPUT,
   attempt,
   classifyFailure,
+  commentDiagnostic,
   commentFileOf,
+  endedRunActionKey,
   fetchIssue,
   moveOnBoard,
   postForVerb,
@@ -1019,6 +1021,11 @@ export const issuesCommand: CommandSpec = {
           help: "failure: captured stderr (last 20 lines kept)",
         },
         POST_FLAG,
+        {
+          name: "session-dir",
+          type: "string",
+          help: "explicit repo info session for fileless workflow progress ownership",
+        },
         { name: "fid", type: "string", help: "with --post: the run's FID (names the issue)" },
         { name: "issue", type: "string", help: "with --post: the issue id (instead of --fid)" },
         {
@@ -1028,17 +1035,37 @@ export const issuesCommand: CommandSpec = {
         },
       ],
       output: {
-        comment: "the comment body",
+        comment: "the comment body; null when --post source preparation is unavailable",
         commentFile: COMMENT_FILE_OUTPUT,
         tracker: TRACKER_OUTPUT,
       },
       exitCodes: {
         [EXIT_BAD_INPUT]:
-          "a --body-file / --section / --stderr-file / --error-file file is missing",
+          "without --post: a --body-file / --section / --stderr-file / --error-file file is missing",
       },
       run: async (ctx) => {
-        const comment = commentBody(ctx);
-        const commentFile = commentFileOf(ctx.cwd, comment);
+        let comment: string;
+        try {
+          comment = commentBody(ctx);
+        } catch (err) {
+          if (
+            ctx.flags.post !== true ||
+            (err instanceof CommandError && err.code !== EXIT_BAD_INPUT)
+          )
+            throw err;
+          commentDiagnostic(
+            { cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) },
+            "[bkit-tracker] comment preparation unavailable; continuing workflow",
+            [],
+          );
+          ctx.emit({
+            comment: null,
+            commentFile: null,
+            tracker: { done: false, action: "comment", reason: "preparation" },
+          });
+          return EXIT.OK;
+        }
+        const commentFile = commentFileOf(ctx.cwd, comment, ctx);
         if (ctx.flags.post !== true) {
           ctx.emit({ comment, commentFile });
           return EXIT.OK;
@@ -1046,18 +1073,27 @@ export const issuesCommand: CommandSpec = {
         const file = str(ctx.flags.file)
           ? path.resolve(ctx.cwd, String(ctx.flags.file))
           : undefined;
-        const key = runActionKey(
-          file,
-          str(ctx.flags.workflow),
+        const keyParts = [
           str(ctx.flags.kind) ?? "step",
           str(ctx.flags.stepNumber),
           str(ctx.flags.subStep),
           str(ctx.flags.attempt),
-        );
+        ];
+        const workflow = str(ctx.flags.workflow);
+        const key =
+          ctx.flags.prNumber !== undefined && workflow !== undefined
+            ? endedRunActionKey(file, workflow, ...keyParts)
+            : runActionKey(file, workflow, ...keyParts);
         const tracker = await postForVerb(ctx, comment, {
           fid: str(ctx.flags.fid),
           issue: str(ctx.flags.issue),
           ...(key === undefined ? {} : { file, key }),
+          purpose:
+            ctx.flags.prNumber !== undefined
+              ? "terminal"
+              : ["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
+                ? "attention"
+                : "routine",
         });
         ctx.emit({ comment, commentFile, tracker });
         return EXIT.OK;
diff --git a/.bkit/core/engine/commands/workflow/plans.ts b/.bkit/core/engine/commands/workflow/plans.ts
index 6b9f3e855..88cbc26b6 100644
--- a/.bkit/core/engine/commands/workflow/plans.ts
+++ b/.bkit/core/engine/commands/workflow/plans.ts
@@ -249,7 +249,7 @@ export const plansCommand: CommandSpec = {
           month: String(ctx.flags.month),
           fid: String(ctx.flags.fid),
         });
-        ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body), plans });
+        ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body, ctx), plans });
         return EXIT.OK;
       },
     },
diff --git a/.bkit/core/engine/commands/workflow/repo.ts b/.bkit/core/engine/commands/workflow/repo.ts
index f1ac1a494..fbe948f83 100644
--- a/.bkit/core/engine/commands/workflow/repo.ts
+++ b/.bkit/core/engine/commands/workflow/repo.ts
@@ -161,7 +161,7 @@ export const repoCommand: CommandSpec = {
         bkit: "the bkit binary the workflow blocks call: <repoRoot>/node_modules/.bin/bkit, else `bkit` on PATH",
         outboxRoot: "<git common dir>/bkit-outbox: per-run scratch files, never committed",
         sessionDir:
-          "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per call for this run's prompt.md and issue files; folders older than 7 days are pruned",
+          "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per invocation for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
         bkitVersion:
           ".bkit/version pinnedVersion: the release this repo's bkit files came from (null when unpinned)",
         bkitLatest:
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index af130a078..dd0f13fe8 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -1415,7 +1415,15 @@ async function finish(ctx: RunContext): Promise<number> {
       attempt,
       "comment",
     );
-    tracker = await postForVerb(ctx, comment, { fid: fidOfStatusFile(file), file, key });
+    tracker = await postForVerb(ctx, comment, {
+      fid: fidOfStatusFile(file),
+      file,
+      key,
+      purpose:
+        step.endsWith("-decision") || verdict === "FAIL" || verdict === "HANDOVER"
+          ? "attention"
+          : "routine",
+    });
   }
 
   const written = writeStepRow(
@@ -1464,7 +1472,7 @@ async function finish(ctx: RunContext): Promise<number> {
     checks,
     comment,
     // Written after the step's commit, so the commit never carries it.
-    commentFile: commentFileOf(ctx.cwd, comment),
+    commentFile: commentFileOf(ctx.cwd, comment, ctx),
     ...(tracker === undefined ? {} : { tracker }),
   });
   if (written.code !== EXIT.OK) return written.code;
diff --git a/.bkit/core/engine/commands/workflow/tracker.integration.test.ts b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
new file mode 100644
index 000000000..1d2f86418
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tracker.integration.test.ts
@@ -0,0 +1,639 @@
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+import { requireTsx } from "../../../../../vitest.tsx-bin";
+import { actionHash } from "../../ledgers/status";
+
+const CLI = path.resolve(".bkit/core/engine/cli.ts");
+const DISPATCHER = path.resolve("tests/fixtures/gh/bin/gh");
+const FID = "12-progress";
+const MONTH = "202611";
+const REL = `docs/plans/${MONTH}/logs/${FID}/status.jsonl`;
+const BUDGET = tierTimeouts(true);
+let root: string;
+let cwd: string;
+let stateFile: string;
+let env: NodeJS.ProcessEnv;
+
+interface RemoteComment {
+  id: number;
+  node_id: string;
+  body: string;
+  html_url: string;
+  user: { id: number; node_id: string };
+  created_at: string;
+  updated_at: string;
+}
+interface RemoteState {
+  comments: RemoteComment[];
+  calls: Array<{ method: string; endpoint: string; body?: string }>;
+  fault?: string;
+}
+
+// A real child-process transport with durable state across separate CLI invocations.
+const GH_SERVER = String.raw`
+import fs from "node:fs";
+const file = process.env.BKIT_PROGRESS_REMOTE;
+const state = JSON.parse(fs.readFileSync(file, "utf8"));
+const args = process.argv.slice(2);
+if (args[0] === "repo") { console.log("o/r"); process.exit(0); }
+if (args[0] === "auth") process.exit(0);
+const endpoint = args[1];
+const methodAt = args.indexOf("--method");
+const method = methodAt < 0 ? "GET" : args[methodAt + 1];
+const input = args.includes("--input") ? JSON.parse(fs.readFileSync(0, "utf8")) : {};
+state.calls.push({ method, endpoint, body: input.body });
+const save = () => fs.writeFileSync(file, JSON.stringify(state));
+const fail = () => { save(); console.error("HTTP 503: disposable transport fault"); process.exit(1); };
+if (endpoint === "graphql") {
+  if (["read", "all", "reconciliation"].includes(state.fault)) fail();
+  save();
+  console.log(JSON.stringify({ data: { repository: { issue: { comments: {
+    nodes: state.comments.map(c => ({ id:c.node_id, databaseId:c.id, body:c.body, url:c.html_url,
+      author:{id:c.user.node_id,databaseId:c.user.id,__typename:"User"},
+      createdAt:c.created_at, updatedAt:c.updated_at })),
+    pageInfo:{hasPreviousPage:false,hasNextPage:false,startCursor:"first"}
+  } } } } }));
+  process.exit(0);
+}
+if (method === "POST" || method === "PATCH") {
+  if (state.fault === "all" || state.fault === "create" && method === "POST" ||
+      ["append", "reconciliation"].includes(state.fault) && method === "PATCH") fail();
+  let comment;
+  if (method === "PATCH") {
+    const id = endpoint.split("/").at(-1);
+    comment = state.comments.find(c => String(c.id) === id || c.node_id === id);
+    if (!comment) fail();
+    comment.body = input.body;
+    comment.updated_at = "2026-11-01T01:02:00Z";
+  } else {
+    const id = state.comments.length + 101;
+    comment = { id, node_id:"IC_"+id, body:input.body,
+      html_url:"https://github.com/o/r/issues/12#issuecomment-"+id,
+      user:{id:7,node_id:"U_7"},
+      created_at:new Date(Date.UTC(2026,10,1,1,0,state.comments.length)).toISOString(),
+      updated_at:"2026-11-01T01:01:00Z" };
+    state.comments.push(comment);
+  }
+  save();
+  if (state.fault === "lost-terminal" && input.body.includes("Completion")) fail();
+  console.log(JSON.stringify(comment));
+  process.exit(0);
+}
+save();
+console.error("unexpected gh fixture call");
+process.exit(1);
+`;
+
+// Inject I/O faults only at the comment boundary; substantive status writes use real fs.
+const FAULT_PRELOAD = String.raw`
+import fs from "node:fs";
+import { syncBuiltinESMExports } from "node:module";
+const fault = process.env.BKIT_PROGRESS_IO_FAULT;
+for (const method of ["writeFileSync", "appendFileSync", "openSync", "readFileSync"]) {
+  const original = fs[method];
+  fs[method] = function(file, ...args) {
+    const name = String(file);
+    const body = typeof args[0] === "string" ? args[0] : "";
+    const hit = fault === "preparation" && name.includes("bkit-comment-") && method === "writeFileSync"
+      || fault === "cache" && name.includes("/progress/") && method === "writeFileSync"
+      || fault === "receipt" && method === "appendFileSync" && body.includes('"type":"engine-action"')
+      || fault === "lock" && name.includes("publication-locks") && method === "openSync"
+      || fault === "diagnostic" && name.endsWith("friction.jsonl") && method === "appendFileSync";
+    if (hit) throw new Error("injected comment boundary unavailable");
+    return original.call(this, file, ...args);
+  };
+}
+syncBuiltinESMExports();
+`;
+
+function write(file: string, body: string): void {
+  fs.mkdirSync(path.dirname(file), { recursive: true });
+  fs.writeFileSync(file, body);
+}
+
+function git(at: string, ...args: string[]): string {
+  const result = spawnSync("git", args, { cwd: at, env, encoding: "utf8" });
+  expect(result.status, result.stderr).toBe(0);
+  return result.stdout.trim();
+}
+
+function cli(at: string, args: string[], extra: NodeJS.ProcessEnv = {}) {
+  const result = spawnSync(
+    requireTsx(),
+    ["--import", path.join(root, "faults.mjs"), CLI, ...args, "--json"],
+    { cwd: at, env: { ...env, ...extra }, encoding: "utf8", timeout: BUDGET.testTimeout },
+  );
+  return {
+    code: result.status,
+    stderr: result.stderr,
+    out: result.stdout ? (JSON.parse(result.stdout) as Record<string, unknown>) : {},
+  };
+}
+
+function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
+  const result = cli(at, args, extra);
+  expect(result.code, result.stderr).toBe(0);
+  return result.out;
+}
+
+function remote(): RemoteState {
+  return JSON.parse(fs.readFileSync(stateFile, "utf8"));
+}
+
+function fault(name?: string): void {
+  const state = remote();
+  state.fault = name;
+  fs.writeFileSync(stateFile, JSON.stringify(state));
+}
+
+function session(at = cwd): string {
+  const info = ok(at, ["repo", "info"]);
+  expect(info.sessionDir).toEqual(expect.any(String));
+  return String(info.sessionDir);
+}
+
+function start(at: string, sessionDir: string, workflow = "build") {
+  return ok(at, [
+    "workflows",
+    "start",
+    `--workflow=${workflow}`,
+    `--fid=${FID}`,
+    `--month=${MONTH}`,
+    `--session-dir=${sessionDir}`,
+  ]);
+}
+
+function report(
+  at: string,
+  title: string,
+  options: {
+    sessionDir?: string;
+    workflow?: string;
+    file?: string;
+    issue?: string;
+    number?: number;
+  } = {},
+) {
+  return ok(at, [
+    "issues",
+    "comment",
+    "--post",
+    `--issue=${options.issue ?? "12"}`,
+    `--workflow=${options.workflow ?? "build"}`,
+    `--step-number=${options.number ?? 3}`,
+    `--step-title=${title}`,
+    ...(options.sessionDir ? [`--session-dir=${options.sessionDir}`] : []),
+    ...(options.file ? [`--file=${options.file}`] : []),
+  ]);
+}
+
+function rows(at: string): Array<Record<string, unknown>> {
+  return fs
+    .readFileSync(path.join(at, REL), "utf8")
+    .split("\n")
+    .filter(Boolean)
+    .map((line) => JSON.parse(line));
+}
+
+function finish(at: string, verdict: "PASS" | "FAIL", extra: NodeJS.ProcessEnv = {}) {
+  return cli(
+    at,
+    [
+      "steps",
+      "finish",
+      "--workflow=build",
+      "--step=build-branch-sync",
+      `--file=${REL}`,
+      "--commit=none",
+      "--number=3",
+      "--title=Branch Sync",
+      "--post",
+      `--verdict=${verdict}`,
+      `--failures=${verdict === "PASS" ? 0 : 1}`,
+    ],
+    extra,
+  );
+}
+
+function close(at: string, sessionDir: string) {
+  return ok(at, [
+    "workflows",
+    "close",
+    "--workflow=build",
+    `--fid=${FID}`,
+    `--month=${MONTH}`,
+    "--ending=held",
+    "--publish=false",
+    "--post",
+    "--number=16",
+    "--title=Completion",
+    "--owner-repo=o/r",
+    `--session-dir=${sessionDir}`,
+  ]);
+}
+
+function executionRoots(): string[] {
+  const separate = path.join(root, "separate-worktree");
+  git(cwd, "worktree", "add", "-q", "-b", "feat/separate", separate);
+  return [cwd, separate];
+}
+
+function lastBody(): string {
+  return remote().comments.at(-1)?.body ?? "";
+}
+
+function mixedAutoPhase(bodies: string[]): boolean {
+  return bodies.some((body) => body.includes("Auto dispatch") && body.includes("Build start"));
+}
+
+function faultForBoundary(boundary: string): void {
+  fault(
+    ["read", "append", "create", "reconciliation"].includes(boundary)
+      ? boundary
+      : boundary === "diagnostic"
+        ? "all"
+        : undefined,
+  );
+}
+
+function failuresFor(verdict: string): number {
+  return verdict === "PASS" ? 0 : 1;
+}
+
+function gitCalls(): string[] {
+  return fs.readFileSync(path.join(root, "git-calls"), "utf8").split("\n").filter(Boolean);
+}
+
+function isPushCall(call: string): boolean {
+  for (const argument of call.split(" ")) {
+    if (argument === "push") return true;
+  }
+  return false;
+}
+
+beforeEach(() => {
+  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-cli-")));
+  cwd = path.join(root, "consumer");
+  stateFile = path.join(root, "remote.json");
+  env = {
+    ...process.env,
+    BKIT_ENGINE_JOURNAL: "off",
+    BKIT_NO_UPDATE_CHECK: "1",
+    BKIT_PROGRESS_REMOTE: stateFile,
+    BKIT_GH_TOKEN: "disposable-fixture-token",
+  };
+  for (const key of Object.keys(env)) {
+    if (
+      key.startsWith("GIT_") ||
+      [
+        "BKIT_LINEAR_API_KEY",
+        "BKIT_JIRA_API_KEY",
+        "NODE_OPTIONS",
+        "BKIT_FAKE_TOOL_SCRIPT",
+        "BKIT_PROGRESS_IO_FAULT",
+      ].includes(key)
+    )
+      delete env[key];
+  }
+  fs.mkdirSync(cwd);
+  const bin = path.join(root, "bin");
+  fs.mkdirSync(bin);
+  fs.symlinkSync(DISPATCHER, path.join(bin, "gh"));
+  fs.symlinkSync(DISPATCHER, path.join(bin, "git"));
+  write(path.join(root, "gh-server.mjs"), GH_SERVER);
+  write(
+    path.join(root, "gh-body.sh"),
+    'case "$1" in api|repo|auth) exec "$BKIT_PROGRESS_NODE" "$BKIT_PROGRESS_SERVER" "$@" ;; esac\nprintf "%s\\n" "$*" >> "$BKIT_PROGRESS_GIT_CALLS"\nfor arg in "$@"; do case "$arg" in push|fetch|ls-remote) echo "unexpected network git operation" >&2; exit 97 ;; esac; done\nexec "$BKIT_PROGRESS_REAL_GIT" "$@"\n',
+  );
+  write(path.join(root, "faults.mjs"), FAULT_PRELOAD);
+  env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ""}`;
+  env.BKIT_FAKE_TOOL_SCRIPT = path.join(root, "gh-body.sh");
+  env.BKIT_PROGRESS_NODE = process.execPath;
+  env.BKIT_PROGRESS_SERVER = path.join(root, "gh-server.mjs");
+  env.BKIT_PROGRESS_REAL_GIT = spawnSync("which", ["git"], { encoding: "utf8" }).stdout.trim();
+  env.BKIT_PROGRESS_GIT_CALLS = path.join(root, "git-calls");
+  fs.writeFileSync(stateFile, JSON.stringify({ comments: [], calls: [] }));
+  git(cwd, "init", "-q", "-b", `feat/${FID}`);
+  git(cwd, "config", "user.name", "Fixture");
+  git(cwd, "config", "user.email", "fixture@example.invalid");
+  git(cwd, "config", "commit.gpgsign", "false");
+  git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
+  write(
+    path.join(cwd, "package.json"),
+    JSON.stringify({ name: "fixture", version: "1.0.0", bkit: { tracker: { default: "github" } } }),
+  );
+  write(path.join(cwd, ".bkit/version"), JSON.stringify({ pinnedVersion: "6.1.1" }));
+  write(path.join(cwd, ".gitignore"), "tmp/\n.worktrees/\n");
+  git(cwd, "add", "package.json", ".bkit/version", ".gitignore");
+  git(cwd, "commit", "-qm", "fixture");
+});
+
+afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
+
+function workflowCommandFlags(
+  command: string | undefined,
+  flags: Array<[string, string[]]>,
+): string[] {
+  return flags.flatMap(([needle, args]) => (command?.includes(needle) ? args : []));
+}
+
+describe("workflow comment lifecycle across real CLI processes", () => {
+  it("keeps published build completion and PR links in one terminal comment", () => {
+    const workflow = fs.readFileSync(path.resolve(".bkit/core/workflows/bkit-build.md"), "utf8");
+    const closeCommand = workflow
+      .split("\n")
+      .find((line) => line.includes('--message="chore({FID}): close-workflow"'));
+    const prCommand = workflow
+      .split("\n")
+      .find((line) => line.includes('--step-title="Create PR"'));
+    expect(closeCommand).toBeDefined();
+    expect(prCommand).toBeDefined();
+    const dir = session();
+    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
+    start(cwd, dir);
+    report(cwd, "Summary", { file: REL, number: 15 });
+    const completed = ok(cwd, [
+      "workflows",
+      "close",
+      "--workflow=build",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      "--number=16",
+      "--title=Completion",
+      "--owner-repo=o/r",
+      `--session-dir=${dir}`,
+      ...workflowCommandFlags(closeCommand, [["--post", ["--post"]]]),
+    ]);
+    ok(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--step-number=16",
+      "--step-title=Create PR",
+      "--owner-repo=o/r",
+      "--pr-number=99",
+      "--pr-url=https://github.com/o/r/pull/99",
+      `--session-dir=${dir}`,
+      ...workflowCommandFlags(prCommand, [
+        ["--body-file=", [`--body-file=${String(completed.commentFile)}`]],
+        ["--workflow=build", ["--workflow=build"]],
+        ['--file="{STATUS}"', [`--file=${REL}`]],
+      ]),
+    ]);
+    expect(remote().comments).toHaveLength(2);
+    expect(remote().comments[1]?.body).toContain("Completion");
+    expect(remote().comments[1]?.body).toContain("https://github.com/o/r/pull/99");
+    expect(remote().comments[0]?.body).not.toContain("Completion");
+    expect(fs.readdirSync(path.join(cwd, ".git/bkit-outbox/progress"))).toHaveLength(0);
+  });
+
+  it("continues after the prepared completion source disappears", () => {
+    const dir = session();
+    start(cwd, dir);
+    const result = cli(cwd, [
+      "issues",
+      "comment",
+      "--post",
+      "--issue=12",
+      "--workflow=build",
+      `--file=${REL}`,
+      "--step-number=16",
+      "--step-title=Create PR",
+      "--pr-number=99",
+      "--owner-repo=o/r",
+      "--body-file=tmp/missing-completion.md",
+    ]);
+    expect(result.code).toBe(0);
+    expect(result.out.tracker).toMatchObject({ done: false, reason: "preparation" });
+    expect(result.out.commentFile).toBeNull();
+    expect(fs.readFileSync(path.join(cwd, ".bkit/friction.jsonl"), "utf8")).toContain(
+      '"step":"comment-delivery"',
+    );
+    expect(finish(cwd, "PASS").code).toBe(0);
+  });
+
+  it("records preparation and session association failures despite successful delivery", () => {
+    const dir = session();
+    const prepared = ok(
+      cwd,
+      [
+        "issues",
+        "comment",
+        "--post",
+        "--issue=12",
+        "--workflow=build",
+        "--step-number=1",
+        "--step-title=Preparation",
+        `--session-dir=${dir}`,
+      ],
+      { BKIT_PROGRESS_IO_FAULT: "preparation" },
+    );
+    expect(prepared.tracker).toMatchObject({ done: true });
+    expect(prepared.commentFile).toBeNull();
+    const frictionFile = path.join(cwd, ".bkit/friction.jsonl");
+    const preparationRows = fs.readFileSync(frictionFile, "utf8");
+    expect(preparationRows).toContain('"step":"comment-source"');
+    fs.rmSync(dir, { recursive: true, force: true });
+    report(cwd, "Missing association", { sessionDir: dir, number: 2 });
+    const associationRows = fs.readFileSync(frictionFile, "utf8");
+    expect(associationRows).toContain('"step":"comment-association"');
+    expect(associationRows).not.toContain(dir);
+    expect(remote().comments).toHaveLength(2);
+  });
+
+  it("associates startup and run across restart or starts fresh safely", () => {
+    const dir = session();
+    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
+    const started = start(cwd, dir);
+    report(cwd, "Worktree Setup", { file: String(started.file), number: 2 });
+    expect(remote().comments).toHaveLength(1);
+    expect(remote().comments[0]?.body).toContain("Start Workflow");
+    expect(remote().comments[0]?.body).toContain("Worktree Setup");
+    fs.rmSync(dir, { recursive: true, force: true });
+    report(cwd, "After missing session", { sessionDir: dir, number: 4 });
+    expect(remote().comments).toHaveLength(2);
+    expect(remote().comments[1]?.body).not.toContain("Start Workflow");
+  });
+
+  it("keeps successive phase runs separate in adopted and worktree execution", () => {
+    for (const at of executionRoots()) {
+      const first = session(at);
+      start(at, first);
+      report(at, `First ${path.basename(at)}`, { sessionDir: first, number: 1 });
+      close(at, first);
+      const before = remote().comments.length;
+      const second = session(at);
+      start(at, second);
+      report(at, `Second ${path.basename(at)}`, { sessionDir: second, number: 1 });
+      expect(remote().comments).toHaveLength(before + 1);
+      const last = lastBody();
+      expect(last).toContain(`Second ${path.basename(at)}`);
+      expect(last).not.toContain(`First ${path.basename(at)}`);
+    }
+  });
+
+  it("keeps auto and phase progress separate across worktrees", () => {
+    const auto = session();
+    report(cwd, "Auto dispatch", { workflow: "auto", sessionDir: auto, number: 1 });
+    const separate = path.join(root, "phase-worktree");
+    git(cwd, "worktree", "add", "-q", "-b", "feat/phase", separate);
+    const phase = session(separate);
+    start(separate, phase);
+    report(separate, "Build start", { sessionDir: phase, number: 1 });
+    report(cwd, "Auto continuation", { workflow: "auto", sessionDir: auto, number: 2 });
+    const bodies = remote().comments.map((c) => c.body);
+    expect(mixedAutoPhase(bodies)).toBe(false);
+    expect(bodies.filter((body) => body.includes("Build start"))).toHaveLength(1);
+    fs.rmSync(phase, { recursive: true, force: true });
+    const result = report(separate, "Build continues", { file: REL, number: 4 });
+    expect(result.tracker).toMatchObject({ done: true });
+  });
+
+  it("continues close and cleanup after lost terminal response", () => {
+    const dir = session();
+    const worktree = path.join(cwd, ".worktrees", FID);
+    git(cwd, "worktree", "add", "-q", "-b", "feat/cleanup", worktree);
+    write(path.join(cwd, ".git/bkit-outbox", FID, ".worktree-owned"), "fixture ownership\n");
+    start(worktree, dir);
+    report(worktree, "Routine work", { file: REL });
+    fault("lost-terminal");
+    close(worktree, dir);
+    expect(rows(worktree).some((row) => row.type === "workflow-done")).toBe(true);
+    expect(fs.existsSync(dir)).toBe(false);
+    expect(gitCalls().filter(isPushCall)).toEqual([]);
+    const committed = git(worktree, "ls-files");
+    expect(committed).not.toMatch(/progress\/|terminal-journal|pending-delivery/);
+    const remaining = fs.readdirSync(path.join(cwd, ".git/bkit-outbox"), { recursive: true });
+    expect(remaining.join("\n")).not.toMatch(/terminal-journal|pending-delivery/);
+    const removed = ok(cwd, ["worktrees", "remove", `--fid=${FID}`]);
+    expect(removed.removed).toBe(true);
+    expect(fs.existsSync(worktree)).toBe(false);
+    write(path.join(cwd, "after-close.txt"), "substantive work continues\n");
+    expect(fs.readFileSync(path.join(cwd, "after-close.txt"), "utf8")).toContain("continues");
+  });
+
+  it("starts fresh progress after cleanup and on a fresh clone", () => {
+    const dir = session();
+    start(cwd, dir);
+    report(cwd, "Old progress", { file: REL });
+    fs.rmSync(path.join(cwd, ".git/bkit-outbox"), { recursive: true, force: true });
+    report(cwd, "After cleanup", { file: REL, number: 4 });
+    expect(remote().comments).toHaveLength(2);
+    const cloned = path.join(root, "clone");
+    git(root, "clone", "-q", cwd, cloned);
+    git(cloned, "remote", "set-url", "origin", "https://github.com/o/r.git");
+    const fresh = session(cloned);
+    start(cloned, fresh);
+    report(cloned, "Fresh clone", { file: REL, number: 5 });
+    expect(remote().comments).toHaveLength(3);
+    expect(remote().comments.at(-1)?.body).not.toContain("Old progress");
+  });
+
+  it("preserves substantive step results under every comment boundary fault", () => {
+    const dir = session();
+    start(cwd, dir);
+    report(cwd, "Initial progress", { file: REL });
+    for (const boundary of [
+      "preparation",
+      "cache",
+      "receipt",
+      "lock",
+      "read",
+      "append",
+      "create",
+      "reconciliation",
+      "diagnostic",
+    ]) {
+      fault();
+      report(cwd, `Before ${boundary}`, { file: REL, number: 6 });
+      faultForBoundary(boundary);
+      for (const verdict of ["PASS", "FAIL"] as const) {
+        const result = finish(cwd, verdict, { BKIT_PROGRESS_IO_FAULT: boundary });
+        expect(result.code, `${boundary}: ${result.stderr}`).toBe(0);
+        const done = rows(cwd)
+          .filter((row) => row.type === "step-done")
+          .at(-1);
+        expect(done).toMatchObject({ verdict, failures: failuresFor(verdict) });
+        const subsequent = ok(cwd, [
+          "status",
+          "row",
+          `--file=${REL}`,
+          "--workflow=build",
+          "--type=owner-answer",
+        ]);
+        expect(subsequent).toBeDefined();
+        expect(rows(cwd).at(-1)?.type).toBe("owner-answer");
+      }
+    }
+  });
+
+  it("keeps clean build progress and completion to two comments", () => {
+    const dir = session();
+    report(cwd, "Start Workflow", { sessionDir: dir, number: 1 });
+    start(cwd, dir);
+    for (const [number, title] of [
+      [2, "Worktree Setup"],
+      [7, "Plan Execute"],
+      [8, "Plan Verify"],
+      [12, "Run Tests"],
+      [15, "Summary"],
+    ] as const)
+      report(cwd, title, { file: REL, number });
+    close(cwd, dir);
+    expect(remote().comments).toHaveLength(2);
+    const [progress, completion] = remote().comments;
+    for (const title of [
+      "Start Workflow",
+      "Worktree Setup",
+      "Plan Execute",
+      "Plan Verify",
+      "Run Tests",
+      "Summary",
+    ])
+      expect(progress?.body).toContain(title);
+    expect(completion?.body).toContain("Completion");
+    expect(completion?.body).not.toContain("Start Workflow");
+    expect(rows(cwd).at(-1)?.type).toBe("workflow-done");
+  });
+
+  it("preserves legacy receipts issue less skips and exact fallback through resume", () => {
+    const dir = session();
+    start(cwd, dir);
+    const draft = ok(cwd, [
+      "issues",
+      "comment",
+      "--issue=12",
+      "--workflow=build",
+      "--step-number=3",
+      "--step-title=Legacy",
+    ]);
+    fs.appendFileSync(
+      path.join(cwd, REL),
+      `${JSON.stringify({ type: "engine-action", action: "comment", key: "build/1/step/3/-/-/comment", hash: actionHash(String(draft.comment)), ref: "https://github.com/o/r/issues/12#issuecomment-99", at: "2026-11-01T00:00:01Z" })}\n`,
+    );
+    const before = remote().calls.length;
+    const legacy = report(cwd, "Legacy", { file: REL });
+    expect(legacy.tracker).toMatchObject({ done: true, deduped: true });
+    expect(remote().calls).toHaveLength(before);
+    const skipped = report(cwd, "Issue less", { issue: "", number: 4 });
+    expect(skipped.tracker).toMatchObject({ skipped: "no-issue" });
+    expect(remote().calls).toHaveLength(before);
+    fault("all");
+    const failed = report(cwd, "Exact fallback 😀", { file: REL, number: 5 });
+    expect(failed.tracker).toMatchObject({ done: false });
+    const bytes = fs.readFileSync(String(failed.commentFile), "utf8");
+    expect(bytes).toBe(failed.comment);
+    fault();
+    start(cwd, dir);
+    const resumed = report(cwd, "Exact fallback 😀", { file: REL, number: 5 });
+    expect(fs.readFileSync(String(resumed.commentFile), "utf8")).toBe(bytes);
+    expect(remote().comments.at(-1)?.body).toContain("Exact fallback 😀");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tracker.test.ts b/.bkit/core/engine/commands/workflow/tracker.test.ts
index 600d3bbf8..207449379 100644
--- a/.bkit/core/engine/commands/workflow/tracker.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.test.ts
@@ -8,6 +8,7 @@ import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
 import { actionHash, alreadyDone, recordAction } from "../../ledgers/status";
+import { validate } from "../../ledgers/telemetry";
 import {
   JIRA_COMMENT_LIMIT,
   JIRA_TOOLS,
@@ -346,6 +347,136 @@ function breakReceiptAfterCreate(f: ReturnType<typeof publicationFixture>) {
   );
 }
 
+function commentFriction(cwd: string): Array<Record<string, unknown>> {
+  const ledger = path.join(cwd, ".bkit/friction.jsonl");
+  expect(fs.existsSync(ledger), "comment fault must attempt a real friction row").toBe(true);
+  return fs
+    .readFileSync(ledger, "utf8")
+    .split("\n")
+    .filter(Boolean)
+    .map((line) => JSON.parse(line) as Record<string, unknown>);
+}
+
+async function stateFriction(boundary: "cache" | "receipt" | "lock" | "reconciliation") {
+  const f = publicationFixture();
+  await f.publish("first");
+  if (boundary === "cache") {
+    const cache = progressFiles(f.cwd).find((file) =>
+      file.includes(`${path.sep}progress${path.sep}`),
+    );
+    if (!cache) throw new Error("expected the initial publication to save progress source");
+    fs.writeFileSync(cache, "invalid source");
+  } else if (boundary === "receipt") {
+    breakReceiptAfterCreate(f);
+    f.state.failReads = 10;
+  } else if (boundary === "lock") {
+    const locks = path.join(f.cwd, ".git/bkit-outbox/publication-locks");
+    fs.rmSync(locks, { recursive: true, force: true });
+    fs.writeFileSync(locks, "unavailable lock directory");
+  } else {
+    f.state.failEdits = 10;
+    const fetch = globalThis.fetch;
+    vi.stubGlobal(
+      "fetch",
+      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
+        const result = await fetch(input, init);
+        const request: { query: string } = JSON.parse(String(init?.body));
+        if (request.query.includes("commentUpdate")) f.state.failReads = 10;
+        return result;
+      }),
+    );
+  }
+  await expect(f.publish(`fault ${boundary}`)).resolves.toHaveProperty("done");
+  return commentFriction(f.cwd);
+}
+
+describe("best effort comment friction", () => {
+  it("records redacted exhausted comment friction with authorized fields", async () => {
+    const f = publicationFixture();
+    f.state.failCreates = 10;
+    const privateBody = "private person@example.invalid Bearer body-secret";
+    const result = await f.publish(privateBody);
+    expect(result).toMatchObject({ done: false, action: "comment" });
+    const entries = commentFriction(f.cwd);
+    expect(entries.length).toBeGreaterThan(0);
+    for (const entry of entries) {
+      expect(validate(entry)).toEqual({ ok: true });
+      expect(entry).toMatchObject({
+        kind: "friction",
+        source: "orchestrator",
+        by: { workflow: "build" },
+      });
+      expect(entry.key).toEqual(expect.any(String));
+    }
+    const bytes = fs.readFileSync(path.join(f.cwd, ".bkit/friction.jsonl"), "utf8");
+    for (const privateValue of [
+      privateBody,
+      "person@example.invalid",
+      "body-secret",
+      "linear-test-secret",
+    ])
+      expect(bytes).not.toContain(privateValue);
+    expect(bytes).toContain("comment");
+  });
+
+  it("continues after friction and diagnostic writes fail without recursion", async () => {
+    const f = publicationFixture();
+    fs.mkdirSync(path.join(f.cwd, ".bkit/friction.jsonl"), { recursive: true });
+    f.state.failCreates = 10;
+    const warning = vi.fn((_line: string) => {
+      throw new Error("diagnostic unavailable");
+    });
+    await expect(
+      postCommentOnce(f.target, f.report("undeliverable"), {
+        ...f.options("undeliverable"),
+        log: warning,
+      }),
+    ).resolves.toMatchObject({ done: false });
+    expect(warning.mock.calls.length).toBeGreaterThan(0);
+    expect(warning.mock.calls.length).toBeLessThanOrEqual(3);
+    expect(warning.mock.calls.flat().join("\n")).toContain("friction");
+    expect(
+      f.state.requests.filter((request) => request.operation === "create").length,
+    ).toBeLessThanOrEqual(3);
+    expect(fs.statSync(path.join(f.cwd, ".bkit/friction.jsonl")).isDirectory()).toBe(true);
+    f.state.failCreates = 0;
+    await expect(f.publish("next substantive report")).resolves.toMatchObject({ done: true });
+    expect(f.state.comments.at(-1)?.body).toContain("next substantive report");
+  });
+
+  it("distinguishes fallback attempts from known delivery and lost reports", async () => {
+    const f = publicationFixture();
+    await f.publish("first");
+    f.state.failEdits = 10;
+    const fallback = await f.publish("fallback");
+    expect(fallback).toMatchObject({ done: true, url: f.state.comments.at(-1)?.url });
+    expect(f.state.comments).toHaveLength(2);
+    expect(f.state.requests.some((request) => request.operation === "edit")).toBe(true);
+    const count = f.state.requests.length;
+    await expect(f.publish("fallback")).resolves.toMatchObject({ done: true, deduped: true });
+    expect(f.state.requests).toHaveLength(count);
+    f.state.failCreates = 10;
+    f.state.failReads = 10;
+    const lost = await f.publish("lost");
+    expect(lost).toMatchObject({ done: false, action: "comment", reason: expect.any(String) });
+    expect(lost).not.toHaveProperty("url");
+    expect(f.state.comments.some((comment) => comment.body.includes("lost"))).toBe(false);
+    expect(commentFriction(f.cwd).length).toBeGreaterThan(0);
+  });
+
+  it("logs cache receipt lock and reconciliation problems with stable recurrence identity", async () => {
+    for (const boundary of ["cache", "receipt", "lock", "reconciliation"] as const) {
+      const first = await stateFriction(boundary);
+      const repeated = await stateFriction(boundary);
+      expect(first.length).toBeGreaterThan(0);
+      expect(repeated.length).toBeGreaterThan(0);
+      expect(first.every((entry) => validate(entry).ok)).toBe(true);
+      expect(repeated.every((entry) => validate(entry).ok)).toBe(true);
+      expect(repeated.map((entry) => entry.key)).toEqual(first.map((entry) => entry.key));
+    }
+  });
+});
+
 describe("routine publication policy", () => {
   it("creates then appends routine sections under explicit invocation ownership", async () => {
     const f = publicationFixture();
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index c663d71a6..5088b4287 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -12,6 +12,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 
 import type { IssueTracker } from "../../install/manifest.js";
+import { appendFrictionRow, frictionRow } from "../../ledgers/journal.js";
 import {
   actionHash,
   actionKey,
@@ -1358,6 +1359,11 @@ export interface OnceOptions {
    */
   recent?: number;
   purpose?: string;
+  publication?: RunContext["publication"];
+  workflow?: string;
+  /** Diagnostic attribution supplied by the publishing boundary. */
+  cwd?: string;
+  knownUrl?: string | null;
   budgetMs?: number;
   /** Where the redacted failure detail goes (stderr). */
   log: (line: string) => void;
@@ -1383,6 +1389,24 @@ interface ProgressBinding {
 }
 
 function progressBinding(t: TrackerTarget, o: OnceOptions): ProgressBinding | "conflict" | null {
+  const common = git(t.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+  if (!common) return null;
+  const target = [t.tracker, t.ownerRepo || t.jiraSite || t.linearTeam || "", t.issue].join("/");
+  if (o.publication && o.key) {
+    const { invocation, workflow } = o.publication;
+    return {
+      target,
+      invocation,
+      workflow,
+      file: path.join(
+        common,
+        "bkit-outbox",
+        "progress",
+        `${actionHash(`${target}\0${invocation}`)}.json`,
+      ),
+      priorDelivery: false,
+    };
+  }
   if (!o.file || !o.key) return null;
   const [workflow, runText, step, group, attempt] = o.key.split("/");
   if (!workflow || !/^\d+$/.test(runText ?? "")) return null;
@@ -1394,12 +1418,14 @@ function progressBinding(t: TrackerTarget, o: OnceOptions): ProgressBinding | "c
   const issue = issueIdOf(fid, t.tracker);
   if (issue !== null && issue !== t.issue) return "conflict";
   if (issue === null) return null;
-  const target = [t.tracker, t.ownerRepo || t.jiraSite || t.linearTeam || "", t.issue].join("/");
-  const invocation = actionHash(
-    [path.resolve(o.file), workflow, runText, run.startedAt].join("\0"),
-  );
-  const common = git(t.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-  if (!common) return null;
+  let invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
+  const association = runPublicationFile(common, o.file, workflow, run.startedAt);
+  if (fs.existsSync(association)) {
+    const parsed = parseJson(fs.readFileSync(association, "utf-8"));
+    const saved = asRecord(parsed.ok ? parsed.value : null);
+    if (saved.version === 1 && saved.workflow === workflow && typeof saved.invocation === "string")
+      invocation = saved.invocation;
+  }
   const at = run.steps.find(
     (row) =>
       row.step === step &&
@@ -1537,13 +1563,55 @@ function saveProgress(
   fs.writeFileSync(binding.file, JSON.stringify(state), { mode: 0o600 });
 }
 
-function commentDiagnostic(o: OnceOptions, text: string, warnings: string[]): void {
+export function commentDiagnostic(o: OnceOptions, text: string, warnings: string[]): void {
   const detail = redact(text);
   try {
     o.log(detail);
   } catch {
     warnings.push(`${detail}; comment diagnostic unavailable`);
   }
+  const workflow = o.publication?.workflow ?? o.workflow ?? o.key?.split("/")[0];
+  if (
+    !o.cwd ||
+    !workflow ||
+    !["design", "plan", "build", "debug", "ship", "auto"].includes(workflow)
+  )
+    return;
+  const stage = /receipt|engine-action/.test(text)
+    ? "receipt"
+    : /lock/.test(text)
+      ? "lock"
+      : /recognition|reconciliation|postflight/.test(text)
+        ? "reconciliation"
+        : /source|cache/.test(text)
+          ? "source"
+          : /association/.test(text)
+            ? "association"
+            : "delivery";
+  try {
+    const root = git(o.cwd, ["rev-parse", "--show-toplevel"]) ?? o.cwd;
+    const row = frictionRow({
+      workflow,
+      step: `comment-${stage}`,
+      noun: "tracker",
+      verb: "comment",
+      code: null,
+      bookRoot: root,
+    });
+    row.summary = `Workflow comment ${stage} unavailable`;
+    row.description = `${workflow} comment reporting encountered an exhausted ${stage} problem; substantive workflow work continues.`;
+    row.remediation =
+      "Inspect tracker availability or local comment state; delivery may start a fresh comment.";
+    if (o.knownUrl) row.references = [o.knownUrl];
+    if (appendFrictionRow(root, row).ok) return;
+  } catch {
+    warnings.push("[bkit-tracker] comment friction unavailable");
+  }
+  try {
+    o.log("[bkit-tracker] comment friction unavailable; continuing workflow");
+  } catch {
+    warnings.push("[bkit-tracker] friction diagnostic unavailable");
+  }
 }
 
 /** The latest of `recent` that is `body` posted before: same marker hash, else same text. */
@@ -1565,6 +1633,7 @@ export async function postCommentOnce(
   body: string,
   o: OnceOptions,
 ): Promise<TrackerOutcome> {
+  o = { ...o, cwd: t.cwd };
   const skip = skipOf(t);
   if (skip) return skip;
   const action = "comment";
@@ -1628,6 +1697,13 @@ export async function postCommentOnce(
       ) {
         try {
           cached = readProgress(binding);
+          if (cached === null && fs.existsSync(binding.file))
+            commentDiagnostic(
+              o,
+              "[bkit-tracker] progress source unavailable; creating standalone comment",
+              warnings,
+            );
+          if (cached) o.knownUrl = cached.comment.url;
           const rendered = progressSection(body, binding, o.key);
           section = rendered.section;
           if (routine) {
@@ -1744,11 +1820,7 @@ export async function postCommentOnce(
       }
     } catch (err) {
       const reason = classifyFailure(err);
-      commentDiagnostic(
-        o,
-        `tracker ${action} failed (${reason}): ${(err as Error).message ?? String(err)}`,
-        warnings,
-      );
+      commentDiagnostic(o, `tracker ${action} failed (${reason}); delivery unavailable`, warnings);
       seal();
       return { done: false, action, reason };
     }
@@ -1763,6 +1835,7 @@ export async function postCommentOnce(
           latest.updatedAt === posted.evidence.updatedAt;
       } catch {
         retain = false;
+        commentDiagnostic(o, "[bkit-tracker] postflight reconciliation unavailable", warnings);
       }
       if (!retain) seal();
     }
@@ -1831,14 +1904,86 @@ export const TRACKER_OUTPUT =
 
 /** The `commentFile` output key's meaning, shared by every verb that prints a comment. */
 export const COMMENT_FILE_OUTPUT =
-  "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null";
+  "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null or its source file is unavailable";
 
 /** How many of the issue's latest comments a re-run checks for the same marker hash. */
 export const RECENT_COMMENTS = 5;
 
 /** `comment` written to its body file, or null for no comment. */
-export const commentFileOf = (cwd: string, comment: string | null): string | null =>
-  comment === null ? null : writeBodyFile(cwd, "comment", comment);
+export function commentFileOf(
+  cwd: string,
+  comment: string | null,
+  ctx?: Pick<RunContext, "flags" | "publication" | "log">,
+): string | null {
+  if (comment === null) return null;
+  try {
+    return writeBodyFile(cwd, "comment", comment);
+  } catch {
+    commentDiagnostic(
+      {
+        cwd,
+        workflow: ctx?.publication?.workflow ?? str(ctx?.flags.workflow),
+        log: (line) => ctx?.log(line),
+      },
+      "[bkit-tracker] fallback source unavailable; continuing workflow",
+      [],
+    );
+    return null;
+  }
+}
+
+/** Optional session ownership, validated against this repository's private outbox. */
+export function sessionPublication(
+  cwd: string,
+  session: string | undefined,
+  workflow: string | undefined,
+): RunContext["publication"] {
+  if (!session || !workflow) return undefined;
+  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+  if (!common) throw new Error("session association repository unavailable");
+  const sessions = path.join(common, "bkit-outbox", "sessions");
+  const dir = fs.realpathSync(path.resolve(cwd, session));
+  if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
+    throw new Error("session association directory unavailable");
+  return { invocation: actionHash(`${dir}\0${workflow}`), workflow };
+}
+
+function runPublicationFile(common: string, file: string, workflow: string, at: string): string {
+  return path.join(
+    common,
+    "bkit-outbox",
+    "invocations",
+    `${actionHash([path.resolve(file), workflow, at].join("\0"))}.json`,
+  );
+}
+
+/** Bind only the exact run opened by workflows start; loss of this cache is harmless. */
+export function bindRunPublication(
+  ctx: RunContext,
+  file: string,
+  workflow: string,
+  run: number,
+): void {
+  try {
+    const publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow);
+    const current = readRunsLenient(file).filter((r) => r.workflow === workflow)[run - 1];
+    const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+    if (!publication || !current || !common) return;
+    const destination = runPublicationFile(common, file, workflow, current.startedAt);
+    if (fs.existsSync(destination)) return;
+    fs.mkdirSync(path.dirname(destination), { recursive: true });
+    fs.writeFileSync(destination, JSON.stringify({ version: 1, ...publication }), {
+      mode: 0o600,
+      flag: "wx",
+    });
+  } catch {
+    commentDiagnostic(
+      { cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) },
+      "[bkit-tracker] invocation association unavailable; progress may start fresh",
+      [],
+    );
+  }
+}
 
 /**
  * The engine-action key of a comment in `file`'s current run of `workflow` (the
@@ -1884,7 +2029,7 @@ function commentKey(
  * Post `body` for a verb's `--post`: once per key in `file` when both are given,
  * else once per marker hash among the issue's latest comments.
  */
-export function postForVerb(
+export async function postForVerb(
   ctx: RunContext,
   body: string,
   o: {
@@ -1895,12 +2040,53 @@ export function postForVerb(
     purpose?: OnceOptions["purpose"];
   },
 ): Promise<TrackerOutcome> {
-  const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
-  return postCommentOnce(t, body, {
-    file: o.file,
-    key: o.key,
-    purpose: o.purpose,
-    recent: o.file && o.key ? undefined : RECENT_COMMENTS,
-    log: (line) => ctx.log(line),
-  });
+  try {
+    const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
+    let publication = ctx.publication;
+    if (!o.file && !publication) {
+      try {
+        publication = sessionPublication(
+          ctx.cwd,
+          str(ctx.flags.sessionDir),
+          str(ctx.flags.workflow),
+        );
+      } catch {
+        commentDiagnostic(
+          { cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) },
+          "[bkit-tracker] invocation association unavailable; progress may start fresh",
+          [],
+        );
+        publication = undefined;
+      }
+    }
+    const key =
+      o.key ??
+      (publication
+        ? actionKey(
+            publication.workflow,
+            1,
+            "step",
+            str(ctx.flags.stepNumber),
+            str(ctx.flags.subStep),
+            str(ctx.flags.attempt),
+            "comment",
+          )
+        : undefined);
+    return await postCommentOnce(t, body, {
+      file: o.file,
+      key,
+      publication,
+      workflow: str(ctx.flags.workflow),
+      purpose: o.purpose ?? (str(ctx.flags.workflow) ? "routine" : undefined),
+      recent: key ? undefined : RECENT_COMMENTS,
+      log: (line) => ctx.log(line),
+    });
+  } catch {
+    commentDiagnostic(
+      { cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) },
+      "[bkit-tracker] comment preparation unavailable; continuing workflow",
+      [],
+    );
+    return { done: false, action: "comment", reason: "preparation" };
+  }
 }
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 513d10391..eb54f83bb 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -142,6 +142,7 @@ import {
   attempt,
   commentFileOf,
   postForVerb,
+  bindRunPublication,
   issueRef,
   readLabels,
   endedRunActionKey,
@@ -463,6 +464,7 @@ async function failVerb(ctx: RunContext): Promise<number> {
           fid,
           issue: str(ctx.flags.issue),
           ...(key === undefined ? {} : { file: state.status, key }),
+          purpose: "attention",
         })
       : undefined;
   const labelsWrite =
@@ -481,7 +483,7 @@ async function failVerb(ctx: RunContext): Promise<number> {
     trackerState: failedState,
     prState,
     comment,
-    commentFile: commentFileOf(ctx.cwd, comment),
+    commentFile: commentFileOf(ctx.cwd, comment, ctx),
     ...(tracker === undefined ? {} : { tracker }),
     ...(labelsWrite === undefined ? {} : { labelsWrite }),
     ...sessionRemoval(ctx),
@@ -928,7 +930,7 @@ async function handoverVerb(ctx: RunContext): Promise<number> {
   if (rec !== null) removeRecord(tree, fid);
   const tracker =
     ctx.flags.post === true && comment !== null
-      ? await postForVerb(ctx, comment, { fid })
+      ? await postForVerb(ctx, comment, { fid, purpose: "attention" })
       : undefined;
   ctx.emit({
     handover: present ? artifact : null,
@@ -936,7 +938,7 @@ async function handoverVerb(ctx: RunContext): Promise<number> {
     ref: pushed ? ref : null,
     skipped,
     comment,
-    commentFile: commentFileOf(ctx.cwd, comment),
+    commentFile: commentFileOf(ctx.cwd, comment, ctx),
     ...(tracker === undefined ? {} : { tracker }),
   });
   return code;
@@ -2040,10 +2042,10 @@ async function postClose(
   out: Record<string, unknown>,
 ): Promise<Record<string, unknown>> {
   const comment = typeof out.comment === "string" ? out.comment : null;
-  const withFile = { ...out, commentFile: commentFileOf(ctx.cwd, comment) };
+  const withFile = { ...out, commentFile: commentFileOf(ctx.cwd, comment, ctx) };
   if (ctx.flags.post !== true) return withFile;
   if (comment === null) throw new CommandError(EXIT.USAGE, "--post needs --number");
-  return { ...withFile, tracker: await postForVerb(ctx, comment, { fid }) };
+  return { ...withFile, tracker: await postForVerb(ctx, comment, { fid, purpose: "terminal" }) };
 }
 
 export const workflowsCommand: CommandSpec = {
@@ -2059,6 +2061,7 @@ export const workflowsCommand: CommandSpec = {
         FID_FLAG,
         MONTH_FLAG,
         STATUS_FILE_FLAG,
+        SESSION_DIR_FLAG,
         {
           name: "lock-held",
           type: "boolean",
@@ -2161,6 +2164,7 @@ export const workflowsCommand: CommandSpec = {
         recordChat(file, workflow, process.env);
         const runs = fold(readStatusEvents(file));
         const run = runNumber(runs, workflow);
+        bindRunPublication(ctx, file, workflow, run);
         const current = resumed ? lastRun(runs, workflow) : undefined;
         ctx.emit({
           lock,
@@ -2483,7 +2487,14 @@ export const workflowsCommand: CommandSpec = {
           squashSha: str(f.squashSha),
           ref: str(f.ref),
           ownerRepo: str(f.ownerRepo),
-          outbox: str(f.outbox),
+          outbox:
+            str(f.outbox) ??
+            (str(f.sessionDir)
+              ? path.join(
+                  path.dirname(path.dirname(path.resolve(ctx.cwd, String(f.sessionDir)))),
+                  String(f.fid),
+                )
+              : undefined),
           recordStep: f.recordStep === true,
           message: str(f.message),
           labels: list(f.label),
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 32dd35771..4c73916af 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -76,7 +76,7 @@ function fidOf(value: unknown): string {
 
 export const worktreeDir = (root: string, fid: string) => path.join(root, ".worktrees", fid);
 
-/** `.worktree-owned` in the git common dir's outbox: shared by every worktree, survives removal. */
+/** `.worktree-owned` is shared across worktrees; session invocation state stays separate. */
 export function ownershipMarker(root: string, fid: string): string {
   const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
   if (!common) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${root}`);
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index d9706254a..9c5016132 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -311,6 +311,7 @@ _No tracker connected, skip step._
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -339,7 +340,7 @@ _No tracker connected, skip step._
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1056,14 +1057,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 9bab4ab7e..1af8b389a 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -210,6 +210,7 @@ _No tracker connected, skip step._
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -238,7 +239,7 @@ _No tracker connected, skip step._
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index 06b5cf576..ea761e607 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -115,6 +115,7 @@ _No tracker connected, skip step._
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -142,7 +143,7 @@ _No tracker connected, skip step._
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index b1b636f5c..c7386ceef 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -123,6 +123,7 @@ _No tracker connected, skip step._
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -152,7 +153,7 @@ _No tracker connected, skip step._
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index fc0f8af71..9534fb403 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -144,7 +144,7 @@ _No tracker connected, skip step._
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -166,6 +166,7 @@ _No tracker connected, skip step._
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.bkit/core/workflows/bkit-auto.md b/.bkit/core/workflows/bkit-auto.md
index 6be7e758e..6e5dec4e8 100644
--- a/.bkit/core/workflows/bkit-auto.md
+++ b/.bkit/core/workflows/bkit-auto.md
@@ -38,27 +38,28 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 <!-- bkit:tracker github start -->
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 
@@ -74,7 +75,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 1. <!-- bkit:tracker true start -->
    Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 2. <!-- bkit:tracker true start -->
@@ -122,7 +123,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 4. <!-- bkit:tracker true start -->
    Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 
@@ -136,6 +137,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -144,7 +146,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 1. <!-- bkit:tracker true start -->
    Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
@@ -161,5 +163,6 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 074ee44b3..2763c3a21 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -53,21 +53,21 @@ description: "Build Feature — Autonomous implementation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__linear__save_issue_label({ name })` per printed `add` entry → `mcp__linear__save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })` → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "{TRACKER_STATE}" })`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", fields: { labels: [{LABELS}] } })` → move status to `{TRACKER_STATE}` (**Tracker** status change).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 <!-- bkit:tracker true start -->
@@ -376,7 +376,7 @@ description: "Build Feature — Autonomous implementation"
 9. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 
@@ -387,6 +387,7 @@ description: "Build Feature — Autonomous implementation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -421,7 +422,7 @@ description: "Build Feature — Autonomous implementation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1167,14 +1168,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1236,10 +1237,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
 7. <!-- bkit:tracker true start -->
-   **Skip if** `ISSUE_ID` empty. Comment:
+   **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
    <!-- bkit:tracker true end -->
 8. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty.
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index ad9690d95..a990b80e6 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -52,21 +52,21 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__linear__save_issue_label({ name })` per printed `add` entry → `mcp__linear__save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })` → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "{TRACKER_STATE}" })`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", fields: { labels: [{LABELS}] } })` → move status to `{TRACKER_STATE}` (**Tracker** status change).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 <!-- bkit:tracker true start -->
@@ -268,7 +268,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 9. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 
@@ -279,6 +279,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -312,7 +313,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -867,7 +868,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 10. <!-- bkit:tracker true start -->
     **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
     <!-- bkit:tracker true end -->
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 381927350..633bc8e4d 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -50,21 +50,21 @@ description: "Design Feature — Autonomous design phase"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__linear__save_issue_label({ name })` per printed `add` entry → `mcp__linear__save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })` → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "{TRACKER_STATE}" })`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", fields: { labels: [{LABELS}] } })` → move status to `{TRACKER_STATE}` (**Tracker** status change).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 <!-- bkit:tracker true start -->
@@ -173,7 +173,7 @@ description: "Design Feature — Autonomous design phase"
 7. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
    <!-- bkit:tracker true end -->
 
@@ -184,6 +184,7 @@ description: "Design Feature — Autonomous design phase"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 <!-- bkit:tracker true start -->
@@ -216,7 +217,7 @@ description: "Design Feature — Autonomous design phase"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -617,7 +618,7 @@ description: "Design Feature — Autonomous design phase"
    <!-- bkit:tracker true start -->
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
    <!-- bkit:tracker true end -->
 
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 02cd95ff3..0195b69c1 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -50,21 +50,21 @@ description: "Plan Feature — Autonomous plan generation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__linear__save_issue_label({ name })` per printed `add` entry → `mcp__linear__save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })` → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "{TRACKER_STATE}" })`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", fields: { labels: [{LABELS}] } })` → move status to `{TRACKER_STATE}` (**Tracker** status change).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 <!-- bkit:tracker true start -->
@@ -184,7 +184,7 @@ description: "Plan Feature — Autonomous plan generation"
 8. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
    <!-- bkit:tracker true end -->
@@ -196,6 +196,7 @@ description: "Plan Feature — Autonomous plan generation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -230,7 +231,7 @@ description: "Plan Feature — Autonomous plan generation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -530,7 +531,7 @@ description: "Plan Feature — Autonomous plan generation"
    <!-- bkit:tracker true start -->
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
    <!-- bkit:tracker true end -->
 
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index ffc23d320..8598da8e5 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -50,21 +50,21 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker github end -->
 <!-- bkit:tracker linear start -->
 
 - **Tracker:** Linear — `bkit` verbs read and write it; MCP server `linear` (`.mcp.json` `mcpServers.linear`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_issue_label`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; `save_*` writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `save_issue` ALWAYS includes `id` and is all-or-nothing (one state or label name the team lacks rejects the whole call) → labels and state in separate calls, labels first; create each printed `add` entry first via `save_issue_label({ name })` (`already exists` = done). `Could not find state` / `Could not find label` → log `Unapplied: <state|label> "<name>" not in team`, no retry, continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__linear__save_issue_label({ name })` per printed `add` entry → `mcp__linear__save_issue({ id: "{ISSUE_ID}", labels: [{LABELS}] })` → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "{TRACKER_STATE}" })`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 <!-- bkit:tracker linear end -->
 <!-- bkit:tracker jira start -->
 
 - **Tracker:** Jira — `bkit` verbs read and write it over the same Rovo MCP endpoint; MCP server `jira` (`.mcp.json` `mcpServers.jira`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__jira__getJiraIssue`, `mcp__jira__editJiraIssue`, `mcp__jira__transitionJiraIssue`, `mcp__jira__addOrEditJiraIssueComment`, `mcp__jira__searchJiraIssuesUsingJql`, `mcp__jira__executeRead`; every call passes `cloudId: "{TRACKER_SITE}"`. Assert `{ISSUE_ID}` / `{TRACKER_SITE}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue. `getJiraIssue` ALWAYS passes `view: "evidence"` (other views omit labels). `editJiraIssue` `fields.labels` replaces the whole set → pass full printed `LABELS`; labels and status in separate calls, labels first; NEVER pass `fields` / `update` to `transitionJiraIssue`. Status change: `executeRead({ name: "listJiraIssueTransitions", inputs: { issueIdOrKey } })` → transition whose `to.name` = target status → `transitionJiraIssue({ issueIdOrKey, transitionId })`; none → log `Unapplied: status "<name>" not reachable`, no retry, continue. Comment reads: `executeRead({ name: "listJiraIssueComments", inputs: { issueIdOrKey, maxResults: 100, startAt } })`, oldest first, raise `startAt` while `isLast` is false; page with `appliedContentFormat` = `html` → re-read it one comment per call (`maxResults: 1`).
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", fields: { labels: [{LABELS}] } })` → move status to `{TRACKER_STATE}` (**Tracker** status change).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held. Fallback body over 32,767 characters → post as consecutive comments split at line breaks, in order (the engine splits its own posts the same way).
 
 <!-- bkit:tracker jira end -->
 <!-- bkit:tracker true start -->
@@ -204,7 +204,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -238,6 +238,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 80695c8df..357c47af6 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -76,3 +76,4 @@
 {"schema":3,"ts":1793662216646,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":1}
 {"schema":3,"ts":1793662276809,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":2,"lastConfirmed":1793662276809}
 {"schema":3,"ts":1793862559373,"kind":"friction","key":"build-826-resume-rebase-recovery","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["docs/plans/202611/logs/826-append-routine-workflow/status.jsonl"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Resume rebase required manual skill-lock and generated documentation conflict recovery","description":"The rebase resolver refused skills-lock.json and its own untracked recovery log prevented abort. Owner requested resolution and continuation. Preserved both skill sets, retained current dev documentation over stale generated diagrams, moved session recovery files under tmp, and completed all replayed commits.","remediation":"Completed the owner-authorized conflict recovery; refresh generated metadata in the final implementation verification.","source":"orchestrator","status":"CLOSED"}
+{"schema":3,"ts":1793868455471,"kind":"friction","key":"build-826-remediation-model-capacity","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["docs/plans/202611/logs/826-append-routine-workflow/build-plan-gaps-remediate-3-1-log.md"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Remediation agent interrupted by model capacity","description":"The remediation agent hit a model-capacity error after source fixes and broad-check evidence were saved. It resumed from the same files without repeating the broad check.","remediation":"Resumed the same agent to finish targeted checks and its truthful report.","source":"orchestrator","status":"CLOSED"}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 1580435f5..af08ecbc2 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1138,11 +1138,11 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:406`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:407`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-design:201`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-plan:215`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-plan:216`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-ship-conflict-resolve:32`: "`git add`, `git checkout --theirs|--ours <conflicted>`" Permits `git add` (`commits` says subagents do not commit; staging is allowed here only for rebase or merge resolution, matching `destructive-git-prohibited`'s in-progress-rebase carve-out)
     - kept: staging and `git rebase --continue` are the in-progress rebase resolution `destructive-git-prohibited` carves out, and `git merge --abort` is on none of its prohibited forms; the caller commits and pushes
@@ -1235,11 +1235,11 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:406`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:407`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-design:201`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-plan:215`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-plan:216`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `utility-new-release:30`: "are pre-approved by the owner's release request" Declares commit / push / PR / merge into main / tag pre-approved by 'the owner's release request'; `pushes` says one approval covers one push, but this run does up to three pushes (dev backmerge, release branch, tag); `production-merge` requires explicit human confirmation for any merge into main
     - kept: release flow as designed: the human release request approves its commit, pushes, PR into `main`, merge and tag
@@ -1369,7 +1369,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:583`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1668,7 +1668,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:583`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -5324,10 +5324,11 @@ Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKE
 - carriers: workflow all
 
 ```text
-**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+**Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 ```
 
 ```retired
+**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the printed `comment` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** Post the `comment` a step's `bkit` block prints as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` before its gate; every gate includes `Issue comment attempted (Step N section)`. Post the printed `comment` byte-for-byte; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
@@ -5343,10 +5344,11 @@ Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKE
 - distinct-from: `workflow-comments-github`
 
 ```text
-**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+**Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 ```
 
 ```retired
+**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the printed `comment` byte-for-byte as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`); never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** Post the `comment` a step's `bkit` block prints as a new comment via `mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` (no `id`) before its gate; every gate includes `Issue comment attempted (Step N section)`. Post the printed `comment` byte-for-byte; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
@@ -5362,10 +5364,11 @@ Fallback (`tracker.done` = false): `mcp__jira__editJiraIssue({ cloudId: "{TRACKE
 - distinct-from: `workflow-comments-github`, `workflow-comments-linear`
 
 ```text
-**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+**Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 ```
 
 ```retired
+**Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the printed `comment` byte-for-byte as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`); never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
 **Comments:** Post the `comment` a step's `bkit` block prints as a new comment via `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`) before its gate; every gate includes `Issue comment attempted (Step N section)`. Post the printed `comment` byte-for-byte; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
@@ -6013,6 +6016,15 @@ Write the input file — session prompt, issue text, plan (when present):
 Acquire concurrency lock:
 ```
 
+### workflow-gate-comment-attempt
+
+- workflow: repeatable
+- carriers: workflow all
+
+```text
+Issue comment attempted when applicable
+```
+
 ### workflow-gate-issue-id
 
 - workflow: where-used
@@ -9731,6 +9743,7 @@ Same text in 2+ files. `- carriers:` names them per surface; `pnpm instructions:
 - source: `.bkit/core/workflows/bkit-auto.md`
 
 ```text
+**Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 **Role:** Orchestrator — phase-routed auto-dispatcher.
 **Scope:** Route an invocation to the matching bkit phase skill.
 [tracker-mcps] **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
diff --git a/.bkit/trackers.md b/.bkit/trackers.md
index 3e8f7ec9f..926abfb99 100644
--- a/.bkit/trackers.md
+++ b/.bkit/trackers.md
@@ -18,6 +18,14 @@
 >   - Add a `<!-- bkit:tracker <name> -->` block after the last tracker block at every call site, and extend `GROUP_RE` in `.bkit/core/engine/render/trackers.ts`.
 > - There is no `none` marker. No-tracker content goes in a `false` block.
 
+## Workflow comment delivery
+
+The engine may append routine reports to its own eligible progress comment. Ownership comes from an explicit repo-info session or an exact workflow run, never another active run. A later human or unrelated comment, missing ownership evidence, or a capacity rollover starts a new comment. Attention reports and terminal summaries always use new comments.
+
+The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
+
+Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable. Provider capacity limits remain conservative until a disposable, explicitly authorized live probe verifies them.
+
 ## Marker contract
 
 Workflow and prompt sources carry the variant for each wired tracker inline. The installer reads `bkit.tracker.default` from the consumer's manifest, and resolves the markers when it mirrors `.bkit/core/workflows/bkit-*.md` to every host's commands / skills and `.bkit/core/prompts/bkit-*.md` to every host's agents (`.bkit/core/engine/render/trackers.ts`). The mirrors are clean: no marker survives.
@@ -95,7 +103,7 @@ This renders `N. <body>` when a tracker is wired, and `N. _No tracker connected,
 | `issue-update-failed` | Failure Path additive `bkit:failed` | `issue_write` labels | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
 | `issue-update-merged` | Ship terminal — `bkit:merged` + In Review (issue left open; human closes) | `issue_write` `bkit:merged` (no close) | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
 | `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add / update item | no-op (state carries) | no-op (status carries) | skip |
-| `comment-post-step` | new comment per workflow step | `add_issue_comment` | `save_comment` | `addOrEditJiraIssueComment` | skip |
+| `comment-post-step` | engine-owned routine progress; create-only fallback | `add_issue_comment` | `save_comment` without `id` | `addOrEditJiraIssueComment` without `commentId` | skip |
 | `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | JQL `linkedIssues(KEY, "is blocked by") AND statusCategory != Done` | skip |
 | `kill-switch-check` | Terminate if `bkit:auto` absent; skipped when `ISSUE_ID` empty | label check | label check | label check | inactive |
 | `pr-body-metadata` | Parse PR-body issue / FID marker; FID-only marker (no issue) → `issueId: null`, `/bkit-auto` fails closed | `pull_request_read` + parse | same (GitHub PR) | same (GitHub PR) | FID-only, no fail-closed |
diff --git a/.bkit/version b/.bkit/version
index 1e22fdb11..04d9868be 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "f618c8d0f207e811d4b179f2827480751fadc2058f29712657b48055d94501b6",
-    "docs/testing.md": "c565fe832a59a265700b7de9bddd6c25697c98d598eb92ef44029955ac4dba1d",
+    "docs/testing.md": "da17b9f316fe9dcf0b2bee590b0a42e2f4bff1d49c196240ea033ba02d8e0db0",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -14,21 +14,21 @@
     "docs/data-schema.md": "04a3b4453f53ee349c774c5bf28ef439d2488ed8ee17a0e0840f98911f530a2c",
     ".gitattributes": "33399602be95aaa41c6539ffea6dc408358af3b4358201a97938b434a945d35f",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "ab988ffbfa7d7c2298dc48b52ae50d2966874009580783feda910115704acb7f",
+    "docs/observability.md": "a5e576a19e5a6d328e6c4d92318aaf3ac29e11734af8b4d6e30fb55773a06b34",
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
-    "docs/security.md": "ccf6c376c8a347972a335a43232f3d5db49acb9d0c9083f6c52c73de3013cb10",
+    "docs/security.md": "dd5bce8596878f6dee828fc69d8d051aa042c4044153f1c7620cd122872b7259",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "26fc0be395978a806ebc35fc85d3fb4e26297ebdb58115117efccb38c5b6dccb",
+    "docs/architecture.md": "c98d8456fa7ac818bc2f336ac14bd1c5fceead59e99eae4b493ac9d0a464786d",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
     ".bkit/.env.example": "817fa9ffb183f34a004f824a5d58416cc7ed1f336218024262dd7ada68c44641",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
-    ".claude/commands/bkit-auto.md": "2138147c1ccc2fa2140d63dad0f0bb87a2dd029aeb7b1d3bb921efd2e4518ed9",
-    ".claude/commands/bkit-build.md": "62848efff9714fe59a89ec2c732e748d62cdda928eb644aecb743ba0c26773d9",
-    ".claude/commands/bkit-debug.md": "f823954f3304334ed8be9f42e24e2a47134ec45bbc278620d52a261dd9e60e16",
-    ".claude/commands/bkit-design.md": "19a95a441ac6dba3b45982fb284817a7c908bf8a94b7f7a99e31ff46b1f7622a",
-    ".claude/commands/bkit-plan.md": "0341314c76583e079ea635940d45c4da20ce4725d963d28aa4678adbff4eba6e",
-    ".claude/commands/bkit-ship.md": "8c4f9c0c2f5c08b5e61eea82bee4d4c3dd684ab7bda0124bfda1aa3a003e4f47",
+    ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
+    ".claude/commands/bkit-build.md": "e46a6eb1b8211384245ff936e76edb528f739533250f2739211cc41036521bb2",
+    ".claude/commands/bkit-debug.md": "f1304c91860d5e0f5bd3cf1b83262cb062004b2e62a4362254d91991a7796024",
+    ".claude/commands/bkit-design.md": "e7b100d353cf886b88ba95572d3eb8f88ac09e584417f2823e6c817de6b21cf5",
+    ".claude/commands/bkit-plan.md": "72b4b5b7461d58621715c10f684bcbafcfa343efce541c2481f6a45be2f2fbc1",
+    ".claude/commands/bkit-ship.md": "b9116db64902b23b5c439edfbaf83580d618507c1e1814798173a91dafafafe4",
     ".claude/agents/bkit-build-challenge-1.md": "1f0761c059842a1dcefff95f27fe3cc68e41155f03c8929d88ccc0c83461d290",
     ".claude/agents/bkit-build-challenge-2.md": "1ec51a399c91f576f95af0e0625983ded825282f0050540007a288c364777227",
     ".claude/agents/bkit-build-install-skills.md": "4da65c11fa042e5b578717c510dfaf3e8fe51466c04adc63cb16a8215913b817",
@@ -55,12 +55,12 @@
     ".claude/agents/bkit-ship-update-docs.md": "f10a697f8f4d98b22b220c4405d64c7f31d78d32384ef0a64102b6da6a67c9e9",
     ".claude/agents/bkit-utility-compress-markdown.md": "48aee178590ac282a2de281a33454833d3df07065d2e174a73373e1f74dd2be3",
     ".claude/agents/bkit-utility-update-documentation.md": "aa2d0541c2b77b0f647ee0d046c38446d90598ad23af0ea8907a52b471b39768",
-    ".cursor/commands/bkit-auto.md": "0427bf3119bfd22d7345cbd6c7a0fb7ee01e4d8947b41d43fe0dfd3b88be664c",
-    ".cursor/commands/bkit-build.md": "995a839dad039d23905da34dc84abfd684511ecd8d69fece5cc06b60d658891f",
-    ".cursor/commands/bkit-debug.md": "5c9c0b07c266086fc0081f185931cf23199dc11598a53214ccaf55dcc11fc465",
-    ".cursor/commands/bkit-design.md": "37c549d2480700d1560e84f75cf7303de22e4e1b3e4d344c011b980d3df04ef7",
-    ".cursor/commands/bkit-plan.md": "a20499d7f63bd6927bbf8615b4363e0b52ab5328e3ec588399c9ee76ff45633b",
-    ".cursor/commands/bkit-ship.md": "8e2e9a15dc18ca273b3ca78c8ec52a1b0a6b3fd2df1dac6457f286fa74c847fc",
+    ".cursor/commands/bkit-auto.md": "4c152651b33c0ba41f323ade39b9d578d6af66e3cea25d9464a408eb357e4a05",
+    ".cursor/commands/bkit-build.md": "09044773ec64cb5b484766b38af48f7f934a14b6258dc37ea1eef91ee2ffffa8",
+    ".cursor/commands/bkit-debug.md": "c02ad2c9c5b1e44a1c50f422b3244bc81f71006a31717e8e594fbe5744961b4b",
+    ".cursor/commands/bkit-design.md": "505e4909b51ec35696974a567c6b720a5f2a20e0b9ae4dccd814060319497dfd",
+    ".cursor/commands/bkit-plan.md": "a0328b0487eff4968a76907eebb76e5f7cb25a3c46f961458ef5fb5c1753b935",
+    ".cursor/commands/bkit-ship.md": "7237c78c9f0fe01d724821eb3a48c5abb71d26cb0274889d7deb539ab37c178d",
     ".cursor/agents/bkit-build-challenge-1.md": "38fb30e36724318e5e986f69ad598e5f5b4b087b084101e68d330d9353287ff2",
     ".cursor/agents/bkit-build-challenge-2.md": "de62e52353593d44629e9b32d824578e629815566c7e7cf81336d2ec396fbe69",
     ".cursor/agents/bkit-build-install-skills.md": "823ebd00f4d9e732796520677b2d2b5aa17fbd72dcbc9a92ff78bf141c44af95",
@@ -113,12 +113,12 @@
     ".opencode/agents/bkit-ship-update-docs.md": "ca9cd4fd12e76d787b7ad00717fb91732e183cff35d8fc7ea9b97ce084c0d09e",
     ".opencode/agents/bkit-utility-compress-markdown.md": "6eeac027ab801c0ad404351a6b1ee043a45442c0cf268f444a028071a8bafd7a",
     ".opencode/agents/bkit-utility-update-documentation.md": "5fd081ae119984018573f62444493240b66411a75ec2aeafe6bdd1b1de903390",
-    ".opencode/commands/bkit-auto.md": "fc58b4ee7002f92bbbf340cbd4bc0eb16de47a277d73de985e501a7e4f8c014b",
-    ".opencode/commands/bkit-build.md": "298ff9c7d326fabd8bb5dfbe2c5c0449e65d29325f747f3728fb17c63ed6d646",
-    ".opencode/commands/bkit-debug.md": "fd6fb51723987c3207200d2dd3c80bd2baedca303321ca1d1afbd32b591cc30d",
-    ".opencode/commands/bkit-design.md": "dc44ed4aa15a92ec39321cb6771447e6e33665dbb8bced3f74c5bde487d8ddec",
-    ".opencode/commands/bkit-plan.md": "5ef51aac5d84bc5fbdde4a2809186cada12ef9e0ed902ce50c21d4e93aebf380",
-    ".opencode/commands/bkit-ship.md": "25dd5c4829173dc82f91eec485d690e0ea94f7861269aed859956dc519c7aa24",
+    ".opencode/commands/bkit-auto.md": "3440ae6b925da8906394459788c702adaebd1acfe9c3fa0eddc3b40102596606",
+    ".opencode/commands/bkit-build.md": "bec0b15ed3112e45044c582559461c24eb2964a5db7417951a2a4fd2f32d3d7b",
+    ".opencode/commands/bkit-debug.md": "508ad6d28451d31b85933f4f866fb33338543d75a1d7da4004227ac4b11b0fe8",
+    ".opencode/commands/bkit-design.md": "b26082616675924b1617cbd56a3be75b9045ca6abe809e7d93a6bff203ca1bff",
+    ".opencode/commands/bkit-plan.md": "75e9b3ce72892071c9a1de753cef3d5ff124aa1dee2b0c1917adcb2c87fb9b97",
+    ".opencode/commands/bkit-ship.md": "ba943cecba745e195188e7848302169f5fa05fd284e6ef3797a53e62c41f38a4",
     ".claude/agents/bkit-design-spike.md": "6ebe2fa4b367cf183bf1fe766e95afff9ebcbfd5b25f86bd3e74af7c43833861",
     ".cursor/agents/bkit-design-spike.md": "996a40f60dde3f1c3cc8ce47cdf13e1bf3524aadc73b29ae7bdfb12cd120b7b2",
     ".opencode/agents/bkit-design-spike.md": "1b809bb8969f4b9e667c353acc28c673af0163486770aa9054027af638fb173d",
@@ -223,8 +223,8 @@
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
     ".bkit/providers.md": "556318e0b5573604d0d56acfa315af47ea45c26a71e2e59600514d2cb3c431fc",
     ".bkit/prompts.md": "5c584b31cb1349e80e073b44ee9ab497fbc316ed75ffbca4a58dac787e34b49b",
-    ".bkit/trackers.md": "9db8826f990a21a46a8f70a2022d5a2e0e21c64fc50b3b5aecf84d146b6e094a",
-    ".bkit/workflows.md": "e89af18e6bbdf5dcc79b371e945315db29d85d8f2f802e8e716e0cb24ebc99b1",
+    ".bkit/trackers.md": "6ef72e73d1aaac217dcbacc1b8a3d26754bc4df8377de6564d52a9a763db1616",
+    ".bkit/workflows.md": "c1ea2895be374e33798804c3e6b7e428f38060a8b1829c7ab08d35cd5261bc79",
     ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "31ff612ce7d455d472add1d5810b6fc50d173fb3e4b4ffe2caeb6eab1b9b5316",
+    ".bkit/cli.md": "94db45116e7b408547444d6d5fc1f88e86730a1fd3b21aaee13e4aa23e627741",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index b4d022c8e..8fecfddaa 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -40,6 +40,14 @@ Skill selection and activation within every workflow follow `.agents/skills.md`
 | `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
 | `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR number **or** FID slug for ship / debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; debug receives the exact held run reference; the same session continues into the dispatched skill |
 
+## Tracker reporting
+
+Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
+
+Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
+
+A published build prepares its close report before the push and includes that report in its single Create PR completion comment. A held build posts its close report directly. The published completion retains its own exact fallback file after the PR link is added.
+
 ## When to Run
 
 Choose by the state of the work. Procedure stays in the command file and in § Per-Phase Workflows.
diff --git a/.claude/commands/bkit-auto.md b/.claude/commands/bkit-auto.md
index a74874d89..b530db812 100644
--- a/.claude/commands/bkit-auto.md
+++ b/.claude/commands/bkit-auto.md
@@ -39,12 +39,13 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 **Rules:** Copied word for word from `.agents/rules.md`.
@@ -58,7 +59,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
 2. **Skip if** `ISSUE_ID` empty. Add `bkit:failed` (prior phase label persists, additive):
    ```bash
@@ -89,7 +90,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
    Hold `phase` as `PHASE`, `mode` as `MODE`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `issueId` as `ISSUE_ID`, `fid` as `FID`, `prNumber` as `PR_NUMBER`, `branch` as `BRANCH`, `headSha` as `HEAD_SHA`, `prUrl` as `PR_URL`, `runId` as `RUN_ID`, `ref` as `REF` (`null` → empty).
 4. Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -102,6 +103,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -109,7 +111,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 
 1. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
@@ -125,5 +127,6 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 768f75a36..8e94e84dd 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -41,7 +41,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -53,7 +53,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -339,7 +339,7 @@ description: "Build Feature — Autonomous implementation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -349,6 +349,7 @@ description: "Build Feature — Autonomous implementation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -381,7 +382,7 @@ description: "Build Feature — Autonomous implementation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1119,14 +1120,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1187,10 +1188,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
-7. **Skip if** `ISSUE_ID` empty. Comment:
+7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
    "{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 514871ee1..eacc2e7bb 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -52,7 +52,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -230,7 +230,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -240,6 +240,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -271,7 +272,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -803,7 +804,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
 10. **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
diff --git a/.claude/commands/bkit-design.md b/.claude/commands/bkit-design.md
index 04e03d605..e2dd7a3e5 100644
--- a/.claude/commands/bkit-design.md
+++ b/.claude/commands/bkit-design.md
@@ -50,7 +50,7 @@ description: "Design Feature — Autonomous design phase"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -135,7 +135,7 @@ description: "Design Feature — Autonomous design phase"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -145,6 +145,7 @@ description: "Design Feature — Autonomous design phase"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -175,7 +176,7 @@ description: "Design Feature — Autonomous design phase"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -548,7 +549,7 @@ description: "Design Feature — Autonomous design phase"
    - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 12 — Close Workflow
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index dbcad218d..e3970cc10 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -50,7 +50,7 @@ description: "Plan Feature — Autonomous plan generation"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -144,7 +144,7 @@ description: "Plan Feature — Autonomous plan generation"
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 8. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
 
@@ -155,6 +155,7 @@ description: "Plan Feature — Autonomous plan generation"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -187,7 +188,7 @@ description: "Plan Feature — Autonomous plan generation"
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -466,7 +467,7 @@ description: "Plan Feature — Autonomous plan generation"
    - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 8 — Close Workflow
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 27819a880..4b21863b5 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -50,7 +50,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -167,7 +167,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -197,6 +197,7 @@ description: "Ship Feature — Autonomous merge and archive"
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.cursor/commands/bkit-auto.md b/.cursor/commands/bkit-auto.md
index 12b6a20d1..4d1a1a45e 100644
--- a/.cursor/commands/bkit-auto.md
+++ b/.cursor/commands/bkit-auto.md
@@ -38,12 +38,13 @@ Auto — Phase-routed dispatch of any bkit phase
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 **Rules:** Copied word for word from `.agents/rules.md`.
@@ -57,7 +58,7 @@ Auto — Phase-routed dispatch of any bkit phase
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
 2. **Skip if** `ISSUE_ID` empty. Add `bkit:failed` (prior phase label persists, additive):
    ```bash
@@ -88,7 +89,7 @@ Auto — Phase-routed dispatch of any bkit phase
    Hold `phase` as `PHASE`, `mode` as `MODE`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `issueId` as `ISSUE_ID`, `fid` as `FID`, `prNumber` as `PR_NUMBER`, `branch` as `BRANCH`, `headSha` as `HEAD_SHA`, `prUrl` as `PR_URL`, `runId` as `RUN_ID`, `ref` as `REF` (`null` → empty).
 4. Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -101,6 +102,7 @@ Auto — Phase-routed dispatch of any bkit phase
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -108,7 +110,7 @@ Auto — Phase-routed dispatch of any bkit phase
 
 1. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
@@ -124,5 +126,6 @@ Auto — Phase-routed dispatch of any bkit phase
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index b7e78fff7..f14df86ce 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -40,7 +40,7 @@ Build Feature — Autonomous implementation
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -52,7 +52,7 @@ Build Feature — Autonomous implementation
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -338,7 +338,7 @@ Build Feature — Autonomous implementation
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -348,6 +348,7 @@ Build Feature — Autonomous implementation
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -380,7 +381,7 @@ Build Feature — Autonomous implementation
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1118,14 +1119,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1186,10 +1187,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
-7. **Skip if** `ISSUE_ID` empty. Comment:
+7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
    "{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 427521f75..d97535d79 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -51,7 +51,7 @@ Debug Feature — Autonomous diagnosis and remediation
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -229,7 +229,7 @@ Debug Feature — Autonomous diagnosis and remediation
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -239,6 +239,7 @@ Debug Feature — Autonomous diagnosis and remediation
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -270,7 +271,7 @@ Debug Feature — Autonomous diagnosis and remediation
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -802,7 +803,7 @@ Debug Feature — Autonomous diagnosis and remediation
 
 10. **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
diff --git a/.cursor/commands/bkit-design.md b/.cursor/commands/bkit-design.md
index e9058d42c..83c8a7258 100644
--- a/.cursor/commands/bkit-design.md
+++ b/.cursor/commands/bkit-design.md
@@ -49,7 +49,7 @@ Design Feature — Autonomous design phase
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -134,7 +134,7 @@ Design Feature — Autonomous design phase
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -144,6 +144,7 @@ Design Feature — Autonomous design phase
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -174,7 +175,7 @@ Design Feature — Autonomous design phase
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -547,7 +548,7 @@ Design Feature — Autonomous design phase
    - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 12 — Close Workflow
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index 5bfb26c2f..abafa0007 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -49,7 +49,7 @@ Plan Feature — Autonomous plan generation
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -143,7 +143,7 @@ Plan Feature — Autonomous plan generation
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 8. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
 
@@ -154,6 +154,7 @@ Plan Feature — Autonomous plan generation
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -186,7 +187,7 @@ Plan Feature — Autonomous plan generation
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -465,7 +466,7 @@ Plan Feature — Autonomous plan generation
    - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 8 — Close Workflow
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 230742860..3fad05cca 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -49,7 +49,7 @@ Ship Feature — Autonomous merge and archive
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -166,7 +166,7 @@ Ship Feature — Autonomous merge and archive
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -196,6 +196,7 @@ Ship Feature — Autonomous merge and archive
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/.opencode/commands/bkit-auto.md b/.opencode/commands/bkit-auto.md
index d3b342090..dbb5f0e1d 100644
--- a/.opencode/commands/bkit-auto.md
+++ b/.opencode/commands/bkit-auto.md
@@ -42,12 +42,13 @@ $ARGUMENTS
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
+- **Invocation ownership:** Auto keeps a separate invocation from its dispatched phase; each phase obtains its own `repo info` session.
 - **External tools:** `gh` reads the PR and its CI run. **If** `gh` is missing or unauthenticated (exit 80) → **Failure Path**. Tracker reads and writes go through `bkit` verbs. Use the tracker MCP only when a verb prints `tracker.done` = false or exits 80.
 
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. Assert `{ISSUE_ID}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path).
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 **Rules:** Copied word for word from `.agents/rules.md`.
@@ -61,7 +62,7 @@ $ARGUMENTS
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md`. `{STDERR_FILE}` = a file holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command. Post the printed `comment` — **Skip if** `{ISSUE_ID}` or `{OUTBOX_ROOT}` is not held:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --kind=failure --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
    ```
 2. **Skip if** `ISSUE_ID` empty. Add `bkit:failed` (prior phase label persists, additive):
    ```bash
@@ -92,7 +93,7 @@ $ARGUMENTS
    Hold `phase` as `PHASE`, `mode` as `MODE`, `ownerRepo` as `OWNER_REPO`, `owner` as `OWNER`, `repo` as `REPO`, `issueId` as `ISSUE_ID`, `fid` as `FID`, `prNumber` as `PR_NUMBER`, `branch` as `BRANCH`, `headSha` as `HEAD_SHA`, `prUrl` as `PR_URL`, `runId` as `RUN_ID`, `ref` as `REF` (`null` → empty).
 4. Comment. `MODE` = BRIEF drops `--tree`, `--pr-number`, `--pr-url`, `--run-id`. `MODE` = CI_DEV drops `--pr-number`, `--pr-url`, `--run-id`:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -105,6 +106,7 @@ $ARGUMENTS
 
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Run context recovered
+- [ ] Issue comment attempted when applicable
 
 ---
 
@@ -112,7 +114,7 @@ $ARGUMENTS
 
 1. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=2 --step-title=Dispatch --field=Phase={PHASE}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=auto --step-number=2 --step-title=Dispatch --field=Phase={PHASE} --session-dir="{SESSION_DIR}"
    ```
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
@@ -128,5 +130,6 @@ $ARGUMENTS
 ### 🔒 Gate 2 — Dispatch
 
 - [ ] Reference derived
+- [ ] Issue comment attempted when applicable
 - [ ] Phase skill invoked
 - [ ] Orchestrator exits and the dispatched skill owns the session
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index cee5deaea..df029be4c 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -44,7 +44,7 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -56,7 +56,7 @@ $ARGUMENTS
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -342,7 +342,7 @@ $ARGUMENTS
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=build --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -352,6 +352,7 @@ $ARGUMENTS
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Long-branch advisory emitted
 
@@ -384,7 +385,7 @@ $ARGUMENTS
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
-   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
@@ -1122,14 +1123,14 @@ This block appends the roadmap row in the worktree only, closes and commits the
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    ```
 
    Route:
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE` and `finalReturn` as `FINAL_RETURN`. The close prepares its report for the single completion comment in sub-step 7.
 
    Push with the HEAD-Subject Assertion:
 
@@ -1190,10 +1191,11 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
    - **If** exit 0 → sub-step 7.
    - **Else** → **Failure Path**.
-7. **Skip if** `ISSUE_ID` empty. Comment:
+7. **Skip if** `ISSUE_ID` empty. Post the completion report with the PR link. Drop `--body-file` when `CLOSE_COMMENT_FILE` is null:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --workflow=build --file="{STATUS}" --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL} --body-file="{CLOSE_COMMENT_FILE}"
    ```
+   Hold this report's `commentFile` as `CLOSE_COMMENT_FILE` and `tracker` as `CLOSE_TRACKER` for sub-step 10's fallback.
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
    "{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 337d0a6b3..9edfa539a 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -55,7 +55,7 @@ $ARGUMENTS
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -233,7 +233,7 @@ $ARGUMENTS
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 9. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=debug --workflow-heading --step-number=1 --step-title="Start Workflow" --field=Mode={DEBUG_MODE} --field=Push={PUSH_MODE} --attempt={DEBUG_ATTEMPT} --owner-repo={OWNER_REPO} --tree={BRANCH} --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -243,6 +243,7 @@ $ARGUMENTS
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Push mode decided
 - [ ] Debug attempt derived
@@ -274,7 +275,7 @@ $ARGUMENTS
 2. Open the run inside the worktree:
    ```bash
    mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN}
+   "{BKIT}" workflows start --workflow=debug --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}"
    ```
    Hold `file` as `STATUS`.
 3. Write the input file — session prompt, issue text, plan (when present):
@@ -806,7 +807,7 @@ $ARGUMENTS
 
 10. **Skip if** `ISSUE_ID` empty. Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url="{PR_URL}"` when `TRIGGER_PR` = 1, plus `--run-id={VERIFY_RUN_ID}` when known, else empty. With selected CI, `{CI_PROOF_FIELDS}` = `--field="Original failure={CI_RUN_URL}" --field="Verification={VERIFY_RUN_URL}"`, else empty; artifact links and telemetry report written by sub-step 2:
     ```bash
-    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md"
+    "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=11 --step-title="Close Workflow" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} {CI_PROOF_FIELDS} --section="Artifacts={OUTBOX}/close-artifacts.md" --section="Telemetry={OUTBOX}/close-telemetry.md" --session-dir="{SESSION_DIR}"
     ```
 11. Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Original failure: {CI_RUN_URL} (run {CI_RUN_ID}). Verification: {VERIFY_RUN_URL} (run {VERIFY_RUN_ID}).` after the successful pushed-head checks. Do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
diff --git a/.opencode/commands/bkit-design.md b/.opencode/commands/bkit-design.md
index eac0418c2..8b7b62af0 100644
--- a/.opencode/commands/bkit-design.md
+++ b/.opencode/commands/bkit-design.md
@@ -53,7 +53,7 @@ $ARGUMENTS
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -138,7 +138,7 @@ $ARGUMENTS
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --session-dir="{SESSION_DIR}"
    ```
 
 ### 🔒 Gate 1 — Start Workflow
@@ -148,6 +148,7 @@ $ARGUMENTS
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 
 
@@ -178,7 +179,7 @@ $ARGUMENTS
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=design --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=design --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=design >/dev/null
    ```
@@ -551,7 +552,7 @@ $ARGUMENTS
    - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 12 — Close Workflow
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 15cad48e5..3a5e9f9d0 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -53,7 +53,7 @@ $ARGUMENTS
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -147,7 +147,7 @@ $ARGUMENTS
    **If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
 8. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}"
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --workflow-heading --step-number=1 --step-title="Start Workflow" --owner-repo={OWNER_REPO} --tree=dev --line="Parent design: {None|[{PARENT_FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{PARENT_YYYYMM}/{PARENT_FID}-design.md)}" --line="Audit reports: {None|[{AUDIT_FILE}](https://github.com/{OWNER_REPO}/blob/dev/{AUDIT_PATH})}" --session-dir="{SESSION_DIR}"
    ```
    `Audit reports`: one link per `AUDIT_PATHS` entry, comma-separated; `{AUDIT_FILE}` = file name of `{AUDIT_PATH}`.
 
@@ -158,6 +158,7 @@ $ARGUMENTS
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Parent FID extraction attempted
 - [ ] Audit report paths extracted
@@ -190,7 +191,7 @@ $ARGUMENTS
 3. Enter the worktree, open the run and record the runtime:
    ```bash
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 1
-   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+   "{BKIT}" workflows start --workflow=plan --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} --session-dir="{SESSION_DIR}" || exit 1
    "{BKIT}" runtime row --workflow=plan --base-sha="{BASE_SHA}" --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
    "{BKIT}" runtime assert --file="{LOG_DIR}/status.jsonl" --workflow=plan >/dev/null
    ```
@@ -469,7 +470,7 @@ $ARGUMENTS
    - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md"
+     "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
      ```
 
 ### 🔒 Gate 8 — Close Workflow
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index a27744883..5a6f29154 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -53,7 +53,7 @@ $ARGUMENTS
 
 - **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) ONLY when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, NEVER gate; **If** failure → retry once after 5s → continue.
 - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
-- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.
+- **Comments:** The engine may append routine reports to its own eligible progress comment; explicit session/run ownership keeps invocations separate. Attention and terminal reports use new comments. Comment preparation, delivery, MCP fallback and friction failures are nonfatal: attempt best-effort friction and continue substantive work. **If** `tracker.done` = false and `commentFile` is available → attempt one new comment from that file byte-for-byte via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; NEVER edit prior tracker content or rebuild the fallback body. A missing file or exhausted fallback is an attempted report, not a workflow blocker. Every comment gate requires an attempt or an applicable skip. Omit `--session-dir` when `SESSION_DIR` is not held.
 
 
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
@@ -170,7 +170,7 @@ $ARGUMENTS
    Then hold `path` as `STATUS` and `bookRoot` as `BOOK_ROOT`.
    Open the run and record the runtime. The block refuses a checkout not on `SHIP_BRANCH` (15), clears stale sentinels, and writes the `workflow-started` and `ship-start-workflow` rows:
    ```bash
-   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --lock-held --token="{LOCK_TOKEN}" || exit 1
+   "{BKIT}" workflows start --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --branch="{SHIP_BRANCH}" --session-dir="{SESSION_DIR}" --lock-held --token="{LOCK_TOKEN}" || exit 1
    "{BKIT}" steps done --workflow=ship --step=ship-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
    "{BKIT}" runtime row --workflow=ship --file="{STATUS}" >/dev/null || exit 1
    "{BKIT}" runtime assert --workflow=ship --file="{STATUS}" >/dev/null
@@ -200,6 +200,7 @@ $ARGUMENTS
 ```
 
 - [ ] Mechanical checks passed (`steps gate`)
+- [ ] Issue comment attempted when applicable
 - [ ] Issue resolved
 - [ ] Worktree ready and run opened
 - [ ] Outbox created
diff --git a/DETAILS.md b/DETAILS.md
index c9cfad801..a5cb49d25 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -345,15 +345,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1694 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1713 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|385| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|367| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|379| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/context.js b/dist/commands/workflow/context.js
index bef10ad70..ab904a4e0 100644
--- a/dist/commands/workflow/context.js
+++ b/dist/commands/workflow/context.js
@@ -1613,7 +1613,7 @@ export const contextCommand = {
                     commit: written.commit,
                     ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
                     comment,
-                    commentFile: commentFileOf(ctx.cwd, comment),
+                    commentFile: commentFileOf(ctx.cwd, comment, ctx),
                 });
                 return written.code;
             },
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index ecfa8311b..0fb4dad50 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -12,7 +12,7 @@ import { CommandError, EXIT, parseJson, repoRoot, } from "../lib.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { str } from "./status.js";
 import { isCloudOrCi } from "../../checks/before/env.js";
-import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentFileOf, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, POST_FLAG, TRACKER_OUTPUT, attempt, classifyFailure, commentDiagnostic, commentFileOf, endedRunActionKey, fetchIssue, moveOnBoard, postForVerb, readBlockers, readLabels, redact, runActionKey, skipOf, stampMarker, trackerTarget, writeLabels, } from "./tracker.js";
 /** Exit code: an input file is missing or not in the expected shape. */
 export const EXIT_BAD_INPUT = 3;
 function readInput(cwd, file, flag) {
@@ -863,6 +863,11 @@ export const issuesCommand = {
                     help: "failure: captured stderr (last 20 lines kept)",
                 },
                 POST_FLAG,
+                {
+                    name: "session-dir",
+                    type: "string",
+                    help: "explicit repo info session for fileless workflow progress ownership",
+                },
                 { name: "fid", type: "string", help: "with --post: the run's FID (names the issue)" },
                 { name: "issue", type: "string", help: "with --post: the issue id (instead of --fid)" },
                 {
@@ -872,16 +877,31 @@ export const issuesCommand = {
                 },
             ],
             output: {
-                comment: "the comment body",
+                comment: "the comment body; null when --post source preparation is unavailable",
                 commentFile: COMMENT_FILE_OUTPUT,
                 tracker: TRACKER_OUTPUT,
             },
             exitCodes: {
-                [EXIT_BAD_INPUT]: "a --body-file / --section / --stderr-file / --error-file file is missing",
+                [EXIT_BAD_INPUT]: "without --post: a --body-file / --section / --stderr-file / --error-file file is missing",
             },
             run: async (ctx) => {
-                const comment = commentBody(ctx);
-                const commentFile = commentFileOf(ctx.cwd, comment);
+                let comment;
+                try {
+                    comment = commentBody(ctx);
+                }
+                catch (err) {
+                    if (ctx.flags.post !== true ||
+                        (err instanceof CommandError && err.code !== EXIT_BAD_INPUT))
+                        throw err;
+                    commentDiagnostic({ cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) }, "[bkit-tracker] comment preparation unavailable; continuing workflow", []);
+                    ctx.emit({
+                        comment: null,
+                        commentFile: null,
+                        tracker: { done: false, action: "comment", reason: "preparation" },
+                    });
+                    return EXIT.OK;
+                }
+                const commentFile = commentFileOf(ctx.cwd, comment, ctx);
                 if (ctx.flags.post !== true) {
                     ctx.emit({ comment, commentFile });
                     return EXIT.OK;
@@ -889,11 +909,25 @@ export const issuesCommand = {
                 const file = str(ctx.flags.file)
                     ? path.resolve(ctx.cwd, String(ctx.flags.file))
                     : undefined;
-                const key = runActionKey(file, str(ctx.flags.workflow), str(ctx.flags.kind) ?? "step", str(ctx.flags.stepNumber), str(ctx.flags.subStep), str(ctx.flags.attempt));
+                const keyParts = [
+                    str(ctx.flags.kind) ?? "step",
+                    str(ctx.flags.stepNumber),
+                    str(ctx.flags.subStep),
+                    str(ctx.flags.attempt),
+                ];
+                const workflow = str(ctx.flags.workflow);
+                const key = ctx.flags.prNumber !== undefined && workflow !== undefined
+                    ? endedRunActionKey(file, workflow, ...keyParts)
+                    : runActionKey(file, workflow, ...keyParts);
                 const tracker = await postForVerb(ctx, comment, {
                     fid: str(ctx.flags.fid),
                     issue: str(ctx.flags.issue),
                     ...(key === undefined ? {} : { file, key }),
+                    purpose: ctx.flags.prNumber !== undefined
+                        ? "terminal"
+                        : ["failure", "handover", "audit"].includes(str(ctx.flags.kind) ?? "step")
+                            ? "attention"
+                            : "routine",
                 });
                 ctx.emit({ comment, commentFile, tracker });
                 return EXIT.OK;
diff --git a/dist/commands/workflow/plans.js b/dist/commands/workflow/plans.js
index 61dbe07c2..192eec6bb 100644
--- a/dist/commands/workflow/plans.js
+++ b/dist/commands/workflow/plans.js
@@ -197,7 +197,7 @@ export const plansCommand = {
                     month: String(ctx.flags.month),
                     fid: String(ctx.flags.fid),
                 });
-                ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body), plans });
+                ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body, ctx), plans });
                 return EXIT.OK;
             },
         },
diff --git a/dist/commands/workflow/repo.js b/dist/commands/workflow/repo.js
index 5c7024571..d46029e2e 100644
--- a/dist/commands/workflow/repo.js
+++ b/dist/commands/workflow/repo.js
@@ -143,7 +143,7 @@ export const repoCommand = {
                 repoRoot: "the main checkout (the same from any worktree)",
                 bkit: "the bkit binary the workflow blocks call: <repoRoot>/node_modules/.bin/bkit, else `bkit` on PATH",
                 outboxRoot: "<git common dir>/bkit-outbox: per-run scratch files, never committed",
-                sessionDir: "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per call for this run's prompt.md and issue files; folders older than 7 days are pruned",
+                sessionDir: "<outboxRoot>/sessions/<utc-time>-<random>/: a new, empty folder per invocation for prompt.md and issue files; pass it explicitly as --session-dir for workflow progress ownership; folders older than 7 days are pruned",
                 bkitVersion: ".bkit/version pinnedVersion: the release this repo's bkit files came from (null when unpinned)",
                 bkitLatest: "newest published @cbartens/bkit, asked at most once a day (null when offline, opted out via BKIT_NO_UPDATE_CHECK, or unpinned)",
                 bkitOutdated: "true when bkitVersion is older than bkitLatest (null when either is unknown)",
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 0bb2e7e8e..bd3b59b9d 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -1148,7 +1148,14 @@ async function finish(ctx) {
         if (comment === null)
             throw new CommandError(EXIT.USAGE, "--post needs --number");
         const key = actionKey(workflow, fs.existsSync(file) ? runNumber(readRuns(file), workflow) : 1, step, group, attempt, "comment");
-        tracker = await postForVerb(ctx, comment, { fid: fidOfStatusFile(file), file, key });
+        tracker = await postForVerb(ctx, comment, {
+            fid: fidOfStatusFile(file),
+            file,
+            key,
+            purpose: step.endsWith("-decision") || verdict === "FAIL" || verdict === "HANDOVER"
+                ? "attention"
+                : "routine",
+        });
     }
     const written = writeStepRow(ctx.cwd, {
         file,
@@ -1192,7 +1199,7 @@ async function finish(ctx) {
         checks,
         comment,
         // Written after the step's commit, so the commit never carries it.
-        commentFile: commentFileOf(ctx.cwd, comment),
+        commentFile: commentFileOf(ctx.cwd, comment, ctx),
         ...(tracker === undefined ? {} : { tracker }),
     });
     if (written.code !== EXIT.OK)
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index f0ada1f36..347d8f97c 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -9,6 +9,7 @@
 // thrown message, a log line or stdout.
 import * as fs from "node:fs";
 import * as path from "node:path";
+import { appendFrictionRow, frictionRow } from "../../ledgers/journal.js";
 import { actionHash, actionKey, alreadyDone, recordAction, runNumber, } from "../../ledgers/status.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
@@ -1109,6 +1110,20 @@ export function skipOf(t) {
     return null;
 }
 function progressBinding(t, o) {
+    const common = git(t.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+    if (!common)
+        return null;
+    const target = [t.tracker, t.ownerRepo || t.jiraSite || t.linearTeam || "", t.issue].join("/");
+    if (o.publication && o.key) {
+        const { invocation, workflow } = o.publication;
+        return {
+            target,
+            invocation,
+            workflow,
+            file: path.join(common, "bkit-outbox", "progress", `${actionHash(`${target}\0${invocation}`)}.json`),
+            priorDelivery: false,
+        };
+    }
     if (!o.file || !o.key)
         return null;
     const [workflow, runText, step, group, attempt] = o.key.split("/");
@@ -1126,11 +1141,14 @@ function progressBinding(t, o) {
         return "conflict";
     if (issue === null)
         return null;
-    const target = [t.tracker, t.ownerRepo || t.jiraSite || t.linearTeam || "", t.issue].join("/");
-    const invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
-    const common = git(t.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
-    if (!common)
-        return null;
+    let invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
+    const association = runPublicationFile(common, o.file, workflow, run.startedAt);
+    if (fs.existsSync(association)) {
+        const parsed = parseJson(fs.readFileSync(association, "utf-8"));
+        const saved = asRecord(parsed.ok ? parsed.value : null);
+        if (saved.version === 1 && saved.workflow === workflow && typeof saved.invocation === "string")
+            invocation = saved.invocation;
+    }
     const at = run.steps.find((row) => row.step === step &&
         (group === "-" || row.group === Number(group)) &&
         (attempt === "-" || row.attempt === Number(attempt)))?.at;
@@ -1244,7 +1262,7 @@ function saveProgress(binding, source, section, posted, priorSections = []) {
     fs.mkdirSync(path.dirname(binding.file), { recursive: true });
     fs.writeFileSync(binding.file, JSON.stringify(state), { mode: 0o600 });
 }
-function commentDiagnostic(o, text, warnings) {
+export function commentDiagnostic(o, text, warnings) {
     const detail = redact(text);
     try {
         o.log(detail);
@@ -1252,6 +1270,50 @@ function commentDiagnostic(o, text, warnings) {
     catch {
         warnings.push(`${detail}; comment diagnostic unavailable`);
     }
+    const workflow = o.publication?.workflow ?? o.workflow ?? o.key?.split("/")[0];
+    if (!o.cwd ||
+        !workflow ||
+        !["design", "plan", "build", "debug", "ship", "auto"].includes(workflow))
+        return;
+    const stage = /receipt|engine-action/.test(text)
+        ? "receipt"
+        : /lock/.test(text)
+            ? "lock"
+            : /recognition|reconciliation|postflight/.test(text)
+                ? "reconciliation"
+                : /source|cache/.test(text)
+                    ? "source"
+                    : /association/.test(text)
+                        ? "association"
+                        : "delivery";
+    try {
+        const root = git(o.cwd, ["rev-parse", "--show-toplevel"]) ?? o.cwd;
+        const row = frictionRow({
+            workflow,
+            step: `comment-${stage}`,
+            noun: "tracker",
+            verb: "comment",
+            code: null,
+            bookRoot: root,
+        });
+        row.summary = `Workflow comment ${stage} unavailable`;
+        row.description = `${workflow} comment reporting encountered an exhausted ${stage} problem; substantive workflow work continues.`;
+        row.remediation =
+            "Inspect tracker availability or local comment state; delivery may start a fresh comment.";
+        if (o.knownUrl)
+            row.references = [o.knownUrl];
+        if (appendFrictionRow(root, row).ok)
+            return;
+    }
+    catch {
+        warnings.push("[bkit-tracker] comment friction unavailable");
+    }
+    try {
+        o.log("[bkit-tracker] comment friction unavailable; continuing workflow");
+    }
+    catch {
+        warnings.push("[bkit-tracker] friction diagnostic unavailable");
+    }
 }
 /** The latest of `recent` that is `body` posted before: same marker hash, else same text. */
 function samePosted(recent, body) {
@@ -1267,6 +1329,7 @@ function samePosted(recent, body) {
  * written after a successful post is `done: true` with a `warning`.
  */
 export async function postCommentOnce(t, body, o) {
+    o = { ...o, cwd: t.cwd };
     const skip = skipOf(t);
     if (skip)
         return skip;
@@ -1326,6 +1389,10 @@ export async function postCommentOnce(t, body, o) {
                 o.purpose !== "terminal") {
                 try {
                     cached = readProgress(binding);
+                    if (cached === null && fs.existsSync(binding.file))
+                        commentDiagnostic(o, "[bkit-tracker] progress source unavailable; creating standalone comment", warnings);
+                    if (cached)
+                        o.knownUrl = cached.comment.url;
                     const rendered = progressSection(body, binding, o.key);
                     section = rendered.section;
                     if (routine) {
@@ -1437,7 +1504,7 @@ export async function postCommentOnce(t, body, o) {
         }
         catch (err) {
             const reason = classifyFailure(err);
-            commentDiagnostic(o, `tracker ${action} failed (${reason}): ${err.message ?? String(err)}`, warnings);
+            commentDiagnostic(o, `tracker ${action} failed (${reason}); delivery unavailable`, warnings);
             seal();
             return { done: false, action, reason };
         }
@@ -1453,6 +1520,7 @@ export async function postCommentOnce(t, body, o) {
             }
             catch {
                 retain = false;
+                commentDiagnostic(o, "[bkit-tracker] postflight reconciliation unavailable", warnings);
             }
             if (!retain)
                 seal();
@@ -1513,11 +1581,62 @@ export const POST_FLAG = {
 /** The `tracker` output key's meaning, shared by every `--post` verb. */
 export const TRACKER_OUTPUT = "with --post: {done: true, action, url, deduped?, warning?} | {done: false, action, reason} (post `commentFile` verbatim via the tracker MCP) | {skipped: no-issue | tracker-none}; absent without --post";
 /** The `commentFile` output key's meaning, shared by every verb that prints a comment. */
-export const COMMENT_FILE_OUTPUT = "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null";
+export const COMMENT_FILE_OUTPUT = "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null or its source file is unavailable";
 /** How many of the issue's latest comments a re-run checks for the same marker hash. */
 export const RECENT_COMMENTS = 5;
 /** `comment` written to its body file, or null for no comment. */
-export const commentFileOf = (cwd, comment) => comment === null ? null : writeBodyFile(cwd, "comment", comment);
+export function commentFileOf(cwd, comment, ctx) {
+    if (comment === null)
+        return null;
+    try {
+        return writeBodyFile(cwd, "comment", comment);
+    }
+    catch {
+        commentDiagnostic({
+            cwd,
+            workflow: ctx?.publication?.workflow ?? str(ctx?.flags.workflow),
+            log: (line) => ctx?.log(line),
+        }, "[bkit-tracker] fallback source unavailable; continuing workflow", []);
+        return null;
+    }
+}
+/** Optional session ownership, validated against this repository's private outbox. */
+export function sessionPublication(cwd, session, workflow) {
+    if (!session || !workflow)
+        return undefined;
+    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+    if (!common)
+        throw new Error("session association repository unavailable");
+    const sessions = path.join(common, "bkit-outbox", "sessions");
+    const dir = fs.realpathSync(path.resolve(cwd, session));
+    if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
+        throw new Error("session association directory unavailable");
+    return { invocation: actionHash(`${dir}\0${workflow}`), workflow };
+}
+function runPublicationFile(common, file, workflow, at) {
+    return path.join(common, "bkit-outbox", "invocations", `${actionHash([path.resolve(file), workflow, at].join("\0"))}.json`);
+}
+/** Bind only the exact run opened by workflows start; loss of this cache is harmless. */
+export function bindRunPublication(ctx, file, workflow, run) {
+    try {
+        const publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow);
+        const current = readRunsLenient(file).filter((r) => r.workflow === workflow)[run - 1];
+        const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+        if (!publication || !current || !common)
+            return;
+        const destination = runPublicationFile(common, file, workflow, current.startedAt);
+        if (fs.existsSync(destination))
+            return;
+        fs.mkdirSync(path.dirname(destination), { recursive: true });
+        fs.writeFileSync(destination, JSON.stringify({ version: 1, ...publication }), {
+            mode: 0o600,
+            flag: "wx",
+        });
+    }
+    catch {
+        commentDiagnostic({ cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
+    }
+}
 /**
  * The engine-action key of a comment in `file`'s current run of `workflow` (the
  * latest run's workflow when omitted); undefined with no status.jsonl or no run.
@@ -1547,13 +1666,35 @@ function commentKey(file, workflow, numberOf, parts) {
  * Post `body` for a verb's `--post`: once per key in `file` when both are given,
  * else once per marker hash among the issue's latest comments.
  */
-export function postForVerb(ctx, body, o) {
-    const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
-    return postCommentOnce(t, body, {
-        file: o.file,
-        key: o.key,
-        purpose: o.purpose,
-        recent: o.file && o.key ? undefined : RECENT_COMMENTS,
-        log: (line) => ctx.log(line),
-    });
+export async function postForVerb(ctx, body, o) {
+    try {
+        const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
+        let publication = ctx.publication;
+        if (!o.file && !publication) {
+            try {
+                publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), str(ctx.flags.workflow));
+            }
+            catch {
+                commentDiagnostic({ cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
+                publication = undefined;
+            }
+        }
+        const key = o.key ??
+            (publication
+                ? actionKey(publication.workflow, 1, "step", str(ctx.flags.stepNumber), str(ctx.flags.subStep), str(ctx.flags.attempt), "comment")
+                : undefined);
+        return await postCommentOnce(t, body, {
+            file: o.file,
+            key,
+            publication,
+            workflow: str(ctx.flags.workflow),
+            purpose: o.purpose ?? (str(ctx.flags.workflow) ? "routine" : undefined),
+            recent: key ? undefined : RECENT_COMMENTS,
+            log: (line) => ctx.log(line),
+        });
+    }
+    catch {
+        commentDiagnostic({ cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) }, "[bkit-tracker] comment preparation unavailable; continuing workflow", []);
+        return { done: false, action: "comment", reason: "preparation" };
+    }
 }
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index b5a694d46..d3a9455d9 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -42,7 +42,7 @@ import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
 import { EXIT_NO_STATUS, WORKFLOW_FLAG, positiveInt, readRuns, readStatusEvents, readStatusRows, str, } from "./status.js";
-import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, issueRef, readLabels, endedRunActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
+import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, attempt, commentFileOf, postForVerb, bindRunPublication, issueRef, readLabels, endedRunActionKey, skipOf, trackerTarget, writeLabels, } from "./tracker.js";
 import { tipsText } from "../tips.js";
 import { EXIT_NO_RECORD, requireRecordOnShared, writeStepRow } from "./steps.js";
 import { addAllButCopied, removeWorktree } from "./worktrees.js";
@@ -297,6 +297,7 @@ async function failVerb(ctx) {
             fid,
             issue: str(ctx.flags.issue),
             ...(key === undefined ? {} : { file: state.status, key }),
+            purpose: "attention",
         })
         : undefined;
     const labelsWrite = ctx.flags.post === true ? await writeFailedLabels(ctx, fid, failedSet, failedState) : undefined;
@@ -312,7 +313,7 @@ async function failVerb(ctx) {
         trackerState: failedState,
         prState,
         comment,
-        commentFile: commentFileOf(ctx.cwd, comment),
+        commentFile: commentFileOf(ctx.cwd, comment, ctx),
         ...(tracker === undefined ? {} : { tracker }),
         ...(labelsWrite === undefined ? {} : { labelsWrite }),
         ...sessionRemoval(ctx),
@@ -721,7 +722,7 @@ async function handoverVerb(ctx) {
     if (rec !== null)
         removeRecord(tree, fid);
     const tracker = ctx.flags.post === true && comment !== null
-        ? await postForVerb(ctx, comment, { fid })
+        ? await postForVerb(ctx, comment, { fid, purpose: "attention" })
         : undefined;
     ctx.emit({
         handover: present ? artifact : null,
@@ -729,7 +730,7 @@ async function handoverVerb(ctx) {
         ref: pushed ? ref : null,
         skipped,
         comment,
-        commentFile: commentFileOf(ctx.cwd, comment),
+        commentFile: commentFileOf(ctx.cwd, comment, ctx),
         ...(tracker === undefined ? {} : { tracker }),
     });
     return code;
@@ -1650,12 +1651,12 @@ function inputVerb(ctx) {
  */
 async function postClose(ctx, fid, out) {
     const comment = typeof out.comment === "string" ? out.comment : null;
-    const withFile = { ...out, commentFile: commentFileOf(ctx.cwd, comment) };
+    const withFile = { ...out, commentFile: commentFileOf(ctx.cwd, comment, ctx) };
     if (ctx.flags.post !== true)
         return withFile;
     if (comment === null)
         throw new CommandError(EXIT.USAGE, "--post needs --number");
-    return { ...withFile, tracker: await postForVerb(ctx, comment, { fid }) };
+    return { ...withFile, tracker: await postForVerb(ctx, comment, { fid, purpose: "terminal" }) };
 }
 export const workflowsCommand = {
     noun: "workflows",
@@ -1669,6 +1670,7 @@ export const workflowsCommand = {
                 FID_FLAG,
                 MONTH_FLAG,
                 STATUS_FILE_FLAG,
+                SESSION_DIR_FLAG,
                 {
                     name: "lock-held",
                     type: "boolean",
@@ -1769,6 +1771,7 @@ export const workflowsCommand = {
                 recordChat(file, workflow, process.env);
                 const runs = fold(readStatusEvents(file));
                 const run = runNumber(runs, workflow);
+                bindRunPublication(ctx, file, workflow, run);
                 const current = resumed ? lastRun(runs, workflow) : undefined;
                 ctx.emit({
                     lock,
@@ -2070,7 +2073,10 @@ export const workflowsCommand = {
                     squashSha: str(f.squashSha),
                     ref: str(f.ref),
                     ownerRepo: str(f.ownerRepo),
-                    outbox: str(f.outbox),
+                    outbox: str(f.outbox) ??
+                        (str(f.sessionDir)
+                            ? path.join(path.dirname(path.dirname(path.resolve(ctx.cwd, String(f.sessionDir)))), String(f.fid))
+                            : undefined),
                     recordStep: f.recordStep === true,
                     message: str(f.message),
                     labels: list(f.label),
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 5ea56290e..d8cd76431 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -49,7 +49,7 @@ function fidOf(value) {
     return fid;
 }
 export const worktreeDir = (root, fid) => path.join(root, ".worktrees", fid);
-/** `.worktree-owned` in the git common dir's outbox: shared by every worktree, survives removal. */
+/** `.worktree-owned` is shared across worktrees; session invocation state stays separate. */
 export function ownershipMarker(root, fid) {
     const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
     if (!common)
diff --git a/docs/architecture.md b/docs/architecture.md
index cdf5ca4d8..a3f1c9bd6 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -26,6 +26,10 @@ No server, database, or network service. Build-time / DX tool only.
 
 **Stack-agnostic:** engine, workflows and prompts assume no app stack; stack-specific behaviour enters only through consumer-declared `package.json` scripts bkit calls by name (`.bkit/workflows.md` § Local gate scripts).
 
+## Tracker reporting boundary
+
+Workflow commands pass explicit session or exact-run ownership into the shared tracker helper. Provider adapters own reading, creating and updating comments; workflows consume a common delivery result and an optional fallback file. A Git-common `bkit-outbox` directory holds optional progress source and run associations across linked worktrees. Deleting it starts a fresh progress comment without changing authoritative workflow status. Remote comment text is recognition evidence, never the source for reconstructing a body.
+
 ## Package Boundaries
 
 ```
diff --git a/docs/capabilities.md b/docs/capabilities.md
index b52e76dbb..45f6bd137 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -84,11 +84,11 @@ Not scanned; run the rollup with `--reachability`.
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 198 | 118 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 186 | 111 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 186 | 111 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 186 | 111 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 186 | 111 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 199 | 119 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 187 | 112 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 187 | 112 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 187 | 112 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 187 | 112 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -164,15 +164,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1694 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1713 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|385| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|367| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|379| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
@@ -317,7 +317,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_fids["fids<br/>57 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_issues["issues<br/>45 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>102 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_locks["locks<br/>31 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_locks["locks<br/>36 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_plan_blocks["plan-blocks<br/>32 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_plans["plans<br/>15 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_prs["prs<br/>53 symbols · 1 files"]
@@ -334,7 +334,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>55 symbols · 1 files"]
       end
@@ -385,7 +385,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|31| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
-  n_bkit_core_engine_commands_workflow_workflows -->|28| n_bkit_core_engine_commands_workflow_tracker
+  n_bkit_core_engine_commands_workflow_workflows -->|29| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_status -->|27| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_steps -->|25| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_context -->|24| n_bkit_core_engine_commands_lib
@@ -393,12 +393,14 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_ledgers -->|22| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|21| n_bkit_core_engine_checks_after_ci_yml
   n_bkit_core_engine_commands_workflow_counters -->|21| n_bkit_core_engine_commands_workflow_status
+  n_bkit_core_engine_commands_workflow_tracker -->|21| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_tools_instructions -->|21| n_bkit_core_engine_tools_instructions_sources
   n_bkit_core_engine_commands_workflow_branches -->|20| n_bkit_core_engine_commands_land
   n_bkit_core_engine_commands_workflow_workflows -->|20| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_before_index -->|19| n_bkit_core_engine_checks_before_repo
+  n_bkit_core_engine_commands_workflow_locks -->|19| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|19| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|19| n_bkit_core_engine_commands_workflow_issues
   n_bkit_core_engine_commands_workflow_branches -->|18| n_bkit_core_engine_commands_workflow_status
@@ -406,6 +408,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_roadmap -->|18| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|18| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_lib -->|17| n_bkit_core_engine_ledgers_journal
+  n_bkit_core_engine_commands_workflow_tracker -->|17| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_land -->|16| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tests -->|16| n_bkit_core_engine_commands_workflow_plan_blocks
@@ -417,7 +420,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|15| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_counters -->|15| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_fids -->|15| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_locks -->|15| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_roadmap -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|15| n_bkit_core_engine_commands_workflow_tracker
@@ -429,7 +431,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_ci_push_gate -->|13| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
@@ -448,6 +449,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runs -->|12| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_runs -->|12| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runtime -->|12| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_tracker -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_after_index -->|11| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
@@ -455,7 +457,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
-  n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_core -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
@@ -468,7 +469,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_summary_findings -->|10| n_bkit_core_engine_commands_workflow_challenge
   n_bkit_core_engine_commands_workflow_tests_changed -->|10| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_land
@@ -493,6 +493,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_tests -->|9| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_tracker -->|9| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_worktrees -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_install_modules_antigravity -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_claude -->|9| n_bkit_core_engine_shared_package_roots
@@ -567,6 +568,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_step_table
+  n_bkit_core_engine_commands_workflow_tracker -->|6| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_steps
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_plans
@@ -749,14 +751,14 @@ flowchart LR
   linkStyle 65 stroke:#59636e,stroke-width:6px
   linkStyle 66 stroke:#59636e,stroke-width:6px
   linkStyle 67 stroke:#59636e,stroke-width:6px
-  linkStyle 68 stroke:#59636e,stroke-width:6px
-  linkStyle 69 stroke:#59636e,stroke-width:6px
-  linkStyle 70 stroke:#59636e,stroke-width:6px
-  linkStyle 71 stroke:#59636e,stroke-width:6px
-  linkStyle 72 stroke:#59636e,stroke-width:6px
-  linkStyle 73 stroke:#59636e,stroke-width:6px
-  linkStyle 74 stroke:#59636e,stroke-width:6px
-  linkStyle 75 stroke:#59636e,stroke-width:6px
+  linkStyle 68 stroke:#59636eb3,stroke-width:3px
+  linkStyle 69 stroke:#59636eb3,stroke-width:3px
+  linkStyle 70 stroke:#59636eb3,stroke-width:3px
+  linkStyle 71 stroke:#59636eb3,stroke-width:3px
+  linkStyle 72 stroke:#59636eb3,stroke-width:3px
+  linkStyle 73 stroke:#59636eb3,stroke-width:3px
+  linkStyle 74 stroke:#59636eb3,stroke-width:3px
+  linkStyle 75 stroke:#59636eb3,stroke-width:3px
   linkStyle 76 stroke:#59636eb3,stroke-width:3px
   linkStyle 77 stroke:#59636eb3,stroke-width:3px
   linkStyle 78 stroke:#59636eb3,stroke-width:3px
@@ -817,7 +819,7 @@ flowchart LR
   linkStyle 133 stroke:#59636eb3,stroke-width:3px
   linkStyle 134 stroke:#59636eb3,stroke-width:3px
   linkStyle 135 stroke:#59636eb3,stroke-width:3px
-  linkStyle 136 stroke:#59636e80,stroke-width:2px
+  linkStyle 136 stroke:#59636eb3,stroke-width:3px
   linkStyle 137 stroke:#59636e80,stroke-width:2px
   linkStyle 138 stroke:#59636e80,stroke-width:2px
   linkStyle 139 stroke:#59636e80,stroke-width:2px
@@ -883,4 +885,6 @@ flowchart LR
   linkStyle 199 stroke:#59636e80,stroke-width:2px
   linkStyle 200 stroke:#59636e80,stroke-width:2px
   linkStyle 201 stroke:#59636e80,stroke-width:2px
+  linkStyle 202 stroke:#59636e80,stroke-width:2px
+  linkStyle 203 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index b95b42e12..7c11e8b46 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -281,3 +281,10 @@
 {"schema":3,"ts":1793672039969,"firstTs":1793662207897,"updates":2,"kind":"failure","key":"test-timeout-6ecf352330ade053","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"category":"testing","severity":"MEDIUM","summary":".bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > prints ref (#N on GitHub) and the labels the engine reads; a failed read is null timed out under the changed-file gate","description":"The Group 1 gap-remediation changed gate ended with this single 5000ms timeout. Related tests passed 2364 cases; named tests passed 3589 cases with this one timeout. Five Bats tests, lint, formatting and both TypeScript projects passed. Evidence: tmp/826-group1-gap-changed.log. No retry was performed; the owner's explicit instruction to ignore timeouts makes this nonblocking for this build.","status":"OPEN"}
 {"schema":3,"ts":1793672363483,"firstTs":1793672363483,"updates":1,"kind":"failure","key":"tasks-tick-markdown-accepted-tests-misread-as-gaps","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-verify"},"references":[".bkit/core/engine/commands/workflow/tasks.ts","docs/plans/202611/logs/826-append-routine-workflow/build-tests-green-1-2.md"],"severity":"MEDIUM","status":"OPEN","summary":"Task marking treats accepted existing tests in Markdown as gaps","description":"tasks tick with a PASS tests-green Markdown report containing no gaps leaves tasks 1,2,3 unticked because accepted existing-test entries also match the gap regex.","rootCause":"gappedTasks scans every Markdown line matching - Task N followed by backtick, without restricting parsing to the Gaps section.","remediation":"Parse only the Gaps section; retain JSON gaps-array support. For this run consume the actual tests green --json payload as --green."}
 {"schema":3,"ts":1793672561715,"firstTs":1793672561715,"updates":1,"kind":"failure","key":"runs-fork-verification-shadow-timeout","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-group-gate"},"references":[".bkit/core/engine/commands/workflow/runs.test.ts","docs/plans/202611/logs/826-append-routine-workflow/build-group-gate-1-2.md"],"category":"testing","severity":"LOW","status":"OPEN","summary":"Fork verification isolation test times out in full unit gate","description":"runs.test.ts test rejects fork verification runs that shadow a red selected workflow at the same head exceeded 5000ms in Group1 gate; 7033 tests passed,2 skipped,only1 timeout. No assertion or static failures. Owner explicitly instructed ignore time outs; retained as nonblocking concern without changing test thresholds."}
+{"schema":3,"ts":1793865220191,"firstTs":1793865220191,"updates":1,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-group3-unit-code.log","tmp/bkit-826-group3-deadline-isolated.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The full tracker unit file passed 98 of 99 cases, failing reserves new comment opportunity within total delivery budget with ENOENT for slow-calls. The unchanged case passed in isolation in 648ms. An earlier group run observed the same intermittent failure. Planned tests and product deadlines were preserved; a retry is not a clean full-suite result.","rootCause":"Unresolved: a real child process has a 200ms total delivery deadline, and process startup or scheduling can consume it before the stub writes its observation file.","remediation":"Investigate actual transport-start timing and scheduling under the full tracker suite without weakening bounded delivery or editing the frozen test during implementation.","status":"OPEN"}
+{"schema":3,"ts":1793868293808,"firstTs":1793865220191,"updates":2,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The required changed gate reproduced ENOENT for slow-calls in reserves new comment opportunity within total delivery budget after the unchanged tracker file passed the targeted run. The broad named suite passed 7174 cases with this race and one catalog timeout failing. Planned tests and product deadlines remain unchanged.","rootCause":"Unresolved: real child-process startup or scheduling can consume the 200ms delivery budget before the shell stub writes its observation file.","remediation":"Investigate transport-start timing under concurrent test load without weakening bounded delivery or frozen assertions.","status":"OPEN"}
+{"schema":3,"ts":1793868293810,"firstTs":1793868293810,"updates":1,"kind":"failure","key":"catalog-progress-authority-render-concurrency-timeout","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/workflow/catalog-parity.test.ts","tmp/bkit-826-remediate-targeted.log","tmp/bkit-826-remediate-changed.log"],"category":"testing","severity":"MEDIUM","summary":"Progress authority catalog rendering times out under concurrent changed tests","description":"The frozen renders engine progress authority with verbatim create only agent fallback case passed in the targeted catalog run, then exceeded its 7900ms unit budget in the broad changed gate. Its assertions and timeout were preserved. No broad retry was run.","rootCause":"Unresolved: rendering several workflow variants exceeds the unit budget under concurrent subprocess load.","remediation":"Measure render cost and scheduling in the existing test harness; preserve the planned case and avoid speculative deadline changes.","status":"OPEN"}
+{"schema":3,"ts":1793868459197,"firstTs":1793868293810,"updates":2,"kind":"failure","key":"catalog-progress-authority-render-concurrency-timeout","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/audits/workflows/catalog-parity.test.ts","tmp/bkit-826-remediate-targeted.log","tmp/bkit-826-remediate-changed.log"],"category":"testing","severity":"MEDIUM","summary":"Progress authority catalog rendering times out under concurrent changed tests","description":"The frozen renders engine progress authority with verbatim create only agent fallback case passed in the targeted catalog run, then exceeded its 7900ms unit budget in the broad changed gate. Its assertions and timeout were preserved. No broad retry was run.","rootCause":"Unresolved: rendering several workflow variants exceeds the unit budget under concurrent subprocess load.","remediation":"Measure render cost and scheduling in the existing test harness; preserve the planned case and avoid speculative deadline changes.","status":"OPEN"}
+{"schema":3,"ts":1793868512439,"firstTs":1793868512439,"updates":1,"kind":"failure","key":"tracker-boundary-fault-matrix-concurrency-timeout","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.integration.test.ts","tmp/bkit-826-remediate-final-integration.log","tmp/bkit-826-remediate-final-lint-integration.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker boundary fault matrix times out under concurrent machine load","description":"The unchanged planned preserves substantive step results under every comment boundary fault case passed in the earlier eleven-case run, then exceeded its 45900ms budget in the final focused run. Ten cases passed, including all three added regression cases. No assertion or deadline was weakened and no retry followed.","rootCause":"Unresolved: real CLI process scheduling under concurrent machine load exceeded the existing matrix budget.","remediation":"Measure subprocess cost and contention using the existing harness before changing test scheduling or runtime behaviour.","status":"OPEN"}
+{"schema":3,"ts":1793873923887,"firstTs":1793865220191,"updates":3,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-2-changed.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"The required attempt-two changed check passed all 11 lifecycle integration cases and 3300 of 3301 named cases. The unchanged reserves new comment opportunity within total delivery budget case again failed with ENOENT for slow-calls; assertions and the 200ms delivery budget remain intact. The prior record documents isolated passes and earlier concurrent failures.","rootCause":"Unresolved: real child-process startup or scheduling can consume the 200ms delivery budget before the shell stub writes its observation file.","remediation":"Investigate transport-start timing under concurrent test load without weakening bounded delivery or frozen assertions.","status":"OPEN"}
+{"schema":3,"ts":1793874476412,"firstTs":1793865220191,"updates":4,"kind":"failure","key":"tracker-new-comment-budget-shell-observation-flake","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.test.ts","tmp/bkit-826-remediate-changed.log","tmp/bkit-826-remediate-3-2-changed.log",".git/bkit-outbox/826-append-routine-workflow/build-plan-gaps-remediate-3-2-gate.log"],"category":"testing","severity":"MEDIUM","summary":"Tracker 200ms delivery test intermittently expires before its shell stub is observed","description":"Attempt-two changed check passed all 11 lifecycle cases but reproduced slow-calls ENOENT. The single supplied static-unit group gate passed static checks, then passed 7324 tests with 2 skips and the same sole failure. No broad retry followed. The done:false assertion and elapsed time below 1500ms pass before the missing-file read fails.","rootCause":"Unresolved observation ambiguity: the 200ms real-process timeout can expire before the shell writes its first observation line. Current evidence establishes bounded nonfatal return, not whether a scheduled fallback child ran; it does not establish a product total-deadline violation.","remediation":"Investigate transport-start timing under concurrent test load without weakening bounded delivery or frozen assertions.","status":"OPEN"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 8afb8b6a7..0b3285803 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -155,3 +155,4 @@
 {"schema":3,"ts":1793672019120,"firstTs":1793672019120,"updates":1,"kind":"knowledge","key":"comment-split-header-part-count-digits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"summary":"Continuation header budgets must grow with the total part count","rootCause":"A fixed two-digit part-label reservation undercounts fully rendered headers after splitting produces at least 100 parts.","remediation":"Recompute chunk capacity when the actual total-part digit width exceeds the reserved width, then render only after it stabilizes. Assert every rendered part against the budget across digit boundaries.","status":"ACTIVE"}
 {"schema":3,"ts":1793672019121,"firstTs":1793672019121,"updates":1,"kind":"knowledge","key":"linear-comments-validate-order-before-slicing","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"summary":"Validate all Linear creation-order candidates before selecting recent comments","rootCause":"Sorting timestamp strings and taking the tail can discard undated candidates and misorder valid timestamps with different timezone offsets.","remediation":"Require parseable creation timestamps for every fetched candidate before slicing, and sort parsed instants numerically. Inconclusive creation ordering cannot authorize an edit.","status":"ACTIVE"}
 {"schema":3,"ts":1793674870462,"firstTs":1793674870462,"updates":1,"kind":"knowledge","key":"publication-budget-reserves-standalone-transport-after-local-preparation","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.ts","docs/plans/202611/logs/826-append-routine-workflow/build-plan-tasks-2-log.md"],"summary":"Start the shared network allowance at the first transport operation and prefer standalone delivery when a short allowance cannot fund optional inspection.","rootCause":"Local git, cache and process-identity preparation can consume a 100–200ms caller network allowance before any transport starts. Splitting the remainder between inspection and fallback can leave no observable standalone request under host load.","remediation":"Keep lock acquisition separately bounded, begin the shared capped network deadline at first transport, and spend caller allowances below one second on standalone delivery. Preserve the actual shorter transport deadlines and product assertions; this is distinct from test-runner timeout handling.","status":"ACTIVE"}
+{"schema":3,"ts":1793868459707,"firstTs":1793677148482,"updates":2,"kind":"knowledge","key":"workflow-push-retry-keeps-close-effects-and-original-return-once","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/workflows/bkit-build.md",".bkit/core/engine/audits/workflows/local-gate-audit.test.ts",".bkit/core/engine/commands/workflow/tracker.integration.test.ts","tmp/bkit-826-remediate-final-integration.log"],"summary":"Keep workflow close effects outside a retryable push block","rootCause":"Retrying a fence that closes the workflow before pushing repeats append-only status and publishing effects. Close also removes its session, so a repeated close can lose the original final-return issue facts.","remediation":"Close once, retain commentFile and finalReturn immediately, retry only the push on exit 81, and release the workflow lock after push success. For published builds, prepare close without --post and combine its body with the PR link in the single terminal completion; retain that final publication tracker for exact fallback. Bind the final publication to the ended run to seal its progress cache.","status":"ACTIVE"}
diff --git a/docs/observability.md b/docs/observability.md
index b47e20b86..9bcd73555 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -25,6 +25,14 @@ The workflow commits every captured payload inside an untrusted fence (`===== BE
 
 No server-side telemetry pipeline, log drains, or tracing. Observability limited to CLI stdout / stderr — `bkit install` / `bkit check` in consumer environments, and the `bkit <noun> <verb>` workflow commands during agent runs.
 
+## Tracker reporting diagnostics
+
+The tracker helper emits bounded `[bkit-tracker]` diagnostics and best-effort `tool-failure` friction for preparation, source, lock, delivery, reconciliation and receipt failures. Rows identify the workflow phase and failure stage; a known comment URL may be included. They exclude comment bodies, credentials, personal data and raw provider errors. Stable phase and stage identity groups recurrences across invocations.
+
+Unavailable fallback-source files and invalid or unreadable session associations attempt their own friction records even when the current provider write succeeds. Missing optional association arguments do not count as an association failure.
+
+Write friction in the active worktree's ledger. A failed friction write emits one bounded diagnostic without recursively attempting friction. Reporting and diagnostic failures remain nonfatal. If a provider accepts a write but its response is lost, an unprovable reconciliation can produce a duplicate new comment; diagnostics must not claim an exactly-once guarantee.
+
 ## Log Format
 
 All bkit CLI output uses bracketed context prefixes:
diff --git a/docs/security.md b/docs/security.md
index 4a1808f1b..cf66daa64 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -61,6 +61,12 @@ Prose never substitutes for token scope.
 
 <!-- bkit:end -->
 
+## Workflow comment ownership
+
+Only explicit session or exact-run ownership authorizes editing an engine progress comment. Session directories must resolve inside the repository's Git-common session directory. Another active run, a human comment or provider-returned text cannot grant ownership. Remote text is used only to recognize an owned delivery; replacement bodies come from locally cached source reports.
+
+Optional progress and invocation files stay under Git-common `bkit-outbox`, outside committed content, with private file permissions. Missing or invalid ownership evidence causes a new comment. MCP fallback is create-only and publishes the existing fallback file verbatim. Reporting diagnostics exclude report bodies, credentials and personal data; see `observability.md` § Tracker reporting diagnostics.
+
 ## Scope
 
 No database, server, or user-auth surface. Security concerns: secrets management (tokens), supply-chain (action pinning), shell-injection guards, PII avoidance in logs.
diff --git a/docs/testing.md b/docs/testing.md
index e8821c338..4315adbf8 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -790,6 +790,12 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration
 | `.bkit/core/engine/tools/instructions-coverage.test.ts` | Unit | `.bkit/instructions.md` covers the corpus both ways: every standing line of a prompt, workflow, utility agent, audit template, the plan template and `AGENTS.md` matches a clause, a rule text (one sentence for a `partial` carrier) or a `## Local Instructions` entry, and the failure prints the entry to add; every local entry and shared-line carrier is still in its file; every `verbatim` / `partial` carrier holds the rule text or its clause; every `condensed` / `specialised` / `applies` / `cites` carrier has a local line tagged with the rule; every drift item's `file:line` holds its quoted excerpt, and sync renumbers moved lines; rules and clauses 0.8 or more alike carry a `- distinct-from:` line; every prompt holds, word for word and in `.agents/rules.md` order, each rule its `- carry:` line names, no prompt holds a bkit rule no carry line names, every prompt carries at least one, and sync rewrites a copy still in a retired wording; every `fit` tag and drift item is resolved or carries a reason. |
 | `.bkit/core/engine/tools/instructions-sources.test.ts` | Unit | The store's copy sections equal their masters: `## Rules` / `## Project Rules` text and order against the `.agents/rules.md` bullets (a reworded bullet fails until sync retires the old text; every `refs` path and § exists); `## Hook Text` against every message the GateGuard, ReadGuard and Guardrails hook sources emit, both ways; `## Permissions` groups against the shipped Claude `deny` / `ask` / `allow` and OpenCode `permission` sets; `## Special Behaviors` / `## Authoring Rules` against `.bkit/core/.bkit/prompts.md` and `workflows.md`; no shipped rule, prompt or clause instructs a `next:*:lite` label. |
 
+## Routine tracker reporting coverage
+
+`commands/workflow/tracker.integration.test.ts` runs the real CLI against real Git repositories, linked worktrees and persistent provider stand-ins. It covers session-to-run ownership, independent and resumed invocations, routine append, terminal summaries, source loss and nonfatal transport failures. Tracker unit tests cover bounded provider reads, local-source reconstruction, capacity rollover and redacted friction. Rendered workflow audits check all five hosts and all four tracker settings for explicit association, create-only verbatim fallback and attempted-report gates.
+
+Live provider probes are opt-in and use disposable issues or tickets under an explicitly authorized account. Verify newest-created pagination, update semantics, provider body counting and capacity rejection, and cleanup before recording a verified ceiling. Local stand-ins establish application behavior, not a live provider limit. Keep unresolved provider limits conservative and record unverified assumptions with the probe evidence.
+
 ## Roadmap fold test coverage
 
 `docs/roadmap.md` is a generated artifact over one input: the canonical `.bkit/issues.jsonl` feature ledger. `bkit roadmap fold` rewrites the whole generated region and runs at every phase close. `commands/workflow/roadmap.test.ts` exercises it over fixture ledgers in a temp checkout (no mocks at the boundary); a real workflow close is the runtime ground-truth.
