diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 8be2109be..4966f91bc 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -25,8 +25,8 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -156,15 +156,15 @@ description: "Build Feature — Autonomous implementation"
    Record the decision and its route; counts carry on:
 
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
    ```
 
 7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -301,7 +301,7 @@ description: "Build Feature — Autonomous implementation"
 5. Finish:
    ```bash
    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
    ```
 
 ### 🔒 Gate 2 — Worktree Setup
@@ -318,67 +318,83 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" branches sync --merge-docs || exit 1
    ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
    ```bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-convert.md` using `view_file` tool:
+2. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-convert.md` using `view_file` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert
 
-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current
 
 1. Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 5.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-current.md` using `view_file` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-current.md` using `view_file` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills
 
 **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.
 
@@ -388,10 +404,10 @@ description: "Build Feature — Autonomous implementation"
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
 2. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
    ```
 
-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills
 
 - [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
 - [ ] New skills installed
@@ -399,19 +415,19 @@ description: "Build Feature — Autonomous implementation"
 
 ---
 
-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9
 
-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 
 ---
 
-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute
 
 1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
 2. Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -427,14 +443,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.
 
-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute
 
 - [ ] Group briefed (`context brief`), start commit recorded
 - [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -443,7 +459,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify
 
 1. Derive the attempt the verify artifact is named for:
    ```bash
@@ -470,7 +486,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
 6. Route:
@@ -489,25 +505,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
 8. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
     - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
     - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
     - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
 11. **Else** → **Failure Path**.
 
-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify
 
 - [ ] Test-first reds audited (`tests green`)
 - [ ] Group diff cut from its start commit (`context diff`)
@@ -519,9 +535,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -547,7 +563,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 3. Finish — the header's `Strategy` is recorded:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    Hold `fields.Fixed` as `VERIFY_FIXED`.
 4. Check the attempt changed source, not only logs and ledgers:
@@ -555,11 +571,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate
 
 - [ ] Strategy computed before invocation
 - [ ] Verify round read back on resume
@@ -569,7 +585,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic
 
 Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.
 
@@ -577,7 +593,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -588,26 +604,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
    ```
 4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic
 
 - [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge
 
-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
    ```bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
    ```bash
    "{BKIT}" counters max --point=build.challenge
    ```
@@ -633,7 +649,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
    ```
 5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash
@@ -646,12 +662,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
    - **Else** → **Failure Path**.
 6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge
 
 - [ ] Round limit read (`counters max --point=build.challenge`) before sizing
 - [ ] Change sized (`challenge gate`)
@@ -662,7 +678,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests
 
 1. Derive the attempt the test log is named for:
    ```bash
@@ -679,21 +695,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on test rounds:
      ```bash
      "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
      ```
      Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests
 
 - [ ] Tests executed
 - [ ] Mechanical checks passed (`steps finish`)
@@ -702,9 +718,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -721,10 +737,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
    ```
 
-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose
 
 - [ ] Strategy computed before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -732,9 +748,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read the strategy the diagnosis was written for:
    ```bash
@@ -750,12 +766,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
    Update: Source and test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
    ```
 
-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate
 
 - [ ] Strategy read before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -764,9 +780,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary
 
-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -775,7 +791,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -789,11 +805,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
    - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary
 
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
@@ -803,7 +819,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
@@ -832,7 +848,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
@@ -873,7 +889,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
    ```
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
@@ -892,7 +908,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR
 
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 822ecc3b6..c02a42905 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -25,8 +25,8 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -156,15 +156,15 @@ description: "Build Feature — Autonomous implementation"
    Record the decision and its route; counts carry on:
 
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
    ```
 
 7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -301,7 +301,7 @@ description: "Build Feature — Autonomous implementation"
 5. Finish:
    ```bash
    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
    ```
 
 ### 🔒 Gate 2 — Worktree Setup
@@ -318,67 +318,83 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" branches sync --merge-docs || exit 1
    ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
    ```bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
+2. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert
 
-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current
 
 1. Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 5.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills
 
 **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.
 
@@ -388,10 +404,10 @@ description: "Build Feature — Autonomous implementation"
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
 2. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
    ```
 
-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills
 
 - [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
 - [ ] New skills installed
@@ -399,19 +415,19 @@ description: "Build Feature — Autonomous implementation"
 
 ---
 
-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9
 
-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 
 ---
 
-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute
 
 1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
 2. Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -427,14 +443,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.
 
-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute
 
 - [ ] Group briefed (`context brief`), start commit recorded
 - [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -443,7 +459,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify
 
 1. Derive the attempt the verify artifact is named for:
    ```bash
@@ -470,7 +486,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
 6. Route:
@@ -489,25 +505,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
 8. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
     - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
     - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
     - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
 11. **Else** → **Failure Path**.
 
-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify
 
 - [ ] Test-first reds audited (`tests green`)
 - [ ] Group diff cut from its start commit (`context diff`)
@@ -519,9 +535,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -547,7 +563,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 3. Finish — the header's `Strategy` is recorded:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    Hold `fields.Fixed` as `VERIFY_FIXED`.
 4. Check the attempt changed source, not only logs and ledgers:
@@ -555,11 +571,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate
 
 - [ ] Strategy computed before invocation
 - [ ] Verify round read back on resume
@@ -569,7 +585,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic
 
 Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.
 
@@ -577,7 +593,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -588,26 +604,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
    ```
 4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic
 
 - [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge
 
-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
    ```bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
    ```bash
    "{BKIT}" counters max --point=build.challenge
    ```
@@ -633,7 +649,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
    ```
 5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash
@@ -646,12 +662,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
    - **Else** → **Failure Path**.
 6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge
 
 - [ ] Round limit read (`counters max --point=build.challenge`) before sizing
 - [ ] Change sized (`challenge gate`)
@@ -662,7 +678,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests
 
 1. Derive the attempt the test log is named for:
    ```bash
@@ -679,21 +695,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on test rounds:
      ```bash
      "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
      ```
      Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests
 
 - [ ] Tests executed
 - [ ] Mechanical checks passed (`steps finish`)
@@ -702,9 +718,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -721,10 +737,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
    ```
 
-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose
 
 - [ ] Strategy computed before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -732,9 +748,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read the strategy the diagnosis was written for:
    ```bash
