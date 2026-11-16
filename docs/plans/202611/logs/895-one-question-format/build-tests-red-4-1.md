Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/895-one-question-format-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the loop question's recommendation reason matches its trigger" | red | failure: expected '3. Ask the owner in this session; pla…' to contain 'Recommended: A) Stop — the attempts s…' |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Loop Question states the engine's trend line, never a fixed claim" | red | failure: expected '## 🤖 Loop Question\n\n1. **If** `LOO…' not to contain 'left no fewer failures' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/question-option-format.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/question-option-format.test.ts

[test-timeout-budget] load average 12.2 on 10 cores: unit limits 10600ms per test, 21200ms per hook (x2.12)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (56 tests | 1 failed) 461ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 346ms
     ✓ the canonical layout letters every option and recommendation 4ms
     ✓ every option line in the workflows letters every entry 5ms
     ✓ every option line in the prompts, the templates and the authoring docs letters every entry 27ms
     ✓ every recommendation line in the workflows names a letter 4ms
     ✓ every recommendation line in the templates and the prompts names a letter 18ms
     ✓ every answer branch after a lettered question accepts the option letter 5ms
     ✓ every answer-routing step maps a lettered reply to its option name 4ms
     ✓ every open-question rule in the prompts names the lettered option form 6ms
     ✓ every open-question rule in the prompts index names the lettered option form 3ms
     ✓ the design review names every part the design prompts require 4ms
     ✓ the plan template letters every option of its Open Questions placeholder 1ms
   ✓ question option format: the rules fire on a synthetic list (10)
     ✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
     ✓ RED-PROOF: a letter only inside a trailing parenthesis does not satisfy the recommendation rule 0ms
     ✓ RED-PROOF: a second letterless Recommended: on one line fires 0ms
     ✓ RED-PROOF: an answer branch with no lettered-reply clause in its step fires 0ms
     ✓ RED-PROOF: an owner-confirm step defaulting to --confirm fires 0ms
     ✓ RED-PROOF: a second Options: list on one line still fires the option rule 0ms
     ✓ an option list whose entries span code spans letters every entry 0ms
     ✓ a lettered list of named options passes both rules 0ms
   ✓ question option format: the shared shape in § Human questions (7)
     ✓ the canonical shape puts each option on its own line with its effect 1ms
     ✓ the canonical shape carries a Default if unanswered line from the fixed set 1ms
     ✓ the canonical shape gives a hard blocker Recommended: none 0ms
     ✓ the canonical shape ends a message with the reply line and the one-by-one offer 0ms
     ✓ the canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason 0ms
     ✓ the Question layout bullet points to § Human questions 1ms
     ✓ RED-PROOF: an option line with no effect fires the option-line rule 0ms
   ✓ question option format: the reply-line clauses reach the workflows (3)
     ✓ no workflow carries the retired reply wording 1ms
     ✓ bkit-build: the Decision Pause yes line uses the shared reply wording 1ms
     ✓ every workflow that asks the owner states the question, each option and the recommendation's reason in plain English 1ms
   ✓ question option format: the build Decision Pause in the shared shape (4)
     ✓ bkit-build: every decision item option carries an effect 0ms
     ✓ bkit-build: the pause message shows the default line and Recommended: none 0ms
     ✓ bkit-build: a one-by-one reply asks the questions one at a time 0ms
     ✓ bkit-build: the one-by-one offer follows the asked count 1ms
   ❯ question option format: the debug questions in the shared shape (9)
     ✓ bkit-debug: the loop question gives each option its effect and the recommendation a reason 1ms
     × bkit-debug: the loop question's recommendation reason matches its trigger 11ms
     ✓ bkit-debug: every question shows a Default if unanswered line 0ms
     ✓ bkit-debug: the branch check asks a formatted question 0ms
     ✓ bkit-debug: the CI-run stop asks a formatted question 0ms
     ✓ bkit-debug: the branch check and CI-run question show Recommended: none and a Default if unanswered line 1ms
     ✓ bkit-debug: the CI-run question releases the lock only on Stop 0ms
     ✓ bkit-debug: the foreign-path stop shows the Action needed line 0ms
     ✓ bkit-debug: every question message ends with the reply line its point uses 3ms
   ✓ question option format: the ship questions in the shared shape (5)
     ✓ bkit-ship: the assumed-item question gives each option its effect 1ms
     ✓ bkit-ship: an assumed item is a hard blocker with Recommended: none 0ms
     ✓ bkit-ship: every question shows a Default if unanswered line 0ms
     ✓ bkit-ship: the merge question gives each option its effect 1ms
     ✓ bkit-ship: every question message ends with the reply line its point uses 1ms
   ✓ question option format: the design questions in the shared shape (6)
     ✓ bkit-design: the grill question gives each option its effect and the recommendation a reason 0ms
     ✓ bkit-design: the draft-scenario question gives each option its effect 0ms
     ✓ bkit-design: every question shows a Default if unanswered line 0ms
     ✓ bkit-design: the grill message ends with the reply line and the one-by-one offer 0ms
     ✓ bkit-design: a one-by-one grill round counts as one grill turn 0ms
     ✓ the one-by-one open-questions pass forbids the host question tool in design and plan 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: the debug questions in the shared shape > bkit-debug: the loop question's recommendation reason matches its trigger
