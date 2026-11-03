
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/workflow-shape.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (241 tests | 13 failed) 761ms
   ❯ engine calls (8)
     × auto calls only verbs and flags the CLI has 30ms
     × design calls only verbs and flags the CLI has 1ms
     × plan calls only verbs and flags the CLI has 0ms
     × build calls only verbs and flags the CLI has 0ms
     × debug calls only verbs and flags the CLI has 1ms
     × ship calls only verbs and flags the CLI has 1ms
     × the call check reports an unknown verb and an unknown flag 1ms
     ✓ no workflow names a removed sub-plan flag 2ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as {BKIT} 0ms
     ✓ build resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ debug resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ ship resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 19ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 1ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 4ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 1ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 9ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 1ms
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
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 5ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 1ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 0ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ✓ build (31)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 2ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 0ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 0ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 26ms
     ✓ build challenge runs the size gate first 0ms
     ✓ names no removed challenge agent, step or limit 0ms
     ✓ Branch Sync merges docs and finishes as its own step 0ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 10ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 62ms
     ✓ Plan Current posts a comment whether it runs or skips 1ms
     ✓ Plan Current's skipped comment says no plan anchor 1ms
     ✓ issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 2ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 1ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 0ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 1ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 3ms
   ❯ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 0ms
     ✓ debug: the Resume line calls `status resume` 6ms
     ✓ ship: the Resume line calls `status resume` 1ms
     × design: the step table matches the step headings and their --step= calls 1ms
     × plan: the step table matches the step headings and their --step= calls 0ms
     × build: the step table matches the step headings and their --step= calls 0ms
     × debug: the step table matches the step headings and their --step= calls 0ms
     × ship: the step table matches the step headings and their --step= calls 0ms
   ❯ promoted parsers (1)
     × holds the workflows to the step table 1ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ design never reads a verdict outside `steps finish` 0ms
     ✓ plan never reads a verdict outside `steps finish` 0ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 0ms
     ✓ ship never reads a verdict outside `steps finish` 0ms
   ✓ status route --require=strategy (1)
     ✓ is used at exactly the four strategy-routing sites 1ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ Timeouts header line says 3600 seconds, like the phase workflows 1ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 1ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 3ms
     ✓ ship /Failure Path/ writes the diff right before its agents 6ms
     ✓ ship /Step 5 — / writes the diff right before its agents 2ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 11ms
     ✓ build hands no agent a raw `git diff` 15ms
     ✓ debug hands no agent a raw `git diff` 2ms
     ✓ ship hands no agent a raw `git diff` 1ms
   ✓ ship (6)
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 1ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 49ms
     ✓ plan and build hold the caps `repo info` prints 11ms
   ✓ plan (2)
     ✓ plan runs one review round 3ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 1ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 1ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 9ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 1ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 6ms
     ✓ plan's Locks header no longer waits on the lock file's age 1ms
     ✓ build's Locks header no longer waits on the lock file's age 1ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 0ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 0ms
   ✓ issue-less runs (67)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ design: no wired-tracker block STOPs on a missing issue 7ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 1ms
     ✓ build: no wired-tracker block STOPs on a missing issue 1ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 0ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 0ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 144ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 24ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 18ms
     ✓ design: the No issue bullet sits in a tracker true block 11ms
     ✓ plan: the No issue bullet sits in a tracker true block 17ms
     ✓ build: the No issue bullet sits in a tracker true block 18ms
     ✓ debug: the No issue bullet sits in a tracker true block 5ms
     ✓ ship: the No issue bullet sits in a tracker true block 1ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 3ms
     ✓ ship: final messages start with the no-issue warning clause 1ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 11ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 16ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 22ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 1ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 2ms
     ✓ ship's merge MCP fallback asserts base.ref = dev before merging 6ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 6ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 2ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 6ms
     ✓ design: tracker gate items name the attempt, never its skip rule 16ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 2ms
     ✓ build: tracker gate items name the attempt, never its skip rule 3ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 1ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 0ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 3ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 4ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > auto calls only verbs and flags the CLI has
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > design calls only verbs and flags the CLI has
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > plan calls only verbs and flags the CLI has
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > build calls only verbs and flags the CLI has
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > debug calls only verbs and flags the CLI has
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > ship calls only verbs and flags the CLI has
TypeError: callWords is not a function or its return value is not iterable
 ❯ unknownCalls .bkit/core/engine/audits/workflows/workflow-shape.test.ts:71:35
     69|   const joined = text.replace(/\\\n\s*/g, " ");
     70|   for (const call of joined.split('"{BKIT}" ').slice(1)) {
     71|     const [noun, verb, ...rest] = callWords(call);
       |                                   ^
     72|     const spec = noun === undefined ? undefined : specs.get(noun);
     73|     if (!spec) continue; // a top-level command (`install`, `tips`) or…
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:91:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > engine calls > the call check reports an unknown verb and an unknown flag
TypeError: callWords is not a function or its return value is not iterable
 ❯ unknownCalls .bkit/core/engine/audits/workflows/workflow-shape.test.ts:71:35
     69|   const joined = text.replace(/\\\n\s*/g, " ");
     70|   for (const call of joined.split('"{BKIT}" ').slice(1)) {
     71|     const [noun, verb, ...rest] = callWords(call);
       |                                   ^
     72|     const spec = noun === undefined ? undefined : specs.get(noun);
     73|     if (!spec) continue; // a top-level command (`install`, `tips`) or…
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:96:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume > design: the step table matches the step headings and their --step= calls
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume > plan: the step table matches the step headings and their --step= calls
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume > build: the step table matches the step headings and their --step= calls
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume > debug: the step table matches the step headings and their --step= calls
 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume > ship: the step table matches the step headings and their --step= calls
TypeError: stepSections is not a function
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:803:24
    801|     "%s: the step table matches the step headings and their --step= ca…
    802|     (name) => {
    803|       const sections = stepSections(workflow(name));
       |                        ^
    804|       const table = WORKFLOW_STEPS[name];
    805|       const steps = [...new Map(table.map((s) => [s.number, s.title]))…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > promoted parsers > holds the workflows to the step table
TypeError: stepSections is not a function
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:823:9
    821|     for (const name of PHASES)
    822|       expect(
    823|         stepSections(workflow(name)).map((s) => s.number),
       |         ^
    824|         name,
    825|       ).toEqual([...new Set(WORKFLOW_STEPS[name].map((s) => s.number))…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯


 Test Files  1 failed (1)
      Tests  13 failed | 228 passed (241)
   Start at  08:01:09
   Duration  3.17s (transform 68%, tests 25%, import 5%, setup 2%)

  Transform  transforming modules took 2.06s · 68% of tracked time, re-done on every run
             persist transforms across runs with fsModuleCache: true
             learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MUAQw9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