@@ -750,12 +766,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
    Update: Source and test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
    ```
 
-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate
 
 - [ ] Strategy read before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -764,9 +780,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary
 
-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -775,7 +791,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -789,11 +805,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
    - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary
 
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
@@ -803,7 +819,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
@@ -832,7 +848,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
@@ -873,7 +889,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
    ```
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
@@ -892,7 +908,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR
 
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index adcff994e..9aae994e1 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -96,7 +96,7 @@ Re-runnable: source carries wired variants; tracker switch (`--tracker=linear` a
 - **`BKIT_VER` reads `pinnedVersion`, not `version`:** `[ -z … ] &&` fallback, not piped one — pipeline status = last command's; `| tr … || echo` fallback never fires on failed grep.
 - **`deferrals` / `failures` on `outcome` row = CUMULATIVE distinct `key` count, not lines:** same-`key` append (§ Updating a Row in `.bkit/jsonl.md`) → `wc -l` double-counts closed deferrals. Readers derive cycle from delta vs prior outcome row — `newFailuresThisRun` in `.bkit/core/engine/commands/analysis.ts`.
 - **CI-Dispatch poll:** `bkit runs dispatch` (`--budget-s` / `--interval-s`, default 60/10), shared by build's close-workflow and both debug close-workflow sites (PR-mode + LOCAL-mode). A poll outcome is `found` / `none` / `err`; a `sleep` that overruns its window is reported blocked instead of hanging. Self-heal cap 1; re-trigger suffix must match close-workflow suffix. `ciDispatch` verdict always on step-done record (additive field). No `CAN_SLEEP` / `RUNTIME_SLEEPS` capability row — sleeping is measured, not predicted. Blocked sleep → exit 81 → the orchestrator resolves the same poll in its turn loop (`bkit runs wait --pr= --once` per turn), then re-runs `dispatch` with `--poll-result` / `--attempts` / `--all-errored` / `--retriggered`.
-- **Open-PR pre-flight:** `bkit prs open` probes `--head` before creating: an open PR exits 3 (`--existing=fail`, the default) or is reused (`--existing=reuse`, design / plan PR close). A blind create on a branch with an open PR errors, retries, and lands in the Failure Path. Build Step 15 also probes (`bkit prs probe`) before its push.
+- **Open-PR pre-flight:** `bkit prs open` probes `--head` before creating: an open PR exits 3 (`--existing=fail`, the default) or is reused (`--existing=reuse`, design / plan PR close). A blind create on a branch with an open PR errors, retries, and lands in the Failure Path. Build Step 16 also probes (`bkit prs probe`) before its push.
 - **Roadmap row per phase close:** each close appends its own `kind:"feature"` row through `appendFeature`, then re-renders the `roadmap-status` block from the ledger. Re-rendering is safe because that block is a PURE PROJECTION of `.bkit/issues.jsonl` — so there is no foreign on-disk state to preserve and nothing to parse back. An unchanged section renders byte-identically, so the diff shows only the row that moved. design / plan: `bkit branches land` writes the row into the close commit it builds in `.worktrees/_land-{FID}` (direct push) or on the branch pre-merge (PR); STRAY allowlist admits both. build / debug: `bkit roadmap mirror` writes it on `feat/{FID}` (swept by `git add -A`), then lands the same row on `dev` through the throwaway `.worktrees/_land-{FID}` landing (§ One landing routine for every dev write) — 4th staging shape: ship merges their PR a cycle later, board would otherwise lag one. The mirror is fail-open — a refused push, `dev` moving before every attempt, or a failed fetch or checkout logs and continues; feat-side row already written. ship: `bkit roadmap feature --strict` (Step 6, below) exits 1 when the `SHIPPED` row does not land, failing the step.
 - **Dev-side mirror: every runtime, skipped only on `dev`:** the landing never checks out `dev`, so adopt mode mirrors like mint mode. Run on `dev` (debug adopting `dev`) → skip; its feat-side row is already a `dev` commit.
 - **Phase close never reads the tracker:** a close re-renders the `roadmap-status` block from the ledger and stops. It issues no `list_issues` and writes no label on any issue but its own. A workflow running on one issue may mutate only that issue; a tracker read touches every open one.
@@ -126,7 +126,7 @@ Re-runnable: source carries wired variants; tracker switch (`--tracker=linear` a
 - **`FID` slug assertions (`bkit-auto` Step 1, `bkit runs context`):** `bkit fids` holds the regexes (`runs context` checks a CI_DEV slug against the `any` allowlist and recovers a PR's FID with the same marker parsing as `bkit fids parse`, and a strict branch parsing); they are allowlists (canonical `^[0-9]+-[a-z0-9-]+$` for GitHub issue-prefixed slugs, `^[a-z]+-[0-9]+-[a-z0-9-]+$` for Linear-prefixed slugs, `^[a-z][a-z0-9]+-[0-9]+-[a-z0-9-]+$` for Jira-prefixed slugs, safe `^[a-z0-9][a-z0-9-]*$` for the no-tracker + branch-derive fallback, tracker-agnostic `^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$` for the CI_DEV slug arg, `--tracker=any`). They reject path traversal and shell metacharacters in the untrusted PR-body marker before `{FID}` reaches any filesystem path or downstream dispatch. `bkit fids parse` tries the marker first and falls back to the `feat/{FID}` branch only when the marker is missing or malformed, and the fallback resolves `{ISSUE_ID}` too — from the `{FID}` slug (github: leading numeric segment; linear / jira: first two dash-segments, uppercased), each behind its own allowlist — but keeps it only when `.bkit/issues.jsonl` holds a feature row keyed by that FID shape; otherwise it returns `issueId: null` and the run is issue-less with the suffix verbatim as `{FID}`. A branch suffix that is not a lowercase slug exits 3. `bkit runs context` (the `bkit-auto` dispatch) keeps the strict branch parsing, with no feature-row lookup: an FID that embeds an issue id gives that id, an issue-less slug gives none, and any other shape is rejected. Under the no-tracker variant `{ISSUE_ID}` stays empty by design and the comment is skipped. The branch-derive accepts `feat/**` only — the cloud router's `workflow_run` surface is `feat/**` plus `dev`, and no bkit phase mints any other branch prefix.
 - **Step 1 FID resolution in every phase workflow:** design, plan, build, debug and ship write the session prompt verbatim to `{SESSION_DIR}/prompt.md` (`repo info` prints a fresh `sessionDir` per call under `{OUTBOX_ROOT}/sessions/`, pruned after 7 days) and run `bkit fids resolve` on it, under every tracker, `none` included. First hit wins: a `FID` the prompt names (slug, `feat/{FID}`, or a `docs/plans/` path), the `feat/{FID}` branch (with an issue, only when the FID starts with it), the feature logged for the issue in the working tree or on `dev` (several → exit 4), a mint, a free `-b`, `-c`, … suffix. The format check runs last on whichever link won: with an issue the FID must embed that id; with none any lowercase slug passes. A bad `FID` fails before any work, not at `bkit prs open`, which keeps its own check as a backstop.
 - **`bkit-auto` CI_DEV mode (`bkit runs context`):** a post-merge `dev` CI failure has no open PR to read, so `bkit-cloud.yml` passes the `{FID}` slug instead of a PR number and `runs context` discriminates on `{ARG}` shape (numeric → PR, else slug). The slug is untrusted at the same level as the PR-body marker — it arrives from a commit-message scope on `dev` and the cloud-side `ARG` guard permits `.` and `/` — so the `any` allowlist is asserted (exit 9) before `{FID}` reaches `docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/{FID}`, or the `/bkit-debug {FID} {REF}` dispatch. `prNumber`, `prUrl` and `runId` are printed null rather than filled with a `(merged)` sentinel: the Step 1 comment drops its PR and run links in CI_DEV, and a sentinel would render a broken link. The open check (exit 7) and the CI-run lookup (exit 8) are on the CI path only.
-- **Auto-route marker derivation is fence-local (build Step 15, debug Step 11, ship Step 10):** every site re-reads the issue's labels (`bkit issues fetch --outbox`, the tracker MCP on exit 80) and hands them as `{LABEL_FLAGS}` to the command that writes the commit — `bkit workflows close --label=` (build / debug close commit), `bkit runs dispatch --label=` (the gate's re-trigger commit), `bkit prs merge --label=` (ship's squash subject) — which appends ` bkit [auto route]` on an exact `bkit:auto` match; no `gh` call. Two dead shapes preceded it and must not return: `${LABELS:-}` (an MCP-derived template value that is never assigned as a shell variable, so it always expanded empty), and a `mktemp` path published via `$GITHUB_ENV` (the runner applies `$GITHUB_ENV` only BETWEEN Action steps, while every agent Bash tool call in a cloud dispatch runs inside the one `claude-code-action` step). The exact label match mirrors the kill switch in `bkit-cloud.yml`, the marker's only consumer, so `bkit:auto-paused` / `no-bkit:auto` cannot arm the route. No tracker (`none`) passes no labels and leaves the subject unchanged. The marker becomes permanent `dev` history; that is inherent to reading `head_commit.message` and is not cleaned up later. Any resulting cross-session `/bkit-debug` dispatch loop is capped by `MAX_DEV_DISPATCH_ATTEMPTS` (a workflow-level env in `bkit-cloud.yml`, held equal to `bkit counters max` by `counters.test.ts`).
+- **Auto-route marker derivation is fence-local (build Step 16, debug Step 11, ship Step 10):** every site re-reads the issue's labels (`bkit issues fetch --outbox`, the tracker MCP on exit 80) and hands them as `{LABEL_FLAGS}` to the command that writes the commit — `bkit workflows close --label=` (build / debug close commit), `bkit runs dispatch --label=` (the gate's re-trigger commit), `bkit prs merge --label=` (ship's squash subject) — which appends ` bkit [auto route]` on an exact `bkit:auto` match; no `gh` call. Two dead shapes preceded it and must not return: `${LABELS:-}` (an MCP-derived template value that is never assigned as a shell variable, so it always expanded empty), and a `mktemp` path published via `$GITHUB_ENV` (the runner applies `$GITHUB_ENV` only BETWEEN Action steps, while every agent Bash tool call in a cloud dispatch runs inside the one `claude-code-action` step). The exact label match mirrors the kill switch in `bkit-cloud.yml`, the marker's only consumer, so `bkit:auto-paused` / `no-bkit:auto` cannot arm the route. No tracker (`none`) passes no labels and leaves the subject unchanged. The marker becomes permanent `dev` history; that is inherent to reading `head_commit.message` and is not cleaned up later. Any resulting cross-session `/bkit-debug` dispatch loop is capped by `MAX_DEV_DISPATCH_ATTEMPTS` (a workflow-level env in `bkit-cloud.yml`, held equal to `bkit counters max` by `counters.test.ts`).
 - **Host skill mirrors are in the `--scope=full` bookkeeping pathspec:** `npx skills remove` deletes `.claude/skills` / `.cursor/skills` / `.opencode/skills` alongside `.agents/skills/<name>`, so the close staging must be able to carry those deletions. `bkit ledgers commit` builds its pathspec via `git ls-files -z --cached --others --exclude-standard`, so an unmatched glob is empty output (never fatal) and `--cached` still emits a tracked-but-deleted mirror, so the deletion stages cleanly — a claude-only consumer with no `.cursor` / `.opencode` mirror sweeps zero for those globs rather than aborting. Without them the prune commit holds only `.agents/skills` + `skills-lock.json` and the mirror deletions leak into the working tree, where the next unrelated staging sweeps them into a foreign commit.
 - **Ship Step 7 never prunes `bkit-*` skills:** they are bkit render output (Codex host workflow entry points), absent from `.agents/skills.md`. `bkit skills prune` keeps every `bkit-*` skill; without that guard every ship uninstalls them. A missing `.agents/skills.md` skips the prune with a warning (`skipped: "no-registry"`) rather than uninstall everything; a failed uninstall is warned and listed in `failed`. Both exit 0: pruning is housekeeping, so the ship carries on and still closes.
 - **Staging routes through `bkit ledgers commit`, never a shell pathspec:** a pathspec rebuilt inline per block with unquoted word-splitting and an `ls docs/plans/*/logs/*/*.jsonl docs/*.jsonl .bkit/*.jsonl` glob ABORTS under zsh when unmatched — silently dropping every ledger in a fresh consumer repo, and (worse) swallowing a failed `git add` into a false "nothing to commit" success, since nothing in these blocks sets `set -e`. `bkit ledgers commit` builds the pathspec with `git ls-files` — an unmatched glob is empty output, never an abort — and stages/commits it via `--pathspec-from-file --pathspec-file-nul` rather than a re-interpolated shell string. It refuses to reach `commit` when that list is empty (exit 6): `git commit --pathspec-from-file=<empty file>` does not commit nothing, it silently commits whatever is ALREADY staged in the index. Ship's markdown stages through it at the B2 conflict-resolve stage and the Step 8 bookkeeping commit, each stopping the step on failure (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`); the Failure Path flush and the Close flush run the same code inside `bkit workflows handover --flush` / `bkit workflows close --flush`. `commands/workflow/ledgers.test.ts` covers the command itself.
@@ -230,7 +230,7 @@ Header bullets of the 6 workflow files, block by block, in file order; `.bkit/au
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 9, 10 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 7) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. Lock path is **absolute** (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included — the lock file is gitignored and never rides a commit) so acquire/release resolve to the same inode regardless of cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: when `dev` requires status checks, `bkit prs update-branch` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted **under the working directory its dispatch supplied** — `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
@@ -268,7 +268,7 @@ Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source
 | `runtime-resolved` | `{type, workflow, at, runtime, runtimeWorktrees, runtimeDevPushes, runtimeGithubCli, runtimeGithubCliExit, runtimeGithubCliErr, baseSha}` | Step-2 (Worktree Setup) record of the runtime capability table for this run — the first step `{FID}`/`WORKTREE_PATH` are resolved. Written by `bkit runtime row --file=` (detects, then appends), read back by `bkit runtime assert` (exit 4 no row, 5 an unresolved field). Not folded (unrecognised `type` — ignored, no-op) — later steps re-read `runtimeGithubCli` from this row instead of re-probing `gh`; shell state does not survive a Bash-tool-call boundary, so this row is the durable cross-block record. `baseSha` = `git merge-base origin/dev HEAD` for the design/plan worktree (`--base-sha=`, from `bkit worktrees setup`'s `baseSha`), recorded after Step 2's worktree/rebase arm settles; Close Workflow reads it back to stamp the canonical doc's `bkit:anchor` block (§ Anchor Block) rather than recomputing against a `dev` that has since advanced. Empty for build, debug, ship. |
 | `transport-fallback` | `{type, from, to, reason, assertedBy, at}` | One gh->MCP transition (bounded max 1/run). `from` = the gh command that was unavailable/unauthed; `to` = the mapped MCP tool used instead; `assertedBy` = how the fallback's success was independently re-read. Not folded. Emitted by `bkit prs transport-row --kind=fallback`; read back by `bkit prs cross-check` at Close Workflow — an `mcp` close with `runtime-resolved.runtimeGithubCli=false` and no row here is a Failure Path. |
 | `close-transport` | `{type, shape, sha, scanResult, at}` | Close Workflow's own audit-trail entry. `shape` = which close shape ran — `local` (design/plan squash built off `origin/dev` + direct `dev` push), `pr` (design/plan PR squash-merge after the `dev` push was refused), `push` (build/debug direct push to the feature branch); `sha` = the commit landed on `dev`; `scanResult` = `bkit prs scan-body`'s post-close outcome on the LANDED commit BODY (subject excluded), transport-agnostic. Not folded. Emitted by `bkit prs transport-row --kind=close`. |
-| `challenge-gate` | `{type, workflow, at, range, linesChanged, filesChanged, size, limit, agents, skipped}` | One build Step 10 size measurement (`bkit challenge gate`), written on every pass: `size` `small` (under `limit` = 300 lines and 10 files, `docs/plans/**` excluded) runs `@bkit-build-challenge-2` alone and sets `skipped`; `large` runs both. Not folded; the summary and the `outcome` row's `build.challenge.gate` read the latest. |
+| `challenge-gate` | `{type, workflow, at, range, linesChanged, filesChanged, size, limit, agents, skipped}` | One build Step 11 size measurement (`bkit challenge gate`), written on every pass: `size` `small` (under `limit` = 300 lines and 10 files, `docs/plans/**` excluded) runs `@bkit-build-challenge-2` alone and sets `skipped`; `large` runs both. Not folded; the summary and the `outcome` row's `build.challenge.gate` read the latest. |
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
@@ -623,7 +623,7 @@ Every stamp (design, plan, audit report) adds 2 more when `.bkit/version` exists
 
 **Truth, not intent:** stale `origin/dev` at fetch → recorded `baseSha` is the stale base actually branched from; later diff surfaces that honestly rather than papering over it.
 
-**Read by build's Plan Current step** (`/bkit-build` Step 4) — the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
+**Read by build's Plan Current step** (`/bkit-build` Step 5) — the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
 
 ### Gates
 
@@ -680,16 +680,16 @@ Then assert each Update/Create artifact exists, non-empty. Empty → **Failure P
 <!-- prettier-ignore -->
 | Agent | `Verdict` values | Routing |
 | --- | --- | --- |
-| `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 5. CONCERNS / FAIL → Step 5 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 6: `@bkit-build-plan-execute` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
-| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 9 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop (Decision Pause before each further round while `build.verify.maxAttempts` allows, else Failure Path; § Loop pause); FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. |
-| `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 11; `fix` → Step 6 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical | architectural`; architectural → `**Fixable:** false`. |
+| `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 6. CONCERNS / FAIL → Step 6 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 7: `@bkit-build-plan-execute` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
+| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop (Decision Pause before each further round while `build.verify.maxAttempts` allows, else Failure Path; § Loop pause); FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. |
+| `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 12; `fix` → Step 7 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical | architectural`; architectural → `**Fixable:** false`. |
 | `@bkit-design-review-1` / `-2` | PASS / CONCERNS / FAIL | `REVIEW_VERDICT` = worst-of-two. PASS/CONCERNS → Step 7 spike (`REVIEW_SPIKE` = true) else Step 8 apply-review; FAIL → Failure Path (design fundamentally not viable, human reframe required). `@bkit-design-review-1` additionally emits `Spike` (`true` / `false`) in its header — a routing flag, not a verdict; `REVIEW_SPIKE` gates Step 7 only and never contributes to `REVIEW_VERDICT`. |
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
 | `@bkit-design-update` | PASS / CONCERNS / FAIL | All paths continue to Step 9 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
 | `@bkit-design-organise` | PASS / CONCERNS / FAIL | PASS/CONCERNS → Step 10 summary; FAIL → Failure Path (cycles detected, human review required). |
 | `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a matrix-to-runbook mapping no edit recovers), so a human reframes the design or the issue. |
 | `bkit workflows summary` (`design`, `plan`, `build`, `debug`, `ship`) | PASS / CONCERNS / FAIL | PASS or CONCERNS → close workflow / next step; FAIL → Failure Path. |
-| `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 7, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
+| `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 8, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
 | 2-way agents (`@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`, `@bkit-ship-deferred-sweep`) | PASS / FAIL | PASS → continue; FAIL → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: PASS clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; FAIL leaves sentinel and routes to `@bkit-debug-abort-handover`. For `@bkit-ship-deferred-sweep`: PASS → Merge (Step 6); FAIL touches `docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens). FAIL only on >=1 of four blocking tests (behaviour / safety / false green / consumer break); a gap passing none joins the third track `Lazy (unjustified)`, orthogonal to the verdict — recorded in `docs/deferrals.jsonl` (`reason` = `unjustified`; new `key` unplanned, own `key` re-appended when adjudicated) and resurfaced, never merged against. |
 
 ### Retry / timeout / iteration constants
@@ -771,13 +771,13 @@ Step 10's `bkit prs merge --label=…` appends ` bkit [auto route]` to the squas
 
 **Placement (mode-dependent):**
 
-- `/bkit-build` Step 15: `bkit:auto` re-read before close-workflow commit. Present → subject `chore({FID}): close-workflow bkit [auto route]`. Close-workflow = feat-branch HEAD firing CI → gate checks `head_commit.message`.
+- `/bkit-build` Step 16: `bkit:auto` re-read before close-workflow commit. Present → subject `chore({FID}): close-workflow bkit [auto route]`. Close-workflow = feat-branch HEAD firing CI → gate checks `head_commit.message`.
 - `/bkit-debug` Step 11 PR-mode: same — marker on close-workflow (sub-step 2). Create-pr (sub-steps 4-5) does not run (`TRIGGER_PR=0`).
 - `/bkit-debug` Step 11 local-mode: `bkit:auto` re-read before the create-pr commit (sub-step 5). Marker on create-pr = CI-triggering HEAD local-mode.
 - `/bkit-ship` Step 4 (B1/B2, feat-branch HEAD): no placement — see "Ship does not carry the marker on the feat-branch HEAD" above. B1 (`bkit prs update-branch --only-if-required`) and B2 (`chore({FID}): conflict-resolve bkit [skip ci]`) both leave an unmarked HEAD by construction; there is no dev-sync merge to mark. Cloud gate in-job `bkit:auto` re-check = live kill switch.
 - `/bkit-ship` Step 10 (squash-merge subject, `dev`): labels re-read (`bkit issues fetch --outbox`, the tracker MCP on exit 80) in the merge sub-step and passed to `bkit prs merge` as `{LABEL_FLAGS}` — never carried forward from Step 1's `{LABELS}`. `bkit:auto` present → ` bkit [auto route]` appended to the subject. This is the commit that fires the post-merge `dev` free-tier gate — the only marker `/bkit-ship` places.
 
-**Why re-read must precede commit:** kill-switch re-read at build Step 15 / debug Step 11 sub-step 8 runs after commit+push — cannot source marker on existing commit. Fresh `bkit:auto` read before commit construction = authoritative "at close time" signal.
+**Why re-read must precede commit:** kill-switch re-read at build Step 16 / debug Step 11 sub-step 8 runs after commit+push — cannot source marker on existing commit. Fresh `bkit:auto` read before commit construction = authoritative "at close time" signal.
 
 **Coexistence with `bkit [verbose ci]`:** debug local-mode both on same subject: `chore({FID}): close-workflow bkit [verbose ci] bkit [auto route]`. HEAD-Subject Assertion: both legitimate. Gate reads `bkit [auto route]` via `contains(head_commit.message, 'bkit [auto route]')` — `bkit [verbose ci]` does not interfere.
 
@@ -859,48 +859,49 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 
 **Hard stop in Step 8 final return:** "**HARD STOP** — do not invoke `/bkit-build`."
 
-### `/bkit-build` — 15 steps
+### `/bkit-build` — 16 steps
 
 **Goal:** implementation + PR creation. CI takes over after PR exists. Workflow stops on PR creation; no human gate within build itself.
 
-**Build never reads the CI conclusion (by design):** Step 15 CI-Dispatch Gate proves only that a run started (`bkit runs dispatch`). `/bkit-ship` owns the result (`bkit runs gate` refuses to merge on red); red PR → `/bkit-debug` (manual, or auto-routed by `bkit-cloud.yml`). Waiting in build → full CI duration on every run + race with the cloud auto-router on the same branch. Final message states it.
+**Build never reads the CI conclusion (by design):** Step 16 CI-Dispatch Gate proves only that a run started (`bkit runs dispatch`). `/bkit-ship` owns the result (`bkit runs gate` refuses to merge on red); red PR → `/bkit-debug` (manual, or auto-routed by `bkit-cloud.yml`). Waiting in build → full CI duration on every run + race with the cloud auto-router on the same branch. Final message states it.
 
-**Group loop (Steps 6-8):** build works from one file, `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups within the `bkit.workflows.tasks` caps (§ Test-first). One pass of Steps 6-8 per group, in group order; `bkit context brief --next` picks the first group with a task neither ticked nor logged `DONE`, so a resumed run starts where the last one stopped. `VERIFY_ATTEMPT` is derived per group (`bkit counters derive --group={GROUP}`), so each group starts at 1. Between groups the build gate runs (§ Group gate). Only verify ticks tasks; the execute log's `DONE` lines are the handover between Steps 6 and 7.
+**Group loop (Steps 7-9):** build works from one file, `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups within the `bkit.workflows.tasks` caps (§ Test-first). One pass of Steps 7-9 per group, in group order; `bkit context brief --next` picks the first group with a task neither ticked nor logged `DONE`, so a resumed run starts where the last one stopped. `VERIFY_ATTEMPT` is derived per group (`bkit counters derive --group={GROUP}`), so each group starts at 1. Between groups the build gate runs (§ Group gate). Only verify ticks tasks; the execute log's `DONE` lines are the handover between Steps 7 and 8.
 
 <!-- prettier-ignore -->
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
-| 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 6). |
-| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
-| 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
-| 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
-| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
-| 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
-| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
-| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
-| 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
-| 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
-| 13 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 11 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 11 (its next row is the next `TEST_ATTEMPT`). |
-| 14 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 15). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
-| 15 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 7). |
+| 3 — Branch Sync | — | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). |
+| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes no row and posts no comment. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 5 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
+| 6 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
+| 7 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
+| 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
+| 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
+| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 11 without re-running. FAIL → Failure Path. |
+| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (a round before the last, every task fixable) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 13; none left → Failure Path. |
+| 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 12 FAIL)_ | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
+| 14 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 12 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 12 (its next row is the next `TEST_ATTEMPT`). |
+| 15 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 16). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
+| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.
 
 #### Decision Pause
 
-One mechanism for every build question: verify gaps logged `Fixable: false` (test-order gaps included), a no-progress Step 8 attempt, challenge tasks no agent can fix (`**Fixable:** false`) or left after the last challenge round, and a verify or test round that failed while rounds are left. Limits never move: a used-up limit goes to the Failure Path whether or not a question was asked (§ Ask points).
+One mechanism for every build question: verify gaps logged `Fixable: false` (test-order gaps included), a no-progress Step 9 attempt, challenge tasks no agent can fix (`**Fixable:** false`) or left after the last challenge round, and a verify or test round that failed while rounds are left. Limits never move: a used-up limit goes to the Failure Path whether or not a question was asked (§ Ask points).
 
 - **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|VERIFY_LOOP|CHALLENGE|TESTS_LOOP`), `From` (`verify` / `challenge` / `tests`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points). Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:** `ask` true and not headless → the orchestrator, in session. NEVER a subagent — subagents cannot reach the human. `ask` false or headless → `bkit decisions apply --by=headless` takes each recommendation; exit 4 = hard blockers left → asked in a session (only those), Failure Path headless.
 - **Hard blockers:** test-order gaps (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`), the other unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
 - **Accept** by the owner: written ONLY after explicit human approval of that item; agents NEVER write one on own judgement. Test-order gap or `exception-refused` gap → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
