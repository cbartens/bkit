Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/960-build-diffs-count-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build migration scan and debug off-dev no-leak scan pass --base=origin/dev" | red | failure: expected ' "{BKIT}" branches scan-diff --path…' to contain '--base=origin/dev' |
| 8 | `.bkit/core/engine/commands/workflow/feature-base.test.ts` "featureBase falls back to the origin/dev meeting point when local dev already contains HEAD" | red | failure: expected 'ff8916d5495219572d01f0e79389e4c5dd437…' not to be 'ff8916d5495219572d01f0e79389e4c5dd437…' // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff without --base finds a marker the branch added when local dev already contains the branch" | red | failure: expected +0 to be 1 // Object.is equality |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "ship sweep and Failure Path context diff lines pass --base=origin/dev" | red | failure: ship-deferred-sweep: expected ' cd "{WORKTREE_PATH}" && "{BKIT}" c…' to contain '--base=origin/dev' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (277 tests | 2 failed) 104ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 1ms
     ✓ design calls only verbs and flags the CLI has 1ms
     ✓ plan calls only verbs and flags the CLI has 0ms
     ✓ build calls only verbs and flags the CLI has 1ms
     ✓ debug calls only verbs and flags the CLI has 2ms
     ✓ ship calls only verbs and flags the CLI has 1ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 1ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 0ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build never copies or clamps a gate log by hand 0ms
     ✓ debug never copies or clamps a gate log by hand 0ms
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
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 0ms
     ✓ build re-runs a red gate pause instead of asking it 0ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 0ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 0ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 0ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 0ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 0ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 0ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 0ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 0ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 0ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 0ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 0ms
     ✓ Branch Sync merges docs and finishes as its own step 0ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 5ms
     ✓ the convert step posts under Plan Convert's number and title 0ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 0ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 1ms
     ✓ Step 7 takes the next group's brief and hands execute its path 0ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 0ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 0ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 0ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 0ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 0ms
     ✓ group-mode verify logs no gap for a test the group gate runs 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 0ms
     ✓ a hard blocker answered Fix now with no direction is asked again 0ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 0ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 0ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 2ms
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
     ✓ ship: the step table matches the step headings and their --step= calls 0ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 0ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 1ms
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
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 1ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 1ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 0ms
     ✓ build /Step 10 — / writes the diff right before its agents 0ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 0ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 0ms
     ✓ build hands no agent a raw `git diff` 2ms
     ✓ debug hands no agent a raw `git diff` 0ms
     ✓ ship hands no agent a raw `git diff` 0ms
   ✓ ship (7)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 0ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 7ms
     ✓ plan and build hold the caps `repo info` prints 0ms
   ✓ plan (3)
     ✓ plan runs one review round 0ms
     ✓ bkit-plan runs plan-check after every plan-writing step 0ms
     ✓ carries draft formatting findings through review and update, with a strict final check 0ms
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
     ✓ debug writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 0ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 0ms
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
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
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
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 2ms
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
     ✓ design: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
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
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
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
     ✓ build: tracker gate items name the attempt, never its skip rule 0ms
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
   ❯ debug on dev (5)
     ✓ debug passes --base only when it runs in place on dev 0ms
     × build migration scan and debug off-dev no-leak scan pass --base=origin/dev 4ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 0ms
     ✓ debug stops and asks on a foreign path 0ms
   ❯ ship deferred sweep base (1)
     × ship sweep and Failure Path context diff lines pass --base=origin/dev 1ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 2ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 0ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 0ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 0ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 0ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 1ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 0ms
     ✓ re-derives publish on resume 0ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 0ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > debug on dev > build migration scan and debug off-dev no-leak scan pass --base=origin/dev
AssertionError: expected '   "{BKIT}" branches scan-diff --path…' to contain '--base=origin/dev'

