diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index fe49d4b5d..2140adce5 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -49,7 +49,7 @@ description: "Build Feature — Autonomous implementation"
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -187,8 +187,8 @@ description: "Build Feature — Autonomous implementation"
    - Route — first match wins:
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-     - **If** any asked item still lacks a decision:
-       - Discuss the follow-ups with the owner.
+     - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -205,7 +205,12 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item is a challenge task → keep that task open. It runs as it is.
+     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
+       - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+       - Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+       - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -222,6 +227,7 @@ description: "Build Feature — Autonomous implementation"
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -303,6 +309,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index d9a4416ce..a451271fa 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -49,7 +49,7 @@ description: "Build Feature — Autonomous implementation"
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -187,8 +187,8 @@ description: "Build Feature — Autonomous implementation"
    - Route — first match wins:
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-     - **If** any asked item still lacks a decision:
-       - Discuss the follow-ups with the owner.
+     - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -205,7 +205,12 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item is a challenge task → keep that task open. It runs as it is.
+     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
+       - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+       - Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+       - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -222,6 +227,7 @@ description: "Build Feature — Autonomous implementation"
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -303,6 +309,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 09f7346a1..f460f3772 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -517,7 +517,10 @@ Each step posts its own fenced section as a fresh comment.
 | --- | --- |
 | Design or plan review | The corresponding update in the same review round. PASS resolves its findings; CONCERNS replaces the review's findings with the update's remaining optional findings. |
 | Disproven design spike claim | A passing design update addresses its design impact. Claims recorded under `Unsettled` remain concerns. |
-| Failed group execution or gap remediation | The latest passing verification of the same group, after the failure. Separate remediation warnings and flakes remain concerns. |
+| Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
+| Failed group verification or group gate | A later passing holistic verification (verify) or a later passing Step 12 run (gate), with 0 failures. |
+| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
+| Failed test-fix step (build Step 14, debug Step 7) | A later passing test run in the same run with 0 failures on the same scope as the run the fix followed. A scope that differs or is missing keeps the FAIL. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
 | Deferral | The latest ledger row for that key determines whether it remains open, including a closure written by another workflow. |
@@ -983,19 +986,19 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions compose --base-check=` words the loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other open `Gate: FAIL` pause (a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
-- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points). Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
-- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
+- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
 - **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic with `--since-clean`, so it counts only grants since the last clean holistic round); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
-- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Every subagent learns an owner's answer only from the decision file in its `Read`, never from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
diff --git a/.bkit/version b/.bkit/version
index 6c9fbcb6c..981b0c825 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     ".claude/commands/bkit-auto.md": "d92e196cb450c7f50b8a21e8281014627e9ed131c8154b3685f88b2c5aa4d025",
-    ".claude/commands/bkit-build.md": "c1ce924c8fb7a9dd0a846a4da0e93ed29367ee031fff9688c44e75a8b9ee3fbf",
+    ".claude/commands/bkit-build.md": "b934844dffd18434e7dea17b2eedbb80980a83ca45faff5dac5bf3b5490b5af6",
     ".claude/commands/bkit-debug.md": "de832653702912caa21f6cd134ea19922b3c358d489c7df40a6709c31a4d0ccb",
     ".claude/commands/bkit-design.md": "8e489c8698fda8675b6d916de2841fd79aed180dc9529dda0734d3a4d9d76352",
     ".claude/commands/bkit-plan.md": "4a611c8acb1773a83fbf0ca01411fbc288bb6af9e00f7dbaabd5e1585e191e8a",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f5b3b8b6a8981d850815f5fe45274fc5ad42d075660e21447f52a364d79f8db4",
-    ".cursor/commands/bkit-build.md": "ad06d7ed575706cd210966b9fe093584c877074d4de7c56b3ce6d526801246e4",
+    ".cursor/commands/bkit-build.md": "8f27af04f576c0528e29a3b869b7df24163cd6d5d5931bac542d447dbfc3f0d1",
     ".cursor/commands/bkit-debug.md": "ed534e4baed06aa8b60b7e54bd1d0c45252f855a3d9b4049ffb146deaec3eda1",
     ".cursor/commands/bkit-design.md": "f0c539059e6774644496305a4fd9bd3d05be9254189817f587badffad18d6e3f",
     ".cursor/commands/bkit-plan.md": "a13dbd7259b03f28f6aa4fe8ae61e481f65d0269384ac7d348a5afd47d363145",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "a5c7315daebe976cec446714d5d508a3216c104d123218a80da1a0ddedc5241a",
-    ".opencode/commands/bkit-build.md": "8a6af27e460522c39ac2b4877fc6fa8264b6d97fe0163a62f7faa274f73c47fa",
+    ".opencode/commands/bkit-build.md": "0f81e49df881fd4d49e9d3582d7e3602971813fff12484a5cf1a1c52cf6170b8",
     ".opencode/commands/bkit-debug.md": "ca81e96386ad85fd9229b9634b0ce447306886fa986409228069f940aa1e34f1",
     ".opencode/commands/bkit-design.md": "219d4b5ef39a406fdb816cfa0de257d661a38f8e1d30daa237781330aaf94953",
     ".opencode/commands/bkit-plan.md": "3b36239f43ca5c92b7608b45910e2d3f79c82f93a499990f1e93fb7e005a1028",
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "1042b43fc528b1720e8a3a96b319b65a9bf7585735d6a333926dc9556847fac1",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "9ab7ba418c4da56e6e62bfbee76ce4535c9e1b9d62652f08cc8df82ee4d77bfe",
+    ".bkit/workflows.md": "cf39033162f56a17ad37ef5239a2c10048097a140f104e27fbc30e79c5248769",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "0b805d03e1361054c12dd91f8a7641484ce45c914d9dec06d1f7866c6cb4c3ce",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 4fcc90cd8..b392cb6e6 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -517,7 +517,10 @@ Each step posts its own fenced section as a fresh comment.
 | --- | --- |
 | Design or plan review | The corresponding update in the same review round. PASS resolves its findings; CONCERNS replaces the review's findings with the update's remaining optional findings. |
 | Disproven design spike claim | A passing design update addresses its design impact. Claims recorded under `Unsettled` remain concerns. |
-| Failed group execution or gap remediation | The latest passing verification of the same group, after the failure. Separate remediation warnings and flakes remain concerns. |
+| Failed group execution or gap remediation | The latest passing verification of the same group, after the failure; a later passing holistic verification with 0 failures also covers it, because a `Fix now` can move the fix into a new group. A group that paused for the owner can also be covered by the verify-pause row below. Separate remediation warnings and flakes remain concerns. |
+| Failed group verification or group gate | A later passing holistic verification (verify) or a later passing Step 12 run (gate), with 0 failures. |
+| Failed group execution, verification or gap remediation before a verify pause | The pause's decision file answers every item, and each `Fix now` item's `Fix task:` line names a task that is ticked and covered by a passing verification in its own group after the pause. A pause whose items are all `Accept` needs no fix task. FAIL rows only: remediation warnings and the accepted items stay concerns. An unanswered item, a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the FAIL. |
+| Failed test-fix step (build Step 14, debug Step 7) | A later passing test run in the same run with 0 failures on the same scope as the run the fix followed. A scope that differs or is missing keeps the FAIL. The failed run stays listed under `## Tests` and `Assessment History`, and the flake behind it is not a concern. |
 | Build challenge finding | A completed plan task with matching location, severity and challenge round, covered by a later passing verification's `Tasks` list for that group. An accepted finding remains a concern; a LOW finding's closed deferral resolves it. |
 | Plan currency | Later passing verification covers every task in the plan. A passing unrelated group does not resolve it. |
 | Deferral | The latest ledger row for that key determines whether it remains open, including a closure written by another workflow. |
