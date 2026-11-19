diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 75774ab13..733b4c86f 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -56,7 +56,7 @@ description: "Build Feature — Autonomous implementation"
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -76,7 +76,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -145,7 +145,19 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -163,27 +175,25 @@ description: "Build Feature — Autonomous implementation"
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -200,8 +210,8 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -216,7 +226,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -235,7 +245,7 @@ description: "Build Feature — Autonomous implementation"
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -243,14 +253,14 @@ description: "Build Feature — Autonomous implementation"
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -259,8 +269,10 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -275,7 +287,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -326,7 +338,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -338,12 +350,12 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -361,14 +373,11 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 9b29798db..6e67264b7 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -56,7 +56,7 @@ description: "Build Feature — Autonomous implementation"
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -76,7 +76,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -145,7 +145,19 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -163,27 +175,25 @@ description: "Build Feature — Autonomous implementation"
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -200,8 +210,8 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -216,7 +226,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -235,7 +245,7 @@ description: "Build Feature — Autonomous implementation"
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -243,14 +253,14 @@ description: "Build Feature — Autonomous implementation"
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -259,8 +269,10 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -275,7 +287,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -326,7 +338,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -338,12 +350,12 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -361,14 +373,11 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 6bae60110..f8e3bead4 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -167,13 +167,14 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 
 ### `decisions`
 
-Build decision files: write questions, apply recommendations, list assumed items.
+Build decision files: check the orchestrator's questions, write the engine's counts, apply recommendations, list assumed items.
 
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write a decision file in the one question layout, with loop progress when asked. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--reason` `--root` | Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item. |
+| `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
+| `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 5af40b56c..dadafd4cd 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -167,13 +167,14 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 
 ### `decisions`
 
-Build decision files: write questions, apply recommendations, list assumed items.
+Build decision files: check the orchestrator's questions, write the engine's counts, apply recommendations, list assumed items.
 
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write a decision file in the one question layout, with loop progress when asked. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--reason` `--root` | Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item. |
+| `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
+| `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/engine/audits/workflows/question-option-format.test.ts b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 7d44348f1..adf98cab1 100644
--- a/.bkit/core/engine/audits/workflows/question-option-format.test.ts
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -265,7 +265,7 @@ function ownerConfirmViolations(file: string, text: string): string[] {
     "**Else** → ask again",
   ];
   return steps(text)
