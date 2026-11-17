Enforced: true
Red: 3
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/957-workflows-skip-re-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs" | red | failure: no rule setting DECISION_ROUTE = continue: expected -1 to be greater than or equal to 0 |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "continue sends holistic to Step 11 and verify to the decision tick then Step 7" | red | failure: expected '' to match /holistic[^\n]*Step 11/ |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a Gate FAIL pause never routes continue" | red | failure: no rule setting DECISION_ROUTE = continue: expected -1 to be greater than or equal to 0 |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug and ship questions offer no answer that re-runs a check without a change" | passed-accepted | passes; accepted by the tests step: today's debug and ship Options lines only offer Stop, Try again, Confirm, Reject |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (279 tests | 3 failed) 282ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 3ms
     ✓ design calls only verbs and flags the CLI has 2ms
     ✓ plan calls only verbs and flags the CLI has 2ms
     ✓ build calls only verbs and flags the CLI has 3ms
     ✓ debug calls only verbs and flags the CLI has 5ms
     ✓ ship calls only verbs and flags the CLI has 2ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 2ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 2ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 1ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 1ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 2ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 1ms
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
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 1ms
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 1ms
     ✓ build re-runs a red gate pause instead of asking it 1ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 1ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 1ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 1ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 1ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 1ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 2ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 1ms
     ✓ ship flushes through `workflows handover --flush` 1ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 1ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 1ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 1ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 1ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 1ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 1ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 1ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 1ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 1ms
     ✓ build's comment numbers match the step table 14ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 1ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 1ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 1ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 1ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 1ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 1ms
     ✓ group-mode verify logs no gap for a test the group gate runs 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 0ms
     ✓ a hard blocker answered Fix now with no direction is asked again 0ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 0ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 1ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 2ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 1ms
     ✓ debug: the Resume line calls `status resume` 1ms
     ✓ ship: the Resume line calls `status resume` 1ms
     ✓ design: the step table matches the step headings and their --step= calls 2ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 2ms
     ✓ debug: the step table matches the step headings and their --step= calls 1ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 1ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 4ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ design never reads a verdict outside `steps finish` 1ms
     ✓ plan never reads a verdict outside `steps finish` 1ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 1ms
     ✓ ship never reads a verdict outside `steps finish` 1ms
   ✓ status route --require=strategy (1)
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 2ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 2ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 1ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 1ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 3ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 1ms
     ✓ build hands no agent a raw `git diff` 1ms
     ✓ debug hands no agent a raw `git diff` 1ms
     ✓ ship hands no agent a raw `git diff` 1ms
   ✓ ship (7)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 1ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 1ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 8ms
     ✓ plan and build hold the caps `repo info` prints 1ms
   ✓ plan (3)
     ✓ plan runs one review round 1ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
     ✓ carries draft formatting findings through review and update, with a strict final check 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 1ms
     ✓ plan reads its related issues through one `issues related` call 1ms
     ✓ debug reads its related issues through one `issues related` call 1ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 1ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 1ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 1ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 1ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 1ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 0ms
     ✓ build: no wired-tracker block STOPs on a missing issue 1ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 1ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 1ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 4ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 5ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ design: the No issue bullet sits in a tracker true block 1ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 1ms
     ✓ ship: the No issue bullet sits in a tracker true block 1ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 1ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 2ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 2ms
     ✓ plan reads the parent design and audit reports from `fids design` 1ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 1ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ design: tracker gate items name the attempt, never its skip rule 1ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 1ms
     ✓ build: tracker gate items name the attempt, never its skip rule 2ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 2ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 1ms
     ✓ design Step 11 posts plans 1ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 2ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 1ms
     ✓ debug Steps 9 and 10 push nothing on dev 1ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 6ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 1ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 1ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 1ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 1ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 1ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 1ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 0ms
     ✓ re-derives publish on resume 1ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 1ms
     ✓ keeps the publish=true close path 1ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms
   ❯ build Decision Pause continue route (3)
     × an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs 8ms
     × continue sends holistic to Step 11 and verify to the decision tick then Step 7 3ms
     × a Gate FAIL pause never routes continue 1ms
   ✓ questions never re-run a check without a change (1)
     ✓ debug and ship questions offer no answer that re-runs a check without a change 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build Decision Pause continue route > an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs
AssertionError: no rule setting DECISION_ROUTE = continue: expected -1 to be greater than or equal to 0
 ❯ routeRule .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2303:61
    2301|     const lines = text.split("\n");
    2302|     const at = lines.findIndex((l) => l.includes(`\`DECISION_ROUTE\` =…
    2303|     expect(at, `no rule setting DECISION_ROUTE = ${route}`).toBeGreate…
       |                                                             ^
    2304|     return { at, line: lines.at(at) ?? "" };
    2305|   };
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2316:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build Decision Pause continue route > continue sends holistic to Step 11 and verify to the decision tick then Step 7
AssertionError: expected '' to match /holistic[^\n]*Step 11/

- Expected:
/holistic[^\n]*Step 11/

+ Received:
""

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2328:20
    2326|   it("continue sends holistic to Step 11 and verify to the decision ti…
    2327|     const routes = continueRoutes(pause()).join("\n");
    2328|     expect(routes).toMatch(/holistic[^\n]*Step 11/);
       |                    ^
    2329|     expect(routes).toMatch(/verify[^\n]*"\{BKIT\}" tasks tick[^\n]*--d…
    2330|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build Decision Pause continue route > a Gate FAIL pause never routes continue
AssertionError: no rule setting DECISION_ROUTE = continue: expected -1 to be greater than or equal to 0
 ❯ routeRule .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2303:61
    2301|     const lines = text.split("\n");
    2302|     const at = lines.findIndex((l) => l.includes(`\`DECISION_ROUTE\` =…
    2303|     expect(at, `no rule setting DECISION_ROUTE = ${route}`).toBeGreate…
       |                                                             ^
    2304|     return { at, line: lines.at(at) ?? "" };
    2305|   };
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2333:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 276 passed (279)
   Start at  21:38:15
   Duration  939ms (tests 38%, transform 29%, import 26%, setup 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6vFcdk/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