@@ -983,19 +986,19 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions compose --base-check=` words the loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other open `Gate: FAIL` pause (a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
-- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points). Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
+- **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
-- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
+- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
 - **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic with `--since-clean`, so it counts only grants since the last clean holistic round); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
-- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Every subagent learns an owner's answer only from the decision file in its `Read`, never from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
+- **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
 
 #### Ask points
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 0cd2ca173..42f3c218f 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -48,7 +48,7 @@ description: "Build Feature — Autonomous implementation"
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -186,8 +186,8 @@ description: "Build Feature — Autonomous implementation"
    - Route — first match wins:
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-     - **If** any asked item still lacks a decision:
-       - Discuss the follow-ups with the owner.
+     - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -204,7 +204,12 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item is a challenge task → keep that task open. It runs as it is.
+     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
+       - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+       - Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+       - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -221,6 +226,7 @@ description: "Build Feature — Autonomous implementation"
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -302,6 +308,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 46590d94f..973f0070f 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -47,7 +47,7 @@ Build Feature — Autonomous implementation
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -185,8 +185,8 @@ Build Feature — Autonomous implementation
    - Route — first match wins:
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-     - **If** any asked item still lacks a decision:
-       - Discuss the follow-ups with the owner.
+     - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -203,7 +203,12 @@ Build Feature — Autonomous implementation
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item is a challenge task → keep that task open. It runs as it is.
+     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
+       - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+       - Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+       - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -220,6 +225,7 @@ Build Feature — Autonomous implementation
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -301,6 +307,7 @@ Build Feature — Autonomous implementation
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 8117fa3f3..03b5abcb4 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -51,7 +51,7 @@ $ARGUMENTS
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -189,8 +189,8 @@ $ARGUMENTS
    - Route — first match wins:
      - **If** the owner says stop, **or** answers `Stop` → step 8.
      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-     - **If** any asked item still lacks a decision:
-       - Discuss the follow-ups with the owner.
+     - **If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+       - Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
        - Record the wait with the `owner-pause` block above.
        - End the turn and wait for the answers.
      - **Else** → step 5.
@@ -207,7 +207,12 @@ $ARGUMENTS
      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-     - **If** the item is a challenge task → keep that task open. It runs as it is.
+     - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
+       - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+       - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+       - Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+       - Keep the task open. Step 7 builds the rewritten block.
      - **Else** → write a new task block:
        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -224,6 +229,7 @@ $ARGUMENTS
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -305,6 +311,7 @@ $ARGUMENTS
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/docs/testing.md b/docs/testing.md
index 5e00ee478..072d411eb 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -636,7 +636,7 @@ When adding bkit-managed file types or scope keys, extend fixture — single sou
 | --- | --- | --- |
 | `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
 | `commands/workflow/status.test.ts` | Unit | `debugMode`/`pushMode` meta (run-level over step); last verdict / failures; all-runs strategy + next rung; `--require` failures |
-| `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish` |
+| `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; a verify pause's `Fix now` group resolved by its verified fix tasks, an `Accept`-only pause's group resolved by the pause, and a test-fix FAIL resolved by a later same-scope passing run; next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish` |
 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | Unit (markdown-invariant) | No prose `Init` / `Increment`, no bare `*_ATTEMPT` comparison outside fenced blocks; counters derived in the block that routes on them, or by the routing / writing command itself (`steps finish --attempt=next` / `--attempt-of`, `counters route --of`); each derived counter maps to the right step; counted steps commit in-block or are exempted |
 
 ## Deterministic bookkeeping test coverage
