
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/workflow-shape.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (232 tests | 21 failed) 213ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 3ms
     ✓ design calls only verbs and flags the CLI has 1ms
     ✓ plan calls only verbs and flags the CLI has 1ms
     ✓ build calls only verbs and flags the CLI has 2ms
     ✓ debug calls only verbs and flags the CLI has 2ms
     ✓ ship calls only verbs and flags the CLI has 2ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 3ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as {BKIT} 1ms
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
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 3ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 0ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 1ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 0ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 3ms
   ✓ resume facts (1)
     ✓ build resumes an open decision from `openDecision`, not a file scan 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 0ms
   ✓ Failure Path (15)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 1ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 0ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ❯ build (28)
     × Step 13's diagnose agent reads the committed log, not the outbox copy 4ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     × Step 11 merges the findings into the plan and routes on the merge 1ms
     × Step 11 records its round on the challenge row and reads it back from status.jsonl 1ms
     × a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 4ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     × the last allowed challenge round never runs another 1ms
     × challenge merge exit 23 gets the same one retry as exit 22 0ms
     × an execute cap stop is a handover, never a FAIL attempt 0ms
     × build challenge runs the size gate first 0ms
     ✓ names no removed challenge agent, step or limit 0ms
     × Branch Sync merges docs and finishes as its own step 4ms
     × Plan Convert checks the plan, converts one with no task markers, and re-checks 2ms
     × Plan Convert leaves a valid plan with no newer comments alone 1ms
     × build's comment numbers match the step table 2ms
     × the convert step posts under Plan Convert's number and title 0ms
     × issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 3ms
     × Step 7 takes the next group's brief and hands execute its path 1ms
     × Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 3ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     × build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 1ms
       ✓ convert names no plan format but the task-block one 1ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 0ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 1ms
     ✓ debug: the step table matches the step headings and their --step= calls 1ms
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
   ❯ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 7ms
     × build /Step 10 — / writes the diff right before its agents 4ms
     × build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     × build group verify cuts its own diff from the group's start, right before the agent 2ms
     ✓ build hands no agent a raw `git diff` 1ms
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
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 7ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 1ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 0ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 0ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 0ms
   ❯ issue-less runs (67)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 0ms
     ✓ build: no wired-tracker block STOPs on a missing issue 0ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 0ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 0ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 11ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ design: the No issue bullet sits in a tracker true block 0ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 0ms
     ✓ debug: the No issue bullet sits in a tracker true block 0ms
     ✓ ship: the No issue bullet sits in a tracker true block 0ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 0ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 0ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 3ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 8ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 1ms
     ✓ plan reads the parent design and audit reports from `fids design` 1ms
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
     ✓ design: tracker gate items name the attempt, never its skip rule 1ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 0ms
     ✓ build: tracker gate items name the attempt, never its skip rule 4ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 4ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     × build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 2ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 0ms
   ✓ AGENTS.md router does not STOP on a missing issue 0ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 4ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 21 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Step 13's diagnose agent reads the committed log, not the outbox copy
AssertionError: no section matching /Step 13 — Failure Diagnose/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:350:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Step 11 merges the findings into the plan and routes on the merge
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:365:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Step 11 records its round on the challenge row and reads it back from status.jsonl
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:389:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file
AssertionError: expected '- **Resume:** After Step 2, `"{BKIT}"…' to contain 'Step 11 sub-steps 2 and 5'