-    .filter(({ lines }) => lines.some((l) => l.includes(OWNER_APPLY)))
+    .filter(({ lines }) => lines.some((l) => l.includes(OWNER_APPLY) && !l.includes("--answer=")))
     .flatMap(({ no, lines }) =>
       want
         .filter((part) => !lines.join("\n").includes(part))
@@ -682,8 +682,8 @@ describe("question option format: the build Decision Pause in the shared shape",
 
   it("bkit-build: every decision item option carries an effect", () => {
     const step = numberedStep(pause(), 2);
-    expect(step).toContain('{"name", "effect"}');
-    expect(step).toContain(STOP_EFFECT);
+    expect(step).toContain("A) {name} — {what happens if the owner picks it}");
+    expect(step).toContain("`Stop` = `the run stops and hands over; the next run resumes here`");
     expect(step, "a bare-string option list is still named").not.toMatch(/\["Accept", "Fix now"/);
   });
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 5201ea502..21c4e0d86 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -143,6 +143,13 @@ describe("engine calls", () => {
     expect({ prompts, workflows }).toEqual({ prompts: [], workflows: [] });
   });
 
+  it("no workflow names decision-items.json or decisions compose", () => {
+    const naming = ALL.filter((name) =>
+      /decision-items\.json|decisions compose/.test(workflow(name)),
+    );
+    expect(naming).toEqual([]);
+  });
+
   it("the steps finish re-ask passes the printed problem", () => {
     const asks = ALL.flatMap((name) =>
       workflow(name)
@@ -929,18 +936,17 @@ describe("build", () => {
     expect(green[0]).toContain("--group={GROUP}");
   });
 
-  it("the Decision Pause checks a red gate against the base commit before composing", () => {
+  it("the Decision Pause checks a red gate against the base commit before counting", () => {
     const pause = section(build, /Decision Pause/);
     const base = commandLines(pause, "tests base");
     expect(base).toHaveLength(1);
     expect(base[0]).toContain("tests base --log=");
-    const compose = commandLines(pause, "decisions compose");
-    expect(compose).toHaveLength(1);
-    expect(compose[0]).toContain("{BASE_FLAGS}");
-    expect(pause.indexOf("tests base --log=")).toBeLessThan(pause.indexOf("decisions compose"));
+    const counts = commandLines(pause, "decisions counts");
+    expect(counts).toHaveLength(1);
+    expect(counts[0]).toContain("{COUNT_FLAGS}");
+    expect(pause.indexOf("tests base --log=")).toBeLessThan(pause.indexOf("decisions counts"));
     expect(pause).toContain("GATE_LOG");
     expect(pause).toContain("--base-check");
-    expect(pause).toContain("Gate=FAIL");
     // The check runs only for a red-gate or TESTS_LOOP pause, and a failed check is a Failure Path.
     expect(pause).toMatch(
       /`GATE_VERDICT` = FAIL[^\n]*`TESTS_LOOP`|`TESTS_LOOP`[^\n]*`GATE_VERDICT` = FAIL/,
@@ -975,7 +981,7 @@ describe("build", () => {
     // Step 10 sets no route of its own; the pause's continue route is the engine's.
     expect(step10).not.toContain("`DECISION_ROUTE`");
     const pause = section(build, /Decision Pause/);
-    expect(pause).toMatch(/\{BASE_FLAGS\}` = `--header=Gate=FAIL` when the base check ran/);
+    expect(pause).toMatch(/--base-check="\{OUTBOX\}\/base-check\.json"` \(base check ran\)/);
     expect(pause).toMatch(/decisions skip[\s\S]*exit 0 → `DECISION_ROUTE` = `continue`/);
   });
 
@@ -2641,7 +2647,7 @@ describe("build Decision Pause continue route", () => {
   it("continue sends holistic to Step 11 and verify to the decision tick then Step 7", () => {
     const routes = continueRoutes(pause()).join("\n");
     expect(routes).toMatch(/holistic[^\n]*Step 11/);
-    expect(routes).toMatch(/verify[^\n]*"\{BKIT\}" tasks tick[^\n]*--decision=[^\n]*Step 7/);
+    expect(routes).toMatch(/verify[^\n]*tasks tick[^\n]*Step 7/);
   });
 
   it("the continue decision tick runs before the build-decision row is recorded", () => {
@@ -2676,10 +2682,10 @@ describe("build Decision Pause continue route", () => {
 
   it("a verify or holistic decision file records Source changed and a resume holds it", () => {
     const text = pause().replace(/\\\n\s*/g, " ");
-    expect(text).toContain('--header="Source changed={SOURCE_CHANGED}"');
+    expect(text).toContain("--source-changed={SOURCE_CHANGED}");
     const headerLines = text
       .split("\n")
-      .filter((l) => l.includes('--header="Source changed={SOURCE_CHANGED}"'));
+      .filter((l) => l.includes("--source-changed={SOURCE_CHANGED}"));
     expect(headerLines.join("\n")).toMatch(/verify/);
     expect(headerLines.join("\n")).toMatch(/holistic/);
     const resume = bulletBlock(workflow("build"), "Resume");
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index 887ee16ac..82e2627f8 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -28,7 +28,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit, type CommandSpec } from "../lib.js";
 import { EXIT_BASE, diffNumstat, type DiffStat } from "./context.js";
 import { defaultRange } from "./feature-base.js";
-import { parseDecisionItems } from "./open-decision.js";
+import { decisionItems, isEngineFile } from "./open-decision.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks, type PlanTaskBlock, testTier } from "./plan-blocks.js";
 import { readBkitConfig, type TaskCaps } from "../../shared/settings.js";
@@ -229,10 +229,13 @@ export function mergeFindings(
 export function acceptedLocations(logDir: string, cwd: string): Set<string> {
   const out = new Set<string>();
   const files = fs.existsSync(logDir)
-    ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f))
+    ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
     : [];
   for (const file of files) {
-    const items = parseDecisionItems(fs.readFileSync(path.join(logDir, file), "utf-8"));
+    const items = decisionItems((rel) => {
+      const abs = path.join(logDir, rel);
+      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+    }, file);
     for (const item of items) {
       if (!/^Accept\b/.test(item.decision ?? "")) continue;
       // `path:line`, the path with or without an extension (`src/a.ts:10`, `Makefile:12`).
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 2812a43ec..e75d0de1b 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -8,7 +8,7 @@ import { afterEach, describe, expect, it } from "vitest";
 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
 import { applyRecommendations, EXIT_HARD_BLOCKERS } from "./decisions";
-import { decisionHeader, parseDecisionItems } from "./open-decision";
+import { decisionHeader, decisionItems, parseDecisionItems } from "./open-decision";
 
 const dirs: string[] = [];
 const runtimeBefore = process.env.BKIT_RUNTIME;
@@ -72,930 +72,44 @@ const BLOCKER = {
   noRecommendation: "only the owner can waive test-first",
 };
 
-async function compose(root: string, logs: string, items: unknown[], ...extra: string[]) {
-  const itemsFile = path.join(root, "items.json");
-  fs.writeFileSync(itemsFile, JSON.stringify(items));
-  const out = path.join(logs, "build-decision-1-1.md");
-  const r = await run(
-    [
-      "decisions",
-      "compose",
-      `--out=${out}`,
-      "--header=Question=CHALLENGE",
-      "--header=From=challenge",
-      `--items=${itemsFile}`,
-      ...extra,
-    ],
-    root,
-  );
-  return { r, out };
-}
-
-describe("bkit decisions compose", () => {
-  it("writes the header, one item per question and the reply line", async () => {
-    const { root, logs } = checkout();
-    const { r, out } = await compose(root, logs, [...ITEMS, BLOCKER]);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ questions: 3, loopRecommended: null });
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text.split("\n").slice(0, 3)).toEqual([
-      "Status: OPEN",
-      "Question: CHALLENGE",
-      "From: challenge",
-    ]);
-    expect(text).toContain(
-      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
-    );
-    expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
-    expect(text).toContain("Recommended: none — only the owner can waive test-first");
-    expect(text).toContain("A) Accept — the item is recorded as accepted");
-    expect(text).not.toContain("Options:");
-    expect(text).toContain("Default if unanswered:");
-  });
-
-  it("compose letters every option and the recommended one", async () => {
-    const { root, logs } = checkout();
-    const { out } = await compose(root, logs, [ITEMS[1]]);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("A) Accept — the item is recorded as accepted\n");
-    expect(text).toContain("B) Fix now — a fix task is added to the plan\n");
-    expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
-    expect(text).not.toContain("Options:");
-  });
-
-  it("composeItems still folds line breaks to one space", async () => {
-    const { root, logs } = checkout();
-    const folded = {
-      ...ITEMS[0],
-      title: "Task 3\r\n[src/a.ts:10]",
-      question: "MEDIUM: the retry\n\nhas no cap. Accept it?",
-      options: [
-        { name: "Accept", effect: "the item is\nrecorded as accepted" },
-        { name: "Fix\nnow", effect: "a fix task is added to the plan" },
-      ],
-      recommended: "Accept",
-    };
-    const { r, out } = await compose(root, logs, [folded]);
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain(
-      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?\n",
-    );
-    expect(text).toContain("A) Accept — the item is recorded as accepted\n");
-    expect(text).toContain("B) Fix now — a fix task is added to the plan\n");
-  });
-
-  it("refuses an item whose recommendation is not one of its options", async () => {
-    const { root, logs } = checkout();
-    const bad = [{ ...ITEMS[0], recommended: "Maybe" }];
-    expect((await compose(root, logs, bad)).r.code).toBe(2);
-  });
-
-  it("refuses an item with more options than letters", async () => {
-    const { root, logs } = checkout();
-    const options = Array.from({ length: 27 }, (_, i) => ({
-      name: `Option ${i + 1}`,
-      effect: `option ${i + 1} happens`,
-    }));
-    const bad = [{ ...ITEMS[0], options, recommended: "Option 27" }];
-    const { r } = await compose(root, logs, bad);
-    expect(r.code).toBe(2);
-    expect(r.err).toContain("at most 26 options");
-  });
-
-  it("round-trips the last lettered option through parseDecisionItems", async () => {
-    const { root, logs } = checkout();
-    const options = Array.from({ length: 26 }, (_, i) => ({
-      name: `Option ${i + 1}`,
-      effect: `option ${i + 1} happens`,
-    }));
-    const { r, out } = await compose(root, logs, [
-      { ...ITEMS[0], options, recommended: "Option 26" },
-    ]);
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Z) Option 26 — option 26 happens");
-    const item = parseDecisionItems(text)[0]!;
-    expect(item.options).toEqual(options.map((o) => o.name));
-    expect(item.recommended).toBe("Option 26");
-  });
-
-  const REPLY_LINE =
-    'Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.';
-  const ONE_BY_ONE = 'Or say "one by one" and I\'ll ask them one at a time.';
-
-  it("compose writes each option on its own line with its effect", async () => {
-    const { root, logs } = checkout();
-    const { r, out } = await compose(root, logs, [ITEMS[0]]);
-    expect(r.code).toBe(0);
-    const lines = fs.readFileSync(out, "utf-8").split("\n");
-    const q = lines.findIndex((l) => l.startsWith("**Q1 — "));
-    expect(lines[q + 1]).toBe("A) Accept — the item is recorded as accepted");
-    expect(lines[q + 2]).toBe("B) Fix now — a fix task is added to the plan");
-    expect(lines.some((l) => l.startsWith("Options:"))).toBe(false);
-  });
-
-  it("compose refuses an option without an effect", async () => {
-    for (const options of [
-      ["Accept", "Maybe"],
-      [{ name: "Accept", effect: "the item is recorded as accepted" }, { name: "Fix now" }],
-    ]) {
-      const { root, logs } = checkout();
-      const { r, out } = await compose(root, logs, [
-        { ...ITEMS[0], options, recommended: "Accept" },
-      ]);
-      expect(r.code).toBe(2);
-      expect(fs.existsSync(out)).toBe(false);
-    }
-  });
-
-  it("compose writes the default effect for a bare fixed option name", async () => {
-    const { root, logs } = checkout();
-    const { r, out } = await compose(root, logs, [
-      { ...ITEMS[0], options: ["Accept", "Stop"], recommended: "Accept" },
-    ]);
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("A) Accept — the item is recorded as accepted");
-    expect(text).toContain(
-      "B) Stop — the run ends here with a handover; the next run resumes here",
-    );
-  });
-
-  it("compose refuses an option name that contains a spaced dash", async () => {
-    const { root, logs } = checkout();
-    const options = [
-      { name: "Keep it — as is", effect: "nothing changes" },
-      { name: "Fix now", effect: "a fix task is added to the plan" },
-    ];
-    const { r, out } = await compose(root, logs, [
-      { ...ITEMS[0], options, recommended: "Fix now" },
-    ]);
-    expect(r.code).toBe(2);
-    expect(r.err).toContain("Keep it — as is");
-    expect(r.err).toContain("Q1");
-    expect(r.err).toMatch(/—|dash/);
-    expect(r.err).toMatch(/name/);
-    expect(fs.existsSync(out)).toBe(false);
-  });
-
-  it("compose writes a Default if unanswered line for each question", async () => {
-    const { root, logs } = checkout();
-    const { out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
-    const text = fs.readFileSync(out, "utf-8");
-    const [, q1, q2] = text.split(/^(?=\*\*Q\d+ — )/m);
-    expect(q1).toContain(
-      "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
-    );
-    expect(q2).toContain(
-      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
-    );
-  });
-
-  it("compose writes Recommended: none for a hard blocker", async () => {
-    const { root, logs } = checkout();
-    const { out } = await compose(root, logs, [BLOCKER]);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Recommended: none — only the owner can waive test-first");
-    expect(text).not.toContain("No recommendation");
-  });
-
-  it("compose ends with the shared reply line", async () => {
-    const { root, logs } = checkout();
-    const { out } = await compose(root, logs, ITEMS);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text.trimEnd().split("\n").at(-1)).toBe(REPLY_LINE);
-    expect(text).not.toContain("Reply per question.");
-  });
-
-  it("compose offers one by one from three questions on, not for two", async () => {
-    const { root, logs } = checkout();
-    const two = fs.readFileSync((await compose(root, logs, ITEMS)).out, "utf-8");
-    expect(two).not.toContain("one by one");
-    const three = fs.readFileSync((await compose(root, logs, [...ITEMS, BLOCKER])).out, "utf-8");
-    expect(three).toContain(REPLY_LINE);
-    expect(three.trimEnd().endsWith(ONE_BY_ONE)).toBe(true);
-  });
-
-  it("--loop writes an effect for each loop option", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        {
-          type: "step-done",
-          workflow: "build",
-          step: "build-plan-verify",
-          status: "DONE",
-          at: "2026-10-01T00:10:00Z",
-          group: 1,
-          failures: 2,
-        },
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { out } = await compose(root, logs, [], "--loop=verify", `--file=${status}`, "--group=1");
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("A) Try again — one more fix round runs");
-    expect(text).toContain(
-      "B) Stop — the run ends here with a handover; the next run resumes here",
-    );
-    expect(text).not.toContain("Options:");
-  });
-
-  it("round-trips an item with effects through parseDecisionItems", async () => {
-    const { root, logs } = checkout();
-    const { r, out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
-    expect(r.code).toBe(0);
-    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
-    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
-    expect(items[0]!.recommended).toBe("Fix now");
-    expect(items[0]!.reason).toBe("a secret reaches the log");
-    expect(items[1]!.options).toEqual(["Accept", "Fix now", "Stop"]);
-    expect(items[1]!.recommended).toBeNull();
-    expect(items[1]!.reason).toBe("only the owner can waive test-first");
-  });
-
-  it("--loop adds the attempt line, the progress block and the loop question as Q1", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verify = (at: string, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      failures,
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verify("2026-10-01T00:10:00Z", 4),
-        verify("2026-10-01T00:20:00Z", 4),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=2",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ questions: 3, loopRecommended: "Decide" });
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("build verify: attempt 2 of 2");
-    expect(text).toContain("Problems after each round: 4 → 4");
-    expect(text).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
-    expect(text).toContain("A) Try again — one more fix round runs");
-    expect(text).toContain("B) Decide — ");
-    expect(text).toContain("**Q2 — Task 3 [src/a.ts:10]:**");
-  });
-
-  it("--loop letters the loop question's options and recommendation", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        {
-          type: "step-done",
-          workflow: "build",
-          step: "build-plan-verify",
-          status: "DONE",
-          at: "2026-10-01T00:10:00Z",
-          group: 1,
-          failures: 2,
-        },
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-    );
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("A) Try again — one more fix round runs");
-    expect(text).toContain("B) Decide — ");
-    expect(text).not.toContain("Options:");
-    expect(text).toMatch(/Recommended: [AB]\) (Try again|Decide) — /);
-  });
-
-  it("--loop=holistic counts only the rounds since the whole-feature check was last clean", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const holistic = (at: string, verdict: string, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify-holistic",
-      status: "DONE",
-      at,
-      verdict,
-      failures,
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        holistic("2026-10-01T00:10:00Z", "FAIL", 5),
-        holistic("2026-10-01T00:20:00Z", "PASS", 0),
-        holistic("2026-10-01T00:30:00Z", "FAIL", 3),
-        holistic("2026-10-01T00:40:00Z", "FAIL", 3),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=holistic",
-      `--file=${status}`,
-      "--attempt=2",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("build holistic: attempt 2 of 2");
-    expect(text).toContain("Problems after each round: 3 → 3");
-    expect(text).toMatch(/\*\*Q1 — Holistic verify:\*\* decide the items below/);
-  });
-
-  it("--loop=holistic names build holistic in the attempt line", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    fs.writeFileSync(
-      status,
-      JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" }) +
-        "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=holistic",
-      `--file=${status}`,
-      "--attempt=2",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("build holistic: attempt 2 of 2");
-    expect(text).not.toContain("build verify: attempt");
-  });
-
-  it("holistic limit pause prints the rounds run, never above max", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    fs.writeFileSync(
-      status,
-      JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" }) +
-        "\n",
-    );
-    // `counters route ... :next` exits 1 with value = max + 1: the round the limit refused.
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=holistic",
-      `--file=${status}`,
-      "--attempt=3",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("build holistic: attempt 2 of 2");
-    expect(text).not.toContain("attempt 3 of 2");
-  });
-
-  it("prints the holistic gate's failing tests per round for the holistic loop", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verifyRow = (at: string, attempt: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify-holistic",
-      status: "DONE",
-      at,
-      attempt,
-      verdict: "PASS",
-      failures: 0,
-    });
-    const gateRow = (at: string, attempt: number) => ({
-      type: "test-run",
-      workflow: "build",
-      at,
-      step: "build-holistic-gate",
-      attempt,
-      run: 1,
-      verdict: "FAIL",
-      exitCode: 1,
-      failures: 3,
-      scope: "gate",
-      log: "x.log",
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verifyRow("2026-10-01T00:10:00Z", 1),
-        gateRow("2026-10-01T00:11:00Z", 1),
-        verifyRow("2026-10-01T00:30:00Z", 2),
-        gateRow("2026-10-01T00:31:00Z", 2),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(root, logs, ITEMS, "--loop=holistic", `--file=${status}`);
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Holistic gate failures after each round: 3 → 3");
-    expect(text).toContain("Problems after each round: 3 → 3");
-  });
-
-  it("prints the group gate's failing tests per round for the verify loop", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verifyRow = (at: string, attempt: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      attempt,
-      failures: 0,
-    });
-    const gateRow = (at: string, attempt: number) => ({
-      type: "test-run",
-      workflow: "build",
-      at,
-      step: "build-group-gate-1",
-      attempt,
-      run: 1,
-      verdict: "FAIL",
-      exitCode: 1,
-      failures: 3,
-      scope: "gate",
-      log: "x.log",
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        gateRow("2026-10-01T00:09:00Z", 1),
-        verifyRow("2026-10-01T00:10:00Z", 1),
-        gateRow("2026-10-01T00:29:00Z", 2),
-        verifyRow("2026-10-01T00:30:00Z", 2),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Group gate failures after each round: 3 → 3");
-    expect(text).toContain("Problems after each round: 3 → 3");
-  });
-
-  it("--loop=verify with an uncounted group gate reads unknown", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verifyRow = (at: string, attempt: number, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      attempt,
-      failures,
-    });
-    const gateRow = {
-      type: "test-run",
-      workflow: "build",
-      at: "2026-10-01T00:29:00Z",
-      step: "build-group-gate-1",
-      attempt: 2,
-      run: 1,
-      verdict: "FAIL",
-      exitCode: 1,
-      failures: null,
-      scope: "gate",
-      log: "x.log",
-    };
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verifyRow("2026-10-01T00:10:00Z", 1, 2),
-        gateRow,
-        verifyRow("2026-10-01T00:30:00Z", 2, 0),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      [],
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=2",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Trend: unknown");
-    expect(text).not.toContain("Trend: stuck");
-    expect(r.json.loopRecommended).not.toBe("Decide");
-    expect(r.json.loopRecommended).not.toBe("Stop");
-  });
-
-  /** An uncounted group gate after a counted verify round: the trend reads `unknown`. */
-  async function composeUnknownTrend() {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verifyRow = (at: string, attempt: number, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      attempt,
-      failures,
-    });
-    const gateRow = {
-      type: "test-run",
-      workflow: "build",
-      at: "2026-10-01T00:29:00Z",
-      step: "build-group-gate-1",
-      attempt: 2,
-      run: 1,
-      verdict: "FAIL",
-      exitCode: 1,
-      failures: null,
-      scope: "gate",
-      log: "x.log",
-    };
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verifyRow("2026-10-01T00:10:00Z", 1, 2),
-        gateRow,
-        verifyRow("2026-10-01T00:30:00Z", 2, 0),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      [],
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=2",
-      "--max=2",
-    );
-    expect(r.code).toBe(0);
-    return fs.readFileSync(out, "utf-8");
-  }
-
-  it("--loop on an unknown trend recommends Try again without claiming progress", async () => {
-    const text = await composeUnknownTrend();
-    expect(text).toContain("Trend: unknown");
-    expect(text).toMatch(/Recommended: (A\) )?Try again — /);
-    expect(text).not.toContain("the last round made progress");
-  });
-
-  it("--loop on an unknown trend says the limit is used up", async () => {
-    const text = await composeUnknownTrend();
-    expect(text).toContain("limit is used up");
-    expect(text).not.toContain("a round is left");
-  });
-
-  it("--loop=verify on an unknown trend below the limit does not say the limit is used up", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verifyRow = (at: string, attempt: number, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      attempt,
-      failures,
-    });
-    const gateRow = {
-      type: "test-run",
-      workflow: "build",
-      at: "2026-10-01T00:29:00Z",
-      step: "build-group-gate-1",
-      attempt: 1,
-      run: 1,
-      verdict: "FAIL",
-      exitCode: 1,
-      failures: null,
-      scope: "gate",
-      log: "x.log",
-    };
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verifyRow("2026-10-01T00:10:00Z", 1, 2),
-        gateRow,
-        verifyRow("2026-10-01T00:30:00Z", 2, 0),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      [],
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=1",
-      "--max=3",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toContain("Trend: unknown");
-    expect(text).not.toContain("the limit is used up");
-    expect(text).not.toContain("a round is left");
-  });
-
-  it("--loop states the engine's trendLine in Q1", async () => {
-    const { root, logs } = checkout();
-    const status = path.join(logs, "status.jsonl");
-    const verify = (at: string, failures: number) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      failures,
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verify("2026-10-01T00:10:00Z", 5),
-        verify("2026-10-01T00:20:00Z", 2),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    const { r, out } = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=2",
-      "--max=3",
-    );
-    expect(r.code).toBe(0);
-    const text = fs.readFileSync(out, "utf-8");
-    const q1 = text.slice(text.indexOf("**Q1"), text.indexOf("**Q2"));
-    expect(q1).toContain("(5 → 2)");
-  });
-
-  /** A verify loop stuck at 4 → 4, so the trend alone recommends `Decide` (`Stop` with no items). */
-  function stuckStatus(logs: string) {
-    const status = path.join(logs, "status.jsonl");
-    const verify = (at: string) => ({
-      type: "step-done",
-      workflow: "build",
-      step: "build-plan-verify",
-      status: "DONE",
-      at,
-      group: 1,
-      failures: 4,
-    });
-    fs.writeFileSync(
-      status,
-      [
-        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
-        verify("2026-10-01T00:10:00Z"),
-        verify("2026-10-01T00:20:00Z"),
-      ]
-        .map((x) => JSON.stringify(x))
-        .join("\n") + "\n",
-    );
-    return status;
-  }
-
-  const baseCheck = (over: Record<string, unknown>) => ({
-    verdict: "all",
-    reason: null,
-    base: "abc1234",
-    source: "local",
-    failing: 3,
-    baseRed: 3,
-    branch: 0,
-    undetermined: 0,
-    cases: [],
-    adopt: false,
-    ...over,
-  });
-
-  async function composeWithBase(
-    over: Record<string, unknown>,
-    items: unknown[],
-    opts: { raw?: string } = {},
-  ) {
-    const { root, logs } = checkout();
-    const status = stuckStatus(logs);
-    const baseFile = path.join(root, "base-check.json");
-    fs.writeFileSync(baseFile, opts.raw ?? JSON.stringify(baseCheck(over)));
-    const { r, out } = await compose(
-      root,
-      logs,
-      items,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      "--attempt=2",
-      "--max=2",
-      `--base-check=${baseFile}`,
-    );
-    return { r, text: fs.existsSync(out) ? fs.readFileSync(out, "utf-8") : "" };
-  }
-
-  it("base check all with no items recommends Stop", async () => {
-    const { r, text } = await composeWithBase({}, []);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
-    expect(text).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
-    expect(text).toContain("Fix `dev`, then resume.");
-  });
-
-  it("base check all with items recommends Decide", async () => {
-    const { r, text } = await composeWithBase({}, ITEMS);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
-    expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
-  });
-
-  it("base check all says a gate still red after resume comes from this branch", async () => {
-    const { r, text } = await composeWithBase({}, []);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
-    expect(text).toMatch(/still red after `dev` is fixed and the run resumed[^.]*this branch/);
-  });
-
-  it("base check all in adopt mode adds the merge sentence", async () => {
-    const adopt = await composeWithBase({ adopt: true }, []);
-    expect(adopt.text).toContain("merge `dev` into the branch before resuming");
-    const plain = await composeWithBase({ adopt: false }, []);
-    expect(plain.text).not.toContain("merge `dev` into the branch before resuming");
-  });
-
-  it("base check some names the split", async () => {
-    const { r, text } = await composeWithBase(
-      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
-      ITEMS,
-    );
-    expect(r.code).toBe(0);
-    expect(text).toContain("a round can fix 2 of 5");
-    expect(text).toContain("the build will still stop on the 3 from `dev`");
-    expect(text).toMatch(/Recommended: B\) Decide — a round can fix 2 of 5/);
-  });
-
-  it("base check some with undetermined cases counts only the branch's as fixable", async () => {
-    const { r, text } = await composeWithBase(
-      {
-        verdict: "some",
-        failing: 3,
-        baseRed: 1,
-        branch: 1,
-        undetermined: 1,
-        reason: "the base run crashed",
-      },
-      ITEMS,
-    );
-    expect(r.code).toBe(0);
-    expect(text).toContain("a round can fix 1 of 3");
-    expect(text).not.toContain("a round can fix 2 of 3");
-    expect(text).toContain("the build will still stop on the 1 from `dev`");
-    expect(text).toMatch(/1 could not be checked: the base run crashed/);
-  });
-
-  it("base check none keeps the trend and names the branch", async () => {
-    const { r, text } = await composeWithBase(
-      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
-      ITEMS,
-    );
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
-    expect(text).toMatch(/Recommended: B\) Decide — the failures come from this branch/);
-  });
-
-  it("base check unknown keeps the trend and says why", async () => {
-    const { r, text } = await composeWithBase(
-      {
-        verdict: "unknown",
-        reason: "no JUnit report",
-        base: null,
-        source: null,
-        baseRed: 0,
-      },
-      ITEMS,
-    );
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
-    expect(text).toMatch(/Recommended: B\) Decide — cause unknown: no JUnit report/);
-  });
-
-  it("Try again is offered for every base verdict", async () => {
-    const variants: Record<string, unknown>[] = [
-      { verdict: "all" },
-      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
-      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
-      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
-    ];
-    for (const over of variants) {
-      for (const items of [[], ITEMS]) {
-        const { text } = await composeWithBase(over, items);
-        expect(text, `${String(over.verdict)} with ${items.length} items`).toMatch(
-          /\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try again — [^\n]*\nB\) (Decide|Stop) — /,
-        );
-      }
-    }
-  });
-
-  it("base check prints how many failing tests are also red on base", async () => {
-    const all = await composeWithBase({}, []);
-    expect(all.text).toContain("Also red on base abc1234: 3 of 3 (local run)");
-    const unknown = await composeWithBase(
-      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
-      [],
-    );
-    expect(unknown.text).toContain("Also red on base unknown: can't tell (no JUnit report)");
-  });
-
-  it("a missing or malformed base check is a usage error that names the problem", async () => {
-    const { root, logs } = checkout();
-    const status = stuckStatus(logs);
-    const missing = await compose(
-      root,
-      logs,
-      ITEMS,
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
-      `--base-check=${path.join(root, "no-such-base.json")}`,
+/** An old-layout decision file (`Status` line, one file) holding `items`, written by hand. */
+interface FixtureItem {
+  title: string;
+  question: string;
+  options: Array<{ name: string; effect: string }>;
+  recommended?: string;
+  reason?: string;
+  noRecommendation?: string;
+}
+async function compose(_root: string, logs: string, items: FixtureItem[], ...headers: string[]) {
+  const out = path.join(logs, "build-decision-1-1.md");
+  const lines = [
+    "Status: OPEN",
+    "Question: CHALLENGE",
+    "From: challenge",
+    ...headers.map((h) => h.replace(/^--header=/, "").replace("=", ": ")),
+    "",
+  ];
+  items.forEach((it, i) => {
+    const names = it.options.map((o) => o.name);
+    const rec = it.recommended;
+    lines.push(
+      `**Q${i + 1} — ${it.title}:** ${it.question}`,
+      ...it.options.map((o, k) => `${String.fromCharCode(65 + k)}) ${o.name} — ${o.effect}`),
+      rec === undefined
+        ? `Recommended: none — ${it.noRecommendation}`
+        : `Recommended: ${String.fromCharCode(65 + names.indexOf(rec))}) ${rec} — ${it.reason}`,
+      "Default if unanswered: the run waits for you",
+      "",
     );
-    expect(missing.r.code).toBe(2);
-    expect(missing.r.err).toContain("no-such-base.json");
-    expect(missing.r.err).not.toContain("unknown flag");
-
-    const noVerdict = { ...baseCheck({}) } as Record<string, unknown>;
-    delete noVerdict.verdict;
-    const bad = await composeWithBase({}, ITEMS, { raw: JSON.stringify(noVerdict) });
-    expect(bad.r.code).toBe(2);
-    expect(bad.r.err).toContain("verdict");
-    expect(bad.r.err).not.toContain("unknown flag");
   });
+  fs.writeFileSync(out, lines.join("\n"), "utf-8");
+  return { out };
+}
 
-  it("--loop needs --file", async () => {
-    const { root, logs } = checkout();
-    expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
-  });
-});
+/** The text of a decision file and its engine file, read as the pause the engine reads. */
+const pauseItems = (out: string) =>
+  decisionItems((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null), out);
 
 describe("bkit decisions apply --by=rerun", () => {
   const rerun = (root: string, out: string) =>
@@ -1023,21 +137,40 @@ describe("bkit decisions apply --by=rerun", () => {
         .map((x) => JSON.stringify(x))
         .join("\n") + "\n",
     );
-    const { out } = await compose(
+    const out = orchestratorPause(logs, [], 2);
+    fs.writeFileSync(
+      path.join(root, "base.json"),
+      JSON.stringify({
+        verdict: "none",
+        reason: null,
+        base: "abc",
+        source: "local",
+        failing: 4,
+        baseRed: 0,
+        adopt: false,
+      }),
+    );
+    const counted = await run(
+      [
+        "decisions",
+        "counts",
+        `--out=${out}`,
+        "--loop=verify",
+        `--file=${status}`,
+        "--group=1",
+        "--attempt=2",
+        "--max=2",
+        `--base-check=${path.join(root, "base.json")}`,
+      ],
       root,
-      logs,
-      [],
-      "--header=Gate=FAIL",
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
     );
-    expect(fs.readFileSync(out, "utf-8")).toContain("Gate: FAIL");
+    expect(counted.code).toBe(0);
+    expect(fs.readFileSync(engineOf(out), "utf-8")).toContain("Gate: FAIL");
     const r = await rerun(root, out);
     expect(r.code).toBe(0);
     expect(r.json).toMatchObject({ status: "DECIDED" });
-    const text = fs.readFileSync(out, "utf-8");
-    expect(text).toMatch(/^Status: DECIDED$/m);
+    const text = fs.readFileSync(engineOf(out), "utf-8");
+    expect(text).not.toMatch(/^Status:/m);
     expect(text).toMatch(
       /Decision: Re-run gate — the owner resumed the run, so the gate runs again first \(\d{4}-\d{2}-\d{2}\)/,
     );
@@ -1099,22 +232,40 @@ describe("bkit decisions apply --by=rerun", () => {
         .map((x) => JSON.stringify(x))
         .join("\n") + "\n",
     );
-    const { out } = await compose(
+    const out = orchestratorPause(logs, ["Task 5 [src/c.ts:1]"], 2);
+    fs.writeFileSync(
+      path.join(root, "base.json"),
+      JSON.stringify({
+        verdict: "none",
+        reason: null,
+        base: "abc",
+        source: "local",
+        failing: 4,
+        baseRed: 0,
+        adopt: false,
+      }),
+    );
+    await run(
+      [
+        "decisions",
+        "counts",
+        `--out=${out}`,
+        "--loop=verify",
+        `--file=${status}`,
+        "--group=1",
+        "--attempt=2",
+        "--max=2",
+        `--base-check=${path.join(root, "base.json")}`,
+      ],
       root,
-      logs,
-      [BLOCKER],
-      "--header=Gate=FAIL",
-      "--loop=verify",
-      `--file=${status}`,
-      "--group=1",
     );
     const before = fs.readFileSync(out, "utf-8");
-    expect(before).toContain("**Q2");
     const r = await rerun(root, out);
     expect(r.code).toBe(2);
     expect(r.err).toContain("Q2");
     expect(fs.readFileSync(out, "utf-8")).toBe(before);
-    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
+    expect(fs.existsSync(engineOf(out))).toBe(true);
+    expect(fs.readFileSync(engineOf(out), "utf-8")).not.toContain("Decision: Re-run gate");
   });
 
   it("refuses a file whose only Gate: FAIL line is in an item body", async () => {
@@ -1242,7 +393,7 @@ describe("bkit decisions apply --by=headless", () => {
       fixNow: [2],
       hardBlockers: [],
     });
-    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
+    const items = pauseItems(out);
     expect(items[0]!.assumed).toBe(true);
     expect(items[0]!.decision).toMatch(
       /^Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
@@ -1261,7 +412,7 @@ describe("bkit decisions apply --by=headless", () => {
     expect(r.code).toBe(EXIT_HARD_BLOCKERS);
     expect(r.json).toMatchObject({ status: "OPEN", applied: [1], hardBlockers: [2] });
     expect(r.err).toContain("hard blockers need the owner: Q2");
-    expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, LOCAL, ");
+    expect(fs.readFileSync(engineOf(out), "utf-8")).toContain("(ask:false, LOCAL, ");
   });
 
   it("apply --by=headless leaves a Recommended: none item for the owner", async () => {
@@ -1304,7 +455,7 @@ describe("bkit decisions apply --by=headless", () => {
     delete process.env.BKIT_RUNTIME;
     const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], wt);
     expect(r.code).toBe(0);
-    expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, CLOUD_CURSOR, ");
+    expect(fs.readFileSync(engineOf(out), "utf-8")).toContain("(ask:false, CLOUD_CURSOR, ");
   });
 });
 
@@ -1528,7 +679,7 @@ describe("applyRecommendations", () => {
     ].join("\n");
     const r = applyRecommendations(text, "LOCAL", "ask:false");
     expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: "Try again" });
-    expect(parseDecisionItems(r.text)[1]!.decision).toBeNull();
+    expect(r.decisions.map((d) => d.n)).toEqual([1]);
   });
 
   it("a lettered recommendation still settles its item by name", () => {
@@ -1542,7 +693,7 @@ describe("applyRecommendations", () => {
     ].join("\n");
     const r = applyRecommendations(text, "LOCAL", "ask:false");
     expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: null });
-    expect(parseDecisionItems(r.text)[0]!.decision).toMatch(/^Accept \(assumed\) — minor \(/);
+    expect(r.decisions[0]!.line).toMatch(/^Decision: Accept \(assumed\) — minor \(/);
   });
 
   it("applyRecommendations reads a lettered Try again decision as the loop answer", () => {
@@ -1561,7 +712,7 @@ describe("applyRecommendations", () => {
     ].join("\n");
     const r = applyRecommendations(text, "LOCAL", "ask:false");
     expect(r).toMatchObject({ applied: [], hardBlockers: [], loop: "Try again" });
-    expect(parseDecisionItems(r.text)[1]!.decision).toBeNull();
+    expect(r.decisions).toEqual([]);
   });
 });
 
@@ -1606,7 +757,7 @@ describe("bkit decisions apply --by=owner and pending", () => {
       by: { workflow: "ship" },
     });
     expect((await owner("2", "--reject", "--reason=fix it later")).code).toBe(0);
-    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
+    const items = pauseItems(out);
     expect(items[0]!.decision).toMatch(/^Accept — fine as is \(owner, confirmed at ship, /);
     expect(items[1]!.rejected).toBe(true);
     expect((await pending(root)).json.items).toEqual([
@@ -1637,7 +788,7 @@ describe("bkit decisions apply --by=owner and pending", () => {
     );
     expect(r.code).toBe(0);
     expect(r.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
-    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
+    const items = pauseItems(out);
     expect(items[0]!.decision).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
     expect(items[0]!.assumed).toBe(false);
     expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
@@ -1711,3 +862,320 @@ describe("bkit decisions apply --by=owner and pending", () => {
     );
   });
 });
+
+/** An orchestrator decision file, written by hand: its header, then one lettered question per title from `first`. */
+function orchestratorPause(logs: string, titles: string[], first = 1) {
+  const file = path.join(logs, "build-decision-1-1.md");
+  const lines = ["Question: CHALLENGE", "From: verify", "Group: 1", ""];
+  titles.forEach((title, i) =>
+    lines.push(
+      `**Q${first + i} — ${title}:** MEDIUM: the retry has no cap. Accept it?`,
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — the caller already caps it",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "",
+    ),
+  );
+  lines.push('Reply with a letter per question, or "yes" to take every recommendation.', "");
+  fs.writeFileSync(file, lines.join("\n"), "utf-8");
+  return file;
+}
+const engineOf = (file: string) => file.replace(/\.md$/, "-engine.md");
+
+describe("bkit decisions check", () => {
+  it("refuses a question without lettered options, naming it", async () => {
+    const { root, logs } = checkout();
+    const file = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      file,
+      [
+        "Question: CHALLENGE",
+        "From: verify",
+        "",
+        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "Recommended: Accept — the caller already caps it",
+        "Default if unanswered: the run waits for you",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
+  });
+
+  it("refuses Q1 when the engine file holds the loop question", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+    fs.writeFileSync(
+      engineOf(file),
+      [
+        "Source changed: false",
+        "",
+        "build verify: attempt 2 of 2",
+        "",
+        "## Progress",
+        "",
+        "**Q1 — Verify:** decide the items below instead of another round?",
+        "A) Try again — one more fix round runs",
+        "B) Decide — the questions below are asked instead of another round",
+        "Recommended: B) Decide — another round is unlikely to help",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
+  });
+
+  it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
+    expect(fs.existsSync(engineOf(file))).toBe(false);
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(0);
+  });
+});
+
+describe("bkit decisions counts", () => {
+  const verifyRow = (at: string, failures: number) => ({
+    type: "step-done",
+    workflow: "build",
+    step: "build-plan-verify",
+    status: "DONE",
+    at,
+    group: 1,
+    failures,
+  });
+  /** A status log whose verify rounds ended at `counts` failures each. */
+  function statusOf(logs: string, counts: number[]) {
+    const status = path.join(logs, "status.jsonl");
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        ...counts.map((c, i) => verifyRow(`2026-10-01T00:${10 + 10 * i}:00Z`, c)),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    return status;
+  }
+  const baseFile = (root: string, over: Record<string, unknown>) => {
+    const f = path.join(root, "base-check.json");
+    fs.writeFileSync(
+      f,
+      JSON.stringify({
+        verdict: "all",
+        reason: null,
+        base: "abc1234",
+        source: "local",
+        failing: 3,
+        baseRed: 3,
+        branch: 0,
+        undetermined: 0,
+        cases: [],
+        adopt: false,
+        ...over,
+      }),
+    );
+    return f;
+  };
+  const counts = (root: string, out: string, status: string, ...extra: string[]) =>
+    run(
+      [
+        "decisions",
+        "counts",
+        `--out=${out}`,
+        "--loop=verify",
+        `--file=${status}`,
+        "--group=1",
+        "--attempt=2",
+        "--max=2",
+        ...extra,
+      ],
+      root,
+    );
+
+  it("writes the attempt line, progress, base check and loop question into the engine file only", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
+    const before = fs.readFileSync(out, "utf-8");
+    const base = baseFile(root, { verdict: "none", baseRed: 0, branch: 3 });
+    const r = await counts(
+      root,
+      out,
+      statusOf(logs, [4, 4]),
+      "--source-changed=false",
+      `--base-check=${base}`,
+    );
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toContain("Source changed: false");
+    expect(engine).toContain("Gate: FAIL");
+    expect(engine).toContain("build verify: attempt 2 of 2");
+    expect(engine).toContain("## Progress");
+    expect(engine).toContain("Problems after each round: 4 → 4");
+    expect(engine).toContain("Also red on base abc1234: 0 of 3");
+    expect(engine).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
+    expect(engine).toContain("A) Try again — one more fix round runs");
+    expect(engine).toContain("B) Decide — ");
+    expect(engine).not.toContain("**Q2");
+    expect(engine).not.toMatch(/^Status:/m);
+  });
+
+  it("recommends Decide when the last round changed no source", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    const r = await counts(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
+    expect(r.code).toBe(0);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toContain("Source changed: false");
+    expect(engine).toMatch(/Recommended: B\) Decide — another round is unlikely/);
+  });
+
+  it("recommends Try again when the last round made progress", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    const r = await counts(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
+    expect(r.code).toBe(0);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toContain("Source changed: true");
+    expect(engine).toContain("(5 → 2)");
+    expect(engine).toMatch(/Recommended: A\) Try again — the last round made progress/);
+  });
+
+  it("engine file recommends Stop when the base check is all and no questions are counted", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, [], 2);
+    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
+    expect(r.code).toBe(0);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
+    expect(engine).toContain("Fix `dev`, then resume.");
+  });
+
+  it("engine file recommends Decide when the base check is all and questions are counted", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
+    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
+    expect(r.code).toBe(0);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
+  });
+
+  it("writes Source changed and Gate into the engine file for a verify pause with no loop", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+    const before = fs.readFileSync(out, "utf-8");
+    const r = await run(
+      [
+        "decisions",
+        "counts",
+        `--out=${out}`,
+        "--source-changed=true",
+        `--base-check=${baseFile(root, {})}`,
+      ],
+      root,
+    );
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toContain("Source changed: true");
+    expect(engine).toContain("Gate: FAIL");
+    expect(engine).not.toContain("## Progress");
+    expect(engine).not.toContain("**Q1");
+  });
+});
+
+describe("bkit decisions apply --by=headless", () => {
+  it("writes assumed decisions into the engine file and leaves the decision file unchanged", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
+    const before = fs.readFileSync(out, "utf-8");
+    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
+    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toMatch(
+      /Decision: Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
+    );
+    expect(engine).not.toMatch(/^Status:/m);
+  });
+});
+
+describe("bkit decisions apply --by=owner and pending", () => {
+  it("writes a confirmation into the engine file", async () => {
+    const { root, logs } = checkout();
+    const out = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      out,
+      [
+        "Question: CHALLENGE",
+        "From: verify",
+        "",
+        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept — the item is recorded as accepted",
+        "B) Fix now — a fix task is added to the plan",
+        "Recommended: A) Accept — the caller already caps it",
+        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+        "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
+        "",
+      ].join("\n"),
+    );
+    const before = fs.readFileSync(out, "utf-8");
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+    const r = await run(
+      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
+      root,
+    );
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
+    expect(engine).not.toMatch(/^Status:/m);
+  });
+
+  it("--answer writes the loop answer under the engine file's Q1", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    const before = fs.readFileSync(out, "utf-8");
+    fs.writeFileSync(
+      engineOf(out),
+      [
+        "Source changed: false",
+        "Gate: FAIL",
+        "",
+        "build verify: attempt 2 of 2",
+        "",
+        "## Progress",
+        "",
+        "**Q1 — Verify:** decide the items below instead of another round?",
+        "A) Try again — one more fix round runs",
+        "B) Decide — the questions below are asked instead of another round",
+        "Recommended: B) Decide — another round is unlikely to help",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(
+      [
+        "decisions",
+        "apply",
+        "--by=owner",
+        `--file=${out}`,
+        "--q=1",
+        "--answer=Try again",
+        "--reason=one more round",
+      ],
+      root,
+    );
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    expect(engine.indexOf("Decision: Try again")).toBeGreaterThan(engine.indexOf("**Q1"));
+    expect(engine).toContain("one more round");
+    expect(engine).not.toMatch(/^Status:/m);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 89b86a3f5..3502a3287 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -1,6 +1,12 @@
-// bkit decisions compose|apply|skip|pending — the build's decision files, from question to ship.
+// bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
+// A pause holds two files. The orchestrator writes the decision file (`build-decision-{RUN}-{N}.md`):
+// its header and its questions. The engine writes the `-engine.md` sibling: the lines only it can
+// count (`Source changed`, `Gate`, the attempt line, the progress block, the loop question Q1) and
+// every `Decision:` line `apply` writes. `decisionItems` reads the two as one pause. The engine
+// never edits the orchestrator's file and writes no `Status` line: `Status` is read from the items.
+//
 // A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
 // lines, an optional progress block, then one item per question:
 //
@@ -16,7 +22,7 @@
 // and `No recommendation — {why}` in place of `Recommended: none — {why}`.
 //
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
-// `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
+// `Accept` is written `Accept (assumed)` and the pause reads `ASSUMED`. It never writes a
 // `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
 // assumed items with `pending`; the owner confirms each (`apply --by=owner --confirm`, which
 // writes the real acceptance) or rejects it, and `pending --defer` writes one `needs-decision`
@@ -26,14 +32,19 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 
 import { readJsonFile, readTextFile } from "../../shared/json.js";
-import { oneLine } from "../../shared/text.js";
 import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
 import { loopProgress } from "./counters.js";
 import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
 import {
+  decisionFileHeader,
+  decisionItems,
+  engineSibling,
+  isEngineFile,
   ITEM_SPLIT,
   letterAt,
+  mergeItems,
+  pauseStatus,
   parseDecisionItems,
   skipProblem,
   undecidedBesidesLoop,
@@ -45,20 +56,9 @@ import { positiveInt, str } from "./status.js";
 /** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
 export const EXIT_HARD_BLOCKERS = 4;
 
-/** Options one item may hold: one per letter, `A` to `Z`. */
-const MAX_OPTIONS = 26;
 /** The option list as it is written: `A) {A} / B) {B}`. */
 const letteredOptions = (options: string[]): string =>
   options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
-/** The letter `name` holds in `options`, or null when it is not one of them. */
-const letterOf = (options: string[], name: string): string | null =>
-  options.includes(name) ? letterAt(options.indexOf(name)) : null;
-
-/** `Status:` set to `status`. */
-const withStatus = (text: string, status: string) =>
-  /^Status:.*$/m.test(text)
-    ? text.replace(/^Status:.*$/m, `Status: ${status}`)
-    : `Status: ${status}\n${text}`;
 
 /** `extra` lines added under item `n`'s last line. */
 function addUnder(text: string, n: number, extra: string[], replace?: RegExp): string {
@@ -72,12 +72,6 @@ function addUnder(text: string, n: number, extra: string[], replace?: RegExp): s
   return parts.join("");
 }
 
-/** The status a file's items leave it in. */
-function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED" {
-  if (items.some((i) => i.decision === null)) return "OPEN";
-  return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
-}
-
 const today = () => new Date().toISOString().slice(0, 10);
 const readText = (file: string) => {
   if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `${file} does not exist`);
@@ -99,24 +93,9 @@ const slug = (s: string) =>
     .slice(0, 60);
 
 // ---------------------------------------------------------------------------
-// compose
+// check and counts
 // ---------------------------------------------------------------------------
 
-interface ComposeOption {
-  name: string;
-  effect: string;
-}
-
-interface ComposeItem {
-  title: string;
-  question: string;
-  options: ComposeOption[];
-  recommended?: string;
-  reason?: string;
-  /** Set for a hard blocker: why no agent can settle it. No recommendation is written. */
-  noRecommendation?: string;
-}
-
 interface BaseCheck {
   verdict: "all" | "some" | "none" | "unknown";
   reason: string | null;
@@ -172,102 +151,135 @@ function readBaseCheck(file: string): BaseCheck {
   };
 }
 
+/** Exit code: `check` refused the orchestrator's decision file. */
+export const EXIT_BAD_DECISION = 6;
+
+/** A decision file's text, or null when the path is missing. */
+const readIf = (file: string): string | null =>
+  fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
+
+/**
+ * The first item rule a decision file breaks, naming the question, or null. Each question needs
+ * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
+ * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
+ * `Q1` is the engine's when the engine file holds the loop question.
+ */
+export function itemProblem(text: string, engineText: string | null): string | null {
+  const seen = new Set<number>();
+  const engineHasLoop = engineText !== null && /^## Progress$/m.test(engineText);
+  for (const part of text.split(ITEM_SPLIT).slice(1)) {
+    const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
+    const q = `Q${n}`;
+    if (seen.has(n)) return `${q} appears twice; number each question once`;
+    seen.add(n);
+    if (n === 1 && engineHasLoop)
+      return "Q1 is the loop question the engine file holds; number your questions from Q2";
+    const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
+    if (optionLines.length === 0)
+      return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
+    for (const [i, m] of optionLines.entries()) {
+      if (m[1] !== letterAt(i))
+        return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
+      const [name, ...effect] = (m[2] ?? "").split(" — ");
+      if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
+        return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
+    }
+    const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
+    if (rec === undefined)
+      return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
+    const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0]!.trim());
+    const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
+    if (!/^none\b/i.test(recName) && !names.includes(recName))
+      return `${q}: the recommended option "${recName}" is not one of its options`;
+    if (!/^Default if unanswered:[ \t]*\S/m.test(part))
+      return `${q} has no Default if unanswered: line`;
+  }
+  return null;
+}
+
 /** The effect a bare fixed option name gets. */
 const FIXED_EFFECTS: Record<string, string> = {
-  Accept: "the item is recorded as accepted and the build moves on",
-  "Fix now": "one more fix round runs before the build moves on",
-  Stop: "the run ends here with a handover; the next run resumes here",
   "Try again": "one more fix round runs",
   Decide: "the questions below are asked instead of another round",
+  Stop: "the run ends here with a handover; the next run resumes here",
 };
 
-function composeItems(raw: unknown): ComposeItem[] {
-  if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
-  return raw.map((r, i) => {
-    const o = (r ?? {}) as Record<string, unknown>;
-    const s = (k: string) => (typeof o[k] === "string" ? oneLine(o[k] as string) : "");
-    const rawOptions: unknown[] = Array.isArray(o.options) ? o.options : [];
-    if (s("title") === "" || s("question") === "" || rawOptions.length === 0)
-      throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
-    if (rawOptions.length > MAX_OPTIONS)
-      throw new CommandError(EXIT.USAGE, `item ${i + 1}: at most ${MAX_OPTIONS} options (A-Z)`);
-    const options: ComposeOption[] = rawOptions.map((x, k) => {
-      const bad = () =>
-        new CommandError(
-          EXIT.USAGE,
-          `item ${i + 1} (Q${i + 1}): option ${letterAt(k)} needs a name and an effect`,
-        );
-      let name: string;
-      let effect: string;
-      if (typeof x === "string") {
-        name = x.trim();
-        const fixed = FIXED_EFFECTS[name];
-        if (fixed === undefined) throw bad();
-        effect = fixed;
-      } else {
-        const ob = (x ?? {}) as Record<string, unknown>;
-        if (typeof ob.name !== "string" || typeof ob.effect !== "string") throw bad();
-        name = oneLine(ob.name);
-        effect = oneLine(ob.effect);
-        if (name === "" || effect === "") throw bad();
-      }
-      if (name.includes("—"))
-        throw new CommandError(
-          EXIT.USAGE,
-          `item ${i + 1} (Q${i + 1}): option name "${name}" must not contain a dash (—); put it in the effect`,
-        );
-      return { name, effect };
-    });
-    if (s("noRecommendation") === "" && !options.some((x) => x.name === s("recommended")))
-      throw new CommandError(
-        EXIT.USAGE,
-        `item ${i + 1}: recommended must be one of its options, or set noRecommendation`,
-      );
-    return {
-      title: s("title"),
-      question: s("question"),
-      options,
-      recommended: s("recommended"),
-      reason: s("reason"),
-      noRecommendation: s("noRecommendation"),
-    };
-  });
-}
-
-const itemLines = (n: number, it: ComposeItem): string[] => {
-  const rec = it.recommended ?? "";
-  const names = it.options.map((o) => o.name);
-  const letter = letterOf(names, rec);
+/** The loop question `Q1` the engine writes, in the one question layout. */
+function loopQuestionLines(o: {
+  title: string;
+  question: string;
+  options: string[];
+  recommended: string;
+  reason: string;
+}): string[] {
+  const letter = letterAt(o.options.indexOf(o.recommended));
   return [
-    `**Q${n} — ${it.title}:** ${it.question}`,
-    ...it.options.map((o, i) => `${letterAt(i)}) ${o.name} — ${o.effect}`),
-    it.noRecommendation
-      ? `Recommended: none — ${it.noRecommendation}`
-      : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
-    it.noRecommendation || letter === null
-      ? "Default if unanswered: the run waits for you; the run stops when nobody can be asked"
-      : `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
+    `**Q1 — ${o.title}:** ${o.question}`,
+    ...o.options.map((name, i) => `${letterAt(i)}) ${name} — ${FIXED_EFFECTS[name]}`),
+    `Recommended: ${letter}) ${o.recommended} — ${o.reason}`,
+    `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
   ];
-};
-
-const fixed = (name: string): ComposeOption => ({ name, effect: FIXED_EFFECTS[name]! });
+}
 
 // ---------------------------------------------------------------------------
 // apply
 // ---------------------------------------------------------------------------
 
