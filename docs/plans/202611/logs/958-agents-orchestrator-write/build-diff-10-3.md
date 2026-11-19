diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index 0d25f19d6..9280d7f17 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -95,7 +95,7 @@ tools:
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 064c8ecb5..a8c0638a9 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -105,8 +105,8 @@ tools:
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
index 3063dbf4f..3c6a32897 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
@@ -80,7 +80,7 @@ tools:
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 02dc6d17b..e1c7a8b00 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -65,6 +65,7 @@ description: "Build Feature — Autonomous implementation"
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -76,7 +77,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -146,7 +147,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -183,7 +184,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -210,7 +211,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -231,7 +232,7 @@ description: "Build Feature — Autonomous implementation"
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -244,8 +245,11 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -266,13 +270,13 @@ description: "Build Feature — Autonomous implementation"
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -338,7 +342,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -355,7 +359,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -377,7 +381,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -882,7 +886,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md` using `view_file` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -990,7 +994,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md` using `view_file` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1166,7 +1170,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md` using `view_file` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 3cfd484fe..52c221fca 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -357,9 +357,9 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 733e795cf..bed0ac2a5 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -65,6 +65,7 @@ description: "Build Feature — Autonomous implementation"
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -76,7 +77,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -146,7 +147,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -183,7 +184,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -210,7 +211,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -231,7 +232,7 @@ description: "Build Feature — Autonomous implementation"
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -244,8 +245,11 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -266,13 +270,13 @@ description: "Build Feature — Autonomous implementation"
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -338,7 +342,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -355,7 +359,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -377,7 +381,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -882,7 +886,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -990,7 +994,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1166,7 +1170,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 1078f7445..e13e23834 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -357,9 +357,9 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 8e2fe655d..f3d640324 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -174,7 +174,8 @@ Build decision files: check the orchestrator's questions, write the engine's cou
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
 | `counts` | workflow | **`--decision`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--fix-task` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `answers` | workflow | **`--file`** | Print a decision file's folded answers: the answer last appended for each question, who gave it and its flags. Writes nothing. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index eb5111eec..79d889d10 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -156,7 +156,7 @@ These blocks have the same name and the same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Antigravity, Cursor); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"\|"held"` (last end row; `held` = the last `workflow-done` row says `ending: held`; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` while a `build-decision-*.md`'s computed `Status` is `OPEN`, read across the decision file and its `-engine.md` sibling, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind, or the `engine-call` / `completeness` rows the engine journals after a terminator, which add to `afterEnd` and `scan.rows` with no rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"\|"held"` (last end row; `held` = the last `workflow-done` row says `ending: held`; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` while a `build-decision-*.md`'s computed `Status` is `OPEN`, read from the decision file's `decision-counts` and `decision-answer` rows, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind, or the `engine-call` / `completeness` rows the engine journals after a terminator, which add to `afterEnd` and `scan.rows` with no rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 16dfe7c6f..175875bea 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -425,7 +425,7 @@ Every template under `docs/templates/bkit-audit-*.md`:
 
 ## Hook-injected text
 
-Hooks add text to an agent's context mid-run. The text reaches every agent and subagent, and no frontmatter opts out of it. The canonical wording lives in the engine file. Per-host delivery → `.bkit/providers.md` § Guardrails, § GateGuard, § ReadGuard.
+Hooks add text to an agent's context mid-run. The text reaches every agent and subagent, and no frontmatter opts out of it. The canonical wording lives in the engine source. Per-host delivery → `.bkit/providers.md` § Guardrails, § GateGuard, § ReadGuard.
 
 <!-- prettier-ignore -->
 | Hook | Fires on | Injects | Hosts | Canonical text |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index cf8a482c5..16146449c 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -300,6 +300,8 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, used-up merge limit). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