-- **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 8, `From: tests` → Step 12. The round counts against the same limit.
-- **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 6 (`fix`), Step 8 (`retry` after a verify or group-gate loop) or Step 12 (`retry` after a tests loop), re-run Step 7 (`verify`), or Step 11 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 8 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 12 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 10 goes on to Step 11.
-- **Fixer reads the answer:** Step 8 (`@bkit-build-plan-gaps-remediate`) and Step 12 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: tests` → Step 13. The round counts against the same limit.
+- **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), or Step 12 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
+- **Fixer reads the answer:** Step 9 (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
@@ -1159,14 +1160,14 @@ PR / CI reads and writes go through `bkit` commands (exit 80 → the mapped MCP
 | `OWNER_REPO` (Step 1 of every phase) | `bkit repo info` (`gh`, else the origin remote) |
 | Dispatch-permission preflight (ship Step 1) | `bkit repo preflight --owner-repo` (advisory: warns and continues, exit 0) |
 | PR lookup, PR-mode detection | `bkit prs probe [--head= --base= --state= --number=]` |
-| PR creation (build Step 15, debug Step 11 LOCAL, design / plan PR close, ship Step 2 when no PR exists) | `bkit prs open` (base pinned `dev`, marker in body) |
+| PR creation (build Step 16, debug Step 11 LOCAL, design / plan PR close, ship Step 2 when no PR exists) | `bkit prs open` (base pinned `dev`, marker in body) |
 | CI presence / completion, CI-Dispatch Gate | `bkit runs wait`, `bkit runs dispatch` |
 | Ship merge gate, squash-commit CI | `bkit runs gate` |
 | Squash merge (ship Step 10; design / plan PR close) | `bkit prs merge` / `bkit branches land` → `gh pr merge {PR} --squash [--match-head-commit <head>] --subject "…" --body ""` — empty body strips feature `bkit [skip ci]` |
 | Path B refresh (ship Step 4 B1) | `bkit prs update-branch --only-if-required` |
 | PR check-rollup assert (ship Step 2) | `bkit prs checks --number` |
 | Feature-branch push to open a missing PR, bookkeeping push (ship Steps 2 / 8) | `bkit branches push --mode=plain` (never forced) |
-| `bkit [force build]` PR-title marker (build Step 18) | `bkit branches force-build` → `gh pr edit --title` |
+| `bkit [force build]` PR-title marker (build Step 16) | `bkit branches force-build` → `gh pr edit --title` |
 | `bkit [verbose ci]` PR-title marker (debug Steps 9 / 11) | `gh pr edit --title` |
 
 Code PRs never merge locally; `/bkit-ship` merges with `bkit prs merge` (`gh pr merge` underneath).
@@ -1190,7 +1191,7 @@ Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers fr

<!-- prettier-ignore -->
 | Tag | Effect |
 | --- | --- |
 | `bkit [skip ci]` | GitHub Actions skip the workflow / `vercel-build` sets `run_level=none`. |
-| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 15 when the branch changes migration sources: `bkit branches force-build` sets it in the PR title and on an empty marker commit; `bkit prs merge` drops it from the squash subject it builds from the title. |
+| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 16 when the branch changes migration sources: `bkit branches force-build` sets it in the PR title and on an empty marker commit; `bkit prs merge` drops it from the squash subject it builds from the title. |
 
 **Docs-only commits:** workflows append `bkit [skip ci]` (CI suppression). No `bkit [skip build]` marker — docs-only is not app-affected; host affected-detection cancels the build without it. Hosts cancelling only on `[skip build]` will build docs-only workflow commits — switch to affected-detection.
 
@@ -1205,10 +1206,10 @@ Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers fr
 | `docs({FID}): ship DONE` (ship Step 14 close-workflow on `dev`, or its `ship-close/{FID}` PR squash subject) | `bkit [skip ci]` |
 | `docs({FID}): {phase} aborted` (design / plan / build / debug Failure Path record on the feature branch) | `bkit [skip ci]` |
 | `chore({FID}): {phase} FAILED` (ship Failure Path — the single flush, carrying the handover and the reconciled branch-side artifacts, so ship emits no `aborted` commit; design / plan / build / debug Failure Path from a `dev` / `main` checkout, logs and ledgers only) | `bkit [skip ci]` |
-| `chore({FID}): close-workflow` (build Step 15 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
+| `chore({FID}): close-workflow` (build Step 16 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
 | `chore({FID}): close-workflow` (debug Step 11 PR-mode — opted-in) | none / `bkit [auto route]` (PR-mode, conditional) — same as build |
 | `chore({FID}): create-pr` (debug Step 11 local-mode — opted-in; `bkit branches push --commit`, one per run via an `engine-action` row) | `bkit [verbose ci]`; opted-in adds `bkit [auto route]` (local-mode, conditional) — CI-triggering HEAD in local-mode |
-| `chore({FID}): force build` (build Step 18, `bkit branches force-build`, migrations changed) | `bkit [force build]`; opted-in adds `bkit [auto route]` — the CI-triggering HEAD |
+| `chore({FID}): force build` (build Step 16, `bkit branches force-build`, migrations changed) | `bkit [force build]`; opted-in adds `bkit [auto route]` — the CI-triggering HEAD |
 | `chore({FID}): conflict-resolve` (ship Step 4 B2 — ONLY step that force-pushes `{SHIP_BRANCH}`) | `bkit [skip ci]` — never `bkit [auto route]`. Deliberate: ship dispatches CI itself at Step 9 on observed head movement and polls to completion, so the push must not also fire a push-triggered run. Ship Step 4 B1 (`bkit prs update-branch`) likewise leaves an unmarked HEAD — GitHub authors that merge commit and bkit cannot set its message. A local `origin/dev` merge pushed back onto `feat/{FID}` is never reintroduced here — it mutates the validated PR head. |
 | `{title} (#{PR_NUMBER})` squash-merge commit (ship Step 10 `bkit prs merge`, GitHub-authored, lands on `dev`) | none / `bkit [auto route]` (opted-in: `bkit:auto` re-read from the tracker immediately before merge, passed as `--label=`) — the CI-triggering HEAD that admits `bkit-cloud.yml`'s post-merge `dev` free-tier gate. Distinct from the B1/B2 rows above: GitHub authors this commit at merge time rather than pushing a local merge onto a validated head. |
 
@@ -1220,7 +1221,7 @@ Outcome-verification gate: after final loud push, confirms bkit CI check dispatc
 
 **Invoked by orchestrators** (not git hook — invariant contextual; bkit intentionally pushes `[skip ci]` HEADs intermediately). The HEAD-message clause is `bkit branches push --require-ci` (exit 6 on a CI-suppressing token in the HEAD message, body included); the PR-title clause is `bkit prs open` (exit 4 on a token in `--title`); the poll is `bkit runs dispatch`:
 
-- **Build Step 15:** close-workflow commit → `bkit branches push --mode=feature --require-ci` (no PR yet, no CI) → `bkit prs open` (the PR creation fires CI) → `bkit runs dispatch --pr=`.
+- **Build Step 16:** close-workflow commit → `bkit branches push --mode=feature --require-ci` (no PR yet, no CI) → `bkit prs open` (the PR creation fires CI) → `bkit runs dispatch --pr=`.
 - **Debug Step 11 PR-mode:** close-workflow push (sub-step 2, `--require-ci`) = CI trigger; gate in sub-step 6.
 - **Debug Step 11 LOCAL-mode:** create-pr push (sub-step 6, `--require-ci`) = CI trigger, its block re-deriving `AUTO_ROUTE_SUFFIX`; gate in sub-step 7.
 - **Ship:** OUT of scope. Step 14 reads the squash commit's CI with `bkit runs gate --head=<SQUASH_SHA>` and records `ship-merge-ci`. CI-Dispatch at ship would mask "essential tests skipped" signal ship backstops.
@@ -1268,7 +1269,7 @@ Outcome-verification gate: after final loud push, confirms bkit CI check dispatc
 
 Every site derives `AUTO_ROUTE_SUFFIX` **in the same bash fence that consumes it** from the labels the workflow re-read (`bkit issues fetch --outbox`, the tracker MCP on exit 80): `bkit issues labels {LABEL_FLAGS}` prints `autoRouteSuffix` (`" bkit [auto route]"` on an exact `bkit:auto`, else empty), and the fence passes it as `bkit runs dispatch --auto-route-suffix=`. Never carry the suffix itself across a fence or step: no shell state (nor a `mktemp` path published via `$GITHUB_ENV`) survives a Bash-tool-call boundary.
 
-- **Build Step 15:** derived in the dispatch block itself.
+- **Build Step 16:** derived in the dispatch block itself.
 - **Debug Step 11:** derived in the close / create-pr commit block (sub-steps 2 / 5) for the commit subject, and again in the gate block (sub-step 6) for the dispatch.
 
 **Re-trigger commit:** `chore({FID}): re-trigger{AUTO_ROUTE_SUFFIX}`, created and pushed by `bkit runs dispatch` — opted-in issues carry `bkit [auto route]`. § `bkit [auto route]` Marker Propagation applies.
@@ -1426,7 +1427,7 @@ One FID for all artifacts once set. A workflow never takes `FID` from the newest
 No phase needs a plan file. A missing plan is flagged, never fatal; only "nothing to act on" stops a run.
 
 - **No issue:** Step 1 recovers `ISSUE_ID` from a named `FID` or a `feat/{FID}` branch via `bkit fids parse --branch` (a branch id counts only when `.bkit/issues.jsonl` has a feature row for it; a non-slug branch suffix is a STOP); none found → `ISSUE_ID=""`, the no-issue warning (`**No issue:**` header bullet; first line of every final message), and every issue-tied tracker read, label, comment, board call and kill-switch check is skipped (`**Skip if** ISSUE_ID empty`). Workflows never create issues; `/bkit-design` Step 11 needs an issue. `none` → runs without, no warning. Naming the issue-less `FID` in the next prompt is the only way to continue an earlier run (logs and attempt counter continue, as under `none`). A reworded prompt mints a new `FID` and the attempt counter restarts; a minted name whose earlier run finished takes the first free suffix (`{fid}-b`, `{fid}-c`, …) from `bkit fids resolve`, so a repeat never reopens finished logs. A `FID` taken from the prompt or the branch is never suffixed.
-- **No plan:** build writes one — Step 3 `@bkit-build-plan-convert` turns the session prompt and issue text into `{FID}-plan.md` in task-block form, so every build runs from a plan file. A converted plan carries no `bkit:anchor`, so Plan Current skips (Step 4 `anchor-read` exit 12). Ship: a built FID always has `{FID}-plan.md`; none → Step 5 writes a console warning (the branch was not built by `/bkit-build`) and `ship-input-{RUN}.md` (prompt + issue text) is the plan, never written or ticked; `@bkit-ship-deferred-sweep` takes tasks from its requested outcomes, outcome as worded is the bar.
+- **No plan:** build writes one — Step 4 `@bkit-build-plan-convert` turns the session prompt and issue text into `{FID}-plan.md` in task-block form, so every build runs from a plan file. A converted plan carries no `bkit:anchor`, so Plan Current skips (Step 5 `anchor-read` exit 12). Ship: a built FID always has `{FID}-plan.md`; none → Step 5 writes a console warning (the branch was not built by `/bkit-build`) and `ship-input-{RUN}.md` (prompt + issue text) is the plan, never written or ticked; `@bkit-ship-deferred-sweep` takes tasks from its requested outcomes, outcome as worded is the bar.
 - **No PR, `/bkit-ship`:** opened by ship when the branch is ahead of `dev`. Red or missing CI on an existing PR still stops ship — it never merges unverified work.
 - `/bkit-auto` is out of scope: it is dispatched by CI on an issue label or PR, so an issue or PR always exists.
 
@@ -1459,8 +1460,8 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
 | `bkit:gate:min` | `pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `.husky/pre-push` on a min push |
 | `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `@bkit-build-plan-execute`, `.husky/pre-push` revert path |
-| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Steps 7 + 11, `.husky/pre-push` (no integration gate declared), `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify`, `@bkit-debug-failure-remediate` |
-| `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Steps 7 + 11, debug Step 3, `.husky/pre-push` |
+| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Steps 8 + 12, `.husky/pre-push` (no integration gate declared), `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify`, `@bkit-debug-failure-remediate` |
+| `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Steps 8 + 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — chains the gate above | debug Step 3 |
 | `bkit:gate:static-unit-integration-e2e-live` | not seeded — chains the gate above | debug Step 3 |
 | `bkit:gate:install-static-unit-build` | `pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build` | `@bkit-ship-conflict-resolve` |
@@ -1480,7 +1481,7 @@ Build and debug each run the deepest gate the consumer declares, and record its
 <!-- prettier-ignore -->
 | Workflow | Candidates, descending | Stops at |
 | --- | --- | --- |
-| build Step 7 (group gate), Step 11 | `static-unit-integration`, `static-unit` | integration |
+| build Step 8 (group gate), Step 12 | `static-unit-integration`, `static-unit` | integration |
 | debug Step 3 | `…-integration-e2e-live`, `…-integration-e2e`, `static-unit-integration`, `static-unit` | live |
 
 Build stops at integration because its diagnose → remediate loop can only repair what its own gate runs — a tier left to CI is a defect the agent cannot fix in-session (build closes green, the PR reds, recovery is a separate `/bkit-debug`). Integration catches contract breaks the unit tier structurally cannot, at a cost the loop absorbs; E2E does not pay for itself there — a production build plus a browser, re-run on every remediation attempt, minutes before CI runs the same thing on the resulting PR. Debug reaches every tier because reproducing the failure is the job.
@@ -1495,10 +1496,10 @@ Build does not run the live tier (post-merge `bkit-tests-live` canary). Every `b
 
 ### Group gate
 
-Build Step 7 runs the Step 11 gate after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 8 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it — Steps 9 + 11 follow.
+Build Step 8 runs the Step 12 gate after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it — Steps 10 + 12 follow.
 
 - **Orchestrator-owned:** agent gate runs (execute, gaps-remediate, verify) are self-reported in their logs; the group gate writes a `build-group-gate` row (`verdict`, `scope`), so a skipped gate is visible.
-- **Same gate as Step 11:** includes integration, plus the coverage floor where the consumer chains one into `bkit:gate:static-unit`. Without it, a group breaking what a later one assumes surfaces only at Step 11 — one large unattributed diff, budget partly spent.
+- **Same gate as Step 12:** includes integration, plus the coverage floor where the consumer chains one into `bkit:gate:static-unit`. Without it, a group breaking what a later one assumes surfaces only at Step 12 — one large unattributed diff, budget partly spent.
 - **Strict, no exceptions:** the end of a group is where a build can stop (verify budget exhausted, session lost, `/bkit-ship` resume) → it must hold a validated tree. No expected-red declaration. A red gate is an ordering defect (signature change split from callers, deletion before replacement, tests deferred to a later task): `@bkit-plan-generate` orders its groups to keep every group gate green, putting the tasks in one group when it cannot. Add an exception mechanism only once a real case shows a legitimate red group gate.
 
 ### Test-first
@@ -1508,9 +1509,9 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 <!-- prettier-ignore -->
 | Moment | Who | What is checked |
 | --- | --- | --- |
-| Red (Step 6, per planned test) | `@bkit-build-plan-execute` runs `bkit tests red`, log `build-task-red-N-{task}-{test position}.md` | the named test ran and failed in the `bkit:test:file` JUnit report on a non-zero exit. Otherwise exit 1, nothing recorded, `refused` = `no-report` / `not-run` / `passed` / `skipped` / `exit-mismatch`. Records a `build-task-red` row (`task`, `test`, `testName`, `testBlob`, `failure`; `--commit=none`) plus the runner log and a `.snapshot` copy of the test file. An earlier red for the same task + test + name with an unchanged test file stands: exit 0, `already: true`, nothing runs. |
-| Green (Step 7, before verify) | orchestrator runs `bkit tests green` | per planned test: a red row matching task + test file + test name (a task red for an unplanned test → `red-mismatch`, naming whether that recorded test passes now); red recorded before the task's code (else `late-red`); test file unchanged since its snapshot or only added lines (diff in report); the named test passes now. Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Test order only` header, `Test exceptions` and `Late-red check` sections); prints `testOrderOnly`, `lateRedUnchecked`. |
-| Judgement (Step 7) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `test-changed` → judged from the diff (formatting → no gap); `added lines only` → judged from the diff (a line added inside a planned test or setup it runs → `test-changed`); `red-mismatch` → planned test renamed or moved and passing now → no gap, nor for its `not-green`; `no-red` on a task the plan-currency report marks `Broken` (already landed) and execute logs `DONE — already landed` → no gap; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. Test-order gaps listed with task, test file and test name. |
+| Red (Step 7, per planned test) | `@bkit-build-plan-execute` runs `bkit tests red`, log `build-task-red-N-{task}-{test position}.md` | the named test ran and failed in the `bkit:test:file` JUnit report on a non-zero exit. Otherwise exit 1, nothing recorded, `refused` = `no-report` / `not-run` / `passed` / `skipped` / `exit-mismatch`. Records a `build-task-red` row (`task`, `test`, `testName`, `testBlob`, `failure`; `--commit=none`) plus the runner log and a `.snapshot` copy of the test file. An earlier red for the same task + test + name with an unchanged test file stands: exit 0, `already: true`, nothing runs. |
+| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red row matching task + test file + test name (a task red for an unplanned test → `red-mismatch`, naming whether that recorded test passes now); red recorded before the task's code (else `late-red`); test file unchanged since its snapshot or only added lines (diff in report); the named test passes now. Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Test order only` header, `Test exceptions` and `Late-red check` sections); prints `testOrderOnly`, `lateRedUnchecked`. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `test-changed` → judged from the diff (formatting → no gap); `added lines only` → judged from the diff (a line added inside a planned test or setup it runs → `test-changed`); `red-mismatch` → planned test renamed or moved and passing now → no gap, nor for its `not-green`; `no-red` on a task the plan-currency report marks `Broken` (already landed) and execute logs `DONE — already landed` → no gap; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. Test-order gaps listed with task, test file and test name. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts. A runner reporting a load error as one case named after the file never matches the test name.
 - **Stub first:** tests failing only because the code they import does not exist never show their assertions failing, so the agent writes stubs and each red is an assertion.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 399581475..1a30b6a96 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -6755,7 +6755,7 @@ Header bullets of the 6 workflow files, block by block, in file order; `.bkit/au
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 9, 10 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 7) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. Lock path is **absolute** (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included — the lock file is gitignored and never rides a commit) so acquire/release resolve to the same inode regardless of cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: when `dev` requires status checks, `bkit prs update-branch` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted **under the working directory its dispatch supplied** — `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
diff --git a/.bkit/version b/.bkit/version
index 4548a1190..1dc793c4a 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "8188271e9949a4fe71808bae5d70b33c192abf7cd5645b5051803ab531c2f2ac",
     "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
     ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