-/** Each undecided item's recommendation written in; hard blockers left for the owner. */
+/** The engine file for a decision file that has none yet: a preamble line, so the first item is never read as one. */
+const engineStub = (file: string): string =>
+  `Written by the engine beside ${path.basename(file)}; the orchestrator's questions are in that file.\n\n`;
+
+/**
+ * `extra` lines under question `n` of the engine file's text, the question's first line copied
+ * in from the merged `items` when the engine file does not hold it yet.
+ */
+function engineWith(
+  engineText: string,
+  items: DecisionItem[],
+  n: number,
+  extra: string[],
+  replace?: RegExp,
+): string {
+  let text = engineText;
+  if (!text.split(ITEM_SPLIT).some((p) => p.startsWith(`**Q${n} — `))) {
+    const heading = items.find((i) => i.n === n)?.text.split("\n")[0];
+    if (heading === undefined) throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
+    text = `${text.trimEnd()}\n\n${heading}\n`;
+  }
+  return addUnder(text, n, extra, replace);
+}
+
+/** The engine file's text (its stub when absent) and the merged items of a decision file. */
+function pauseOf(file: string) {
+  const text = readText(file);
+  const engineFile = engineSibling(file);
+  const engineText = readIf(engineFile);
+  return {
+    text,
+    engineFile,
+    engineText,
+    engineOrStub: engineText ?? engineStub(file),
+    items: mergeItems(text, engineText),
+  };
+}
+
+/** Each undecided item's recommendation as a `Decision:` line; hard blockers left for the owner. */
 export function applyRecommendations(
   text: string,
   runtime: string,
   why: "ask:false" | "headless",
-): { text: string; applied: number[]; hardBlockers: number[]; loop: string | null } {
-  const items = parseDecisionItems(text);
+  engineText: string | null = null,
+): {
+  decisions: Array<{ n: number; line: string }>;
+  applied: number[];
+  hardBlockers: number[];
+  loop: string | null;
+} {
+  const items = mergeItems(text, engineText);
   const loopItem = items.find((i) => i.options.includes("Try again"));
   const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
-  const applied: number[] = [];
+  const decisions: Array<{ n: number; line: string }> = [];
   const hardBlockers: number[] = [];
-  let out = text;
   for (const it of items) {
     if (it.decision !== null) continue;
     // `Try again` settles the loop alone; the items wait for the next round.
@@ -276,15 +288,15 @@ export function applyRecommendations(
       hardBlockers.push(it.n);
       continue;
     }
-    const line =
-      it.recommended === "Accept"
-        ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
-        : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`;
-    out = addUnder(out, it.n, [line]);
-    applied.push(it.n);
+    decisions.push({
+      n: it.n,
+      line:
+        it.recommended === "Accept"
+          ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
+          : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`,
+    });
   }
-  out = withStatus(out, statusOf(parseDecisionItems(out)));
-  return { text: out, applied, hardBlockers, loop };
+  return { decisions, applied: decisions.map((d) => d.n), hardBlockers, loop };
 }
 
 /** The `decision` row an owner's confirmation writes. */
@@ -325,7 +337,7 @@ function decisionFiles(logDir: string): string[] {
   return fs.existsSync(logDir)
     ? fs
         .readdirSync(logDir)
-        .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
+        .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f) && !isEngineFile(f))
         .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
         .map((f) => path.join(logDir, f))
     : [];
