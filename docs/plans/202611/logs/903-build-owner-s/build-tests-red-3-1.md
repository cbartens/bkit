Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/903-build-owner-s-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a Fix now challenge task is rewritten to the owner's direction in place" | red | failure: expected '**If** the item is a challenge task →…' to contain '**DONE WHEN:**' |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a hard blocker answered Fix now with no direction is asked again" | red | failure: expected 'still lacks a decision:\n - Dis…' to match /hard blocker/ |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "each Fix now item records its Fix task line before the decision row is finished" | red | failure: expected '5. Apply each decision:\n - **Accep…' to contain '`Fix task:`' |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the owner decisions contract names the task block as the Fix now carrier" | red | failure: expected '- **Owner decisions:** A subagent lea…' to contain 'task block' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 15.9 on 10 cores: unit limits 12451ms per test, 24901ms per hook (x2.49)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (269 tests | 4 failed) 3043ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 4ms
     ✓ design calls only verbs and flags the CLI has 6ms
     ✓ plan calls only verbs and flags the CLI has 2ms
     ✓ build calls only verbs and flags the CLI has 4ms
     ✓ debug calls only verbs and flags the CLI has 7ms
     ✓ ship calls only verbs and flags the CLI has 3ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 5ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 2ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 2ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 2ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 7ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 1ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 6ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 1ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 2ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 2ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 1ms
   ✓ resume facts (3)
     ✓ build resumes an open decision from `openDecision`, not a file scan 1ms
     ✓ build re-runs a red gate pause instead of asking it 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 1ms
     ✓ plan passes the repo root explicitly 1ms
     ✓ build passes the repo root explicitly 2ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 1ms
     ✓ plan records the failure through one `workflows fail` call 1ms
     ✓ build records the failure through one `workflows fail` call 1ms
     ✓ debug records the failure through one `workflows fail` call 1ms
     ✓ ship records the failure through one `workflows fail` call 1ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 2ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 1ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 1ms
     ✓ ship flushes through `workflows handover --flush` 1ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 1ms
   ❯ build (41)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 1ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 1ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 1ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 1ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 1ms
     ✓ the last allowed challenge round never runs another 1ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 1ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 2ms
     ✓ build challenge runs the size gate first 1ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 1ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 1ms
     ✓ build's comment numbers match the step table 15ms
     ✓ the convert step posts under Plan Convert's number and title 3ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 1ms
     ✓ Plan Current posts a comment whether it runs or skips 1ms
     ✓ Plan Current's skipped comment says no plan anchor 1ms
     ✓ issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 2ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 1ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 1ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 1ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 2ms
     ✓ a no-progress round after a red gate pauses with the loop question 1ms
     ✓ a failing gate or suite test is never a pause item 1ms
     ✓ group-mode verify logs no gap for a test the group gate runs 2ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     × a Fix now challenge task is rewritten to the owner's direction in place 15ms
     × a hard blocker answered Fix now with no direction is asked again 3ms
     × each Fix now item records its Fix task line before the decision row is finished 4ms
     × the owner decisions contract names the task block as the Fix now carrier 3ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 1ms
     ✓ build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 1ms
       ✓ convert names no plan format but the task-block one 1ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 12ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 1ms
     ✓ plan: the Resume line calls `status resume` 1ms
     ✓ build: the Resume line calls `status resume` 1ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 2ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 4ms
     ✓ debug: the step table matches the step headings and their --step= calls 2ms
     ✓ ship: the step table matches the step headings and their --step= calls 2ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 2ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 7ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 2ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 2ms
     ✓ design never reads a verdict outside `steps finish` 1ms
     ✓ plan never reads a verdict outside `steps finish` 1ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 1ms
     ✓ ship never reads a verdict outside `steps finish` 1ms
   ✓ status route --require=strategy (1)
     ✓ is used at exactly the five strategy-routing sites 3ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 3ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 2ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 1ms
     ✓ ship /Failure Path/ writes the diff right before its agents 1ms
     ✓ ship /Step 5 — / writes the diff right before its agents 2ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 3ms
     ✓ build hands no agent a raw `git diff` 11ms
     ✓ debug hands no agent a raw `git diff` 1ms
     ✓ ship hands no agent a raw `git diff` 1ms
   ✓ ship (6)
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 1ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 1ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 27ms
     ✓ plan and build hold the caps `repo info` prints 2ms
   ✓ plan (3)
     ✓ plan runs one review round 2ms
     ✓ bkit-plan runs plan-check after every plan-writing step 2ms
     ✓ carries draft formatting findings through review and update, with a strict final check 2ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 1ms
     ✓ plan lands on dev through `branches land` 1ms
     ✓ design reads its related issues through one `issues related` call 1ms
     ✓ plan reads its related issues through one `issues related` call 1ms
     ✓ debug reads its related issues through one `issues related` call 1ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 1ms
     ✓ plan never lists versions with an `ls` glob 1ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 1ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 1ms
     ✓ plan's Locks header no longer waits on the lock file's age 1ms
     ✓ build's Locks header no longer waits on the lock file's age 2ms
     ✓ debug's Locks header no longer waits on the lock file's age 5ms
     ✓ ship's Locks header no longer waits on the lock file's age 1ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 11ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 1ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 4ms
     ✓ debug passes its summary file 1ms
     ✓ ship passes its summary path plus the missing-summary line 1ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 4ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 3ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 2ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 2ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 1ms
     ✓ build: no wired-tracker block STOPs on a missing issue 1ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 1ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 1ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 205ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 688ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 1001ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 455ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 246ms
     ✓ design: the No issue bullet sits in a tracker true block 1ms
     ✓ plan: the No issue bullet sits in a tracker true block 1ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 1ms
     ✓ ship: the No issue bullet sits in a tracker true block 1ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 1ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 5ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 2ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
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
     ✓ debug: tracker gate items name the attempt, never its skip rule 2ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 3ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 1ms
     ✓ design Step 11 posts plans 1ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 2ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 2ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 1ms
     ✓ debug Steps 9 and 10 push nothing on dev 1ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 1ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 7ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 1ms
   ✓ fix loops ask only when the last round made no progress (3)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 1ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 2ms
     ✓ ship takes a merge fix round without asking when the diagnosis found the cause 1ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 2ms
     ✓ re-derives publish on resume 2ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 1ms
     ✓ keeps the publish=true close path 1ms
     ✓ appends the held roadmap row without roadmap mirror 1ms
     ✓ makes Gate 15 conditional on the held path 1ms
     ✓ runs only the close gate on the held path 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a Fix now challenge task is rewritten to the owner's direction in place