-    ".claude/commands/bkit-build.md": "c73b20aaa4eb3a430dc7aa4f4f90c886138aaa94cfd42a3222c566376eed752d",
+    ".claude/commands/bkit-build.md": "6e1015c1870e4f5f5c58d45b3f12d0acacb3f0c238753f8cc72b6d40842635e2",
     ".claude/commands/bkit-debug.md": "8b2daf5c76a8af4a0cea22db8eb0532e83aa59467d1850294908883fe3bd5c99",
     ".claude/commands/bkit-design.md": "d33ed5f1f0f39dbe4a69b660d0ae232334fc65389b0353533801a4d39d23bfab",
     ".claude/commands/bkit-plan.md": "824c1d35ec9fd12b1dd0c0b4ffd44dbe23a3c6682a8cb8df2f03e56cbab4e2fa",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1fec2147e04b0948b07f2d2a036c03c3e20f5e7b01e5c9fda6ff3f170bb20429",
     ".claude/agents/bkit-utility-update-documentation.md": "c3ab27e9c74f234c6dee971ad1423dca38fbf495e90397ff27957236dd5f1030",
     ".cursor/commands/bkit-auto.md": "c7529c630eab40cb88df138a386f7418e3edf02275344d430697c56a1d511a2e",
-    ".cursor/commands/bkit-build.md": "40e53d76762207783832695ca392c0efee510f89edc0e7497dee383c2922693d",
+    ".cursor/commands/bkit-build.md": "4b282e53f19424e0ad0f9595bafae22d63bb2fae9db67114c2b7575256fe4a47",
     ".cursor/commands/bkit-debug.md": "164f525693dc1ea720e205736e2cf459e8c7eeb25dcf792a342dfd31f8b12520",
     ".cursor/commands/bkit-design.md": "08df3f3d95ad9ba3967e467d723e40273738b73db53d76bc2e1babf4c51c6d2b",
     ".cursor/commands/bkit-plan.md": "8ab05a876f3a440721d440d606134b1657e5ce46fb42a7875495fd6189aa542a",
@@ -117,7 +117,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "3ce9c929a3b0c575596f22849dd22a855576e12211fc8a3652a28b432fb5513b",
     ".opencode/agents/bkit-utility-update-documentation.md": "6f5e202db7d30382594467acf9386ef64172e9f449785d229667101ce9f7dd8f",
     ".opencode/commands/bkit-auto.md": "5e8e9b3a2092de9fca48e787c3b60c33a4d86845a063a269fc6ee7a4dea13501",
-    ".opencode/commands/bkit-build.md": "a8be0f25258e6882a97fe819cde97315e2a5813adc91ffd2b35e1b329209e880",
+    ".opencode/commands/bkit-build.md": "f546e8e70739ac106a646eb90bae71c0b74f97abcbaa37ca637d9e0d934701ab",
     ".opencode/commands/bkit-debug.md": "e4b4752d3c4bf307469feeff18396bdaf7264591068668496bcdcc86fbd08876",
     ".opencode/commands/bkit-design.md": "06313cc3752ce43f6140c1fa54f4dbd6463cac643f271e6aa7464ddec15e1a40",
     ".opencode/commands/bkit-plan.md": "c2f39fc96e592d855c7ccf038176838709ad0c6aa27aae7faba708c3fdc73aff",
@@ -228,7 +228,7 @@
     ".bkit/providers.md": "d5c8cef101535a192a93cd9d1c9626ede070aef829eafba48e6e68aebdb8a3e4",
     ".bkit/prompts.md": "4aea780ed1c7fd82b9a3fe5c22a1151fc804d93c44b6c4ab2e3703080d6db19f",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