AssertionError: expected '3. Ask the owner in this session; pla…' to contain 'Recommended: A) Stop — the attempts s…'

- Expected
+ Received

- Recommended: A) Stop — the attempts so far have not brought the failures down through a code change
+ 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. One message:
+    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
+    - The question — first match wins:
+      - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+      - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+    - The two answers, one per line:
+      ```text
+      A) Stop — the run ends here with a handover; the next run resumes here
+      B) Try again — one more attempt runs
+      ```
+    - The recommendation, first match wins:
+      - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
+      - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+    - `Default if unanswered: the run waits for you`.
+    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
+      Record the wait → end turn → wait for the answer:
+    ```bash
+    "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=loop >/dev/null || exit 1
+    ```

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:728:18
    726|       /`LOOP_LIMIT` = true[\s\S]{0,300}?Recommended: A\) Stop — the at…
    727|     );
    728|     expect(step).toContain(
       |                  ^
    729|       "Recommended: A) Stop — the attempts so far have not brought the…
    730|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 55 passed (56)
   Start at  10:42:02
   Duration  940ms (tests 67%, setup 27%, transform 4%, import 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mnnPFg/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 13.3 on 10 cores: unit limits 11150ms per test, 22300ms per hook (x2.23)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (275 tests | 1 failed) 669ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 5ms
     ✓ design calls only verbs and flags the CLI has 2ms
     ✓ plan calls only verbs and flags the CLI has 1ms
     ✓ build calls only verbs and flags the CLI has 5ms
     ✓ debug calls only verbs and flags the CLI has 5ms
     ✓ ship calls only verbs and flags the CLI has 2ms
     ✓ the call check reports an unknown verb and an unknown flag 1ms
     ✓ no workflow names a removed sub-plan flag 2ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 3ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 3ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 0ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 2ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 1ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 33ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 103ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 27ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 6ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 3ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 7ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 9ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 1ms
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 2ms
     ✓ build re-runs a red gate pause instead of asking it 1ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
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
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 1ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 1ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 1ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 1ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 1ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 2ms
     ✓ the last allowed challenge round never runs another 5ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 1ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 0ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 9ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 1ms
     ✓ Plan Current's skipped comment says no plan anchor 1ms
     ✓ issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 1ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 1ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 0ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 10ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 11ms
     ✓ a no-progress round after a red gate pauses with the loop question 1ms
     ✓ a failing gate or suite test is never a pause item 1ms
     ✓ group-mode verify logs no gap for a test the group gate runs 1ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 1ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 1ms
     ✓ a hard blocker answered Fix now with no direction is asked again 0ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 1ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 1ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 1ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 2ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 1ms
     ✓ plan: the Resume line calls `status resume` 1ms
     ✓ build: the Resume line calls `status resume` 1ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 3ms
     ✓ debug: the step table matches the step headings and their --step= calls 2ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 2ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 5ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ design never reads a verdict outside `steps finish` 1ms
     ✓ plan never reads a verdict outside `steps finish` 1ms
     ✓ build never reads a verdict outside `steps finish` 2ms
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
     ✓ ship /Failure Path/ writes the diff right before its agents 1ms
     ✓ ship /Step 5 — / writes the diff right before its agents 1ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 8ms
     ✓ build hands no agent a raw `git diff` 2ms
     ✓ debug hands no agent a raw `git diff` 0ms
     ✓ ship hands no agent a raw `git diff` 0ms
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
     ✓ plan and build hold the caps `repo info` prints 3ms
   ✓ plan (3)
     ✓ plan runs one review round 2ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
     ✓ carries draft formatting findings through review and update, with a strict final check 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 1ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 0ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 2ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 1ms
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
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 2ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 1ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 3ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ design: no wired-tracker block STOPs on a missing issue 0ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 1ms
     ✓ build: no wired-tracker block STOPs on a missing issue 4ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 2ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 1ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 5ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 6ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 5ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ design: the No issue bullet sits in a tracker true block 1ms
     ✓ plan: the No issue bullet sits in a tracker true block 1ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 1ms
     ✓ ship: the No issue bullet sits in a tracker true block 1ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 2ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 4ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 2ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 3ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 1ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ design: tracker gate items name the attempt, never its skip rule 3ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 0ms
     ✓ build: tracker gate items name the attempt, never its skip rule 1ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 2ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 2ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 2ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 0ms
     ✓ design Step 11 posts plans 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 3ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 1ms
     ✓ debug Steps 9 and 10 push nothing on dev 1ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 4ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ❯ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 1ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 2ms
     × debug Loop Question states the engine's trend line, never a fixed claim 139ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 12ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 2ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 1ms
     ✓ re-derives publish on resume 1ms
     ✓ warns when a non-LOCAL run resolves publish false 1ms
     ✓ skips push, PR and CI on a held close 1ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 1ms
     ✓ runs only the close gate on the held path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > fix loops ask only when the last round made no progress > debug Loop Question states the engine's trend line, never a fixed claim
AssertionError: expected '## 🤖 Loop Question\n\n1. **If** `LOO…' not to contain 'left no fewer failures'

- Expected
+ Received

- left no fewer failures
+ ## 🤖 Loop Question
+
+ 1. **If** `LOOP_ASK` = false → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking` → return to the calling step.
+ 2. Read the loop's progress:
+    ```bash
+    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
+    ```
+    **If** exit non-zero → **Failure Path**.
+    Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+    **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
+ 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. One message:
+    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
+    - The question — first match wins:
+      - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+      - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+    - The two answers, one per line:
+      ```text
+      A) Stop — the run ends here with a handover; the next run resumes here
+      B) Try again — one more attempt runs
+      ```
+    - The recommendation, first match wins:
+      - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
+      - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+    - `Default if unanswered: the run waits for you`.
+    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
+      Record the wait → end turn → wait for the answer:
+    ```bash
+    "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=loop >/dev/null || exit 1
+    ```
+ 4. Record the reply before anything else:
+    ```bash
+    "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-answer >/dev/null || exit 1
+    ```
+    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+    - **If** the answer is `Try again` **and** `LOOP_LIMIT` = true → give soak one more full allowance, clear `LOOP_LIMIT` → return to the calling step:
+      ```bash
+      "{BKIT}" counters grant --name=SOAK_ATTEMPT --of=debug-failure-soak:next --all-runs --point=debug.soak --file="{STATUS}" --workflow=debug >/dev/null || exit 1
+      ```
+    - **If** the answer is `Try again` → return to the calling step.
+    - **If** the answer is `Stop` → step 5.
+    - **Else** → answer the reply in plain text and ask Q1 again in the same message, then record the wait and end the turn:
+      ```bash
+      "{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=loop >/dev/null || exit 1
+      ```
+ 5. Create `docs/plans/{YYYYMM}/logs/{FID}/debug-handover.md` with the question, the answer, and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-debug {FID} resumes at Step 3.`
+    Then push the record and release the lock. NEVER run `workflows fail`:
+    ```bash
+    "{BKIT}" workflows handover --post --workflow=debug --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
+    "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
+    ```
+    Route:
+    - **If** the handover exits non-zero → **Failure Path**.
+    - **Else** → **STOP**, no further downstream steps.
+
+ ### 🔒 Gate — Loop Question
+
+ - [ ] Asked only with `ask` = true, not headless, and `trend` stuck or worse (`counters progress`), or the soak limit used up
+ - [ ] Used-up soak given its allowance on `Try again` (`counters grant`)
+ - [ ] Wait and reply recorded (`owner-pause`, `owner-answer`)
+ - [ ] Stop wrote a handover and released the lock
+
+ ---
+

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2155:22
    2153|     }
    2154|     expect(loop).toMatch(/taken without asking \([^\n]*\{LOOP_TREND_LI…
    2155|     expect(loop).not.toContain("left no fewer failures");
       |                      ^
    2156|   });
    2157|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 274 passed (275)
   Start at  10:42:06
   Duration  1.98s (tests 39%, transform 34%, import 15%, setup 12%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tT2sc0/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
