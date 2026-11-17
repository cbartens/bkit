diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 0aa72fa95..aa6997720 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -908,6 +908,61 @@ describe("build", () => {
     expect(pause).toContain("**TEST EXCEPTION:**");
   });
 
+  it("a Fix now challenge task is rewritten to the owner's direction in place", () => {
+    const pause = section(build, /Decision Pause/);
+    const fixNow = pause.slice(pause.indexOf("- **Fix now**:"));
+    const start = fixNow.indexOf("**If** the item is a challenge task");
+    expect(start).toBeGreaterThanOrEqual(0);
+    const branch = fixNow.slice(start, fixNow.indexOf("**Else** → write a new task block"));
+    expect(branch).toContain("**DONE WHEN:**");
+    expect(branch).toContain("**TEST FIRST:**");
+    expect(branch).toContain("`Derived Test Matrix`");
+    expect(branch).toContain("meta line");
+    expect(branch).toContain("**Fixable:** false");
+    expect(branch).not.toContain("runs as it is");
+  });
+
+  it("a hard blocker answered Fix now with no direction is asked again", () => {
+    const pause = section(build, /Decision Pause/);
+    const from = pause.indexOf("Route — first match wins");
+    const route = pause.slice(from, pause.indexOf("5. Apply each decision"));
+    const missing = route.slice(route.indexOf("still lacks a decision"));
+    expect(missing).toMatch(/hard blocker/);
+    expect(missing).toContain("`Fix now`");
+    expect(missing).toMatch(/no direction/);
+    expect(missing).toContain("End the turn and wait");
+  });
+
+  it("each Fix now item records its Fix task line before the decision row is finished", () => {
+    const pause = section(build, /Decision Pause/);
+    const step5 = pause.slice(
+      pause.indexOf("5. Apply each decision"),
+      pause.indexOf("6. Write the decisions"),
+    );
+    expect(step5).toContain("`Fix task:`");
+    expect(step5).toMatch(/already has a `Fix task:` line/);
+    expect(step5).toMatch(/reuse/i);
+    const step6 = pause.slice(
+      pause.indexOf("6. Write the decisions"),
+      pause.indexOf("Set the route"),
+    );
+    expect(step6).toContain("Fix task: {N}");
+    expect(pause.indexOf("Fix task: {N}", pause.indexOf("6. Write the decisions"))).toBeLessThan(
+      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
+    );
+  });
+
+  it("the owner decisions contract names the task block as the Fix now carrier", () => {
+    const bullet = build.split("\n").find((l) => l.startsWith("- **Owner decisions:**"));
+    expect(bullet).toBeDefined();
+    expect(bullet).toContain("task block");
+    expect(bullet).toContain("`Fix now`");
+    expect(bullet).not.toContain("only by reading the decision file");
+    expect(bullet).toContain("NEVER restate, summarise or paraphrase an owner's answer");
+    const gate = build.slice(build.indexOf("### 🔒 Gate — Decision Pause"));
+    expect(gate.slice(0, gate.indexOf("---"))).toContain("Fix task");
+  });
+
   it("an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date", () => {
     const pause = section(build, /Decision Pause/);
     const accept = pause.slice(pause.indexOf("**Accept**"), pause.indexOf("**Fix now**"));
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index edf8cd499..6bcb20c6d 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -47,7 +47,7 @@ description: "Build Feature — Autonomous implementation"
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -178,8 +178,8 @@ _No tracker connected, skip step._
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
@@ -196,7 +196,12 @@ _No tracker connected, skip step._
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
@@ -213,6 +218,7 @@ _No tracker connected, skip step._
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -294,6 +300,7 @@ _No tracker connected, skip step._
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 70c3faf3a..a4f02790f 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -47,7 +47,7 @@ description: "Build Feature — Autonomous implementation"
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
 - **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
-- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+- **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
@@ -205,8 +205,8 @@ description: "Build Feature — Autonomous implementation"
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
@@ -223,7 +223,12 @@ description: "Build Feature — Autonomous implementation"
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
@@ -240,6 +245,7 @@ description: "Build Feature — Autonomous implementation"
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
@@ -321,6 +327,7 @@ description: "Build Feature — Autonomous implementation"
 - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
 - [ ] Acceptances written only on the owner's approval
 - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+- [ ] Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 - [ ] Fix now tasks checked (`tests plan-check`)
 - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
 - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 163dc201b..d16235eb9 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1140,7 +1140,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:436`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:443`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1237,7 +1237,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:436`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:443`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -9978,7 +9978,7 @@ Orchestrator exits and the dispatched skill owns the session
 
 ```text
 **Scope:** Build the feature and open a PR to the default integration branch.
-**Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
+**Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 [secrets; workflow-pushes] List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout).
 **If** `PUBLISH` = false **or** `PUBLISH` is not held yet → keep the record in the worktree, linked by branch, and NEVER pass `--push`, because a held run pushes nothing and neither does a failure before `status route` resolves `publish`:
@@ -10025,8 +10025,8 @@ Clear `PAUSE_LOOP`. **If** `From: verify`, `From: holistic` **or** `From: tests`
 Route — first match wins:
 **If** the owner says stop, **or** answers `Stop` → step 8.
 **If** the loop question is answered `Try again` → step 6. The items then need no decision.
-**If** any asked item still lacks a decision:
-Discuss the follow-ups with the owner.
+**If** any asked item still lacks a decision, which includes a hard blocker answered `Fix now` with no direction:
+Discuss the follow-ups with the owner. For a hard blocker answered `Fix now` with no direction, ask what the fix should do.
 Record the wait with the `owner-pause` block above.
 End the turn and wait for the answers.
 Apply each decision:
@@ -10042,7 +10042,12 @@ Append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.m
 **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
 **Fix now**:
 Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
-**If** the item is a challenge task → keep that task open. It runs as it is.
+**If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+**If** the item is a challenge task → rewrite that task in place to the owner's direction:
+Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
+Keep the task's number, title, group and meta line, `**Fixable:** false` included.
+Keep the task open. Step 7 builds the rewritten block.
 **Else** → write a new task block:
 Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
 Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
@@ -10055,6 +10060,7 @@ Then check the plan:
 **If** exit non-zero → **Failure Path** naming each problem in the report.
 Write the decisions into the decision file:
 Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
 Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
 Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 [commits] **If** a `TEST EXCEPTION` was written → commit the plan alone first:
@@ -10100,6 +10106,7 @@ Questions asked in the session, or recommendations taken (`decisions apply --by=
 Hard blockers asked in a session, or sent to the Failure Path when headless
 Acceptances written only on the owner's approval
 Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+Fix now tasks shaped to the owner's direction, each named on a `Fix task` line in the decision file
 Fix now tasks checked (`tests plan-check`)
 Resolve the repo, the branch and how far the branch is behind `dev`:
 **If** `open` > 0 → **Failure Path** naming the open `blockers`.