Expected: "Step 11 sub-steps 2 and 5"
Received: "- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:403:24
    401|     const resumeLine = build.split("\n").find((l) => l.includes("**Res…
    402|     expect(resumeLine).not.toContain("the decision file's task numbers…
    403|     expect(resumeLine).toContain("Step 11 sub-steps 2 and 5");
       |                        ^
    404|     expect(resumeLine).toContain("`fixTasks` as `{CHALLENGE_TASKS}`");
    405|     expect(resumeLine).toContain("never sub-step 6");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > the last allowed challenge round never runs another
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:427:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > challenge merge exit 23 gets the same one retry as exit 22
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:439:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > an execute cap stop is a handover, never a FAIL attempt
AssertionError: no step matching /Step 7 — Plan Execute/: expected -1 to be greater than or equal to 0
 ❯ stepBody .bkit/core/engine/audits/workflows/workflow-shape.test.ts:33:48
     31|   const lines = text.split("\n");
     32|   const start = lines.findIndex((l) => /^#{2,3} /.test(l) && heading.t…
     33|   expect(start, `no step matching ${heading}`).toBeGreaterThanOrEqual(…
       |                                                ^
     34|   const end = lines.findIndex((l, i) => i > start && /^#{2,3} (?!🔒)/.…
     35|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:445:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > build challenge runs the size gate first
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:459:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Branch Sync merges docs and finishes as its own step
AssertionError: expected '## 🤖 Step 3 — Branch Sync\n\n1. Merg…' not to contain 'tests plan-check'

- Expected
+ Received

- tests plan-check
+ ## 🤖 Step 3 — Branch Sync
+
+ 1. Merge `origin/dev` when feature branch `docs/` is behind (conflicts: ledgers union, other `docs/` prefer `dev`):
+    ```bash
+    "{BKIT}" branches sync --merge-docs || exit 1
+    ```
+ 2. Check the plan is in task-block form, within the group caps:
+    ```bash
+    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
+    ```
+    Route:
+    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
+    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
+    - **Else** → **Failure Path** naming each problem in the report.
+ 3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
+    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
+    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
+    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+ 4. Finish, then re-run sub-step 2 with `CONVERTED` = true:
+    ```bash
+    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --message="chore({FID}): plan-convert attempt <attempt>" --number=3 --post --title="Branch Sync"
+    ```
+ 5. Finish:
+    ```bash
+    "{BKIT}" steps finish --workflow=build --step=build-branch-sync --file="{STATUS}" --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --message="chore({FID}): branch-sync" --number=3 --post --title="Branch Sync" --tree={BRANCH}
+    ```
+
+ ### 🔒 Gate 3 — Branch Sync
+
+ - [ ] Docs synced (`branches sync`)
+ - [ ] Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
+ - [ ] Mechanical checks passed (`steps finish`)
+
+ ---
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:487:23
    485|     const step3 = section(build, /Step 3 — Branch Sync/);
    486|     expect(step3).toContain('"{BKIT}" branches sync --merge-docs');
    487|     expect(step3).not.toContain("tests plan-check");
       |                       ^
    488|     expect(step3).not.toContain("Invoke `@bkit-build-plan-convert`");
    489|     const finish = commandLines(step3, "steps finish");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Plan Convert checks the plan, converts one with no task markers, and re-checks
AssertionError: no section matching /Step 4 — Plan Convert/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:499:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Plan Convert leaves a valid plan with no newer comments alone
AssertionError: no section matching /Step 4 — Plan Convert/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:512:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > build's comment numbers match the step table
AssertionError: expected [ [ 'build-branch-sync', …(1) ], …(3) ] to deeply equal [ …(3) ]

- Expected
+ Received

  [
    [
-     "build-close-workflow",
-     "build-create-pr",
+     "build-branch-sync",
+     "build-plan-convert",
+   ],
+   [
+     "build-group-start",
+     "build-plan-execute",
    ],
    [
      "build-group-gate",
      "build-plan-verify",
    ],
    [
-     "build-group-start",
-     "build-plan-execute",
+     "build-close-workflow",
+     "build-create-pr",
    ],
  ]

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:532:20
    530|       byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), r…
    531|     const shared = [...byNumber.values()].filter((s) => s.length > 1).…
    532|     expect(shared).toEqual([
       |                    ^
    533|       ["build-close-workflow", "build-create-pr"],
    534|       ["build-group-gate", "build-plan-verify"],

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > the convert step posts under Plan Convert's number and title
AssertionError: no section matching /Step 4 — Plan Convert/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:553:33

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > issue comments newer than a valid plan send the build through convert once
AssertionError: no section matching /Step 4 — Plan Convert/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:568:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Step 7 takes the next group's brief and hands execute its path
AssertionError: no step matching /Step 7 — Plan Execute/: expected -1 to be greater than or equal to 0
 ❯ stepBody .bkit/core/engine/audits/workflows/workflow-shape.test.ts:33:48
     31|   const lines = text.split("\n");
     32|   const start = lines.findIndex((l) => /^#{2,3} /.test(l) && heading.t…
     33|   expect(start, `no step matching ${heading}`).toBeGreaterThanOrEqual(…
       |                                                ^
     34|   const end = lines.findIndex((l, i) => i > start && /^#{2,3} (?!🔒)/.…
     35|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:587:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > Step 8 verifies a diff cut from the group's start commit
AssertionError: no step matching /Step 8 — Plan Verify/: expected -1 to be greater than or equal to 0
 ❯ stepBody .bkit/core/engine/audits/workflows/workflow-shape.test.ts:33:48
     31|   const lines = text.split("\n");
     32|   const start = lines.findIndex((l) => /^#{2,3} /.test(l) && heading.t…
     33|   expect(start, `no step matching ${heading}`).toBeGreaterThanOrEqual(…
       |                                                ^
     34|   const end = lines.findIndex((l, i) => i > start && /^#{2,3} (?!🔒)/.…
     35|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:604:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > build writes one input file with every input in Step 2, before any plan check
AssertionError: no section matching /Step 4 — Plan Convert/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:653:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > diff per reader > build /Step 10 — / writes the diff right before its agents
AssertionError: expected '   cd "{WORKTREE_PATH}" && "{BKIT}" c…' to contain 'context diff --reset-log --artifact="…'

Expected: "context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-plan-verify-holistic"
Received: "   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=build-challenge >/dev/null || exit 2"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:821:20
    819|       const [line, ...more] = commandLines(text, "context diff");
    820|       expect(more, `${step}: one diff call`).toEqual([]);
    821|       expect(line).toContain(
       |                    ^
    822|         `context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md"$…
    823|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > diff per reader > build /Step 11 — Build Challenge/ writes the diff right before its agents
AssertionError: no section matching /Step 11 — Build Challenge/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:818:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > diff per reader > build group verify cuts its own diff from the group's start, right before the agent
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:840:18
    838|     const [line, ...more] = commandLines(text, "context diff");
    839|     expect(more).toEqual([]);
    840|     expect(line).toContain(
       |                  ^
    841|       '"{BKIT}" context diff --reset-log --base={GROUP_BASE} --artifac…
    842|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/21]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > issue-less runs > build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty
AssertionError: no section matching /Step 16 — Close Workflow/: expected -1 to be greater than or equal to 0
 ❯ section .bkit/core/engine/audits/workflows/workflow-shape.test.ts:24:51
     22|   const lines = text.split("\n");
     23|   const start = lines.findIndex((l) => l.startsWith("## ") && heading.…
     24|   expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqu…
       |                                                   ^
     25|   const end = lines.findIndex((l, i) => i > start && l.startsWith("## …
     26|   return lines.slice(start, end === -1 ? undefined : end).join("\n");
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1471:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/21]⎯


 Test Files  1 failed (1)
      Tests  21 failed | 211 passed (232)
   Start at  23:23:16
   Duration  1.89s (transform 77%, tests 13%, import 9%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fGFLar/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
