diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 58632932d..f67d82249 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -72,6 +72,7 @@ tools:
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 1290d3998..41f72da07 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -119,25 +119,34 @@ description: "Build Feature — Autonomous implementation"
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -158,6 +167,7 @@ description: "Build Feature — Autonomous implementation"
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -281,6 +291,7 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -666,7 +677,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -682,23 +693,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -776,7 +788,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -974,6 +986,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -981,6 +994,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 437e0a919..cf9ad9d26 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -119,25 +119,34 @@ description: "Build Feature — Autonomous implementation"
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -158,6 +167,7 @@ description: "Build Feature — Autonomous implementation"
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -281,6 +291,7 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -666,7 +677,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -682,23 +693,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -776,7 +788,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -974,6 +986,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -981,6 +994,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 3e3e2d129..0e2491a72 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -265,6 +265,20 @@ describe("resume facts", () => {
       expect(text).toContain(`\`${field}\` as`);
     }
   });
+
+  it("build re-runs a red gate pause instead of asking it", () => {
+    const text = workflow("build");
+    const resume = text.split("\n").filter((l) => l.startsWith("- **Resume:**"))[0];
+    expect(resume).toBeDefined();
+    expect(resume).toContain("`gate` as");
+    expect(resume).toContain("decisions apply --by=rerun");
+    expect(resume).toContain("`GATE_RERUN` = true");
+    expect(resume).toContain("steps finish");
+    expect(resume.indexOf("steps finish")).toBeLessThan(
+      resume.indexOf("decisions apply --by=rerun"),
+    );
+    expect(resume).toContain("counters grant");
+  });
 });
 
 describe("pre-worktree commit", () => {
@@ -757,6 +771,38 @@ describe("build", () => {
     expect(step7).not.toContain("--task=");
   });
 
+  it("a re-run gate that is still red goes straight to the Decision Pause", () => {
+    const step8 = stepBody(build, /Step 8 — Plan Verify/);
+    const step12 = section(build, /Step 12 — Run Tests/);
+    for (const [name, text] of [
+      ["Step 8", step8],
+      ["Step 12", step12],
+    ] as const) {
+      expect(text, name).toMatch(/`GATE_RERUN` = true[^\n]*\*\*Decision Pause\*\*/);
+    }
+    // The re-run route sits after the `counters route` block, so the pause limits are set.
+    expect(step8.indexOf("`GATE_RERUN` = true")).toBeGreaterThan(step8.indexOf("counters route"));
+    expect(step12.indexOf("`GATE_RERUN` = true")).toBeGreaterThan(step12.indexOf("counters route"));
+  });
+
+  it("a green re-run gate continues without asking and clears GATE_RERUN", () => {
+    const step8 = stepBody(build, /Step 8 — Plan Verify/);
+    const step12 = section(build, /Step 12 — Run Tests/);
+    for (const [name, text] of [
+      ["Step 8", step8],
+      ["Step 12", step12],
+    ] as const) {
+      expect(text, name).toMatch(/clear[^\n]*`GATE_RERUN`|`GATE_RERUN` (is )?cleared/i);
+      expect(text, name).toMatch(/without asking/);
+    }
+    // Every route line of Step 8 sub-step 11 clears the flag.
+    const routeLines = step8
+      .split("\n")
+      .filter((l) => /^\s*- \*\*If\*\* exit.*(Decision Pause|Step 9|Failure Path)/.test(l));
+    expect(routeLines.length).toBeGreaterThan(0);
+    for (const l of routeLines) expect(l, l).toContain("GATE_RERUN");
+  });
+
   it("Step 8 verifies a diff cut from the group's start commit", () => {
     const step8 = stepBody(build, /Step 8 — Plan Verify/);
     const diff = commandLines(step8, "context diff");
@@ -771,6 +817,69 @@ describe("build", () => {
     expect(green[0]).toContain("--group={GROUP}");
   });
 
+  it("the Decision Pause checks a red gate against the base commit before composing", () => {
+    const pause = section(build, /Decision Pause/);
+    const base = commandLines(pause, "tests base");
+    expect(base).toHaveLength(1);
+    expect(base[0]).toContain("tests base --log=");
+    const compose = commandLines(pause, "decisions compose");
+    expect(compose).toHaveLength(1);
+    expect(compose[0]).toContain("{BASE_FLAGS}");
+    expect(pause.indexOf("tests base --log=")).toBeLessThan(pause.indexOf("decisions compose"));
+    expect(pause).toContain("GATE_LOG");
+    expect(pause).toContain("--base-check");
+    expect(pause).toContain("Gate=FAIL");
+    // The check runs only for a red-gate or TESTS_LOOP pause, and a failed check is a Failure Path.
+    expect(pause).toMatch(
+      /`GATE_VERDICT` = FAIL[^\n]*`TESTS_LOOP`|`TESTS_LOOP`[^\n]*`GATE_VERDICT` = FAIL/,
+    );
+    expect(pause).toMatch(/tests base[\s\S]{0,900}non-zero → \*\*Failure Path\*\*/);
+    // The Decision Pause gate checklist names the base check.
+    const gate = stepBody(build, /Gate — Decision Pause/);
+    expect(gate).toMatch(/base/i);
+  });
+
+  it("a no-progress round after a red gate pauses with the loop question", () => {
+    const step9 = stepBody(build, /Step 9 — Plan Gaps Remediate/);
+    const route = step9.slice(step9.indexOf("5. Check that the attempt changed source files"));
+    expect(route).toContain("`GATE_VERDICT` = FAIL");
+    expect(route).toContain("`PAUSE_LOOP` = `verify`");
+    expect(route.indexOf("`PAUSE_LOOP` = `verify`")).toBeLessThan(
+      route.indexOf("**Decision Pause**"),
+    );
+  });
+
+  it("a failing gate or suite test is never a pause item", () => {
+    const pause = section(build, /Decision Pause/);
+    expect(pause).not.toContain("because it is always fixed");
+    expect(pause).not.toContain("because failing suites are always fixed");
+    expect(pause).toMatch(/group.gate[^\n]*never an item/i);
+    expect(pause).toMatch(/TESTS_LOOP[^\n]*(no items|never an item)/);
+    const step4 = pause.slice(
+      pause.indexOf("4. Ask the owner in this session"),
+      pause.indexOf("5. Apply each decision"),
+    );
+    expect(step4).toMatch(/only (the )?(file's|decision file's) options/i);
+  });
+
+  it("group-mode verify logs no gap for a test the group gate runs", () => {
+    const prompt = fs.readFileSync(
+      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-verify.md"),
+      "utf-8",
+    );
+    const start = prompt.indexOf("6. **If** `Mode` = `Group`");
+    const end = prompt.indexOf("7. **If** `Mode` = `Holistic`");
+    expect(start).toBeGreaterThanOrEqual(0);
+    expect(end).toBeGreaterThan(start);
+    const groupStep = prompt.slice(start, end);
+    expect(groupStep).toMatch(/not a gap/);
+    expect(groupStep).toMatch(/group gate/i);
+    expect(groupStep).toMatch(/Step 12|final run|holistic/i);
+    // Holistic mode keeps logging each failing test as a gap.
+    const holistic = prompt.slice(end, end + 1500);
+    expect(holistic).not.toMatch(/not a gap/);
+  });
+
   it("the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read", () => {
     const prompt = fs.readFileSync(
       path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-tasks.md"),
diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 743e09f7f..0cbc5d32f 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -814,6 +814,32 @@ describe("step conditionality", () => {
   });
 });
 
+describe("resume re-run of a red group gate", () => {
+  it("reports no hole for a build-decision row followed by a second build-group-gate row under the same verify attempt", () => {
+    const md = [
+      "## 🧠 Step 1 — Start",
+      '"{BKIT}" steps done --step=build-start-workflow',
+      "## 🧠 Step 8 — Verify",
+      '"{BKIT}" steps finish --step=build-plan-verify',
+      '"{BKIT}" steps finish --step=build-group-gate',
+      '"{BKIT}" steps finish --step=build-decision',
+      "## 🧠 Step 17 — Close",
+      '"{BKIT}" steps done --step=build-close-workflow',
+    ].join("\n");
+    const rows = [
+      { step: "build-start-workflow" },
+      { step: "build-plan-verify", attempt: 1, group: 1 },
+      { step: "build-group-gate", attempt: 1, group: 1, verdict: "FAIL" },
+      { step: "build-decision", attempt: 1 },
+      { step: "build-group-gate", attempt: 1, group: 1, verdict: "PASS" },
+      { step: "build-close-workflow" },
+    ].map((r) => ({ type: "step-done", workflow: "build", ...r }));
+    const report = auditRun(rows, "build", md);
+    expect(report.missing).toEqual([]);
+    expect(report.unexpected).toEqual([]);
+  });
+});
+
 describe("CLI sweep summary", () => {
   const capture = (args: string[]): string => {
     const originalWrite = process.stdout.write.bind(process.stdout);
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index f9a60c90a..70e5a9e04 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -110,25 +110,34 @@ _No tracker connected, skip step._
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -149,6 +158,7 @@ _No tracker connected, skip step._
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -272,6 +282,7 @@ _No tracker connected, skip step._
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -622,7 +633,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -638,23 +649,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -732,7 +744,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -930,6 +942,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -937,6 +950,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 8f7605e87..e50747d3b 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -74,6 +74,7 @@ autoCompactWindow: 300000
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index d5eebaa6f..c55a0af01 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -137,25 +137,34 @@ description: "Build Feature — Autonomous implementation"
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -176,6 +185,7 @@ description: "Build Feature — Autonomous implementation"
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -299,6 +309,7 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -707,7 +718,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -723,23 +734,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -817,7 +829,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -1015,6 +1027,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -1022,6 +1035,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 66b981d7d..8ad27d125 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1138,7 +1138,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:419`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:430`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1235,7 +1235,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:419`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:430`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -9785,24 +9785,35 @@ Derive the decision number:
 For either `VERIFY_GAPS` list:
 A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
 Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-A group-gate failure is never an item, because it is always fixed.
+A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
 **If** `PAUSE_QUESTION` = `CHALLENGE`:
 **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
 **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
 Title each item with its task number, when it has one, followed by its `Location` in brackets.
 **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
 **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-**If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+**If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
 **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
+Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
 `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
 **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
 **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
 **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+`{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 **If** `decisions compose` exits non-zero → **Failure Path**.
 **If** exit 4 **and** `RUNTIME_HEADLESS` = true → **Failure Path** naming each printed `hardBlockers` question.
 **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
+Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
 Route — first match wins:
+**If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
+**If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+**If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+**If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+**If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+**If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+**If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+**If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
 **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
 **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
 Clear `PAUSE_LOOP`. **If** `From: verify`, `From: holistic` **or** `From: tests` → the owner chose to go on, so give that loop one more full allowance when its limit is used up. Below the limit, or with `ask` = false, the command grants nothing and exits 1; both exits go on:
@@ -9879,6 +9890,7 @@ No-progress holistic round routed
 [workflow-pushes] **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
 [workflow-pushes] **Else** → push the record, but NEVER onto a branch with an open PR:
 Release the lock. NEVER run `workflows fail`:
+Red gate checked against the base commit (`tests base`), its verdict in the decision file
 Decision file written (`decisions compose`)
 Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -9950,21 +9962,16 @@ Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path*
 Tick the satisfied tasks in the plan. A task that the test-first report lists as a gap stays open:
 **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
 **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-**If** exit non-zero → **Failure Path**.
 **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
 **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
 Run the group gate: the static checks and the unit tier. The integration tier runs once, at Step 12. The gate writes the trimmed log to the artifact:
 **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
-**If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+**If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+**If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
 **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
 **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
 **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-**If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-**If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-**If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-**If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-**If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
 Test-first reds audited (`tests green`)
 Group diff cut from its start commit (`context diff`)
 Group gate verdict decided
@@ -9980,7 +9987,6 @@ Read status.jsonl and derive the next `STRATEGY`:
 Finish. The command records the header's `Strategy`:
 **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
 Check that the attempt changed source files, not only logs and ledgers:
-**If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
 Strategy computed before invocation
 Verify round read back on resume
 No-progress attempt routed
@@ -10011,7 +10017,9 @@ Findings merged into the plan (`challenge merge`)
 Merge route followed
 Derive the attempt the test log is named for:
 Run this block exactly as written:
+**If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
 **If** `TEST_VERDICT` = FAIL → route on the test rounds:
+**If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
 **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
 **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
 **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
@@ -10832,6 +10840,7 @@ Judge them against the supplied group diff (the changes since the group started)
 **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
 Check that every task field and gate maps to real changes in the codebase.
 Find missing components, skipped steps and unimplemented edge cases.
+A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 **If** `Mode` = `Holistic`:
 Run the same task and gate check across every group of the plan.
 Check the integration between groups:
diff --git a/.bkit/version b/.bkit/version
index ea27a760d..462a07ea9 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
-    ".claude/commands/bkit-build.md": "1436b48b64650f41b2afb0aa6a4f2c8f1356cbd79b7ca22c4f8d40d5e7fc7f72",
+    ".claude/commands/bkit-build.md": "1df252414eb5da8a763e252b1d44f231c35b44e56aefd6f8500ccd8f0358386a",
     ".claude/commands/bkit-debug.md": "f1304c91860d5e0f5bd3cf1b83262cb062004b2e62a4362254d91991a7796024",
     ".claude/commands/bkit-design.md": "e7b100d353cf886b88ba95572d3eb8f88ac09e584417f2823e6c817de6b21cf5",
     ".claude/commands/bkit-plan.md": "72b4b5b7461d58621715c10f684bcbafcfa343efce541c2481f6a45be2f2fbc1",
@@ -33,7 +33,7 @@
     ".claude/agents/bkit-build-challenge-2.md": "1ec51a399c91f576f95af0e0625983ded825282f0050540007a288c364777227",
     ".claude/agents/bkit-build-install-skills.md": "4da65c11fa042e5b578717c510dfaf3e8fe51466c04adc63cb16a8215913b817",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "ca2c03ce1e9f760974ed9db68d2a5f87cda964c78e2efc7571883abfa172368f",
-    ".claude/agents/bkit-build-plan-verify.md": "f23cdd8ae70a7345ae39525379be464b83308b334dd8a4da3b405f6471c14a3c",
+    ".claude/agents/bkit-build-plan-verify.md": "5f43ad06625f20903c5feb7da7a720e95bcf2bd90c00b4a6d6c6942897023038",
     ".claude/agents/bkit-debug-abort-handover.md": "f5611ebb0250dc782e7a98c516f0c97ff37234b191cd890d6959539e0c9864f7",
     ".claude/agents/bkit-debug-failure-diagnose.md": "39dc6d8b20bcf665238b3a940f93d17481ca109947063cc40553431c1cd82f21",
     ".claude/agents/bkit-debug-failure-remediate.md": "24ee9d2820cb0df18d22212115283701911e87d297d1776ee6fb86c74850fa48",
@@ -56,7 +56,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "48aee178590ac282a2de281a33454833d3df07065d2e174a73373e1f74dd2be3",
     ".claude/agents/bkit-utility-update-documentation.md": "aa2d0541c2b77b0f647ee0d046c38446d90598ad23af0ea8907a52b471b39768",
     ".cursor/commands/bkit-auto.md": "4c152651b33c0ba41f323ade39b9d578d6af66e3cea25d9464a408eb357e4a05",
-    ".cursor/commands/bkit-build.md": "d5a109a8a7b75655aacca6aa11f1b296352353bd9beb61e9cf0f0dc131d8c827",
+    ".cursor/commands/bkit-build.md": "05c7147a5640c4559d3f37280897f0afd0d8f33d382fe1a64172a6174ed3bccc",
     ".cursor/commands/bkit-debug.md": "c02ad2c9c5b1e44a1c50f422b3244bc81f71006a31717e8e594fbe5744961b4b",
     ".cursor/commands/bkit-design.md": "505e4909b51ec35696974a567c6b720a5f2a20e0b9ae4dccd814060319497dfd",
     ".cursor/commands/bkit-plan.md": "a0328b0487eff4968a76907eebb76e5f7cb25a3c46f961458ef5fb5c1753b935",
@@ -65,7 +65,7 @@
     ".cursor/agents/bkit-build-challenge-2.md": "de62e52353593d44629e9b32d824578e629815566c7e7cf81336d2ec396fbe69",
     ".cursor/agents/bkit-build-install-skills.md": "823ebd00f4d9e732796520677b2d2b5aa17fbd72dcbc9a92ff78bf141c44af95",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "61ede6aa7b109c40b7b2b767915126b5c2ffa787497f6ba6648d5ab1c424292a",
-    ".cursor/agents/bkit-build-plan-verify.md": "c2e5a904607ec942ebc1b5253d7566dc9a55b5586eaa126dfede9fb303641b04",
+    ".cursor/agents/bkit-build-plan-verify.md": "55983ae82aa895524d3fbea4a0879be32f4f594279ed1db49f199d5c201cab34",
     ".cursor/agents/bkit-debug-abort-handover.md": "b697eb7fe094d71a361e6b5b4af68590c5bc27f0f30e751edd2e1fc88613d1c6",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "4e3e65558765353110f523e84950be3ef9b896f3a86c531b6de5aa28e7662b17",
     ".cursor/agents/bkit-debug-failure-remediate.md": "f0be7aa4321eec49b2e7abb68fbf4189418123f802e9100cfc20cf3bb9673e02",
@@ -91,7 +91,7 @@
     ".opencode/agents/bkit-build-challenge-2.md": "8985c0e6c39d93c0b960e05ac4498c176c39b95a4abeec6d4a0b77ccb10d5c0e",
     ".opencode/agents/bkit-build-install-skills.md": "b7bf5934fa71e8d7f7b895c848533ff1b8bd56813d57c17f86c49bef10b7e387",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "960eb83f966909988f5e49534987445c89b094e1ceb862c2a7123e681e870d77",
-    ".opencode/agents/bkit-build-plan-verify.md": "6c86f0e3b685e24f7fd61e6bde8dcf3e130cd1f557f5412307a4d8910a594dfb",
+    ".opencode/agents/bkit-build-plan-verify.md": "e8d4f5c7b954e51e9face2d1e34e5f35f5d17cb7278f36cd788b5f08ebfb9deb",
     ".opencode/agents/bkit-debug-abort-handover.md": "38a0710518d6d638122708ae1e4f02265bfe653d01776b78001a168c3706ec65",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "c0c296704dd6e409d63a42fc85a62ab4077209aa788f2a0765c11a10bbbf0d52",
     ".opencode/agents/bkit-debug-failure-remediate.md": "c67c9339c20b88d94f04e7645b13b1f200d815a323b1d7cf15e7913e741bf240",
@@ -114,7 +114,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "6eeac027ab801c0ad404351a6b1ee043a45442c0cf268f444a028071a8bafd7a",
     ".opencode/agents/bkit-utility-update-documentation.md": "5fd081ae119984018573f62444493240b66411a75ec2aeafe6bdd1b1de903390",
     ".opencode/commands/bkit-auto.md": "3440ae6b925da8906394459788c702adaebd1acfe9c3fa0eddc3b40102596606",
-    ".opencode/commands/bkit-build.md": "5bba20dc1089feabb09a127896d9ab20cb7d956225307b1b232eaec5ccc6a15c",
+    ".opencode/commands/bkit-build.md": "3bb69df82fc9eab476e2343846ae21c00933d01dd336aba0805a5ebb6920ff7b",
     ".opencode/commands/bkit-debug.md": "508ad6d28451d31b85933f4f866fb33338543d75a1d7da4004227ac4b11b0fe8",
     ".opencode/commands/bkit-design.md": "b26082616675924b1617cbd56a3be75b9045ca6abe809e7d93a6bff203ca1bff",
     ".opencode/commands/bkit-plan.md": "75e9b3ce72892071c9a1de753cef3d5ff124aa1dee2b0c1917adcb2c87fb9b97",
@@ -132,7 +132,7 @@
     ".codex/agents/bkit-build-install-skills.toml": "7366a7fb42ebb558d02853bfc674b9546c56cb66b8a471a37e57c0c3e833acf7",
     ".codex/agents/bkit-build-plan-current.toml": "2030e95d7a29976f54aec76f3991e77e001034bcf9f159d2996352ab28045f88",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "c47ccb081fb01b222b46d3b4257a1b521e80e71117caca856dbf1e9f17091ea7",
-    ".codex/agents/bkit-build-plan-verify.toml": "a464d1c76311b620513bfcc2bebef9042033eb0a51107a99b5726b1365a21e41",
+    ".codex/agents/bkit-build-plan-verify.toml": "b5052e5186fa5d2620aa4d28a5244de6c9ff1fa1be4a140613b17457d545c01d",
     ".codex/agents/bkit-debug-abort-handover.toml": "11b2ffbb2c21438e3031f2348e5641b59b0eca8ae75ee44523d61fef3242b986",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "2bf13d7bc9fbbbb04e95fe598797c7a5d55044e8165ff070eb0200e01b5f98d9",
     ".codex/agents/bkit-debug-failure-remediate.toml": "1b215ceb104de2dd00b35066b0acca9334aba7c24364c528c7718a5ecacfb16d",
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index 525c3ebfc..f6a7fcac0 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -75,6 +75,7 @@ autoCompactWindow: 300000
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 04a7f9beb..7e14d5269 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -41,7 +41,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -118,25 +118,34 @@ description: "Build Feature — Autonomous implementation"
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -157,6 +166,7 @@ description: "Build Feature — Autonomous implementation"
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -280,6 +290,7 @@ description: "Build Feature — Autonomous implementation"
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -665,7 +676,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -681,23 +692,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -775,7 +787,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -973,6 +985,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -980,6 +993,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index d598a9d8b..0438ecb5e 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -62,6 +62,7 @@ developer_instructions = """
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index f50f71301..a05f51e56 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -72,6 +72,7 @@ tools:
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index c6457bba9..1b1e390ad 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -40,7 +40,7 @@ Build Feature — Autonomous implementation
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -117,25 +117,34 @@ Build Feature — Autonomous implementation
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -156,6 +165,7 @@ Build Feature — Autonomous implementation
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -279,6 +289,7 @@ Build Feature — Autonomous implementation
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -664,7 +675,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -680,23 +691,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -774,7 +786,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -972,6 +984,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -979,6 +992,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index 55b27ecfd..7260d2ff7 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -73,6 +73,7 @@ tools:
    - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
    - Check that every task field and gate maps to real changes in the codebase.
    - Find missing components, skipped steps and unimplemented edge cases.
+   - A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap: the workflow routes the gate's result itself. After the last group there is no group gate, so Step 12's final run and the holistic verify cover a failing test.
 7. **If** `Mode` = `Holistic`:
    - Run the same task and gate check across every group of the plan.
    - Check the integration between groups:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index bf4834e78..d06d91728 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -44,7 +44,7 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -121,25 +121,34 @@ $ARGUMENTS
    - For either `VERIFY_GAPS` list:
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - A group-gate failure is never an item, because it is always fixed.
+     - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
-   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+   - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
+   Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
+
+   ```bash
+   "{BKIT}" tests base --log="{GATE_LOG}" --file="{STATUS}" --workflow=build --out="{OUTBOX}/base-check.json"
+   ```
+
+   **If** `tests base` exits non-zero → **Failure Path**. Every verdict, `unknown` included, exits 0 and goes into the pause.
+
    Compose the file with these flags:
    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+   - `{BASE_FLAGS}` = `--header=Gate=FAIL` when the base check ran, plus `--base-check="{OUTBOX}/base-check.json"` when `{LOOP_FLAGS}` is not empty; empty otherwise.
 
    ```bash
-   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+   "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS} {BASE_FLAGS}
    ```
 
    **If** `decisions compose` exits non-zero → **Failure Path**.
@@ -160,6 +169,7 @@ $ARGUMENTS
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
@@ -283,6 +293,7 @@ $ARGUMENTS
 
 ### 🔒 Gate — Decision Pause
 
+- [ ] Red gate checked against the base commit (`tests base`), its verdict in the decision file
 - [ ] Decision file written (`decisions compose`)
 - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
@@ -668,7 +679,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
      ```
      Route — first match wins:
      - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
-     - **If** exit non-zero → **Failure Path**.
+     - **If** exit non-zero → **Failure Path**, with `GATE_RERUN` cleared.
      - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
      - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
@@ -684,23 +695,24 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --number=8 --post --title="Group Gate" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>"
    ```
-10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → clear `GATE_RERUN`, then Step 7 without asking, which briefs the next group or goes to Step 10 when none is open.
 11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
     Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
-    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
-    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
-    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
-    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
-    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
+    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides. `GATE_RERUN` cleared.
+    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round. `GATE_RERUN` cleared.
+    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate. `GATE_RERUN` cleared.
+    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps. `GATE_RERUN` cleared.
     - **Else** → **Failure Path**.
 12. **Else** → **Failure Path**.
 
@@ -778,7 +790,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Exit 1 means the attempt changed no source file.
    Route — first match wins:
-   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+   - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
    - **Else** → **Failure Path**.
 
@@ -976,6 +988,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" steps finish --workflow=build --step=build-run-tests --file="{STATUS}" --verdict={TEST_VERDICT} {FAILURES_FLAG} --scope="{TEST_SCOPE}" --attempt=next --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md" --clamp-log="build-run-tests:<attempt>" --number=12 --post --title="Run Tests" --message="chore({FID}): run-tests attempt <attempt>"
    ```
 4. Route:
+   - **If** `TEST_VERDICT` = PASS **and** `GATE_RERUN` is set → clear `GATE_RERUN`, then Step 15 without asking.
    - **If** `TEST_VERDICT` = PASS → Step 15.
    - **If** `TEST_VERDICT` = FAIL → route on the test rounds:
      ```bash
@@ -983,6 +996,7 @@ This step checks the whole feature against the plan after the last group, and ag
      ```
      Hold `value` as `TEST_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
      Route:
+     - **If** `GATE_RERUN` = true → clear `GATE_RERUN`, `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — the re-run is still red, so the pause is asked again with fresh numbers.
      - **If** `LIMIT_ASK` = true **and** either exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause** — `build.tests.maxAttempts` is used up, so the owner decides whether to try another round.
      - **If** exit 1 **or** `TEST_ROUNDS` = `PAUSE_MAX` → **Failure Path** — `build.tests.maxAttempts` is used up, so no round is left.
      - **If** exit 0 → read the loop's progress.