@@ -343,23 +355,46 @@ const root = (cwd: string, flag: unknown) =>
 
 export const decisionsCommand: CommandSpec = {
   noun: "decisions",
-  summary: "Build decision files: write questions, apply recommendations, list assumed items.",
+  summary:
+    "Build decision files: check the orchestrator's questions, write the engine's counts, apply recommendations, list assumed items.",
   verbs: {
-    compose: {
-      summary: "Write a decision file in the one question layout, with loop progress when asked.",
+    check: {
+      summary:
+        "Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question.",
+      use: "workflow",
+      flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
+      output: {
+        file: "the decision file checked",
+        questions: "number of questions in it",
+        problem: "null, or the first rule it breaks, naming the question",
+      },
+      exitCodes: {
+        [EXIT_BAD_DECISION]:
+          "the file breaks an item rule: fix it as `problem` says, then check again",
+      },
+      run: (ctx) => {
+        const file = path.resolve(ctx.cwd, String(ctx.flags.file));
+        const text = readText(file);
+        const problem = itemProblem(text, readIf(engineSibling(file)));
+        ctx.emit({
+          file: path.relative(ctx.cwd, file),
+          questions: parseDecisionItems(text).length,
+          problem,
+        });
+        if (problem !== null) ctx.log(`${path.basename(file)}: ${problem}`);
+        return problem === null ? EXIT.OK : EXIT_BAD_DECISION;
+      },
+    },
+    counts: {
+      summary:
+        "Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1.",
       use: "workflow",
       flags: [
-        { name: "out", type: "string", required: true, help: "the decision file to write" },
+        { name: "out", type: "string", required: true, help: "the orchestrator's decision file" },
         {
-          name: "header",
+          name: "source-changed",
           type: "string",
-          repeatable: true,
-          help: "Key=Value header line (Status: OPEN is written first)",
-        },
-        {
-          name: "items",
-          type: "string",
-          help: "JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]",
+          help: "true | false: whether the last fix round changed source",
         },
         {
           name: "loop",
@@ -377,33 +412,35 @@ export const decisionsCommand: CommandSpec = {
         {
           name: "base-check",
           type: "string",
-          help: "with --loop: the `bkit tests base` output JSON; adds the base-commit line and steers the recommendation",
+          help: "the `bkit tests base` output JSON; writes `Gate: FAIL`, and with --loop the base-commit line and a steered recommendation",
         },
       ],
       output: {
-        file: "the decision file written",
-        questions: "number of questions",
-        loopRecommended: "Try again | Decide (with --loop), else null",
+        file: "the engine file written",
+        questions: "number of questions in the decision file, the loop question included",
+        loopRecommended: "Try again | Decide | Stop (with --loop), else null",
       },
       run: (ctx) => {
         const out = path.resolve(ctx.cwd, String(ctx.flags.out));
-        const headers = ((ctx.flags.header as string[] | undefined) ?? []).map((h) => {
-          const eq = h.indexOf("=");
-          if (eq <= 0) throw new CommandError(EXIT.USAGE, `--header ${h}: must be Key=Value`);
-          return `${h.slice(0, eq)}: ${h.slice(eq + 1)}`;
-        });
-        let items: ComposeItem[] = [];
-        if (ctx.flags.items !== undefined) {
-          const read = readJsonFile(path.resolve(ctx.cwd, String(ctx.flags.items)));
-          if (!read.ok) throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
-          items = composeItems(read.value);
-        }
+        const own = parseDecisionItems(readText(out)).length;
+        const sourceChanged = str(ctx.flags.sourceChanged);
+        if (sourceChanged !== undefined && sourceChanged !== "true" && sourceChanged !== "false")
+          throw new CommandError(EXIT.USAGE, "--source-changed must be true or false");
         const baseFlag = str(ctx.flags.baseCheck);
         const baseCheck =
           baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
-        const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
-        let loopRecommended: string | null = null;
         const loopName = str(ctx.flags.loop);
+        if (sourceChanged === undefined && baseCheck === undefined && loopName === undefined)
+          throw new CommandError(
+            EXIT.USAGE,
+            "counts needs --source-changed, --base-check or --loop",
+          );
+        const lines = [
+          ...(sourceChanged === undefined ? [] : [`Source changed: ${sourceChanged}`]),
+          ...(baseCheck === undefined ? [] : ["Gate: FAIL"]),
+          "",
+        ];
+        let loopRecommended: string | null = null;
         if (loopName !== undefined) {
           const loop = LOOPS[loopName];
           if (loop === undefined)
@@ -453,7 +490,7 @@ export const decisionsCommand: CommandSpec = {
                 : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
             ];
             if (b.verdict === "all") {
-              loopRecommended = items.length > 0 ? "Decide" : "Stop";
+              loopRecommended = own > 0 ? "Decide" : "Stop";
               reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
             } else if (b.verdict === "some") {
               const unchecked =
@@ -482,37 +519,26 @@ export const decisionsCommand: CommandSpec = {
             `Trend: ${p.trend}`,
             ...baseLine,
             "",
-            ...itemLines(1, {
+            ...loopQuestionLines({
               title: loop.title,
               question:
                 loopRecommended === "Try again"
                   ? `another fix round? ${p.trendLine}`
                   : `decide the items below instead of another round? ${p.trendLine}`,
-              options:
-                items.length > 0
-                  ? [fixed("Try again"), fixed("Decide")]
-                  : [fixed("Try again"), fixed("Stop")],
-              recommended:
-                items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
+              options: own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
+              recommended: own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
               reason,
             }),
             "",
           );
-          if (items.length === 0 && loopRecommended === "Decide") loopRecommended = "Stop";
+          if (own === 0 && loopRecommended === "Decide") loopRecommended = "Stop";
         }
-        const first = loopName === undefined ? 1 : 2;
-        items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
-        const questionCount = items.length + (loopName === undefined ? 0 : 1);
-        lines.push(
-          'Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.',
-        );
-        if (questionCount >= 3) lines.push('Or say "one by one" and I\'ll ask them one at a time.');
-        lines.push("");
-        fs.mkdirSync(path.dirname(out), { recursive: true });
-        fs.writeFileSync(out, lines.join("\n"), "utf-8");
+        const engineFile = engineSibling(out);
+        fs.mkdirSync(path.dirname(engineFile), { recursive: true });
+        fs.writeFileSync(engineFile, lines.join("\n"), "utf-8");
         ctx.emit({
-          file: path.relative(ctx.cwd, out),
-          questions: items.length + (loopName === undefined ? 0 : 1),
+          file: path.relative(ctx.cwd, engineFile),
+          questions: own + (loopName === undefined ? 0 : 1),
           loopRecommended,
         });
         return EXIT.OK;
@@ -520,7 +546,7 @@ export const decisionsCommand: CommandSpec = {
     },
     apply: {
       summary:
-        "Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item.",
+        "Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
       use: "workflow",
       flags: [
         { name: "file", type: "string", required: true, help: "the decision file" },
@@ -528,6 +554,11 @@ export const decisionsCommand: CommandSpec = {
         { name: "q", type: "string", help: "--by=owner: the question number" },
         { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
         { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
+        {
+          name: "answer",
+          type: "string",
+          help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
+        },
         { name: "reason", type: "string", help: "--by=owner: the owner's words" },
         {
           name: "root",
@@ -536,7 +567,7 @@ export const decisionsCommand: CommandSpec = {
         },
       ],
       output: {
-        status: "the file's Status after the call: OPEN | ASSUMED | DECIDED",
+        status: "the pause's Status after the call: OPEN | ASSUMED | DECIDED",
         applied: "--by=headless: question numbers settled on their recommendation",
         hardBlockers: "--by=headless: question numbers with no recommendation, left for the owner",
         loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
@@ -549,19 +580,27 @@ export const decisionsCommand: CommandSpec = {
       },
       run: (ctx) => {
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
-        const text = readText(file);
+        const pause = pauseOf(file);
         const by = String(ctx.flags.by);
+        const write = (engine: string) => {
+          fs.writeFileSync(pause.engineFile, engine, "utf-8");
+          return pauseStatus(pause.text, engine);
+        };
         if (by === "headless") {
           const runtime = classifyAt(ctx.cwd);
           const r = applyRecommendations(
-            text,
+            pause.text,
             runtime,
             runtime === "GITHUB_ACTION" ? "headless" : "ask:false",
+            pause.engineText,
           );
-          fs.writeFileSync(file, r.text, "utf-8");
-          const after = parseDecisionItems(r.text);
+          let engine = pause.engineOrStub;
+          for (const d of r.decisions) engine = engineWith(engine, pause.items, d.n, [d.line]);
+          const status =
+            r.decisions.length === 0 && pause.engineText === null ? null : write(engine);
+          const after = mergeItems(pause.text, engine);
           ctx.emit({
-            status: /^Status:[ \t]*(\S+)/m.exec(r.text)?.[1] ?? "OPEN",
+            status: status ?? pauseStatus(pause.text, pause.engineText),
             applied: r.applied,
             hardBlockers: r.hardBlockers,
             loop: r.loop,
@@ -573,12 +612,13 @@ export const decisionsCommand: CommandSpec = {
         }
         if (by === "rerun") {
           const name = path.basename(file);
-          if (!/^Gate:[ \t]*FAIL\b/m.test(text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? ""))
+          const header = decisionFileHeader((rel) => readIf(path.resolve(ctx.cwd, rel)), file);
+          if (!/^FAIL\b/.test(header.Gate ?? ""))
             throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
-          const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
+          const status = pauseStatus(pause.text, pause.engineText);
           if (status !== "OPEN")
             throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
-          const { hasLoop, undecided } = undecidedBesidesLoop(text);
+          const { hasLoop, undecided } = undecidedBesidesLoop(pause.text, pause.engineText);
           if (!hasLoop)
             throw new CommandError(
               EXIT.USAGE,
@@ -589,53 +629,72 @@ export const decisionsCommand: CommandSpec = {
               EXIT.USAGE,
               `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`,
             );
-          const out = withStatus(
-            addUnder(text, 1, [
-              `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
-            ]),
-            "DECIDED",
-          );
-          fs.writeFileSync(file, out, "utf-8");
-          ctx.emit({ status: "DECIDED" });
+          const engine = engineWith(pause.engineOrStub, pause.items, 1, [
+            `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
+          ]);
+          ctx.emit({ status: write(engine) });
           return EXIT.OK;
         }
         if (by !== "owner")
           throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
         const n = positiveInt(ctx.flags.q, "q");
         const reason = str(ctx.flags.reason);
-        if (
-          n === undefined ||
-          reason === undefined ||
-          (ctx.flags.confirm === true) === (ctx.flags.reject === true)
-        )
+        const answer = str(ctx.flags.answer);
+        const choices = [
+          ctx.flags.confirm === true,
+          ctx.flags.reject === true,
+          answer !== undefined,
+        ];
+        if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
           throw new CommandError(
             EXIT.USAGE,
-            "--by=owner needs --q, --reason and one of --confirm / --reject",
+            "--by=owner needs --q, --reason and one of --confirm / --reject / --answer",
           );
-        const it = parseDecisionItems(text).find((i) => i.n === n);
+        const it = pause.items.find((i) => i.n === n);
+        if (answer !== undefined) {
+          if (it === undefined || !it.options.includes(answer))
+            throw new CommandError(
+              EXIT.USAGE,
+              `Q${n} has no option "${answer}" in ${path.basename(file)}`,
+            );
+          const engine = engineWith(
+            pause.engineOrStub,
+            pause.items,
+            n,
+            [`Decision: ${answer} — ${reason} (owner, ${today()})`],
+            /^Decision:/,
+          );
+          ctx.emit({ status: write(engine), decisionKey: null });
+          return EXIT.OK;
+        }
         if (it === undefined || !it.assumed)
           throw new CommandError(
             EXIT.USAGE,
             `Q${n} is not an assumed Accept in ${path.basename(file)}`,
           );
-        let out: string;
+        let engine: string;
         let decisionKey: string | null = null;
         if (ctx.flags.confirm === true) {
           const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
           appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
           decisionKey = String(row.key);
-          out = addUnder(
-            text,
+          engine = engineWith(
+            pause.engineOrStub,
+            pause.items,
             n,
             [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`],
             /^(Decision|Rejected):/,
           );
         } else {
-          out = addUnder(text, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
+          engine = engineWith(
+            pause.engineOrStub,
+            pause.items,
+            n,
+            [`Rejected: ${reason} (owner, ${today()})`],
+            /^Rejected:/,
+          );
         }
-        out = withStatus(out, statusOf(parseDecisionItems(out)));
-        fs.writeFileSync(file, out, "utf-8");
-        ctx.emit({ status: /^Status:[ \t]*(\S+)/m.exec(out)?.[1] ?? "OPEN", decisionKey });
+        ctx.emit({ status: write(engine), decisionKey });
         return EXIT.OK;
       },
     },
@@ -653,7 +712,7 @@ export const decisionsCommand: CommandSpec = {
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
         const read = readTextFile(file);
         if (!read.ok) throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
-        const problem = skipProblem(read.text);
+        const problem = skipProblem(read.text, readIf(engineSibling(file)));
         if (problem !== null) ctx.log(`${path.basename(file)}: ${problem}`);
         ctx.emit({ route: problem === null ? "continue" : null, problem });
         return problem === null ? EXIT.OK : EXIT.NO;
@@ -690,8 +749,10 @@ export const decisionsCommand: CommandSpec = {
         const rows: Record<string, unknown>[] = [];
         for (const abs of decisionFiles(logDir)) {
           const rel = path.relative(top, abs);
-          let text = fs.readFileSync(abs, "utf-8");
-          for (const it of parseDecisionItems(text)) {
+          const merged = decisionItems(readIf, abs);
+          let engine = readIf(engineSibling(abs)) ?? engineStub(abs);
+          let marked = false;
+          for (const it of merged) {
             if (!it.assumed || it.deferred) continue;
             items.push({
               file: rel,
@@ -702,13 +763,11 @@ export const decisionsCommand: CommandSpec = {
             });
             if (ctx.flags.defer === true) {
               rows.push(deferralRow(rel, it));
-              text = addUnder(text, it.n, [`Deferred: needs-decision (${today()})`]);
+              engine = engineWith(engine, merged, it.n, [`Deferred: needs-decision (${today()})`]);
+              marked = true;
             }
           }
-          if (ctx.flags.defer === true) {
-            text = withStatus(text, statusOf(parseDecisionItems(text)));
-            fs.writeFileSync(abs, text, "utf-8");
-          }
+          if (marked) fs.writeFileSync(engineSibling(abs), engine, "utf-8");
         }
         const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
         ctx.emit({ items, count: items.length, deferred });
diff --git a/.bkit/core/engine/commands/workflow/open-decision.test.ts b/.bkit/core/engine/commands/workflow/open-decision.test.ts
index f3801ad81..82b9d22b9 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.test.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.test.ts
@@ -1,14 +1,84 @@
-import { describe, expect, it } from "vitest";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
 
 import {
   decisionHeader,
+  decisionItems,
   gateRerun,
+  openDecision,
   optionAnswer,
   parseDecisionItems,
   skipProblem,
   undecidedBesidesLoop,
 } from "./open-decision.js";
 
+const tmpDirs: string[] = [];
+afterEach(() => {
+  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+/** The orchestrator's decision file: its header, no `Status`, `Source changed` or `Gate`, and its questions from Q2. */
+const orchestratorFile = (o: { answer?: string | null; from?: string } = {}) =>
+  [
+    "Question: CHALLENGE",
+    `From: ${o.from ?? "verify"}`,
+    "Group: 1",
+    "",
+    "**Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+    "A) Accept — the item is recorded as accepted",
+    "B) Fix now — a fix task is added to the plan",
+    "Recommended: A) Accept — the caller already caps it",
+    "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+    ...(o.answer === null || o.answer === undefined ? [] : [`Decision: ${o.answer}`]),
+    "",
+  ].join("\n");
+
+/** The engine's file: its header lines, the progress block and the loop question as Q1. */
+const engineFile = (o: { loop?: string | null; headers?: string[]; q2?: string } = {}) =>
+  [
+    ...(o.headers ?? ["Source changed: false", "Gate: FAIL"]),
+    "",
+    "build verify: attempt 2 of 2",
+    "",
+    "## Progress",
+    "",
+    "Problems after each round: 4 → 4",
+    "",
+    "**Q1 — Verify:** decide the items below instead of another round?",
+    "A) Try again — one more fix round runs",
+    "B) Decide — the questions below are asked instead of another round",
+    "Recommended: B) Decide — another round is unlikely to help",
+    ...(o.loop === null || o.loop === undefined ? [] : [`Decision: ${o.loop}`]),
+    "",
+    ...(o.q2 === undefined
+      ? []
+      : [
+          "**Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+          `Decision: ${o.q2}`,
+          "",
+        ]),
+  ].join("\n");
+
+/** A log folder holding `build-decision-1-1.md` and, when given, its `-engine.md` sibling. */
+function pauseDir(orchestrator: string, engine?: string) {
+  const tree = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-open-decision-"));
+  tmpDirs.push(tree);
+  const logDir = path.join(tree, "logs");
+  fs.mkdirSync(logDir);
+  fs.writeFileSync(path.join(logDir, "build-decision-1-1.md"), orchestrator);
+  if (engine !== undefined)
+    fs.writeFileSync(path.join(logDir, "build-decision-1-1-engine.md"), engine);
+  const rel = "logs/build-decision-1-1.md";
+  const read = (r: string) => {
+    const f = path.join(tree, r);
+    return fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null;
+  };
+  return { tree, logDir, rel, read };
+}
+
 /** A pause file: its header lines, the loop question when `loop` is given, then one gap item. */
 const pause = (o: { headers: string[]; loop?: string | null; answer?: string | null }) =>
   [
@@ -73,7 +143,79 @@ describe("decision file readers", () => {
   });
 });
 
+describe("decision file readers", () => {
+  it("decisionItems reads the loop question and progress from the engine file", () => {
+    const { read, rel } = pauseDir(orchestratorFile(), engineFile());
+    const items = decisionItems(read, rel);
+    expect(items.map((i) => [i.n, i.title])).toEqual([
+      [1, "Verify"],
+      [2, "Task 3 [src/a.ts:10]"],
+    ]);
+    expect(items[0]!.options).toEqual(["Try again", "Decide"]);
+    expect(items[0]!.recommended).toBe("Decide");
+    expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
+    expect(items[1]!.recommended).toBe("Accept");
+  });
+
+  it("the engine file's Decision line wins for one question", () => {
+    const { read, rel } = pauseDir(
+      orchestratorFile({ answer: "Accept — the orchestrator wrote this" }),
+      engineFile({ q2: "Fix now — the engine file wrote this" }),
+    );
+    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
+    expect(q2.decision).toBe("Fix now — the engine file wrote this");
+    expect(q2.options).toEqual(["Accept", "Fix now"]);
+  });
+
+  it("decisionItems reads an old single-file layout like parseDecisionItems", () => {
+    const text = pause({ headers: SETTLED, loop: "B" });
+    const { read, rel } = pauseDir(text);
+    expect(decisionItems(read, rel)).toEqual(parseDecisionItems(text));
+  });
+
+  it("openDecision reads Gate and Source changed from the engine file's header", () => {
+    const { tree, logDir } = pauseDir(
+      orchestratorFile(),
+      engineFile({ headers: ["Source changed: true", "Gate: FAIL"] }),
+    );
+    const open = openDecision(logDir, tree, "build", 1);
+    expect(open).toMatchObject({
+      file: "logs/build-decision-1-1.md",
+      from: "verify",
+      question: "CHALLENGE",
+      group: 1,
+      gate: "FAIL",
+      sourceChanged: "true",
+      status: "OPEN",
+    });
+  });
+
+  it("a pause whose loop answer is Try again reads DECIDED", () => {
+    const { tree, logDir, rel } = pauseDir(
+      orchestratorFile(),
+      engineFile({ loop: "Try again — one more round" }),
+    );
+    expect(openDecision(logDir, tree, "build", 1, [rel])).toBeNull();
+    // The same pause with its loop question unanswered is still open.
+    const unanswered = pauseDir(orchestratorFile(), engineFile());
+    expect(
+      openDecision(unanswered.logDir, unanswered.tree, "build", 1, [unanswered.rel]),
+    ).toMatchObject({
+      status: "OPEN",
+    });
+  });
+});
+
 describe("gateRerun", () => {
+  it("re-runs a red-gate pause laid out in two files", () => {
+    const orchestrator = ["Question: VERIFY_GAPS", "From: verify", "Group: 1", ""].join("\n");
+    const { tree, logDir, read, rel } = pauseDir(orchestrator, engineFile());
+    const open = openDecision(logDir, tree, "build", 1);
+    expect(open).not.toBeNull();
+    const engine = read("logs/build-decision-1-1-engine.md")!;
+    expect(gateRerun(open, read(rel)!, engine)).toEqual({ gateRerun: true, rerunFrom: "verify" });
+  });
+
   const red = { gate: "FAIL", status: "OPEN", from: "holistic" };
   const loopOnly = pause({ headers: ["Status: OPEN", "From: holistic"], loop: null });
 
@@ -98,6 +240,16 @@ describe("gateRerun", () => {
 });
 
 describe("skipProblem", () => {
+  it("reads Source changed and the loop answer from the engine file", () => {
+    const orchestrator = orchestratorFile({ answer: "Accept — the caller caps it" });
+    const decided = engineFile({ headers: ["Source changed: false"], loop: "Decide" });
+    expect(skipProblem(orchestrator, decided)).toBeNull();
+    const again = engineFile({ headers: ["Source changed: false"], loop: "Try again" });
+    expect(skipProblem(orchestrator, again)).toBe(
+      'the loop question Q1 is "Try again", not Decide',
+    );
+  });
+
   it("is null when all five conditions hold", () => {
     expect(skipProblem(pause({ headers: SETTLED, loop: "B" }))).toBeNull();
     expect(skipProblem(pause({ headers: SETTLED }))).toBeNull();
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index 1949931eb..8c90d899f 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -108,13 +108,99 @@ export function parseDecisionItems(text: string): DecisionItem[] {
     });
 }
 
+/** The path of a decision file's engine sibling: `build-decision-1-2.md` → `build-decision-1-2-engine.md`. */
+export const engineSibling = (rel: string): string => rel.replace(/\.md$/, "-engine.md");
+
+/** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
+export const isEngineFile = (name: string): boolean => /-engine\.md$/.test(name);
+
+/**
+ * The items of a decision file merged with those of its engine file: items by question
+ * number, the engine file's answer winning for a question both hold, a question only the
+ * engine file holds (the loop question) kept as it is. With no engine text the result is
+ * `parseDecisionItems(text)`.
+ */
+export function mergeItems(text: string, engineText: string | null | undefined): DecisionItem[] {
+  const own = parseDecisionItems(text);
+  if (engineText === null || engineText === undefined) return own;
+  const merged = [...own];
+  for (const e of parseDecisionItems(engineText)) {
+    const i = merged.findIndex((m) => m.n === e.n);
+    const base = merged[i];
+    if (base === undefined) {
+      merged.push(e);
+      continue;
+    }
+    merged[i] = {
+      ...base,
+      decision: e.decision ?? base.decision,
+      assumed: e.decision === null ? base.assumed : e.assumed,
+      fixTask: e.fixTask ?? base.fixTask,
+      rejected: base.rejected || e.rejected,
+      deferred: base.deferred || e.deferred,
+    };
+  }
+  return merged.sort((a, b) => a.n - b.n);
+}
+
+/** The header of a decision file merged with its engine file's: the engine file's line wins for a name. */
+function mergeHeader(text: string, engineText: string | null | undefined): Record<string, string> {
+  return { ...decisionHeader(text), ...(engineText == null ? {} : decisionHeader(engineText)) };
+}
+
+/** Whether a file's text before its first item holds the `## Progress` block. */
+const hasProgress = (text: string | null | undefined): boolean =>
+  text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
+
+/**
+ * The items of the decision file `rel` merged with its `-engine.md` sibling. `read` returns a
+ * path's text, or null when the file is absent. The old single-file layout reads unchanged.
+ */
+export function decisionItems(read: (rel: string) => string | null, rel: string): DecisionItem[] {
+  return mergeItems(read(rel) ?? "", read(engineSibling(rel)));
+}
+
+/** The header of the decision file `rel` merged with its `-engine.md` sibling's, the engine file's line winning. */
+export function decisionFileHeader(
+  read: (rel: string) => string | null,
+  rel: string,
+): Record<string, string> {
+  return mergeHeader(read(rel) ?? "", read(engineSibling(rel)));
+}
+
+/**
+ * The `Status` a pause's items leave it in: `OPEN` while a question has no answer, except that
+ * the loop question answered `Try again` settles the pause; then `ASSUMED` while an assumed
+ * `Accept` remains; else `DECIDED`.
+ */
+export function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED" {
+  const loop = items.find((i) => i.options.includes("Try again"));
+  const settled = /^Try again\b/.test(loop?.decision ?? "");
+  if (!settled && items.some((i) => i.decision === null)) return "OPEN";
+  return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
+}
+
+/**
+ * The `Status` of a pause: a lone decision file that still carries a written `Status:` line
+ * (the old layout) is read as written; otherwise the status its merged items leave it in.
+ */
+export function pauseStatus(text: string, engineText?: string | null): string {
+  const written = decisionHeader(text).Status;
+  if (written !== undefined && (engineText === null || engineText === undefined)) return written;
+  return statusOf(mergeItems(text, engineText));
+}
+
 /**
  * Whether Q1 is the loop question (the text before the first item holds a `## Progress`
- * block), and the questions besides it that nobody answered, rejected or deferred.
+ * block, in the decision file or its engine file), and the questions besides it that nobody
+ * answered, rejected or deferred.
  */
-export function undecidedBesidesLoop(text: string): { hasLoop: boolean; undecided: string[] } {
-  const hasLoop = /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
-  const undecided = parseDecisionItems(text)
+export function undecidedBesidesLoop(
+  text: string,
+  engineText?: string | null,
+): { hasLoop: boolean; undecided: string[] } {
+  const hasLoop = hasProgress(text) || hasProgress(engineText);
+  const undecided = mergeItems(text, engineText)
     .filter(
       (i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred,
     )
@@ -134,9 +220,10 @@ export type RerunFrom = (typeof RERUN_FROM)[number];
 export function gateRerun(
   open: Pick<OpenDecision, "gate" | "status" | "from"> | null,
   text: string,
+  engineText?: string | null,
 ): { gateRerun: boolean; rerunFrom: RerunFrom | null } {
   const from = RERUN_FROM.find((f) => f === open?.from);
-  const { hasLoop, undecided } = undecidedBesidesLoop(text);
+  const { hasLoop, undecided } = undecidedBesidesLoop(text, engineText);
   const rerun =
     open?.gate === "FAIL" &&
     open.status === "OPEN" &&
@@ -156,13 +243,13 @@ const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;
  * header that reads `false`. Headers count only in the header block, so a line inside an item
  * never stands in for one. A missing fact refuses; it is never guessed.
  */
-export function skipProblem(text: string): string | null {
-  const header = decisionHeader(text);
+export function skipProblem(text: string, engineText?: string | null): string | null {
+  const header = mergeHeader(text, engineText);
   const from = header.From;
   if (from === undefined) return "no From header";
   if (from !== "verify" && from !== "holistic") return `From is "${from}", not verify or holistic`;
-  const { hasLoop } = undecidedBesidesLoop(text);
-  const items = parseDecisionItems(text);
+  const { hasLoop } = undecidedBesidesLoop(text, engineText);
+  const items = mergeItems(text, engineText);
   for (const it of items) {
     if (hasLoop && it.n === 1) continue;
     if (it.rejected) return `Q${it.n} is rejected, not Accept`;
@@ -219,32 +306,30 @@ export function openDecision(
     .sort((a, b) => b.n - a.n);
   for (const { f, n } of found) {
     const text = fs.readFileSync(path.join(logDir, f), "utf-8");
-    const field = (key: string) =>
-      new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
-    const status = field("Status");
+    const engineFile = path.join(logDir, engineSibling(f));
+    const engineText = fs.existsSync(engineFile) ? fs.readFileSync(engineFile, "utf-8") : null;
+    const header = mergeHeader(text, engineText);
+    const status = pauseStatus(text, engineText);
     const rel = path.relative(tree, path.join(logDir, f));
     const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
     if (status !== "OPEN" && !unfinished) continue;
-    // `Gate:` counts only in the header block (the lines before the first blank line).
-    const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
-    const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
     const num = (key: string) => {
-      const v = field(key);
-      return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
+      const v = header[key];
+      return v !== undefined && /^[0-9]+$/.test(v) ? Number(v) : null;
     };
     return {
       file: rel,
       decision: n,
-      question: field("Question"),
-      from: field("From"),
+      question: header.Question ?? null,
+      from: header.From ?? null,
       pauseStep: num("Pause step"),
       group: num("Group"),
       verifyAttempt: num("Verify attempt"),
       testAttempt: num("Test attempt"),
-      plan: field("Plan"),
-      gate,
-      sourceChanged: field("Source changed"),
-      status: status ?? "OPEN",
+      plan: header.Plan ?? null,
+      gate: header.Gate ?? null,
+      sourceChanged: header["Source changed"] ?? null,
+      status,
     };
   }
   return null;
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 95300e36b..c919d2f57 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -899,6 +899,41 @@ describe("bkit status resume gate re-run", () => {
     expect(r.json).toMatchObject({ gateRerun: true, rerunFrom: "verify" });
   });
 
+  it("re-runs the gate of a red-gate pause laid out in two files", async () => {
+    const orchestrator = [
+      "Question: VERIFY_GAPS",
+      "From: verify",
+      "Group: 1",
+      "",
+      "**Q2 — Task 3 gap:** accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — minor",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "Decision: Accept — minor",
+      "",
+    ].join("\n");
+    const engine = [
+      "Source changed: false",
+      "Gate: FAIL",
+      "",
+      "build verify: attempt 3 of 3",
+      "",
+      "## Progress",
+      "",
+      "**Q1 — Verify:** another fix round?",
+      "A) Try again — another fix round runs",
+      "B) Stop — the run ends here",
+      "Recommended: A) Try again — the last round made progress",
+      "",
+    ].join("\n");
+    const file = stopped(orchestrator);
+    fs.writeFileSync(path.join(path.dirname(file), "build-decision-1-1-engine.md"), engine);
+    const r = await resume(file);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ gateRerun: true, rerunFrom: "verify" });
+  });
+
   it("status resume prints gateRerun false when another question is undecided", async () => {
     const r = await resume(stopped(pauseFile({ items: [["Task 3 gap", null]] })));
     expect(r.code).toBe(0);
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index e7e042ae1..9b7e3c746 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -42,7 +42,7 @@ import {
   type RunContext,
 } from "../lib.js";
 import { fixTestStep, gatedCheckStep } from "./loops.js";
-import { gateRerun, openDecision } from "./open-decision.js";
+import { engineSibling, gateRerun, openDecision } from "./open-decision.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 
 // ---------------------------------------------------------------------------
@@ -889,6 +889,9 @@ export const statusCommand: CommandSpec = {
           ...gateRerun(
             open,
             open === null ? "" : fs.readFileSync(path.resolve(root, open.file), "utf-8"),
+            open === null || !fs.existsSync(path.resolve(root, engineSibling(open.file)))
+              ? null
+              : fs.readFileSync(path.resolve(root, engineSibling(open.file)), "utf-8"),
           ),
           ...round,
         });
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 71edf70d0..dface2bc6 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -46,7 +46,7 @@ import { activeRunStart, savedPointLimit } from "./counters.js";
 import type { AskPoint } from "../../shared/settings.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { skipProblem } from "./open-decision.js";
+import { engineSibling, skipProblem } from "./open-decision.js";
 import { mergeFindings, parseFindings, reportSection } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
@@ -1110,7 +1110,8 @@ function continueCheck(cwd: string, decisionFile: string | undefined): Check {
     return { check, ok: false, detail: "no decision file: pass it as the first --artifact" };
   const read = readTextFile(path.resolve(cwd, decisionFile));
   if (!read.ok) return { check, ok: false, detail: `${decisionFile} is missing or unreadable` };
-  const problem = skipProblem(read.text);
+  const engine = readTextFile(path.resolve(cwd, engineSibling(decisionFile)));
+  const problem = skipProblem(read.text, engine.ok ? engine.text : null);
   return problem === null
     ? { check, ok: true, detail: `${decisionFile} passes decisions skip` }
     : { check, ok: false, detail: `${decisionFile}: ${problem}` };
diff --git a/.bkit/core/engine/commands/workflow/summary-findings.ts b/.bkit/core/engine/commands/workflow/summary-findings.ts
index 4b9d5c3fb..42d108de0 100644
--- a/.bkit/core/engine/commands/workflow/summary-findings.ts
+++ b/.bkit/core/engine/commands/workflow/summary-findings.ts
@@ -7,7 +7,7 @@ import {
 } from "./challenge.js";
 import type { PlanTaskBlock } from "./plan-blocks.js";
 import type { SummaryInput } from "./summary.js";
-import { parseDecisionItems } from "./open-decision.js";
+import { decisionItems } from "./open-decision.js";
 
 type Row = Record<string, unknown>;
 type Task = PlanTaskBlock & { path: string };
@@ -148,7 +148,7 @@ export function challengeResolution(
     });
     const label = `build-challenge round ${round}: ${f.severity} ${f.location}`;
     const accepted = input.decisionFiles.some((p) =>
-      parseDecisionItems(input.read(p) ?? "").some(
+      decisionItems(input.read, p).some(
         (item) =>
           /^Accept\b/.test(item.decision ?? "") &&
           [...item.text.matchAll(/(?<![\w@./-])[\w@./-]*[A-Za-z_][\w@./-]*:\d+/g)].some(
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index c2ba02b74..bbcd18d7d 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -5,7 +5,7 @@
 
 import { coversList, type Plan, type Workstream } from "./plans.js";
 import { issueIdOf, type FidTracker } from "./fids.js";
-import { decisionHeader, parseDecisionItems } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, isEngineFile } from "./open-decision.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
@@ -430,15 +430,14 @@ export function buildSummary(input: SummaryInput): Summary {
     >();
     input.rows.forEach((row, index) => {
       if (row.type !== "step-done" || row.step !== "build-decision") return;
-      for (const rel of artifactsOf(row)) {
-        const text = read(rel);
-        if (text === null) continue;
-        const header = decisionHeader(text);
+      for (const rel of artifactsOf(row).filter((a) => !isEngineFile(a))) {
+        if (read(rel) === null) continue;
+        const header = decisionFileHeader(read, rel);
         const rule = PAUSE_RULES[header.From ?? ""];
         if (rule === undefined) continue;
         const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
         if (rule.grouped && group === undefined) continue;
-        const items = parseDecisionItems(text);
+        const items = decisionItems(read, rel);
         const gaps = items.filter((i) => i.title !== rule.loop);
         const loop = items.filter((i) => i.title === rule.loop);
         if (gaps.length === 0) continue;
@@ -582,9 +581,10 @@ export function buildSummary(input: SummaryInput): Summary {
   // The Decision Pause: accepted items in this run's decision files.
   const decided = groups
     .filter((g) => g.step === "build-decision")
-    .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
+    .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)))
+    .filter((rel) => !isEngineFile(rel));
   const acceptItems = decided.flatMap((rel) =>
-    parseDecisionItems(read(rel) ?? "")
+    decisionItems(read, rel)
       .filter((i) => /^Accept\b/.test(i.decision ?? ""))
       .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })),
   );
@@ -601,7 +601,7 @@ export function buildSummary(input: SummaryInput): Summary {
   const unconfirmed =
     workflow === "ship"
       ? input.decisionFiles.flatMap((rel) =>
-          parseDecisionItems(read(rel) ?? "")
+          decisionItems(read, rel)
             .filter((i) => i.assumed)
             .map((i) => `\`${rel}\` Q${i.n} — ${i.title}${i.rejected ? " (rejected)" : ""}`),
         )
@@ -833,7 +833,8 @@ export function buildSummary(input: SummaryInput): Summary {
   items.push(...accepted.map((a) => `- Accepted: ${a}`));
   items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
   for (const rel of workflow === "build" ? input.decisionFiles : []) {
-    if (!/^Decision:/m.test(read(rel) ?? "")) items.push(`- \`${rel}\`: no decision recorded`);
+    if (decisionItems(read, rel).every((i) => i.decision === null))
+      items.push(`- \`${rel}\`: no decision recorded`);
   }
   for (const p of input.plans) {
     const lines = p.text.split(/\r?\n/);
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index dbe556b44..9ed1dd723 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -18,7 +18,7 @@ import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
-import { decisionHeader, parseDecisionItems } from "./open-decision.js";
+import { decisionFileHeader, decisionItems } from "./open-decision.js";
 const DIFF_BASE = "origin/dev";
 import {
   derivedTestMatrix,
@@ -157,10 +157,9 @@ export function gapsShortfall(text: string): string | null {
 /**
  * The first header fact that stops `--decision` from ticking, or null: `From` is `verify` or
  * `holistic`, no `Gate: FAIL` header, and a verify file's `Group` is `group`. Headers count
- * only in the header block (`decisionHeader`).
+ * only in the header block, merged with the engine file's (`decisionFileHeader`).
  */
-function decisionProblem(text: string, group: number | undefined): string | null {
-  const header = decisionHeader(text);
+function decisionProblem(header: Record<string, string>, group: number | undefined): string | null {
   const from = header.From;
   if (from === undefined) return "no From header";
   if (from !== "verify" && from !== "holistic") return `From is "${from}", not verify or holistic`;
@@ -474,17 +473,17 @@ export const tasksCommand: CommandSpec = {
         if (decisionArg === "") throw new CommandError(EXIT.USAGE, "--decision must be non-empty");
         if (tasksFlag === undefined && greenArg === undefined && decisionArg === undefined)
           throw new CommandError(EXIT.USAGE, "give one of --tasks, --green and --decision");
-        let decisionText: string | undefined;
+        let decisionFile: string | undefined;
+        const readDecision = (p: string) => (fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null);
         if (decisionArg !== undefined) {
-          const decisionFile = path.resolve(ctx.cwd, decisionArg);
+          decisionFile = path.resolve(ctx.cwd, decisionArg);
           if (fs.statSync(decisionFile, { throwIfNoEntry: false })?.isFile() !== true)
             throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
-          decisionText = fs.readFileSync(decisionFile, "utf-8");
         }
         // Only a holistic decision alone may leave out --group: its accepted tasks span groups.
         const holisticOnly =
-          decisionText !== undefined &&
-          decisionHeader(decisionText).From === "holistic" &&
+          decisionFile !== undefined &&
+          decisionFileHeader(readDecision, decisionFile).From === "holistic" &&
           tasksFlag === undefined &&
           greenArg === undefined;
         if (group === undefined && !holisticOnly)
@@ -501,15 +500,15 @@ export const tasksCommand: CommandSpec = {
               `TASK ${n} is in group ${task.group}, not group ${group}`,
             );
         }
-        if (decisionText !== undefined) {
-          const problem = decisionProblem(decisionText, group);
+        if (decisionFile !== undefined) {
+          const problem = decisionProblem(decisionFileHeader(readDecision, decisionFile), group);
           if (problem !== null)
             throw new CommandError(
               EXIT.USAGE,
               `--decision ${decisionArg}: ${problem}, so nothing is ticked`,
             );
           // A title names its task only at its start (`Task {N}`): a gap that mentions a task elsewhere ticks nothing.
-          const accepted = parseDecisionItems(decisionText)
+          const accepted = decisionItems(readDecision, decisionFile)
             .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
             .map((it) => /^task\s+(\d+)\b/i.exec(it.title.trim()))
             .filter((m): m is RegExpExecArray => m !== null)
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 8a47448f2..265873ac4 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -3677,6 +3677,34 @@ describe("bkit workflows summary", () => {
     expect(md).toContain("ship-failure-remediate");
   });
 
+  it("counts an assumed item in an engine file once", async () => {
+    const cwd = tree(
+      [done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
+      undefined,
+      "ship",
+    );
+    const item = (decision: string) =>
+      [
+        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept — the item is recorded as accepted",
+        "B) Fix now — a fix task is added to the plan",
+        "Recommended: A) Accept — the caller already caps it",
+        `Decision: ${decision}`,
+        "",
+      ].join("\n");
+    const assumed =
+      "A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)";
+    write(
+      cwd,
+      `${SREL}/build-decision-1-1.md`,
+      `Question: CHALLENGE\nFrom: challenge\n\n${item(assumed)}`,
+    );
+    write(cwd, `${SREL}/build-decision-1-1-engine.md`, `Source changed: false\n\n${item(assumed)}`);
+    const r = await summarize(cwd, "ship");
+    expect(r.code).toBe(0);
+    expect(r.json.reasons).toContain("shipped with 1 assumed item(s) the owner did not confirm");
+  });
+
   it("summary is FAIL when a plan task is not done", async () => {
     const cwd = tree(
       [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index bc05d3e64..8c7aaad12 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -128,7 +128,7 @@ import {
   resolveMonth,
   workflowLockPath,
 } from "./locks.js";
-import { openDecision } from "./open-decision.js";
+import { isEngineFile, openDecision } from "./open-decision.js";
 import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
@@ -1807,7 +1807,7 @@ function summaryVerb(ctx: RunContext): number {
       (workflow === "build" || workflow === "ship") && fs.existsSync(logDir)
         ? fs
             .readdirSync(logDir)
-            .filter((f) => /^build-decision-.*\.md$/.test(f))
+            .filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
             .sort()
             .map((f) => rel(path.join(logDir, f)))
         : [],
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 82982820f..83c87c710 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -54,7 +54,7 @@ description: "Build Feature — Autonomous implementation"
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -74,7 +74,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -136,7 +136,19 @@ _No tracker connected, skip step._
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -154,27 +166,25 @@ _No tracker connected, skip step._
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -191,8 +201,8 @@ _No tracker connected, skip step._
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -207,7 +217,7 @@ _No tracker connected, skip step._
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -226,7 +236,7 @@ _No tracker connected, skip step._
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -234,14 +244,14 @@ _No tracker connected, skip step._
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -250,8 +260,10 @@ _No tracker connected, skip step._
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -266,7 +278,7 @@ _No tracker connected, skip step._
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -317,7 +329,7 @@ _No tracker connected, skip step._
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -329,12 +341,12 @@ _No tracker connected, skip step._
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -352,14 +364,11 @@ _No tracker connected, skip step._
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 47f0c7f8a..3f3636fba 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -54,7 +54,7 @@ description: "Build Feature — Autonomous implementation"
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -74,7 +74,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -163,7 +163,19 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -181,27 +193,25 @@ description: "Build Feature — Autonomous implementation"
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -218,8 +228,8 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -234,7 +244,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -253,7 +263,7 @@ description: "Build Feature — Autonomous implementation"
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -261,14 +271,14 @@ description: "Build Feature — Autonomous implementation"
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -277,8 +287,10 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -293,7 +305,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -344,7 +356,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -356,12 +368,12 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -379,14 +391,11 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 442b8c4bc..420865547 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1155,7 +1155,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:502`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:511`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1252,7 +1252,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:502`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:511`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -10088,7 +10088,7 @@ Hold `challengeRound` as `CHALLENGE_ROUND` and `challengeDone` as `CHALLENGE_DON
 **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → the **Open decision** steps below.
 **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
 **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
-**Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+**Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
 Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
 Set `PAUSE_POINT` = `build.{from}`.
 **If** `from` = `challenge` → restore the round's tasks:
@@ -10117,7 +10117,7 @@ Go to **Decision Pause**.
 Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
 **If** `GATE_VERDICT` = FAIL → also set `PAUSE_LOOP` = `holistic`, so the pause asks the loop question about the red gate.
 Go to **Decision Pause**.
-**Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+**Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 [secrets; workflow-pushes] List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout).
 **If** `PUBLISH` = false **or** `PUBLISH` is not held yet → keep the record in the worktree, linked by branch, and NEVER pass `--push`, because a held run pushes nothing and neither does a failure before `status route` resolves `publish`:
@@ -10138,17 +10138,16 @@ Title each item with its task number, when it has one, followed by its `Location
 **Else** → options `Accept` and `Fix now`, with a recommendation per finding.
 **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
 **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
-Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
-`{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-`{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-**If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-**If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-**If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-`{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
-**If** `decisions compose` exits non-zero → **Failure Path**.
+Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+Offer only the file's options for each question; NEVER add one.
+**If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
+**If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 **If** exit 4 **and** `RUNTIME_HEADLESS` = true → **Failure Path** naming each printed `hardBlockers` question.
 **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
-Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
 Route — first match wins:
 **If** `GATE_VERDICT` = FAIL → sub-step 8, for a round that fixes the gate.
 **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
@@ -10166,7 +10165,7 @@ Route — first match wins:
 **If** the owner says stop, **or** answers `Stop` → step 8.
 **If** the loop question is answered `Try again` → step 6. The items then need no decision.
 **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
 Record the wait with the `owner-pause` block above.
 End the turn and wait for the answers.
 Apply each decision:
@@ -10184,7 +10183,6 @@ Append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.m
 **Fix now**:
 Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
 **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
 **If** the item is a challenge task → rewrite that task in place to the owner's direction:
 Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
 Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -10192,25 +10190,25 @@ Keep the task's number, title, group and meta line, `**Fixable:** false` include
 Keep the task open. Step 7 builds the rewritten block.
 **Else** → write a new task block:
 Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
 Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
 Shape the task by the owner's direction, when the owner gave one.
-Place the task block:
+Place it:
 **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
 **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
-A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
 Then check the plan:
 **If** exit non-zero → **Failure Path** naming each problem in the report.
 Write the decisions into the decision file:
 Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
 Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+Record the owner's loop answer:
+Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 [commits] **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 **If** `From: challenge` **and** either an item was answered `Fix now` **or** a task of `CHALLENGE_TASKS` was not an item:
 `DECISION_ROUTE` = `fix`.
 **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
-**If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+**If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
 Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 Derive the attempt the holistic report is named for:
 **If** `HOLISTIC_VERDICT` = CONCERNS **and** `HOLISTIC_FAILURES` = 0 **and** `GATE_VERDICT` != FAIL → Step 11. No gap is open: the report's concern is a group count, which the summary lists.
@@ -10233,7 +10231,7 @@ No-progress holistic round routed
 **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
 **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
 **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-**If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+**If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 **If** exit 1 → keep the re-run: the next rule sets the route. The printed fact says why the check runs again.
 **If** `From: verify` → `DECISION_ROUTE` = `verify`.
 **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -10247,22 +10245,19 @@ No-progress holistic round routed
 **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
 **If** `DECISION_ROUTE` = `retry` → Step 13.
 **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-**If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+**If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
 **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
 **If** `DECISION_ROUTE` = `summary` → Step 15.
-[workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+[workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
 [workflow-pushes] **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
 [workflow-pushes] **Else** → push the record, but NEVER onto a branch with an open PR:
 Release the lock. NEVER run `workflows fail`:
 Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
-Red gate checked against the base commit (`tests base`), its verdict in the decision file
-Decision file written (`decisions compose`)
+Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 Hard blockers asked in a session, or sent to the Failure Path when headless
-Acceptances written only on the owner's approval
-Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-Fix now tasks checked (`tests plan-check`)
+Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 Resolve the repo, the branch and how far the branch is behind `dev`:
 **If** `open` > 0 → **Failure Path** naming the open `blockers`.
 **If** exit 80:
diff --git a/.bkit/version b/.bkit/version
index 520eb861b..8438930ae 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -12,7 +12,7 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "2b0c16b2a7c783ad8d1d1f8160b62b8afa5369c7c179064c10db836e70de9744",
-    ".claude/commands/bkit-build.md": "e94700ac5b2ea47090007aabad755373714ba0ff6643e9bd35c7057b17bbfc8b",
+    ".claude/commands/bkit-build.md": "cab019a76f058801cdec4bd17424daa536628b5102a2a79a24c5a1fb9917b665",
     ".claude/commands/bkit-debug.md": "5df71ba2c50ab99b9ce581d188b10670d2fb1802bccf34c0bc58b198e5c2260d",
     ".claude/commands/bkit-design.md": "fff521998b047484c1c7e49ec0667b48b91b3b9fa9fadaa3c4856d8d4c8b2ee0",
     ".claude/commands/bkit-plan.md": "a0b513d4a1a3f637c7b74267fdca398843e2575c438a3042fc1ffe61c5e183b6",
@@ -44,7 +44,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "28471fc3de9f81742c3111c3b4f9abe67f4c020f05c0d26574eae6db1580f41b",
-    ".cursor/commands/bkit-build.md": "6025e9c9f7f71e1b23d4ed2088b3e736bf4067e535f80f5d344a3980c6a957de",
+    ".cursor/commands/bkit-build.md": "2567372ea64a9c562002c57775c4137d34958839bfa8db38e46e1afa0cdce850",
     ".cursor/commands/bkit-debug.md": "5606e8e098a206920df6447cfa15e7c2675b4ed5cbc5cbfef496f354044dcd47",
     ".cursor/commands/bkit-design.md": "a9feba0b566172ba5e81ac19fe1e5fedc19be51a94562e9d9f2a857119afad17",
     ".cursor/commands/bkit-plan.md": "8a2853a9b696588708b93c62213608e5e8c7b1ce0c3fddb78c199530fb4c1225",
@@ -102,7 +102,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "7695e7b766a5d89b516befb2bcaed679018bbe8b6708ea497af9a805270f085c",
-    ".opencode/commands/bkit-build.md": "ac0606fd6b1a4340c735231b4d2b02f6f77869f921afae99cf0f0dde2c22932f",
+    ".opencode/commands/bkit-build.md": "68454ae18f6a3176fcb075aa7a4cd92ab8c1180e45b4b57a56bb54b304e8e616",
     ".opencode/commands/bkit-debug.md": "e7f01ee61c0740b6e9ac632f79ccc2c69e7aa630f66ff2727cf9c0a7e0bce5b2",
     ".opencode/commands/bkit-design.md": "937c3d73c6eaef08c1fa466a406f6f303dde4115365affcc606fb016fa31942a",
     ".opencode/commands/bkit-plan.md": "b7fac6c8ee4c98735baaec66c090b7fab80d6bd7b776f559fcf75ae926043b08",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "62a66c02c67cc8e0b39dc0cf4c2ab87ee534a4b38ff712e8961839761c5d9a37",
+    ".bkit/cli.md": "5f158eca100857ba8b9190e6e7c556e50c64e6972f6dd5d28db0aa1df8bfdf3f",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index d05278b41..ccad43a95 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -55,7 +55,7 @@ description: "Build Feature — Autonomous implementation"
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -75,7 +75,7 @@ description: "Build Feature — Autonomous implementation"
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -144,7 +144,19 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -162,27 +174,25 @@ description: "Build Feature — Autonomous implementation"
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -199,8 +209,8 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -215,7 +225,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -234,7 +244,7 @@ description: "Build Feature — Autonomous implementation"
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -242,14 +252,14 @@ description: "Build Feature — Autonomous implementation"
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -258,8 +268,10 @@ description: "Build Feature — Autonomous implementation"
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -274,7 +286,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -325,7 +337,7 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -337,12 +349,12 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -360,14 +372,11 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index d01ac8393..67e3c8cc2 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -54,7 +54,7 @@ Build Feature — Autonomous implementation
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -74,7 +74,7 @@ Build Feature — Autonomous implementation
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -143,7 +143,19 @@ Build Feature — Autonomous implementation
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -161,27 +173,25 @@ Build Feature — Autonomous implementation
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -198,8 +208,8 @@ Build Feature — Autonomous implementation
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -214,7 +224,7 @@ Build Feature — Autonomous implementation
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -233,7 +243,7 @@ Build Feature — Autonomous implementation
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -241,14 +251,14 @@ Build Feature — Autonomous implementation
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -257,8 +267,10 @@ Build Feature — Autonomous implementation
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -273,7 +285,7 @@ Build Feature — Autonomous implementation
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -324,7 +336,7 @@ Build Feature — Autonomous implementation
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -336,12 +348,12 @@ Build Feature — Autonomous implementation
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -359,14 +371,11 @@ Build Feature — Autonomous implementation
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 5460947ed..b45953870 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -58,7 +58,7 @@ $ARGUMENTS
     - **If** `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 9.
     - **If** `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), then sub-step 2, then sub-step 5.
     - **Else** → Step `number`.
-  - **Open decision:** `openDecision` is a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
+  - **Open decision:** `openDecision` is a decision file whose pause reads `OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after **Decision Pause** step 6 wrote the answers. Resume from it:
     1. Hold its `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT` and `sourceChanged` as `SOURCE_CHANGED` (null stays unset).
     2. Set `PAUSE_POINT` = `build.{from}`.
     3. **If** `from` = `challenge` → restore the round's tasks:
@@ -78,7 +78,7 @@ $ARGUMENTS
        - **If** `rerunFrom` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged → Step 8 sub-step 8.
        - **If** `rerunFrom` = `holistic` → `HOLISTIC_VERDICT` = PASS → Step 10 sub-step 5.
        - **Else** → Step 12, the tests gate.
-- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision files (`build-decision-{RUN}-*.md`, the `-engine.md` ones too) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → `locks acquire` exits 8 and the run stops without the **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -147,7 +147,19 @@ $ARGUMENTS
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write the decision file `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md` with the file tool:
+   - Header lines `Question: {PAUSE_QUESTION}`, `From: {verify|holistic|challenge|tests|summary}`, `Pause step: {PAUSE_STEP}`, `Plan: docs/plans/{YYYYMM}/{FID}-plan.md`, plus `Group: {GROUP}` and `Verify attempt: {VERIFY_ATTEMPT}` (verify), `Holistic attempt: {HOLISTIC_ATTEMPT}` (holistic) or `Test attempt: {TEST_ATTEMPT}` (tests), then a blank line. NEVER write `Source changed`, `Gate` or `Status`: the engine writes them.
+   - One question per item, in item order, from `Q2` when the pause has a loop (`PAUSE_LOOP` set, or `TESTS_LOOP`), else from `Q1`:
+     ```
+     **Q{n} — {title}:** {question}
+     A) {name} — {what happens if the owner picks it}
+     B) {name} — {what happens if the owner picks it}
+     Recommended: A) {name} — {reason}
+     Default if unanswered: the run waits for you; taken as {letter} when nobody can be asked
+     ```
+     A hard blocker (no agent can settle it) has `Recommended: none — {why}` and a `Default if unanswered:` line saying the run stops when nobody can be asked. Default effects: `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `the run stops and hands over; the next run resumes here`. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+
+   Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-{RUN}-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
@@ -165,27 +177,25 @@ $ARGUMENTS
    - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
-   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+   Check a red gate against the base commit. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`; `{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log` when `PAUSE_STEP` = 10; else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
    ```bash
    "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
    ```
 
-   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+   **If** `tests base` exits non-zero → **Failure Path**; every verdict, `unknown` included, exits 0.
+
+   **If** `PAUSE_QUESTION` != `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` → the engine writes its counts into the `-engine.md` file beside the decision file. `{COUNT_FLAGS}` = `--source-changed={SOURCE_CHANGED}` (verify or holistic), `--base-check="{OUTBOX}/base-check.json"` (base check ran), and for a pause with a loop `--file="{STATUS}" --max={PAUSE_MAX}` with `--loop=tests --attempt={TEST_ATTEMPT}` (`TESTS_LOOP`), `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT}` (`PAUSE_LOOP` = `verify`) or `--loop=holistic --attempt={HOLISTIC_ROUNDS}` (`PAUSE_LOOP` = `holistic`):
 
-   Compose the file with these flags:
-   - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
-   - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
-   - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}" --header="Source changed={SOURCE_CHANGED}"` to `{HEADER_FLAGS}`.
-   - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
-   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
+   ```bash
+   "{BKIT}" decisions counts --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {COUNT_FLAGS}
+   ```
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
+   "{BKIT}" decisions check --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
    ```
 
-   **If** `decisions compose` exits non-zero → **Failure Path**.
+   **If** either command exits non-zero → **Failure Path**, except `decisions check` exit 6: fix the file as the printed `problem` says and run it once more; a second exit 6 → **Failure Path**.
 
 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
    ```bash
@@ -202,8 +212,8 @@ $ARGUMENTS
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
-   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
+   - One message = the engine file's attempt line, `## Progress` block and `Q1` first (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the reply line (below); plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add one.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -218,7 +228,7 @@ $ARGUMENTS
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
      - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
-       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
+       - Discuss the follow-ups with the owner; ask a `Fix now` with no direction what it should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -237,7 +247,7 @@ $ARGUMENTS
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
-     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`; `{N}` is the task that carries its fix (the rewritten challenge task, the new block, or the task an existing line names).
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -245,14 +255,14 @@ $ARGUMENTS
        - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
-       - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Give it `**DONE WHEN:**` and a `**TEST FIRST:**` written the same way.
        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
        - Shape the task by the owner's direction, when the owner gave one.
-       - Place the task block:
+       - Place it:
          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
-     - A fix that changes what an earlier task's planned test asserts names that test, with the same file and the same name, on the rewritten or new task's `**TEST FIRST:**` too: the build then takes the test over and records it failing again, and `tests plan-check` lists it under `takeovers`.
+     - A fix that changes what an earlier task's planned test asserts names that test (same file, same name) on the rewritten or new task's `**TEST FIRST:**` too: the build takes it over and records it failing again, and `tests plan-check` lists it under `takeovers`.
      - Then check the plan:
        ```bash
        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
@@ -261,8 +271,10 @@ $ARGUMENTS
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}` only under an item that has none; a reopened file keeps the line it has.
    - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
-   - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
-   - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+   - Record the owner's loop answer:
+     ```bash
+     "{BKIT}" decisions apply --by=owner --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" --q=1 --answer="{Try again|Decide|Stop}" --reason="{owner's words}"
+     ```
 
    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
 
@@ -277,7 +289,7 @@ $ARGUMENTS
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run. It reads the decision file's header and answers:
+   - **If** `From: verify` **or** `From: holistic` → ask the engine whether the answers settle the check, so the run can skip its re-run:
 
      ```bash
      "{BKIT}" decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
@@ -328,7 +340,7 @@ $ARGUMENTS
 
    **If** exit != 0 → **Failure Path**.
 
-   Record the decision and its route. The loop counts are not reset:
+   Record the decision and its route. **If** the pause has an engine file → add it as a second `--artifact` (`…-<attempt>-engine.md`). The loop counts are not reset:
 
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
@@ -340,12 +352,12 @@ $ARGUMENTS
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 9.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run step 6's verify `tasks tick` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
-   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added and goes straight to Step 10 when no group is open.
+   - **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group a holistic fix added, else goes to Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file and its engine file, plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
@@ -363,14 +375,11 @@ $ARGUMENTS
 
 ### 🔒 Gate — Decision Pause
 
-- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
-- [ ] Decision file written (`decisions compose`)
+- [ ] Red gate checked against the base commit (`tests base`); counts written (`decisions counts`); decision file checked (`decisions check`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
-- [ ] Acceptances written only on the owner's approval
-- [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
-- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
-- [ ] Fix now tasks checked (`tests plan-check`)
+- [ ] Acceptances written only on the owner's approval; assumed ones left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line, and checked (`tests plan-check`)
 - [ ] Verify or holistic pause routed `continue` only when `decisions skip` exited 0: the accepted tasks ticked (`tasks tick --decision`, made before the decision is recorded), then holistic to Step 11 and verify to Step 7, with no new verify round
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/DETAILS.md b/DETAILS.md
index 69386527f..877d04e3b 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,15 +347,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1967 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1960 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index b39decd85..4a24f7385 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -26,7 +26,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit } from "../lib.js";
 import { EXIT_BASE, diffNumstat } from "./context.js";
 import { defaultRange } from "./feature-base.js";
-import { parseDecisionItems } from "./open-decision.js";
+import { decisionItems, isEngineFile } from "./open-decision.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks, testTier } from "./plan-blocks.js";
 import { readBkitConfig } from "../../shared/settings.js";
@@ -185,10 +185,13 @@ export function mergeFindings(reports, accepted) {
 export function acceptedLocations(logDir, cwd) {
     const out = new Set();
     const files = fs.existsSync(logDir)
-        ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f))
+        ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
         : [];
     for (const file of files) {
-        const items = parseDecisionItems(fs.readFileSync(path.join(logDir, file), "utf-8"));
+        const items = decisionItems((rel) => {
+            const abs = path.join(logDir, rel);
+            return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+        }, file);
         for (const item of items) {
             if (!/^Accept\b/.test(item.decision ?? ""))
                 continue;
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index bea96de42..9886521bd 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -1,6 +1,12 @@
-// bkit decisions compose|apply|skip|pending — the build's decision files, from question to ship.
+// bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
+// A pause holds two files. The orchestrator writes the decision file (`build-decision-{RUN}-{N}.md`):
+// its header and its questions. The engine writes the `-engine.md` sibling: the lines only it can
+// count (`Source changed`, `Gate`, the attempt line, the progress block, the loop question Q1) and
+// every `Decision:` line `apply` writes. `decisionItems` reads the two as one pause. The engine
+// never edits the orchestrator's file and writes no `Status` line: `Status` is read from the items.
+//
 // A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
 // lines, an optional progress block, then one item per question:
 //
@@ -16,7 +22,7 @@
 // and `No recommendation — {why}` in place of `Recommended: none — {why}`.
 //
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
-// `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
+// `Accept` is written `Accept (assumed)` and the pause reads `ASSUMED`. It never writes a
 // `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
 // assumed items with `pending`; the owner confirms each (`apply --by=owner --confirm`, which
 // writes the real acceptance) or rejects it, and `pending --defer` writes one `needs-decision`
@@ -24,26 +30,17 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { readJsonFile, readTextFile } from "../../shared/json.js";
-import { oneLine } from "../../shared/text.js";
 import { CommandError, EXIT, git } from "../lib.js";
 import { loopProgress } from "./counters.js";
 import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
-import { ITEM_SPLIT, letterAt, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, engineSibling, isEngineFile, ITEM_SPLIT, letterAt, mergeItems, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
 import { classifyAt } from "./runtime.js";
 import { positiveInt, str } from "./status.js";
 /** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
 export const EXIT_HARD_BLOCKERS = 4;
-/** Options one item may hold: one per letter, `A` to `Z`. */
-const MAX_OPTIONS = 26;
 /** The option list as it is written: `A) {A} / B) {B}`. */
 const letteredOptions = (options) => options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
-/** The letter `name` holds in `options`, or null when it is not one of them. */
-const letterOf = (options, name) => options.includes(name) ? letterAt(options.indexOf(name)) : null;
-/** `Status:` set to `status`. */
-const withStatus = (text, status) => /^Status:.*$/m.test(text)
-    ? text.replace(/^Status:.*$/m, `Status: ${status}`)
-    : `Status: ${status}\n${text}`;
 /** `extra` lines added under item `n`'s last line. */
 function addUnder(text, n, extra, replace) {
     const parts = text.split(ITEM_SPLIT);
@@ -56,12 +53,6 @@ function addUnder(text, n, extra, replace) {
     parts[i] = [...kept, ...extra].join("\n") + trail;
     return parts.join("");
 }
-/** The status a file's items leave it in. */
-function statusOf(items) {
-    if (items.some((i) => i.decision === null))
-        return "OPEN";
-    return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
-}
 const today = () => new Date().toISOString().slice(0, 10);
 const readText = (file) => {
     if (!fs.existsSync(file))
@@ -126,88 +117,104 @@ function readBaseCheck(file) {
         adopt,
     };
 }
+/** Exit code: `check` refused the orchestrator's decision file. */
+export const EXIT_BAD_DECISION = 6;
+/** A decision file's text, or null when the path is missing. */
+const readIf = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
+/**
+ * The first item rule a decision file breaks, naming the question, or null. Each question needs
+ * lettered options in order (`A) {name} — {effect}`), a `Recommended:` line that names one of
+ * them (or `none` for a hard blocker) and a `Default if unanswered:` line; no number repeats; and
+ * `Q1` is the engine's when the engine file holds the loop question.
+ */
+export function itemProblem(text, engineText) {
+    const seen = new Set();
+    const engineHasLoop = engineText !== null && /^## Progress$/m.test(engineText);
+    for (const part of text.split(ITEM_SPLIT).slice(1)) {
+        const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
+        const q = `Q${n}`;
+        if (seen.has(n))
+            return `${q} appears twice; number each question once`;
+        seen.add(n);
+        if (n === 1 && engineHasLoop)
+            return "Q1 is the loop question the engine file holds; number your questions from Q2";
+        const optionLines = [...part.matchAll(/^([A-Z])\)[ \t]+(.*?)[ \t]*$/gm)];
+        if (optionLines.length === 0)
+            return `${q} has no lettered options; write one line per option: "A) {name} — {what happens}"`;
+        for (const [i, m] of optionLines.entries()) {
+            if (m[1] !== letterAt(i))
+                return `${q}: option letters must run A, B, C in order; found ${m[1]}) where ${letterAt(i)}) belongs`;
+            const [name, ...effect] = (m[2] ?? "").split(" — ");
+            if ((name ?? "").trim() === "" || effect.join(" — ").trim() === "")
+                return `${q}: option ${m[1]} needs a name and an effect: "${m[1]}) {name} — {what happens}"`;
+        }
+        const rec = /^Recommended:[ \t]*(.+?)[ \t]*$/m.exec(part)?.[1];
+        if (rec === undefined)
+            return `${q} has no Recommended: line; write "Recommended: A) {name} — {reason}" or "Recommended: none — {why}"`;
+        const names = optionLines.map((m) => (m[2] ?? "").split(" — ")[0].trim());
+        const recName = (rec.split(" — ")[0] ?? "").replace(/^[A-Z]\)[ \t]*/, "").trim();
+        if (!/^none\b/i.test(recName) && !names.includes(recName))
+            return `${q}: the recommended option "${recName}" is not one of its options`;
+        if (!/^Default if unanswered:[ \t]*\S/m.test(part))
+            return `${q} has no Default if unanswered: line`;
+    }
+    return null;
+}
 /** The effect a bare fixed option name gets. */
 const FIXED_EFFECTS = {
-    Accept: "the item is recorded as accepted and the build moves on",
-    "Fix now": "one more fix round runs before the build moves on",
-    Stop: "the run ends here with a handover; the next run resumes here",
     "Try again": "one more fix round runs",
     Decide: "the questions below are asked instead of another round",
+    Stop: "the run ends here with a handover; the next run resumes here",
 };
-function composeItems(raw) {
-    if (!Array.isArray(raw))
-        throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
-    return raw.map((r, i) => {
-        const o = (r ?? {});
-        const s = (k) => (typeof o[k] === "string" ? oneLine(o[k]) : "");
-        const rawOptions = Array.isArray(o.options) ? o.options : [];
-        if (s("title") === "" || s("question") === "" || rawOptions.length === 0)
-            throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
-        if (rawOptions.length > MAX_OPTIONS)
-            throw new CommandError(EXIT.USAGE, `item ${i + 1}: at most ${MAX_OPTIONS} options (A-Z)`);
-        const options = rawOptions.map((x, k) => {
-            const bad = () => new CommandError(EXIT.USAGE, `item ${i + 1} (Q${i + 1}): option ${letterAt(k)} needs a name and an effect`);
-            let name;
-            let effect;
-            if (typeof x === "string") {
-                name = x.trim();
-                const fixed = FIXED_EFFECTS[name];
-                if (fixed === undefined)
-                    throw bad();
-                effect = fixed;
-            }
-            else {
-                const ob = (x ?? {});
-                if (typeof ob.name !== "string" || typeof ob.effect !== "string")
-                    throw bad();
-                name = oneLine(ob.name);
-                effect = oneLine(ob.effect);
-                if (name === "" || effect === "")
-                    throw bad();
-            }
-            if (name.includes("—"))
-                throw new CommandError(EXIT.USAGE, `item ${i + 1} (Q${i + 1}): option name "${name}" must not contain a dash (—); put it in the effect`);
-            return { name, effect };
-        });
-        if (s("noRecommendation") === "" && !options.some((x) => x.name === s("recommended")))
-            throw new CommandError(EXIT.USAGE, `item ${i + 1}: recommended must be one of its options, or set noRecommendation`);
-        return {
-            title: s("title"),
-            question: s("question"),
-            options,
-            recommended: s("recommended"),
-            reason: s("reason"),
-            noRecommendation: s("noRecommendation"),
-        };
-    });
-}
-const itemLines = (n, it) => {
-    const rec = it.recommended ?? "";
-    const names = it.options.map((o) => o.name);
-    const letter = letterOf(names, rec);
+/** The loop question `Q1` the engine writes, in the one question layout. */
+function loopQuestionLines(o) {
+    const letter = letterAt(o.options.indexOf(o.recommended));
     return [
-        `**Q${n} — ${it.title}:** ${it.question}`,
-        ...it.options.map((o, i) => `${letterAt(i)}) ${o.name} — ${o.effect}`),
-        it.noRecommendation
-            ? `Recommended: none — ${it.noRecommendation}`
-            : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
-        it.noRecommendation || letter === null
-            ? "Default if unanswered: the run waits for you; the run stops when nobody can be asked"
-            : `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
+        `**Q1 — ${o.title}:** ${o.question}`,
+        ...o.options.map((name, i) => `${letterAt(i)}) ${name} — ${FIXED_EFFECTS[name]}`),
+        `Recommended: ${letter}) ${o.recommended} — ${o.reason}`,
+        `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
     ];
-};
-const fixed = (name) => ({ name, effect: FIXED_EFFECTS[name] });
+}
 // ---------------------------------------------------------------------------
 // apply
 // ---------------------------------------------------------------------------
-/** Each undecided item's recommendation written in; hard blockers left for the owner. */
-export function applyRecommendations(text, runtime, why) {
-    const items = parseDecisionItems(text);
+/** The engine file for a decision file that has none yet: a preamble line, so the first item is never read as one. */
+const engineStub = (file) => `Written by the engine beside ${path.basename(file)}; the orchestrator's questions are in that file.\n\n`;
+/**
+ * `extra` lines under question `n` of the engine file's text, the question's first line copied
+ * in from the merged `items` when the engine file does not hold it yet.
+ */
+function engineWith(engineText, items, n, extra, replace) {
+    let text = engineText;
+    if (!text.split(ITEM_SPLIT).some((p) => p.startsWith(`**Q${n} — `))) {
+        const heading = items.find((i) => i.n === n)?.text.split("\n")[0];
+        if (heading === undefined)
+            throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
+        text = `${text.trimEnd()}\n\n${heading}\n`;
+    }
+    return addUnder(text, n, extra, replace);
+}
+/** The engine file's text (its stub when absent) and the merged items of a decision file. */
+function pauseOf(file) {
+    const text = readText(file);
+    const engineFile = engineSibling(file);
+    const engineText = readIf(engineFile);
+    return {
+        text,
+        engineFile,
+        engineText,
+        engineOrStub: engineText ?? engineStub(file),
+        items: mergeItems(text, engineText),
+    };
+}
+/** Each undecided item's recommendation as a `Decision:` line; hard blockers left for the owner. */
+export function applyRecommendations(text, runtime, why, engineText = null) {
+    const items = mergeItems(text, engineText);
     const loopItem = items.find((i) => i.options.includes("Try again"));
     const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
-    const applied = [];
+    const decisions = [];
     const hardBlockers = [];
-    let out = text;
     for (const it of items) {
         if (it.decision !== null)
             continue;
@@ -218,14 +225,14 @@ export function applyRecommendations(text, runtime, why) {
             hardBlockers.push(it.n);
             continue;
         }
-        const line = it.recommended === "Accept"
-            ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
-            : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`;
-        out = addUnder(out, it.n, [line]);
-        applied.push(it.n);
+        decisions.push({
+            n: it.n,
+            line: it.recommended === "Accept"
+                ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
+                : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`,
+        });
     }
-    out = withStatus(out, statusOf(parseDecisionItems(out)));
-    return { text: out, applied, hardBlockers, loop };
+    return { decisions, applied: decisions.map((d) => d.n), hardBlockers, loop };
 }
 /** The `decision` row an owner's confirmation writes. */
 function decisionRow(file, it, reason) {
@@ -263,7 +270,7 @@ function decisionFiles(logDir) {
     return fs.existsSync(logDir)
         ? fs
             .readdirSync(logDir)
-            .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
+            .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f) && !isEngineFile(f))
             .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
             .map((f) => path.join(logDir, f))
         : [];
@@ -274,23 +281,43 @@ const root = (cwd, flag) => path.resolve(cwd, str(flag) ?? git(cwd, ["rev-parse"
 // ---------------------------------------------------------------------------
 export const decisionsCommand = {
     noun: "decisions",
-    summary: "Build decision files: write questions, apply recommendations, list assumed items.",
+    summary: "Build decision files: check the orchestrator's questions, write the engine's counts, apply recommendations, list assumed items.",
     verbs: {
-        compose: {
-            summary: "Write a decision file in the one question layout, with loop progress when asked.",
+        check: {
+            summary: "Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question.",
+            use: "workflow",
+            flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
+            output: {
+                file: "the decision file checked",
+                questions: "number of questions in it",
+                problem: "null, or the first rule it breaks, naming the question",
+            },
+            exitCodes: {
+                [EXIT_BAD_DECISION]: "the file breaks an item rule: fix it as `problem` says, then check again",
+            },
+            run: (ctx) => {
+                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
+                const text = readText(file);
+                const problem = itemProblem(text, readIf(engineSibling(file)));
+                ctx.emit({
+                    file: path.relative(ctx.cwd, file),
+                    questions: parseDecisionItems(text).length,
+                    problem,
+                });
+                if (problem !== null)
+                    ctx.log(`${path.basename(file)}: ${problem}`);
+                return problem === null ? EXIT.OK : EXIT_BAD_DECISION;
+            },
+        },
+        counts: {
+            summary: "Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1.",
             use: "workflow",
             flags: [
-                { name: "out", type: "string", required: true, help: "the decision file to write" },
-                {
-                    name: "header",
-                    type: "string",
-                    repeatable: true,
-                    help: "Key=Value header line (Status: OPEN is written first)",
-                },
+                { name: "out", type: "string", required: true, help: "the orchestrator's decision file" },
                 {
-                    name: "items",
+                    name: "source-changed",
                     type: "string",
-                    help: "JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]",
+                    help: "true | false: whether the last fix round changed source",
                 },
                 {
                     name: "loop",
@@ -308,34 +335,31 @@ export const decisionsCommand = {
                 {
                     name: "base-check",
                     type: "string",
-                    help: "with --loop: the `bkit tests base` output JSON; adds the base-commit line and steers the recommendation",
+                    help: "the `bkit tests base` output JSON; writes `Gate: FAIL`, and with --loop the base-commit line and a steered recommendation",
                 },
             ],
             output: {
-                file: "the decision file written",
-                questions: "number of questions",
-                loopRecommended: "Try again | Decide (with --loop), else null",
+                file: "the engine file written",
+                questions: "number of questions in the decision file, the loop question included",
+                loopRecommended: "Try again | Decide | Stop (with --loop), else null",
             },
             run: (ctx) => {
                 const out = path.resolve(ctx.cwd, String(ctx.flags.out));
-                const headers = (ctx.flags.header ?? []).map((h) => {
-                    const eq = h.indexOf("=");
-                    if (eq <= 0)
-                        throw new CommandError(EXIT.USAGE, `--header ${h}: must be Key=Value`);
-                    return `${h.slice(0, eq)}: ${h.slice(eq + 1)}`;
-                });
-                let items = [];
-                if (ctx.flags.items !== undefined) {
-                    const read = readJsonFile(path.resolve(ctx.cwd, String(ctx.flags.items)));
-                    if (!read.ok)
-                        throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
-                    items = composeItems(read.value);
-                }
+                const own = parseDecisionItems(readText(out)).length;
+                const sourceChanged = str(ctx.flags.sourceChanged);
+                if (sourceChanged !== undefined && sourceChanged !== "true" && sourceChanged !== "false")
+                    throw new CommandError(EXIT.USAGE, "--source-changed must be true or false");
                 const baseFlag = str(ctx.flags.baseCheck);
                 const baseCheck = baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
-                const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
-                let loopRecommended = null;
                 const loopName = str(ctx.flags.loop);
+                if (sourceChanged === undefined && baseCheck === undefined && loopName === undefined)
+                    throw new CommandError(EXIT.USAGE, "counts needs --source-changed, --base-check or --loop");
+                const lines = [
+                    ...(sourceChanged === undefined ? [] : [`Source changed: ${sourceChanged}`]),
+                    ...(baseCheck === undefined ? [] : ["Gate: FAIL"]),
+                    "",
+                ];
+                let loopRecommended = null;
                 if (loopName !== undefined) {
                     const loop = LOOPS[loopName];
                     if (loop === undefined)
@@ -374,7 +398,7 @@ export const decisionsCommand = {
                                 : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
                         ];
                         if (b.verdict === "all") {
-                            loopRecommended = items.length > 0 ? "Decide" : "Stop";
+                            loopRecommended = own > 0 ? "Decide" : "Stop";
                             reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
                         }
                         else if (b.verdict === "some") {
@@ -392,39 +416,31 @@ export const decisionsCommand = {
                     }
                     lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, ...(p.gateCounts === undefined
                         ? []
-                        : [`${loop.gateTitle ?? "Gate"} failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...itemLines(1, {
+                        : [`${loop.gateTitle ?? "Gate"} failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...loopQuestionLines({
                         title: loop.title,
                         question: loopRecommended === "Try again"
                             ? `another fix round? ${p.trendLine}`
                             : `decide the items below instead of another round? ${p.trendLine}`,
-                        options: items.length > 0
-                            ? [fixed("Try again"), fixed("Decide")]
-                            : [fixed("Try again"), fixed("Stop")],
-                        recommended: items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
+                        options: own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
+                        recommended: own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
                         reason,
                     }), "");
-                    if (items.length === 0 && loopRecommended === "Decide")
+                    if (own === 0 && loopRecommended === "Decide")
                         loopRecommended = "Stop";
                 }
-                const first = loopName === undefined ? 1 : 2;
-                items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
-                const questionCount = items.length + (loopName === undefined ? 0 : 1);
-                lines.push('Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.');
-                if (questionCount >= 3)
-                    lines.push('Or say "one by one" and I\'ll ask them one at a time.');
-                lines.push("");
-                fs.mkdirSync(path.dirname(out), { recursive: true });
-                fs.writeFileSync(out, lines.join("\n"), "utf-8");
+                const engineFile = engineSibling(out);
+                fs.mkdirSync(path.dirname(engineFile), { recursive: true });
+                fs.writeFileSync(engineFile, lines.join("\n"), "utf-8");
                 ctx.emit({
-                    file: path.relative(ctx.cwd, out),
-                    questions: items.length + (loopName === undefined ? 0 : 1),
+                    file: path.relative(ctx.cwd, engineFile),
+                    questions: own + (loopName === undefined ? 0 : 1),
                     loopRecommended,
                 });
                 return EXIT.OK;
             },
         },
         apply: {
-            summary: "Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item.",
+            summary: "Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
             use: "workflow",
             flags: [
                 { name: "file", type: "string", required: true, help: "the decision file" },
@@ -432,6 +448,11 @@ export const decisionsCommand = {
                 { name: "q", type: "string", help: "--by=owner: the question number" },
                 { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                 { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
+                {
+                    name: "answer",
+                    type: "string",
+                    help: "--by=owner: the owner's answer to the loop question: Try again | Decide | Stop",
+                },
                 { name: "reason", type: "string", help: "--by=owner: the owner's words" },
                 {
                     name: "root",
@@ -440,7 +461,7 @@ export const decisionsCommand = {
                 },
             ],
             output: {
-                status: "the file's Status after the call: OPEN | ASSUMED | DECIDED",
+                status: "the pause's Status after the call: OPEN | ASSUMED | DECIDED",
                 applied: "--by=headless: question numbers settled on their recommendation",
                 hardBlockers: "--by=headless: question numbers with no recommendation, left for the owner",
                 loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
@@ -452,15 +473,22 @@ export const decisionsCommand = {
             },
             run: (ctx) => {
                 const file = path.resolve(ctx.cwd, String(ctx.flags.file));
-                const text = readText(file);
+                const pause = pauseOf(file);
                 const by = String(ctx.flags.by);
+                const write = (engine) => {
+                    fs.writeFileSync(pause.engineFile, engine, "utf-8");
+                    return pauseStatus(pause.text, engine);
+                };
                 if (by === "headless") {
                     const runtime = classifyAt(ctx.cwd);
-                    const r = applyRecommendations(text, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false");
-                    fs.writeFileSync(file, r.text, "utf-8");
-                    const after = parseDecisionItems(r.text);
+                    const r = applyRecommendations(pause.text, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false", pause.engineText);
+                    let engine = pause.engineOrStub;
+                    for (const d of r.decisions)
+                        engine = engineWith(engine, pause.items, d.n, [d.line]);
+                    const status = r.decisions.length === 0 && pause.engineText === null ? null : write(engine);
+                    const after = mergeItems(pause.text, engine);
                     ctx.emit({
-                        status: /^Status:[ \t]*(\S+)/m.exec(r.text)?.[1] ?? "OPEN",
+                        status: status ?? pauseStatus(pause.text, pause.engineText),
                         applied: r.applied,
                         hardBlockers: r.hardBlockers,
                         loop: r.loop,
@@ -472,48 +500,57 @@ export const decisionsCommand = {
                 }
                 if (by === "rerun") {
                     const name = path.basename(file);
-                    if (!/^Gate:[ \t]*FAIL\b/m.test(text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? ""))
+                    const header = decisionFileHeader((rel) => readIf(path.resolve(ctx.cwd, rel)), file);
+                    if (!/^FAIL\b/.test(header.Gate ?? ""))
                         throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
-                    const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
+                    const status = pauseStatus(pause.text, pause.engineText);
                     if (status !== "OPEN")
                         throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
-                    const { hasLoop, undecided } = undecidedBesidesLoop(text);
+                    const { hasLoop, undecided } = undecidedBesidesLoop(pause.text, pause.engineText);
                     if (!hasLoop)
                         throw new CommandError(EXIT.USAGE, `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`);
                     if (undecided.length > 0)
                         throw new CommandError(EXIT.USAGE, `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`);
-                    const out = withStatus(addUnder(text, 1, [
+                    const engine = engineWith(pause.engineOrStub, pause.items, 1, [
                         `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
-                    ]), "DECIDED");
-                    fs.writeFileSync(file, out, "utf-8");
-                    ctx.emit({ status: "DECIDED" });
+                    ]);
+                    ctx.emit({ status: write(engine) });
                     return EXIT.OK;
                 }
                 if (by !== "owner")
                     throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
                 const n = positiveInt(ctx.flags.q, "q");
                 const reason = str(ctx.flags.reason);
-                if (n === undefined ||
-                    reason === undefined ||
-                    (ctx.flags.confirm === true) === (ctx.flags.reject === true))
-                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason and one of --confirm / --reject");
-                const it = parseDecisionItems(text).find((i) => i.n === n);
+                const answer = str(ctx.flags.answer);
+                const choices = [
+                    ctx.flags.confirm === true,
+                    ctx.flags.reject === true,
+                    answer !== undefined,
+                ];
+                if (n === undefined || reason === undefined || choices.filter(Boolean).length !== 1)
+                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason and one of --confirm / --reject / --answer");
+                const it = pause.items.find((i) => i.n === n);
+                if (answer !== undefined) {
+                    if (it === undefined || !it.options.includes(answer))
+                        throw new CommandError(EXIT.USAGE, `Q${n} has no option "${answer}" in ${path.basename(file)}`);
+                    const engine = engineWith(pause.engineOrStub, pause.items, n, [`Decision: ${answer} — ${reason} (owner, ${today()})`], /^Decision:/);
+                    ctx.emit({ status: write(engine), decisionKey: null });
+                    return EXIT.OK;
+                }
                 if (it === undefined || !it.assumed)
                     throw new CommandError(EXIT.USAGE, `Q${n} is not an assumed Accept in ${path.basename(file)}`);
-                let out;
+                let engine;
                 let decisionKey = null;
                 if (ctx.flags.confirm === true) {
                     const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
                     appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
                     decisionKey = String(row.key);
-                    out = addUnder(text, n, [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`], /^(Decision|Rejected):/);
+                    engine = engineWith(pause.engineOrStub, pause.items, n, [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`], /^(Decision|Rejected):/);
                 }
                 else {
-                    out = addUnder(text, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
+                    engine = engineWith(pause.engineOrStub, pause.items, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
                 }
-                out = withStatus(out, statusOf(parseDecisionItems(out)));
-                fs.writeFileSync(file, out, "utf-8");
-                ctx.emit({ status: /^Status:[ \t]*(\S+)/m.exec(out)?.[1] ?? "OPEN", decisionKey });
+                ctx.emit({ status: write(engine), decisionKey });
                 return EXIT.OK;
             },
         },
@@ -530,7 +567,7 @@ export const decisionsCommand = {
                 const read = readTextFile(file);
                 if (!read.ok)
                     throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
-                const problem = skipProblem(read.text);
+                const problem = skipProblem(read.text, readIf(engineSibling(file)));
                 if (problem !== null)
                     ctx.log(`${path.basename(file)}: ${problem}`);
                 ctx.emit({ route: problem === null ? "continue" : null, problem });
@@ -567,8 +604,10 @@ export const decisionsCommand = {
                 const rows = [];
                 for (const abs of decisionFiles(logDir)) {
                     const rel = path.relative(top, abs);
-                    let text = fs.readFileSync(abs, "utf-8");
-                    for (const it of parseDecisionItems(text)) {
+                    const merged = decisionItems(readIf, abs);
+                    let engine = readIf(engineSibling(abs)) ?? engineStub(abs);
+                    let marked = false;
+                    for (const it of merged) {
                         if (!it.assumed || it.deferred)
                             continue;
                         items.push({
@@ -580,13 +619,12 @@ export const decisionsCommand = {
                         });
                         if (ctx.flags.defer === true) {
                             rows.push(deferralRow(rel, it));
-                            text = addUnder(text, it.n, [`Deferred: needs-decision (${today()})`]);
+                            engine = engineWith(engine, merged, it.n, [`Deferred: needs-decision (${today()})`]);
+                            marked = true;
                         }
                     }
-                    if (ctx.flags.defer === true) {
-                        text = withStatus(text, statusOf(parseDecisionItems(text)));
-                        fs.writeFileSync(abs, text, "utf-8");
-                    }
+                    if (marked)
+                        fs.writeFileSync(engineSibling(abs), engine, "utf-8");
                 }
                 const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
                 ctx.emit({ items, count: items.length, deferred });
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index 4bcb7ef5f..d5dd5df1a 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -82,13 +82,86 @@ export function parseDecisionItems(text) {
         };
     });
 }
+/** The path of a decision file's engine sibling: `build-decision-1-2.md` → `build-decision-1-2-engine.md`. */
+export const engineSibling = (rel) => rel.replace(/\.md$/, "-engine.md");
+/** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
+export const isEngineFile = (name) => /-engine\.md$/.test(name);
+/**
+ * The items of a decision file merged with those of its engine file: items by question
+ * number, the engine file's answer winning for a question both hold, a question only the
+ * engine file holds (the loop question) kept as it is. With no engine text the result is
+ * `parseDecisionItems(text)`.
+ */
+export function mergeItems(text, engineText) {
+    const own = parseDecisionItems(text);
+    if (engineText === null || engineText === undefined)
+        return own;
+    const merged = [...own];
+    for (const e of parseDecisionItems(engineText)) {
+        const i = merged.findIndex((m) => m.n === e.n);
+        const base = merged[i];
+        if (base === undefined) {
+            merged.push(e);
+            continue;
+        }
+        merged[i] = {
+            ...base,
+            decision: e.decision ?? base.decision,
+            assumed: e.decision === null ? base.assumed : e.assumed,
+            fixTask: e.fixTask ?? base.fixTask,
+            rejected: base.rejected || e.rejected,
+            deferred: base.deferred || e.deferred,
+        };
+    }
+    return merged.sort((a, b) => a.n - b.n);
+}
+/** The header of a decision file merged with its engine file's: the engine file's line wins for a name. */
+function mergeHeader(text, engineText) {
+    return { ...decisionHeader(text), ...(engineText == null ? {} : decisionHeader(engineText)) };
+}
+/** Whether a file's text before its first item holds the `## Progress` block. */
+const hasProgress = (text) => text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
+/**
+ * The items of the decision file `rel` merged with its `-engine.md` sibling. `read` returns a
+ * path's text, or null when the file is absent. The old single-file layout reads unchanged.
+ */
+export function decisionItems(read, rel) {
+    return mergeItems(read(rel) ?? "", read(engineSibling(rel)));
+}
+/** The header of the decision file `rel` merged with its `-engine.md` sibling's, the engine file's line winning. */
+export function decisionFileHeader(read, rel) {
+    return mergeHeader(read(rel) ?? "", read(engineSibling(rel)));
+}
+/**
+ * The `Status` a pause's items leave it in: `OPEN` while a question has no answer, except that
+ * the loop question answered `Try again` settles the pause; then `ASSUMED` while an assumed
+ * `Accept` remains; else `DECIDED`.
+ */
+export function statusOf(items) {
+    const loop = items.find((i) => i.options.includes("Try again"));
+    const settled = /^Try again\b/.test(loop?.decision ?? "");
+    if (!settled && items.some((i) => i.decision === null))
+        return "OPEN";
+    return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
+}
+/**
+ * The `Status` of a pause: a lone decision file that still carries a written `Status:` line
+ * (the old layout) is read as written; otherwise the status its merged items leave it in.
+ */
+export function pauseStatus(text, engineText) {
+    const written = decisionHeader(text).Status;
+    if (written !== undefined && (engineText === null || engineText === undefined))
+        return written;
+    return statusOf(mergeItems(text, engineText));
+}
 /**
  * Whether Q1 is the loop question (the text before the first item holds a `## Progress`
- * block), and the questions besides it that nobody answered, rejected or deferred.
+ * block, in the decision file or its engine file), and the questions besides it that nobody
+ * answered, rejected or deferred.
  */
-export function undecidedBesidesLoop(text) {
-    const hasLoop = /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
-    const undecided = parseDecisionItems(text)
+export function undecidedBesidesLoop(text, engineText) {
+    const hasLoop = hasProgress(text) || hasProgress(engineText);
+    const undecided = mergeItems(text, engineText)
         .filter((i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred)
         .map((i) => `Q${i.n}`);
     return { hasLoop, undecided };
@@ -100,9 +173,9 @@ export const RERUN_FROM = ["verify", "holistic", "tests"];
  * `FAIL`, its `Status` is `OPEN`, the loop question is its only undecided question, and its
  * `From` names a check that re-runs. `rerunFrom` is that check, null when `gateRerun` is false.
  */
-export function gateRerun(open, text) {
+export function gateRerun(open, text, engineText) {
     const from = RERUN_FROM.find((f) => f === open?.from);
-    const { hasLoop, undecided } = undecidedBesidesLoop(text);
+    const { hasLoop, undecided } = undecidedBesidesLoop(text, engineText);
     const rerun = open?.gate === "FAIL" &&
         open.status === "OPEN" &&
         from !== undefined &&
@@ -119,15 +192,15 @@ const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;
  * header that reads `false`. Headers count only in the header block, so a line inside an item
  * never stands in for one. A missing fact refuses; it is never guessed.
  */
-export function skipProblem(text) {
-    const header = decisionHeader(text);
+export function skipProblem(text, engineText) {
+    const header = mergeHeader(text, engineText);
     const from = header.From;
     if (from === undefined)
         return "no From header";
     if (from !== "verify" && from !== "holistic")
         return `From is "${from}", not verify or holistic`;
-    const { hasLoop } = undecidedBesidesLoop(text);
-    const items = parseDecisionItems(text);
+    const { hasLoop } = undecidedBesidesLoop(text, engineText);
+    const items = mergeItems(text, engineText);
     for (const it of items) {
         if (hasLoop && it.n === 1)
             continue;
@@ -167,32 +240,31 @@ export function openDecision(logDir, tree, workflow, run, finished = []) {
         .sort((a, b) => b.n - a.n);
     for (const { f, n } of found) {
         const text = fs.readFileSync(path.join(logDir, f), "utf-8");
-        const field = (key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
-        const status = field("Status");
+        const engineFile = path.join(logDir, engineSibling(f));
+        const engineText = fs.existsSync(engineFile) ? fs.readFileSync(engineFile, "utf-8") : null;
+        const header = mergeHeader(text, engineText);
+        const status = pauseStatus(text, engineText);
         const rel = path.relative(tree, path.join(logDir, f));
         const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
         if (status !== "OPEN" && !unfinished)
             continue;
-        // `Gate:` counts only in the header block (the lines before the first blank line).
-        const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
-        const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
         const num = (key) => {
-            const v = field(key);
-            return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
+            const v = header[key];
+            return v !== undefined && /^[0-9]+$/.test(v) ? Number(v) : null;
         };
         return {
             file: rel,
             decision: n,
-            question: field("Question"),
-            from: field("From"),
+            question: header.Question ?? null,
+            from: header.From ?? null,
             pauseStep: num("Pause step"),
             group: num("Group"),
             verifyAttempt: num("Verify attempt"),
             testAttempt: num("Test attempt"),
-            plan: field("Plan"),
-            gate,
-            sourceChanged: field("Source changed"),
-            status: status ?? "OPEN",
+            plan: header.Plan ?? null,
+            gate: header.Gate ?? null,
+            sourceChanged: header["Source changed"] ?? null,
+            status,
         };
     }
     return null;
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 7bb1f15c7..1dbad6bfa 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -9,7 +9,7 @@ import { readBkitConfig } from "../../shared/settings.js";
 import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, repeatStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, worktreeFingerprint, writeInvocation, } from "../lib.js";
 import { fixTestStep, gatedCheckStep } from "./loops.js";
-import { gateRerun, openDecision } from "./open-decision.js";
+import { engineSibling, gateRerun, openDecision } from "./open-decision.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
 // Shared with counters / steps
@@ -730,7 +730,9 @@ export const statusCommand = {
                 const round = debugTestRound(runs, workflow);
                 ctx.emit({
                     ...point,
-                    ...gateRerun(open, open === null ? "" : fs.readFileSync(path.resolve(root, open.file), "utf-8")),
+                    ...gateRerun(open, open === null ? "" : fs.readFileSync(path.resolve(root, open.file), "utf-8"), open === null || !fs.existsSync(path.resolve(root, engineSibling(open.file)))
+                        ? null
+                        : fs.readFileSync(path.resolve(root, engineSibling(open.file)), "utf-8")),
                     ...round,
                 });
                 if (workflow === "debug" && point.number > 3 && round.testVerdict === null) {
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index e8295bc1c..94f287d26 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -21,7 +21,7 @@ import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, }
 import { activeRunStart, savedPointLimit } from "./counters.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { skipProblem } from "./open-decision.js";
+import { engineSibling, skipProblem } from "./open-decision.js";
 import { mergeFindings, parseFindings, reportSection } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
@@ -873,7 +873,8 @@ function continueCheck(cwd, decisionFile) {
     const read = readTextFile(path.resolve(cwd, decisionFile));
     if (!read.ok)
         return { check, ok: false, detail: `${decisionFile} is missing or unreadable` };
-    const problem = skipProblem(read.text);
+    const engine = readTextFile(path.resolve(cwd, engineSibling(decisionFile)));
+    const problem = skipProblem(read.text, engine.ok ? engine.text : null);
     return problem === null
         ? { check, ok: true, detail: `${decisionFile} passes decisions skip` }
         : { check, ok: false, detail: `${decisionFile}: ${problem}` };
diff --git a/dist/commands/workflow/summary-findings.js b/dist/commands/workflow/summary-findings.js
index a58a97b94..d4993e51e 100644
--- a/dist/commands/workflow/summary-findings.js
+++ b/dist/commands/workflow/summary-findings.js
@@ -1,5 +1,5 @@
 import { parseFindings, mergeFindings, normalizeLocation, lowDeferralKey, } from "./challenge.js";
-import { parseDecisionItems } from "./open-decision.js";
+import { decisionItems } from "./open-decision.js";
 const artifacts = (row) => Array.isArray(row.artifacts)
     ? row.artifacts.filter((p) => typeof p === "string")
     : [];
@@ -97,7 +97,7 @@ export function challengeResolution(input, row, index, tasks) {
                 rounds.includes(round));
         });
         const label = `build-challenge round ${round}: ${f.severity} ${f.location}`;
-        const accepted = input.decisionFiles.some((p) => parseDecisionItems(input.read(p) ?? "").some((item) => /^Accept\b/.test(item.decision ?? "") &&
+        const accepted = input.decisionFiles.some((p) => decisionItems(input.read, p).some((item) => /^Accept\b/.test(item.decision ?? "") &&
             [...item.text.matchAll(/(?<![\w@./-])[\w@./-]*[A-Za-z_][\w@./-]*:\d+/g)].some((m) => normalizeLocation(m[0], input.root ?? process.cwd()) === f.location)));
         const closed = f.severity === "LOW" &&
             input.deferrals.some((d) => d.status === "CLOSED" &&
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index fdc589a72..094649c10 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -4,7 +4,7 @@
 // disk and passes `read` for the log files.
 import { coversList } from "./plans.js";
 import { issueIdOf } from "./fids.js";
-import { decisionHeader, parseDecisionItems } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, isEngineFile } from "./open-decision.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
@@ -340,18 +340,17 @@ export function buildSummary(input) {
         input.rows.forEach((row, index) => {
             if (row.type !== "step-done" || row.step !== "build-decision")
                 return;
-            for (const rel of artifactsOf(row)) {
-                const text = read(rel);
-                if (text === null)
+            for (const rel of artifactsOf(row).filter((a) => !isEngineFile(a))) {
+                if (read(rel) === null)
                     continue;
-                const header = decisionHeader(text);
+                const header = decisionFileHeader(read, rel);
                 const rule = PAUSE_RULES[header.From ?? ""];
                 if (rule === undefined)
                     continue;
                 const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
                 if (rule.grouped && group === undefined)
                     continue;
-                const items = parseDecisionItems(text);
+                const items = decisionItems(read, rel);
                 const gaps = items.filter((i) => i.title !== rule.loop);
                 const loop = items.filter((i) => i.title === rule.loop);
                 if (gaps.length === 0)
@@ -483,8 +482,9 @@ export function buildSummary(input) {
     // The Decision Pause: accepted items in this run's decision files.
     const decided = groups
         .filter((g) => g.step === "build-decision")
-        .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
-    const acceptItems = decided.flatMap((rel) => parseDecisionItems(read(rel) ?? "")
+        .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)))
+        .filter((rel) => !isEngineFile(rel));
+    const acceptItems = decided.flatMap((rel) => decisionItems(read, rel)
         .filter((i) => /^Accept\b/.test(i.decision ?? ""))
         .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })));
     // `Accept (assumed)`: taken without the owner (`ask: false` or headless); ship asks to confirm.
@@ -496,7 +496,7 @@ export function buildSummary(input) {
         concerns.push(`${assumed.length} item(s) accepted without the owner (assumed; ship asks to confirm)`);
     // Ship: assumed Accepts the owner rejected or never confirmed; ship merged anyway.
     const unconfirmed = workflow === "ship"
-        ? input.decisionFiles.flatMap((rel) => parseDecisionItems(read(rel) ?? "")
+        ? input.decisionFiles.flatMap((rel) => decisionItems(read, rel)
             .filter((i) => i.assumed)
             .map((i) => `\`${rel}\` Q${i.n} — ${i.title}${i.rejected ? " (rejected)" : ""}`))
         : [];
@@ -651,7 +651,7 @@ export function buildSummary(input) {
     items.push(...accepted.map((a) => `- Accepted: ${a}`));
     items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
     for (const rel of workflow === "build" ? input.decisionFiles : []) {
-        if (!/^Decision:/m.test(read(rel) ?? ""))
+        if (decisionItems(read, rel).every((i) => i.decision === null))
             items.push(`- \`${rel}\`: no decision recorded`);
     }
     for (const p of input.plans) {
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 270f84c69..c6b1fd732 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -16,7 +16,7 @@ import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
-import { decisionHeader, parseDecisionItems } from "./open-decision.js";
+import { decisionFileHeader, decisionItems } from "./open-decision.js";
 const DIFF_BASE = "origin/dev";
 import { derivedTestMatrix, NO_MARKERS_REASON, parsePlanBlocks, testTier, } from "./plan-blocks.js";
 import { positiveInt, readStatusRows, str } from "./status.js";
@@ -123,10 +123,9 @@ export function gapsShortfall(text) {
 /**
  * The first header fact that stops `--decision` from ticking, or null: `From` is `verify` or
  * `holistic`, no `Gate: FAIL` header, and a verify file's `Group` is `group`. Headers count
- * only in the header block (`decisionHeader`).
+ * only in the header block, merged with the engine file's (`decisionFileHeader`).
  */
-function decisionProblem(text, group) {
-    const header = decisionHeader(text);
+function decisionProblem(header, group) {
     const from = header.From;
     if (from === undefined)
         return "no From header";
@@ -357,16 +356,16 @@ export const tasksCommand = {
                     throw new CommandError(EXIT.USAGE, "--decision must be non-empty");
                 if (tasksFlag === undefined && greenArg === undefined && decisionArg === undefined)
                     throw new CommandError(EXIT.USAGE, "give one of --tasks, --green and --decision");
-                let decisionText;
+                let decisionFile;
+                const readDecision = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null);
                 if (decisionArg !== undefined) {
-                    const decisionFile = path.resolve(ctx.cwd, decisionArg);
+                    decisionFile = path.resolve(ctx.cwd, decisionArg);
                     if (fs.statSync(decisionFile, { throwIfNoEntry: false })?.isFile() !== true)
                         throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
-                    decisionText = fs.readFileSync(decisionFile, "utf-8");
                 }
                 // Only a holistic decision alone may leave out --group: its accepted tasks span groups.
-                const holisticOnly = decisionText !== undefined &&
-                    decisionHeader(decisionText).From === "holistic" &&
+                const holisticOnly = decisionFile !== undefined &&
+                    decisionFileHeader(readDecision, decisionFile).From === "holistic" &&
                     tasksFlag === undefined &&
                     greenArg === undefined;
                 if (group === undefined && !holisticOnly)
@@ -381,12 +380,12 @@ export const tasksCommand = {
                     if (task.group !== group)
                         throw new CommandError(EXIT.USAGE, `TASK ${n} is in group ${task.group}, not group ${group}`);
                 }
-                if (decisionText !== undefined) {
-                    const problem = decisionProblem(decisionText, group);
+                if (decisionFile !== undefined) {
+                    const problem = decisionProblem(decisionFileHeader(readDecision, decisionFile), group);
                     if (problem !== null)
                         throw new CommandError(EXIT.USAGE, `--decision ${decisionArg}: ${problem}, so nothing is ticked`);
                     // A title names its task only at its start (`Task {N}`): a gap that mentions a task elsewhere ticks nothing.
-                    const accepted = parseDecisionItems(decisionText)
+                    const accepted = decisionItems(readDecision, decisionFile)
                         .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
                         .map((it) => /^task\s+(\d+)\b/i.exec(it.title.trim()))
                         .filter((m) => m !== null)
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index a8bb70a56..1f86ce5d7 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -38,7 +38,7 @@ import { agentContextBlock, buildBlock, chatFingerprint, ciList, claudeTranscrip
 import { buildSummary, refOf, SUMMARY_WORKFLOWS } from "./summary.js";
 import { parsePlans, parseWorkstreams } from "./plans.js";
 import { EXIT_LOCK_BUSY, EXIT_REMOVE_FAILED, EXIT_SPLIT_BUCKET, acquireWorkflowLock, owns, readHolder, readRunsLenient, releaseLock, resolveMonth, workflowLockPath, } from "./locks.js";
-import { openDecision } from "./open-decision.js";
+import { isEngineFile, openDecision } from "./open-decision.js";
 import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
@@ -1436,7 +1436,7 @@ function summaryVerb(ctx) {
         decisionFiles: (workflow === "build" || workflow === "ship") && fs.existsSync(logDir)
             ? fs
                 .readdirSync(logDir)
-                .filter((f) => /^build-decision-.*\.md$/.test(f))
+                .filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
                 .sort()
                 .map((f) => rel(path.join(logDir, f)))
             : [],
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 116700f68..c1905218d 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -89,12 +89,12 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-15 module-scope side effects in 6 of 127 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
+15 module-scope side effects in 6 of 128 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 217 | 131 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 219 | 132 |
 | `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 198 | 120 |
 | `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 198 | 120 |
 | `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 198 | 120 |
@@ -126,15 +126,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1967 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1960 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
@@ -269,17 +269,18 @@ flowchart LR
       n_bkit_core_engine_commands_lib["lib<br/>86 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
+        n_bkit_core_engine_commands_workflow_audit_report["audit-report<br/>18 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_branches["branches<br/>131 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_challenge["challenge<br/>37 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_challenge["challenge<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>92 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_counters["counters<br/>30 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_decisions["decisions<br/>25 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_disk["disk<br/>56 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_fids["fids<br/>58 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_issues["issues<br/>61 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_issues["issues<br/>46 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_junit["junit<br/>17 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>128 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>130 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_locks["locks<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_loops["loops<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_open_decision["open-decision<br/>17 symbols · 1 files"]
@@ -294,7 +295,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_status["status<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_base["step-base<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>15 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_steps["steps<br/>83 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_steps["steps<br/>73 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>23 symbols · 1 files"]
@@ -344,14 +345,14 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|123| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|76| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|75| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_ledgers -->|53| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_ledgers -->|55| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|51| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|46| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|43| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_issues -->|40| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_steps -->|38| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_issues -->|32| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_steps -->|36| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_issues -->|31| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|31| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
@@ -402,7 +403,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_roadmap -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_steps -->|15| n_bkit_core_engine_commands_workflow_tests
-  n_bkit_core_engine_commands_workflow_steps -->|15| n_bkit_core_engine_commands_workflow_issues
   n_bkit_core_engine_commands_workflow_tests -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_install_modules_opencode -->|15| n_bkit_core_engine_install_write
   n_bkit_core_engine_checks_tips_catalogue -->|15| n_bkit_core_engine_checks_tips_detect
@@ -412,7 +412,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_context -->|14| n_bkit_core_engine_commands_workflow_tests
-  n_bkit_core_engine_commands_workflow_steps -->|14| n_bkit_core_engine_commands_workflow_challenge
   n_bkit_core_engine_commands_workflow_summary_findings -->|14| n_bkit_core_engine_commands_workflow_challenge
   n_bkit_core_engine_install_modules_claude -->|14| n_bkit_core_engine_install_write
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
@@ -440,6 +439,7 @@ flowchart LR
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_challenge -->|11| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_ledgers -->|11| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_locks -->|11| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_runs -->|11| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_tasks -->|11| n_bkit_core_engine_commands_workflow_tests
@@ -453,7 +453,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|10| n_bkit_core_engine_shared_branches
   n_bkit_core_engine_commands_workflow_decisions -->|10| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|10| n_bkit_core_engine_commands_workflow_status
-  n_bkit_core_engine_commands_workflow_ledgers -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_ledgers -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_runtime -->|10| n_bkit_core_engine_commands_lib
@@ -472,9 +471,11 @@ flowchart LR
   n_bkit_core_engine_commands_install_install -->|9| n_bkit_core_engine_checks_after_index
   n_bkit_core_engine_commands_install_uninstall -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_lib -->|9| n_bkit_core_engine_ledgers_status
+  n_bkit_core_engine_commands_workflow_ledgers -->|9| n_bkit_core_engine_commands_workflow_audit_report
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_commands_workflow_repo
+  n_bkit_core_engine_commands_workflow_steps -->|9| n_bkit_core_engine_commands_workflow_challenge
   n_bkit_core_engine_commands_workflow_steps -->|9| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tests_base -->|9| n_bkit_core_engine_commands_lib
@@ -491,10 +492,8 @@ flowchart LR
   n_bkit_core_engine_checks_tips_detect -->|8| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_branches -->|8| n_bkit_core_engine_ledgers_telemetry
-  n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|8| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_step_base -->|8| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_steps -->|8| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_tests -->|8| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
@@ -523,10 +522,12 @@ flowchart LR
   n_bkit_core_engine_commands_stats -->|7| n_bkit_core_engine_commands_analysis
   n_bkit_core_engine_commands_workflow_branches -->|7| n_bkit_core_engine_shared_package_manager
   n_bkit_core_engine_commands_workflow_branches -->|7| n_bkit_core_engine_commands_workflow_locks
+  n_bkit_core_engine_commands_workflow_challenge -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_counters -->|7| n_bkit_core_engine_commands_workflow_loops
   n_bkit_core_engine_commands_workflow_disk -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_plans -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_status -->|7| n_bkit_core_engine_ledgers_journal
+  n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
@@ -558,6 +559,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_counters -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_disk -->|6| n_bkit_core_engine_checks_before_env
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
+  n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_commands_workflow_audit_report
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_step_table
   n_bkit_core_engine_commands_workflow_summary -->|6| n_bkit_core_engine_commands_workflow_summary_findings
@@ -625,6 +627,7 @@ flowchart LR
   style n_bkit_core_engine_commands_land stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_lib stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_setup_setup stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
+  style n_bkit_core_engine_commands_workflow_audit_report stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_branches stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_challenge stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
   style n_bkit_core_engine_commands_workflow_completeness stroke:#1a7f37,stroke-width:2px,fill:#1a7f3714
@@ -767,8 +770,8 @@ flowchart LR
   linkStyle 82 stroke:#59636e,stroke-width:6px
   linkStyle 83 stroke:#59636e,stroke-width:6px
   linkStyle 84 stroke:#59636e,stroke-width:6px
-  linkStyle 85 stroke:#59636e,stroke-width:6px
-  linkStyle 86 stroke:#59636e,stroke-width:6px
+  linkStyle 85 stroke:#59636eb3,stroke-width:3px
+  linkStyle 86 stroke:#59636eb3,stroke-width:3px
   linkStyle 87 stroke:#59636eb3,stroke-width:3px
   linkStyle 88 stroke:#59636eb3,stroke-width:3px
   linkStyle 89 stroke:#59636eb3,stroke-width:3px
@@ -840,8 +843,8 @@ flowchart LR
   linkStyle 155 stroke:#59636eb3,stroke-width:3px
   linkStyle 156 stroke:#59636eb3,stroke-width:3px
   linkStyle 157 stroke:#59636eb3,stroke-width:3px
-  linkStyle 158 stroke:#59636eb3,stroke-width:3px
-  linkStyle 159 stroke:#59636eb3,stroke-width:3px
+  linkStyle 158 stroke:#59636e80,stroke-width:2px
+  linkStyle 159 stroke:#59636e80,stroke-width:2px
   linkStyle 160 stroke:#59636e80,stroke-width:2px
   linkStyle 161 stroke:#59636e80,stroke-width:2px
   linkStyle 162 stroke:#59636e80,stroke-width:2px
@@ -911,6 +914,7 @@ flowchart LR
   linkStyle 226 stroke:#59636e80,stroke-width:2px
   linkStyle 227 stroke:#59636e80,stroke-width:2px
   linkStyle 228 stroke:#59636e80,stroke-width:2px
+  linkStyle 229 stroke:#59636e80,stroke-width:2px
 ```
 
 <!-- graphify:end -->
diff --git a/scripts/gate/bkit-text-ceiling.json b/scripts/gate/bkit-text-ceiling.json
index 6401c0441..cd27f2de3 100644
--- a/scripts/gate/bkit-text-ceiling.json
+++ b/scripts/gate/bkit-text-ceiling.json
@@ -4,7 +4,7 @@
     "reason": "initial baseline for #1028"
   },
   "workflows": {
-    "ceiling": 58012,
+    "ceiling": 58006,
     "reason": "initial baseline for #1028"
   }
 }