AssertionError: expected '**If** the item is a challenge task →…' to contain '**DONE WHEN:**'

- Expected
+ Received

- **DONE WHEN:**
+ **If** the item is a challenge task → keep that task open. It runs as it is.
+      - 

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:917:20
    915|     expect(start).toBeGreaterThanOrEqual(0);
    916|     const branch = fixNow.slice(start, fixNow.indexOf("**Else** → writ…
    917|     expect(branch).toContain("**DONE WHEN:**");
       |                    ^
    918|     expect(branch).toContain("**TEST FIRST:**");
    919|     expect(branch).toContain("`Derived Test Matrix`");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a hard blocker answered Fix now with no direction is asked again
AssertionError: expected 'still lacks a decision:\n       - Dis…' to match /hard blocker/

- Expected:
/hard blocker/

+ Received:
"still lacks a decision:
       - Discuss the follow-ups with the owner.
       - Record the wait with the `owner-pause` block above.
       - End the turn and wait for the answers.
     - **Else** → step 5.
"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:930:21
    928|     const route = pause.slice(from, pause.indexOf("5. Apply each decis…
    929|     const missing = route.slice(route.indexOf("still lacks a decision"…
    930|     expect(missing).toMatch(/hard blocker/);
       |                     ^
    931|     expect(missing).toContain("`Fix now`");
    932|     expect(missing).toMatch(/no direction/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > each Fix now item records its Fix task line before the decision row is finished
AssertionError: expected '5. Apply each decision:\n   - **Accep…' to contain '`Fix task:`'

- Expected
+ Received

- `Fix task:`
+ 5. Apply each decision:
+    - **Accept** by the owner → write the acceptance ONLY on that item's explicit approval from the owner. A "yes" to an `Accept` recommendation counts as approval.
+      - **If** the item is an `exception-refused` gap **or** an `UNPROVEN` item → write a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`:
+        - Give the field one sub-bullet per test, in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`.
+        - **If** the task has no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone.
+        - The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second one.
+      - **Else**:
+        - Append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom). Set `by.step` = `build-decision`, write a `summary` that names `{FID}`, step `{PAUSE_STEP}` and the gap or finding, and set `rationale` = `accepted by owner: {human's reason}`.
+        - **If** the item is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
+    - **Accept (assumed)**, written by `decisions apply` → write nothing else: no `docs/decisions.jsonl` row and no `TEST EXCEPTION`. Ship asks the owner to confirm the item later.
+      - **If** the item is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`.
+    - **Fix now**:
+      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
+      - **If** the item is a challenge task → keep that task open. It runs as it is.
+      - **Else** → write a new task block:
+        - Use the task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook), numbered one above the plan's highest task.
+        - Give it `**DONE WHEN:**` and `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
+        - Add one `Derived Test Matrix` row per test in that `TEST FIRST`: ``| {test name} | {tier} | `{test file}` | {task} |``, with the tier its file's name gives.
+        - Shape the task by the owner's direction, when the owner gave one.
+        - Place the task block:
+          - **If** `From: verify` **and** group `{GROUP}` stays within `MAX_TASKS_PER_GROUP` tasks and `MAX_TESTS_PER_GROUP` `TEST FIRST` tests with it → put it inside group `{GROUP}`.
+          - **If** `From: verify` **and** it would take group `{GROUP}` over either cap → put it in a new group right after `{GROUP}`. Add 1 to every later group's number, in its markers and its `### TASK GROUP` heading.
+          - **If** `From: holistic`, `From: tests` **or** `From: challenge` → put it in a new last group, keeping each new group within the caps.
+      - Then check the plan:
+        ```bash
+        "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
+        ```
+        **If** exit non-zero → **Failure Path** naming each problem in the report.
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:942:19
    940|       pause.indexOf("6. Write the decisions"),
    941|     );
    942|     expect(step5).toContain("`Fix task:`");
       |                   ^
    943|     expect(step5).toMatch(/already has a `Fix task:` line/);
    944|     expect(step5).toMatch(/reuse/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > the owner decisions contract names the task block as the Fix now carrier
AssertionError: expected '- **Owner decisions:** A subagent lea…' to contain 'task block'

Expected: "task block"
Received: "- **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:958:20
    956|     const bullet = build.split("\n").find((l) => l.startsWith("- **Own…
    957|     expect(bullet).toBeDefined();
    958|     expect(bullet).toContain("task block");
       |                    ^
    959|     expect(bullet).toContain("`Fix now`");
    960|     expect(bullet).not.toContain("only by reading the decision file");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 265 passed (269)
   Start at  18:15:44
   Duration  4.10s (tests 78%, transform 11%, import 9%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1zUT1R/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