-    ".bkit/workflows.md": "eac6d5b8fda266b6c4355c1471598641e316164cf4c07c6dafd63f27890c449e",
+    ".bkit/workflows.md": "3c48a738be3d0297fd5cc3d8ffe11ceccd3b96eabc00557fd03f99d5293bf38f",
     ".bkit/README.md": "f736ccce1d773794e8178b9abb8ef0be8f2238e26b5bc2d45e423e39680c151e",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "839a1e2c52484956a310f763df6ce749d649e4dab9ac035f52b462b4b69609d6",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 6aa370b21..96b2d821c 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -96,7 +96,7 @@ Re-runnable: source carries wired variants; tracker switch (`--tracker=linear` a
 - **`BKIT_VER` reads `pinnedVersion`, not `version`:** `[ -z … ] &&` fallback, not piped one — pipeline status = last command's; `| tr … || echo` fallback never fires on failed grep.
 - **`deferrals` / `failures` on `outcome` row = CUMULATIVE distinct `key` count, not lines:** same-`key` append (§ Updating a Row in `.bkit/jsonl.md`) → `wc -l` double-counts closed deferrals. Readers derive cycle from delta vs prior outcome row — `newFailuresThisRun` in `.bkit/core/engine/commands/analysis.ts`.
 - **CI-Dispatch poll:** `bkit runs dispatch` (`--budget-s` / `--interval-s`, default 60/10), shared by build's close-workflow and both debug close-workflow sites (PR-mode + LOCAL-mode). A poll outcome is `found` / `none` / `err`; a `sleep` that overruns its window is reported blocked instead of hanging. Self-heal cap 1; re-trigger suffix must match close-workflow suffix. `ciDispatch` verdict always on step-done record (additive field). No `CAN_SLEEP` / `RUNTIME_SLEEPS` capability row — sleeping is measured, not predicted. Blocked sleep → exit 81 → the orchestrator resolves the same poll in its turn loop (`bkit runs wait --pr= --once` per turn), then re-runs `dispatch` with `--poll-result` / `--attempts` / `--all-errored` / `--retriggered`.
-- **Open-PR pre-flight:** `bkit prs open` probes `--head` before creating: an open PR exits 3 (`--existing=fail`, the default) or is reused (`--existing=reuse`, design / plan PR close). A blind create on a branch with an open PR errors, retries, and lands in the Failure Path. Build Step 15 also probes (`bkit prs probe`) before its push.
+- **Open-PR pre-flight:** `bkit prs open` probes `--head` before creating: an open PR exits 3 (`--existing=fail`, the default) or is reused (`--existing=reuse`, design / plan PR close). A blind create on a branch with an open PR errors, retries, and lands in the Failure Path. Build Step 16 also probes (`bkit prs probe`) before its push.
 - **Roadmap row per phase close:** each close appends its own `kind:"feature"` row through `appendFeature`, then re-renders the `roadmap-status` block from the ledger. Re-rendering is safe because that block is a PURE PROJECTION of `.bkit/issues.jsonl` — so there is no foreign on-disk state to preserve and nothing to parse back. An unchanged section renders byte-identically, so the diff shows only the row that moved. design / plan: `bkit branches land` writes the row into the close commit it builds in `.worktrees/_land-{FID}` (direct push) or on the branch pre-merge (PR); STRAY allowlist admits both. build / debug: `bkit roadmap mirror` writes it on `feat/{FID}` (swept by `git add -A`), then lands the same row on `dev` through the throwaway `.worktrees/_land-{FID}` landing (§ One landing routine for every dev write) — 4th staging shape: ship merges their PR a cycle later, board would otherwise lag one. The mirror is fail-open — a refused push, `dev` moving before every attempt, or a failed fetch or checkout logs and continues; feat-side row already written. ship: `bkit roadmap feature --strict` (Step 6, below) exits 1 when the `SHIPPED` row does not land, failing the step.
 - **Dev-side mirror: every runtime, skipped only on `dev`:** the landing never checks out `dev`, so adopt mode mirrors like mint mode. Run on `dev` (debug adopting `dev`) → skip; its feat-side row is already a `dev` commit.
 - **Phase close never reads the tracker:** a close re-renders the `roadmap-status` block from the ledger and stops. It issues no `list_issues` and writes no label on any issue but its own. A workflow running on one issue may mutate only that issue; a tracker read touches every open one.
@@ -126,7 +126,7 @@ Re-runnable: source carries wired variants; tracker switch (`--tracker=linear` a
 - **`FID` slug assertions (`bkit-auto` Step 1, `bkit runs context`):** `bkit fids` holds the regexes (`runs context` checks a CI_DEV slug against the `any` allowlist and recovers a PR's FID with the same marker parsing as `bkit fids parse`, and a strict branch parsing); they are allowlists (canonical `^[0-9]+-[a-z0-9-]+$` for GitHub issue-prefixed slugs, `^[a-z]+-[0-9]+-[a-z0-9-]+$` for Linear-prefixed slugs, `^[a-z][a-z0-9]+-[0-9]+-[a-z0-9-]+$` for Jira-prefixed slugs, safe `^[a-z0-9][a-z0-9-]*$` for the no-tracker + branch-derive fallback, tracker-agnostic `^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$` for the CI_DEV slug arg, `--tracker=any`). They reject path traversal and shell metacharacters in the untrusted PR-body marker before `{FID}` reaches any filesystem path or downstream dispatch. `bkit fids parse` tries the marker first and falls back to the `feat/{FID}` branch only when the marker is missing or malformed, and the fallback resolves `{ISSUE_ID}` too — from the `{FID}` slug (github: leading numeric segment; linear / jira: first two dash-segments, uppercased), each behind its own allowlist — but keeps it only when `.bkit/issues.jsonl` holds a feature row keyed by that FID shape; otherwise it returns `issueId: null` and the run is issue-less with the suffix verbatim as `{FID}`. A branch suffix that is not a lowercase slug exits 3. `bkit runs context` (the `bkit-auto` dispatch) keeps the strict branch parsing, with no feature-row lookup: an FID that embeds an issue id gives that id, an issue-less slug gives none, and any other shape is rejected. Under the no-tracker variant `{ISSUE_ID}` stays empty by design and the comment is skipped. The branch-derive accepts `feat/**` only — the cloud router's `workflow_run` surface is `feat/**` plus `dev`, and no bkit phase mints any other branch prefix.
 - **Step 1 FID resolution in every phase workflow:** design, plan, build, debug and ship write the session prompt verbatim to `{SESSION_DIR}/prompt.md` (`repo info` prints a fresh `sessionDir` per call under `{OUTBOX_ROOT}/sessions/`, pruned after 7 days) and run `bkit fids resolve` on it, under every tracker, `none` included. First hit wins: a `FID` the prompt names (slug, `feat/{FID}`, or a `docs/plans/` path), the `feat/{FID}` branch (with an issue, only when the FID starts with it), the feature logged for the issue in the working tree or on `dev` (several → exit 4), a mint, a free `-b`, `-c`, … suffix. The format check runs last on whichever link won: with an issue the FID must embed that id; with none any lowercase slug passes. A bad `FID` fails before any work, not at `bkit prs open`, which keeps its own check as a backstop.
 - **`bkit-auto` CI_DEV mode (`bkit runs context`):** a post-merge `dev` CI failure has no open PR to read, so `bkit-cloud.yml` passes the `{FID}` slug instead of a PR number and `runs context` discriminates on `{ARG}` shape (numeric → PR, else slug). The slug is untrusted at the same level as the PR-body marker — it arrives from a commit-message scope on `dev` and the cloud-side `ARG` guard permits `.` and `/` — so the `any` allowlist is asserted (exit 9) before `{FID}` reaches `docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/{FID}`, or the `/bkit-debug {FID} {REF}` dispatch. `prNumber`, `prUrl` and `runId` are printed null rather than filled with a `(merged)` sentinel: the Step 1 comment drops its PR and run links in CI_DEV, and a sentinel would render a broken link. The open check (exit 7) and the CI-run lookup (exit 8) are on the CI path only.
-- **Auto-route marker derivation is fence-local (build Step 15, debug Step 11, ship Step 10):** every site re-reads the issue's labels (`bkit issues fetch --outbox`, the tracker MCP on exit 80) and hands them as `{LABEL_FLAGS}` to the command that writes the commit — `bkit workflows close --label=` (build / debug close commit), `bkit runs dispatch --label=` (the gate's re-trigger commit), `bkit prs merge --label=` (ship's squash subject) — which appends ` bkit [auto route]` on an exact `bkit:auto` match; no `gh` call. Two dead shapes preceded it and must not return: `${LABELS:-}` (an MCP-derived template value that is never assigned as a shell variable, so it always expanded empty), and a `mktemp` path published via `$GITHUB_ENV` (the runner applies `$GITHUB_ENV` only BETWEEN Action steps, while every agent Bash tool call in a cloud dispatch runs inside the one `claude-code-action` step). The exact label match mirrors the kill switch in `bkit-cloud.yml`, the marker's only consumer, so `bkit:auto-paused` / `no-bkit:auto` cannot arm the route. No tracker (`none`) passes no labels and leaves the subject unchanged. The marker becomes permanent `dev` history; that is inherent to reading `head_commit.message` and is not cleaned up later. Any resulting cross-session `/bkit-debug` dispatch loop is capped by `MAX_DEV_DISPATCH_ATTEMPTS` (a workflow-level env in `bkit-cloud.yml`, held equal to `bkit counters max` by `counters.test.ts`).
+- **Auto-route marker derivation is fence-local (build Step 16, debug Step 11, ship Step 10):** every site re-reads the issue's labels (`bkit issues fetch --outbox`, the tracker MCP on exit 80) and hands them as `{LABEL_FLAGS}` to the command that writes the commit — `bkit workflows close --label=` (build / debug close commit), `bkit runs dispatch --label=` (the gate's re-trigger commit), `bkit prs merge --label=` (ship's squash subject) — which appends ` bkit [auto route]` on an exact `bkit:auto` match; no `gh` call. Two dead shapes preceded it and must not return: `${LABELS:-}` (an MCP-derived template value that is never assigned as a shell variable, so it always expanded empty), and a `mktemp` path published via `$GITHUB_ENV` (the runner applies `$GITHUB_ENV` only BETWEEN Action steps, while every agent Bash tool call in a cloud dispatch runs inside the one `claude-code-action` step). The exact label match mirrors the kill switch in `bkit-cloud.yml`, the marker's only consumer, so `bkit:auto-paused` / `no-bkit:auto` cannot arm the route. No tracker (`none`) passes no labels and leaves the subject unchanged. The marker becomes permanent `dev` history; that is inherent to reading `head_commit.message` and is not cleaned up later. Any resulting cross-session `/bkit-debug` dispatch loop is capped by `MAX_DEV_DISPATCH_ATTEMPTS` (a workflow-level env in `bkit-cloud.yml`, held equal to `bkit counters max` by `counters.test.ts`).
 - **Host skill mirrors are in the `--scope=full` bookkeeping pathspec:** `npx skills remove` deletes `.claude/skills` / `.cursor/skills` / `.opencode/skills` alongside `.agents/skills/<name>`, so the close staging must be able to carry those deletions. `bkit ledgers commit` builds its pathspec via `git ls-files -z --cached --others --exclude-standard`, so an unmatched glob is empty output (never fatal) and `--cached` still emits a tracked-but-deleted mirror, so the deletion stages cleanly — a claude-only consumer with no `.cursor` / `.opencode` mirror sweeps zero for those globs rather than aborting. Without them the prune commit holds only `.agents/skills` + `skills-lock.json` and the mirror deletions leak into the working tree, where the next unrelated staging sweeps them into a foreign commit.
 - **Ship Step 7 never prunes `bkit-*` skills:** they are bkit render output (Codex host workflow entry points), absent from `.agents/skills.md`. `bkit skills prune` keeps every `bkit-*` skill; without that guard every ship uninstalls them. A missing `.agents/skills.md` skips the prune with a warning (`skipped: "no-registry"`) rather than uninstall everything; a failed uninstall is warned and listed in `failed`. Both exit 0: pruning is housekeeping, so the ship carries on and still closes.
 - **Staging routes through `bkit ledgers commit`, never a shell pathspec:** a pathspec rebuilt inline per block with unquoted word-splitting and an `ls docs/plans/*/logs/*/*.jsonl docs/*.jsonl .bkit/*.jsonl` glob ABORTS under zsh when unmatched — silently dropping every ledger in a fresh consumer repo, and (worse) swallowing a failed `git add` into a false "nothing to commit" success, since nothing in these blocks sets `set -e`. `bkit ledgers commit` builds the pathspec with `git ls-files` — an unmatched glob is empty output, never an abort — and stages/commits it via `--pathspec-from-file --pathspec-file-nul` rather than a re-interpolated shell string. It refuses to reach `commit` when that list is empty (exit 6): `git commit --pathspec-from-file=<empty file>` does not commit nothing, it silently commits whatever is ALREADY staged in the index. Ship's markdown stages through it at the B2 conflict-resolve stage and the Step 8 bookkeeping commit, each stopping the step on failure (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`); the Failure Path flush and the Close flush run the same code inside `bkit workflows handover --flush` / `bkit workflows close --flush`. `commands/workflow/ledgers.test.ts` covers the command itself.
@@ -230,7 +230,7 @@ Header bullets of the 6 workflow files, block by block, in file order; `.bkit/au
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 9, 10 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 7) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. Lock path is **absolute** (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included — the lock file is gitignored and never rides a commit) so acquire/release resolve to the same inode regardless of cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: when `dev` requires status checks, `bkit prs update-branch` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted **under the working directory its dispatch supplied** — `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
@@ -268,7 +268,7 @@ Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source
 | `runtime-resolved` | `{type, workflow, at, runtime, runtimeWorktrees, runtimeDevPushes, runtimeGithubCli, runtimeGithubCliExit, runtimeGithubCliErr, baseSha}` | Step-2 (Worktree Setup) record of the runtime capability table for this run — the first step `{FID}`/`WORKTREE_PATH` are resolved. Written by `bkit runtime row --file=` (detects, then appends), read back by `bkit runtime assert` (exit 4 no row, 5 an unresolved field). Not folded (unrecognised `type` — ignored, no-op) — later steps re-read `runtimeGithubCli` from this row instead of re-probing `gh`; shell state does not survive a Bash-tool-call boundary, so this row is the durable cross-block record. `baseSha` = `git merge-base origin/dev HEAD` for the design/plan worktree (`--base-sha=`, from `bkit worktrees setup`'s `baseSha`), recorded after Step 2's worktree/rebase arm settles; Close Workflow reads it back to stamp the canonical doc's `bkit:anchor` block (§ Anchor Block) rather than recomputing against a `dev` that has since advanced. Empty for build, debug, ship. |
 | `transport-fallback` | `{type, from, to, reason, assertedBy, at}` | One gh->MCP transition (bounded max 1/run). `from` = the gh command that was unavailable/unauthed; `to` = the mapped MCP tool used instead; `assertedBy` = how the fallback's success was independently re-read. Not folded. Emitted by `bkit prs transport-row --kind=fallback`; read back by `bkit prs cross-check` at Close Workflow — an `mcp` close with `runtime-resolved.runtimeGithubCli=false` and no row here is a Failure Path. |
 | `close-transport` | `{type, shape, sha, scanResult, at}` | Close Workflow's own audit-trail entry. `shape` = which close shape ran — `local` (design/plan squash built off `origin/dev` + direct `dev` push), `pr` (design/plan PR squash-merge after the `dev` push was refused), `push` (build/debug direct push to the feature branch); `sha` = the commit landed on `dev`; `scanResult` = `bkit prs scan-body`'s post-close outcome on the LANDED commit BODY (subject excluded), transport-agnostic. Not folded. Emitted by `bkit prs transport-row --kind=close`. |
-| `challenge-gate` | `{type, workflow, at, range, linesChanged, filesChanged, size, limit, agents, skipped}` | One build Step 10 size measurement (`bkit challenge gate`), written on every pass: `size` `small` (under `limit` = 300 lines and 10 files, `docs/plans/**` excluded) runs `@bkit-build-challenge-2` alone and sets `skipped`; `large` runs both. Not folded; the summary and the `outcome` row's `build.challenge.gate` read the latest. |
+| `challenge-gate` | `{type, workflow, at, range, linesChanged, filesChanged, size, limit, agents, skipped}` | One build Step 11 size measurement (`bkit challenge gate`), written on every pass: `size` `small` (under `limit` = 300 lines and 10 files, `docs/plans/**` excluded) runs `@bkit-build-challenge-2` alone and sets `skipped`; `large` runs both. Not folded; the summary and the `outcome` row's `build.challenge.gate` read the latest. |
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
@@ -623,7 +623,7 @@ Every stamp (design, plan, audit report) adds 2 more when `.bkit/version` exists
 
 **Truth, not intent:** stale `origin/dev` at fetch → recorded `baseSha` is the stale base actually branched from; later diff surfaces that honestly rather than papering over it.
 
-**Read by build's Plan Current step** (`/bkit-build` Step 4) — the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
+**Read by build's Plan Current step** (`/bkit-build` Step 5) — the only consumer of `baseSha` on a plan doc. `designPath` / `designBaseSha` are provenance only and have no consumer: once a plan exists it is judged against the codebase, never against its design. Absent or unreachable `baseSha` skips the judgement, never fails it.
 
 ### Gates
 
@@ -680,16 +680,16 @@ Then assert each Update/Create artifact exists, non-empty. Empty → **Failure P
 <!-- prettier-ignore -->
 | Agent | `Verdict` values | Routing |
 | --- | --- | --- |
-| `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 5. CONCERNS / FAIL → Step 5 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 6: `@bkit-build-plan-execute` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
-| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 9 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop (Decision Pause before each further round while `build.verify.maxAttempts` allows, else Failure Path; § Loop pause); FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. |
-| `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 11; `fix` → Step 6 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical | architectural`; architectural → `**Fixable:** false`. |
+| `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 6. CONCERNS / FAIL → Step 6 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 7: `@bkit-build-plan-execute` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
+| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop (Decision Pause before each further round while `build.verify.maxAttempts` allows, else Failure Path; § Loop pause); FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. |
+| `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 12; `fix` → Step 7 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical | architectural`; architectural → `**Fixable:** false`. |
 | `@bkit-design-review-1` / `-2` | PASS / CONCERNS / FAIL | `REVIEW_VERDICT` = worst-of-two. PASS/CONCERNS → Step 7 spike (`REVIEW_SPIKE` = true) else Step 8 apply-review; FAIL → Failure Path (design fundamentally not viable, human reframe required). `@bkit-design-review-1` additionally emits `Spike` (`true` / `false`) in its header — a routing flag, not a verdict; `REVIEW_SPIKE` gates Step 7 only and never contributes to `REVIEW_VERDICT`. |
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
 | `@bkit-design-update` | PASS / CONCERNS / FAIL | All paths continue to Step 9 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
 | `@bkit-design-organise` | PASS / CONCERNS / FAIL | PASS/CONCERNS → Step 10 summary; FAIL → Failure Path (cycles detected, human review required). |
 | `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a matrix-to-runbook mapping no edit recovers), so a human reframes the design or the issue. |
 | `bkit workflows summary` (`design`, `plan`, `build`, `debug`, `ship`) | PASS / CONCERNS / FAIL | PASS or CONCERNS → close workflow / next step; FAIL → Failure Path. |
-| `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 7, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
+| `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 8, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
 | 2-way agents (`@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`, `@bkit-ship-deferred-sweep`) | PASS / FAIL | PASS → continue; FAIL → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: PASS clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; FAIL leaves sentinel and routes to `@bkit-debug-abort-handover`. For `@bkit-ship-deferred-sweep`: PASS → Merge (Step 6); FAIL touches `docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens). FAIL only on >=1 of four blocking tests (behaviour / safety / false green / consumer break); a gap passing none joins the third track `Lazy (unjustified)`, orthogonal to the verdict — recorded in `docs/deferrals.jsonl` (`reason` = `unjustified`; new `key` unplanned, own `key` re-appended when adjudicated) and resurfaced, never merged against. |
 
 ### Retry / timeout / iteration constants
@@ -771,13 +771,13 @@ Step 10's `bkit prs merge --label=…` appends ` bkit [auto route]` to the squas
 
 **Placement (mode-dependent):**
 
-- `/bkit-build` Step 15: `bkit:auto` re-read before close-workflow commit. Present → subject `chore({FID}): close-workflow bkit [auto route]`. Close-workflow = feat-branch HEAD firing CI → gate checks `head_commit.message`.
+- `/bkit-build` Step 16: `bkit:auto` re-read before close-workflow commit. Present → subject `chore({FID}): close-workflow bkit [auto route]`. Close-workflow = feat-branch HEAD firing CI → gate checks `head_commit.message`.
 - `/bkit-debug` Step 11 PR-mode: same — marker on close-workflow (sub-step 2). Create-pr (sub-steps 4-5) does not run (`TRIGGER_PR=0`).
 - `/bkit-debug` Step 11 local-mode: `bkit:auto` re-read before the create-pr commit (sub-step 5). Marker on create-pr = CI-triggering HEAD local-mode.
 - `/bkit-ship` Step 4 (B1/B2, feat-branch HEAD): no placement — see "Ship does not carry the marker on the feat-branch HEAD" above. B1 (`bkit prs update-branch --only-if-required`) and B2 (`chore({FID}): conflict-resolve bkit [skip ci]`) both leave an unmarked HEAD by construction; there is no dev-sync merge to mark. Cloud gate in-job `bkit:auto` re-check = live kill switch.
 - `/bkit-ship` Step 10 (squash-merge subject, `dev`): labels re-read (`bkit issues fetch --outbox`, the tracker MCP on exit 80) in the merge sub-step and passed to `bkit prs merge` as `{LABEL_FLAGS}` — never carried forward from Step 1's `{LABELS}`. `bkit:auto` present → ` bkit [auto route]` appended to the subject. This is the commit that fires the post-merge `dev` free-tier gate — the only marker `/bkit-ship` places.
 
-**Why re-read must precede commit:** kill-switch re-read at build Step 15 / debug Step 11 sub-step 8 runs after commit+push — cannot source marker on existing commit. Fresh `bkit:auto` read before commit construction = authoritative "at close time" signal.
+**Why re-read must precede commit:** kill-switch re-read at build Step 16 / debug Step 11 sub-step 8 runs after commit+push — cannot source marker on existing commit. Fresh `bkit:auto` read before commit construction = authoritative "at close time" signal.
 
 **Coexistence with `bkit [verbose ci]`:** debug local-mode both on same subject: `chore({FID}): close-workflow bkit [verbose ci] bkit [auto route]`. HEAD-Subject Assertion: both legitimate. Gate reads `bkit [auto route]` via `contains(head_commit.message, 'bkit [auto route]')` — `bkit [verbose ci]` does not interfere.
 
@@ -859,48 +859,49 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 
 **Hard stop in Step 8 final return:** "**HARD STOP** — do not invoke `/bkit-build`."
 
-### `/bkit-build` — 15 steps
+### `/bkit-build` — 16 steps
 
 **Goal:** implementation + PR creation. CI takes over after PR exists. Workflow stops on PR creation; no human gate within build itself.
 
-**Build never reads the CI conclusion (by design):** Step 15 CI-Dispatch Gate proves only that a run started (`bkit runs dispatch`). `/bkit-ship` owns the result (`bkit runs gate` refuses to merge on red); red PR → `/bkit-debug` (manual, or auto-routed by `bkit-cloud.yml`). Waiting in build → full CI duration on every run + race with the cloud auto-router on the same branch. Final message states it.
+**Build never reads the CI conclusion (by design):** Step 16 CI-Dispatch Gate proves only that a run started (`bkit runs dispatch`). `/bkit-ship` owns the result (`bkit runs gate` refuses to merge on red); red PR → `/bkit-debug` (manual, or auto-routed by `bkit-cloud.yml`). Waiting in build → full CI duration on every run + race with the cloud auto-router on the same branch. Final message states it.
 
-**Group loop (Steps 6-8):** build works from one file, `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups within the `bkit.workflows.tasks` caps (§ Test-first). One pass of Steps 6-8 per group, in group order; `bkit context brief --next` picks the first group with a task neither ticked nor logged `DONE`, so a resumed run starts where the last one stopped. `VERIFY_ATTEMPT` is derived per group (`bkit counters derive --group={GROUP}`), so each group starts at 1. Between groups the build gate runs (§ Group gate). Only verify ticks tasks; the execute log's `DONE` lines are the handover between Steps 6 and 7.
+**Group loop (Steps 7-9):** build works from one file, `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups within the `bkit.workflows.tasks` caps (§ Test-first). One pass of Steps 7-9 per group, in group order; `bkit context brief --next` picks the first group with a task neither ticked nor logged `DONE`, so a resumed run starts where the last one stopped. `VERIFY_ATTEMPT` is derived per group (`bkit counters derive --group={GROUP}`), so each group starts at 1. Between groups the build gate runs (§ Group gate). Only verify ticks tasks; the execute log's `DONE` lines are the handover between Steps 7 and 8.
 
 <!-- prettier-ignore -->
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
-| 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 6). |
-| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
-| 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
-| 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
-| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
-| 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
-| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
-| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
-| 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
-| 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
-| 13 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 11 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 11 (its next row is the next `TEST_ATTEMPT`). |
-| 14 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 15). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
-| 15 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 7). |
+| 3 — Branch Sync | — | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). |
+| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes no row and posts no comment. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 5 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
+| 6 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
+| 7 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
+| 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
+| 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
+| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 11 without re-running. FAIL → Failure Path. |
+| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (a round before the last, every task fixable) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 13; none left → Failure Path. |
+| 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 12 FAIL)_ | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
+| 14 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 12 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 12 (its next row is the next `TEST_ATTEMPT`). |
+| 15 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 16). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
+| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.
 
 #### Decision Pause
 
-One mechanism for every build question: verify gaps logged `Fixable: false` (test-order gaps included), a no-progress Step 8 attempt, challenge tasks no agent can fix (`**Fixable:** false`) or left after the last challenge round, and a verify or test round that failed while rounds are left. Limits never move: a used-up limit goes to the Failure Path whether or not a question was asked (§ Ask points).
+One mechanism for every build question: verify gaps logged `Fixable: false` (test-order gaps included), a no-progress Step 9 attempt, challenge tasks no agent can fix (`**Fixable:** false`) or left after the last challenge round, and a verify or test round that failed while rounds are left. Limits never move: a used-up limit goes to the Failure Path whether or not a question was asked (§ Ask points).
 
 - **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|VERIFY_LOOP|CHALLENGE|TESTS_LOOP`), `From` (`verify` / `challenge` / `tests`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points). Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:** `ask` true and not headless → the orchestrator, in session. NEVER a subagent — subagents cannot reach the human. `ask` false or headless → `bkit decisions apply --by=headless` takes each recommendation; exit 4 = hard blockers left → asked in a session (only those), Failure Path headless.
 - **Hard blockers:** test-order gaps (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`), the other unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
 - **Accept** by the owner: written ONLY after explicit human approval of that item; agents NEVER write one on own judgement. Test-order gap or `exception-refused` gap → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
