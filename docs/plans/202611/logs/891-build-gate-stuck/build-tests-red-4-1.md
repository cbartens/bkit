Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > the Decision Pause checks a red gate against the base commit before composing" | red | failure: expected [] to have a length of 1 but got +0 |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a no-progress round after a red gate pauses with the loop question" | red | failure: expected '5. Check that the attempt changed sou…' to contain '`GATE_VERDICT` = FAIL' |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a failing gate or suite test is never a pause item" | red | failure: expected '## 🤖 Decision Pause\n\n1. Derive the…' not to contain 'because it is always fixed' |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "resume facts > build re-runs a red gate pause instead of asking it" | red | failure: expected '- **Resume:** After Step 2, `"{BKIT}"…' to contain '`gate` as' |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a re-run gate that is still red goes straight to the Decision Pause" | red | failure: Step 8: expected '### 🧠 Step 8 — Plan Verify\n\n1. Der…' to match /`GATE_RERUN` = true[^\n]*\*\*Decision…/ |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a green re-run gate continues without asking and clears GATE_RERUN" | red | failure: Step 8: expected '### 🧠 Step 8 — Plan Verify\n\n1. Der…' to match /clear[^\n]*`GATE_RERUN`\|`GATE_RERUN`…/i |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > group-mode verify logs no gap for a test the group gate runs" | red | failure: expected '6. **If** `Mode` = `Group`:\n - The…' to match /not a gap/ |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 2.0 on 10 cores: unit limits 5500ms per test, 11000ms per hook (x1.10)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (264 tests | 7 failed) 443ms
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
   ❯ resume facts (2)
     ✓ build resumes an open decision from `openDecision`, not a file scan 0ms
     × build re-runs a red gate pause instead of asking it 4ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 0ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 0ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 2ms
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
   ❯ build (37)
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
     × a re-run gate that is still red goes straight to the Decision Pause 1ms
     × a green re-run gate continues without asking and clears GATE_RERUN 0ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     × the Decision Pause checks a red gate against the base commit before composing 1ms
     × a no-progress round after a red gate pauses with the loop question 1ms
     × a failing gate or suite test is never a pause item 1ms
     × group-mode verify logs no gap for a test the group gate runs 0ms
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
     ✓ design: the step table matches the step headings and their --step= calls 0ms
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
     ✓ is used at exactly the five strategy-routing sites 1ms
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
     ✓ no prompt or workflow states a literal group cap 3ms
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
     ✓ build writes its summary with `workflows summary`, no summary subagent 0ms
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
     ✓ ship passes its summary path plus the missing-summary line 1ms
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
     ✓ design: fids resolve and steps gate carry --issue in every workflow 41ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 60ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 114ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 85ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 60ms
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
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 0ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 3ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ✓ fix loops ask only when the last round made no progress (3)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 0ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 0ms
     ✓ ship takes a merge fix round without asking when the diagnosis found the cause 0ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 0ms
     ✓ re-derives publish on resume 0ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 0ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > resume facts > build re-runs a red gate pause instead of asking it
AssertionError: expected '- **Resume:** After Step 2, `"{BKIT}"…' to contain '`gate` as'

