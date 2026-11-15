diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 988f76a77..d734b2984 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -81,7 +81,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 58b147d94..d273d16ba 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -48,7 +48,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -66,7 +66,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -120,7 +120,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -258,10 +258,10 @@ description: "Build Feature — Autonomous implementation"
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -825,29 +825,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-verify.md` using `view_file` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -859,17 +864,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -884,12 +889,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md` using `view_file` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -899,7 +904,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 39ad64ad0..287cdf556 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -48,7 +48,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -66,7 +66,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -120,7 +120,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -258,10 +258,10 @@ description: "Build Feature — Autonomous implementation"
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -825,29 +825,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -859,17 +864,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -884,12 +889,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -899,7 +904,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.bkit/cli.md b/.bkit/cli.md
index a7625b79d..8666167d7 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -158,8 +158,8 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | --- | --- | --- | --- |
 | `derive` | workflow | **`--file`** **`--workflow`** **`--step`** `--group` **`--position`** `--all-runs` | Count a step's DONE rows in the active run, at one of three positions. |
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
-| `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
-| `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
+| `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
+| `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
 | `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--request-hash` `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
 | `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` `--since-clean` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index fd16d8432..c0184af16 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -158,8 +158,8 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | --- | --- | --- | --- |
 | `derive` | workflow | **`--file`** **`--workflow`** **`--step`** `--group` **`--position`** `--all-runs` | Count a step's DONE rows in the active run, at one of three positions. |
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
-| `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
-| `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
+| `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
+| `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
 | `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--request-hash` `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
 | `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` `--since-clean` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
diff --git a/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts b/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
index d3a4e1191..783d042cd 100644
--- a/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts
@@ -796,3 +796,38 @@ describe.each([
     });
   }
 });
