
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 10.7 on 10 cores: unit limits 5342ms per test, 10684ms per hook (x1.07)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (249 tests | 8 failed) 109ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 1ms
     ✓ design calls only verbs and flags the CLI has 1ms
     ✓ plan calls only verbs and flags the CLI has 0ms
     ✓ build calls only verbs and flags the CLI has 1ms
     ✓ debug calls only verbs and flags the CLI has 1ms
     ✓ ship calls only verbs and flags the CLI has 1ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 1ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
     ✓ plan resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
     ✓ build resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
     ✓ debug resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
     ✓ ship resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 0ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 1ms
     ✓ reconstructs nothing in shell or prose 0ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 0ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 0ms
   ✓ resume facts (1)
     ✓ build resumes an open decision from `openDecision`, not a file scan 0ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 0ms
   ✓ Failure Path (15)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 0ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 0ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 0ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ✓ build (31)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 0ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 0ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 0ms
     ✓ build challenge runs the size gate first 0ms
     ✓ names no removed challenge agent, step or limit 0ms
     ✓ Branch Sync merges docs and finishes as its own step 0ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 7ms
     ✓ the convert step posts under Plan Convert's number and title 0ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 0ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 2ms
     ✓ Step 7 takes the next group's brief and hands execute its path 0ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 0ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 1ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 0ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 0ms
     ✓ build: the step table matches the step headings and their --step= calls 1ms
     ✓ debug: the step table matches the step headings and their --step= calls 0ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ design never reads a verdict outside `steps finish` 0ms
     ✓ plan never reads a verdict outside `steps finish` 0ms
     ✓ build never reads a verdict outside `steps finish` 0ms
     ✓ debug never reads a verdict outside `steps finish` 0ms
     ✓ ship never reads a verdict outside `steps finish` 0ms
   ✓ status route --require=strategy (1)
     ✓ is used at exactly the four strategy-routing sites 1ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ Timeouts header line says 3600 seconds, like the phase workflows 1ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 0ms
     ✓ build /Step 10 — / writes the diff right before its agents 0ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 0ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 0ms
     ✓ build hands no agent a raw `git diff` 0ms
     ✓ debug hands no agent a raw `git diff` 0ms
     ✓ ship hands no agent a raw `git diff` 0ms
   ✓ ship (6)
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 5ms
     ✓ plan and build hold the caps `repo info` prints 1ms
   ✓ plan (2)
     ✓ plan runs one review round 1ms
     ✓ bkit-plan runs plan-check after every plan-writing step 0ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 0ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 3ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 0ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 1ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 0ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 0ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ design: no wired-tracker block STOPs on a missing issue 0ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 0ms
     ✓ build: no wired-tracker block STOPs on a missing issue 0ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 0ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 0ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 0ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ design: the No issue bullet sits in a tracker true block 0ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 0ms
     ✓ debug: the No issue bullet sits in a tracker true block 0ms
     ✓ ship: the No issue bullet sits in a tracker true block 0ms
     ✓ design: final messages start with the no-issue warning clause 0ms
     ✓ plan: final messages start with the no-issue warning clause 0ms
     ✓ build: final messages start with the no-issue warning clause 0ms
     ✓ debug: final messages start with the no-issue warning clause 0ms
     ✓ ship: final messages start with the no-issue warning clause 0ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 2ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 1ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ design: tracker gate items name the attempt, never its skip rule 0ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 0ms
     ✓ build: tracker gate items name the attempt, never its skip rule 1ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 0ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 0ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 1ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 0ms
     ✓ design Step 11 requires an issue 0ms
     ✓ design Step 11 posts plans 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 0ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 0ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 1ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 0ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 2ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ❯ build publish ending (8)
     × resolves publish through status route 6ms
     × re-derives publish on resume 0ms
     × warns when a non-LOCAL run resolves publish false 3ms
     × skips push, PR and CI on a held close 0ms
     × keeps the publish=true close path 0ms
     × appends the held roadmap row without roadmap mirror 0ms
     × makes Gate 15 conditional on the held path 1ms
     × runs only the close gate on the held path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > resolves publish through status route
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1800:19
    1798|     const text = step2();
    1799|     const route = commandLines(text, "status route");
    1800|     expect(route).toHaveLength(1);
       |                   ^
    1801|     expect(route[0]).toContain("--workflow=build");
    1802|     expect(route[0]).toContain('--file="{STATUS}"');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > re-derives publish on resume