Expected: "`gate` as"
Received: "- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:273:20
    271|     const resume = text.split("\n").filter((l) => l.startsWith("- **Re…
    272|     expect(resume).toBeDefined();
    273|     expect(resume).toContain("`gate` as");
       |                    ^
    274|     expect(resume).toContain("decisions apply --by=rerun");
    275|     expect(resume).toContain("`GATE_RERUN` = true");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a re-run gate that is still red goes straight to the Decision Pause
AssertionError: Step 8: expected '### 🧠 Step 8 — Plan Verify\n\n1. Der…' to match /`GATE_RERUN` = true[^\n]*\*\*Decision…/

- Expected:
/`GATE_RERUN` = true[^\n]*\*\*Decision Pause\*\*/

+ Received:
"### 🧠 Step 8 — Plan Verify

1. Derive the attempt the verify artifact is named for:
   ```bash
   \"{BKIT}\" counters derive --file=\"{STATUS}\" --workflow=build --step=build-plan-verify --group={GROUP} --position=next
   ```
   Hold `value` as `VERIFY_ATTEMPT`.
2. Audit the group's test-first reds:
   ```bash
   \"{BKIT}\" tests green --file=\"{STATUS}\" --workflow=build --group={GROUP} --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --log=\"docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md\"
   ```
   **If** exit >= 2 → **Failure Path**.
3. Cut the group's own diff, from the commit it started at:
   ```bash
   \"{BKIT}\" status route --step=build-group-start --group={GROUP} --file=\"{STATUS}\" --workflow=build
   ```
   Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
   ```bash
   \"{BKIT}\" context diff --reset-log --base={GROUP_BASE} --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md\" --fid={FID} --step=build-plan-verify --attempt={VERIFY_ATTEMPT}
   ```
4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into the working directory with `cd \"{WORKTREE_PATH}\"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
5. Finish:
   ```bash
   \"{BKIT}\" steps finish --workflow=build --step=build-plan-verify --file=\"{STATUS}\" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md\" --number=8 --post --title=\"Plan Verify\" --message=\"chore({FID}): plan-verify group {GROUP} attempt <attempt>\"
   ```
   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`, `fields.Loosened` as `VERIFY_LOOSENED`.
6. Tick the satisfied tasks in the plan. A task that the test-first report lists as a gap stays open:
   ```bash
   \"{BKIT}\" tasks tick --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --group={GROUP} --tasks=\"{VERIFIED_TASKS}\" --green=\"docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md\"
   ```
7. Route:
   - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
     ```bash
     \"{BKIT}\" tests plan-check --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --existence=report --log=\"{OUTBOX}/build-plan-check-{GROUP}.md\"
     ```
     Route — first match wins:
     - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
     - **If** exit non-zero → **Failure Path**.
     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
8. Run the group gate: the static checks and the unit tier. The integration tier runs once, at Step 12. The gate writes the trimmed log to the artifact:
   ```bash
   \"{BKIT}\" tests run --gate=bkit:gate:static-unit --log=\"{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log\" --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md\" --fid={FID} --file=\"{STATUS}\" --workflow=build --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
   ```
   Route:
   - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
   - **If** exit 81 → end turn, re-run this block.
   - **Else** → **Failure Path**.
9. Finish:
   ```bash
   \"{BKIT}\" steps finish --workflow=build --step=build-group-gate --file=\"{STATUS}\" --verdict={GATE_VERDICT} --scope=\"{TEST_SCOPE}\" --attempt-of=build-plan-verify:current --group={GROUP} --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md\" --clamp-log=\"build-group-gate-{GROUP}:<attempt>\" --number=8 --post --title=\"Group Gate\" --message=\"chore({FID}): group-gate group {GROUP} attempt <attempt>\"
   ```
10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
    ```bash
    \"{BKIT}\" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file=\"{STATUS}\" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
    **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
    - **Else** → **Failure Path**.
12. **Else** → **Failure Path**.

### 🔒 Gate 8 — Plan Verify

- [ ] Test-first reds audited (`tests green`)
- [ ] Group diff cut from its start commit (`context diff`)
- [ ] Subagent invoked (`@bkit-build-plan-verify`, no inline work)
- [ ] Mechanical checks passed (`steps finish`)
- [ ] Group gate verdict decided
- [ ] Unfixable gaps routed
- [ ] Exhausted fix loop asked in a session, or sent to the Failure Path

---
"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:781:26
    779|       ["Step 12", step12],
    780|     ] as const) {
    781|       expect(text, name).toMatch(/`GATE_RERUN` = true[^\n]*\*\*Decisio…
       |                          ^
    782|     }
    783|     // The re-run route sits after the `counters route` block, so the …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a green re-run gate continues without asking and clears GATE_RERUN
AssertionError: Step 8: expected '### 🧠 Step 8 — Plan Verify\n\n1. Der…' to match /clear[^\n]*`GATE_RERUN`|`GATE_RERUN`…/i

- Expected:
/clear[^\n]*`GATE_RERUN`|`GATE_RERUN` (is )?cleared/i

+ Received:
"### 🧠 Step 8 — Plan Verify

1. Derive the attempt the verify artifact is named for:
   ```bash
   \"{BKIT}\" counters derive --file=\"{STATUS}\" --workflow=build --step=build-plan-verify --group={GROUP} --position=next
   ```
   Hold `value` as `VERIFY_ATTEMPT`.
2. Audit the group's test-first reds:
   ```bash
   \"{BKIT}\" tests green --file=\"{STATUS}\" --workflow=build --group={GROUP} --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --log=\"docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md\"
   ```
   **If** exit >= 2 → **Failure Path**.
3. Cut the group's own diff, from the commit it started at:
   ```bash
   \"{BKIT}\" status route --step=build-group-start --group={GROUP} --file=\"{STATUS}\" --workflow=build
   ```
   Hold `parentSha` as `GROUP_BASE`. **If** `GROUP_BASE` = null → **Failure Path**.
   ```bash
   \"{BKIT}\" context diff --reset-log --base={GROUP_BASE} --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md\" --fid={FID} --step=build-plan-verify --attempt={VERIFY_ATTEMPT}
   ```
4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
   Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into the working directory with `cd \"{WORKTREE_PATH}\"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
   Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tasks-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
   Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
5. Finish:
   ```bash
   \"{BKIT}\" steps finish --workflow=build --step=build-plan-verify --file=\"{STATUS}\" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md\" --number=8 --post --title=\"Plan Verify\" --message=\"chore({FID}): plan-verify group {GROUP} attempt <attempt>\"
   ```
   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`, `fields.Loosened` as `VERIFY_LOOSENED`.
6. Tick the satisfied tasks in the plan. A task that the test-first report lists as a gap stays open:
   ```bash
   \"{BKIT}\" tasks tick --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --group={GROUP} --tasks=\"{VERIFIED_TASKS}\" --green=\"docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md\"
   ```
7. Route:
   - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
     ```bash
     \"{BKIT}\" tests plan-check --plan=\"docs/plans/{YYYYMM}/{FID}-plan.md\" --existence=report --log=\"{OUTBOX}/build-plan-check-{GROUP}.md\"
     ```
     Route — first match wins:
     - **If** `CONVERT_RETRY` is not held **and** exit 1 with a `matrix` or `supersession` problem → `CONVERT_RETRY` = the printed `problems` → Step 4 sub-step 2.
     - **If** exit non-zero → **Failure Path**.
     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
8. Run the group gate: the static checks and the unit tier. The integration tier runs once, at Step 12. The gate writes the trimmed log to the artifact:
   ```bash
   \"{BKIT}\" tests run --gate=bkit:gate:static-unit --log=\"{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log\" --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md\" --fid={FID} --file=\"{STATUS}\" --workflow=build --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
   ```
   Route:
   - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
   - **If** exit 81 → end turn, re-run this block.
   - **Else** → **Failure Path**.
9. Finish:
   ```bash
   \"{BKIT}\" steps finish --workflow=build --step=build-group-gate --file=\"{STATUS}\" --verdict={GATE_VERDICT} --scope=\"{TEST_SCOPE}\" --attempt-of=build-plan-verify:current --group={GROUP} --artifact=\"docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md\" --clamp-log=\"build-group-gate-{GROUP}:<attempt>\" --number=8 --post --title=\"Group Gate\" --message=\"chore({FID}): group-gate group {GROUP} attempt <attempt>\"
   ```
10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7, which briefs the next group or goes to Step 10 when none is open.
11. **If** `VERIFY_VERDICT` = CONCERNS **or** `VERIFY_VERDICT` = FAIL **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
    ```bash
    \"{BKIT}\" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file=\"{STATUS}\" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
    **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.verify.maxAttempts` is used up, so the owner decides.
    - **If** exit 1 → **Failure Path** — `build.verify.maxAttempts` is used up.
    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL **and** either `VERIFY_FIXABLE` = false **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
    - **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9, for a round that fixes only the fixable gaps.
    - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9. Fixable gaps and group-gate failures are always fixed, never asked.
    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left to fix the group gate, so the owner decides whether to try another round.
    - **If** exit 0 **and** `VERIFY_VERDICT` = PASS → **Failure Path** — no round is left to fix the group gate.
    - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — no round is left, so the owner decides the open gaps.
    - **Else** → **Failure Path**.
12. **Else** → **Failure Path**.

### 🔒 Gate 8 — Plan Verify

- [ ] Test-first reds audited (`tests green`)
- [ ] Group diff cut from its start commit (`context diff`)
- [ ] Subagent invoked (`@bkit-build-plan-verify`, no inline work)
- [ ] Mechanical checks passed (`steps finish`)
- [ ] Group gate verdict decided
- [ ] Unfixable gaps routed
- [ ] Exhausted fix loop asked in a session, or sent to the Failure Path

---
"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:795:26
    793|       ["Step 12", step12],
    794|     ] as const) {
    795|       expect(text, name).toMatch(/clear[^\n]*`GATE_RERUN`|`GATE_RERUN`…
       |                          ^
    796|       expect(text, name).toMatch(/without asking/);
    797|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > the Decision Pause checks a red gate against the base commit before composing
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:823:18
    821|     const pause = section(build, /Decision Pause/);
    822|     const base = commandLines(pause, "tests base");
    823|     expect(base).toHaveLength(1);
       |                  ^
    824|     expect(base[0]).toContain("tests base --log=");
    825|     const compose = commandLines(pause, "decisions compose");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a no-progress round after a red gate pauses with the loop question
AssertionError: expected '5. Check that the attempt changed sou…' to contain '`GATE_VERDICT` = FAIL'

- Expected
+ Received

- `GATE_VERDICT` = FAIL
+ 5. Check that the attempt changed source files, not only logs and ledgers:
+    ```bash
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    ```
+    Exit 1 means the attempt changed no source file.
+    Route — first match wins:
+    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
+    - **If** exit 0 → re-run Step 8.
+    - **Else** → **Failure Path**.
+
+ ### 🔒 Gate 9 — Plan Gaps Remediate
+
+ - [ ] Strategy computed before invocation
+ - [ ] Verify round read back on resume
+ - [ ] Subagent invoked (`@bkit-build-plan-gaps-remediate`, no inline work)
+ - [ ] Mechanical checks passed (`steps finish`)
+ - [ ] No-progress attempt routed
+
+ ---
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:845:19
    843|     const step9 = stepBody(build, /Step 9 — Plan Gaps Remediate/);
    844|     const route = step9.slice(step9.indexOf("5. Check that the attempt…
    845|     expect(route).toContain("`GATE_VERDICT` = FAIL");
       |                   ^
    846|     expect(route).toContain("`PAUSE_LOOP` = `verify`");
    847|     expect(route.indexOf("`PAUSE_LOOP` = `verify`")).toBeLessThan(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > a failing gate or suite test is never a pause item
AssertionError: expected '## 🤖 Decision Pause\n\n1. Derive the…' not to contain 'because it is always fixed'

- Expected
+ Received

- because it is always fixed
+ ## 🤖 Decision Pause
+
+ 1. Derive the decision number:
+    ```bash
+    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
+    ```
+    Hold `value` as `DECISION`.
+ 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
+    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
+    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
+    - For either `VERIFY_GAPS` list:
+      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
+      - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+      - A group-gate failure is never an item, because it is always fixed.
+    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
+      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
+      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
+      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
+      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
+    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items, because failing suites are always fixed.
+    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
+
+    Compose the file with these flags:
+    - `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
+    - `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
+    - **If** the pause comes from verify → add `--header=Group={GROUP} --header="Verify attempt={VERIFY_ATTEMPT}"` to `{HEADER_FLAGS}`.
+    - **If** the pause comes from holistic → add `--header="Holistic attempt={HOLISTIC_ATTEMPT}"` to `{HEADER_FLAGS}`.
+    - **If** the pause comes from tests → add `--header="Test attempt={TEST_ATTEMPT}"` to `{HEADER_FLAGS}`.
+
+    ```bash
+    "{BKIT}" decisions compose --out="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md" {HEADER_FLAGS} --items="{OUTBOX}/decision-items.json" --file="{STATUS}" {LOOP_FLAGS}
+    ```
+
+    **If** `decisions compose` exits non-zero → **Failure Path**.
+
+ 3. Read the runtime: `runtime assert`, then whether this point asks with `counters max`.
+    ```bash
+    "{BKIT}" counters max --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+    "{BKIT}" runtime assert --file="{STATUS}" --workflow=build
+    ```
+    Hold `ask` as `PAUSE_ASK` (false when headless), `runtimeHeadless` as `RUNTIME_HEADLESS`, `runtime` as `RUNTIME`. **If** `PAUSE_ASK` = true → step 4, asking every item. **Else** → take each recommendation:
+    ```bash
+    "{BKIT}" decisions apply --by=headless --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+    ```
+    Route:
+    - **If** exit 0 → narrate `Decision pause {DECISION}: recommendations taken without asking ({RUNTIME})` → step 5.
+    - **If** exit 4 **and** `RUNTIME_HEADLESS` = true → **Failure Path** naming each printed `hardBlockers` question.
+    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
+    - **Else** → **Failure Path**.
+ 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
+    - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+    - Look up facts in the repo, docs and tools, and never ask the owner for them.
+    - Decide nothing on the owner's behalf. "yes" takes every recommendation; it never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
+      ```bash
+      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-pause --field=reason=decision >/dev/null || exit 1
+      ```
+    - Record each owner reply before anything else:
+      ```bash
+      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-answer >/dev/null || exit 1
+      ```
+    - A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+    - Route — first match wins:
+      - **If** the owner says stop, **or** answers `Stop` → step 8.
+      - **If** the loop question is answered `Try again` → step 6. The items then need no decision.
+      - **If** any asked item still lacks a decision:
+        - Discuss the follow-ups with the owner.
+        - Record the wait with the `owner-pause` block above.
+        - End the turn and wait for the answers.
+      - **Else** → step 5.
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
+ 6. Write the decisions into the decision file:
+    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
+    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
+    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
+
+    **If** a `TEST EXCEPTION` was written → commit the plan alone first:
+
+    ```bash
+    "{BKIT}" ledgers commit --root="{WORKTREE_PATH}" --month={YYYYMM} --fid={FID} --mode=commit --path="docs/plans/{YYYYMM}/{FID}-plan.md" --message="docs({FID}): test exception accepted by owner bkit [skip ci]" >/dev/null || exit 1
+    ```
+
+    Set the route — first match wins:
+    - **If** `From: challenge` **and** either an item was answered `Fix now` **or** a task of `CHALLENGE_TASKS` was not an item:
+      - `DECISION_ROUTE` = `fix`.
+      - **If** `CHALLENGE_ROUND` = `CHALLENGE_MAX` already → `CHALLENGE_DONE` = true.
+      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
+    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
+    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
+    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
+    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
+    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
+    - **Else** → `DECISION_ROUTE` = `tests`. This covers `From: tests` and `From: challenge`.
+
+    Clear `PAUSE_LOOP`. **If** `From: verify`, `From: holistic` **or** `From: tests` → the owner chose to go on, so give that loop one more full allowance when its limit is used up. Below the limit, or with `ask` = false, the command grants nothing and exits 1; both exits go on:
+    - **If** `From: verify`:
+
+      ```bash
+      "{BKIT}" counters grant --name=VERIFY_ATTEMPT --of=build-plan-verify:current --group={GROUP} --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+      ```
+
+    - **If** `From: holistic` → count the allowance from the last holistic round that found no problems:
+
+      ```bash
+      "{BKIT}" counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-verify-holistic:current --since-clean --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+      ```
+
+    - **Else**:
+
+      ```bash
+      "{BKIT}" counters grant --name=TEST_ATTEMPT --of=build-run-tests:current --point={PAUSE_POINT} --file="{STATUS}" --workflow=build
+      ```
+
+    **If** exit >= 2 → **Failure Path**.
+
+    Record the decision and its route. The loop counts are not reset:
+
+    ```bash
+    "{BKIT}" steps finish --workflow=build --step=build-decision --file="{STATUS}" --attempt-of=build-decision:next --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-<attempt>.md" --field=route={DECISION_ROUTE} --number={PAUSE_STEP} --post --title="Decision Pause" --comment-body --message="chore({FID}): decision <attempt>"
+    ```
+
+ 7. Route — first match wins:
+    - **If** `DECISION_ROUTE` = `fix` → Step 7.
+    - **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
+    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
+    - **If** `DECISION_ROUTE` = `retry` → Step 13.
+    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
+    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
+    - **If** `DECISION_ROUTE` = `summary` → Step 15.
+    - **Else** → Step 12.
+ 8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+    - **If** `PUBLISH` = false → keep the record in the kept worktree, linked by branch, and NEVER pass `--push`:
+      ```bash
+      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
+      ```
+    - **Else** → push the record, but NEVER onto a branch with an open PR:
+      ```bash
+      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
+      ```
+    Route as **Failure Path** step 5 does, but go on to step 9 where it goes to its step 6.
+ 9. Release the lock. NEVER run `workflows fail`:
+    ```bash
+    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
+    ```
+    **STOP**, no further downstream steps.
+
+ ### 🔒 Gate — Decision Pause
+
+ - [ ] Decision file written (`decisions compose`)
+ - [ ] Questions asked in the session, or recommendations taken (`decisions apply --by=headless`)
+ - [ ] Hard blockers asked in a session, or sent to the Failure Path when headless
+ - [ ] Acceptances written only on the owner's approval
+ - [ ] Assumed acceptances left without a ledger row or `TEST EXCEPTION`
+ - [ ] Fix now tasks checked (`tests plan-check`)
+ - [ ] Used-up verify, holistic or tests loop given its allowance on a go-on answer (`counters grant`)
+ - [ ] Mechanical checks passed (`steps finish`), or run handed over and lock released
+
+ ---
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:854:23
    852|   it("a failing gate or suite test is never a pause item", () => {
    853|     const pause = section(build, /Decision Pause/);
    854|     expect(pause).not.toContain("because it is always fixed");
       |                       ^
    855|     expect(pause).not.toContain("because failing suites are always fix…
    856|     expect(pause).toMatch(/group.gate[^\n]*never an item/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > build > group-mode verify logs no gap for a test the group gate runs
AssertionError: expected '6. **If** `Mode` = `Group`:\n   - The…' to match /not a gap/

- Expected:
/not a gap/

+ Received:
"6. **If** `Mode` = `Group`:
   - The supplied briefs' task blocks are the work.
   - Judge them against the supplied group diff (the changes since the group started), not the whole branch.
   - **If** a brief has a `Deviations` section → judge the tasks it names as the owner's instructions there direct.
   - Check that every task field and gate maps to real changes in the codebase.
   - Find missing components, skipped steps and unimplemented edge cases.
"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:875:23
    873|     expect(end).toBeGreaterThan(start);
    874|     const groupStep = prompt.slice(start, end);
    875|     expect(groupStep).toMatch(/not a gap/);
       |                       ^
    876|     expect(groupStep).toMatch(/group gate/i);
    877|     expect(groupStep).toMatch(/Step 12|final run|holistic/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 257 passed (264)
   Start at  00:36:16
   Duration  629ms (tests 79%, import 12%, transform 6%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-GuCJIJ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