+
+describe("9. holistic loop wiring (build Step 10)", () => {
+  const build = () => readRepo(".bkit/core/workflows/bkit-build.md");
+
+  it("holistic rounds route and grant on build.holistic within the run", () => {
+    const lines = build()
+      .split("\n")
+      .filter((l) => /counters (?:route|grant)\b.*HOLISTIC_ATTEMPT/.test(l));
+    const route = lines.filter((l) => /counters route\b/.test(l));
+    const grant = lines.filter((l) => /counters grant\b/.test(l));
+    expect(route.length).toBeGreaterThan(0);
+    expect(grant.length).toBeGreaterThan(0);
+    for (const l of [...route, ...grant]) {
+      expect(l).toContain("--of=build-plan-gaps-remediate-holistic:next");
+      expect(l).toContain("--point=build.holistic");
+      expect(l).not.toContain("--since-clean");
+      expect(l).not.toContain("--all-runs");
+    }
+    expect(build()).not.toContain("--since-clean");
+  });
+
+  it("holistic report and fix log names carry the run number", () => {
+    const text = build();
+    expect(text).not.toMatch(/build-plan-verify-holistic-\{HOLISTIC_ATTEMPT\}/);
+    expect(text).not.toMatch(/build-plan-gaps-remediate-holistic-\{HOLISTIC_ATTEMPT\}/);
+    expect(text).not.toMatch(/build-plan-verify-holistic-<attempt>/);
+    expect(text).not.toMatch(/build-plan-gaps-remediate-holistic-<attempt>/);
+    expect(text).toContain("build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md");
+    expect(text).toContain("build-plan-verify-holistic-{RUN}-<attempt>.md");
+    expect(text).toContain("build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md");
+    expect(text).toContain("build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md");
+    expect(text).toContain("build-plan-gaps-remediate-holistic-{RUN}-*-log.md");
+    expect(text).not.toMatch(/build-plan-gaps-remediate-holistic-\*-log\.md/);
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index 816e64b2e..02bd3ff71 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -432,3 +432,14 @@ describe("bkit-local-gate-audit (#437)", () => {
     expect(unresolvedGateCalls(declared, subcommands)).toEqual([]);
   });
 });
+
+describe("holistic verify prompt test base", () => {
+  it("holistic verify takes its test base from Context", () => {
+    const body = fs.readFileSync(path.join(PROMPTS_DIR, "bkit-build-plan-verify.md"), "utf-8");
+    expect(body).toContain(
+      "bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit",
+    );
+    expect(body).not.toContain("bkit tests changed --base=origin/dev");
+    expect(body).toMatch(/Test base/);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index b932a53f2..eeeb77473 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -453,6 +453,7 @@ describe("bkit counters route --point", () => {
   const DEFAULT_MAX: Record<string, number> = {
     "design.grill": 6,
     "build.verify": 2,
+    "build.holistic": 2,
     "build.challenge": 2,
     "build.tests": 2,
     "debug.fix": 2,
@@ -536,6 +537,77 @@ describe("bkit counters route --point", () => {
       });
   });
 
+  const holisticRoute = (file: string, cwd: string) =>
+    run(
+      [
+        "counters",
+        "route",
+        "--name=HOLISTIC_ATTEMPT",
+        "--of=build-plan-gaps-remediate-holistic:next",
+        `--file=${file}`,
+        "--workflow=build",
+        "--point=build.holistic",
+        "--continue=step-10",
+        "--exceeded=failure-path",
+      ],
+      cwd,
+    );
+
+  it("holistic fix rounds count within the run without a reset", async () => {
+    const cwd = pkgDir({});
+    const check = (at: string, verdict: string, failures: number) =>
+      done("build", "build-plan-verify-holistic", at, { verdict, failures });
+    const fix = (at: string) => done("build", "build-plan-gaps-remediate-holistic", at);
+    const first = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      check("2026-10-01T00:01:00Z", "FAIL", 2),
+      fix("2026-10-01T00:02:00Z"),
+    ]);
+    expect((await holisticRoute(first, cwd)).json).toMatchObject({ value: 2, max: 2 });
+    expect((await holisticRoute(first, cwd)).code).toBe(0);
+    const clean = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      check("2026-10-01T00:01:00Z", "FAIL", 2),
+      fix("2026-10-01T00:02:00Z"),
+      check("2026-10-01T00:03:00Z", "PASS", 0),
+      check("2026-10-01T00:04:00Z", "FAIL", 1),
+      fix("2026-10-01T00:05:00Z"),
+    ]);
+    const third = await holisticRoute(clean, cwd);
+    expect(third.code).toBe(1);
+    expect(third.json).toMatchObject({ value: 3, max: 2, exceeded: true });
+    const nextRun = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      fix("2026-10-01T00:02:00Z"),
+      fix("2026-10-01T00:05:00Z"),
+      finished("build", "2026-10-01T01:00:00Z"),
+      started("build", "2026-10-02T00:00:00Z"),
+    ]);
+    const fresh = await holisticRoute(nextRun, cwd);
+    expect(fresh.code).toBe(0);
+    expect(fresh.json).toMatchObject({ value: 1, exceeded: false });
+  });
+
+  it("build.holistic falls back to the package.json setting when the run's frozen limits lack it", async () => {
+    const cwd = pkgDir({ workflows: { build: { holistic: { ask: true, maxAttempts: 4 } } } });
+    const file = log([
+      {
+        ...started("build", "2026-10-01T00:00:00Z"),
+        limits: { "build.verify": { ask: true, max: 2 } },
+      },
+      done("build", "build-plan-gaps-remediate-holistic", "2026-10-01T00:02:00Z"),
+      done("build", "build-plan-gaps-remediate-holistic", "2026-10-01T00:05:00Z"),
+    ]);
+    const r = await holisticRoute(file, cwd);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      value: 3,
+      max: 4,
+      exceeded: false,
+      limitsFrom: "package.json",
+    });
+  });
+
   it("max --point takes the run's frozen limit with --file and --workflow, else package.json", async () => {
     const cwd = pkgDir({ workflows: { build: { verify: { ask: true, maxAttempts: 5 } } } });
     const file = log([
@@ -714,103 +786,6 @@ describe("bkit counters grant", () => {
   });
 });
 
-describe("bkit counters route --since-clean", () => {
-  const start = started("build", "2026-10-01T00:00:00Z");
-  const holistic = (at: string, verdict: string, failures: number) =>
-    done("build", "build-plan-verify-holistic", at, { verdict, failures });
-  const grantRow = (at: string, group?: number) => ({
-    type: "allowance-granted",
-    workflow: "build",
-    at,
-    point: "build.verify",
-    ...(group === undefined ? {} : { group }),
-  });
-  const route = (file: string, cwd: string, ...extra: string[]) =>
-    run(
-      [
-        "counters",
-        "route",
-        "--name=HOLISTIC_ROUNDS",
-        "--of=build-plan-verify-holistic:current",
-        `--file=${file}`,
-        "--workflow=build",
-        "--point=build.verify",
-        ...extra,
-      ],
-      cwd,
-    );
-
-  it("counts only the rounds after the step's last clean round", async () => {
-    const cwd = pkgDir({});
-    const file = log([
-      start,
-      holistic("2026-10-01T00:10:00Z", "FAIL", 2),
-      holistic("2026-10-01T00:20:00Z", "CONCERNS", 1),
-      holistic("2026-10-01T00:30:00Z", "PASS", 0),
-      holistic("2026-10-01T00:40:00Z", "FAIL", 1),
-    ]);
-    expect((await route(file, cwd)).json).toMatchObject({ value: 4, exceeded: true });
-    expect((await route(file, cwd, "--since-clean")).json).toMatchObject({
-      value: 1,
-      max: 2,
-      exceeded: false,
-    });
-  });
-
-  it("a CONCERNS round with 0 failures is clean, one with failures is not", async () => {
-    const cwd = pkgDir({});
-    const rounds = (verdict: string, failures: number) =>
-      log([
-        start,
-        holistic("2026-10-01T00:10:00Z", "FAIL", 1),
-        holistic("2026-10-01T00:20:00Z", verdict, failures),
-        holistic("2026-10-01T00:30:00Z", "FAIL", 1),
-      ]);
-    expect((await route(rounds("CONCERNS", 0), cwd, "--since-clean")).json.value).toBe(1);
-    expect((await route(rounds("CONCERNS", 1), cwd, "--since-clean")).json.value).toBe(3);
-  });
-
-  it("counts only the grants after the last clean round, and only those without a group", async () => {
-    const cwd = pkgDir({});
-    const file = log([
-      start,
-      holistic("2026-10-01T00:10:00Z", "FAIL", 1),
-      grantRow("2026-10-01T00:11:00Z"),
-      holistic("2026-10-01T00:20:00Z", "PASS", 0),
-      grantRow("2026-10-01T00:25:00Z", 3),
-      holistic("2026-10-01T00:30:00Z", "FAIL", 1),
-      grantRow("2026-10-01T00:31:00Z"),
-    ]);
-    expect((await route(file, cwd)).json).toMatchObject({ grants: 3, max: 8 });
-    expect((await route(file, cwd, "--since-clean")).json).toMatchObject({
-      value: 1,
-      grants: 1,
-      max: 4,
-    });
-  });
-
-  it("refuses --since-clean without one --of step, or with --all-runs", async () => {
-    const cwd = pkgDir({});
-    const file = log([start, holistic("2026-10-01T00:10:00Z", "FAIL", 1)]);
-    const value = await run(
-      [
-        "counters",
-        "route",
-        "--name=X",
-        "--value=1",
-        `--file=${file}`,
-        "--workflow=build",
-        "--point=build.verify",
-        "--since-clean",
-      ],
-      cwd,
-    );
-    expect(value.code).toBe(2);
-    expect(value.out).toBe("");
-    expect((await route(file, cwd, "--since-clean", "--all-runs")).code).toBe(2);
-  });
-});
-
 describe("bkit counters progress", () => {
   const verify = (at: string, failures: number, sha: string, extra: Record<string, unknown> = {}) =>
     done("build", "build-plan-verify", at, { failures, parentSha: sha, group: 1, ...extra });
@@ -1489,3 +1464,45 @@ describe("bkit counters correction", () => {
     expect(candidates(file)).toHaveLength(2);
   });
 });
+
+describe("bkit counters --since-clean retired from route and grant", () => {
+  const file = () => log([started("build", "2026-10-01T00:00:00Z")]);
+
+  it("route refuses --since-clean as an unknown flag", async () => {
+    const r = await run(
+      [
+        "counters",
+        "route",
+        "--name=X",
+        "--of=build-plan-verify-holistic:current",
+        `--file=${file()}`,
+        "--workflow=build",
+        "--point=build.verify",
+        "--since-clean",
+      ],
+      pkgDir({}),
+    );
+    expect(r.code).toBe(2);
+    expect(r.out).toBe("");
+    expect(r.err).toContain("unknown flag --since-clean");
+  });
+
+  it("grant refuses --since-clean as an unknown flag", async () => {
+    const r = await run(
+      [
+        "counters",
+        "grant",
+        "--name=X",
+        "--of=build-plan-verify-holistic:current",
+        `--file=${file()}`,
+        "--workflow=build",
+        "--point=build.verify",
+        "--since-clean",
+      ],
+      pkgDir({}),
+    );
+    expect(r.code).toBe(2);
+    expect(r.out).toBe("");
+    expect(r.err).toContain("unknown flag --since-clean");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index a672b1afb..9486d112e 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -18,7 +18,6 @@ import {
   allRunsDoneSteps,
   appendLine,
   CORRECTION_CANDIDATE_ROW,
-  lastCleanRound,
   lastDoneStepAllRuns,
   nextStrategy,
   runNumber,
@@ -95,8 +94,7 @@ const nonNegativeInt = (v: FlagValue, flag: string): number => {
 /**
  * `--of=<step>:<position>` over `--file` / `--workflow`: the counter at that position.
  * `--of=<step>,<step>...:count` sums the DONE rows of every listed step. `--all-runs`
- * counts every run of the workflow in the file, not only the active one. `--since-clean`
- * counts only the rows after the step's last clean round (`cleanRound`).
+ * counts every run of the workflow in the file, not only the active one.
  */
 function derivedOf(ctx: RunContext): number {
   const [list, position] = String(ctx.flags.of).split(":");
@@ -107,16 +105,10 @@ function derivedOf(ctx: RunContext): number {
     throw new CommandError(EXIT.USAGE, "--of with several steps takes distinct steps and :count");
   if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
     throw new CommandError(EXIT.USAGE, "--of needs --file and --workflow");
-  if (ctx.flags.sinceClean === true && (steps.length > 1 || ctx.flags.allRuns === true))
-    throw new CommandError(EXIT.USAGE, "--since-clean takes one --of step, without --all-runs");
   const runs = readRuns(statusFile(ctx));
   const group = positiveInt(ctx.flags.group, "group");
   const doneSteps: typeof activeDoneSteps =
-    ctx.flags.allRuns === true
-      ? allRunsDoneSteps
-      : ctx.flags.sinceClean === true
-        ? (r, w, f) => activeDoneStepsSinceClean(r, w, f, steps[0]!)
-        : activeDoneSteps;
+    ctx.flags.allRuns === true ? allRunsDoneSteps : activeDoneSteps;
   const count = steps.reduce(
     (n, step) => n + doneSteps(runs, String(ctx.flags.workflow), { step, group }).length,
     0,
@@ -129,13 +121,6 @@ function derivedOf(ctx: RunContext): number {
   return position === "next" ? count + 1 : count;
 }
 
-/** `--since-clean`: count one loop's rounds since its check last found no problems. */
-const SINCE_CLEAN_FLAG = {
-  name: "since-clean",
-  type: "boolean",
-  help: "with --of: only rows after the --of step's last clean round (PASS, or CONCERNS with 0 failures); with --point: only grants after it, for exactly --group (none: grants with no group)",
-} as const;
-
 /** `--all-runs`: count every run of the workflow in `--file`, not only the active one. */
 const ALL_RUNS_FLAG = {
   name: "all-runs",
@@ -258,8 +243,7 @@ export const ALLOWANCE_ROW = "allowance-granted";
 
 /**
  * Allowances granted to `point` (and `group`, when given) in `workflow`'s active run, or
- * across every run of the file with `allRuns`. With `sinceClean` (a step), only the grants
- * after that step's last clean round, for exactly `group`: none means grants with no group.
+ * across every run of the file with `allRuns`.
  */
 export function grantCount(
   file: string,
@@ -267,7 +251,6 @@ export function grantCount(
   point: AskPoint,
   group: number | undefined,
   allRuns: boolean,
-  sinceClean?: string,
 ): number {
   if (!fs.existsSync(file)) return 0;
   const rows = readStatusRows(file);
@@ -276,8 +259,6 @@ export function grantCount(
     rows.forEach((r, i) => {
       if (r.type === "workflow-started" && r.workflow === workflow) start = i;
     });
-  const cleanAt =
-    sinceClean === undefined ? undefined : lastCleanRound(readRuns(file), workflow, sinceClean)?.at;
   return rows
     .slice(start + 1)
     .filter(
@@ -285,9 +266,7 @@ export function grantCount(
         r.type === ALLOWANCE_ROW &&
         r.workflow === workflow &&
         r.point === point &&
-        (sinceClean === undefined
-          ? group === undefined || r.group === group
-          : r.group === group && (cleanAt === undefined || String(r.at) > cleanAt)),
+        (group === undefined || r.group === group),
     ).length;
 }
 
@@ -513,14 +492,6 @@ export function loopProgress(
   };
 }
 
-/** `--since-clean`'s step: the single `--of` step, whose clean rounds close a loop. */
-function sinceCleanStep(ctx: RunContext): string {
-  const step = ctx.flags.of === undefined ? undefined : String(ctx.flags.of).split(":")[0];
-  if (step === undefined || step === "" || step.includes(","))
-    throw new CommandError(EXIT.USAGE, "--since-clean needs --of with one step");
-  return step;
-}
-
 /**
  * `--point`'s limit for route and grant: the run's frozen setting (else package.json's), its
  * max raised by one full allowance per `allowance-granted` row when `--file` and
@@ -543,7 +514,6 @@ function pointLimit(
         point,
         positiveInt(ctx.flags.group, "group"),
         ctx.flags.allRuns === true,
-        ctx.flags.sinceClean === true ? sinceCleanStep(ctx) : undefined,
       )
     : 0;
   return {
@@ -582,7 +552,6 @@ const VALUE_FLAGS = [
     ...ALL_RUNS_FLAG,
     help: "with --of: count every run of the workflow in --file; with --point: grants of every run",
   },
-  SINCE_CLEAN_FLAG,
 ] as const;
 
 /** The counter's value: `--value`, or derived with `--of` and/or `--rows`. */
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 8b302420f..56f8d1e98 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -252,11 +252,34 @@ describe("bkit decisions compose", () => {
     );
     expect(r.code).toBe(0);
     const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("build verify: attempt 2 of 2");
+    expect(text).toContain("build holistic: attempt 2 of 2");
     expect(text).toContain("Problems after each round: 3 → 3");
     expect(text).toMatch(/\*\*Q1 — Holistic verify:\*\* decide the items below/);
   });
 
+  it("--loop=holistic names build holistic in the attempt line", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    fs.writeFileSync(
+      status,
+      JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" }) +
+        "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      ITEMS,
+      "--loop=holistic",
+      `--file=${status}`,
+      "--attempt=2",
+      "--max=2",
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("build holistic: attempt 2 of 2");
+    expect(text).not.toContain("build verify: attempt");
+  });
+
   it("prints the group gate's failing tests per round for the verify loop", async () => {
     const { root, logs } = checkout();
     const status = path.join(logs, "status.jsonl");
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 6dc2ce023..9bb982a69 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -200,12 +200,12 @@ const LOOPS: Record<
     point: "verify",
     gate: "build-group-gate",
   },
-  // The whole-feature check reopens after each clean round, so its loop starts there.
+  // The whole-feature check reopens after each clean round, so its loop starts there. Its allowance is `build.holistic`.
   holistic: {
     title: "Holistic verify",
     check: "build-plan-verify-holistic",
     fix: "build-plan-gaps-remediate-holistic",
-    point: "verify",
+    point: "holistic",
     sinceClean: true,
   },
   tests: {
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index b5f907cb8..98421296e 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -619,6 +619,126 @@ describe("bkit status route", () => {
   });
 });
 
+describe("bkit status route holistic cleanBase", () => {
+  const STEP = "build-plan-verify-holistic";
+  const git = (cwd: string, ...args: string[]) => {
+    const r = spawnSync(
+      "git",
+      [
+        "-c",
+        "user.name=t",
+        "-c",
+        "user.email=t@example.com",
+        "-c",
+        "commit.gpgsign=false",
+        ...args,
+      ],
+      { cwd, encoding: "utf-8" },
+    );
+    return r.stdout.trim();
+  };
+  /** A repo with commits c1 < c2 on dev, plus `side`, a commit not on dev. */
+  function repo() {
+    const root = tmp();
+    git(root, "init", "-q", "-b", "dev");
+    git(root, "commit", "-q", "--allow-empty", "-m", "c1");
+    const c1 = git(root, "rev-parse", "HEAD");
+    git(root, "commit", "-q", "--allow-empty", "-m", "c2");
+    const c2 = git(root, "rev-parse", "HEAD");
+    git(root, "checkout", "-q", "-b", "other", c1);
+    git(root, "commit", "-q", "--allow-empty", "-m", "side");
+    const side = git(root, "rev-parse", "HEAD");
+    git(root, "checkout", "-q", "dev");
+    return { root, c1, c2, side };
+  }
+  const holistic = (at: string, parentSha: string, verdict: string, failures: number) =>
+    done("build", STEP, at, { parentSha, verdict, failures });
+  const cleanBase = async (rows: object[], cwd: string) => {
+    const r = await run(
+      ["status", "route", `--file=${log(rows)}`, "--workflow=build", `--step=${STEP}`],
+      cwd,
+    );
+    expect(r.code).toBe(0);
+    return r.json.cleanBase;
+  };
+
+  it("last clean holistic base is the newest zero-failure row", async () => {
+    const { root, c1, c2 } = repo();
+    expect(
+      await cleanBase(
+        [
+          started("build", "2026-10-01T00:00:00Z"),
+          holistic("2026-10-01T00:01:00Z", c1, "PASS", 0),
+          holistic("2026-10-01T00:02:00Z", c2, "CONCERNS", 0),
+        ],
+        root,
+      ),
+    ).toBe(c2);
+  });
+
+  it("a holistic row with gaps does not move the base", async () => {
+    const { root, c1, c2 } = repo();
+    expect(
+      await cleanBase(
+        [
+          started("build", "2026-10-01T00:00:00Z"),
+          holistic("2026-10-01T00:01:00Z", c1, "PASS", 0),
+          holistic("2026-10-01T00:02:00Z", c2, "FAIL", 2),
+        ],
+        root,
+      ),
+    ).toBe(c1);
+  });
+
+  it("holistic base falls back to origin/dev with no clean row", async () => {
+    const { root, c1 } = repo();
+    expect(
+      await cleanBase(
+        [started("build", "2026-10-01T00:00:00Z"), holistic("2026-10-01T00:01:00Z", c1, "FAIL", 1)],
+        root,
+      ),
+    ).toBe("origin/dev");
+    expect(await cleanBase([started("build", "2026-10-01T00:00:00Z")], root)).toBe("origin/dev");
+  });
+
+  it("a clean holistic row from an earlier run does not set the base", async () => {
+    const { root, c1 } = repo();
+    expect(
+      await cleanBase(
+        [
+          started("build", "2026-10-01T00:00:00Z"),
+          holistic("2026-10-01T00:01:00Z", c1, "PASS", 0),
+          { type: "workflow-done", workflow: "build", at: "2026-10-01T00:02:00Z" },
+          started("build", "2026-10-02T00:00:00Z"),
+        ],
+        root,
+      ),
+    ).toBe("origin/dev");
+  });
+
+  it("holistic base falls back to origin/dev when the clean sha is no longer an ancestor of HEAD", async () => {
+    const { root, side } = repo();
+    expect(
+      await cleanBase(
+        [
+          started("build", "2026-10-01T00:00:00Z"),
+          holistic("2026-10-01T00:01:00Z", side, "PASS", 0),
+        ],
+        root,
+      ),
+    ).toBe("origin/dev");
+    expect(
+      await cleanBase(
+        [
+          started("build", "2026-10-01T00:00:00Z"),
+          holistic("2026-10-01T00:01:00Z", "f".repeat(40), "PASS", 0),
+        ],
+        root,
+      ),
+    ).toBe("origin/dev");
+  });
+});
+
 describe("bkit status route --prompt-file (debug Step 1)", () => {
   const GATES = [
     "bkit:gate:static-unit-integration-e2e-live",
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index 6ed882bea..0333874a1 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -16,6 +16,7 @@ import {
   appendLine,
   type InvocationEvent,
   fold,
+  lastCleanRound,
   lastDoneStepAllRuns,
   lastRun,
   nextStrategy,
@@ -201,6 +202,16 @@ type RouteField = (typeof ROUTE_FIELDS)[number];
 /** Exit code: a `--require`d field is missing or holds a value outside its set. */
 export const EXIT_ROUTE_MISSING = 4;
 
+/**
+ * The commit a repeat check tests from: the step's last clean round's `parentSha`, else
+ * `origin/dev`, which is also the answer when that sha is not an ancestor of HEAD.
+ */
+function cleanBase(cwd: string, clean: { parentSha?: unknown } | undefined): string {
+  const sha = clean?.parentSha;
+  if (typeof sha !== "string" || sha === "") return "origin/dev";
+  return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? "origin/dev" : sha;
+}
+
 function route(runs: WorkflowRun[], workflow: string, step: string | undefined, group?: number) {
   const out: Record<string, unknown> = {
     verdict: null,
@@ -477,6 +488,8 @@ export const statusCommand: CommandSpec = {
           "with --workflow=build and --prompt-file: whether the build publishes (a publish=true|false token, else publish.local on LOCAL or publish.remote elsewhere; a non-LOCAL false resolves true), else null",
         publishSource:
           "with publish: token | local | remote | coerced (a non-LOCAL false forced to true), else null",
+        cleanBase:
+          "with --step: the parentSha of the step's last clean round (PASS, or CONCERNS with 0 failures) in the active run, else origin/dev; origin/dev also when that sha is not an ancestor of HEAD",
         parentSha:
           "HEAD when the step's last DONE row in the active run was written — a build-group-start row's is the group's start commit, the base for `context diff` — or null",
       },
@@ -531,6 +544,10 @@ export const statusCommand: CommandSpec = {
           step,
           positiveInt(ctx.flags.group, "group"),
         );
+        out.cleanBase = cleanBase(
+          ctx.cwd,
+          step === undefined ? undefined : lastCleanRound(runs, String(ctx.flags.workflow), step),
+        );
         if (promptFile !== undefined) {
           const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
           const config = readBkitConfig(root);
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 9b50b39d4..e406d76ad 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -264,6 +264,7 @@ describe("bkit workflows start", () => {
         parentSha: git(cwd, "rev-parse", "HEAD"),
         limits: {
           "build.verify": { ask: true, max: 2 },
+          "build.holistic": { ask: true, max: 2 },
           "build.challenge": { ask: true, max: 2 },
           "build.tests": { ask: true, max: 2 },
         },
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 9fde28483..8197ba96a 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1152,10 +1152,26 @@ describe("seedBkitDefaults (via seedCorePackageJsonScripts)", () => {
       verify: { ask: true, maxAttempts: 2 },
       challenge: { ask: true, maxAttempts: 2 },
       tests: { ask: true, maxAttempts: 2 },
+      holistic: { ask: true, maxAttempts: 2 },
       publish: { remote: true, local: true },
     });
   });
 
+  it("install seeds a build.holistic block and keeps an existing one", () => {
+    seed({});
+    run();
+    expect(JSON.parse(read()).bkit.workflows.build.holistic).toEqual({
+      ask: true,
+      maxAttempts: 2,
+    });
+    seed({ bkit: { workflows: { build: { holistic: { ask: false, maxAttempts: 1 } } } } });
+    run();
+    expect(JSON.parse(read()).bkit.workflows.build.holistic).toEqual({
+      ask: false,
+      maxAttempts: 1,
+    });
+  });
+
   it("seeds publish when the bkit block has no build", () => {
     seed({ bkit: { workflows: { minFreeGb: 10 } } });
     run();
@@ -1402,6 +1418,7 @@ describe("migrateBkitLayout (via seedCorePackageJsonScripts)", () => {
     expect(bkitKey()).not.toHaveProperty("loopPause");
     expect(workflows.build).toEqual({
       verify: { ask: true, maxAttempts: 3 },
+      holistic: { ask: false },
       challenge: { ask: false },
       tests: { ask: false },
     });
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 8724717bc..ba72c0f92 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -46,7 +46,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -57,7 +57,7 @@ description: "Build Feature — Autonomous implementation"
 
 _No tracker connected, skip step._
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -111,7 +111,7 @@ _No tracker connected, skip step._
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -249,10 +249,10 @@ _No tracker connected, skip step._
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -781,29 +781,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -815,17 +820,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -840,12 +845,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -855,7 +860,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/engine/shared/settings.test.ts b/.bkit/core/engine/shared/settings.test.ts
index b6c574715..7cd6d44b8 100644
--- a/.bkit/core/engine/shared/settings.test.ts
+++ b/.bkit/core/engine/shared/settings.test.ts
@@ -310,6 +310,12 @@ describe("readBkitConfig", () => {
     for (const p of ASK_POINTS.slice(1)) expect(asks[p]).toEqual({ ask: true, max: 2 });
   });
 
+  it("build.holistic defaults to ask true, max 2", () => {
+    expect(ASK_POINTS).toContain("build.holistic");
+    expect(CONFIG_DEFAULTS.asks["build.holistic"]).toEqual({ ask: true, max: 2 });
+    expect(readBkitConfig(root()).asks["build.holistic"]).toEqual({ ask: true, max: 2 });
+  });
+
   it("reads each ask point's ask and limit, falling back per key", () => {
     const asks = (workflows: unknown) =>
       readBkitConfig(root(JSON.stringify({ bkit: { workflows } }))).asks;
diff --git a/.bkit/core/engine/shared/settings.ts b/.bkit/core/engine/shared/settings.ts
index 6016ae0c7..43752fd4b 100644
--- a/.bkit/core/engine/shared/settings.ts
+++ b/.bkit/core/engine/shared/settings.ts
@@ -88,6 +88,7 @@ export interface TaskCaps {
 export const ASK_POINTS = [
   "design.grill",
   "build.verify",
+  "build.holistic",
   "build.challenge",
   "build.tests",
   "debug.fix",
@@ -207,6 +208,7 @@ export const CONFIG_DEFAULTS: Readonly<BkitConfig> = {
   asks: {
     "design.grill": { ask: true, max: 6 },
     "build.verify": { ask: true, max: 2 },
+    "build.holistic": { ask: true, max: 2 },
     "build.challenge": { ask: true, max: 2 },
     "build.tests": { ask: true, max: 2 },
     "debug.fix": { ask: true, max: 2 },
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index fdd5fed08..4c2d02509 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -83,7 +83,7 @@ autoCompactWindow: 300000
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 1c57db049..d9e566b0d 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -46,7 +46,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -82,7 +82,7 @@ description: "Build Feature — Autonomous implementation"
 
 <!-- bkit:tracker true end -->
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -138,7 +138,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -276,10 +276,10 @@ description: "Build Feature — Autonomous implementation"
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -866,29 +866,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -900,17 +905,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -925,12 +930,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -940,7 +945,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index d4e10c2d0..0261a8c71 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10035,7 +10035,7 @@ Orchestrator exits and the dispatched skill owns the session
 **If** `PUBLISH` = false **or** `PUBLISH` is not held yet → keep the record in the worktree, linked by branch, and NEVER pass `--push`, because a held run pushes nothing and neither does a failure before `status route` resolves `publish`:
 [workflow-pushes] **Else** → commit and push the record, but NEVER onto a branch with an open PR:
 Derive the decision number:
-**If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+**If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
 **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
 For either `VERIFY_GAPS` list:
 A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -10072,7 +10072,7 @@ Route — first match wins:
 **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
 **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
 Clear `PAUSE_LOOP`. **If** `From: verify`, `From: holistic` **or** `From: tests` → the owner chose to go on, so give that loop one more full allowance when its limit is used up. Below the limit, or with `ask` = false, the command grants nothing and exits 1; both exits go on:
-**If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+**If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 Route — first match wins:
 **If** the owner says stop, **or** answers `Stop` → step 8.
 **If** the loop question is answered `Try again` → step 6. The items then need no decision.
@@ -10126,12 +10126,12 @@ Derive the attempt the holistic report is named for:
 **If** `HOLISTIC_VERDICT` = PASS → Step 11.
 **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
 **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
-Route on the holistic rounds since the last one that found no problems:
-**If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
-**If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+Route on the holistic fix rounds of this run:
+**If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+**If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
 **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
 **If** `HOLISTIC_ATTEMPT` is not held (resumed into this sub-step) → read the last holistic round's attempt back:
-**If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+**If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
 Holistic gaps routed: fixed in a holistic round, or asked at the **Decision Pause**
 Holistic fix invoked (`@bkit-build-plan-gaps-remediate`, holistic, no inline work), or no round run
 No-progress holistic round routed
@@ -10234,8 +10234,8 @@ Run the group gate: the static checks and the unit tier. The integration tier ru
 **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
 **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
 **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
-**If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-**If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
+**If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+**If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
 Test-first reds audited (`tests green`)
 Group diff cut from its start commit (`context diff`)
 Group gate verdict decided
@@ -11137,7 +11137,7 @@ The groups' components work together.
 The API contracts match.
 Shared state is consistent.
 Cross-domain boundaries are respected.
-[local-pre-commit] Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+[local-pre-commit] Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
 Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
 `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
 **If** a supplied decision record accepts the gap → no gap. Name the record in `Notes`.
diff --git a/.bkit/version b/.bkit/version
index 09c736a1f..e5794b014 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "a82369810095a5fc09772a0a81477c1f1aee18bf317cd1d633499ee340d78952",
+    ".claude/commands/bkit-build.md": "2de126ee2ce4fbadfa0d97f308fb632aa1a3874c206ea92b22f1579c6900ab78",
     ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
@@ -24,7 +24,7 @@
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "62f9aa0a792e7adb01a83b29ea51e6ea4d2e1530923ddc2f0fa98ce4c8b1ca03",
-    ".claude/agents/bkit-build-plan-verify.md": "9f8d02adcc91bb409b4d8e6b7191dbdfd471b171a8e4a169337758029d478076",
+    ".claude/agents/bkit-build-plan-verify.md": "f589a9cc4913c60697caa9f8ec857884cd4ef2f42c55bee205d720690e62f7c7",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
     ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "a783ca6fb45d59741cc3854279117be200ab410df1af21b7e4000aa6ac0fde7c",
+    ".cursor/commands/bkit-build.md": "65ea9fd0e2035903171687e9b64c71a9009ae8b38a8095509a57dc58bc4adef2",
     ".cursor/commands/bkit-debug.md": "c59d2b8a4f7577d5ac23d9454718097943831916340f87655b1cfdca6641305b",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
@@ -56,7 +56,7 @@
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "4067031d8aa4cc868b2401b95d4c2421ecf005ae0df29da400decc25c4254bae",
-    ".cursor/agents/bkit-build-plan-verify.md": "9a5eba082365aef297e40c69d925e23766d0b3a60640f62b9b8c3709ac6e08a4",
+    ".cursor/agents/bkit-build-plan-verify.md": "87d6600112ad3d29d3349c972d490121dcc9362863885c5d13cbd904e2c86108",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
     ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
@@ -82,7 +82,7 @@
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b348e0cb7ebf3e9457dca5e071127e34068a3fec67c8a4cae4bd6486a9f571b0",
-    ".opencode/agents/bkit-build-plan-verify.md": "d6e056fb5d4a86243234ae1ca27c7f9445aaebecefb835adf3543ee8ded16d03",
+    ".opencode/agents/bkit-build-plan-verify.md": "c107f64f0a837d8f45af9843f2adfec00c821cf75e1b6ebc186fa6af7745afc9",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "2a848bc7222f0604ef6838809d25cc8ae0e5d3a0f6e31ff9eff3f627e936f10d",
+    ".opencode/commands/bkit-build.md": "d6d97cd0f349ce8d535014394dd280f196463e2330c77b1589e46171ac82f201",
     ".opencode/commands/bkit-debug.md": "6a54040b8fb2bb18f98eac785ef39463ef216726e9660890eb6aab9b99cb3ee6",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
@@ -122,7 +122,7 @@
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "7559cc695ce2816a2a87402ad2e996f688004208642e1273a0ab63c394bbdb4e",
-    ".codex/agents/bkit-build-plan-verify.toml": "c921473bfeda36e6a169de8eb8c9b3c1b1a8015776fb15e0f1d8363916f4c91f",
+    ".codex/agents/bkit-build-plan-verify.toml": "371b94f87bc009a07473bc82200ff11bd8a78caf455cbccfa33ed27f9bccf1ef",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
     ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
@@ -254,7 +254,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "c64123238b6123aeba9ab1419c5e8508c03e99248f8216ffbb5528823de50c95",
+    ".bkit/cli.md": "22698001f4f847b411b6441971252247db895d8294069e1d06815d8b5e67d72f",
     ".claude/agents/bkit-build-plan-tests.md": "048eedc214f02c1c72cdf460bf1aecea0b38836420181796cb8112e9b8eb74da",
     ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
     ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index 9eb886b41..3cac9c190 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -84,7 +84,7 @@ autoCompactWindow: 300000
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 1758ff35f..048dd3c77 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -47,7 +47,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -65,7 +65,7 @@ description: "Build Feature — Autonomous implementation"
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -119,7 +119,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -257,10 +257,10 @@ description: "Build Feature — Autonomous implementation"
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -824,29 +824,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -858,17 +863,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -883,12 +888,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -898,7 +903,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index 55581feae..a942b0d98 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -71,7 +71,7 @@ developer_instructions = """
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 20f8f70da..bf7947117 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -81,7 +81,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 6099c80fa..fd5a8a96c 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -46,7 +46,7 @@ Build Feature — Autonomous implementation
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -64,7 +64,7 @@ Build Feature — Autonomous implementation
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -118,7 +118,7 @@ Build Feature — Autonomous implementation
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -256,10 +256,10 @@ Build Feature — Autonomous implementation
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -823,29 +823,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `/bkit-build-plan-verify` using `Task` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -857,17 +862,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -882,12 +887,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `Task` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -897,7 +902,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index 6cffb2bdd..fd83855f7 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -82,7 +82,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 9b9567e1c..fad7bfd83 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -50,7 +50,7 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** `openDecision` `status` = `OPEN` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but the `openDecision` `status` is `DECIDED` / `ASSUMED` (the owner's route is kept) **or** another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -68,7 +68,7 @@ $ARGUMENTS
 - **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.
 
 
-- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds. A verify or tests limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
+- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` / `.holistic` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 11; the last round's fixes get no further challenge round), tests counts test rounds, holistic counts holistic fix rounds within the run (no reset between rounds). A verify, tests or holistic limit used up asks the owner at the **Decision Pause** when `ask` = true in a session; the owner's `Fix now`, `Try again` or `Accept` gives that loop alone one more full allowance (`bkit counters grant`), and it asks again once that allowance is used up too. `ask` = false, or headless → a used-up limit goes to the **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.
 
 **Rules:** Copied word for word from `.agents/rules.md`.
 
@@ -122,7 +122,7 @@ $ARGUMENTS
    ```
    Hold `value` as `DECISION`.
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
-   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+   - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
@@ -260,10 +260,10 @@ $ARGUMENTS
      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
      ```
 
-   - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+   - **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 
      ```bash
-     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+     "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic --file="{STATUS}" --workflow=build
      ```
 
    - **Else**:
@@ -827,29 +827,34 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
 
 ## 🧠 Step 10 — Plan Verify Holistic
 
-This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Rounds count against `build.verify.maxAttempts` from the last holistic round that found no problems (`--since-clean`). Holistic files are named `{step}-holistic-{HOLISTIC_ATTEMPT}`.
+This step checks the whole feature against the plan after the last group, and again each time later groups ran, such as Build Challenge's fix groups. Its gaps get a fix loop like Steps 8-9: fixable gaps are fixed and checked again, and the rest go to the **Decision Pause**. Holistic fix rounds count within the run against `build.holistic.maxAttempts`, with no reset after a clean check. A repeat check tests only the files changed since the last check that found no problems. Holistic report and fix-log file names carry the run number, so a restart overwrites no earlier run's file.
 
 1. Derive the attempt the holistic report is named for:
    ```bash
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
+   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   ```bash
+   "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
+   ```
+   Hold `cleanBase` as `HOLISTIC_BASE`.
 2. Write the run's diff to the file the agent reads:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic >/dev/null || exit 2
    ```
    **Subagent:** Invoke `/bkit-build-plan-verify` using `subagent` tool:
-   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Context: You are a subagent in the Build phase. Holistic plan verification (every group), attempt `{HOLISTIC_ATTEMPT}`. `Test base`: `{HOLISTIC_BASE}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff; review full feature diff for cross-group integration).
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`.
-   Result: `{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`.
+   Result: `{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json`. Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render.
    When the holistic verifier is done, produce the holistic report from its result:
    ```bash
-   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md"
+   "{BKIT}" steps stub --agent=bkit-build-plan-verify --result-file="{OUTBOX}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}-result.json" --to="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md"
    ```
 3. Finish:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:next --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-<attempt>.md" --number=10 --post --title="Plan Verify Holistic" --message="chore({FID}): plan-verify-holistic attempt <attempt>"
    ```
    Hold `verdict` as `HOLISTIC_VERDICT`, `failures` as `HOLISTIC_FAILURES`, `fields.Fixable` as `HOLISTIC_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
 4. Tick each group's satisfied tasks, with one call per task group. Set `{GROUP}` to that group and `{VERIFIED_TASKS}` to the numbers `Tasks:` names for it:
@@ -861,17 +866,17 @@ This step checks the whole feature against the plan after the last group, and ag
    - **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
    - **If** `HOLISTIC_VERDICT` = CONCERNS **or** `HOLISTIC_VERDICT` = FAIL → sub-step 6.
    - **Else** → **Failure Path**.
-6. Route on the holistic rounds since the last one that found no problems:
+6. Route on the holistic fix rounds of this run:
    ```bash
-   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --file="{STATUS}" --workflow=build --point=build.verify --continue=within-limit --exceeded=failure-path
+   "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.verify`.
-   **If** `LIMIT_ASK` = true **and** either exit 1 **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
+   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
-   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-   - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-   - **If** exit 0 **and** either `HOLISTIC_FIXABLE` = false **or** `HOLISTIC_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
+   - **If** exit 1 → **Failure Path** — `build.holistic.maxAttempts` is used up.
+   - **If** exit 0 **and** `HOLISTIC_FIXABLE` = false → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 → sub-step 7, for a round that fixes only the fixable gaps.
    - **Else** → **Failure Path**.
 7. **Run only if** sub-step 6 **or** the **Decision Pause** routed here. Read status.jsonl and derive the next `STRATEGY`:
@@ -886,12 +891,12 @@ This step checks the whole feature against the plan after the last group, and ag
      Hold `value` as `HOLISTIC_ATTEMPT`.
 8. **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `subagent` tool:
    Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
-   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md`.
+   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 9. Finish. The command records the header's `Strategy`:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
@@ -901,7 +906,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     Exit 1 means the attempt changed no source file.
     Route — first match wins:
-    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
     - **Else** → **Failure Path**.
 
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 9a8f8de32..4dd54be90 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -10,7 +10,7 @@
 //            0 is a legal answer (that step simply has not run).
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { activeDoneSteps, activeDoneStepsSinceClean, allRunsDoneSteps, appendLine, CORRECTION_CANDIDATE_ROW, lastCleanRound, lastDoneStepAllRuns, nextStrategy, runNumber, statusTimestamp, } from "../../ledgers/status.js";
+import { activeDoneSteps, activeDoneStepsSinceClean, allRunsDoneSteps, appendLine, CORRECTION_CANDIDATE_ROW, lastDoneStepAllRuns, nextStrategy, runNumber, statusTimestamp, } from "../../ledgers/status.js";
 import { ASK_POINTS, readBkitConfig, } from "../../shared/settings.js";
 import { headlessRun } from "./runtime.js";
 import { CommandError, EXIT, git, runGit, wholeNumber, } from "../lib.js";
@@ -46,8 +46,7 @@ const nonNegativeInt = (v, flag) => {
 /**
  * `--of=<step>:<position>` over `--file` / `--workflow`: the counter at that position.
  * `--of=<step>,<step>...:count` sums the DONE rows of every listed step. `--all-runs`
- * counts every run of the workflow in the file, not only the active one. `--since-clean`
- * counts only the rows after the step's last clean round (`cleanRound`).
+ * counts every run of the workflow in the file, not only the active one.
  */
 function derivedOf(ctx) {
     const [list, position] = String(ctx.flags.of).split(":");
@@ -58,26 +57,14 @@ function derivedOf(ctx) {
         throw new CommandError(EXIT.USAGE, "--of with several steps takes distinct steps and :count");
     if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
         throw new CommandError(EXIT.USAGE, "--of needs --file and --workflow");
-    if (ctx.flags.sinceClean === true && (steps.length > 1 || ctx.flags.allRuns === true))
-        throw new CommandError(EXIT.USAGE, "--since-clean takes one --of step, without --all-runs");
     const runs = readRuns(statusFile(ctx));
     const group = positiveInt(ctx.flags.group, "group");
-    const doneSteps = ctx.flags.allRuns === true
-        ? allRunsDoneSteps
-        : ctx.flags.sinceClean === true
-            ? (r, w, f) => activeDoneStepsSinceClean(r, w, f, steps[0])
-            : activeDoneSteps;
+    const doneSteps = ctx.flags.allRuns === true ? allRunsDoneSteps : activeDoneSteps;
     const count = steps.reduce((n, step) => n + doneSteps(runs, String(ctx.flags.workflow), { step, group }).length, 0);
     if (position === "current" && count === 0)
         throw new CommandError(EXIT_NO_OWN_ROW, `${steps[0]}: no DONE row in the active run — the step's own row is missing`);
     return position === "next" ? count + 1 : count;
 }
-/** `--since-clean`: count one loop's rounds since its check last found no problems. */
-const SINCE_CLEAN_FLAG = {
-    name: "since-clean",
-    type: "boolean",
-    help: "with --of: only rows after the --of step's last clean round (PASS, or CONCERNS with 0 failures); with --point: only grants after it, for exactly --group (none: grants with no group)",
-};
 /** `--all-runs`: count every run of the workflow in `--file`, not only the active one. */
 const ALL_RUNS_FLAG = {
     name: "all-runs",
@@ -171,10 +158,9 @@ export function spendCorrection(file, workflow, scope, operation, limit, extra =
 export const ALLOWANCE_ROW = "allowance-granted";
 /**
  * Allowances granted to `point` (and `group`, when given) in `workflow`'s active run, or
- * across every run of the file with `allRuns`. With `sinceClean` (a step), only the grants
- * after that step's last clean round, for exactly `group`: none means grants with no group.
+ * across every run of the file with `allRuns`.
  */
-export function grantCount(file, workflow, point, group, allRuns, sinceClean) {
+export function grantCount(file, workflow, point, group, allRuns) {
     if (!fs.existsSync(file))
         return 0;
     const rows = readStatusRows(file);
@@ -184,15 +170,12 @@ export function grantCount(file, workflow, point, group, allRuns, sinceClean) {
             if (r.type === "workflow-started" && r.workflow === workflow)
                 start = i;
         });
-    const cleanAt = sinceClean === undefined ? undefined : lastCleanRound(readRuns(file), workflow, sinceClean)?.at;
     return rows
         .slice(start + 1)
         .filter((r) => r.type === ALLOWANCE_ROW &&
         r.workflow === workflow &&
         r.point === point &&
-        (sinceClean === undefined
-            ? group === undefined || r.group === group
-            : r.group === group && (cleanAt === undefined || String(r.at) > cleanAt))).length;
+        (group === undefined || r.group === group)).length;
 }
 /** A loop's frozen allowance, including the owner's saved grants; absent for legacy runs. */
 export function savedPointLimit(file, workflow, point, group, allRuns = false) {
@@ -366,13 +349,6 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
                 : "stop",
     };
 }
-/** `--since-clean`'s step: the single `--of` step, whose clean rounds close a loop. */
-function sinceCleanStep(ctx) {
-    const step = ctx.flags.of === undefined ? undefined : String(ctx.flags.of).split(":")[0];
-    if (step === undefined || step === "" || step.includes(","))
-        throw new CommandError(EXIT.USAGE, "--since-clean needs --of with one step");
-    return step;
-}
 /**
  * `--point`'s limit for route and grant: the run's frozen setting (else package.json's), its
  * max raised by one full allowance per `allowance-granted` row when `--file` and
@@ -388,7 +364,7 @@ function pointLimit(ctx) {
         : undefined;
     const setting = frozen ?? askSetting(ctx.cwd, point);
     const grants = inRun
-        ? grantCount(statusFile(ctx), String(ctx.flags.workflow), point, positiveInt(ctx.flags.group, "group"), ctx.flags.allRuns === true, ctx.flags.sinceClean === true ? sinceCleanStep(ctx) : undefined)
+        ? grantCount(statusFile(ctx), String(ctx.flags.workflow), point, positiveInt(ctx.flags.group, "group"), ctx.flags.allRuns === true)
         : 0;
     return {
         point,
@@ -425,7 +401,6 @@ const VALUE_FLAGS = [
         ...ALL_RUNS_FLAG,
         help: "with --of: count every run of the workflow in --file; with --point: grants of every run",
     },
-    SINCE_CLEAN_FLAG,
 ];
 /** The counter's value: `--value`, or derived with `--of` and/or `--rows`. */
 function counterValue(ctx) {
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index b0deeb4f3..7dcfc2239 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -151,12 +151,12 @@ const LOOPS = {
         point: "verify",
         gate: "build-group-gate",
     },
-    // The whole-feature check reopens after each clean round, so its loop starts there.
+    // The whole-feature check reopens after each clean round, so its loop starts there. Its allowance is `build.holistic`.
     holistic: {
         title: "Holistic verify",
         check: "build-plan-verify-holistic",
         fix: "build-plan-gaps-remediate-holistic",
-        point: "verify",
+        point: "holistic",
         sinceClean: true,
     },
     tests: {
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 1eb1fae90..00be339aa 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -6,7 +6,7 @@ import { BKIT_DEBUG_GATES } from "../../install/manifest.js";
 import { appendFrictionRow, journalEnabled, pauseFrictionRow } from "../../ledgers/journal.js";
 import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
+import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastCleanRound, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, worktreeFingerprint, writeInvocation, } from "../lib.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
@@ -152,6 +152,16 @@ const ROUTE_FIELDS = [
 ];
 /** Exit code: a `--require`d field is missing or holds a value outside its set. */
 export const EXIT_ROUTE_MISSING = 4;
+/**
+ * The commit a repeat check tests from: the step's last clean round's `parentSha`, else
+ * `origin/dev`, which is also the answer when that sha is not an ancestor of HEAD.
+ */
+function cleanBase(cwd, clean) {
+    const sha = clean?.parentSha;
+    if (typeof sha !== "string" || sha === "")
+        return "origin/dev";
+    return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? "origin/dev" : sha;
+}
 function route(runs, workflow, step, group) {
     const out = {
         verdict: null,
@@ -399,6 +409,7 @@ export const statusCommand = {
                 gates: "with --prompt-file: the gates to try, deepest first; [live=off] in the prompt drops the live gate",
                 publish: "with --workflow=build and --prompt-file: whether the build publishes (a publish=true|false token, else publish.local on LOCAL or publish.remote elsewhere; a non-LOCAL false resolves true), else null",
                 publishSource: "with publish: token | local | remote | coerced (a non-LOCAL false forced to true), else null",
+                cleanBase: "with --step: the parentSha of the step's last clean round (PASS, or CONCERNS with 0 failures) in the active run, else origin/dev; origin/dev also when that sha is not an ancestor of HEAD",
                 parentSha: "HEAD when the step's last DONE row in the active run was written — a build-group-start row's is the group's start commit, the base for `context diff` — or null",
             },
             exitCodes: {
@@ -440,6 +451,7 @@ export const statusCommand = {
                 }
                 const runs = promptFile !== undefined && !fs.existsSync(file) ? [] : readRuns(file);
                 const { out, problems } = route(runs, String(ctx.flags.workflow), step, positiveInt(ctx.flags.group, "group"));
+                out.cleanBase = cleanBase(ctx.cwd, step === undefined ? undefined : lastCleanRound(runs, String(ctx.flags.workflow), step));
                 if (promptFile !== undefined) {
                     const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                     const config = readBkitConfig(root);
diff --git a/dist/shared/settings.js b/dist/shared/settings.js
index 614eb40de..858e0bc4e 100644
--- a/dist/shared/settings.js
+++ b/dist/shared/settings.js
@@ -18,6 +18,7 @@ export function parseGithubBoardUrl(url) {
 export const ASK_POINTS = [
     "design.grill",
     "build.verify",
+    "build.holistic",
     "build.challenge",
     "build.tests",
     "debug.fix",
@@ -64,6 +65,7 @@ export const CONFIG_DEFAULTS = {
     asks: {
         "design.grill": { ask: true, max: 6 },
         "build.verify": { ask: true, max: 2 },
+        "build.holistic": { ask: true, max: 2 },
         "build.challenge": { ask: true, max: 2 },
         "build.tests": { ask: true, max: 2 },
         "debug.fix": { ask: true, max: 2 },