-- **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 8, `From: tests` → Step 12. The round counts against the same limit.
-- **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 6 (`fix`), Step 8 (`retry` after a verify or group-gate loop) or Step 12 (`retry` after a tests loop), re-run Step 7 (`verify`), or Step 11 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 8 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 12 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 10 goes on to Step 11.
-- **Fixer reads the answer:** Step 8 (`@bkit-build-plan-gaps-remediate`) and Step 12 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: tests` → Step 13. The round counts against the same limit.
+- **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), or Step 12 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
+- **Fixer reads the answer:** Step 9 (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
@@ -1159,14 +1160,14 @@ PR / CI reads and writes go through `bkit` commands (exit 80 → the mapped MCP
 | `OWNER_REPO` (Step 1 of every phase) | `bkit repo info` (`gh`, else the origin remote) |
 | Dispatch-permission preflight (ship Step 1) | `bkit repo preflight --owner-repo` (advisory: warns and continues, exit 0) |
 | PR lookup, PR-mode detection | `bkit prs probe [--head= --base= --state= --number=]` |
-| PR creation (build Step 15, debug Step 11 LOCAL, design / plan PR close, ship Step 2 when no PR exists) | `bkit prs open` (base pinned `dev`, marker in body) |
+| PR creation (build Step 16, debug Step 11 LOCAL, design / plan PR close, ship Step 2 when no PR exists) | `bkit prs open` (base pinned `dev`, marker in body) |
 | CI presence / completion, CI-Dispatch Gate | `bkit runs wait`, `bkit runs dispatch` |
 | Ship merge gate, squash-commit CI | `bkit runs gate` |
 | Squash merge (ship Step 10; design / plan PR close) | `bkit prs merge` / `bkit branches land` → `gh pr merge {PR} --squash [--match-head-commit <head>] --subject "…" --body ""` — empty body strips feature `bkit [skip ci]` |
 | Path B refresh (ship Step 4 B1) | `bkit prs update-branch --only-if-required` |
 | PR check-rollup assert (ship Step 2) | `bkit prs checks --number` |
 | Feature-branch push to open a missing PR, bookkeeping push (ship Steps 2 / 8) | `bkit branches push --mode=plain` (never forced) |
-| `bkit [force build]` PR-title marker (build Step 18) | `bkit branches force-build` → `gh pr edit --title` |
+| `bkit [force build]` PR-title marker (build Step 16) | `bkit branches force-build` → `gh pr edit --title` |
 | `bkit [verbose ci]` PR-title marker (debug Steps 9 / 11) | `gh pr edit --title` |
 
 Code PRs never merge locally; `/bkit-ship` merges with `bkit prs merge` (`gh pr merge` underneath).
@@ -1190,7 +1191,7 @@ Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers fr

<!-- prettier-ignore -->
 | Tag | Effect |
 | --- | --- |
 | `bkit [skip ci]` | GitHub Actions skip the workflow / `vercel-build` sets `run_level=none`. |
-| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 15 when the branch changes migration sources: `bkit branches force-build` sets it in the PR title and on an empty marker commit; `bkit prs merge` drops it from the squash subject it builds from the title. |
+| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 16 when the branch changes migration sources: `bkit branches force-build` sets it in the PR title and on an empty marker commit; `bkit prs merge` drops it from the squash subject it builds from the title. |
 
 **Docs-only commits:** workflows append `bkit [skip ci]` (CI suppression). No `bkit [skip build]` marker — docs-only is not app-affected; host affected-detection cancels the build without it. Hosts cancelling only on `[skip build]` will build docs-only workflow commits — switch to affected-detection.
 
@@ -1205,10 +1206,10 @@ Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers fr
 | `docs({FID}): ship DONE` (ship Step 14 close-workflow on `dev`, or its `ship-close/{FID}` PR squash subject) | `bkit [skip ci]` |
 | `docs({FID}): {phase} aborted` (design / plan / build / debug Failure Path record on the feature branch) | `bkit [skip ci]` |
 | `chore({FID}): {phase} FAILED` (ship Failure Path — the single flush, carrying the handover and the reconciled branch-side artifacts, so ship emits no `aborted` commit; design / plan / build / debug Failure Path from a `dev` / `main` checkout, logs and ledgers only) | `bkit [skip ci]` |
-| `chore({FID}): close-workflow` (build Step 15 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
+| `chore({FID}): close-workflow` (build Step 16 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
 | `chore({FID}): close-workflow` (debug Step 11 PR-mode — opted-in) | none / `bkit [auto route]` (PR-mode, conditional) — same as build |
 | `chore({FID}): create-pr` (debug Step 11 local-mode — opted-in; `bkit branches push --commit`, one per run via an `engine-action` row) | `bkit [verbose ci]`; opted-in adds `bkit [auto route]` (local-mode, conditional) — CI-triggering HEAD in local-mode |
-| `chore({FID}): force build` (build Step 18, `bkit branches force-build`, migrations changed) | `bkit [force build]`; opted-in adds `bkit [auto route]` — the CI-triggering HEAD |
+| `chore({FID}): force build` (build Step 16, `bkit branches force-build`, migrations changed) | `bkit [force build]`; opted-in adds `bkit [auto route]` — the CI-triggering HEAD |
 | `chore({FID}): conflict-resolve` (ship Step 4 B2 — ONLY step that force-pushes `{SHIP_BRANCH}`) | `bkit [skip ci]` — never `bkit [auto route]`. Deliberate: ship dispatches CI itself at Step 9 on observed head movement and polls to completion, so the push must not also fire a push-triggered run. Ship Step 4 B1 (`bkit prs update-branch`) likewise leaves an unmarked HEAD — GitHub authors that merge commit and bkit cannot set its message. A local `origin/dev` merge pushed back onto `feat/{FID}` is never reintroduced here — it mutates the validated PR head. |
 | `{title} (#{PR_NUMBER})` squash-merge commit (ship Step 10 `bkit prs merge`, GitHub-authored, lands on `dev`) | none / `bkit [auto route]` (opted-in: `bkit:auto` re-read from the tracker immediately before merge, passed as `--label=`) — the CI-triggering HEAD that admits `bkit-cloud.yml`'s post-merge `dev` free-tier gate. Distinct from the B1/B2 rows above: GitHub authors this commit at merge time rather than pushing a local merge onto a validated head. |
 
@@ -1220,7 +1221,7 @@ Outcome-verification gate: after final loud push, confirms bkit CI check dispatc
 
 **Invoked by orchestrators** (not git hook — invariant contextual; bkit intentionally pushes `[skip ci]` HEADs intermediately). The HEAD-message clause is `bkit branches push --require-ci` (exit 6 on a CI-suppressing token in the HEAD message, body included); the PR-title clause is `bkit prs open` (exit 4 on a token in `--title`); the poll is `bkit runs dispatch`:
 
-- **Build Step 15:** close-workflow commit → `bkit branches push --mode=feature --require-ci` (no PR yet, no CI) → `bkit prs open` (the PR creation fires CI) → `bkit runs dispatch --pr=`.
+- **Build Step 16:** close-workflow commit → `bkit branches push --mode=feature --require-ci` (no PR yet, no CI) → `bkit prs open` (the PR creation fires CI) → `bkit runs dispatch --pr=`.
 - **Debug Step 11 PR-mode:** close-workflow push (sub-step 2, `--require-ci`) = CI trigger; gate in sub-step 6.
 - **Debug Step 11 LOCAL-mode:** create-pr push (sub-step 6, `--require-ci`) = CI trigger, its block re-deriving `AUTO_ROUTE_SUFFIX`; gate in sub-step 7.
 - **Ship:** OUT of scope. Step 14 reads the squash commit's CI with `bkit runs gate --head=<SQUASH_SHA>` and records `ship-merge-ci`. CI-Dispatch at ship would mask "essential tests skipped" signal ship backstops.
@@ -1268,7 +1269,7 @@ Outcome-verification gate: after final loud push, confirms bkit CI check dispatc
 
 Every site derives `AUTO_ROUTE_SUFFIX` **in the same bash fence that consumes it** from the labels the workflow re-read (`bkit issues fetch --outbox`, the tracker MCP on exit 80): `bkit issues labels {LABEL_FLAGS}` prints `autoRouteSuffix` (`" bkit [auto route]"` on an exact `bkit:auto`, else empty), and the fence passes it as `bkit runs dispatch --auto-route-suffix=`. Never carry the suffix itself across a fence or step: no shell state (nor a `mktemp` path published via `$GITHUB_ENV`) survives a Bash-tool-call boundary.
 
-- **Build Step 15:** derived in the dispatch block itself.
+- **Build Step 16:** derived in the dispatch block itself.
 - **Debug Step 11:** derived in the close / create-pr commit block (sub-steps 2 / 5) for the commit subject, and again in the gate block (sub-step 6) for the dispatch.
 
 **Re-trigger commit:** `chore({FID}): re-trigger{AUTO_ROUTE_SUFFIX}`, created and pushed by `bkit runs dispatch` — opted-in issues carry `bkit [auto route]`. § `bkit [auto route]` Marker Propagation applies.
@@ -1426,7 +1427,7 @@ One FID for all artifacts once set. A workflow never takes `FID` from the newest
 No phase needs a plan file. A missing plan is flagged, never fatal; only "nothing to act on" stops a run.
 
 - **No issue:** Step 1 recovers `ISSUE_ID` from a named `FID` or a `feat/{FID}` branch via `bkit fids parse --branch` (a branch id counts only when `.bkit/issues.jsonl` has a feature row for it; a non-slug branch suffix is a STOP); none found → `ISSUE_ID=""`, the no-issue warning (`**No issue:**` header bullet; first line of every final message), and every issue-tied tracker read, label, comment, board call and kill-switch check is skipped (`**Skip if** ISSUE_ID empty`). Workflows never create issues; `/bkit-design` Step 11 needs an issue. `none` → runs without, no warning. Naming the issue-less `FID` in the next prompt is the only way to continue an earlier run (logs and attempt counter continue, as under `none`). A reworded prompt mints a new `FID` and the attempt counter restarts; a minted name whose earlier run finished takes the first free suffix (`{fid}-b`, `{fid}-c`, …) from `bkit fids resolve`, so a repeat never reopens finished logs. A `FID` taken from the prompt or the branch is never suffixed.
-- **No plan:** build writes one — Step 3 `@bkit-build-plan-convert` turns the session prompt and issue text into `{FID}-plan.md` in task-block form, so every build runs from a plan file. A converted plan carries no `bkit:anchor`, so Plan Current skips (Step 4 `anchor-read` exit 12). Ship: a built FID always has `{FID}-plan.md`; none → Step 5 writes a console warning (the branch was not built by `/bkit-build`) and `ship-input-{RUN}.md` (prompt + issue text) is the plan, never written or ticked; `@bkit-ship-deferred-sweep` takes tasks from its requested outcomes, outcome as worded is the bar.
+- **No plan:** build writes one — Step 4 `@bkit-build-plan-convert` turns the session prompt and issue text into `{FID}-plan.md` in task-block form, so every build runs from a plan file. A converted plan carries no `bkit:anchor`, so Plan Current skips (Step 5 `anchor-read` exit 12). Ship: a built FID always has `{FID}-plan.md`; none → Step 5 writes a console warning (the branch was not built by `/bkit-build`) and `ship-input-{RUN}.md` (prompt + issue text) is the plan, never written or ticked; `@bkit-ship-deferred-sweep` takes tasks from its requested outcomes, outcome as worded is the bar.
 - **No PR, `/bkit-ship`:** opened by ship when the branch is ahead of `dev`. Red or missing CI on an existing PR still stops ship — it never merges unverified work.
 - `/bkit-auto` is out of scope: it is dispatched by CI on an issue label or PR, so an issue or PR always exists.
 
@@ -1459,8 +1460,8 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
 | `bkit:gate:min` | `pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `.husky/pre-push` on a min push |
 | `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `@bkit-build-plan-execute`, `.husky/pre-push` revert path |
-| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Steps 7 + 11, `.husky/pre-push` (no integration gate declared), `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify`, `@bkit-debug-failure-remediate` |
-| `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Steps 7 + 11, debug Step 3, `.husky/pre-push` |
+| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Steps 8 + 12, `.husky/pre-push` (no integration gate declared), `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify`, `@bkit-debug-failure-remediate` |
+| `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Steps 8 + 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — chains the gate above | debug Step 3 |
 | `bkit:gate:static-unit-integration-e2e-live` | not seeded — chains the gate above | debug Step 3 |
 | `bkit:gate:install-static-unit-build` | `pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build` | `@bkit-ship-conflict-resolve` |
@@ -1480,7 +1481,7 @@ Build and debug each run the deepest gate the consumer declares, and record its
 <!-- prettier-ignore -->
 | Workflow | Candidates, descending | Stops at |
 | --- | --- | --- |
-| build Step 7 (group gate), Step 11 | `static-unit-integration`, `static-unit` | integration |
+| build Step 8 (group gate), Step 12 | `static-unit-integration`, `static-unit` | integration |
 | debug Step 3 | `…-integration-e2e-live`, `…-integration-e2e`, `static-unit-integration`, `static-unit` | live |
 
 Build stops at integration because its diagnose → remediate loop can only repair what its own gate runs — a tier left to CI is a defect the agent cannot fix in-session (build closes green, the PR reds, recovery is a separate `/bkit-debug`). Integration catches contract breaks the unit tier structurally cannot, at a cost the loop absorbs; E2E does not pay for itself there — a production build plus a browser, re-run on every remediation attempt, minutes before CI runs the same thing on the resulting PR. Debug reaches every tier because reproducing the failure is the job.
@@ -1495,10 +1496,10 @@ Build does not run the live tier (post-merge `bkit-tests-live` canary). Every `b
 
 ### Group gate
 
-Build Step 7 runs the Step 11 gate after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 8 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it — Steps 9 + 11 follow.
+Build Step 8 runs the Step 12 gate after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it — Steps 10 + 12 follow.
 
 - **Orchestrator-owned:** agent gate runs (execute, gaps-remediate, verify) are self-reported in their logs; the group gate writes a `build-group-gate` row (`verdict`, `scope`), so a skipped gate is visible.
-- **Same gate as Step 11:** includes integration, plus the coverage floor where the consumer chains one into `bkit:gate:static-unit`. Without it, a group breaking what a later one assumes surfaces only at Step 11 — one large unattributed diff, budget partly spent.
+- **Same gate as Step 12:** includes integration, plus the coverage floor where the consumer chains one into `bkit:gate:static-unit`. Without it, a group breaking what a later one assumes surfaces only at Step 12 — one large unattributed diff, budget partly spent.
 - **Strict, no exceptions:** the end of a group is where a build can stop (verify budget exhausted, session lost, `/bkit-ship` resume) → it must hold a validated tree. No expected-red declaration. A red gate is an ordering defect (signature change split from callers, deletion before replacement, tests deferred to a later task): `@bkit-plan-generate` orders its groups to keep every group gate green, putting the tasks in one group when it cannot. Add an exception mechanism only once a real case shows a legitimate red group gate.
 
 ### Test-first
@@ -1508,9 +1509,9 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 <!-- prettier-ignore -->
 | Moment | Who | What is checked |
 | --- | --- | --- |
-| Red (Step 6, per planned test) | `@bkit-build-plan-execute` runs `bkit tests red`, log `build-task-red-N-{task}-{test position}.md` | the named test ran and failed in the `bkit:test:file` JUnit report on a non-zero exit. Otherwise exit 1, nothing recorded, `refused` = `no-report` / `not-run` / `passed` / `skipped` / `exit-mismatch`. Records a `build-task-red` row (`task`, `test`, `testName`, `testBlob`, `failure`; `--commit=none`) plus the runner log and a `.snapshot` copy of the test file. An earlier red for the same task + test + name with an unchanged test file stands: exit 0, `already: true`, nothing runs. |
-| Green (Step 7, before verify) | orchestrator runs `bkit tests green` | per planned test: a red row matching task + test file + test name (a task red for an unplanned test → `red-mismatch`, naming whether that recorded test passes now); red recorded before the task's code (else `late-red`); test file unchanged since its snapshot or only added lines (diff in report); the named test passes now. Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Test order only` header, `Test exceptions` and `Late-red check` sections); prints `testOrderOnly`, `lateRedUnchecked`. |
-| Judgement (Step 7) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `test-changed` → judged from the diff (formatting → no gap); `added lines only` → judged from the diff (a line added inside a planned test or setup it runs → `test-changed`); `red-mismatch` → planned test renamed or moved and passing now → no gap, nor for its `not-green`; `no-red` on a task the plan-currency report marks `Broken` (already landed) and execute logs `DONE — already landed` → no gap; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. Test-order gaps listed with task, test file and test name. |
+| Red (Step 7, per planned test) | `@bkit-build-plan-execute` runs `bkit tests red`, log `build-task-red-N-{task}-{test position}.md` | the named test ran and failed in the `bkit:test:file` JUnit report on a non-zero exit. Otherwise exit 1, nothing recorded, `refused` = `no-report` / `not-run` / `passed` / `skipped` / `exit-mismatch`. Records a `build-task-red` row (`task`, `test`, `testName`, `testBlob`, `failure`; `--commit=none`) plus the runner log and a `.snapshot` copy of the test file. An earlier red for the same task + test + name with an unchanged test file stands: exit 0, `already: true`, nothing runs. |
+| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red row matching task + test file + test name (a task red for an unplanned test → `red-mismatch`, naming whether that recorded test passes now); red recorded before the task's code (else `late-red`); test file unchanged since its snapshot or only added lines (diff in report); the named test passes now. Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Test order only` header, `Test exceptions` and `Late-red check` sections); prints `testOrderOnly`, `lateRedUnchecked`. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `test-changed` → judged from the diff (formatting → no gap); `added lines only` → judged from the diff (a line added inside a planned test or setup it runs → `test-changed`); `red-mismatch` → planned test renamed or moved and passing now → no gap, nor for its `not-green`; `no-red` on a task the plan-currency report marks `Broken` (already landed) and execute logs `DONE — already landed` → no gap; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. Test-order gaps listed with task, test file and test name. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts. A runner reporting a load error as one case named after the file never matches the test name.
 - **Stub first:** tests failing only because the code they import does not exist never show their assertions failing, so the agent writes stubs and each red is an assertion.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 7bb2120e9..ce6f0ca82 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -24,8 +24,8 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -41,7 +41,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -155,15 +155,15 @@ description: "Build Feature — Autonomous implementation"
    Record the decision and its route; counts carry on:
 
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
    ```
 
 7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -300,7 +300,7 @@ description: "Build Feature — Autonomous implementation"
 5. Finish:
    ```bash
    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
    ```
 
 ### 🔒 Gate 2 — Worktree Setup
@@ -317,67 +317,83 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" branches sync --merge-docs || exit 1
    ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
    ```bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