AssertionError: expected -1 to be greater than 36725
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1815:19
    1813|     // after `runtime row`, and nothing reads it before.
    1814|     const first = build.indexOf("{PUBLISH}");
    1815|     expect(first).toBeGreaterThan(build.indexOf("## 🤖 Step 2 — Worktr…
       |                   ^
    1816|     const text = step2();
    1817|     expect(text.indexOf("status route --workflow=build")).toBeGreaterT…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > warns when a non-LOCAL run resolves publish false
AssertionError: expected '## 🤖 Step 2 — Worktree Setup\n\n1. C…' to contain '`{PUBLISH_SOURCE}` = `coerced`'

- Expected
+ Received

- `{PUBLISH_SOURCE}` = `coerced`
+ ## 🤖 Step 2 — Worktree Setup
+
+ 1. Commit any uncommitted changes before new worktree branch — NEVER push:
+    ```bash
+    "{BKIT}" ledgers commit --root="{REPO_ROOT}" --only-if-dirty-tracked --scope=core --mode=commit --month={YYYYMM} --fid={FID} --message="chore({FID}): pre-worktree uncommitted changes bkit [skip ci]"
+    ```
+    **If** primary checkout dirty / unpushed → not blocker; do not stash, clean, or route to **Failure Path** → create `feat/{FID}` branch off `origin/dev` instead (never `main` / current branch).
+ 2. Create / resume worktree, or adopt current branch in place:
+    ```bash
+    "{BKIT}" worktrees setup --workflow=build --fid={FID} --month={YYYYMM} --detect
+    ```
+    Hold `worktreePath` as `{WORKTREE_PATH}`, `{OUTBOX_ROOT}/{FID}` as `{OUTBOX}`, `branch` as `{BRANCH}`, `logDir` as `{LOG_DIR}`, `sentinel` as `{SENTINEL}`.
+    Route:
+    - **If** exit 0 → sub-step 3.
+    - **If** exit 3 → run the rebase block below; **If** it exits 0 → re-run sub-step 2, **Else** → **Failure Path**.
+    - **Else** → **Failure Path**.
+    ```bash
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches rebase --sentinel="{SENTINEL}" --log-file="{LOG_DIR}/rebase-resolve-log.md"
+    ```
+ 3. Enter worktree, open run, record runtime:
+    ```bash
+    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
+    "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
+    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
+    "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null
+    ```
+    Hold `file` as `{STATUS}`, `run` as `{RUN}`.
+ 4. Write the input file — session prompt, issue text, plan (when present):
+    <!-- bkit:tracker true start -->
+    **If** `ISSUE_ID` empty → drop `--description-file` and `--comments-file`.
+    <!-- bkit:tracker true end -->
+    ```bash
+    "{BKIT}" workflows input --workflow=build --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"<!-- bkit:tracker true start --> --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json"<!-- bkit:tracker true end --> --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
+    ```
+    Hold `newerThanPlan` as `{NEWER_COMMENTS}`.
+ 5. Finish:
+    ```bash
+    "{BKIT}" steps done --workflow=build --step=build-start-workflow --file="{STATUS}" --commit=none >/dev/null || exit 1
+    "{BKIT}" steps finish --workflow=build --step=build-worktree-setup --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md --number=2 --post --title="Worktree Setup" --tree={BRANCH} --message="chore({FID}): worktree-setup bkit [skip ci]"
+    ```
+
+ ### 🔒 Gate 2 — Worktree Setup
+
+ - [ ] Worktree ready
+ - [ ] Input file written (`workflows input`)
+ - [ ] Mechanical checks passed (`steps finish`)
+
+ ---
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1825:18
    1823|   it("warns when a non-LOCAL run resolves publish false", () => {
    1824|     const text = step2();
    1825|     expect(text).toContain("`{PUBLISH_SOURCE}` = `coerced`");
       |                  ^
    1826|     expect(text).toMatch(/Warning: publish=false[^\n]*publishes/);
    1827|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > skips push, PR and CI on a held close
AssertionError: no **Held close** label: expected -1 to be greater than or equal to 0
 ❯ paths .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1788:45
    1786|     const held = text.indexOf("**Held close**");
    1787|     const pub = text.indexOf("**Publish close**");
    1788|     expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
       |                                             ^
    1789|     expect(pub, "no **Publish close** label").toBeGreaterThan(held);
    1790|     return {
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1830:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > keeps the publish=true close path
AssertionError: no **Held close** label: expected -1 to be greater than or equal to 0
 ❯ paths .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1788:45
    1786|     const held = text.indexOf("**Held close**");
    1787|     const pub = text.indexOf("**Publish close**");
    1788|     expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
       |                                             ^
    1789|     expect(pub, "no **Publish close** label").toBeGreaterThan(held);
    1790|     return {
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1849:25

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > appends the held roadmap row without roadmap mirror
AssertionError: no **Held close** label: expected -1 to be greater than or equal to 0
 ❯ paths .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1788:45
    1786|     const held = text.indexOf("**Held close**");
    1787|     const pub = text.indexOf("**Publish close**");
    1788|     expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
       |                                             ^
    1789|     expect(pub, "no **Publish close** label").toBeGreaterThan(held);
    1790|     return {
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1857:31

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > makes Gate 15 conditional on the held path
AssertionError: expected '   "{BKIT}" workflows summary --workf…' to contain '--publish={PUBLISH}'

Expected: "--publish={PUBLISH}"
Received: "   "{BKIT}" workflows summary --workflow=build --file="{STATUS}""

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1867:56
    1865|   it("makes Gate 15 conditional on the held path", () => {
    1866|     const text = step15();
    1867|     expect(commandLines(text, "workflows summary")[0]).toContain("--pu…
       |                                                        ^
    1868|     const gate = text.slice(text.indexOf("### 🔒 Gate 15"));
    1869|     expect(gate).toMatch(/- \[ \] Open-PR probe ran \(publish=true onl…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build publish ending > runs only the close gate on the held path
AssertionError: no **Held close** label: expected -1 to be greater than or equal to 0
 ❯ paths .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1788:45
    1786|     const held = text.indexOf("**Held close**");
    1787|     const pub = text.indexOf("**Publish close**");
    1788|     expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
       |                                             ^
    1789|     expect(pub, "no **Publish close** label").toBeGreaterThan(held);
    1790|     return {
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1876:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 241 passed (249)
   Start at  13:03:38
   Duration  818ms (transform 68%, tests 16%, import 12%, setup 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-kq703J/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
