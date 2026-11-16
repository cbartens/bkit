diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index cd239354f..212af9414 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -92,6 +92,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -133,7 +134,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
index 1fffc31d2..a183362f0 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
@@ -106,6 +106,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 988f76a77..b0e6fb8df 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -91,6 +91,8 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 58b147d94..f884988d4 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -133,6 +133,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -628,7 +629,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -801,7 +802,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -891,7 +892,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1120,13 +1121,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1160,6 +1162,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 39ad64ad0..287006db1 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -133,6 +133,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -628,7 +629,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -801,7 +802,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -891,7 +892,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1120,13 +1121,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1160,6 +1162,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index c8df89780..5e7951f11 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -333,9 +333,9 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Runs `bkit tasks currency --plan= --base={BASE_SHA} --against=origin/dev` — the engine records each task's in-scope paths and symbols in the plan block and prints only the tasks whose path or symbol moved in `{BASE_SHA}...origin/dev`, each with its matched paths, needles and diff hunks — and reads those hunks only, no whole-range diff, no path outside a matched set. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-tasks` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-tests` | Write one task group's planned tests — every `TEST FIRST` test of the task blocks in the brief `bkit context brief --group --tests-only --file` writes, which leaves out the tests the group's red rows already proved. Each test fails on the behaviour its `fails on` text names, is lint-clean, and never names a test the task's `TEST EXCEPTION` names; a stub only where a test cannot load without one; no source code (`steps finish --step=build-plan-tests --plan` refuses a diff touching any other file, exit 15). Flat log `build-plan-tests-{GROUP}-log.md`: ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists; `bkit tests red` records the test `passed-accepted`), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tests left; the workflow re-runs the tests half once with a fresh brief. Re-invoked with a red report → rewrites only the tests it lists as `vacuous`, `missing`, `no-report` or `lint`. Never runs `bkit tests red` itself; the orchestrator runs it once per group after the step. |
-| `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test file differs from its red blob, exit 11); a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
-| `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
+| `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test case differs from its baseline, exit 11), except that a correct code change forcing a planned-test edit is kept and logged ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` plus the task's `DONE` line, which the owner answers at the end of the build; a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests and `Changed by a code step` entries → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change, and a planned-test edit its code change forces is kept and logged ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` plus the gap's `DONE` line; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d21b9a0e4..f99842659 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -968,7 +968,7 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 4 — Plan Convert | `@bkit-build-plan-convert`, run only when the plan is missing, has no task markers or is older than an issue comment | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes a no-agent skip row (`build-plan-convert`, `--attempt=1`, comment `Status=skipped (plan already in task-block form)`) and goes to Step 5. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 5 — Plan Current | `@bkit-build-plan-current` (skipped when the mechanical trigger clears) | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the plan against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-tasks`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 6 — Skills | `@bkit-build-install-skills` (skip if input contains `[skills=false]`) | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its red, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
+| 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its baseline and that no `BLOCKED — TASK {N}: test` line names, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
 | 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; attempt-numbered `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the holistic rounds since the last clean one (`counters route --of=build-plan-verify-holistic:current --since-clean --point=build.verify`; clean = PASS, or CONCERNS with 0 failures, so a fix group's re-check gets a fresh allowance) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
@@ -988,10 +988,11 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions compose --base-check=` words the loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL`, `openDecision` `status` = `OPEN` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other `Gate: FAIL` pause (a `DECIDED` / `ASSUMED` file, which keeps the owner's route, a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
 - **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `Fix task:` line names. An `Accept` or `Accept (assumed)` item that already carries a `Decision:` line writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`, and step 6 adds a `Decision:` line only under an item that has none. A decided file a `build-decision` row names is not reopened, and `decisions compose` is unchanged.
-- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
+- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
@@ -1792,12 +1793,13 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | --- | --- | --- |
 | Write (Step 7, per group) | `@bkit-build-plan-tests` from `build-brief-tests-{GROUP}-{n}.md`, log `build-plan-tests-{GROUP}-log.md` | Writes every planned test of the group's open tasks that no red row has proved yet, each failing on the behaviour its `fails on` text names, lint-clean; stubs only where a test cannot load without one; no source code. Log lines ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). `steps finish --step=build-plan-tests --plan` reads the group's `TEST FIRST` files from the plan and refuses a diff touching any other tracked file, or adding a file a plan `CREATE` line names: exit 15, `source` names them, nothing committed; the orchestrator re-asks once (undo the edits), then Failure Path. |
 | Red (Step 7, per group) | orchestrator runs `bkit tests red --group`, log `build-tests-red-{GROUP}-{n}.md` | Per planned test file of the group's open tasks: `bkit:lint:file` (when declared) passes on it, then `bkit:test:file` runs it once and its JUnit report is read. Per planned test: `red` (ran and failed), `red-not-loaded` (no case carries the planned name, and the report holds no case or only non-passing cases whose name contains the file's stem — an import of unwritten code; counts as red), `passed-accepted` (passed, and the writer's log has a `PASSES` line for it; already landed), `updated` (passed, no `PASSES` line, and the test already existed at the group's start commit with different lines: an existing test the tests step changed; `base` = that commit; counts as proven, and verify judges its diff), `vacuous` (passed, no `PASSES` line, not an update), `missing` (absent from a loaded report, or the file does not exist), `no-report` (no report written), `lint` (the file failed lint; not run). Writes one `build-tests-red` row (`attempt`, `enforced`, `tests` = `{task, test, testName, state, blob, block, reason?, base?}`, `blob` the file's git blob written into the object store with `hash-object -w`, `block` the sha-1 of the test's own lines (null when no line names it), `--commit=none`). Exit 0 every test red; 1 a gap; 3 `bkit:test:file` undeclared (blobs recorded, nothing ran, not enforced); 4 a script could not run. A test an earlier row of the group proved (`red`, `red-not-loaded`, `passed-accepted`, `updated`) with its own lines unchanged is not run again (`skipped`), so a handover, a retry or a task added to the group runs only what is left; a row holds the tests it ran, and readers merge the group's rows per test, later rows winning, except that a proven entry stands against a later unproven result for the same lines. Ticked tasks are skipped. Exit 1 → the orchestrator re-invokes the tests agent once with the red report (rewrite only the `vacuous` / `missing` / `no-report` / `lint` tests), runs red again, and then moves on whatever the result: the gaps reach `tests green` as `unproven`. |
-| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated` and `unproven`. |
-| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated`, `changed` and `unproven`; `changed` lists each plan-named test (every group) a code step's `changedTests` record changed, with its reason, never a gap, and the report gets a `Changed by a code step` section when it is non-empty. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed`, `Changed by a code step` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Changed tests (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `changed` non-empty → one § Decision Pause (`CHANGED_TESTS`), one `Accept` / `Stop` item per test. Asked once per run, before the Unproven pause. |
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that when no case carries the planned name and the report holds no case, or every case is non-passing with a name containing the file's stem, the file is `red-not-loaded` (per-runner commands: `docs/testing.md` § Test first): the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead and recorded in the step row's `changedTests` (its reason, its new block), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/.bkit/core/docs/templates/bkit-plan.md b/.bkit/core/docs/templates/bkit-plan.md
index 524644f55..2acd0423b 100644
--- a/.bkit/core/docs/templates/bkit-plan.md
+++ b/.bkit/core/docs/templates/bkit-plan.md
@@ -331,7 +331,7 @@ Carry each required read and each doc update into the runbook task that needs it
 - [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
 - [ ] **No gate weakened:** no gate was weakened.
 - [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
-- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
+- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
 - [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
 - [ ] **Gate 2 — Verified:** every box above is checked.
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 4b0ec60db..89661a2b4 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -9,6 +9,7 @@ import { describe, expect, it } from "vitest";
 import { callWords, stepSections } from "../../checks/status-holes";
 import { COMMANDS } from "../../commands/registry";
 import { WORKFLOW_STEPS } from "../../commands/workflow/step-table";
+import { blockedTests } from "../../commands/workflow/tests";
 import { substituteWorkflow } from "../../render/trackers";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
@@ -2291,3 +2292,101 @@ describe("build publish ending", () => {
     );
   });
 });
+
+describe("planned tests a code step changed", () => {
+  const prompt = (name: string) =>
+    fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "prompts", `${name}.md`), "utf-8");
+  /** A BLOCKED test line form (`{N}`, `{file}`, `{name}`, `{why}`) filled in the way an agent fills it. */
+  const filled = (form: string) =>
+    form
+      .replaceAll("{N}", "1")
+      .replaceAll("{file}", "src/a.test.ts")
+      .replaceAll("{name}", "adds a row")
+      .replaceAll("{why}", "the new setup line");
+  const FORM = (kind: "TASK" | "Gap") =>
+    new RegExp(`BLOCKED — ${kind} \\{N\\}: test \`\\{file\\}\` \`\\{name\\}\` — \\{why\\}`);
+  /** The line holding the keep-and-log case (a correct code change forces a planned-test edit), with the lines under it. */
+  const keepCase = (text: string) => {
+    const lines = text.split("\n");
+    const at = lines.findIndex((l) => /\bkeep\b/i.test(l) && /\bforces?\b|\bforced\b/i.test(l));
+    expect(
+      at,
+      "no line says a code change that forces a planned-test edit keeps the edit",
+    ).toBeGreaterThanOrEqual(0);
+    return lines.slice(at, at + 5).join("\n");
+  };
+
+  it("an exit 11 re-ask offers the BLOCKED test line the engine reads", () => {
+    const reasks = workflow("build")
+      .split("\n")
+      .filter((l) => l.includes("**If** exit 11 →"))
+      .filter((l) => l.includes("planned test case"));
+    expect(reasks).toHaveLength(3);
+    const kinds = ["TASK", "Gap", "Gap"] as const;
+    reasks.forEach((line, i) => {
+      const kind = kinds[i]!;
+      const form = FORM(kind).exec(line.replaceAll("``", ""));
+      expect(form, `exit 11 re-ask ${i + 1} offers no ${kind} test line form`).not.toBeNull();
+      expect(blockedTests(filled(form![0]))).toEqual([
+        { test: "src/a.test.ts", name: "adds a row", reason: "the new setup line" },
+      ]);
+      // The agent appends its DONE line again after the BLOCKED one.
+      const after = line.slice(line.indexOf(form![0]) + form![0].length);
+      expect(after).toMatch(new RegExp(`DONE — ${kind} \\{N\\}`));
+      expect(after).toMatch(/again/);
+    });
+  });
+
+  it("Step 15 asks once about planned tests a code step changed, before the unproven ones", () => {
+    const step = stepBody(workflow("build"), /Step 15 — Summary/);
+    const skip = step.split("\n").find((l) => l.includes("**Skip if**"))!;
+    expect(skip).toContain("`Question: CHANGED_TESTS`");
+    expect(skip).toContain("`Question: UNPROVEN`");
+    expect(step).toMatch(/Hold `changed` as `CHANGED_TESTS`/);
+    const changedAt = step.indexOf("`PAUSE_QUESTION` = `CHANGED_TESTS`");
+    const unprovenAt = step.indexOf("`PAUSE_QUESTION` = `UNPROVEN`");
+    expect(changedAt).toBeGreaterThanOrEqual(0);
+    expect(unprovenAt).toBeGreaterThan(changedAt);
+    // A CHANGED_TESTS answer alone never skips `tests green`: the opening skip needs both answers.
+    expect(skip).toMatch(/both/i);
+  });
+
+  it("a changed-test item offers Accept or Stop, recommended Accept", () => {
+    const pause = section(workflow("build"), /Decision Pause/);
+    const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUESTION` = `CHANGED_TESTS`"));
+    expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").toBeDefined();
+    expect(rule).toContain('Options `["Accept", "Stop"]`');
+    expect(rule).toMatch(/recommended `Accept`/);
+  });
+
+  it("the execute prompt's BLOCKED test line is one the engine reads", () => {
+    const text = keepCase(prompt("bkit-build-plan-tasks"));
+    const form = FORM("TASK").exec(text.replaceAll("``", ""));
+    expect(form, "the keep-and-log case has no TASK test line form").not.toBeNull();
+    expect(blockedTests(filled(form![0]))).toHaveLength(1);
+    expect(text).toMatch(/DONE/);
+    expect(text).toMatch(/prettier/);
+  });
+
+  it("the remediate prompt's BLOCKED test line is one the engine reads", () => {
+    const whole = prompt("bkit-build-plan-gaps-remediate");
+    const text = keepCase(whole);
+    const form = FORM("Gap").exec(text.replaceAll("``", ""));
+    expect(form, "the keep-and-log case has no Gap test line form").not.toBeNull();
+    expect(blockedTests(filled(form![0]))).toHaveLength(1);
+    expect(text).toMatch(/DONE/);
+    expect(text).toMatch(/prettier/);
+    const log = whole.slice(whole.indexOf("## Remediation Log"));
+    expect(FORM("Gap").test(log.replaceAll("``", ""))).toBe(true);
+  });
+
+  it("the verify prompt notes a planned test a code step changed and raises no gap", () => {
+    const lines = prompt("bkit-build-plan-verify").split("\n");
+    const at = lines.findIndex((l) => l.includes("`Changed by a code step` section"));
+    expect(at, "no `Changed by a code step` section rule").toBeGreaterThanOrEqual(0);
+    const rule = lines.slice(at, at + 2).join("\n");
+    expect(rule).toContain("`Notes`");
+    expect(rule).toMatch(/No gap/);
+    expect(rule).not.toMatch(/append ``?TASK/);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
new file mode 100644
index 000000000..f1a009096
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
@@ -0,0 +1,237 @@
+// planned-test-lock.integration.test.ts — the planned-test lock over a real temp git repo: `bkit`
+// is spawned through `requireTsx()` and runs `steps finish` and `tests green` end to end.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { useGateRunner } from "../../../../../vitest.gate-fixture";
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+import { requireTsx } from "../../../../../vitest.tsx-bin";
+
+const BUDGET = tierTimeouts(true);
+const CLI = path.resolve(".bkit/core/engine/cli.ts");
+const STATUS = "logs/status.jsonl";
+const FIRST = { file: "src/a.test.ts", name: "adds a row" };
+const SECOND = { file: "src/c.test.ts", name: "does other" };
+
+useGateRunner();
+
+let cwd: string;
+let env: NodeJS.ProcessEnv;
+
+const git = (...args: string[]) => {
+  const res = spawnSync("git", args, { cwd, env, encoding: "utf-8" });
+  expect(res.status, res.stderr).toBe(0);
+  return res.stdout.trim();
+};
+const write = (rel: string, body: string) => {
+  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, rel), body);
+};
+const bkit = (...args: string[]) => {
+  const res = spawnSync(requireTsx(), [CLI, ...args, "--json"], {
+    cwd,
+    env,
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return {
+    status: res.status,
+    stdout: res.stdout,
+    stderr: res.stderr,
+    json: res.stdout.trim() ? (JSON.parse(res.stdout) as Record<string, any>) : {},
+  };
+};
+
+/** Group 1's task is ticked, as Step 8's `tasks tick` leaves it; group 2's is open. */
+const PLAN = [
+  "# Plan",
+  "",
+  "<!-- bkit:group 1 start -->",
+  "### TASK GROUP 1: Rows",
+  "<!-- bkit:task 1 start -->",
+  "- [x] **TASK 1:** Add a row",
+  "  - **CREATE:** `src/a.ts`: the row",
+  "  - **DONE WHEN:** passes",
+  "  - **TEST FIRST:**",
+  `    - \`${FIRST.file}\` \`${FIRST.name}\` fails on the stub`,
+  "<!-- bkit:task 1 end -->",
+  "<!-- bkit:group 1 end -->",
+  "<!-- bkit:group 2 start -->",
+  "### TASK GROUP 2: Others",
+  "<!-- bkit:task 2 start -->",
+  "- [ ] **TASK 2:** Add other",
+  "  - **CREATE:** `src/c.ts`: other",
+  "  - **DONE WHEN:** passes",
+  "  - **TEST FIRST:**",
+  `    - \`${SECOND.file}\` \`${SECOND.name}\` fails on the stub`,
+  "<!-- bkit:task 2 end -->",
+  "<!-- bkit:group 2 end -->",
+  "",
+].join("\n");
+
+const FIRST_BODY = [
+  "describe('rows', () => {",
+  `  it('${FIRST.name}', () => {`,
+  "    expect(addRow()).toBe(1);",
+  "  });",
+  "});",
+  "",
+].join("\n");
+
+beforeEach(() => {
+  cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-planned-lock-")));
+  env = {
+    ...process.env,
+    BKIT_ENGINE_JOURNAL: "off",
+    GIT_AUTHOR_NAME: "t",
+    GIT_AUTHOR_EMAIL: "t@t",
+    GIT_COMMITTER_NAME: "t",
+    GIT_COMMITTER_EMAIL: "t@t",
+  };
+  for (const key of Object.keys(env))
+    if (key.startsWith("BKIT_TEST_") || key === "CI") delete env[key];
+  git("init", "-q", "-b", "feat/1-x");
+  git("config", "commit.gpgsign", "false");
+  write(
+    "package.json",
+    JSON.stringify({ private: true, scripts: { "bkit:test:file": 'node runner.mjs "$@"' } }),
+  );
+  write(
+    "runner.mjs",
+    [
+      'import fs from "node:fs";',
+      "const nameOf = (f) => /it\\('([^']+)'/.exec(fs.readFileSync(f, 'utf8'))[1];",
+      'const cases = process.argv.slice(2).map((f) => `<testcase name="${nameOf(f)}" file="${f}"/>`);',
+      'fs.writeFileSync(process.env.BKIT_TEST_REPORT, "<testsuite>" + cases.join("") + "</testsuite>");',
+      "",
+    ].join("\n"),
+  );
+  write("plan.md", PLAN);
+  write(FIRST.file, FIRST_BODY);
+  write(SECOND.file, "it('does other', () => expect(other()).toBe(1));\n");
+  write("src/b.ts", "export const b = 1;\n");
+  write("logs/.keep", "");
+  git("add", "-A");
+  git("commit", "-q", "-m", "tests");
+});
+
+afterEach(() => {
+  fs.rmSync(cwd, { recursive: true, force: true });
+});
+
+const redRows = () => {
+  const blob = (file: string) => git("hash-object", "-w", file);
+  const row = (group: number, task: number, t: { file: string; name: string }) =>
+    JSON.stringify({
+      type: "step-done",
+      workflow: "build",
+      step: "build-tests-red",
+      status: "DONE",
+      at: "2026-11-01T05:00:00Z",
+      parentSha: git("rev-parse", "HEAD"),
+      group,
+      attempt: 1,
+      enforced: true,
+      artifacts: [`logs/build-tests-red-${group}-1.md`],
+      tests: [{ task, test: t.file, testName: t.name, state: "red", blob: blob(t.file) }],
+    });
+  write(STATUS, `${row(1, 1, FIRST)}\n${row(2, 2, SECOND)}\n`);
+  git("add", "-A");
+  git("commit", "-q", "-m", "red rows");
+};
+
+const finishArgs = (step: string, agent: string, log: string, group?: number) => [
+  "steps",
+  "finish",
+  `--file=${STATUS}`,
+  "--workflow=build",
+  `--step=${step}`,
+  ...(group === undefined ? [] : [`--group=${group}`]),
+  `--attempt-of=${step}:next`,
+  `--agent=${agent}`,
+  `--artifact=${log}`,
+  "--plan=plan.md",
+  `--message=chore(1-x): ${step}`,
+];
+
+describe("the planned-test lock across groups", () => {
+  it("a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed", () => {
+    redRows();
+    // Group 2's code step edits group 1's planned test (new setup line) and logs it BLOCKED.
+    write(FIRST.file, FIRST_BODY.replace("    expect(", "    setup();\n    expect("));
+    write("src/c.ts", "export const other = () => 1;\n");
+    write(
+      "logs/execute-2-log.md",
+      [
+        "Verdict: PASS",
+        "",
+        "<!-- verdict:end -->",
+        "",
+        "# Build Plan",
+        "",
+        `BLOCKED — TASK 2: test \`${FIRST.file}\` \`${FIRST.name}\` — the new src/c.ts needs setup()`,
+        "DONE — TASK 2: added other",
+        "",
+      ].join("\n"),
+    );
+    const own = bkit(
+      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-2-log.md", 2),
+    );
+    expect(own.status, own.stderr).toBe(0);
+    const rows = fs
+      .readFileSync(path.join(cwd, STATUS), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, any>);
+    expect(rows.find((r) => r.step === "build-plan-tasks")?.changedTests).toEqual([
+      expect.objectContaining({
+        task: 1,
+        test: FIRST.file,
+        testName: FIRST.name,
+        reason: "the new src/c.ts needs setup()",
+      }),
+    ]);
+
+    // The holistic fix spans every group and never touched the file: it passes.
+    write("src/b.ts", "export const b = 2;\n");
+    write(
+      "logs/remediate-1-log.md",
+      "Verdict: PASS\nStrategy: STANDARD\nFixed: 1\n\n<!-- verdict:end -->\n\n# Plan Gaps\n",
+    );
+    const holistic = bkit(
+      ...finishArgs(
+        "build-plan-gaps-remediate-holistic",
+        "bkit-build-plan-gaps-remediate",
+        "logs/remediate-1-log.md",
+      ),
+    );
+    expect(holistic.status, holistic.stderr).toBe(0);
+
+    const green = bkit(
+      "tests",
+      "green",
+      `--file=${STATUS}`,
+      "--workflow=build",
+      "--group=2",
+      "--plan=plan.md",
+      "--log=logs/green.md",
+    );
+    expect(green.json.gaps).toEqual([]);
+    expect(green.json.changed).toEqual([
+      {
+        task: 1,
+        test: FIRST.file,
+        name: FIRST.name,
+        reason: "the new src/c.ts needs setup()",
+      },
+    ]);
+    expect(fs.readFileSync(path.join(cwd, "logs/green.md"), "utf-8")).toContain(
+      "## Changed by a code step",
+    );
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 62d688130..711b0662b 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -36,6 +36,7 @@ import {
   testsCommand,
 } from "./tests";
 import { countReportFailures, parseJunit, reportFailures, type JunitCase } from "./junit";
+import { writeStepRow } from "./steps";
 
 const dirs: string[] = [];
 const tmp = (prefix: string) => {
@@ -2709,6 +2710,89 @@ describe("bkit tests red / green", () => {
     expect(r.json.unproven[0].detail).toContain("vacuous");
   });
 
+  describe("tests a code step changed", () => {
+    const body = (n: number) =>
+      `it('${NAME}', () => {\n  expect(clamp(5, 1, 10)).toBe(${n});\n});\n`;
+    /** A `build-plan-tasks` row carrying `changedTests`, written by the row builder `steps finish` uses. */
+    const codeStepRow = (changed: Array<{ test: string; testName: string; reason: string }>) =>
+      writeStepRow(
+        cwd,
+        {
+          file: path.join(cwd, STATUS),
+          workflow: "build",
+          step: "build-plan-tasks",
+          group: 1,
+          attempt: 1,
+          artifacts: [],
+          extras: {
+            changedTests: changed.map((c) => ({
+              task: 1,
+              test: c.test,
+              testName: c.testName,
+              block: blockHash(fs.readFileSync(path.join(cwd, c.test), "utf-8"), c.testName),
+              reason: c.reason,
+            })),
+          },
+          commit: "none",
+        },
+        () => {},
+      );
+    const provenRed = async () => {
+      fs.writeFileSync(path.join(cwd, TEST), body(5));
+      vi.stubEnv("FAKE_EXIT", "1");
+      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+      expect((await red()).code).toBe(0);
+    };
+
+    it("green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap", async () => {
+      await provenRed();
+      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      codeStepRow([{ test: TEST, testName: NAME, reason: "new setup line" }]);
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      const r = await green();
+      expect(r.code).toBe(0);
+      expect(r.json.gaps).toEqual([]);
+      expect(r.json.changed).toEqual([
+        { task: 1, test: TEST, name: NAME, reason: "new setup line" },
+      ]);
+      expect(report()).toContain("## Changed by a code step");
+      expect(report()).toContain("new setup line");
+    });
+
+    it("green leaves a changed test the plan no longer names out of changed", async () => {
+      writePlan([TASK_1, testTask(2, [[OTHER, "third"]])]);
+      fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
+      fs.writeFileSync(path.join(cwd, TEST), body(5));
+      vi.stubEnv("FAKE_EXIT", "1");
+      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("third")));
+      expect((await red()).code).toBe(0);
+      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      fs.appendFileSync(path.join(cwd, OTHER), "// setup\n");
+      codeStepRow([
+        { test: TEST, testName: NAME, reason: "kept" },
+        { test: OTHER, testName: "third", reason: "dropped from the plan" },
+      ]);
+      // The plan drops task 2: no TEST FIRST line names `third` any more.
+      writePlan([TASK_1]);
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      const r = await green();
+      expect(r.json.changed).toEqual([{ task: 1, test: TEST, name: NAME, reason: "kept" }]);
+      expect(report()).not.toContain("dropped from the plan");
+    });
+
+    it("green prints an empty changed list and no Changed by a code step section when no code step changed a test", async () => {
+      await provenRed();
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      const r = await green();
+      expect(r.code).toBe(0);
+      expect(r.json.changed).toEqual([]);
+      expect(report()).not.toContain("Changed by a code step");
+    });
+  });
+
   it("green: not enforced (exit 0, report says why) when the test-file script is undeclared", async () => {
     checkout(scripts({ test: "x" }));
     writePlan([TASK_1]);
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index cbd8862a9..10feaedb8 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -1417,6 +1417,14 @@ interface Unproven {
   detail: string;
 }
 
+/** A planned test a code step changed under a BLOCKED line: the owner answers it at the end of the build. */
+interface Changed {
+  task: number;
+  test: string;
+  name: string;
+  reason: string;
+}
+
 /**
  * An existing test the tests step changed: the verifier judges its diff since `base`.
  * `additive` = the test's own lines since `base` gained lines and lost none (null when
@@ -1571,6 +1579,7 @@ function writeAuditReport(
     landed: Landed[];
     unproven: Unproven[];
     updated: Updated[];
+    changed: Changed[];
     outputs: Array<{ test: string; tail: string }>;
   },
 ): void {
@@ -1631,6 +1640,11 @@ function writeAuditReport(
     out.push(
       `- Task ${u.task} \`${u.test}\` "${u.name}" — ${u.detail}; the owner answers it at the end of the build`,
     );
+  if (o.changed.length > 0) out.push("", "## Changed by a code step", "");
+  for (const c of o.changed)
+    out.push(
+      `- Task ${c.task} \`${c.test}\` "${c.name}" — a code step changed it under a BLOCKED line: ${c.reason}; the owner answers it at the end of the build`,
+    );
   for (const t of o.outputs) {
     const fence = fenceFor(t.tail);
     out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
@@ -2277,6 +2291,8 @@ export const testsCommand: CommandSpec = {
           "[{task, test, name, reason}]: tests the tests step accepted as passing before any task code (passed-accepted on the red row); no red is due for them",
         unproven:
           "[{task, test, name, detail}]: tests with no proven red (no build-tests-red row, or a state other than red, red-not-loaded, updated or passed-accepted) and no honoured TEST EXCEPTION; never a gap — the owner answers them once, at the end of the build",
+        changed:
+          "[{task, test, name, reason}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record); never a gap — the owner answers them once, at the end of the build",
         updated:
           "[{task, test, name, base, additive, diff}]: existing tests the tests step changed (updated on the red row); base is the group's start commit; additive = the test's own lines since base gained lines and lost none (null when a side cannot be read), diff = their unified line diff; the verifier judges each diff — it may add expectations, never remove or loosen one",
         log: "where the report was written (as given)",
@@ -2318,6 +2334,7 @@ export const testsCommand: CommandSpec = {
           landed: [],
           unproven: [],
           updated: [],
+          changed: [],
           outputs: [],
         };
         if (reason !== undefined) {
@@ -2331,6 +2348,7 @@ export const testsCommand: CommandSpec = {
             alreadyLanded: [],
             unproven: [],
             updated: [],
+            changed: [],
             log: logArg,
           });
           ctx.log(`test-first not enforced: ${reason}`);
@@ -2345,6 +2363,16 @@ export const testsCommand: CommandSpec = {
         const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
         const exceptions: ExceptionResult[] = [];
         const gaps: Gap[] = [];
+        const changed: Changed[] = [
+          ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
+        ]
+          .filter((b) => b.reasons.length > 0)
+          .map((b) => ({
+            task: b.task,
+            test: b.test,
+            name: b.testName,
+            reason: b.reasons.join("; "),
+          }));
         const rows: AuditRow[] = [];
         const outputs: Array<{ test: string; tail: string }> = [];
         const greens = new Map<string, { cases: JunitCase[] | null; tail: string }>();
@@ -2497,6 +2525,7 @@ export const testsCommand: CommandSpec = {
           landed,
           unproven,
           updated,
+          changed,
           outputs,
         });
         ctx.emit({
@@ -2507,6 +2536,7 @@ export const testsCommand: CommandSpec = {
           alreadyLanded: landed,
           unproven,
           updated,
+          changed,
           log: logArg,
         });
         ctx.log(
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 8724717bc..31769c438 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -124,6 +124,7 @@ _No tracker connected, skip step._
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -584,7 +585,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -757,7 +758,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -847,7 +848,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1076,13 +1077,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1116,6 +1118,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index c0a5240d8..2f09e9f0b 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -94,6 +94,7 @@ autoCompactWindow: 300000
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -135,7 +136,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index eed786ea3..f916a4c59 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -108,6 +108,7 @@ autoCompactWindow: 300000
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index fdd5fed08..d7445f6ae 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -93,6 +93,8 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 1c57db049..b57782729 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -151,6 +151,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -669,7 +670,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -842,7 +843,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -932,7 +933,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1161,13 +1162,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1201,6 +1203,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index d4e10c2d0..1c502d4b9 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1155,7 +1155,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:445`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:446`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1252,7 +1252,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:445`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:446`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1674,7 +1674,7 @@ Clause section lines:
   - verbatim: `bkit-build-plan-tasks`, `bkit-build-plan-verify`
   - applies: `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-reproduce`
 - drift:
-  - `bkit-build-plan-gaps-remediate:105`: "Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass." Runs only `pnpm bkit:gate:changed` on the changed files, or `pnpm bkit:gate:static-unit` when that is undeclared, not the integration tier the pre-push hook adds when `bkit:gate:static-unit-integration` is declared
+  - `bkit-build-plan-gaps-remediate:106`: "Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass." Runs only `pnpm bkit:gate:changed` on the changed files, or `pnpm bkit:gate:static-unit` when that is undeclared, not the integration tier the pre-push hook adds when `bkit:gate:static-unit-integration` is declared
     - kept: subagents never push; they run their own lighter gate (`local-pre-commit`: `/bkit-*` steps run their own gates) and the pre-push hook runs the push gate
 
 ```text
@@ -10209,7 +10209,7 @@ Record the reds, before any task code exists:
 **If** exit 3 → the repo declares no `bkit:test:file` script; test-first is not enforced → step 7.
 **If** exit 1 **and** `WRITE_RETRIED` is not held for `GROUP` → a planned test passes, is absent from its report, fails lint or is missing: `WRITE_RETRIED` = `GROUP`, `RED_REPORT` = `docs/plans/{YYYYMM}/logs/{FID}/build-tests-red-{GROUP}-{RED_ATTEMPT}.md` → step 3.
 **If** exit 1 → the gaps stand and the run goes on; `tests green` lists each as `unproven`, and the owner answers them once, at Step 15 → step 7.
-**If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+**If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
 Read the group's open tasks:
 **If** `TASKS_RESUMED` is not held for `GROUP` **and** either `TASKS_VERDICT` = HANDOVER **or** `TASKS_HANDOVER` = true → the agent stopped at its turn cap. This is a handover, not a failed attempt:
 `TASKS_RESUMED` = `GROUP`.
@@ -10249,7 +10249,7 @@ Read status.jsonl and derive the next `STRATEGY`:
 **If** `VERIFY_LOOSENED` != `none` → the tests step removed or loosened an expectation of an existing test (each `test-loosened` gap of the verify report, `Fixable: true`). The tests step restores it, because no code step may rewrite a planned test; no fixer runs this round:
 **If** exit 0, 1 or 3 → re-run Step 8: the next verify round judges the restored diff, and a test the restore left unproven waits for Step 15 like any other.
 Finish. The command records the header's `Strategy`:
-**If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+**If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
 Check that the attempt changed source files, not only logs and ledgers:
 Strategy computed before invocation
 Verify round read back on resume
@@ -10292,9 +10292,9 @@ Tests executed
 Exhausted test loop asked in a session, or sent to the Failure Path
 Finish, then re-run Step 12:
 Strategy read before invocation
-Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
-**If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
-**If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
+**If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
+**If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
 **Else** → sub-step 2.
 Write `build-summary.md` from this run's status rows and the plan's tasks:
 **If** `PUBLISH` = false → sub-step 5.
@@ -10332,6 +10332,9 @@ Re-read the issue's labels after the push, for the kill-switch check:
 Labels re-read before the close commit
 Lock released
 PR created
+**If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+**If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+Changed planned tests asked once, or none left
 ```
 
 #### bkit-debug
@@ -11046,6 +11049,7 @@ Honour the brief's `Reuse Inventory rows` and `Architecture entries`:
 `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
 `HANDOVER` = at least one pending task has neither a `DONE` nor a `BLOCKED` log entry, whether or not another task ended `BLOCKED`. When the turn cap is near, stop after the current task's log line and set this verdict. The caller re-runs with a fresh brief.
 `FAIL` = every pending task has a `DONE` or `BLOCKED` log entry, and at least one of these holds: a task ends `BLOCKED` with no later `DONE`, **or** local lint or typecheck fails.
+**If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
 ```
 
 #### bkit-build-plan-gaps-remediate
@@ -11074,6 +11078,7 @@ Fix those files in the same pass as the failure.
 **If** it cannot reach exit 0 → append `BLOCKED — Group gate: {reason}`.
 Never end on `PASS` from targeted test runs alone.
 `PASS` = every in-scope gap has a `DONE` line across the logs, the local tests pass, when Context names a group gate the log holds `DONE — Group gate: exit 0`, no test passed only on a rerun, and no warning needs a follow-up.
+**If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
 ```
 
 #### bkit-build-plan-tests
@@ -11175,6 +11180,7 @@ Set `Verdict` from the `Fixable` values you decided, never from the report's `nu
 Put `Tasks` and `Loosened` in `judgments`, because the engine never derives them and the workflow reads them from the header.
 Put the `## Identified Gaps Log` section, with one `TASK {N}` line per gap, in `body`, because the remediate step reads it from the report.
 The engine never overrides a `Verdict` that depends on evidence: `CONCERNS` and the `Loosened` decision stay yours.
+`Changed by a code step` section → list each test and its reason in `Notes`.
 ```
 
 #### bkit-debug-abort-handover
@@ -15245,7 +15251,7 @@ These are the unknowns and assumptions this plan relies on. An unresolved questi
 **Extensions landed:** every `EXTEND` landed in the artifact its row names.
 **No gate weakened:** no gate was weakened.
 **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
-**Tests unchanged:** every planned test case matches the lines its red row recorded.
+**Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
 **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
 [fit `audit-gate-2-verified` 0.81; keep: plan gates verify against the plan] **Gate 2 — Verified:** every box above is checked.
 **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index 7571cda4e..d154fd85d 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -333,9 +333,9 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Runs `bkit tasks currency --plan= --base={BASE_SHA} --against=origin/dev` — the engine records each task's in-scope paths and symbols in the plan block and prints only the tasks whose path or symbol moved in `{BASE_SHA}...origin/dev`, each with its matched paths, needles and diff hunks — and reads those hunks only, no whole-range diff, no path outside a matched set. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-tasks` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-tests` | Write one task group's planned tests — every `TEST FIRST` test of the task blocks in the brief `bkit context brief --group --tests-only --file` writes, which leaves out the tests the group's red rows already proved. Each test fails on the behaviour its `fails on` text names, is lint-clean, and never names a test the task's `TEST EXCEPTION` names; a stub only where a test cannot load without one; no source code (`steps finish --step=build-plan-tests --plan` refuses a diff touching any other file, exit 15). Flat log `build-plan-tests-{GROUP}-log.md`: ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists; `bkit tests red` records the test `passed-accepted`), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tests left; the workflow re-runs the tests half once with a fresh brief. Re-invoked with a red report → rewrites only the tests it lists as `vacuous`, `missing`, `no-report` or `lint`. Never runs `bkit tests red` itself; the orchestrator runs it once per group after the step. |
-| `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test file differs from its red blob, exit 11); a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
-| `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
+| `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test case differs from its baseline, exit 11), except that a correct code change forcing a planned-test edit is kept and logged ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` plus the task's `DONE` line, which the owner answers at the end of the build; a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests and `Changed by a code step` entries → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change, and a planned-test edit its code change forces is kept and logged ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` plus the gap's `DONE` line; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
 
diff --git a/.bkit/version b/.bkit/version
index 7a8fa8022..6b3be22b8 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "a82369810095a5fc09772a0a81477c1f1aee18bf317cd1d633499ee340d78952",
+    ".claude/commands/bkit-build.md": "ebd57125d9e7255150669b5e807b34fdd01d8e1cde402e57caed5aca4215249d",
     ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
@@ -23,8 +23,8 @@
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "62f9aa0a792e7adb01a83b29ea51e6ea4d2e1530923ddc2f0fa98ce4c8b1ca03",
-    ".claude/agents/bkit-build-plan-verify.md": "9f8d02adcc91bb409b4d8e6b7191dbdfd471b171a8e4a169337758029d478076",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "ac0fdf71f2234bf30b3059201f2c3bd69be508f6e30703ec69710ae1c9f3d206",
+    ".claude/agents/bkit-build-plan-verify.md": "55f0f91f32b53910bd01836aa63cd956487c768213615d76229ca20848acbadd",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
     ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "a783ca6fb45d59741cc3854279117be200ab410df1af21b7e4000aa6ac0fde7c",
+    ".cursor/commands/bkit-build.md": "951644daccc82ffd8af27cee3e0402d6bfb8f91715728284126800f92f35fd32",
     ".cursor/commands/bkit-debug.md": "c59d2b8a4f7577d5ac23d9454718097943831916340f87655b1cfdca6641305b",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
@@ -55,8 +55,8 @@
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "4067031d8aa4cc868b2401b95d4c2421ecf005ae0df29da400decc25c4254bae",
-    ".cursor/agents/bkit-build-plan-verify.md": "9a5eba082365aef297e40c69d925e23766d0b3a60640f62b9b8c3709ac6e08a4",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "e8424b2a1653bb0b45e1d9fc839188b80c98fc0a6ad396a9685ed3fc2e8361e2",
+    ".cursor/agents/bkit-build-plan-verify.md": "cf5291114dd422ea1beb210fdec165e34afa932dae68a72c6c27ddfbfcc13d4d",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
     ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
@@ -81,8 +81,8 @@
     ".opencode/agents/bkit-build-challenge-1.md": "f279a1470feb7e542494b9fcc69b7dff1ad8e1d7c19190472b76f0734e59f744",
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b348e0cb7ebf3e9457dca5e071127e34068a3fec67c8a4cae4bd6486a9f571b0",
-    ".opencode/agents/bkit-build-plan-verify.md": "d6e056fb5d4a86243234ae1ca27c7f9445aaebecefb835adf3543ee8ded16d03",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "58d97666cee4c05944b0e7a2014a5cec11c8aa9cbb9f9e0744da24beaaf63c4d",
+    ".opencode/agents/bkit-build-plan-verify.md": "3d98d057977f9ed4a2cb2e6b7a7bccd1c8ac66f06c3f605ce7e0f2bdcc22c246",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "2a848bc7222f0604ef6838809d25cc8ae0e5d3a0f6e31ff9eff3f627e936f10d",
+    ".opencode/commands/bkit-build.md": "516773cf530f39b0829fb3b4f75929e371f235ec372aef6b7e9f0784caf4032d",
     ".opencode/commands/bkit-debug.md": "6a54040b8fb2bb18f98eac785ef39463ef216726e9660890eb6aab9b99cb3ee6",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
@@ -121,8 +121,8 @@
     ".codex/agents/bkit-build-challenge-2.toml": "ccb61eb11b5a8b664e8c2c0135122300a2f867a490fca5b14a81e79c9ab4809f",
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "7559cc695ce2816a2a87402ad2e996f688004208642e1273a0ab63c394bbdb4e",
-    ".codex/agents/bkit-build-plan-verify.toml": "c921473bfeda36e6a169de8eb8c9b3c1b1a8015776fb15e0f1d8363916f4c91f",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "581b1bb6c1f976128d3df514cf205ab795c4c65228fe187dcb310e1e0a47cde8",
+    ".codex/agents/bkit-build-plan-verify.toml": "9e0c0c9a096c4e6d4d3426a85cbd53ed03d2c37c47e499d332f1acf6f2b22c8a",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
     ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
@@ -164,7 +164,7 @@
     ".cursor/agents/bkit-utility-update-knowledge.md": "670c1c48c23fb511611510d057fdaf32fc77f3744b2e33c58be1077d32d0223b",
     ".opencode/agents/bkit-audit-generate.md": "51abbcc3a4f1435886b8c2fe825e5a7cc6f0ad265dad6ccb07e2eb9c6b4b8f2b",
     ".codex/agents/bkit-audit-generate.toml": "93a7dfb7ce085fa4dce7f211193759068abd7ba294f5bbffe56194e1be337688",
-    "docs/templates/bkit-plan.md": "6742ee55eb1b65925b389ecd74454df631f6821b325829fe9d83b0549a96d406",
+    "docs/templates/bkit-plan.md": "187d02f8dc0ebb539fa9b316bbacc919ecbd68625a10ab23e7c5c75ce4c3da77",
     ".claude/agents/bkit-audit-generate.md": "a17c76ddcf5afd854bf39cc36f0800f847a61c55fe6efb17c9163e98597c8422",
     ".cursor/agents/bkit-audit-generate.md": "61a7dfae9dca9d0426adef302707a53066515e88a72dca9200336a14593f9e81",
     "docs/templates/bkit-audit-accessibility.md": "82cc441b99db2dfa22124a9f5defa6abfd7f85a19704c3cad3c9a50052587133",
@@ -212,9 +212,9 @@
     ".bkit/install.md": "42dc98ac1962ce9acd03d5c0777e88f3b7afe9b600a53398ee4b26673d7d1e86",
     ".bkit/jsonl.md": "1958043a14dcbf11b334e16e16cf36774e39f55e617645f2b919e582b93e981b",
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
-    ".bkit/prompts.md": "40c140b8c9d4e6d3ee91b8d106cbe78d1bff751343c4341668064decd0f4eb1e",
+    ".bkit/prompts.md": "914cc05f5df0cf70f6d82a9aaf5345c799b8fb20b63a78a3e86fd2852b9b1716",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "6f0c596eb9878a4cdb8ee0b47af44524aa24bb1ba614173011ed5bd5ececf8dc",
+    ".bkit/workflows.md": "b06fcb6b9f1156f8f767808e443d785098055292d5c7505a2b1a30b31499efa2",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "c49a6b4aa6289f9eacf5cda6fced12a9811a244bd50948c2ef5cdb2741ea848f",
@@ -259,10 +259,10 @@
     ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
     ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
     ".codex/agents/bkit-build-plan-tests.toml": "d97cd961547fd7bc48b24777626093fd8f7261310a1491c04a801116078641f1",
-    ".claude/agents/bkit-build-plan-tasks.md": "ed6413782c61bfe33b85b803dd70d4b19e43d64e93bfdd3aa2ad8d370565877a",
-    ".cursor/agents/bkit-build-plan-tasks.md": "96066ced550f3e0f8cc50e6b10a37b8a9200a47d07eaa4b8ea0026d8f9672cb3",
-    ".opencode/agents/bkit-build-plan-tasks.md": "3d4ba69ee06020783d2b7ce45c2747fe1e46baa9f959151eba2ccd75cfab044a",
-    ".codex/agents/bkit-build-plan-tasks.toml": "7b4f534ded4d7f4fdd5c3f8f3ac875c3ce1fd7a4fc05e027a9658b8ca28be74c"
+    ".claude/agents/bkit-build-plan-tasks.md": "ec2a0a404f14305bc5f7ae663dd374f0d470fa4601bf14b8b630cd2259f4f4d5",
+    ".cursor/agents/bkit-build-plan-tasks.md": "4126223305b54d608d2cd28f69ca4d2f2a52da0b98a98577c225fd73d7131d82",
+    ".opencode/agents/bkit-build-plan-tasks.md": "2bc369483a60ef3629c14f9f78f71c7257029c2fd0c3a864044deaf723715bcf",
+    ".codex/agents/bkit-build-plan-tasks.toml": "07f179fb97586fea075a266e8043adc9d96a1c81fd2097754794f8f14354f615"
   },
   "claudeAllowDerived": [
     "WebFetch(domain:12factor.net)",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 2aae23e0b..906c93852 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -968,7 +968,7 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 4 — Plan Convert | `@bkit-build-plan-convert`, run only when the plan is missing, has no task markers or is older than an issue comment | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes a no-agent skip row (`build-plan-convert`, `--attempt=1`, comment `Status=skipped (plan already in task-block form)`) and goes to Step 5. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 5 — Plan Current | `@bkit-build-plan-current` (skipped when the mechanical trigger clears) | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the plan against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-tasks`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 6 — Skills | `@bkit-build-install-skills` (skip if input contains `[skills=false]`) | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its red, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
+| 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its baseline and that no `BLOCKED — TASK {N}: test` line names, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
 | 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; attempt-numbered `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the holistic rounds since the last clean one (`counters route --of=build-plan-verify-holistic:current --since-clean --point=build.verify`; clean = PASS, or CONCERNS with 0 failures, so a fix group's re-check gets a fresh allowance) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
@@ -988,10 +988,11 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions compose --base-check=` words the loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL`, `openDecision` `status` = `OPEN` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other `Gate: FAIL` pause (a `DECIDED` / `ASSUMED` file, which keeps the owner's route, a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
 - **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `Fix task:` line names. An `Accept` or `Accept (assumed)` item that already carries a `Decision:` line writes nothing again: no second `docs/decisions.jsonl` row, no second title suffix, no second `TEST EXCEPTION`, and step 6 adds a `Decision:` line only under an item that has none. A decided file a `build-decision` row names is not reopened, and `decisions compose` is unchanged.
-- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|CHANGED_TESTS|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
+- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
@@ -1792,12 +1793,13 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | --- | --- | --- |
 | Write (Step 7, per group) | `@bkit-build-plan-tests` from `build-brief-tests-{GROUP}-{n}.md`, log `build-plan-tests-{GROUP}-log.md` | Writes every planned test of the group's open tasks that no red row has proved yet, each failing on the behaviour its `fails on` text names, lint-clean; stubs only where a test cannot load without one; no source code. Log lines ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). `steps finish --step=build-plan-tests --plan` reads the group's `TEST FIRST` files from the plan and refuses a diff touching any other tracked file, or adding a file a plan `CREATE` line names: exit 15, `source` names them, nothing committed; the orchestrator re-asks once (undo the edits), then Failure Path. |
 | Red (Step 7, per group) | orchestrator runs `bkit tests red --group`, log `build-tests-red-{GROUP}-{n}.md` | Per planned test file of the group's open tasks: `bkit:lint:file` (when declared) passes on it, then `bkit:test:file` runs it once and its JUnit report is read. Per planned test: `red` (ran and failed), `red-not-loaded` (no case carries the planned name, and the report holds no case or only non-passing cases whose name contains the file's stem — an import of unwritten code; counts as red), `passed-accepted` (passed, and the writer's log has a `PASSES` line for it; already landed), `updated` (passed, no `PASSES` line, and the test already existed at the group's start commit with different lines: an existing test the tests step changed; `base` = that commit; counts as proven, and verify judges its diff), `vacuous` (passed, no `PASSES` line, not an update), `missing` (absent from a loaded report, or the file does not exist), `no-report` (no report written), `lint` (the file failed lint; not run). Writes one `build-tests-red` row (`attempt`, `enforced`, `tests` = `{task, test, testName, state, blob, block, reason?, base?}`, `blob` the file's git blob written into the object store with `hash-object -w`, `block` the sha-1 of the test's own lines (null when no line names it), `--commit=none`). Exit 0 every test red; 1 a gap; 3 `bkit:test:file` undeclared (blobs recorded, nothing ran, not enforced); 4 a script could not run. A test an earlier row of the group proved (`red`, `red-not-loaded`, `passed-accepted`, `updated`) with its own lines unchanged is not run again (`skipped`), so a handover, a retry or a task added to the group runs only what is left; a row holds the tests it ran, and readers merge the group's rows per test, later rows winning, except that a proven entry stands against a later unproven result for the same lines. Ticked tasks are skipped. Exit 1 → the orchestrator re-invokes the tests agent once with the red report (rewrite only the `vacuous` / `missing` / `no-report` / `lint` tests), runs red again, and then moves on whatever the result: the gaps reach `tests green` as `unproven`. |
-| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated` and `unproven`. |
-| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated`, `changed` and `unproven`; `changed` lists each plan-named test (every group) a code step's `changedTests` record changed, with its reason, never a gap, and the report gets a `Changed by a code step` section when it is non-empty. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed`, `Changed by a code step` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Changed tests (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `changed` non-empty → one § Decision Pause (`CHANGED_TESTS`), one `Accept` / `Stop` item per test. Asked once per run, before the Unproven pause. |
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that when no case carries the planned name and the report holds no case, or every case is non-passing with a name containing the file's stem, the file is `red-not-loaded` (per-runner commands: `docs/testing.md` § Test first): the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead and recorded in the step row's `changedTests` (its reason, its new block), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index 5abfc8e22..ae06b4a7b 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -95,6 +95,7 @@ autoCompactWindow: 300000
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -136,7 +137,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.claude/agents/bkit-build-plan-tasks.md b/.claude/agents/bkit-build-plan-tasks.md
index 31c1ff4b3..3a71d7264 100644
--- a/.claude/agents/bkit-build-plan-tasks.md
+++ b/.claude/agents/bkit-build-plan-tasks.md
@@ -109,6 +109,7 @@ autoCompactWindow: 300000
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index 9eb886b41..bdc256bc1 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -94,6 +94,8 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 1758ff35f..c6faaeb5b 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -132,6 +132,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -627,7 +628,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -800,7 +801,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -890,7 +891,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1119,13 +1120,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1159,6 +1161,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index 5f10dfc62..97c66f68e 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -82,6 +82,7 @@ developer_instructions = """
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -123,7 +124,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.codex/agents/bkit-build-plan-tasks.toml b/.codex/agents/bkit-build-plan-tasks.toml
index fa4455708..9b8d2be2c 100644
--- a/.codex/agents/bkit-build-plan-tasks.toml
+++ b/.codex/agents/bkit-build-plan-tasks.toml
@@ -96,6 +96,7 @@ developer_instructions = """
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index 55581feae..db04c16c3 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -81,6 +81,8 @@ developer_instructions = """
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index 82cfdf8dd..295f12ba5 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -92,6 +92,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -133,7 +134,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.cursor/agents/bkit-build-plan-tasks.md b/.cursor/agents/bkit-build-plan-tasks.md
index f05152c0e..371d77761 100644
--- a/.cursor/agents/bkit-build-plan-tasks.md
+++ b/.cursor/agents/bkit-build-plan-tasks.md
@@ -106,6 +106,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 20f8f70da..50a10e9a0 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -91,6 +91,8 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 6099c80fa..61a8c08cc 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -131,6 +131,7 @@ Build Feature — Autonomous implementation
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -626,7 +627,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -799,7 +800,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -889,7 +890,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1118,13 +1119,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1158,6 +1160,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index 9beff8086..d53b195eb 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -93,6 +93,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
@@ -134,7 +135,7 @@ Fixed: <integer >= 0>
 
 ## Remediation Log
 
-[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
+[An append-only flat log with one line per entry, in the order the events happened, so `DONE` and `BLOCKED` lines mix. A gap's entry is `DONE — Gap {N}: {name / description} — {outcome} ({path or commit ref})` or `BLOCKED — Gap {N}: {name / description} — {reason}`. The group gate's entry is `DONE — Group gate: exit 0 ({log path})` or `BLOCKED — Group gate: {reason}`. A planned test your code change forced you to edit is ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``. A failed generate run is `BLOCKED — bkit:generate: {first error line}`. Empty in the stub, and filled by appending with Bash `echo >>` as the work goes.]
 ```
 
 > ⛔ **STOP** once every in-scope gap is logged `DONE` or `BLOCKED` and `Verdict` is set. NEVER push, and do not expand scope.
diff --git a/.opencode/agents/bkit-build-plan-tasks.md b/.opencode/agents/bkit-build-plan-tasks.md
index 34eb59590..4cd80428e 100644
--- a/.opencode/agents/bkit-build-plan-tasks.md
+++ b/.opencode/agents/bkit-build-plan-tasks.md
@@ -107,6 +107,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index 6cffb2bdd..d48c4aeb9 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -92,6 +92,8 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`.
+     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 9b9567e1c..45809024e 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -135,6 +135,7 @@ $ARGUMENTS
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
@@ -630,7 +631,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-tasks --file="{STATUS}" --attempt-of=build-plan-tasks:next --group={GROUP} --agent=bkit-build-plan-tasks --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md --number=7 --post --title="Plan Execute — code" --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or log its task BLOCKED in '<reask.artifact>'. Do not redo other tasks."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the code step edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-tasks` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — TASK {N}: test `{file}` `{name}` — {why} to '<reask.artifact>', then append DONE — TASK {N} again. Do not redo other tasks."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `verdict` as `TASKS_VERDICT`.
 9. Read the group's open tasks:
    ```bash
@@ -803,7 +804,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
@@ -893,7 +894,7 @@ This step checks the whole feature against the plan after the last group, and ag
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate-holistic --file="{STATUS}" --attempt-of=build-plan-verify-holistic:current --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-holistic-<attempt>-log.md" --number=10 --post --title="Holistic Gaps Remediate" --message="chore({FID}): plan-gaps-remediate holistic attempt <attempt>"
    ```
-   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
 10. Check that the attempt changed source files, not only logs and ledgers:
     ```bash
@@ -1122,13 +1123,14 @@ This step checks the whole feature against the plan after the last group, and ag
 
 **Run only if** all Step 12 tests PASS.
 
-1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2.
+1. Ask once about the planned tests a code step changed, then once about the planned tests that never failed before their code existed. **Skip if** `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` files hold both the line `Question: CHANGED_TESTS` and the line `Question: UNPROVEN`, because the owner already answered both this run → sub-step 2.
    ```bash
    "{BKIT}" tests green --file="{STATUS}" --workflow=build --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-final.md"
    ```
-   **If** exit >= 2 → **Failure Path**. Hold `unproven` as `UNPROVEN_TESTS`.
+   **If** exit >= 2 → **Failure Path**. Hold `changed` as `CHANGED_TESTS` and `unproven` as `UNPROVEN_TESTS`.
    Route:
-   - **If** `UNPROVEN_TESTS` is not empty → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
+   - **If** `UNPROVEN_TESTS` is not empty **and** no decision file holds the line `Question: UNPROVEN` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `UNPROVEN` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
    - **Else** → sub-step 2.
 2. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
@@ -1162,6 +1164,7 @@ This step checks the whole feature against the plan after the last group, and ag
 
 ### 🔒 Gate 15 — Summary
 
+- [ ] Changed planned tests asked once, or none left
 - [ ] Unproven planned tests asked once, or none left
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
diff --git a/DETAILS.md b/DETAILS.md
index c92263423..4152f5de4 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
+    n_bkit_core_engine_commands["commands<br/>1865 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -355,7 +355,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|467| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 99e6e1b4d..b2e33c876 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -1207,6 +1207,10 @@ function writeAuditReport(log, o) {
         out.push("", "## Unproven", "");
     for (const u of o.unproven)
         out.push(`- Task ${u.task} \`${u.test}\` "${u.name}" — ${u.detail}; the owner answers it at the end of the build`);
+    if (o.changed.length > 0)
+        out.push("", "## Changed by a code step", "");
+    for (const c of o.changed)
+        out.push(`- Task ${c.task} \`${c.test}\` "${c.name}" — a code step changed it under a BLOCKED line: ${c.reason}; the owner answers it at the end of the build`);
     for (const t of o.outputs) {
         const fence = fenceFor(t.tail);
         out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
@@ -1813,6 +1817,7 @@ export const testsCommand = {
                 gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
                 alreadyLanded: "[{task, test, name, reason}]: tests the tests step accepted as passing before any task code (passed-accepted on the red row); no red is due for them",
                 unproven: "[{task, test, name, detail}]: tests with no proven red (no build-tests-red row, or a state other than red, red-not-loaded, updated or passed-accepted) and no honoured TEST EXCEPTION; never a gap — the owner answers them once, at the end of the build",
+                changed: "[{task, test, name, reason}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record); never a gap — the owner answers them once, at the end of the build",
                 updated: "[{task, test, name, base, additive, diff}]: existing tests the tests step changed (updated on the red row); base is the group's start commit; additive = the test's own lines since base gained lines and lost none (null when a side cannot be read), diff = their unified line diff; the verifier judges each diff — it may add expectations, never remove or loosen one",
                 log: "where the report was written (as given)",
             },
@@ -1854,6 +1859,7 @@ export const testsCommand = {
                     landed: [],
                     unproven: [],
                     updated: [],
+                    changed: [],
                     outputs: [],
                 };
                 if (reason !== undefined) {
@@ -1867,6 +1873,7 @@ export const testsCommand = {
                         alreadyLanded: [],
                         unproven: [],
                         updated: [],
+                        changed: [],
                         log: logArg,
                     });
                     ctx.log(`test-first not enforced: ${reason}`);
@@ -1880,6 +1887,16 @@ export const testsCommand = {
                 const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
                 const exceptions = [];
                 const gaps = [];
+                const changed = [
+                    ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
+                ]
+                    .filter((b) => b.reasons.length > 0)
+                    .map((b) => ({
+                    task: b.task,
+                    test: b.test,
+                    name: b.testName,
+                    reason: b.reasons.join("; "),
+                }));
                 const rows = [];
                 const outputs = [];
                 const greens = new Map();
@@ -1998,6 +2015,7 @@ export const testsCommand = {
                     landed,
                     unproven,
                     updated,
+                    changed,
                     outputs,
                 });
                 ctx.emit({
@@ -2008,6 +2026,7 @@ export const testsCommand = {
                     alreadyLanded: landed,
                     unproven,
                     updated,
+                    changed,
                     log: logArg,
                 });
                 ctx.log(`test-first audit: ${gaps.length} gap(s), ${unproven.length} unproven — report in ${logArg}`);
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8e082c7a0..10167d6b0 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
+    n_bkit_core_engine_commands["commands<br/>1865 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -172,7 +172,7 @@ flowchart LR
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|467| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
@@ -333,7 +333,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_summary["summary<br/>31 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>97 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>105 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_base["tests-base<br/>14 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>94 symbols · 1 files"]
@@ -443,13 +443,13 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_summary_findings -->|14| n_bkit_core_engine_commands_workflow_challenge
+  n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_install_modules_core -->|14| n_bkit_core_engine_install_version_file
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_ci_ci -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
-  n_bkit_core_engine_commands_workflow_tests -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_tracker -->|13| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_render_hosts -->|13| n_bkit_core_engine_render_models
@@ -481,6 +481,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_runtime -->|10| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|10| n_bkit_core_engine_commands_workflow_challenge
+  n_bkit_core_engine_commands_workflow_steps -->|10| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
@@ -521,7 +522,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|8| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|8| n_bkit_core_engine_commands_workflow_tests
-  n_bkit_core_engine_commands_workflow_steps -->|8| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_tests -->|8| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
@@ -552,6 +552,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_disk -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_plans -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_status -->|7| n_bkit_core_engine_ledgers_journal
+  n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
@@ -582,7 +583,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_ledgers -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_step_table
   n_bkit_core_engine_commands_workflow_summary -->|6| n_bkit_core_engine_commands_workflow_summary_findings
   n_bkit_core_engine_commands_workflow_tracker -->|6| n_bkit_core_engine_shared_settings
diff --git a/docs/templates/bkit-plan.md b/docs/templates/bkit-plan.md
index 846dc0ccd..e607be493 100644
--- a/docs/templates/bkit-plan.md
+++ b/docs/templates/bkit-plan.md
@@ -331,7 +331,7 @@ Carry each required read and each doc update into the runbook task that needs it
 - [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
 - [ ] **No gate weakened:** no gate was weakened.
 - [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
-- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
+- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
 - [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
 - [ ] **Gate 2 — Verified:** every box above is checked.
 
diff --git a/docs/testing.md b/docs/testing.md
index f1fed6ca0..4e16478d6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -311,7 +311,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 - **Call the runner directly:** a task runner that caches results, or runs dependent packages' suites first, breaks the one-file contract. A monorepo routes the path to the package and config that own it. An integration file gets the same environment setup that the integration suite gets.
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts when the named test ran and failed, or when its file failed to load: no case carries the planned name, and the report holds no case, or only non-passing cases whose name contains the file's stem (the tests step writes no source, so an import of unwritten code is the expected shape of a red); a green only when it ran and passed.
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
-- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify.
+- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through, and the owner answers the change at the end of the build.
 
 ## Tests lock
 
@@ -737,6 +737,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | Integration | Fresh plan reads, saved-run isolation and frozen allowances, cross-run soak attempts/grants, specialized completion producers, numeric gates preserving validation and command journaling, invalid inputs and refused commits without false completion. |
 | `.bkit/core/engine/render/hosts.test.ts` | Unit | Progress narration and explicit gate numbers survive Claude, Codex, Antigravity, Cursor and OpenCode rendering; sole completion output remains observable. |
 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | Integration | Real consumer gate wrapping, wait budgets and exit mapping, lock lifetime, CI and light-run bypass, inherited workers and nested wrappers; a file blocking the queue folder (exit 4 naming it); `bkit tests jump` moving a real waiting run to the front, and refusing a name no waiting run carries or two waiting runs share. |
+| `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | Integration | The planned-test lock through the real `bkit` CLI in a temp git repo: a cross-group change logged `BLOCKED` passes its own step and every later one, and `tests green` lists it as `changed`. |
 | `.bkit/core/engine/commands/workflow/tests-jump.test.ts` | Unit | `bkit tests jump`: no queue folder refuses and creates none; one marker holding the run's line, from a ticket or a held place; two checkouts sharing the name ask for `--checkout`, which then picks one. |
 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | Unit | Remaining-time `timeout` given to `spawnSync`, `execSync` and `execFileSync` when the caller passes none; an explicit `timeout` is kept. |
 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | Integration | A test that waits on a never-exiting child fails inside its Vitest limit in a real worker. |