+2. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert
 
-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current
 
 1. Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 5.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills
 
 **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.
 
@@ -387,10 +403,10 @@ description: "Build Feature — Autonomous implementation"
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
 2. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
    ```
 
-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills
 
 - [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
 - [ ] New skills installed
@@ -398,19 +414,19 @@ description: "Build Feature — Autonomous implementation"
 
 ---
 
-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9
 
-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 
 ---
 
-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute
 
 1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
 2. Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -426,14 +442,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.
 
-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute
 
 - [ ] Group briefed (`context brief`), start commit recorded
 - [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -442,7 +458,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify
 
 1. Derive the attempt the verify artifact is named for:
    ```bash
@@ -469,7 +485,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
 6. Route:
@@ -488,25 +504,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
 8. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
     - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
     - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
     - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
 11. **Else** → **Failure Path**.
 
-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify
 
 - [ ] Test-first reds audited (`tests green`)
 - [ ] Group diff cut from its start commit (`context diff`)
@@ -518,9 +534,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -546,7 +562,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 3. Finish — the header's `Strategy` is recorded:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    Hold `fields.Fixed` as `VERIFY_FIXED`.
 4. Check the attempt changed source, not only logs and ledgers:
@@ -554,11 +570,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate
 
 - [ ] Strategy computed before invocation
 - [ ] Verify round read back on resume
@@ -568,7 +584,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic
 
 Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.
 
@@ -576,7 +592,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -587,26 +603,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
    ```
 4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic
 
 - [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge
 
-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
    ```bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
    ```bash
    "{BKIT}" counters max --point=build.challenge
    ```
@@ -632,7 +648,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
    ```
 5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash
@@ -645,12 +661,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
    - **Else** → **Failure Path**.
 6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge
 
 - [ ] Round limit read (`counters max --point=build.challenge`) before sizing
 - [ ] Change sized (`challenge gate`)
@@ -661,7 +677,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests
 
 1. Derive the attempt the test log is named for:
    ```bash
@@ -678,21 +694,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on test rounds:
      ```bash
      "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
      ```
      Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests
 
 - [ ] Tests executed
 - [ ] Mechanical checks passed (`steps finish`)
@@ -701,9 +717,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -720,10 +736,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
    ```
 
-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose
 
 - [ ] Strategy computed before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -731,9 +747,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read the strategy the diagnosis was written for:
    ```bash
@@ -749,12 +765,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
    Update: Source and test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
    ```
 
-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate
 
 - [ ] Strategy read before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -763,9 +779,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary
 
-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -774,7 +790,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -788,11 +804,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
    - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary
 
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
@@ -802,7 +818,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
@@ -831,7 +847,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
@@ -872,7 +888,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
    ```
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
@@ -891,7 +907,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR
 
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index f9b2bcc75..386c9c253 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -23,8 +23,8 @@ Build Feature — Autonomous implementation
 
 - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -40,7 +40,7 @@ Build Feature — Autonomous implementation
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -154,15 +154,15 @@ Build Feature — Autonomous implementation
    Record the decision and its route; counts carry on:
 
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
    ```
 
 7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -299,7 +299,7 @@ Build Feature — Autonomous implementation
 5. Finish:
    ```bash
    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
    ```
 
 ### 🔒 Gate 2 — Worktree Setup
@@ -316,67 +316,83 @@ Build Feature — Autonomous implementation
    ```bash
    "{BKIT}" branches sync --merge-docs || exit 1
    ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
    ```bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `/bkit-build-plan-convert` using `Task` tool:
+2. **Subagent:** Invoke `/bkit-build-plan-convert` using `Task` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert
 
-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current
 
 1. Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 5.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `/bkit-build-plan-current` using `Task` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `/bkit-build-plan-current` using `Task` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills
 
 **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.
 
@@ -386,10 +402,10 @@ Build Feature — Autonomous implementation
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
 2. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
    ```
 