Expected: "--base=origin/dev"
Received: "   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2064:48
    2062|     );
    2063|     expect(migration.length).toBeGreaterThan(0);
    2064|     for (const line of migration) expect(line).toContain("--base=origi…
       |                                                ^
    2065|     const noLeak = commandLines(debug, "branches scan-diff").filter((l…
    2066|       l.includes('--marker="[DEBUG-OBSERVE]"'),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > ship deferred sweep base > ship sweep and Failure Path context diff lines pass --base=origin/dev
AssertionError: ship-deferred-sweep: expected '   cd "{WORKTREE_PATH}" && "{BKIT}" c…' to contain '--base=origin/dev'

Expected: "--base=origin/dev"
Received: "   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2120:50
    2118|       const hit = lines.filter((l) => l.includes(`--step=${step}`));
    2119|       expect(hit.length, step).toBeGreaterThan(0);
    2120|       for (const line of hit) expect(line, step).toContain("--base=ori…
       |                                                  ^
    2121|     }
    2122|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 275 passed (277)
   Start at  08:23:36
   Duration  314ms (tests 41%, import 30%, transform 23%, setup 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QdmfPt/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/feature-base.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/feature-base.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/feature-base.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/feature-base.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/commands/workflow/feature-base.test.ts (3 tests | 1 failed) 302ms
   ❯ featureBase and defaultRange (3)
     ✓ name the origin/dev meeting point when local dev has not moved 87ms
     ✓ read from local dev's tip when the branch was cut after local dev moved ahead 133ms
     × featureBase falls back to the origin/dev meeting point when local dev already contains HEAD 82ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/feature-base.test.ts > featureBase and defaultRange > featureBase falls back to the origin/dev meeting point when local dev already contains HEAD
AssertionError: expected 'ff8916d5495219572d01f0e79389e4c5dd437…' not to be 'ff8916d5495219572d01f0e79389e4c5dd437…' // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/feature-base.test.ts:62:34
     60|     g(dir, "branch", "-f", "dev", "HEAD");
     61|     const head = g(dir, "rev-parse", "HEAD");
     62|     expect(featureBase(dir)).not.toBe(head);
       |                                  ^
     63|     expect(featureBase(dir)).toBe(base);
     64|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)
   Start at  08:23:37
   Duration  385ms (tests 91%, setup 4%, transform 2%, import 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UeaIYU/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (279 tests | 1 failed) 80082ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 126ms
     ✓ rejects missing explicit and ambiguous existing branch selections 113ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 1ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 0ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 0ms
     ✓ refuses apps/web/data.jsonl 0ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 0ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 36ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 182ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 189ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 130ms
     ✓ a refused --continue carries git's own reason 172ms
     ✓ --file records nothing for a refused rebase 117ms
     ✓ refuses a code conflict and aborts the rebase on the spot 148ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 480ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 128ms
     ✓ produces byte-identical output to merge=union 310ms
     ✓ restores a trailing newline so the next append starts on its own line 184ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 175ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 274ms
     ✓ refuses a union that leaves a line which is not JSON 147ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 196ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 573ms
     ✓ refuses a lockfile whose regenerate command fails 300ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 252ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 246ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 237ms
     ✓ refuses and aborts when both sides changed the hand-written region 147ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 165ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 201ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 255ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 152ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 184ms
     ✓ refuses and aborts when a side deleted the install record 144ms
     ✓ refuses a conflicted doc the repo's script does not list 135ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 127ms
     ✓ removes a stale sentinel when the rebase succeeds 171ms
     ✓ exits 4 when no rebase is in progress 46ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 233ms
     ✓ resolves a conflict in each of two replayed commits across rounds 201ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 8ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 27ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 9ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 9ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 16ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 15ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 16ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 15ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 0ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 0ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 15ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 113ms
       ✓ skips (12) with no anchor 116ms
       ✓ skips (12) when the base is unreachable in this clone 127ms
       ✓ skips (12) when nothing landed since the base 125ms
       ✓ runs (0) with the landed path count once dev moved 234ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 121ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 244ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 151ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 196ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 662ms
     ✓ runs exactly one git push 568ms
     ✓ --set-upstream records the upstream 197ms
     ✓ refuses with no branch checked out 142ms
     ✓ --mode=dev refuses a feature checkout 130ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 327ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 506ms
     ✓ --require-ci pushes as-is when dev has not moved 210ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 380ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 544ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 153ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 514ms
     ✓ --mode=abort pushes when the branch has no open PR 398ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 286ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 133ms
     ✓ --open-pr carries the MCP answer and skips gh 176ms
     ✓ --mode=abort on dev pushes plainly without probing 179ms
     ✓ rejects an unknown mode 132ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 563ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 289ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 326ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1365ms
     ✓ skip-ci HEAD on the replay is refused 220ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 553ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1016ms
     ✓ a level local dev is a plain push, recording nothing extra 277ms
     ✓ a record with no commits pushes nothing 199ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 138ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 581ms
     ✓ a rewritten branch is refused, never forced 201ms
     ✓ refuses dev and main with exit 21 and pushes nothing 132ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 316ms
     ✓ refuses a detached HEAD (exit 5) 138ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 281ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 261ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 260ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 320ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 140ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 312ms
     ✓ an up-to-date branch is a no-op 198ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 323ms
     ✓ a fetch that fails exits 10 141ms
   ❯ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 208ms
     ✓ scan-diff still reports a new skip when its test … 180ms
     ✓ scan-diff reports a skip moved onto a different t… 174ms
     ✓ scan-diff does not cancel a skip moved between am… 175ms
     ✓ scan-diff does not spend an unchanged duplicate t… 183ms
     ✓ scan-diff recognizes a renamed test file 180ms
     ✓ scan-diff recognizes a suite moved into a differe… 176ms
     ✓ scan-diff does not let unrelated additions hide a… 172ms
     ✓ scan-diff attributes deletion to its old test ins… 173ms
     ✓ scan-diff consumes each moved assertion once and … 179ms
     ✓ scan-diff does not match identical assertions fro… 182ms
     ✓ scan-diff does not match the same leaf test name … 201ms
     ✓ scan-diff does not match a same-named test with d… 197ms
     ✓ scan-diff does not match a same-named test with c… 180ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 176ms
     ✓ --paths with no match exits 1 161ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 128ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 228ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 223ms
     × scan-diff without --base finds a marker the branch added when local dev already contains the branch 164ms
     ✓ --marker reads a diff over 1 MiB 191ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 211ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 188ms
     ✓ scan-diff finds an added skip 194ms
     ✓ scan-diff ignores a skip predating the base 176ms
     ✓ scan-diff reports a disabled test with its line 193ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 179ms
     ✓ scan-diff ignores a removed comment in a test file 180ms
     ✓ scan-diff ignores an assertion moved within the file 173ms
     ✓ scan-diff still reports a removed assertion 175ms
     ✓ scan-diff reports an assertion re-added only outside the test file 176ms
     ✓ scan-diff finds an added pytest mark skip 195ms
     ✓ scan-diff finds an added unittest skip 175ms
     ✓ scan-diff finds an added bare skip call 176ms
     ✓ scan-diff ignores a quoted skip in a documentation file 177ms
     ✓ scan-diff ignores a marker literal in a non-test source file 186ms
     ✓ scan-diff ignores an assertion whose expectation changed 175ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 177ms
     ✓ scan-diff reports a deleted test file 179ms
     ✓ scan-diff never opens a symlinked test file's outside target 1ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 134ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 438ms
     ✓ a title that already carries the marker is left alone 386ms
     ✓ with no open PR: pushes the marker commit and edits no title 397ms
     ✓ a re-run is deduped: no second marker commit 451ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 490ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 140ms
     ✓ --title-set skips gh entirely 221ms
     ✓ refuses dev and main (exit 21) 108ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 490ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 821ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 440ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 948ms
     ✓ continues only the explicitly recorded target through the public merge command 641ms
     ✓ fetches the unseen feature head before classifying the base 445ms
     ✓ fast forwards the feature before either base path is chosen 950ms
     ✓ merges divergent feature tips without rebasing either side 567ms
     ✓ continues the feature merge before starting a dev merge 884ms
     ✓ publishes local code with a CI running head before bookkeeping 998ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1324ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 893ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 659ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 166ms
     ✓ Path B once dev moved; --head checks a given commit 251ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 254ms
     ✓ --merge-docs merges dev when docs/ is behind 306ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 296ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 426ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 427ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 361ms
     ✓ --merge-docs skips an empty bkit:generate script 360ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 306ms
     ✓ --merge-docs never merges on dev itself 272ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 342ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 356ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 329ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 345ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 184ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 442ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 513ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 545ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 498ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 448ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 581ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 400ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 494ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 321ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 219ms
     ✓ exits 10 when the fetch fails 143ms
     ✓ refuses --merge-docs with --head, and an unknown --head 157ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 285ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 466ms
     ✓ a failed install stops ship (16) 413ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 305ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 281ms
     ✓ exits 10 when the fetch fails 215ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 155ms
     ✓ preserves unlanded file type changes in the shared landed comparison 153ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 117ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 190ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 727ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 752ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 724ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 708ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1724ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1976ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 269ms
     ✓ local: names unpushed dev as the cause when the branch carries it 302ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 325ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 929ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 994ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 778ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3257ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 646ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 851ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 807ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 596ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 948ms
     ✓ land removes the worktree when only the copied .env is untracked 792ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 676ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 711ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1354ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 715ms
     ✓ landPr refuses a main-based PR without retrying 501ms
     ✓ landPr refuses when the PR base is unknown 481ms
     ✓ PR not open (closed): stops (17) at once, no retry 582ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 289ms
     ✓ --attempt names the merge round in a fix commit 261ms
     ✓ commits a rewritten and a deleted tracked file 271ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 235ms
     ✓ reports undeclared and runs nothing with no scripts 169ms
     ✓ reports undeclared and runs nothing with an empty script 172ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 216ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 247ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 170ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff without --base finds a marker the branch added when local dev already contains the branch
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2194:20
    2192|     git(clone, "branch", "-f", "dev", "HEAD");
    2193|     const r = await run(clone, ["scan-diff", "--marker=[DEBUG-OBSERVE]…
    2194|     expect(r.code).toBe(1);
       |                    ^
    2195|     expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
    2196|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 278 passed (279)
   Start at  08:23:38
   Duration  80.24s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ElQ3wa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