+| `decision-counts` | `{type, workflow, at, file, sourceChanged?, gate?, loop?, baseCheck?}` | The engine's counts for one decision file: `Source changed`, `Gate`, the base check and the loop question `Q1` with its progress numbers. Written only by `bkit decisions counts`; `bkit status row` refuses the type. Not folded; the decision readers take the row appended last for a file. |
+| `decision-answer` | `{type, workflow, at, file, q, answer, by, assumed?, rejected?, deferred?, fixTask?, reasonFile?, runtime?}` | One answer to question `q` of a decision file; `by` = `owner`, `headless`, `rerun` or `ship`. Written only by `bkit decisions apply` (and ship's deferrals); `bkit status row` refuses the type. Not folded; the row appended last for a question wins, and `bkit decisions answers` prints the result.
 | `run-commits` | `{type, workflow, at, startSha, commits, pushed}` | The commits a run in place on `dev` made, copied from its shared-checkout record: `startSha` = the record's start, `commits` = the run's commit ids, `pushed` = those already landed on `origin/dev` as replayed copies. `bkit workflows handover --push` writes one for a run that stays `IN_PROGRESS`, before it lands the handover, because the handover removes the record. It also parks the same start, commits and pushed list in this clone's git dir (`bkit/shared-checkout-parked/{fid}.json`). `bkit worktrees setup` rebuilds the record of the resumed run from the first of these that has one, and drops every commit id that is not an ancestor of `HEAD`: the parked copy, unless the checkout's `status.jsonl` shows the run closed; else the newest such row after the run's `workflow-started` in that log when it shows the run open; else the row on `origin/dev` when that copy shows the run open, which is the only source that fetches. A landed handover takes the row's line back out of the checkout, so the copy on `origin/dev` is a backup. Setup removes the parked copy once the record is rebuilt. Not folded; step minutes skip it. |
 | `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?, tested?, failedTests?, failedTestsTruncated?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. A tests-lock wait (exit 81) writes no row. Not folded, never a step's finish row. Step minutes skip it. |
 | `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. A command git launched (a hook, seen by `GIT_EXEC_PATH` in its environment) writes none, so a hook never leaves the tracked status file dirty after a commit. A command run while the run's repo has a rebase paused writes none either, because `git rebase --continue` refuses a tracked file with an unstaged change. Not folded; step minutes skip it. |
@@ -522,7 +524,7 @@ Each step posts its own fenced section as a fresh comment.
 | Disproven design spike claim | A passing design update addresses its design impact. Claims recorded under `Unsettled` remain concerns. |
 | Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
 | Failed group verification, group gate or holistic gate | A later passing holistic verification (verify) or a later passing Step 12 run (group gate, holistic gate), with 0 failures. |
-| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
+| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `fixTask` names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `fixTask`, or an unticked or unverified fix task keeps the FAIL. |
 | Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed build diagnose step (build Step 13) it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed debug diagnose step (debug Step 6) or soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
@@ -989,21 +991,21 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions counts --base-check=` words the engine's loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL`, `openDecision` `status` = `OPEN` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other `Gate: FAIL` pause (a `DECIDED` / `ASSUMED` file, which keeps the owner's route, a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
-- **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `Fix task:` line names. An `Accept` or `Accept (assumed)` item that already carries a `Decision:` line writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`, and step 6 adds a `Decision:` line only under an item that has none. A decided file a `build-decision` row names is not reopened, and `decisions counts` is unchanged.
-- **Record:** the orchestrator writes `build-decision-{RUN}-{K}.md` with the file tool, and `bkit decisions check` refuses a file without lettered options with effects, a Recommended and a Default if unanswered line per question (exit 6, the `problem` printed). `bkit decisions counts` writes the engine's numbers into the `build-decision-{RUN}-{K}-engine.md` sibling, never into the orchestrator's file, and a pause is open while the `Status` computed across both files is `OPEN`. Together the files hold: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `holistic` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line (`{n}` the rounds run, never above `{max}`: an `--attempt` above `--max` is the round the limit refused) and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); a `VERIFY_GAPS` item, verify or holistic, is titled `Task {N}` when its gap names a task, so the `tasks tick --decision` tick finds it; an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `fixTask` names. An item `bkit decisions answers` already lists as answered writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`. A decided file a `build-decision` row names is not reopened, and `decisions counts` is unchanged.
+- **Record:** the orchestrator writes `build-decision-{RUN}-{K}.md` with the file tool, and `bkit decisions check` refuses a file without lettered options with effects, a Recommended and a Default if unanswered line per question (exit 6, the `problem` printed). `bkit decisions counts` records the engine's numbers as a `decision-counts` row and every answer is a `decision-answer` row in `status.jsonl`, never a line in the orchestrator's file; a pause is open while the `Status` the rows give is `OPEN`. The file holds the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `holistic` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line (`{n}` the rounds run, never above `{max}`: an `--attempt` above `--max` is the round the limit refused) and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); a `VERIFY_GAPS` item, verify or holistic, is titled `Task {N}` when its gap names a task, so the `tasks tick --decision` tick finds it; an item answered `Fix now` also gets a `fixTask` on its `decision-answer` row, naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it. The owner's own words go in `Owner:` lines at the end of the file.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
 - **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason and the diff of its own lines since its baseline (`changed` carries `diff` and `additive`), options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. `Recommended: none — {why}`; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
-- **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
-- **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read the decision files' answers and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
+- **Accept (assumed):** taken without the owner — a `decision-answer` row with `assumed: true` (`by` `headless`, with the runtime and reason). Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets its task recorded with `decisions apply --fix-task`; an item whose row already has a `fixTask` reuses that task. Step 5 records it right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → a `Fix now` row with `by` `headless`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
 - **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic counts the run's fix rounds against `build.holistic`); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary|continue} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), the `tasks tick --decision` tick of the accepted gaps' tasks, made before the decision is recorded, then Step 11 (`continue` from a holistic pause, each task ticked in its own group) or Step 7 (`continue` from a verify pause), only when `bkit decisions skip` exits 0 on the decision file, Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
-- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`: each runs `bkit decisions answers --file=<the decision file>` and follows its output plus the file's `Owner:` lines, so the owner's words reach the next round (an answer whose `by` is not `owner` is not the owner's). Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 run `decisions answers` the same way. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
@@ -1135,7 +1137,7 @@ The following table describes the local discovery route and shared step mechanic
 | --- | --- | --- |
 | 1 — Start Workflow | — | Resolve `FID` (issue recovery as in design Step 1; issue-less: tracker reads, labels and comments skipped); `bkit runtime detect` → `RUNTIME_WORKTREES`; `bkit locks acquire` (main checkout; missing month bucket → current UTC month); straight after the lock, before any tracker write, `bkit worktrees setup --workflow=ship [--branch=] [--issue=]` resolves `SHIP_BRANCH` (see Branch eligibility), creates / resumes (no rebase) / adopts, writes the `.worktree-owned` marker to the outbox only for a worktree it created, and prints `branchWarning`; in the worktree `bkit status path` → `BOOK_ROOT`, `bkit workflows start --branch={SHIP_BRANCH}` refuses a checkout on another branch (exit 15, before any row), clears the stale `.deferred-blocked` / `.rebase-failed` sentinels and opens the run (its log lives in the worktree), `bkit runtime row` — so every later failure has a book to keep its record in; create `{OUTBOX}`; preflight `actions: write` once; set label `Ship`, `In Progress`. no commits on `dev`. |
 | 2 — Verify PR (Worktree Setup + Regression Guard) | — | Reconcile through `branches sync --reconcile-feature` before PR lookup, then plain-push the reconciled CI-running head. Setup and each reconciliation candidate refuse inherited unpublished dev commits. `prs probe --ship-entry` qualifies open/merged PRs against fresh feature evidence; no PR or extra work beyond a merged PR opens a new PR into dev. Scoped MCP facts pass through the same engine classifier. Record `ENTRY_HEAD`, then check the PR's CI. A safely qualified merged PR records `ship-merged-on-entry` and goes to Step 11. |
-| Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
+| Confirm Assumed Items | — | `bkit decisions pending` lists the build's assumed `Accept` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
 | 3 — Base Check | — | Reconcile and plain-push again on every integration retry before selecting `basePath`: A → Step 5; B → Step 4. `branches sync --feature-state` computes merge-aware coverage, excluding proven automatic dev-only merges and bookkeeping. New local or imported feature work invalidates prior sweep/docs coverage. A pending feature merge passes the engine's actual target to Step 4 and returns here after resolution. |
 | 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `branches sync --merge --target=<pinned target>` integrates dev locally, or continues the recorded feature merge. Existing mechanical settlement handles ledgers, lockfile, generated register, embedding docs and install record, then generation. Unresolved semantic paths remain in progress for the resolver, which verifies `MERGE_HEAD` equals the caller's target. Success plain-pushes, then returns to the recorded reconciliation step or Step 5. Other failures preserve/report the existing failure evidence. |
 | 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | Recompute feature coverage after integration, then compare the recorded successful `ship-feature-coverage` state and artifact before reuse; changed or missing state reruns the sweep. The sweep uses `branches scan-diff --disabled-tests` and `ledgers triage` for mechanical facts. PASS records the covered state; FAIL writes `.deferred-blocked` and stops before merge. Missing plans are warned and the ship input supplies intended outcomes. |
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 801a61a73..2c93e806c 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -187,6 +187,31 @@ describe("engine calls", () => {
     expect(quoted).toEqual([]);
   });
 
+  it("no workflow names the engine decision file or the build reason file, or passes the owner's words in --reason", () => {
+    const naming = ALL.filter((name) =>
+      /-engine\.md|build-owner-reason-|decisions apply[^\n]*--reason="/.test(
+        workflow(name).replace(/\\\n\s*/g, " "),
+      ),
+    );
+    expect(naming).toEqual([]);
+  });
+
+  it("bkit-build records owner answers with one decisions apply call and routes a resumed pause with no question to decisions check", () => {
+    const text = workflow("build");
+    const step6 = /\n6\. Write the decisions[\s\S]*?\n7\. /.exec(
+      section(text, /Decision Pause/),
+    )?.[0];
+    expect(step6, "Decision Pause step 6").toBeDefined();
+    expect(step6).toContain("--answer=Q{n}={letter}");
+    expect(step6).not.toContain('--q=1 --answer="{Try again|Decide|Stop}"');
+    expect(step6).not.toContain("--reason-file");
+    const start = text.indexOf("  - **Open decision:**");
+    expect(start, "no Open decision bullet").toBeGreaterThanOrEqual(0);
+    const open = text.slice(start, text.indexOf("  - **Gate rerun:**", start));
+    expect(open).toMatch(/`questions` = 0/);
+    expect(open).toContain("decisions check");
+  });
+
   it("the steps finish re-ask passes the printed problem", () => {
     const asks = ALL.flatMap((name) =>
       workflow(name)
@@ -1135,15 +1160,10 @@ describe("build", () => {
       pause.indexOf("5. Apply each decision"),
       pause.indexOf("6. Write the decisions"),
     );
-    expect(step5).toContain("`Fix task:`");
-    expect(step5).toMatch(/already has a `Fix task:` line/);
+    expect(step5).toContain("--fix-task=Q{n}={N}");
+    expect(step5).toMatch(/already lists the item with a `fixTask`/);
     expect(step5).toMatch(/reuse/i);
-    const step6 = pause.slice(
-      pause.indexOf("6. Write the decisions"),
-      pause.indexOf("Set the route"),
-    );
-    expect(step6).toContain("Fix task: {N}");
-    expect(pause.indexOf("Fix task: {N}", pause.indexOf("6. Write the decisions"))).toBeLessThan(
+    expect(pause.indexOf("--fix-task")).toBeLessThan(
       pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
     );
   });
@@ -1154,14 +1174,9 @@ describe("build", () => {
       pause.indexOf("5. Apply each decision"),
       pause.indexOf("6. Write the decisions"),
     );
-    expect(step5).toContain("Fix task: {N}");
+    expect(step5).toContain("--fix-task=Q{n}={N}");
     expect(step5).toContain("tests plan-check");
-    expect(step5.indexOf("Fix task: {N}")).toBeLessThan(step5.indexOf("tests plan-check"));
-    const step6 = pause.slice(
-      pause.indexOf("6. Write the decisions"),
-      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
-    );
-    expect(step6).toMatch(/still missing/);
+    expect(step5.indexOf("--fix-task")).toBeLessThan(step5.lastIndexOf("tests plan-check"));
   });
 
   it("the owner decisions contract names the task block as the Fix now carrier", () => {
@@ -1172,7 +1187,7 @@ describe("build", () => {
     expect(bullet).not.toContain("only by reading the decision file");
     expect(bullet).toContain("NEVER restate, summarise or paraphrase an owner's answer");
     const gate = build.slice(build.indexOf("### 🔒 Gate — Decision Pause"));
-    expect(gate.slice(0, gate.indexOf("---"))).toContain("Fix task");
+    expect(gate.slice(0, gate.indexOf("---"))).toContain("--fix-task");
   });
 
   it("Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause", () => {
@@ -1182,13 +1197,9 @@ describe("build", () => {
       pause.indexOf("6. Write the decisions"),
     );
     expect(step5).toMatch(/reopened `DECIDED` \/ `ASSUMED`/);
+    expect(step5).toContain("`decisions answers`");
     expect(step5).toMatch(/no second `docs\/decisions\.jsonl` row/);
     expect(step5).toMatch(/no second title suffix/);
-    const step6 = pause.slice(
-      pause.indexOf("6. Write the decisions"),
-      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
-    );
-    expect(step6).toMatch(/only under an item that has none/);
   });
 
   it("an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date", () => {
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 065ca2b8f..67265c365 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -1848,7 +1848,9 @@ describe("bkit decisions apply --by=owner and pending", () => {
     const rows = statusRows(out);
     const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
     expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
-    expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
+    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
+    expect(String(confirmed?.answer)).not.toContain("fine");
+    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
     expect(JSON.stringify(rows)).not.toMatch(/Status:/);
   });
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 3a60f71e3..b1a302137 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -63,6 +63,7 @@ description: "Build Feature — Autonomous implementation"
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -74,7 +75,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -137,7 +138,7 @@ _No tracker connected, skip step._
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -174,10 +175,10 @@ _No tracker connected, skip step._
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
-   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
    ```
 
    ```bash
@@ -201,7 +202,7 @@ _No tracker connected, skip step._
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -222,7 +223,7 @@ _No tracker connected, skip step._
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -235,8 +236,11 @@ _No tracker connected, skip step._
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -257,13 +261,13 @@ _No tracker connected, skip step._
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -329,7 +333,7 @@ _No tracker connected, skip step._
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -346,7 +350,7 @@ _No tracker connected, skip step._
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -368,7 +372,7 @@ _No tracker connected, skip step._
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -838,7 +842,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -946,7 +950,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1122,7 +1126,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 5cf68e0de..3189cb083 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -321,9 +321,9 @@ _No tracker connected, skip step._
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index eedddd51f..dcce7d4e8 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -97,7 +97,7 @@ autoCompactWindow: 300000
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index e5a66ec9f..fc8889021 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -107,8 +107,8 @@ autoCompactWindow: 300000
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.bkit/core/prompts/bkit-debug-failure-diagnose.md b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
index 6b8c0161c..b77b39448 100644
--- a/.bkit/core/prompts/bkit-debug-failure-diagnose.md
+++ b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
@@ -82,7 +82,7 @@ autoCompactWindow: 300000
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index f83dfa8da..1de89a9c4 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -63,6 +63,7 @@ description: "Build Feature — Autonomous implementation"
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -74,7 +75,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -164,7 +165,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -201,7 +202,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -228,7 +229,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -249,7 +250,7 @@ description: "Build Feature — Autonomous implementation"
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -262,8 +263,11 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -284,13 +288,13 @@ description: "Build Feature — Autonomous implementation"
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -356,7 +360,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -373,7 +377,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -395,7 +399,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -923,7 +927,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -1031,7 +1035,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1207,7 +1211,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index bb0a869c9..0acf815de 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -401,9 +401,9 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write the human's words to `{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-{Q}.md` with the file tool, then write the answer:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-{Q}.md" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 7c484a2a9..ef15c68bc 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -318,3 +318,4 @@
 {"schema":3,"ts":1795048730100,"kind":"friction","key":"steps-finish/build-plan-tests","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tests"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tests with exit 11: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` \"raise at a terminal shows the old and new ceilings and writes only after the typed confirmation\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"67cb59cf9074dbfdb6708a1459980365de68b54f"},"recurrenceCount":3,"lastConfirmed":1795048730100}
 {"schema":3,"ts":1795066179396,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":10,"lastConfirmed":1795066179396}
 {"schema":3,"ts":1795066775086,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":34,"lastConfirmed":1795066775086}
+{"schema":3,"ts":1795070831728,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":35,"lastConfirmed":1795070831728}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 8b17f46de..6a7bf2e0b 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1155,7 +1155,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:511`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:515`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1252,7 +1252,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:511`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:515`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -4465,6 +4465,10 @@ Set `Strategy` in **Create** with `Edit` to the `Strategy` value from Context. T
 - carriers: prompt `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-diagnose`
 
 ```text
+**If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this {{scope}}.
+```
+
+```retired
 **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this {{scope}}; they override the strategy's default angle.
 ```
 
@@ -10108,7 +10112,6 @@ Run Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `val
 Run Step 11 sub-steps 2 and 5. The merge finds its tasks already in the plan, writes nothing and prints the round's open tasks.
 Hold `fixTasks` as `CHALLENGE_TASKS`.
 NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
-Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
 **If** `gateRerun` = true → the **Gate rerun** steps below.
 **Else** → **Decision Pause** step 3.
 **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -10129,7 +10132,6 @@ Go to **Decision Pause**.
 Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
 **If** `GATE_VERDICT` = FAIL → also set `PAUSE_LOOP` = `holistic`, so the pause asks the loop question about the red gate.
 Go to **Decision Pause**.
-**Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 [secrets; workflow-pushes] List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout).
 **If** `PUBLISH` = false **or** `PUBLISH` is not held yet → keep the record in the worktree, linked by branch, and NEVER pass `--push`, because a held run pushes nothing and neither does a failure before `status route` resolves `publish`:
@@ -10152,10 +10154,8 @@ Title each item with its task number, when it has one, followed by its `Location
 **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
 One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
 Offer only the file's options for each question; NEVER add one.
-**If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix per `problem`, re-run the commands above once; a second exit 6 → **Failure Path**.
 **If** exit 4 **and** `RUNTIME_HEADLESS` = true → **Failure Path** naming each printed `hardBlockers` question.
 **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
@@ -10174,14 +10174,16 @@ Route — first match wins:
 Clear `PAUSE_LOOP`. **If** `From: verify`, `From: holistic` **or** `From: tests` → the owner chose to go on, so give that loop one more full allowance when its limit is used up. Below the limit, or with `ask` = false, the command grants nothing and exits 1; both exits go on:
 **If** `From: holistic` → count the allowance over the run's holistic fix rounds:
 Route — first match wins:
+Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+**If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
+**Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
 **If** the owner says stop, **or** answers `Stop` → step 8.
 **If** the loop question is answered `Try again` → step 6. The items then need no decision.
 **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
 Record the wait with the `owner-pause` block above.
 End the turn and wait for the answers.
 Apply each decision:
-**If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
 [recommend-do-not-decide; major-changes] **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
 **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
 Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -10194,7 +10196,6 @@ Append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.m
 **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
 **Fix now**:
 Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-**If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
 **If** the item is a challenge task → rewrite that task in place to the owner's direction:
 Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
 Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -10211,11 +10212,6 @@ Place it:
 A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
 Then check the plan:
 **If** exit non-zero → **Failure Path** naming each problem in the report.
-Write the decisions into the decision file:
-Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 [commits] **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 **If** `From: challenge` **and** either an item was answered `Fix now` **or** a task of `CHALLENGE_TASKS` was not an item:
 `DECISION_ROUTE` = `fix`.
@@ -10260,7 +10256,7 @@ No-progress holistic round routed
 **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
 **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
 **If** `DECISION_ROUTE` = `summary` → Step 15.
-[workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+[workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
 [workflow-pushes] **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
 [workflow-pushes] **Else** → push the record, but NEVER onto a branch with an open PR:
 Release the lock. NEVER run `workflows fail`:
@@ -10269,7 +10265,6 @@ Red gate checked against the base commit (`tests base`); counts written (`decisi
 Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 Hard blockers asked in a session, or sent to the Failure Path when headless
 Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 Resolve the repo, the branch and how far the branch is behind `dev`:
 **If** `open` > 0 → **Failure Path** naming the open `blockers`.
 **If** exit 80:
@@ -10442,6 +10437,13 @@ Labels re-read before the close commit
 Lock released
 PR created
 **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
+**If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+**If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+**If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+**If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
+Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
 Changed planned tests asked once, or none left
 Read the takeover group whose tests are not recorded yet:
@@ -10798,7 +10800,6 @@ Then `Recommended: none — only you can accept it`, then `Default if unanswered
 End the message with the line `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`
 Then record the wait → end turn → wait for answers:
 Record each reply before anything else, then write each answer. `{FILE}` and `{Q}` = the entry's `file` and `q`. "yes" answers no question here:
-**If** the answer is `Confirm` → write it:
 **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
 **Else** → ask again once the other entries are written → record the wait (step 2) → end turn.
 Write a `needs-decision` deferral for every item still not confirmed:
@@ -10897,6 +10898,7 @@ Hold the same route, reason, verdict, failures and state as the gh-backed result
 Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
 Guarded cleanup and retained paths/refs reported, back in the repo root
 **If** `state` = MERGED → record the resume marker → Step 11:
+**If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
 **If** `state` = MERGED → Step 11.
 **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
@@ -11301,8 +11303,8 @@ Log each integration gap as one gap: append `INTEGRATION: {what does not work to
 A gap you leave `Fixable: false` is a `FAIL`.
 For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
 `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-**If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+**If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
 **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
 **If** the task is not satisfied, or its work is missing:
 Leave it off that line, and append its log entry.
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 3c615b3f8..8bd186d57 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -156,7 +156,7 @@ These blocks have the same name and the same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Antigravity, Cursor); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"\|"held"` (last end row; `held` = the last `workflow-done` row says `ending: held`; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` while a `build-decision-*.md`'s computed `Status` is `OPEN`, read across the decision file and its `-engine.md` sibling, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind, or the `engine-call` / `completeness` rows the engine journals after a terminator, which add to `afterEnd` and `scan.rows` with no rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"\|"held"` (last end row; `held` = the last `workflow-done` row says `ending: held`; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` while a `build-decision-*.md`'s computed `Status` is `OPEN`, read from the decision file's `decision-counts` and `decision-answer` rows, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind, or the `engine-call` / `completeness` rows the engine journals after a terminator, which add to `afterEnd` and `scan.rows` with no rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index cded7cafc..2180b3bb2 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -425,7 +425,7 @@ Every template under `docs/templates/bkit-audit-*.md`:
 
 ## Hook-injected text
 
-Hooks add text to an agent's context mid-run. The text reaches every agent and subagent, and no frontmatter opts out of it. The canonical wording lives in the engine file. Per-host delivery → `.bkit/providers.md` § Guardrails, § GateGuard, § ReadGuard.
+Hooks add text to an agent's context mid-run. The text reaches every agent and subagent, and no frontmatter opts out of it. The canonical wording lives in the engine source. Per-host delivery → `.bkit/providers.md` § Guardrails, § GateGuard, § ReadGuard.
 
 <!-- prettier-ignore -->
 | Hook | Fires on | Injects | Hosts | Canonical text |
diff --git a/.bkit/version b/.bkit/version
index 6310bc6df..5744eca3a 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -12,18 +12,18 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "023c394a82a09e02bd7cc28affba340720bfc193807366b1d560e189d542b560",
-    ".claude/commands/bkit-build.md": "28ce810f30e51410f8273e624699dee896a279931d68d34a3298f1a0c4bd0416",
+    ".claude/commands/bkit-build.md": "f3e05826002147f182e03a83d98e742e03e990dccc31f91d373e1cefadd64421",
     ".claude/commands/bkit-debug.md": "0a808196dd61fdbcca0252ad6b1c9b4a8e1581e7cce38f21f130b80f83be1ef9",
     ".claude/commands/bkit-design.md": "48f04d5ec7015ba1a03f7b4664316207db87a2183359d9f6476f74bc1fcef8da",
     ".claude/commands/bkit-plan.md": "55167e19e60a97557c514dd348a42282e4b9cab710442480b689af33ba2b3a06",
-    ".claude/commands/bkit-ship.md": "b0202b4b9c123f753a0f1cf46647ee00c05aae49b7453722c4fb4543d9543f79",
+    ".claude/commands/bkit-ship.md": "8b82119382bb8bcf01f4a9952aeddee985473226c0c7cf613287e8a34373c1ea",
     ".claude/agents/bkit-build-challenge-1.md": "4eab91762fe2fb690892ae75af9e0439a4a4520c5a4071d3839bee1829a2b173",
     ".claude/agents/bkit-build-challenge-2.md": "6f7b896b717f2cc234ea47ede17e985c75b0b8e95e2c96a9e34913c9384a82ca",
     ".claude/agents/bkit-build-install-skills.md": "6d65634076820e9c41d3764e27c8fe495f7fc496e893af83835af7781b529a7e",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "c6fb912547205622a62e819a01ed2515e5551b7f0a26ae4b643db9aff16020b0",
-    ".claude/agents/bkit-build-plan-verify.md": "bfcb5107c8f4220451a66ef2006acae607186a9f9c0b241c6b6fea552877ec41",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "8193f160b146314bdfdda228673ef04b5ff49163908135a03d3329ac3ff3e5cc",
+    ".claude/agents/bkit-build-plan-verify.md": "ac3be690f9b1154b9bcea72348d9538e2d4986892de9f314db49434c04ff23ec",
     ".claude/agents/bkit-debug-abort-handover.md": "0de66f3470ced53b9ba6bb56da0555adaf92474c63dcb652bb58d7a7d5ef51c8",
-    ".claude/agents/bkit-debug-failure-diagnose.md": "3cf2e6260e817d4fc640917d49690132f7b6a9cd385c0d2566ec6b0e38c91503",
+    ".claude/agents/bkit-debug-failure-diagnose.md": "7f7f7e8eb0708059bd5470bf8216f2340e88208f9fcb49b48878b2a1d0d6d8fd",
     ".claude/agents/bkit-debug-failure-remediate.md": "27d739ed3cd20c46109888763247c5f92a5c7ccc284995af7e746ad22ce373a8",
     ".claude/agents/bkit-debug-failure-soak.md": "a2472d4d652413e5da8e57e5eee34a965bca817f58b06b50c2ac98c097837ade",
     ".claude/agents/bkit-design-brainstorm-ideate-1.md": "41501d3af0206a60bfaa4360ed3b9908ae5bf615275490dc2e85576ca876b2f7",
@@ -44,18 +44,18 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "215bd415eed342587ed2af5c15de381cf58831f461ff8d7bcea76cb0dfd88728",
-    ".cursor/commands/bkit-build.md": "624c7ca248e6a4d5babd69e29ad278c868b037c3bfd3770652c516bb2ee5305a",
+    ".cursor/commands/bkit-build.md": "c772e6af0aa5fcfdc88ee510350be68ffa4d7ac872651c84e1c99f0fd78dceb9",
     ".cursor/commands/bkit-debug.md": "ed050a7113411868edc1b8348642d116d72a1f021cc4034c2dddd7413720edac",
     ".cursor/commands/bkit-design.md": "8f907cd452dfbdd85992fcfe11208d819fc7c689ac0417fac65dcfbeacdc1a77",
     ".cursor/commands/bkit-plan.md": "552cd952eec3b8efec38d99cdb0f708e535692204c69374efd7885dee9519478",
-    ".cursor/commands/bkit-ship.md": "ad823bcd502fbdf2d5e3118ab71bc093f8d62caf876acc82557c0a57c1b4c39a",
+    ".cursor/commands/bkit-ship.md": "1a3b2d0a57029851ad22657043c01fb1f4a4f24c305fef2fd6537e4f6eae3ea6",
     ".cursor/agents/bkit-build-challenge-1.md": "c52a20530920be2bd1abb117ab5063070fe08302be6993a9bd28013ed55384ab",
     ".cursor/agents/bkit-build-challenge-2.md": "838c3337198af1a4186323a314af61569a2828eee625e1a0ce65a964b2e3a04a",
     ".cursor/agents/bkit-build-install-skills.md": "86c9dac72b0840286f969ec6220a3728445b58de76b1f760c4fdd34a9b8b7e03",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "433314a7e9aed78fca43414996dd79f7fd765d27f436563152c97526875b8ca6",
-    ".cursor/agents/bkit-build-plan-verify.md": "e9694b06ae1a3f18374092e10d7a47c5ea314b6963bf3e4dc238e2e487ff9fd2",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "f13267356dea5100da2bc6fec62a681b51a8fc06423c3b1043c18de2ed75d9ca",
+    ".cursor/agents/bkit-build-plan-verify.md": "8ea148da77acedecd3611fd276b7b4d3b4f66fcede4f603b9d720e5a478c0a0f",
     ".cursor/agents/bkit-debug-abort-handover.md": "9a5c4a70cdb863f6ace9e6141c5861bb904680c06d8a0339d2829e03b77f2eaa",
-    ".cursor/agents/bkit-debug-failure-diagnose.md": "c047f1a9cd68cbcb4a5bb8063cba6b64457fd7a78e2cf43c155410c162126ca6",
+    ".cursor/agents/bkit-debug-failure-diagnose.md": "633a462917ef7f7ba0fccfaf3e143154c351686d2621c19d907b7cffde87526f",
     ".cursor/agents/bkit-debug-failure-remediate.md": "17905b39b16758cfaca53957f81d0f39866e31c7d5542a18c004e25e09b72b71",
     ".cursor/agents/bkit-debug-failure-soak.md": "fd1e1cef18c0bda860fba404c67a57225393fa33907989f395e4cf0b535f806d",
     ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "9be980104bb1232894d245ce83d556350b30ed57e0d1deb8b57371fddc3039c9",
@@ -78,10 +78,10 @@
     ".opencode/agents/bkit-build-challenge-1.md": "5e4d9c17c28350a6fea9a082e0bf3592339da95240d3a40c66b7f6e98eef8e57",
     ".opencode/agents/bkit-build-challenge-2.md": "284c01e1027bee62bec34c10083746f323c1676932150121a6fbac8acd2a7225",
     ".opencode/agents/bkit-build-install-skills.md": "cec23f7f1631566848cc48274c23c5fd2291dce06badc753af7959aa29f73396",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b445f816f924a372de79057955b92dd97881888cf55e86b0edb91fc8a1b58924",
-    ".opencode/agents/bkit-build-plan-verify.md": "e9818ad349b983b42f995e33bf1a72d0f8bc7fb6e4b569243fd16beae150ae44",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "d496db4ef9f891d4ceda53152ae7bd1d6da893e117088315a92d508a3678fea3",
+    ".opencode/agents/bkit-build-plan-verify.md": "3ed4c05a7a54987292c53da51465864dd863e6c53474f14114594ae85c8683cb",
     ".opencode/agents/bkit-debug-abort-handover.md": "fe1e296b286fd10ce5b752e1181808bfae207662418692fd55a2f2f4dd3b2252",
-    ".opencode/agents/bkit-debug-failure-diagnose.md": "3b73e566da16f6b5e87b106237bb481a70070690ba7592a41ded190caaf2fda5",
+    ".opencode/agents/bkit-debug-failure-diagnose.md": "a766099e3fd9720cd00232ce41b7752d9656116704e4c0a54c0259c322212d02",
     ".opencode/agents/bkit-debug-failure-remediate.md": "7a91b13647d559cfa2ce04d609b199e74b0107a7beda229ef0c82c079490badc",
     ".opencode/agents/bkit-debug-failure-soak.md": "974d1ef31f5463d66e833176b096d3f593c8ccbe910e83d1993c18d13d5e6877",
     ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "9f2e665499e7d91a72537da02eb55b80d884dc2b9749c670aebf1b2c2c313d70",
@@ -102,11 +102,11 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "a4cc36d6b9e87eb9c9f54d7d8cc98ed5ca0ca2d1ccf77d4747b33dd165dc472e",
-    ".opencode/commands/bkit-build.md": "0b3f6814a90b5670da831cdae49aefb6a20416645a34138240dc3758ea3f7b15",
+    ".opencode/commands/bkit-build.md": "57670cda3dfb2a510ca273891b70443bb96ca8c5c56ef1d35d61eaedf7acc5bd",
     ".opencode/commands/bkit-debug.md": "b4b7172f01997e9d23284231aeab88a0cb3c2007c6b951406022f4d3c47f132f",
     ".opencode/commands/bkit-design.md": "70eb829aadd1af214ffd49f2d85eed4701f49dd024f8c5852942d22fdd3033ff",
     ".opencode/commands/bkit-plan.md": "bda719d95d06de358296810e6ca1b13242ad1d87ec362044b033edd8ad93a563",
-    ".opencode/commands/bkit-ship.md": "a24583ab9a135790a9ea8ea9c1df248467b5cebbcd50376bd58b632014b4b3b1",
+    ".opencode/commands/bkit-ship.md": "0398caf44b9f288354c805e8113786436297a9cab1c83a0ceab9201be9b80466",
     ".claude/agents/bkit-design-spike.md": "47fede25ba25470d49ba009832523698afe28740e4f18ec2772338054ab7cb92",
     ".cursor/agents/bkit-design-spike.md": "7808bfdb02322b6ea2f73f9a6fc6fdc7ad6f08fc662deb7a3f41a3e678f97532",
     ".opencode/agents/bkit-design-spike.md": "c8933f415cd3cadeb5721e47f5e900cebfa01a664a783fdfd2414bcbb363cfcb",
@@ -118,10 +118,10 @@
     ".codex/agents/bkit-build-challenge-2.toml": "608d16a0d7a78330ea0e0eee60fa3b19a5e90bf82143cbc35986244f75514a9c",
     ".codex/agents/bkit-build-install-skills.toml": "e77dfb5b30a0f7bc572b40d585dd62bb788741d3a8a88fd61b4faaf9ea84527b",
     ".codex/agents/bkit-build-plan-current.toml": "c1ba2d28ce54ed87a00bd1c780301714e7d1700aa26d529ff129c9458f331374",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "5f338992e7387211763794c675e9cf640587ec858f5e487b933eca97539b4fed",
-    ".codex/agents/bkit-build-plan-verify.toml": "13f6e5fb5ae5b84f1b0ad4a85342f0b408e19ee51ecd0ea056c552c48cd44068",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "26439cd2cfa21d94de1d4315bdb8e384bf5fbea6b1d351f11b45d6d32a9fef32",
+    ".codex/agents/bkit-build-plan-verify.toml": "a4f615b467d9d0d6dfef56a81aecac745f52771b1547a18e44ab3450f0ab4a0c",
     ".codex/agents/bkit-debug-abort-handover.toml": "56711c3d57a22f721e2eef59834b41e22873442b92429119cdcc9689672a86a6",
-    ".codex/agents/bkit-debug-failure-diagnose.toml": "2d08ab323cb0fd137713bf7f9f31297074cc06a4f91ba61eb65b2bbb22f84e12",
+    ".codex/agents/bkit-debug-failure-diagnose.toml": "74d1bb0de2c859d928bceb9645eaf7fe1c2bcdcb79f5631c03dab81d1300309d",
     ".codex/agents/bkit-debug-failure-remediate.toml": "68948a1a8c528b6c54e26dfb4b81a207c8866af448176b41e58dcb5cb8de95bd",
     ".codex/agents/bkit-debug-failure-soak.toml": "76238d330d181c8929e44dd127855d63382f26dea3a02a31fe700a1772b91e80",
     ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "2c0c0b518dc92aa040ad49b01ec6da5fc923dc8d4f745bdedd3b0988973bb17a",
@@ -207,11 +207,11 @@
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
     ".bkit/install.md": "6c04f482ce55a80b3922ed29a738422ad1b00557844f56d57edebd5db707f195",
-    ".bkit/jsonl.md": "0ba10f1459d5f5fe30099f32c920d71d818b66bafb58d29bd2eeb2ffa0ae9b76",
+    ".bkit/jsonl.md": "b10a5f19e423de03c302cf03af6af3f4c02e072b4fdc912e1c0910e9823e6ef7",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
-    ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
+    ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "bd2646091a9fc67172b734ef31c7222bec0e969cce84e250ab086f6ffbf67a6e",
+    ".bkit/workflows.md": "9b47d5fa7f0038a4748581e3991edc0135214dab3778ad32b480694c9c3a174f",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "8c2dcb975176313bc05f2b89437fc4a86712c5c9657d125045cf515ed2716e12",
+    ".bkit/cli.md": "56075741253ec795918718e9304065c7f88309478e62a052aebb62bba79a0bff",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 5de129faf..30cf9ac1c 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -300,6 +300,8 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, used-up merge limit). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
+| `decision-counts` | `{type, workflow, at, file, sourceChanged?, gate?, loop?, baseCheck?}` | The engine's counts for one decision file: `Source changed`, `Gate`, the base check and the loop question `Q1` with its progress numbers. Written only by `bkit decisions counts`; `bkit status row` refuses the type. Not folded; the decision readers take the row appended last for a file. |
+| `decision-answer` | `{type, workflow, at, file, q, answer, by, assumed?, rejected?, deferred?, fixTask?, reasonFile?, runtime?}` | One answer to question `q` of a decision file; `by` = `owner`, `headless`, `rerun` or `ship`. Written only by `bkit decisions apply` (and ship's deferrals); `bkit status row` refuses the type. Not folded; the row appended last for a question wins, and `bkit decisions answers` prints the result.
 | `run-commits` | `{type, workflow, at, startSha, commits, pushed}` | The commits a run in place on `dev` made, copied from its shared-checkout record: `startSha` = the record's start, `commits` = the run's commit ids, `pushed` = those already landed on `origin/dev` as replayed copies. `bkit workflows handover --push` writes one for a run that stays `IN_PROGRESS`, before it lands the handover, because the handover removes the record. It also parks the same start, commits and pushed list in this clone's git dir (`bkit/shared-checkout-parked/{fid}.json`). `bkit worktrees setup` rebuilds the record of the resumed run from the first of these that has one, and drops every commit id that is not an ancestor of `HEAD`: the parked copy, unless the checkout's `status.jsonl` shows the run closed; else the newest such row after the run's `workflow-started` in that log when it shows the run open; else the row on `origin/dev` when that copy shows the run open, which is the only source that fetches. A landed handover takes the row's line back out of the checkout, so the copy on `origin/dev` is a backup. Setup removes the parked copy once the record is rebuilt. Not folded; step minutes skip it. |
 | `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?, tested?, failedTests?, failedTestsTruncated?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. A tests-lock wait (exit 81) writes no row. Not folded, never a step's finish row. Step minutes skip it. |
 | `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. A command git launched (a hook, seen by `GIT_EXEC_PATH` in its environment) writes none, so a hook never leaves the tracked status file dirty after a commit. A command run while the run's repo has a rebase paused writes none either, because `git rebase --continue` refuses a tracked file with an unstaged change. Not folded; step minutes skip it. |
@@ -522,7 +524,7 @@ Each step posts its own fenced section as a fresh comment.
 | Disproven design spike claim | A passing design update addresses its design impact. Claims recorded under `Unsettled` remain concerns. |
 | Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
 | Failed group verification, group gate or holistic gate | A later passing holistic verification (verify) or a later passing Step 12 run (group gate, holistic gate), with 0 failures. |
-| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
+| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `fixTask` names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `fixTask`, or an unticked or unverified fix task keeps the FAIL. |
 | Failed diagnose or test-fix step (build Steps 13 and 14, debug Steps 6 and 7) | A later passing test run in the same run with 0 failures on the same scope as the run the step followed clears a failed test fix. A failed build diagnose step (build Step 13) it answers is reported as a concern (`{step} FAIL, tests passed since ({run})`), not cleared, so the verdict is CONCERNS. A scope that differs or is missing keeps the FAIL. A failed debug diagnose step (debug Step 6) or soak step (debug Step 8) is not cleared by a later pass. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
@@ -989,21 +991,21 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions counts --base-check=` words the engine's loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL`, `openDecision` `status` = `OPEN` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other `Gate: FAIL` pause (a `DECIDED` / `ASSUMED` file, which keeps the owner's route, a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
-- **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `Fix task:` line names. An `Accept` or `Accept (assumed)` item that already carries a `Decision:` line writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`, and step 6 adds a `Decision:` line only under an item that has none. A decided file a `build-decision` row names is not reopened, and `decisions counts` is unchanged.
-- **Record:** the orchestrator writes `build-decision-{RUN}-{K}.md` with the file tool, and `bkit decisions check` refuses a file without lettered options with effects, a Recommended and a Default if unanswered line per question (exit 6, the `problem` printed). `bkit decisions counts` writes the engine's numbers into the `build-decision-{RUN}-{K}-engine.md` sibling, never into the orchestrator's file, and a pause is open while the `Status` computed across both files is `OPEN`. Together the files hold: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `holistic` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line (`{n}` the rounds run, never above `{max}`: an `--attempt` above `--max` is the round the limit refused) and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); a `VERIFY_GAPS` item, verify or holistic, is titled `Task {N}` when its gap names a task, so the `tasks tick --decision` tick finds it; an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `fixTask` names. An item `bkit decisions answers` already lists as answered writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`. A decided file a `build-decision` row names is not reopened, and `decisions counts` is unchanged.
+- **Record:** the orchestrator writes `build-decision-{RUN}-{K}.md` with the file tool, and `bkit decisions check` refuses a file without lettered options with effects, a Recommended and a Default if unanswered line per question (exit 6, the `problem` printed). `bkit decisions counts` records the engine's numbers as a `decision-counts` row and every answer is a `decision-answer` row in `status.jsonl`, never a line in the orchestrator's file; a pause is open while the `Status` the rows give is `OPEN`. The file holds the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `holistic` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line (`{n}` the rounds run, never above `{max}`: an `--attempt` above `--max` is the round the limit refused) and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); a `VERIFY_GAPS` item, verify or holistic, is titled `Task {N}` when its gap names a task, so the `tasks tick --decision` tick finds it; an item answered `Fix now` also gets a `fixTask` on its `decision-answer` row, naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it. The owner's own words go in `Owner:` lines at the end of the file.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
 - **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason and the diff of its own lines since its baseline (`changed` carries `diff` and `additive`), options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. `Recommended: none — {why}`; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
-- **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
-- **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read the decision files' answers and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
+- **Accept (assumed):** taken without the owner — a `decision-answer` row with `assumed: true` (`by` `headless`, with the runtime and reason). Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets its task recorded with `decisions apply --fix-task`; an item whose row already has a `fixTask` reuses that task. Step 5 records it right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → a `Fix now` row with `by` `headless`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
 - **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic counts the run's fix rounds against `build.holistic`); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary|continue} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), the `tasks tick --decision` tick of the accepted gaps' tasks, made before the decision is recorded, then Step 11 (`continue` from a holistic pause, each task ticked in its own group) or Step 7 (`continue` from a verify pause), only when `bkit decisions skip` exits 0 on the decision file, Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
-- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`: each runs `bkit decisions answers --file=<the decision file>` and follows its output plus the file's `Owner:` lines, so the owner's words reach the next round (an answer whose `by` is not `owner` is not the owner's). Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 run `decisions answers` the same way. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
@@ -1135,7 +1137,7 @@ The following table describes the local discovery route and shared step mechanic
 | --- | --- | --- |
 | 1 — Start Workflow | — | Resolve `FID` (issue recovery as in design Step 1; issue-less: tracker reads, labels and comments skipped); `bkit runtime detect` → `RUNTIME_WORKTREES`; `bkit locks acquire` (main checkout; missing month bucket → current UTC month); straight after the lock, before any tracker write, `bkit worktrees setup --workflow=ship [--branch=] [--issue=]` resolves `SHIP_BRANCH` (see Branch eligibility), creates / resumes (no rebase) / adopts, writes the `.worktree-owned` marker to the outbox only for a worktree it created, and prints `branchWarning`; in the worktree `bkit status path` → `BOOK_ROOT`, `bkit workflows start --branch={SHIP_BRANCH}` refuses a checkout on another branch (exit 15, before any row), clears the stale `.deferred-blocked` / `.rebase-failed` sentinels and opens the run (its log lives in the worktree), `bkit runtime row` — so every later failure has a book to keep its record in; create `{OUTBOX}`; preflight `actions: write` once; set label `Ship`, `In Progress`. no commits on `dev`. |
 | 2 — Verify PR (Worktree Setup + Regression Guard) | — | Reconcile through `branches sync --reconcile-feature` before PR lookup, then plain-push the reconciled CI-running head. Setup and each reconciliation candidate refuse inherited unpublished dev commits. `prs probe --ship-entry` qualifies open/merged PRs against fresh feature evidence; no PR or extra work beyond a merged PR opens a new PR into dev. Scoped MCP facts pass through the same engine classifier. Record `ENTRY_HEAD`, then check the PR's CI. A safely qualified merged PR records `ship-merged-on-entry` and goes to Step 11. |
-| Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
+| Confirm Assumed Items | — | `bkit decisions pending` lists the build's assumed `Accept` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
 | 3 — Base Check | — | Reconcile and plain-push again on every integration retry before selecting `basePath`: A → Step 5; B → Step 4. `branches sync --feature-state` computes merge-aware coverage, excluding proven automatic dev-only merges and bookkeeping. New local or imported feature work invalidates prior sweep/docs coverage. A pending feature merge passes the engine's actual target to Step 4 and returns here after resolution. |
 | 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `branches sync --merge --target=<pinned target>` integrates dev locally, or continues the recorded feature merge. Existing mechanical settlement handles ledgers, lockfile, generated register, embedding docs and install record, then generation. Unresolved semantic paths remain in progress for the resolver, which verifies `MERGE_HEAD` equals the caller's target. Success plain-pushes, then returns to the recorded reconciliation step or Step 5. Other failures preserve/report the existing failure evidence. |
 | 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | Recompute feature coverage after integration, then compare the recorded successful `ship-feature-coverage` state and artifact before reuse; changed or missing state reruns the sweep. The sweep uses `branches scan-diff --disabled-tests` and `ledgers triage` for mechanical facts. PASS records the covered state; FAIL writes `.deferred-blocked` and stops before merge. Missing plans are warned and the ship input supplies intended outcomes. |
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index 8c80a9421..2840f9f5b 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -98,7 +98,7 @@ autoCompactWindow: 300000
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index 872cda30d..7a36c95e3 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -108,8 +108,8 @@ autoCompactWindow: 300000
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.claude/agents/bkit-debug-failure-diagnose.md b/.claude/agents/bkit-debug-failure-diagnose.md
index f66d231a8..9f5ef25c7 100644
--- a/.claude/agents/bkit-debug-failure-diagnose.md
+++ b/.claude/agents/bkit-debug-failure-diagnose.md
@@ -83,7 +83,7 @@ autoCompactWindow: 300000
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index dd6c6887d..d7729b470 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -64,6 +64,7 @@ description: "Build Feature — Autonomous implementation"
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -75,7 +76,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -145,7 +146,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -182,7 +183,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -209,7 +210,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -230,7 +231,7 @@ description: "Build Feature — Autonomous implementation"
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -243,8 +244,11 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -265,13 +269,13 @@ description: "Build Feature — Autonomous implementation"
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -337,7 +341,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -354,7 +358,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -376,7 +380,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -881,7 +885,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -989,7 +993,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1165,7 +1169,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `@bkit-debug-failure-diagnose` using `Agent` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 596329448..a89052e43 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -356,9 +356,9 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index 7139e851e..5afaf6f48 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -85,7 +85,7 @@ developer_instructions = """
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index 0b79fc395..3ce603320 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -95,8 +95,8 @@ developer_instructions = """
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.codex/agents/bkit-debug-failure-diagnose.toml b/.codex/agents/bkit-debug-failure-diagnose.toml
index 3e96bd50f..e79d73343 100644
--- a/.codex/agents/bkit-debug-failure-diagnose.toml
+++ b/.codex/agents/bkit-debug-failure-diagnose.toml
@@ -68,7 +68,7 @@ developer_instructions = """
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index d34a83c32..3340ad7b8 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -95,7 +95,7 @@ tools:
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index a62a4f8b5..0a283b941 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -105,8 +105,8 @@ tools:
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.cursor/agents/bkit-debug-failure-diagnose.md b/.cursor/agents/bkit-debug-failure-diagnose.md
index 42e2e3c51..db559a18d 100644
--- a/.cursor/agents/bkit-debug-failure-diagnose.md
+++ b/.cursor/agents/bkit-debug-failure-diagnose.md
@@ -80,7 +80,7 @@ tools:
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index c51373d87..134aa88be 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -63,6 +63,7 @@ Build Feature — Autonomous implementation
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -74,7 +75,7 @@ Build Feature — Autonomous implementation
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -144,7 +145,7 @@ Build Feature — Autonomous implementation
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -181,7 +182,7 @@ Build Feature — Autonomous implementation
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -208,7 +209,7 @@ Build Feature — Autonomous implementation
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -229,7 +230,7 @@ Build Feature — Autonomous implementation
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -242,8 +243,11 @@ Build Feature — Autonomous implementation
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -264,13 +268,13 @@ Build Feature — Autonomous implementation
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -336,7 +340,7 @@ Build Feature — Autonomous implementation
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -353,7 +357,7 @@ Build Feature — Autonomous implementation
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -375,7 +379,7 @@ Build Feature — Autonomous implementation
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -880,7 +884,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `Task` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -988,7 +992,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `Task` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1164,7 +1168,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `/bkit-debug-failure-diagnose` using `Task` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 102d8731e..2549cc429 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -355,9 +355,9 @@ Ship Feature — Autonomous merge and archive
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index 9438f246a..c21b5896a 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -96,7 +96,7 @@ tools:
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
    - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a correct fix must remove or rewrite lines of a planned test that a done task (`[x]` in the plan) owns → keep the `BLOCKED` line naming the test and why it no longer holds. The engine refuses the fix and adds a task that takes the test over and rewrites it. When you are asked again, put that test back as the tests step left it: the `BLOCKED` line does not keep it.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this round. An assumed accept is settled for this build (leave it); an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
    - **If** the gap suggests missing tests → implement them.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index fdc09f7ac..1968e53ac 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -106,8 +106,8 @@ tools:
    - A gap you leave `Fixable: false` is a `FAIL`.
 9. For each task, check that the codebase satisfies its `DONE WHEN` (a file exists, a signature matches, a test passes, a behaviour shows) and that the task has no test-first audit gap:
    - `BLOCKED` log lines, `docs/deferrals.jsonl` rows and out-of-scope notes never satisfy it.
-   - A gap that a supplied decision record accepts (`Decision: Accept` or `Decision: Accept (assumed)`) is no gap. Name the record in `Notes`.
-   - **If** the accept is `Decision: Accept (assumed)` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
+   - A gap that a supplied decision record accepts (per `bkit decisions answers --file=<the record>`) is no gap. Name the record in `Notes`.
+   - **If** it shows `assumed: true` → add `assumed, not the owner's acceptance` to that note, because an assumed accept is taken without the owner.
    - **If** the task is satisfied → name its number on the header's `Tasks` line. The workflow ticks the plan.
    - **If** the task is not satisfied, or its work is missing:
      - Leave it off that line, and append its log entry.
diff --git a/.opencode/agents/bkit-debug-failure-diagnose.md b/.opencode/agents/bkit-debug-failure-diagnose.md
index d2ab59ea5..aede9fe6a 100644
--- a/.opencode/agents/bkit-debug-failure-diagnose.md
+++ b/.opencode/agents/bkit-debug-failure-diagnose.md
@@ -81,7 +81,7 @@ tools:
      - Take a different angle, and do not repeat an earlier attempt word for word.
    - `FINAL` → Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - **If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.
-   - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this diagnosis; they override the strategy's default angle.
+   - **If** a decision record is supplied → run `bkit decisions answers --file=<it>`; its `by` = `owner` answers and the file's `Owner:` lines override the strategy's default angle in this diagnosis.
 6. Read the historical gotchas:
    - Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent; the engine does the fold, so run `bkit ledgers query --ledger=knowledge --status=ACTIVE` and follow `nextCursor` until it is null, then route on `coverage.status`: `missing` = the ledger has no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
    - Search those rows by symptom, error class or workflow step.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 2743b35e7..b0f75406c 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -67,6 +67,7 @@ $ARGUMENTS
        - Hold `fixTasks` as `CHALLENGE_TASKS`.
        - NEVER go on to Step 11 sub-step 6, because the open pause decides the route.
     4. Route on the `gateRerun` that `status resume` printed. It is true when the open pause only asks to try a red gate again:
+       - **If** `questions` = 0 → **Decision Pause** step 2, to `decisions check`.
        - **If** `gateRerun` = true → the **Gate rerun** steps below.
        - **Else** → **Decision Pause** step 3.
   - **Gate rerun:** Skip **Decision Pause** step 3 and re-run the gate, with no `counters grant`:
@@ -78,7 +79,7 @@ $ARGUMENTS
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading decision files (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines, and a `Fix now` direction from its task block. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -148,7 +149,7 @@ $ARGUMENTS
    ```
    Hold `value` as `DECISION`.
 2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
-   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write a `Source changed`, `Gate`, `Status`, `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line.
    - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
      ```
      **Q{n} — {title}:** {question}
@@ -185,7 +186,7 @@ $ARGUMENTS
 
    **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
 
-   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine records its counts as a `decision-counts` row in `{STATUS}` and prints the lines to show. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
    ```bash
    "{BKIT}" decisions counts --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
@@ -212,7 +213,7 @@ $ARGUMENTS
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - One message = the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
@@ -233,7 +234,7 @@ $ARGUMENTS
        - End the turn and wait for the answers.
      - **Else** → step 5.
 5. Apply each decision:
-   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item that already carries a `Decision:` line was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
+   - **If** the file is a reopened `DECIDED` / `ASSUMED` one → an item `"{BKIT}" decisions answers --file=…` lists as answered was applied in an earlier pass: write nothing already written — no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`; a plan tick already made stays.
    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
@@ -246,8 +247,11 @@ $ARGUMENTS
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
+     - **If** `decisions answers` already lists the item with a `fixTask` → reuse that task and write no second block. A resumed pause can reach this step twice.
+     - Right after the task block is written or rewritten, before `tests plan-check`, record `{N}`, the task that carries the fix:
+       ```bash
+       "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} --fix-task=Q{n}={N}
+       ```
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -268,13 +272,13 @@ $ARGUMENTS
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
        ```
        **If** exit non-zero → **Failure Path** naming each problem in the report.
-6. Write the decisions into the decision file:
-   - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps its line.
-   - Under each `Fix now` item, add the `Fix task: {N}` line if still missing after step 5.
-   - Loop answer, owner's words written to `build-owner-reason-{RUN}-{DECISION}.md` with the file tool:
-     ```bash
-     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason-file="docs/plans/{YYYYMM}/logs/{FID}/build-owner-reason-{RUN}-{DECISION}.md"
-     ```
+6. Write the decisions through the engine. **If** the owner answered a question → one call naming every answered question not recorded at step 5 (`Q1` = the loop question on a loop pause, answered `Try again`, `Decide` or `Stop`; else the first item):
+
+   ```bash
+   "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --answer=Q{n}={letter} [--answer=Q{n}={letter} …]
+   ```
+
+   **If** it exits non-zero → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line `> `-quoted, to the decision file with the file tool.
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -340,7 +344,7 @@ $ARGUMENTS
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
+   Record the decision and its route. The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -357,7 +361,7 @@ $ARGUMENTS
    - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -379,7 +383,7 @@ $ARGUMENTS
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
+- [ ] Fix now tasks shaped to the owner's direction, each recorded with `--fix-task`, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
@@ -884,7 +888,7 @@ Run § Pending takeovers first.
    Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
    **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `subagent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE} --since-pass-of=build-group-gate-{GROUP},build-group-gate-{GROUP}-fix --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP}-fix --attempt={VERIFY_ATTEMPT}`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
 4. Finish. The command records the header's `Strategy`:
@@ -992,7 +996,7 @@ This step checks the whole feature against the plan after the last group, and ag
        Hold `verdict` as `GATE_VERDICT`.
 10. **Subagent:** Invoke `/bkit-build-plan-gaps-remediate` using `subagent` tool:
     Context: You are a subagent in the Build phase. `Mode`: `Holistic`, attempt `{HOLISTIC_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. **If** `GATE_VERDICT` = FAIL → add `Holistic gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --changed-since=feature-base --since-pass-of=build-holistic-gate,build-holistic-gate-fix --log="{OUTBOX}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-gate.log" --file="{STATUS}" --workflow=build --step=build-holistic-gate-fix --attempt={HOLISTIC_ATTEMPT}`. `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-holistic-gate-{RUN}-{HOLISTIC_ATTEMPT}.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
     Update: Source files.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`.
 11. Finish. The command records the header's `Strategy`:
@@ -1168,7 +1172,7 @@ This step checks the whole feature against the plan after the last group, and ag
    Hold `value` as `TEST_ATTEMPT`.
 2. **Subagent:** Invoke `/bkit-debug-failure-diagnose` using `subagent` tool:
    Context: You are a subagent in the Build Debug phase. Test failure during Build workflow. `Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
-   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present) + `-engine.md`.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-failure-diagnose-{TEST_ATTEMPT}.md`.
 3. Finish:
    ```bash
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 21da4914f..b0c77bd7a 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -359,9 +359,9 @@ $ARGUMENTS
    "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=owner-answer >/dev/null || exit 1
    ```
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels. Route per entry:
-   - **If** the answer is `Confirm` → write it:
+   - **If** the answer is `Confirm` → write the human's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` (`{ENTRY}` = its position in the list), then:
      ```bash
-     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason="{human's words}" --root="{WORKTREE_PATH}"
+     "{BKIT}" decisions apply --by=owner --file="{WORKTREE_PATH}/{FILE}" --q={Q} --confirm --reason-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md" --root="{WORKTREE_PATH}"
      ```
      **If** `decisions apply` exits non-zero → **Failure Path**.
    - **If** the answer is `Reject` → the same command and exit check with `--reject` in place of `--confirm`.
diff --git a/docs/testing.md b/docs/testing.md
index aa27084f8..ec20cc2d1 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -941,7 +941,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/commands/workflow/context.test.ts` | Unit | Untrusted-content fence: identical at every workflow write site, no second fence from shipped fetch blocks, `Context:` names untrusted `Read:` paths. |
 | `.bkit/core/engine/commands/conventions.test.ts` | Unit | `bkit <noun> <verb>` conventions over `commands/registry.ts`: kebab nouns / verbs / flags, camelCase output keys, own exit codes in 3-79, every exit code a source can return (its `EXIT_*` constants and exit-code maps) listed in some verb's `--help` table, every exported command present in `COMMANDS`, every source in `commands/{workflow,ci,setup}/` tested and writing only via `ctx.log` / `ctx.emit`, every `shared/*.ts` tested; checker negative controls (including a help check that fails). |
 | `commands/lib.test.ts` | Unit (boundary: real temp git repo + linked worktree) | Flag parsing and usage errors (a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2), the `invocation-context/` folder is `0700` whether created or found, dispatch and classic-verb collision (`bkit status`), help rendering, exit-code mapping, UTC month, skip-CI tokens, repo root from a worktree, `status.jsonl` location per workflow kind, the active run a call is journaled under (`--fid` never matches another feature's run, and finds its own run from an earlier month); the tests-lock status file (`readLockStatus`, `classifyLockOutcome`): a give-up or refusal is read from the file and the exit code alone, a reworded script sentence changes nothing, and an absent, empty or other-lock file reads as a gate result. |
-| `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta / resume` (debug's resume prints Step 3's test round as `counters derive` and `status route` read it, exit 4 past Step 3 with none): location per workflow kind, active-run verdict / failures, the step's last `parentSha` and `source` per group, all-runs strategy, `nextStrategy` / `repeatTests` from repeated failing tests on the fix step's test step, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3; `route --workflow=build` publish: the `publish=true\|false` token over `publish.local`, `local` read on LOCAL, `false` coerced to `true` on any other runtime, an unknown token value falling through to config, and `publishSource` (`token` / `local` / `remote` / `coerced`); `route --step` prints no `cleanBase` field; `status resume` `gateRerun` true (with `rerunFrom` the `From` header, `holistic` included) only for the active run's `OPEN` `Gate: FAIL` pause whose loop question is its only undecided question (the pause may be laid out in two files), false when another question is undecided, the pause is closed or no run is active. |
+| `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta / resume` (debug's resume prints Step 3's test round as `counters derive` and `status route` read it, exit 4 past Step 3 with none): location per workflow kind, active-run verdict / failures, the step's last `parentSha` and `source` per group, all-runs strategy, `nextStrategy` / `repeatTests` from repeated failing tests on the fix step's test step, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3; `route --workflow=build` publish: the `publish=true\|false` token over `publish.local`, `local` read on LOCAL, `false` coerced to `true` on any other runtime, an unknown token value falling through to config, and `publishSource` (`token` / `local` / `remote` / `coerced`); `route --step` prints no `cleanBase` field; The engine-only row types `decision-counts` and `decision-answer` are refused by `status row`; `status resume` `gateRerun` true (with `rerunFrom` the `From` header, `holistic` included) only for the active run's `OPEN` `Gate: FAIL` pause whose loop question is its only undecided question (the pause may be laid out in two files), false when another question is undecided, the pause is closed or no run is active. |
 | `commands/workflow/counters.test.ts` | Unit | `bkit counters derive / run / route / max`: the three positions, `current` refusing 0, active-run scoping, group isolation (empty `--group` rejected), `--all-runs`, de-dupe, metacharacter step names, run numbering incl. resume + interleave (a resumed build after an interleaved debug run keeps its run and budget), fail-closed value / max (max 0: value 0 continues, value 1 routes to `exceeded`), `--point` (limit and `ask`, `max --point`), `route --of=<step>:<pos>` deriving the value (group scoped, `current` with no own row → exit 4), `route --of=<step>,<step>:count` summing several steps (off `:count`, repeated or empty entry → exit 2), `--of` plus `--rows` summed; holistic fix rounds counted within the run with no reset after a clean check (`build.holistic`, falling back to the current `package.json` setting when the run's frozen limits lack it); `--since-clean` refused on `route` and `grant` as an unknown flag (exit 2). |
 | `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. |
 | `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `bkit runtime detect / row / assert` — see § Runtime detection. |
@@ -953,14 +953,14 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/junit.test.ts` | Unit | `reportFailures`: the failing cases of a JUnit report, `[]` for a clean report, null with no report. |
 | `commands/workflow/tests-base.integration.test.ts` | Integration (real git, real subprocess) | `bkit tests base`: the local run at the base commit in a worktree, CI evidence at the base sha, the run's mode and install setting. |
 | `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`; `--changed-since=<sha>` runs `bkit:gate:changed` on the files changed since that commit (the resolved gate whole when it is undeclared; no changed file → PASS row, nothing run; a sha naming no commit → exit 2; a lock wait read from the status file → exit 81, no row; exit 75 with no status file → a gate failure; a deleted file runs the gate on the files that mention it, a failed search runs it whole; `--changed-since=feature-base`; `--since-pass-of` measures from the newest passing run's `tested` snapshot, falling back to `--changed-since`). A `--file` row records its `tested` snapshot; a FAIL row records `failedTests` (at most 100, `failedTestsTruncated` when cut); a CI evidence row lists each failed job as `job:{name}`. A passing run of the exact required push gate records a push-gate receipt for HEAD (uncommitted changes inside the min-push paths are tolerated, any other uncommitted change records none), a failing run leaves the `.failed` marker, a lock wait or a gate other than the required push gate records none. `bkit tests plan-check`: the group and task blocks, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, the matrix header exactly `Test description \| Type \| Target file \| Task` and a row per test-bearing task (a header with a missing, extra or reordered column or no closing pipe, a row without exactly 4 cells or with anything but task numbers in its `Task` cell, an unmapped row, two tasks, an undefined task and a test-bearing task with no row each refused), the caps from `bkit.workflows.tasks`, symbol existence skipped on a ticked task, the change-issue form example accepted. `bkit tests red` / `green`: the named test decides, never the exit code alone; one red row per group run with a state and blob per planned test, a test an earlier row proved red skipped while its file is unchanged; green merges the group's rows per test, prints `verdict` and a `fixable` per gap, an empty `gaps` on a clean plan, and folds a multi-line failure message onto its gap line so a `## ` line never ends the `## Gaps` section. Takeovers: `plan-check` lists `takeovers` (a later task naming an earlier task's test, a suite-path name matched on its last segment); the red records `from` and `taken-over`; green lists `takenOver` with its diff, never a gap or `unproven`. `plan-check --ledger-rows`: a key on the `**Ledger rows:**` line with no row on disk is refused and named, a missing or unfilled line is refused, a plan whose keys all have a decision or deferral row passes, and the line stays unchecked without the flag. |
-| `commands/workflow/tasks.test.ts` | Unit (boundary: real temp git repo for `currency`) | `bkit tasks tick / open / currency`: `tick` marks only the named group tasks, refuses another group's task, a plan with no task blocks, a non-number and a missing file, narrows the group by `--tasks`, reads `--green` gaps only from the report's `## Gaps` section (a task listed only under `## Updated tests` or `## Already landed` is ticked; an empty section ticks every named task; a report with no `## Gaps` heading, or fewer gap lines than its `Gaps: N` header, exits 2 and ticks nothing), treats `--tasks=none` (the verify header's empty form) as nothing to tick, `--decision` ticks only the task each `Accept` / `Accept (assumed)` item names at the start of its title (`Task {N}`, any case; a title that only mentions a task and a `Fix now` item's task stay open), still refuses an unknown or other-group `--tasks` number, refuses a file with no or another `From`, a `Gate: FAIL` header, or a verify `Group` that is missing or not `--group`, and ticks a `From: holistic` file's accepted tasks in their own groups without `--group` (twice ticks nothing new), leaves every other plan line byte-identical, idempotent on a ticked task; `open` lists each task holding neither a `DONE` nor a `BLOCKED` line and sets `handover` only when one is open; `currency` matches a task on a moved symbol, emits no hunk outside the matched set, judges `{base}...{against}`, exits 0 with no match, refuses a plan with no task blocks. |
-| `commands/workflow/decisions.test.ts` | Unit (boundary: real temp git repo) | `bkit decisions check / counts / apply / skip / pending` (`check` refuses an orchestrator file without lettered options, a Recommended or a Default line, exit 6; `counts` writes the `-engine.md` sibling; `apply` writes Decision lines into it): `skip` exits 0 with `route: continue` only for a `From: verify` / `holistic` pause whose items are all `Accept` / `Accept (assumed)`, whose loop question is `Decide`, with no `Gate: FAIL` header and `Source changed: false`; exit 1 names the first failing fact (`From`, an item not `Accept`, the loop question, `Gate: FAIL`, a missing `Source changed`), exit 2 for a missing file; `pending` refuses a `--fid` that is not a lowercase slug (exit 2); a holistic limit pause given `--attempt` above `--max` prints the rounds run (`attempt 2 of 2`), never above max. |
-| `commands/workflow/open-decision.test.ts` | Unit | The decision-file readers: `decisionHeader` reads the header block only, `parseDecisionItems` each item's number, title and answer, `optionAnswer` a letter reply; one reader merges a decision file with its `-engine.md` sibling (computed `Status`); `gateRerun` true only for an open red-gate pause whose one undecided question is the loop question; `skipProblem` null when all five conditions hold, else the first failing fact |
+| `commands/workflow/tasks.test.ts` | Unit (boundary: real temp git repo for `currency`) | `bkit tasks tick / open / currency`: `tick` marks only the named group tasks, refuses another group's task, a plan with no task blocks, a non-number and a missing file, narrows the group by `--tasks`, reads `--green` gaps only from the report's `## Gaps` section (a task listed only under `## Updated tests` or `## Already landed` is ticked; an empty section ticks every named task; a report with no `## Gaps` heading, or fewer gap lines than its `Gaps: N` header, exits 2 and ticks nothing), treats `--tasks=none` (the verify header's empty form) as nothing to tick, `--decision` ticks only the task each item with an `Accept` or assumed `Accept` row names at the start of its title (`Task {N}`, any case; a title that only mentions a task and a `Fix now` item's task stay open), still refuses an unknown or other-group `--tasks` number, refuses a file with no or another `From`, a `Gate: FAIL` header, or a verify `Group` that is missing or not `--group`, and ticks a `From: holistic` file's accepted tasks in their own groups without `--group` (twice ticks nothing new), leaves every other plan line byte-identical, idempotent on a ticked task; `open` lists each task holding neither a `DONE` nor a `BLOCKED` line and sets `handover` only when one is open; `currency` matches a task on a moved symbol, emits no hunk outside the matched set, judges `{base}...{against}`, exits 0 with no match, refuses a plan with no task blocks. |
+| `commands/workflow/decisions.test.ts` | Unit (boundary: real temp git repo) | `bkit decisions check / counts / apply / answers / skip / pending` (`check` refuses an orchestrator file without lettered options, a Recommended or a Default line, exit 6, and a `Decision`, `Fix task`, `Rejected` or `Deferred` line; `counts` appends a `decision-counts` row to the `status.jsonl` beside the file; `apply` appends `decision-answer` rows and never edits the decision file; `answers` prints the row appended last for each question, its `by` and flags and writes nothing): `skip` exits 0 with `route: continue` only for a `From: verify` / `holistic` pause whose items are all `Accept` / `Accept (assumed)`, whose loop question is `Decide`, with no `Gate: FAIL` header and `Source changed: false`; exit 1 names the first failing fact (`From`, an item not `Accept`, the loop question, `Gate: FAIL`, a missing `Source changed`), exit 2 for a missing file; `pending` refuses a `--fid` that is not a lowercase slug (exit 2); a holistic limit pause given `--attempt` above `--max` prints the rounds run (`attempt 2 of 2`), never above max. |
+| `commands/workflow/open-decision.test.ts` | Unit | The decision-file readers: `decisionHeader` reads the header block only, `parseDecisionItems` each item's number, title and answer, `optionAnswer` a letter reply; one reader folds a decision file's `decision-counts` and `decision-answer` rows (the row appended last for a question wins, computed `Status`; a file with no readable question reads `OPEN` with `questions` 0); `gateRerun` true only for an open red-gate pause whose one undecided question is the loop question; `skipProblem` null when all five conditions hold, else the first failing fact |
 | `commands/workflow/loops.test.ts` | Unit | The build fix loops: `loopGateStep` per group for a grouped loop, `fixTestStep` for each fix step (the gate, else the check; debug's diagnose gives `debug-run-tests`), `gatedCheckStep` only for a loop with a gate |
 | `commands/workflow/plan-blocks.test.ts` | Unit (no file-system access) | `parsePlanBlocks`: group and task order, one `TEST FIRST` test per sub-bullet, `DEPENDS ON` bare numbers, CRLF plans read like LF, markers inside a fence ignored, a fence line with an info string, an unclosed fence, the file-only form, a repeated field keeping the first, task-like text outside a block, TASK 0 and GROUP 0, duplicate task numbers, mismatched markers; `reuseInventory`, `outOfScope` and `derivedTestMatrix` read the table under their own heading, never a later section's. |
 | `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`; a structured finding whose `title`, `cls`, `doneWhen` or a `tests` entry holds a line break refused naming the finding and field. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live and refused with exit 8 and `heldBy`, a taken lock prints `heldBy` null; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's; `acquire` prints `route` `go` with an empty `message` when it takes the lock, `route` `stop` with a `message` naming the holder on a live one, and nothing on stdout when the month bucket is split. |
-| `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one; the run's summary counts an assumed item that sits in an engine file once. |
+| `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one; the run's summary counts an assumed item once; the error and stderr files a failure commits have tokens, home paths and database passwords scrubbed. |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints; design / plan / build run in place in the main checkout on `feat/{FID}` under `--worktrees` exit 7 with no log directory), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. `remove --branch` still removes the worktree and deletes the local and remote branch when a later `dev` commit changed the branch's file. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
 | `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. `notOnDev` keeps a landed branch landed after a later `dev` commit on its file, names only the file whose branch version never reached `dev`, and counts a file the branch deleted as landed when `dev` deleted it and a later commit re-added it. |
@@ -979,7 +979,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/ci/ci.test.ts` | Unit + real `slop-scan` | `bkit ci slop`: net-finding / net-score gate, net-new / worsened findings named (line-shift pairs dropped), base resolution (`--base`, bare argument, `$SLOP_BASE_REF`, merge-base fallbacks, skip when absent or HEAD), slop-scan could-not-run vs failed, base worktree removed on SIGTERM. `bkit ci prose` (fake vale): glob selection, vale exit mapping, fail when Vale/styles are unavailable; skip a valid empty file selection, write-good restore from the main worktree else `vale sync`. `bkit ci skip-token`: token in subject or body, `--ref`, unreadable commit. `bkit ci min-push`: the floor (`docs/plans/**`, `docs/audits/**`, `minPushPaths`, `ciSkipPaths`), every `--ref` checked, and the audit-template exception: accepted only when the text through `<!-- bkit:end -->` is unchanged; a new, deleted or renamed template, a second marker, `bkit-plan.md` or a nested template is refused; `--update` logs an accepted template once. |
 | `commands/setup/setup.test.ts` | Unit (stub `gh`) | `bkit setup protect-main`: policy payload requiring `bkit.testing.ciCapstone`, pre-flight on the CI workflow and job name, `--dry-run`, `--print`, unauthenticated vs missing `gh`. |
 | `.bkit/core/engine/shared/settings.test.ts`, `json.test.ts`, `package-json.test.ts`, `package-manager.test.ts`, `timeouts.test.ts`, `egress.test.ts`, `branches.test.ts` | Unit | `package.json` `bkit` settings with per-key defaults (`testing.ciWorkflow`, `testing.ciCapstone`, `testing.ciGenerated` and `ciGeneratedSteps` = `CI_GENERATED_FLOOR` plus the key, `workflows.worktree.copy` / `install`, ask points (`ask` and limit per point, bad values falling back), tracker, board, required lanes, OpenCode providers, cloud variant, dependency-updater opt-out, which of tracker / cloud variant were explicitly set, an unknown tracker value kept as written); `package.json` edits; `parseJson` / `readJsonFile` (not JSON, a missing file and a directory all give `{ ok: false }`, never a throw); the installing-version reader (`readInstallingVersion`: the package's own version, and a throw naming the file when `package.json` is missing, not a JSON object, or lacks a non-empty string `version`); package-manager commands and could-not-run codes; the `TIMEOUTS` table; egress registry shape (bare lowercase hostnames, no duplicates, provider key placeholders); shared-branch rule (`isSharedBranch` true for `dev` / `main` only, false for look-alikes and the empty string); `workflows.build.publish` (default `true`, an explicit `local: false`, `remote: false` coerced to `true`, every invalid key listed, a non-object block reported). |
-| `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 prompt file + `fids parse --prompt-file` + `fids resolve` + gated FID / lock in every phase workflow, `status resume` Resume and build's `openDecision` (a red gate re-run taken from `gateRerun` and `rerunFrom`, with no `GATE_RERUN` in `bkit-build.md`), build Decision Pause `Fix now` (a challenge task rewritten in place to the owner's direction, a hard blocker with no direction asked again, each item's `Fix task:` line written before `tests plan-check`, no second acceptance on a reopened `DECIDED` / `ASSUMED` pause, a verify or holistic pause routed `continue` ahead of the re-runs only through `decisions skip` (holistic through `tasks tick --decision` without `--group` before the decision row, then Step 11; verify through `tasks tick --decision` before the decision row, a non-zero exit to the Failure Path, then Step 7; both `VERIFY_GAPS` lists titling items `Task {N}`), the **Owner decisions** contract naming the task block), ship `fids plans`, plan `fids design` with files, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file` to `{workflow}-error.md` in the log folder, stderr file limited to the last 20 lines, no heredoc in any prompt or workflow, no `{OUTBOX}/*-result.json`, `--result-file`, `decision-items.json` or `decisions compose`), design / plan / build / debug keep the record through one `handover --push --worktree="{WORKTREE_PATH}"` skipped without a worktree, and ship `--flush`, build and debug gate logs written by `tests run --artifact` with failures from the engine's count, the committed test log and Step 13 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, each holding `repeatTests` and passing `Repeat tests` to its agent, with the gaps-remediate and failure-diagnose prompts applying `PIVOT` and `FINAL` to `Repeat tests` only, auto's single `runs context`, a fresh `context diff` file written right before each agent that reads the diff, debug Step 1 decided by one `status route --prompt-file`, ship `runs gate --squash-of` / `branches sync-dev` / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush` removing the worktree then returning to `{REPO_ROOT}`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait, issue-less runs (no Step 1 STOP on a missing issue, the true-block `fids parse` Route with its exit 3 STOP for a non-slug branch, the `base.ref` = `dev` assert on every MCP merge fallback, every issue-tied call behind `**Skip if** ISSUE_ID empty`, `fids resolve` / `steps gate` carrying `--issue`, kill-switch checks skipped) and debug on `dev` (`{BASE_FLAG}` on every `context diff` and non-marker `branches scan-diff` line, `--base={startSha}` in place on dev and empty otherwise, the no-leak scan taking `{NOLEAK_BASE}` (`--base={startSha}` in place on dev, else `--base=origin/dev`), the build migration scan and the ship `context diff` lines passing `--base=origin/dev`, no push in Steps 9 / 10, the `EXIT_FOREIGN_PATH` stop-and-ask); plan's single review round (two reviewers + scope check), `tests plan-check --existence=refuse` after every plan-writing step, no workflow naming a removed plan flag; build Branch Sync merging its docs, Plan Convert checking the plan, converting one with no task markers and checking again, Step 7 taking the next group's brief, Step 8 verifying the group's own diff; build Step 10 routing a red holistic gate to the holistic fix round with a `Holistic gate` Context line, a holistic pause with a red gate asking the loop question and never routing `continue`, the Decision Pause reading the holistic gate log for the base check, and no `cleanBase` or `HOLISTIC_BASE`; build Step 11 running `challenge gate` before the reviewers; build publish ending (`publish` resolved through `status route`, re-derived on resume, the non-LOCAL coercion warning, a held close skipping push / PR / CI and appending the held roadmap row, the `publish=true` close path kept, Gate 15 conditional, only the close gate on the held path, no push on a held or pre-publish Failure Path and Decision Pause). |
+| `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 prompt file + `fids parse --prompt-file` + `fids resolve` + gated FID / lock in every phase workflow, `status resume` Resume and build's `openDecision` (a red gate re-run taken from `gateRerun` and `rerunFrom`, with no `GATE_RERUN` in `bkit-build.md`), build Decision Pause `Fix now` (a challenge task rewritten in place to the owner's direction, a hard blocker with no direction asked again, each `Fix now` item's `--fix-task` recorded before `tests plan-check`, `bkit-build` recording owner answers with one `decisions apply` call and routing a resumed pause with no question to `decisions check`, no workflow naming the engine decision file or the build reason file or passing the owner's words in `--reason`, no second acceptance on a reopened `DECIDED` / `ASSUMED` pause, a verify or holistic pause routed `continue` ahead of the re-runs only through `decisions skip` (holistic through `tasks tick --decision` without `--group` before the decision row, then Step 11; verify through `tasks tick --decision` before the decision row, a non-zero exit to the Failure Path, then Step 7; both `VERIFY_GAPS` lists titling items `Task {N}`), the **Owner decisions** contract naming the task block), ship `fids plans`, plan `fids design` with files, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file` to `{workflow}-error.md` in the log folder, stderr file limited to the last 20 lines, no heredoc in any prompt or workflow, no `{OUTBOX}/*-result.json`, `--result-file`, `decision-items.json` or `decisions compose`), design / plan / build / debug keep the record through one `handover --push --worktree="{WORKTREE_PATH}"` skipped without a worktree, and ship `--flush`, build and debug gate logs written by `tests run --artifact` with failures from the engine's count, the committed test log and Step 13 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, each holding `repeatTests` and passing `Repeat tests` to its agent, with the gaps-remediate and failure-diagnose prompts applying `PIVOT` and `FINAL` to `Repeat tests` only, auto's single `runs context`, a fresh `context diff` file written right before each agent that reads the diff, debug Step 1 decided by one `status route --prompt-file`, ship `runs gate --squash-of` / `branches sync-dev` / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush` removing the worktree then returning to `{REPO_ROOT}`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait, issue-less runs (no Step 1 STOP on a missing issue, the true-block `fids parse` Route with its exit 3 STOP for a non-slug branch, the `base.ref` = `dev` assert on every MCP merge fallback, every issue-tied call behind `**Skip if** ISSUE_ID empty`, `fids resolve` / `steps gate` carrying `--issue`, kill-switch checks skipped) and debug on `dev` (`{BASE_FLAG}` on every `context diff` and non-marker `branches scan-diff` line, `--base={startSha}` in place on dev and empty otherwise, the no-leak scan taking `{NOLEAK_BASE}` (`--base={startSha}` in place on dev, else `--base=origin/dev`), the build migration scan and the ship `context diff` lines passing `--base=origin/dev`, no push in Steps 9 / 10, the `EXIT_FOREIGN_PATH` stop-and-ask); plan's single review round (two reviewers + scope check), `tests plan-check --existence=refuse` after every plan-writing step, no workflow naming a removed plan flag; build Branch Sync merging its docs, Plan Convert checking the plan, converting one with no task markers and checking again, Step 7 taking the next group's brief, Step 8 verifying the group's own diff; build Step 10 routing a red holistic gate to the holistic fix round with a `Holistic gate` Context line, a holistic pause with a red gate asking the loop question and never routing `continue`, the Decision Pause reading the holistic gate log for the base check, and no `cleanBase` or `HOLISTIC_BASE`; build Step 11 running `challenge gate` before the reviewers; build publish ending (`publish` resolved through `status route`, re-derived on resume, the non-LOCAL coercion warning, a held close skipping push / PR / CI and appending the held roadmap row, the `publish=true` close path kept, Gate 15 conditional, only the close gate on the held path, no push on a held or pre-publish Failure Path and Decision Pause). |
 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | Unit (markdown-invariant) | Local gates in workflows and prompts: a build close push retry that repeats no `workflows close`, no toolchain command inlined, every call site dispatching through a gate install seeds, workflows running gates only through `bkit tests run`, every `tests run`, `bkit tests changed` and `branches push` site (a Context command included) re-run on exit 81, the deepest declared gate tried first; only the migration scan names `origin/dev`; Step 8's group gate and the remediate `Group gate` command testing from `GROUP_BASE` (re-derived first) and `--since-pass-of` the group gate and its fix run, the fix command writing `build-group-gate-{GROUP}-fix` rows; Step 10's holistic gate on every round from `--since-pass-of=build-holistic-gate,build-holistic-gate-fix` with `--changed-since=feature-base`, the `Holistic gate` command writing `build-holistic-gate-fix` rows, the holistic verifier running no tests and taking no `Test base`, the holistic remediate prompt running the `Holistic gate` command until exit 0 and again on exit 81; the soak prompt running the changed-files gate. |
 | `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts` | Unit (real `bash` / `zsh`) | Every fenced shell block in `.bkit/core/workflows/*.md`, placeholders replaced, parses under `bash -n` and `zsh -n` (zsh half skipped when zsh is absent). |
 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | Unit (YAML via the `yaml` devDependency; `tests/fixtures/gh/` stub) | The template `bkit-ci.yml`, placeholders filled, parses as YAML with the capstone needing every other job, passes actionlint (skipped when absent); `bkit runs gate` finds the capstone among the template's job names and refuses when it fails; in both the repo and the template workflow, `Check Capability Register` runs on `pull_request` (no event filter on its step or job `if:`, `pull_request` in `on:`). |
@@ -988,7 +988,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/audits/templates/templates-content.test.ts` | Unit | Template `bkit-ci.yml` content guards (no private-repo auth, `[verbose ci]` knob, promotion-lag step, injection-safe PR title) and the parsed capstone `if: ${{ !cancelled() }}` and the concurrency group / default-branch queueing. No whole-file snapshot. |
 | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | Unit | No workflow, prompt or `.bkit/instructions.md` clause text names a template path. The forbidden names come from `.bkit/templates/` itself (its CI workflow files, `scripts/` folders) plus `.husky/`, `.vale*`, `lintstagedrc.example.json`, `prettierignore.example`, `slop-scan.config.json` and `.envrc`, so a new template is covered without editing the test. |
 | `.bkit/core/engine/audits/templates/template-shape.test.ts` | Unit | Every doc template opens with `<!-- bkit:start -->`, the managed marker, then its `<!-- Note: … -->`; the plan template holds no agent instruction (no `CRITICAL`, `**Agent:**`, `**Rules:**` or standing `NEVER` / `ALWAYS` / `MUST` / `ONLY` outside that note) and keeps its headings in order plus the lines `ledgers.ts` and `tests.ts` parse; no audit template keeps a rule `bkit-audit-generate` now carries, and each keeps `Step 1 — Previous Run` with its `Done when`; only `bkit-build-plan-tasks` says not to stop for permission at gates; no plan prompt defers a rule to the template; each audit template's Findings table carries Title and Key columns. |
-| `.bkit/core/engine/commands/workflow/audit-report.test.ts` | Unit | `parseAuditReport` reads IDs, severities, titles and keys from an audit report's Findings table; a row with an unknown key or an empty severity is refused, naming its ID. |
+| `.bkit/core/engine/commands/workflow/audit-report.test.ts` | Unit | `parseAuditReport` reads IDs, severities, titles and keys from an audit report's Findings table; a row with an unknown key or an empty severity is refused, naming its ID; an `Evidence` cell with a backslash is read, a lone short `None` row means no finding, and a `Location` that is not `path:line` is refused, naming its ID. |
 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | Unit | Verdict vocabulary across workflows and prompts: every `steps finish` pair reads the right agent's artifact, held verdicts are compared only against values their agent can emit, enum unions are written one way (`PASS\|CONCERNS\|FAIL`), verdict variable names match their step, each prompt header declares its `Failures` count rule, and judgment fields are header lines. |
 | `.bkit/core/engine/tools/cli-doc.test.ts` | Unit | `.bkit/core/.bkit/cli.md` generated region equal to a fresh render of `CLASSIC_VERB_HELP` and `commands/registry.ts` (run `pnpm cli:sync`); every `CLASSIC_VERBS` verb listed once; a row with its `use` per command verb; `—` in empty cells; pipes escaped in cells; only line-anchored markers bound the region; missing markers throw. |
 | `.bkit/core/engine/tools/grammar-density.test.ts` | Unit | `pnpm grammar:density` counting (`a` / `an` / `the` per 1,000 words, fence marker lines dropped, `text` block lines per section, added lines of a zero-context diff) and the floor on canonical shared text: `clauses` >= 20, `rules` >= 16. |
diff --git a/scripts/gate/bkit-text-ceiling.json b/scripts/gate/bkit-text-ceiling.json
index af0ac4537..a5eb3d228 100644
--- a/scripts/gate/bkit-text-ceiling.json
+++ b/scripts/gate/bkit-text-ceiling.json
@@ -1,10 +1,10 @@
 {
   "prompts": {
-    "ceiling": 83844,
+    "ceiling": 83837,
     "reason": "initial baseline for #1028"
   },
   "workflows": {
-    "ceiling": 57996,
+    "ceiling": 57987,
     "reason": "initial baseline for #1028"
   }
 }