-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills
 
 - [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
 - [ ] New skills installed
@@ -397,19 +413,19 @@ Build Feature — Autonomous implementation
 
 ---
 
-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9
 
-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 
 ---
 
-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute
 
 1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
 2. Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -425,14 +441,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.
 
-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute
 
 - [ ] Group briefed (`context brief`), start commit recorded
 - [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -441,7 +457,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify
 
 1. Derive the attempt the verify artifact is named for:
    ```bash
@@ -468,7 +484,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
 6. Route:
@@ -487,25 +503,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
 8. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
     - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
     - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
     - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
 11. **Else** → **Failure Path**.
 
-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify
 
 - [ ] Test-first reds audited (`tests green`)
 - [ ] Group diff cut from its start commit (`context diff`)
@@ -517,9 +533,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -545,7 +561,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 3. Finish — the header's `Strategy` is recorded:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    Hold `fields.Fixed` as `VERIFY_FIXED`.
 4. Check the attempt changed source, not only logs and ledgers:
@@ -553,11 +569,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate
 
 - [ ] Strategy computed before invocation
 - [ ] Verify round read back on resume
@@ -567,7 +583,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic
 
 Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.
 
@@ -575,7 +591,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -586,26 +602,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
    ```
 4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic
 
 - [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge
 
-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
    ```bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
    ```bash
    "{BKIT}" counters max --point=build.challenge
    ```
@@ -631,7 +647,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
    ```
 5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash
@@ -644,12 +660,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
    - **Else** → **Failure Path**.
 6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge
 
 - [ ] Round limit read (`counters max --point=build.challenge`) before sizing
 - [ ] Change sized (`challenge gate`)
@@ -660,7 +676,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests
 
 1. Derive the attempt the test log is named for:
    ```bash
@@ -677,21 +693,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on test rounds:
      ```bash
      "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
      ```
      Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests
 
 - [ ] Tests executed
 - [ ] Mechanical checks passed (`steps finish`)
@@ -700,9 +716,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -719,10 +735,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
    ```
 
-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose
 
 - [ ] Strategy computed before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -730,9 +746,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read the strategy the diagnosis was written for:
    ```bash
@@ -748,12 +764,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
    Update: Source and test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
    ```
 
-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate
 
 - [ ] Strategy read before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -762,9 +778,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary
 
-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -773,7 +789,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -787,11 +803,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
    - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary
 
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
@@ -801,7 +817,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
@@ -830,7 +846,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
@@ -871,7 +887,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
    ```
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
@@ -890,7 +906,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR
 
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 40a0f0fe7..f737c0e9e 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -27,8 +27,8 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
-- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.
+- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
@@ -44,7 +44,7 @@ $ARGUMENTS
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -158,15 +158,15 @@ $ARGUMENTS
    Record the decision and its route; counts carry on:
 
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --message="chore({FID}): decision <attempt>" --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
    ```
 
 7. Route:
-   - **If** `DECISION_ROUTE` = `fix` → Step 6.
-   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.
-   - **If** `DECISION_ROUTE` = `retry` → Step 12.
-   - **If** `DECISION_ROUTE` = `verify` → re-run Step 7.
-   - **Else** → Step 11.
+   - **If** `DECISION_ROUTE` = `fix` → Step 7.
+   - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+   - **If** `DECISION_ROUTE` = `retry` → Step 13.
+   - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+   - **Else** → Step 12.
 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
    ```bash
    "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -303,7 +303,7 @@ $ARGUMENTS
 5. Finish:
    ```bash
    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
-   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --message="chore({FID}): worktree-setup bkit [skip ci]" --number=2 --post --title="Worktree Setup" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
    ```
 
 ### 🔒 Gate 2 — Worktree Setup
@@ -320,67 +320,83 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches sync --merge-docs || exit 1
    ```
-2. Check the plan is in task-block form, within the group caps:
+2. Finish:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --number=3 --post --title="Branch Sync" --tree={BRANCH} --message="chore({FID}): branch-sync"
+   ```
+
+### 🔒 Gate 3 — Branch Sync
+
+- [ ] Docs synced (`branches sync`)
+- [ ] Mechanical checks passed (`steps finish`)
+
+---
+
+## 🧠 Step 4 — Plan Convert
+
+1. Check the plan is in task-block form, within the group caps:
    ```bash
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
-   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.
+   - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
-3. **Subagent:** Invoke `/bkit-build-plan-convert` using `subagent` tool:
+2. **Subagent:** Invoke `/bkit-build-plan-convert` using `subagent` tool:
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
-4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
-   ```
-5. Finish:
-   ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
 
-### 🔒 Gate 3 — Branch Sync
+### 🔒 Gate 4 — Plan Convert
 
-- [ ] Docs synced (`branches sync`)
-- [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Plan checked (`tests plan-check`)
+- [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+- [ ] Converted plan checked again (`tests plan-check`)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 4 — Plan Current
+## 🧠 Step 5 — Plan Current
 
 1. Resolve plan base commit and collect code landed since:
    ```bash
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 5.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `/bkit-build-plan-current` using `subagent` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `/bkit-build-plan-current` using `subagent` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --message="chore({FID}): plan-current" --number=4 --post --title="Plan Current"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
-### 🔒 Gate 4 — Plan Current
+### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
-## 🧠 Step 5 — Install Skills
+## 🧠 Step 6 — Install Skills
 
 **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.
 
@@ -390,10 +406,10 @@ $ARGUMENTS
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md`, `.agents/skills/` (skill installs via Bash).
 2. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --message="chore({FID}): install-skills" --number=5 --post --title="Install Skills"
+   "{BKIT}" steps finish --workflow=build --step=build-install-skills --file="{STATUS}" --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-install-skills.md --number=6 --post --title="Install Skills" --message="chore({FID}): install-skills"
    ```
 
-### 🔒 Gate 5 — Install Skills
+### 🔒 Gate 6 — Install Skills
 
 - [ ] Subagent invoked (`@bkit-build-install-skills`, no inline work)
 - [ ] New skills installed
@@ -401,19 +417,19 @@ $ARGUMENTS
 
 ---
 
-## Group Loop — Steps 6-8
+## Group Loop — Steps 7-9
 
-One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.
+One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 
 ---
 
-### 🧠 Step 6 — Plan Execute
+### 🧠 Step 7 — Plan Execute
 
 1. Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
    ```bash
    "{BKIT}" context brief --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --next --dir="docs/plans/{YYYYMM}/logs/{FID}" --file="{STATUS}" --note-file="{SESSION_DIR}/brief-note.md"
    ```
-   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
+   Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.
 2. Record the group's start commit, once per group:
    ```bash
    "{BKIT}" status route --step=build-group-start --group={GROUP} --file="{STATUS}" --workflow=build
@@ -429,14 +445,14 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`.
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --number=7 --post --title="Plan Execute" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
-   - **Else** → Step 7.
+5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.
+   - **Else** → Step 8.
 
-### 🔒 Gate 6 — Plan Execute
+### 🔒 Gate 7 — Plan Execute
 
 - [ ] Group briefed (`context brief`), start commit recorded
 - [ ] Subagent invoked (`@bkit-build-plan-execute`, no inline work)
@@ -445,7 +461,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 7 — Plan Verify
+### 🧠 Step 8 — Plan Verify
 
 1. Derive the attempt the verify artifact is named for:
    ```bash
@@ -472,7 +488,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
    Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
 6. Route:
@@ -491,25 +507,25 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    - **Else** → **Failure Path**.
 8. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
+   "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).
 10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
-    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 7, `PAUSE_POINT` = `build.verify`. Route — first match wins:
+    Hold `value` as `{VERIFY_ROUNDS}`, `max` as `{PAUSE_MAX}`. `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`. Route — first match wins:
     - **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
     - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** (`VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX`) → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.
     - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** (no round left to fix the group gate).
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
 11. **Else** → **Failure Path**.
 
-### 🔒 Gate 7 — Plan Verify
+### 🔒 Gate 8 — Plan Verify
 
 - [ ] Test-first reds audited (`tests green`)
 - [ ] Group diff cut from its start commit (`context diff`)
@@ -521,9 +537,9 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-### 🧠 Step 8 — Plan Gaps Remediate
+### 🧠 Step 9 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 8 sub-step 10 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -549,7 +565,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 3. Finish — the header's `Strategy` is recorded:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>" --number=8 --post --title="Plan Gaps Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    Hold `fields.Fixed` as `VERIFY_FIXED`.
 4. Check the attempt changed source, not only logs and ledgers:
@@ -557,11 +573,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
    Route:
-   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-   - **If** exit 0 → re-run Step 7.
+   - **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 8 — Plan Gaps Remediate
+### 🔒 Gate 9 — Plan Gaps Remediate
 
 - [ ] Strategy computed before invocation
 - [ ] Verify round read back on resume
@@ -571,7 +587,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ---
 
-## 🧠 Step 9 — Plan Verify Holistic
+## 🧠 Step 10 — Plan Verify Holistic
 
 Runs once, after the last group; challenge fix groups pass through here on the way back to Build Challenge.
 
@@ -579,7 +595,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" status route --step=build-plan-verify-holistic --file="{STATUS}" --workflow=build
    ```
-   **If** `verdict` non-null → Step 10.
+   **If** `verdict` non-null → Step 11.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
@@ -590,26 +606,26 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic"
    ```
 4. Route:
-   - **If** `verdict` = PASS or CONCERNS → Step 10.
+   - **If** `verdict` = PASS or CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 9 — Plan Verify Holistic
+### 🔒 Gate 10 — Plan Verify Holistic
 
 - [ ] Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
 
-## 🧠 Step 10 — Build Challenge
+## 🧠 Step 11 — Build Challenge
 
-1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
+1. Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
    ```bash
    "{BKIT}" status resume --workflow=build --file="{STATUS}"
    ```
-   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:
+   `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:
    ```bash
    "{BKIT}" counters max --point=build.challenge
    ```
@@ -635,7 +651,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      Create: `docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md`.
 4. Wait for all subagents to complete, then finish — `verdict` = worst of the reports (`FAIL > CONCERNS > PASS`), `failures` = their sum. **If** `CHALLENGE_SIZE` = small → drop the `--agent=bkit-build-challenge-1` / `--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md` pair:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --message="chore({FID}): build-challenge attempt <attempt>" --number=10 --post --title="Build Challenge"
+   "{BKIT}" steps finish --workflow=build --step=build-challenge --file="{STATUS}" --attempt=next --agent=bkit-build-challenge-1 --agent=bkit-build-challenge-2 --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md --field=round={CHALLENGE_ROUND} --number=11 --post --title="Build Challenge" --message="chore({FID}): build-challenge attempt <attempt>"
    ```
 5. Merge the findings into the plan — `CRITICAL` / `HIGH` / `MEDIUM` findings become task blocks in new groups of <= `{MAX_TASKS_PER_GROUP}` tasks, `LOW` ones deferral rows. **If** `CHALLENGE_SIZE` = small → drop the `--report` for `build-challenge-1.md`:
    ```bash
@@ -648,12 +664,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
      - exit 23 (a finding names no test or passes the test caps) → hold the printed `problems` → `Your last findings failed the plan check: {problems}. Give every finding a TEST FIRST within the plan caps.`
    - **Else** → **Failure Path**.
 6. Clear `CHALLENGE_REFORMAT`. Route:
-   - **If** `route` = `none` → Step 11.
-   - **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
-   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.
+   - **If** `route` = `none` → Step 12.
+   - **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.
+   - **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 10 — Build Challenge
+### 🔒 Gate 11 — Build Challenge
 
 - [ ] Round limit read (`counters max --point=build.challenge`) before sizing
 - [ ] Change sized (`challenge gate`)
@@ -664,7 +680,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 11 — Run Tests
+## 🤖 Step 12 — Run Tests
 
 1. Derive the attempt the test log is named for:
    ```bash
@@ -681,21 +697,21 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --message="chore({FID}): run-tests attempt <attempt>" --number=11 --post --title="Run Tests"
+   "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
-   - **If** `TEST_VERDICT` = PASS → Step 14.
+   - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on test rounds:
      ```bash
      "{BKIT}" counters route --name=TEST_ATTEMPT --of=build-run-tests:current --file="{STATUS}" --workflow=build --point=build.tests --continue=decision-pause --exceeded=failure-path
      ```
      Hold `value` as `{TEST_ROUNDS}`, `max` as `{PAUSE_MAX}`.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** (`build.tests.maxAttempts` used up; no round left).
-     - **If** exit 0 → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
+     - **If** exit 0 → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 11 — Run Tests
+### 🔒 Gate 12 — Run Tests
 
 - [ ] Tests executed
 - [ ] Mechanical checks passed (`steps finish`)
@@ -704,9 +720,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 12 — Failure Diagnose
+## 🧠 Step 13 — Failure Diagnose
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -723,10 +739,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --message="chore({FID}): failure-diagnose attempt <attempt>" --number=12 --post --title="Failure Diagnose"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-diagnose --file="{STATUS}" --attempt-of=build-run-tests:current --strategy={STRATEGY} --agent=bkit-debug-failure-diagnose --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-<attempt>.md" --number=13 --post --title="Failure Diagnose" --message="chore({FID}): failure-diagnose attempt <attempt>"
    ```
 
-### 🔒 Gate 12 — Failure Diagnose
+### 🔒 Gate 13 — Failure Diagnose
 
 - [ ] Strategy computed before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-diagnose`, no inline work)
@@ -734,9 +750,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 13 — Failure Remediate
+## 🧠 Step 14 — Failure Remediate
 
-**Run only if** Step 11 tests FAIL.
+**Run only if** Step 12 tests FAIL.
 
 1. Read the strategy the diagnosis was written for:
    ```bash
@@ -752,12 +768,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    Read: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
    Update: Source and test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-{TEST_ATTEMPT}-log.md`.
-3. Finish → re-run Step 11:
+3. Finish → re-run Step 12:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --message="chore({FID}): failure-remediate attempt <attempt>" --number=13 --post --title="Failure Remediate"
+   "{BKIT}" steps finish --workflow=build --step=build-failure-remediate --file="{STATUS}" --attempt-of=build-run-tests:current --agent=bkit-debug-failure-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-failure-remediate-<attempt>-log.md" --number=14 --post --title="Failure Remediate" --message="chore({FID}): failure-remediate attempt <attempt>"
    ```
 
-### 🔒 Gate 13 — Failure Remediate
+### 🔒 Gate 14 — Failure Remediate
 
 - [ ] Strategy read before invocation
 - [ ] Subagent invoked (`@bkit-debug-failure-remediate`, no inline work)
@@ -766,9 +782,9 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🧠 Step 14 — Summary
+## 🧠 Step 15 — Summary
 
-**Run only if** all Step 11 tests PASS.
+**Run only if** all Step 12 tests PASS.
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -777,7 +793,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
 2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --message="chore({FID}): summary" --number=14 --post --title=Summary --link-ref={BRANCH} --comment-body
+   "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -791,11 +807,11 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 4. Route:
-   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 15.
+   - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 16.
    - **If** `SUMMARY_VERDICT` = FAIL → display `build-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
 
-### 🔒 Gate 14 — Summary
+### 🔒 Gate 15 — Summary
 
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
@@ -805,7 +821,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ---
 
-## 🤖 Step 15 — Close Workflow & Create PR
+## 🤖 Step 16 — Close Workflow & Create PR
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
@@ -834,7 +850,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
-   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=15 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
@@ -875,7 +891,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **Else** → **Failure Path**.
 7. **Skip if** `ISSUE_ID` empty. Comment:
    ```bash
-   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=15 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
+   "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --step-number=16 --step-title="Create PR" --owner-repo={OWNER_REPO} --pr-number={PR_NUMBER} --pr-url={PR_URL}
    ```
 8. **Skip if** `ISSUE_ID` empty.
    ```bash
@@ -894,7 +910,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 11. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke.
 12. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
 
-### 🔒 Gate 15 — Close Workflow & Create PR
+### 🔒 Gate 16 — Close Workflow & Create PR
 
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 7c06bac19..af81ad662 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -309,3 +309,4 @@
 {"schema":2,"ts":1792747332665,"kind":"knowledge","key":"identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-knowledge","model":"claude-opus-5-5"},"references":["343","234","scripts/harvest/ledgers.ts",".bkit/core/engine/ledgers/telemetry.ts (identity, VALID_KINDS)","docs/observability.md § [bkit-harvest] prefix","8badea26","abe49983","683"],"summary":"A prune gated on identity destroys rows the dedup fold dropped — friction keys truncate to ~68 chars and collide, so two distinct entries share one identity and only one is ever stored","description":"Found while making bkit harvest MOVE consumer friction (#343). fold() is last-write-wins per identity(), so colliding rows collapse to ONE stored row. An identity-gated prune then deletes EVERY colliding row from the consumer while the store kept one — the loser exists nowhere. Reproduced against live consumer-a data: 'Plan Step 11: close-workflow STRAY guard rejects protocol-mandated docs/pending.md edit' (ts 1783944967776) and a different entry about docs/decisions.md + docs/pending.md edits truncate to the byte-identical key 'friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma'; the first was destroyed. Harmless under the old copy-only harvest, fatal the moment harvest deletes. Second instance of the same shape: identity() has no default branch, so rows whose kind is outside VALID_KINDS all collide on undefined — live data has kind:'tool-failure' and kind:'agent-rework' rows in consumer-a friction, and the newer evicted the older from the store.","rootCause":"identity() is a lossy projection of a row (kind+repo+key, or ts when key is absent), and fold() treats an identity match as an upsert. Anything gating a DELETE on that projection deletes rows the projection cannot distinguish. Two independent sources of collision: (1) friction keys are truncated at write time, so distinct content yields identical keys; (2) identity() returns undefined for kinds outside VALID_KINDS, mapping every unknown-kind row onto a single fold slot.","remediation":"Gate any destructive drain on byte-for-byte row CONTENT read back off disk, never on identity, and keep a store of every DISTINCT row (content dedup), never of fold winners — `scripts/harvest/ledgers.ts` header invariants (the harvest, `pnpm harvest`). The same gate covers friction rows and the `chat` / `run` rows pruned from `.bkit/stats.jsonl`. A fold loser is then stored and safe to prune; consumer lines not in the store stay and are logged (`kept N line(s) not in the store`). `identity()` (`.bkit/core/engine/ledgers/telemetry.ts`) still has no branch for kinds outside VALID_KINDS — never gate a delete on it. General rule: an identity used for dedup/upsert is NOT safe as a delete gate.","status":"ACTIVE"}
 {"schema":3,"ts":1793021911995,"kind":"knowledge","key":"red-snapshot-freezes-the-test-file-write-it-lint-clean-first","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts (onlyAddsLines, redRows)","docs/plans/202610/logs/705-build-plan-convert/status.jsonl","705"],"summary":"`bkit tests red` snapshots the test file; a later non-additive edit to it makes `tests green` report `test-changed`","description":"Each red row stores a copy of the test file and `tests green` compares it with the current file: only inserted lines are tolerated (`onlyAddsLines`), so a test rewritten after its red — even for a lint fix — leaves a `test-changed` test-order gap on that task.","remediation":"Write the test lint-clean and typecheck-clean before running `tests red` for it, and touch neither the test file nor its fixtures afterwards; a needed rewrite is a human TEST EXCEPTION, never a re-run of the red.","status":"ACTIVE"}
 {"schema":3,"ts":1793021911996,"kind":"knowledge","key":"renumbering-a-workflow-leaves-instructions-md-local-entries-stale","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"references":[".bkit/instructions.md (Local Instructions, per-file `- source:` blocks)",".bkit/core/engine/tools/instructions-coverage.test.ts",".bkit/core/engine/tools/instructions.ts (syncCoverage)","705"],"summary":"Renumbering a workflow's steps leaves `.bkit/instructions.md` local entries quoting lines the file no longer holds, and `pnpm instructions:sync` exits 1 without fixing them","description":"Every standing line (routes, gate items, step prose) is listed verbatim under that file's `- source:` block; `syncCoverage` adds new lines and rewrites clause copies but never drops an entry whose line is gone, so `instructions-coverage.test.ts` fails with `local entry no longer in the file` until the block is rewritten by hand.","remediation":"Rewrite the edited workflow's `- source:` block in `.bkit/instructions.md` in the same change (delete the retired lines, add the new wording), then re-run `pnpm instructions:sync` and `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts`.","status":"ACTIVE"}
+{"schema":3,"ts":1793072007945,"kind":"knowledge","key":"plan-line-anchors-are-basesha-relative-so-a-stale-plan-is-re-pointed-by-symbol-never-renumbered","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/workflows/bkit-build.md (Step 5 — Plan Current)","#381","#454","88638a42","#705"],"summary":"Plan file:line anchors are coordinates against the plan's own baseSha, and every sub-plan anchor additionally assumes its predecessors landed, so a stale plan is re-pointed by symbol and never renumbered","description":"A plan artifact's file:line anchors resolve against the baseSha in its bkit:anchor header, not against dev. Sub-plans carry a second implicit baseline on top: their anchors describe the tree their predecessor sub-plans leave behind, stated in the artifacts' own PRE-Task coordinate banners, so a sub-plan's numbers can be wrong against the current tree and right against the tree it will execute on. Mapping every anchor forward to HEAD converts a detectably stale plan into an undetectably wrong one. Bare backtick line refs compound it: they attach to a filename earlier in the sentence, frequently with unrelated paths in between, so nearest-preceding-path attribution silently reassigns them to the wrong file. Path and marker-vocabulary renames are the separable safe half, carrying no line semantics.","rootCause":"A plan is written against one tree and built against another. The anchor header (`bkit branches anchor-stamp`) records the baseline, and the only comparison against the current tree is build Step 5 — Plan Current (`bkit branches anchor-read --against=origin/dev`, then `@bkit-build-plan-current`), which runs when the build starts, not when the plan is edited. Sub-plan drift stays invisible because each sub-plan's numbers are correct relative to a predecessor state rather than to anything the reader can observe.","remediation":"Apply the mechanical renames in full across every artifact including the design and the parent plan, not only the sub-plans the drift was noticed in. Add a coordinate banner to each in the artifacts' existing PRE-Task idiom naming what was renamed, listing every cited file changed since the baseline, and instructing resolve-by-symbol-marker-or-heading. Leave the line numbers untouched and leave the anchor header's baseSha at its original value; it records what the plan was written against, and forging it forward tells the runtime that reads it the plan is current. Re-locate confirmed-dead anchors by their quoted prose rather than their number before editing at that position.","status":"ACTIVE"}
diff --git a/docs/testing.md b/docs/testing.md
index 912159790..0cbb75702 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -627,7 +627,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/ci/ci.test.ts` | Unit + real `slop-scan` | `bkit ci slop`: net-finding / net-score gate, base resolution (`--base`, bare argument, `$SLOP_BASE_REF`, merge-base fallbacks, skip when absent or HEAD), slop-scan could-not-run vs failed, base worktree removed on SIGTERM. `bkit ci prose` (fake vale): glob selection, vale exit mapping, skip when vale / files absent, write-good restore from the main worktree else `vale sync`. `bkit ci skip-token`: token in subject or body, `--ref`, unreadable commit. |
 | `commands/setup/setup.test.ts` | Unit (stub `gh`) | `bkit setup protect-main`: policy payload requiring `bkit.testing.ciCapstone`, pre-flight on the CI workflow and job name, `--dry-run`, `--print`, unauthenticated vs missing `gh`. |
 | `.bkit/core/engine/shared/settings.test.ts`, `json.test.ts`, `package-json.test.ts`, `package-manager.test.ts`, `timeouts.test.ts`, `egress.test.ts`, `branches.test.ts` | Unit | `package.json` `bkit` settings with per-key defaults (`testing.ciWorkflow`, `testing.ciCapstone`, `workflows.worktree.copy` / `install`, ask points (`ask` and limit per point, bad values falling back), tracker, board, required lanes, opencode providers, cloud variant, dependency-updater opt-out, which of tracker / cloud variant were explicitly set); `package.json` edits; `parseJson` / `readJsonFile` (not JSON, a missing file and a directory all give `{ ok: false }`, never a throw); the installing-version reader (`readInstallingVersion`: the package's own version, and a throw naming the file when `package.json` is missing, not a JSON object, or lacks a non-empty string `version`); package-manager commands and could-not-run codes; the `TIMEOUTS` table; egress registry shape (bare lowercase hostnames, no duplicates, provider key placeholders); shared-branch rule (`isSharedBranch` true for `dev` / `main` only, false for look-alikes and the empty string). |
-| `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 prompt file + `fids parse --prompt-file` + `fids resolve` + gated FID / lock in every phase workflow, `status resume` Resume and build's `openDecision`, ship `fids plans`, plan `fids design` with files, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file`, no heredoc), design / plan / build / debug keep the record through one `handover --push --worktree="{WORKTREE_PATH}"` skipped without a worktree, and ship `--flush`, build and debug gate logs written by `tests run --artifact` with failures from the engine's count, the committed test log and Step 15 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, auto's single `runs context`, 3600s Timeouts line, a fresh `context diff` file written right before each agent that reads the diff, debug Step 1 decided by one `status route --prompt-file`, ship `runs gate --squash-of` / `branches sync-dev` / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush` removing the worktree then returning to `{REPO_ROOT}`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait, issue-less runs (no Step 1 STOP on a missing issue, the true-block `fids parse` Route with its exit 3 STOP for a non-slug branch, the `base.ref` = `dev` assert on every MCP merge fallback, every issue-tied call behind `**Skip if** ISSUE_ID empty`, `fids resolve` / `steps gate` carrying `--issue`, kill-switch checks skipped) and debug on `dev` (`{DIFF_BASE}` for every diff, no push in Steps 9 / 10, the `EXIT_FOREIGN_PATH` stop-and-ask); plan's single review round (two reviewers + scope check), `tests plan-check --existence=refuse` after every plan-writing step, no workflow naming a removed plan flag; build Branch Sync checking the plan, converting one with no task markers and checking again, Step 6 taking the next group's brief, Step 7 verifying the group's own diff; build Step 10 running `challenge gate` before the reviewers. |
+| `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 prompt file + `fids parse --prompt-file` + `fids resolve` + gated FID / lock in every phase workflow, `status resume` Resume and build's `openDecision`, ship `fids plans`, plan `fids design` with files, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file`, no heredoc), design / plan / build / debug keep the record through one `handover --push --worktree="{WORKTREE_PATH}"` skipped without a worktree, and ship `--flush`, build and debug gate logs written by `tests run --artifact` with failures from the engine's count, the committed test log and Step 13 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, auto's single `runs context`, 3600s Timeouts line, a fresh `context diff` file written right before each agent that reads the diff, debug Step 1 decided by one `status route --prompt-file`, ship `runs gate --squash-of` / `branches sync-dev` / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush` removing the worktree then returning to `{REPO_ROOT}`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait, issue-less runs (no Step 1 STOP on a missing issue, the true-block `fids parse` Route with its exit 3 STOP for a non-slug branch, the `base.ref` = `dev` assert on every MCP merge fallback, every issue-tied call behind `**Skip if** ISSUE_ID empty`, `fids resolve` / `steps gate` carrying `--issue`, kill-switch checks skipped) and debug on `dev` (`{DIFF_BASE}` for every diff, no push in Steps 9 / 10, the `EXIT_FOREIGN_PATH` stop-and-ask); plan's single review round (two reviewers + scope check), `tests plan-check --existence=refuse` after every plan-writing step, no workflow naming a removed plan flag; build Branch Sync merging its docs, Plan Convert checking the plan, converting one with no task markers and checking again, Step 7 taking the next group's brief, Step 8 verifying the group's own diff; build Step 11 running `challenge gate` before the reviewers. |
 | `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts` | Unit (real `bash` / `zsh`) | Every fenced shell block in `.bkit/core/workflows/*.md`, placeholders replaced, parses under `bash -n` and `zsh -n` (zsh half skipped when zsh is absent). |
 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | Unit (YAML via the `yaml` devDependency; `tests/fixtures/gh/` stub) | The template `bkit-ci.yml`, placeholders filled, parses as YAML with the capstone needing every other job, passes actionlint (skipped when absent); `bkit runs gate` finds the capstone among the template's job names and refuses when it fails. |
 | `.bkit/templates/scripts/ci/check-capstone.test.mjs` | Standalone `node` (also `scripts/ci/`) | The capstone verdict, one environment per case: a lane that failed / skipped / was cancelled, a lane that ran under `run_level=none`, a lane that succeeded with 0 tests or a non-numeric count (`0`, `00`, `abc`, `-3`), a plan that is not JSON / not an object / has no `run_level`, a failed scope job, no `LANES`; exemptions (`EMPTY_COUNT=warn`, `run_level=none` with every lane skipped); exit code and `::error::` lines through the command line. |
