## #900 — Build: summary says FAIL after Fix now moved a group's gaps elsewhere (closed)

### Failing test or CI run

none yet. `.bkit/core/engine/commands/workflow/summary.test.ts:426` (`a group's failed execution stays unresolved when verification still has concerns`) asserts the current behaviour, so the fix changes that test's expectation for the case below.

### What happened

On a consumer repo's `/bkit-build` run, all 41 plan tasks were ticked and the Step 12 test run passed with 0 failures. Step 15's `workflows summary` still printed `Verdict: FAIL`, `Failures: 5`, so Step 15 sub-step 5 sent the run to the **Failure Path** with no PR.

All five failures came from two groups whose last verify round failed and then went to the Decision Pause:

- `build-plan-tasks (group 6) FAIL`, `build-plan-verify (group 6) FAIL`, `build-plan-gaps-remediate (group 6) FAIL`
- `build-plan-tasks (group 9) FAIL`, `build-plan-verify (group 9) FAIL`

At each of those pauses (`Question: VERIFY_GAPS`, `From: verify`), the owner answered every gap: some `Accept`, at least one `Fix now`. Because one answer was `Fix now`, Decision Pause step 6 set `DECISION_ROUTE` = `fix` (`.bkit/core/workflows/bkit-build.md:241`), and step 7 sent the run to Step 7 (`bkit-build.md:276`). The fix work became a new task in a new group (for group 9: a new task in a new group 10), and that new group's verify passed. The old group is never verified again.

`buildSummary` clears a failed group only when a later passing step from `RESOLVED_BY` has the **same** task group (`summary.ts:258`, the `answer` lookup with `taskGroupOf(r) === sub`). After a `Fix now`, the old group never gets that later pass, so its FAIL rows stay in `fails`. A run that took `Fix now` at any verify pause always summarises as FAIL, however the rest of the run went.

The accepted gaps were already counted separately as a concern (`12 item(s) accepted at the Decision Pause`), so dropping the group FAIL loses no signal.

### What should happen

A group's FAIL rows count as resolved when the group's last verify round went to a Decision Pause whose decision file answered every item, and:

- each `Accept` item stays a concern (as now, through the accepted-items count), and
- each `Fix now` item's new task is ticked and its own group's later verify passed.

With every group in that state, the summary verdict is CONCERNS (or PASS), and Step 15 goes on to Step 16 as the workflow intends. A decision that left an item unanswered, or a `Fix now` task that is unticked or never verified, keeps the group's FAIL. The existing guard stays: a bare `build-decision` row with no answered decision file does not clear anything (the `[execute, build-decision]` case in `summary.test.ts:426`).

### Steps to reproduce

1. Run `/bkit-build` on a plan until a group's verify round fails at its limit, so the Decision Pause asks `VERIFY_GAPS`.
2. Answer at least one item `Fix now` and the rest `Accept`.
3. Let the run finish: the new fix group verifies PASS, all tasks are ticked, and Step 12 passes.
4. Step 15's `workflows summary` prints `Verdict: FAIL` and lists the old group's `build-plan-tasks` / `build-plan-verify` / `build-plan-gaps-remediate` rows.

The same happens without the full workflow: pass `buildSummary` rows of a group-N `build-plan-tasks` FAIL, `build-plan-verify` FAIL, a `build-decision` row whose artifact holds `Decision: Fix now` and `Decision: Accept` items, and a group-N+1 `build-plan-tasks` PASS + `build-plan-verify` PASS.

### How often

Every build run where the owner answers `Fix now` on a verify-gaps Decision Pause.

### Affected area

- `.bkit/core/engine/commands/workflow/summary.ts`: `buildSummary`, the `answer` lookup (`:258`) and the Decision Pause block that reads `build-decision` artifacts.
- `.bkit/core/engine/commands/workflow/summary.test.ts:426`: its expectations for the decision case.
- `.bkit/core/workflows/bkit-build.md`: Decision Pause step 6 route (`:241`) and Step 15 sub-step 5. These are the behaviour the summary has to agree with, not necessarily what changes.

### Evidence

From the run's `build-summary.md`: `Plan tasks: 41 of 41 ticked`, `Failures: 5`, and every other reason listed is a concern. From its `status.jsonl`: group 6 ends with `build-plan-verify` attempt 2 `FAIL` (6 failures), then `build-decision` attempt 7, then the next group's tasks and verify `PASS`. Group 9 ends with `build-plan-verify` attempt 2 `FAIL` (1 failure), then `build-decision` attempt 10, then group 10 `build-plan-tasks` `PASS` and `build-plan-verify` `PASS`.

### References

- #899 — Build: owner's Fix now direction never reaches the build agents (https://github.com/cbartens/bkit/issues/899): another `Fix now` bug, different cause.
- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891): another case where an owner answer is not respected later in the run.
- `.bkit/core/workflows/bkit-build.md` § Decision Pause, § Step 15 — Summary.

/bkit-debug #900 [repro]

Extra context beyond the issue body:

1. When it happens. The Decision Pause step 5 "Fix now" rule (.bkit/core/workflows/bkit-build.md, around line 208) places the new task in one of two spots:
   - Inside group {GROUP} when that group stays within the task and test caps. The group is then verified again, and the summary already resolves it.
   - In a new group right after it when the caps would be exceeded. The old group is never verified again, so its FAIL rows stay. This is the bug.
   Write the reproducing test for the second case: group N execute FAIL, verify FAIL, a build-decision whose file has "Group: N", one "Decision: Fix now" item and one "Decision: Accept" item, then group N+1 execute PASS and verify PASS, and every plan task ticked. Expected verdict: CONCERNS. Actual: FAIL.

2. A second case to diagnose, with the same root rule. The owner answers only "Accept", the route re-runs Step 8, and verify comes back CONCERNS. The summary keeps the group's build-plan-tasks FAIL. summary.test.ts:426 asserts this on purpose, but no reason is recorded for it: there is no docs/decisions.jsonl row, and commit d7767f656 has no body. Decide whether a CONCERNS verify that lists only owner-accepted gaps should resolve the group, and record the decision either way.

3. Direction for the fix: give each Fix now answer a link the summary can read.
   - Decision Pause step 6 writes the new task's number under each "Decision: Fix now" line (for example "Task: 39").
   - parseDecisionItems (.bkit/core/engine/commands/workflow/decisions.ts:85) returns it.
   - buildSummary (.bkit/core/engine/commands/workflow/summary.ts, the answer lookup at :258) treats a group's failed rows as resolved when the group's last verify round is followed by a decision file whose "Group:" and "Verify attempt:" headers match it, and that file:
     - answers every item,
     - names, for each Fix now answer, a task that is ticked and passed a later verify (taskVerified in summary-findings.ts), and
     - leaves each Accept counted as a concern, as it is today.
   No parsing of free text such as "new task 39 in new group 10".

4. Decision files written before this change have no task line. Keep today's behaviour for them (the group stays FAIL), and say so in the summary's reasons.

5. Guards that stay: a build-decision row with no answered decision file clears nothing; an unanswered item keeps FAIL; a Fix now task that is unticked or never verified keeps FAIL.

6. Docs that change in the same commit, following .bkit/authoring.md:
   - .bkit/workflows.md, section "Summary / handover step", the "Resolution evidence" row "Failed group execution or gap remediation". It currently says "The latest passing verification of the same group", which is the rule that causes the bug.
   - The same row in .bkit/core/.bkit/workflows.md.
   - bkit-build.md Decision Pause step 6, for the new task line.

7. Out of scope: Fix now on challenge pauses (summary-findings.ts resolves those separately), Fix now on holistic and tests pauses, and how the owner's Fix now direction reaches the build agents. If you find the same bug on any of these, record it in docs/failures.jsonl and do not fix it here.

Merged into #903 as Part 2, with this issue's full text copied there. #903 runs after #891 ships, because #891's build is running now and changes the same Decision Pause code. #891, #899 and #900 are the same kind of bug: the owner answers at the Decision Pause, and a later step ignores the answer. Closing this one as not planned.

## #899 — Build: owner's Fix now direction never reaches the build agents (closed)

### Failing test or CI run

none yet

### What happened

During `/bkit-build #891`, challenge round 1 logged a hard blocker (TASK 16, `**Fixable:** false`). Its plan block put two design directions to the owner. At the Decision Pause the owner answered `Fix now` and picked one direction. The answer is written to `build-decision-1-3.md`.

The owner's direction never reached the agents that do the fix:

- Decision Pause step 5 says that for a challenge task answered `Fix now`, "keep that task open. It runs as it is." The task block is not reshaped. Only a new task block is shaped "by the owner's direction".
- So the plan block still holds the text written before the decision. Its `TEST FIRST` line describes the option the owner turned down ("fails on verdict `all` when the gate recorded a failed non-test stage").
- Step 7's `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` get no decision file in their `Read:` list. The **Owner decisions** contract also bars the orchestrator from restating the answer in `Context`.

As a result, the test writer logged TASK 16 `BLOCKED` ("the owner must decide the signal") and `tests red` recorded the test as `missing`. Run as written, the retry blocks the same way, and the task reaches the summary unfixed even though the owner already decided it.

### What should happen

When the owner answers `Fix now` on a `Fixable: false` challenge task and gives a direction, the fix round builds that direction. Two possible shapes:

- The Decision Pause rewrites the task block (its `DONE WHEN` and `TEST FIRST`) to the owner's direction, the same way it shapes a new task block.
- Step 7's agents (and Step 8 verify) get the matching `build-decision-{RUN}-*.md` in their `Read:` list.

A hard blocker answered `Fix now` with no direction needs a defined route too, since no agent can settle it alone.

### Steps to reproduce

1. Run `/bkit-build` on a plan until a challenge round logs a `Fixable: false` task whose block offers alternatives.
2. Answer that Decision Pause item `Fix now` and name one alternative.
3. Watch Step 7: the tests agent's brief holds the original block, and its `Read:` list has no decision file.

### How often

Every `Fix now` answer to a `Fixable: false` challenge task.

### Affected area

`.bkit/core/workflows/bkit-build.md`: Decision Pause step 5 (`Fix now` for a challenge task), Step 7 sub-steps 4 and 7 (`Read:` lists), and the Contract **Owner decisions** bullet. Also check the matching Step 9 / Step 10 prompts and `/bkit-debug`, which may share the pause.

### References

- #891 (run where it was seen): `docs/plans/202611/logs/891-build-gate-stuck/build-decision-1-3.md`, `build-plan-tests-6-log.md`, `build-tests-red-6-1.md`

Merged into #903 as Part 1, with this issue's full text copied there. #903 runs after #891 ships, because #891's build is running now and changes the same Decision Pause code. #891, #899 and #900 are the same kind of bug: the owner answers at the Decision Pause, and a later step ignores the answer. Closing this one as not planned.

## #846 — Make workflow verdicts reflect only unresolved findings (closed)

### Failing test or CI run

The existing summary unit tests explicitly expect `CONCERNS` after a failed review is addressed by a passing update. New regression tests will invert that expectation and cover unrelated passing steps.

### What happened

Workflow summaries retain historical concerns after the corresponding work has been resolved. In `.bkit/core/engine/commands/workflow/summary.ts`, a step's `CONCERNS` is always retained, and a `FAIL` answered by a later step is converted to `CONCERNS`. A rerun can also count an earlier summary verdict as an outstanding concern.

### What should happen

Final and subsequent verdicts reflect unresolved findings. Resolved findings remain visible in the append-only history and summary history.

- PASS when required checks pass and all in-scope findings are resolved and verified.
- CONCERNS when unresolved non-blocking findings, accepted limitations, or verification gaps remain.
- FAIL when required work or checks remain unsuccessful.
- A later PASS clears only findings within its documented scope, with matching task group, review round, or finding evidence where applicable. An unrelated PASS, a decision record, or a different group's verification never clears them.
- Recomputing a summary does not inherit its earlier derived verdict.

### Steps to reproduce

1. Record `plan-review` with `CONCERNS` or `FAIL`.
2. Address its findings and record `plan-apply-review` with `PASS`.
3. Run `bkit workflows summary --workflow=plan --file=...`.
4. Observe that the summary remains `CONCERNS`.

### Affected area

Summary resolution rules, current risks versus history, and tests/documentation shared by all provider workflows.

### Implementation plan

1. Add failing unit regressions for resolved reviews, same-group remediation, unrelated PASS, partial resolution, and repeated summaries.
2. Replace historical severity aggregation with scoped resolution using the existing workflow contracts and finding/task evidence.
3. Preserve original step outcomes and evidence in summary history; retain accepted limitations and open deferrals.
4. Update the workflow catalog, regenerate installed documentation and distribution, run targeted unit/integration checks and exercise the built CLI in a fresh scratch consumer.
5. Record the implementation commit and verification evidence here.

### Work done

- Confirmed the cause in the summary engine and existing unit expectations.
- Created an isolated worktree on `codex/unresolved-verdicts`.
- Baseline summary unit suite: 27 tests passed.
- Implementation in progress; nothing pushed or merged.

### References

Parent: [#99 — Friction triage](https://github.com/cbartens/bkit/issues/99), explicitly requested by the owner.

## #672 — Decision Pause: keep building work that doesn't need the answer (closed)

### Problem

When the build's Decision Pause from #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657 asks the owner a question, the whole build waits for the answer. That holds true even when most of the remaining work has nothing to do with the question. On #650 — Run workflows from the prompt alone, without issue, design or plan — https://github.com/cbartens/bkit/issues/650, waiting on the owner was about half the charged time of the longest step (#663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663, point 6 of the review comment).

### Outcome

While a question is open, the build carries on with the work that doesn't depend on the answer. It comes back to the paused work once the owner has decided.

### Success criteria

1. A pause names the tasks its question blocks. Tasks that don't touch them keep running.
2. The build only stops and waits when every remaining task is blocked by an open question.
3. An answer that arrives while other work is running is applied before the next task group starts.
4. Resume (`/bkit-build` on an `IN_PROGRESS` run) restores both the open questions and which work they block.

### Constraints and non-goals

- Needs task groups to decide what is independent. Today the smallest unit is a whole sub-plan. #668 — Build in task slices: symbol refs per task, 120k cap per agent — https://github.com/cbartens/bkit/issues/668 brings the slices this works on.
- The approval rule from #657 is unchanged: an acceptance is written only after the owner explicitly approves it.
- Works on every host, stack-agnostic.

### Decisions already made

None. Proposed on 2026-10-23 while reviewing #657.

### Open questions

- How does the build tell which tasks a question blocks: shared files, depends-on, or the slice the gap came from?
- Do the challenge reviewers wait until every question is answered, or review what's finished?

### References

- #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657
- #668 — Build in task slices: symbol refs per task, 120k cap per agent — https://github.com/cbartens/bkit/issues/668
- #671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671
- #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663 (review comment, point 6: https://github.com/cbartens/bkit/issues/663#issuecomment-6341117369)
- `.bkit/core/workflows/bkit-build.md` § Decision Pause, § Sub-Plan Loop — Steps 6-8

###### bkit:blocked-by start
- #657
- #668
###### bkit:blocked-by end

**The ledger rows this issue writes go through one verb: #680 "ledgers append: engine writes ledger rows with a minted ts" (https://github.com/cbartens/bkit/issues/680).**

When an answer arrives while other work runs and the decision is applied before the next task group, the `docs/decisions.jsonl` row, the `Test-order exception` line's companion row and any deferral written for the parked work go through `bkit ledgers append` (rows from a file, `ts` minted, `validate()` before any write, writer checked). #676 item 4 already names this split: a collect verb writes the decision file skeleton, `ledgers append` writes the rows. #680 is the second half.

Add #680 to the `bkit:blocked-by` block when the body is next edited (the block still lists closed #657 too).

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 2.2 and 2.6.

**Closing as not planned. #671 covers what this issue was for.**

#671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671 gives every question point an `ask` setting in `package.json`. With `ask: false`, a run in a session doesn't wait for you either. It carries on with the recommendation, marks any `Accept` as assumed, and ship asks you to confirm those before it merges. That removes the idle wait this issue was meant to fix, without having to work out which tasks a question affects. The design is in https://github.com/cbartens/bkit/issues/671#issuecomment-6392368785.

**What this issue would still have added:** with `ask: true`, the run waits for your answer instead of building the unaffected tasks in the meantime. Nobody has asked for that behaviour. It would also have needed #668's task slices.

## #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (open)

### Problem

Every fix loop (build verify, build tests, debug fix, ship merge) labels each fix round with a strategy: `STANDARD`, then `PIVOT`, then `FINAL`. The label moves one step per fix round (`nextStrategy` in `.bkit/core/engine/ledgers/status.ts`), and the fix agents read it to decide how to work. The labels cost more than they give:

- **`FINAL` almost never runs.** It is the third fix round. The shipped default limit is 2 for every fix loop (`CONFIG_DEFAULTS.asks` in `.bkit/core/engine/shared/settings.ts`), so it runs only after the owner grants more rounds. In the build run of #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891), the fix rounds ran `STANDARD` four times, `PIVOT` once and `FINAL` never (`docs/plans/202611/logs/891-build-gate-stuck/status.jsonl`).
- **In one agent the three labels say the same thing.** `bkit-debug-failure-remediate` is told to apply the diagnosis as written under all three.
- **`FINAL`'s question goes to the agent that is stuck.** "Is this the right problem, is the plan flawed, is the cause upstream?" is asked of `bkit-build-plan-gaps-remediate`, the agent already in the loop.
- **The required field is one more thing a workflow can forget.** `bkit-debug-failure-diagnose` returns `FAIL` with no diagnosis when its Context names no `Strategy`, and ship Step 11 names none (`docs/failures.jsonl` key `ship-failure-diagnose-invoked-without-strategy`).
- **One rule reads the label before it exists.** `.agents/context.md` says to use the `web` context block when `Strategy` = `PIVOT` / `FINAL`. Debug fetches context at Step 4 and first holds the strategy at Step 6.
- **A field nobody reads.** `finalSpent` is printed by `bkit counters progress` and read by no workflow.

The orchestrator needs no judgment for any of this: the engine prints the next strategy and the orchestrator copies it into the agent's Context.

### Outcome

A fix agent is told one thing: whether this is the first attempt or a retry. Every retry follows one rule. The step-back questions that `FINAL` asks go to a fresh agent, and not to the one in the loop.

### Success criteria

- No workflow passes a strategy label, and no prompt requires one.
- A retry prompt tells the agent to name why each earlier attempt failed, to not repeat it, and to return `BLOCKED —` with the reason when the plan or the problem is wrong.
- The step-back questions are asked by the question advisor (see References).
- A run that started with strategy labels resumes cleanly after the upgrade.
- The ship diagnose bug above cannot occur, because the field is gone.

### Constraints and non-goals

- **Limits stay.** The number of fix rounds and when the owner is asked do not change.
- **Migration.** Status rows written with a `strategy` field stay readable. `docs/migrations.md` gets a row when a migration is needed.
- **Provider parity.** The prompt changes ship for every host.
- **Docs in the same change:** `.bkit/workflows.md`, `.bkit/cli.md`, `.bkit/prompts.md`, `docs/testing.md` and `.agents/context.md` name the labels today.
- **Not in scope:** the loop limits, the trend calculation (`loopTrend`), and the owner questions themselves.

### Decisions already made

None. The owner asked whether `FINAL` is of any use and whether to keep only `STANDARD` and `PIVOT` (2026-11-10). That is open question 1.

### Open questions

1. **How many labels?**
   A) None. The engine tells a first attempt from a retry by the attempt number, every retry prompt carries the one rule above, and `FINAL`'s questions move to the question advisor. `strategy`, `nextStrategy`, `lastStrategy` and `finalSpent` are removed.
   B) Keep `STANDARD` and `PIVOT`, and drop `FINAL`.
   C) Keep all three.
   Recommended: A) — at the default limit only `STANDARD` runs before the owner is asked, so the labels mostly describe rounds that do not happen. B) and C) do not need the question advisor first, so they remove the blocker below.
2. **The `web` context block.** What triggers it once the labels are gone: every retry, or the diagnose agent's own call?
3. **`bkit-debug-abort-handover`.** Its attempts table has a `Strategy` column. Does it show the attempt number, or drop the column?

### References

- #905 — Model-independent orchestrators (https://github.com/cbartens/bkit/issues/905): parent.
- #904 — Question advisor: a fresh top-tier agent behind every owner question (https://github.com/cbartens/bkit/issues/904): takes over `FINAL`'s step-back questions under option A.
- #906 — Fetch Context: agents pick the search terms and log queries (https://github.com/cbartens/bkit/issues/906): its open question 3 is the same `web` block trigger.
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-diagnose.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md`, `.bkit/core/prompts/bkit-debug-abort-handover.md`
- `.bkit/core/workflows/bkit-build.md` Steps 9, 10, 13, 14; `.bkit/core/workflows/bkit-debug.md` Steps 6, 7; `.bkit/core/workflows/bkit-ship.md` Steps 11, 12
- `.bkit/core/engine/ledgers/status.ts` (`nextStrategy`), `.bkit/core/engine/commands/workflow/counters.ts` (`loopProgress`), `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`
- `docs/failures.jsonl` key `ship-failure-diagnose-invoked-without-strategy`

###### bkit:blocked-by start
- #904
###### bkit:blocked-by end

## #891 — Build: gate stuck on tests already red on dev, owner accept ignored (open)

## Rescope: no accepting red tests. Give better advice at the pause instead.

This replaces everything above it. The marker sits on the line above this heading, so the workflows read this comment and nothing earlier.

### What happened

A consumer's `dev` had 3 red unit tests that the build's branch did not cause. A clean `dev` checkout shows the same 3 failures: `Tests 3 failed | 8 passed (11)`. They were the consumer's own: a dead-code registry missing two new files, and a suppression-count ceiling that wasn't raised. `/bkit-build` built and verified task group 1, then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept`, and the owner took it. The gate failed again on the same tests. The second pause offered only `Try again` (a round that can't change anything) or `Stop`. Groups 2-6 never started.

### The shape stays

A failure a fix round can fix → `Try again`. A failure no round can fix → say so plainly, recommend `Stop`, and have the owner fix the cause first (here, `dev`) and then resume. That is the workflow's shape today. This issue does **not** add a way to accept red tests and build past them.

That is why the earlier design is dropped: accepted-failure records, `$BKIT_ACCEPTED_TESTS` passed into every test runner, and the same list passed through the pre-push hook. It only gets the branch *built*. CI on the PR runs the same red tests, so `/bkit-ship` still can't merge until `dev` is fixed. A lot of machinery for a branch that can't merge anyway.

### What's actually wrong (found by reading the code, not reproduced)

1. **"Try again or not" never asks why a test fails.** The loop question recommends from a trend alone (`loopTrend` / `loopProgress`, `.bkit/core/engine/commands/workflow/counters.ts:257-334`). After the first round it always recommends `Try again`. After that it recommends `Try again` only when there are fewer problems than the first round and the source changed in between; otherwise `Stop` / `Decide`. A test that also fails on `dev` can't be fixed by any round on this branch, and nothing checks for that.
2. **The pause's numbers ignore the group gate.** The verify loop's progress block counts the verify agent's problems, not the gate's failing tests (`LOOPS.verify.check` = `build-plan-verify`, `.bkit/core/engine/commands/workflow/decisions.ts:179`). In this run verify passed both rounds, so the pause showed "Problems after each round: 0 → 0" while 3 tests were red. The reason it gave ("another round is unlikely to close the remaining items") says nothing useful.
3. **"Stop, fix `dev`, resume" can loop on the old pause.**
   - Picking up the fix works in worktree mode. On every resume, Step 2's `bkit worktrees setup` fetches `dev` and rebases the branch onto it (`.bkit/core/engine/commands/workflow/worktrees.ts:1010`). In adopt mode (`RUNTIME_WORKTREES=false`, the cloud default, working on the branch in place) there is no rebase, so the owner must merge `dev` into the branch by hand.
   - The resume then goes straight back to the open pause (`.bkit/core/workflows/bkit-build.md:43`). That pause still shows the gate result from before the fix, and with no items it offers only `Try again` or `Stop`.
   - `Try again` starts a fix round (Step 9). The gate is now green, so the fix agent changes nothing, and a round that changes nothing goes back to the Decision Pause (`.bkit/core/workflows/bkit-build.md:820`). No answer re-runs the gate on its own, so the build loops on that pause.
4. **The `Accept` the owner was offered isn't in the workflow.** The Decision Pause says a group-gate failure is never an item (`.bkit/core/workflows/bkit-build.md:140`; the same goes for Step 12's suites, `:147`). So either the orchestrator made the item up, or the verify agent logged the gate's failing tests as gaps. The run's logs weren't available, so which one is not known.

### Scope

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. No new options or owner answers.

1. **Check whether the failing tests also fail on the base commit.** At a pause after a red group gate (Step 8) or a red final run (Step 12), re-run only the failing test files on the commit the branch started from. If a CI run on that exact commit exists, use it instead. Then:
   - **all failures also red on base** → recommend `Stop`: "these N tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." In adopt mode, add: "merge `dev` into the branch before resuming."
   - **some** → say so: "a round can fix 2 of 5; the build will still stop on the 3 from `dev`." The owner chooses between `Try again` and stopping now.
   - **can't tell** (no JUnit report, no `bkit:test:file` script, no base run possible) → today's trend rule, and say the cause is unknown.
   - `Try again` stays offered in every case; only the recommendation and the wording change.
   - Never use "the last CI run on `dev`" as evidence. Most bkit commits are `[skip ci]`, so that run is often many commits old.
   - Cost: in bkit, a detached checkout of an older commit, an offline `pnpm install` and one test file took about 8 s (1 s + 2 s + 5 s). Installing dependencies is most of it and will be slower in heavier repos. It runs once per pause, not once per round.
   - `bkit tests run` doesn't record which file each failing test is in today. The check has to read that from the gate's JUnit report (`classname` / `file`).
2. **Count the gate's failing tests in the pause's progress numbers**, so the trend reflects the gate, not just verify.
3. **On a resume into a pause about a red gate, re-run the gate first.** That means Step 8 for a group gate, Step 12 for the final run. If it passes, carry on without asking. If it's still red, ask again with fresh numbers. Do not add a rebase or merge of `dev` for adopt mode: the pause text tells the owner to merge it instead.
4. **Never offer `Accept` for a group-gate or suite failure**, and make the verify agent's instructions say gate failures are not verify gaps.

Out of scope: `/bkit-debug`. It often runs to fix exactly such a failure, so a "came from `dev`, can't be fixed here" label would be wrong when that failure is the job. Also out of scope: `/bkit-ship`, which still needs green CI as today.

### The existing plan

`docs/plans/202611/891-build-gate-stuck-plan.md` on `dev` and the 4 decision rows and 5 deferral rows it added (`e452f6993`) assume the dropped accept design. A re-plan replaces the plan and corrects or closes those rows. Two exceptions:
- The deferral "Run a gate's failing cases on the base commit at the Decision Pause …" is now in scope as scope item 1, without the `Accept` part.
- The deferral "Document that a runner-less test file needs one JUnit case per planned test name" is unrelated and stays open.

Next step: `/bkit-plan #891`.

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

Follow-up: #903 — Build: owner's Fix now answer is lost after the Decision Pause (agents, summary).

It holds #899 and #900, both closed as not planned in favour of #903. They are the same kind of bug as this issue: the owner answers at the Decision Pause, and a later step ignores the answer. #903 is marked blocked by this issue and runs after it ships, so this build's scope stays as it is.

When this issue ships, add anything from its body that the build left undone to #903 (its Part 3).

## #902 — Show every choice made without asking in each workflow's summary (open)

### Problem

When an ask point is set to `"ask": false` in `package.json` `bkit.workflows.<workflow>.<point>`, or the run is headless (on GitHub Actions, where nobody can answer), the workflow takes the recommended answer and carries on. Some of those choices reach the owner at the end of the run. Most do not.

Every workflow ends the same way: `bkit workflows summary` writes `{workflow}-summary.md`, and `workflows close --final-return` prints that file word for word as the last message (`.bkit/core/engine/commands/workflow/workflows.ts:1856`). The summary is also posted to the issue as a comment. So if a choice isn't in the summary, the owner never sees it unless they read the run's log files.

What each workflow does with a choice it takes without asking today:

<!-- prettier-ignore -->
| Where | What gets chosen without asking | Where it is written down | In the end summary? |
| --- | --- | --- | --- |
| `/bkit-design` Step 3 Grill (`design.grill`) | Every interview answer: the recommendation is taken as the answer | `design-grill-{RUN}.md` under `### Assumed, not confirmed`, plus the line `No human interviewed this run`; copied into `design-input-{RUN}.md`; posted as the grill step's comment | **No.** `summary.ts` does not read the grill file. Ship does not ask about these either (`.bkit/workflows.md` § `/bkit-design`, Grill row) |
| `/bkit-build` Decision Pause, `Accept` items (`build.verify`, `build.challenge`, Step 15 `UNPROVEN`) | Accept a gap, finding or unproven test | `build-decision-{RUN}-{K}.md`: `Decision: Accept (assumed) — … (ask:false\|headless, …)` (`decisions.ts:263`) | **Yes**: verdict held at CONCERNS, one `- Assumed, not confirmed:` line each under `## Risks and Action Items` (`summary.ts:307-319`, `:519`). Ship asks the owner to confirm each one |
| `/bkit-build` Decision Pause, `Fix now` items | Send a finding or gap back to be fixed | Same decision file: `Decision: Fix now — recommended; applied without asking ({runtime})` (`decisions.ts:264`) | **No.** The summary only counts lines starting `Accept` (`summary.ts:304`) |
| `/bkit-build` Decision Pause, loop question (`VERIFY_GAPS` / `TESTS_LOOP` with `Try again`) | Run another fix round | Same decision file | **No.** Only shows indirectly as an extra round under `## Steps` |
| `/bkit-debug` Loop Question (`debug.fix`, `debug.soak`) | Run another fix or soak attempt when progress is stuck or getting worse | Nowhere. The orchestrator only says it in chat: `debug {point}: attempt {n} of {max}, taken without asking` (`bkit-debug.md` Loop Question, sub-step 1) | **No.** Headless, nobody reads the chat |
| `/bkit-ship` Step 11 fix round (`ship.merge`) | Run a fix round when the diagnosis is not `PASS` | Nowhere. Chat only: `ship merge: attempt {n} of {max}, fix round taken without asking ({cause})` (`bkit-ship.md:861`) | **No** |
| `/bkit-ship` Confirm Assumed Items (headless only) | Leave build's assumed accepts unconfirmed and merge | One `needs-decision` row each in `docs/deferrals.jsonl` | **Yes**: `## Ship Completed with Assumed Items` (`summary.ts:493-501`) |
| `/bkit-plan` | Nothing. Plan has no ask point; its open questions are listed in the plan summary and asked only if the owner opts in | — | — |

Reaching a used-up limit with `ask` false goes to the Failure Path, which writes a handover. That is already shown, so it is not part of this gap.

So the same kind of event (a recommendation taken because nobody was asked) has four different outcomes: listed in the summary, written to a file nobody reads at the end, said once in chat, or not written at all. The owner cannot answer "what did bkit decide for me in this run?" from the final message.

### Outcome

Every choice a workflow takes on the owner's behalf, because `ask` is false or the run is headless, is written down once in the same place and listed in one section of that workflow's end summary. The owner can read the final message, or the summary comment on the issue, and see every such choice: what was decided, why it was recommended, and whether it still needs their confirmation.

### Proposed approach

1. **One record per choice.** Add one status row type, `auto-decision`, to the event types in `.bkit/workflows.md` § `status.jsonl` — workflow state SoT: `{type, workflow, at, point, question, chose, reason, why: "ask:false"|"headless", runtime, artifact?, needsConfirm}`. One engine command writes it (for example `bkit decisions auto`, or have `decisions apply --by=headless` write it), so the orchestrator records the choice instead of only narrating it. The chat line can stay as well.
2. **Write it at every point in the table above:**
   - build Decision Pause: `decisions apply --by=headless` writes one row per item it settles (`Accept`, `Fix now`, `Try again`), pointing at the decision file
   - debug Loop Question sub-step 1: one row when `LOOP_ASK` is false and the question would otherwise have been asked
   - ship Step 11: one row when `MERGE_ASK` is false and the diagnosis is not `PASS`
   - design Grill: one row per answer filed under `Assumed, not confirmed`, or the summary reads that heading from `design-grill-{RUN}.md`
3. **One summary section.** `workflows summary` renders `## Decisions Taken Without You` right after `## Verdict` for all five workflows, one line per row: the ask point, what was chosen, the reason, `ask:false` or `headless`, and the file to open. Items that need confirmation (`Accept (assumed)`, grill assumptions) say so. Build's `- Assumed, not confirmed:` lines in `## Risks and Action Items` move into this section, so nothing is listed twice.
4. **Roll-up at ship.** Ship is the last step for a feature, so the ship summary also lists the auto-decisions from the feature's earlier design, build and debug runs. In a fully automatic chain (`bkit:auto` or `bkit-cloud.yml`), the owner then sees them all once, at the end.
5. **Docs in the same change.** Add a "Recorded and shown" bullet to `.bkit/workflows.md` § Ask points, update each workflow's checklist, and add `summary.test.ts` cases per workflow.

### Success criteria

- With every ask point set to `"ask": false`, a run of each of design, build, debug and ship that hits an ask point ends with a `## Decisions Taken Without You` section listing every choice taken at that point.
- No ask point routes past a question without writing a record; a test fails if a new ask point skips it.
- A headless run's issue comment shows the same section as the session's final message.
- The ship summary lists the auto-decisions from all of the feature's earlier runs.
- Runs started before the change (status files with no `auto-decision` rows) still produce a summary.

### Constraints and non-goals

- How each point routes stays the same: `ask: false` and headless keep taking the recommendation. Only what is recorded and shown changes.
- No new `package.json` setting.
- Works on every host (Claude, OpenCode, Codex, Cursor, Antigravity): the record is written by the engine, not by any host-specific mechanism.
- Choices that never ask even when `ask` is true (another debug attempt while progress is improving, a ship fix round after a `PASS` diagnosis) are routine. They already show as extra rounds under `## Steps` and are out of scope unless the open question below decides otherwise.
- Not in scope: how questions are worded when they are asked. That is #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895).

### Decisions already made

- `docs/decisions.jsonl` key `671-ask-points-hard-limits-assumed-accepts`: headless or `ask: false` takes the recommendation and records any Accept as assumed, and ship asks the owner to confirm it. This issue keeps that and extends the recording to every other kind of choice.
- `docs/decisions.jsonl` key `design-grill-step`: unanswered grill questions are recorded `Assumed, not confirmed` "so designers can tell a human decision from an agent guess". No recorded decision says why grill assumptions are left out of the design summary, or why ship does not ask about them.

### Open questions

1. **Should an auto-retry or auto-`Fix now` change the verdict?** Recommended: no. Only items that need confirmation (assumed accepts, grill assumptions) hold the verdict at CONCERNS; retries and `Fix now` are listed but leave the verdict alone. Otherwise every `ask: false` run reads CONCERNS.
2. **Should ship ask the owner to confirm grill assumptions, like build's assumed accepts?** Recommended: list them at ship but don't ask, because the plan's `Acceptance Scenario confirmed` box already puts the design in front of the owner.
3. **Should the routine continues in Constraints (which never ask) be listed too?** Recommended: no, to keep the section to real decisions.
4. **Status row or decision file as the single record?** Recommended: a status row, because every workflow already has a status file and `workflows summary` already reads it; the build decision file stays the detailed record and the row points at it.
5. **Order with #895?** Both change `.bkit/core/engine/commands/workflow/decisions.ts`. #895's `Default if unanswered: taken as A when nobody can be asked` line describes exactly the choice this issue records, so the two should use the same words.

### References

- #895 — One question format for every owner question in the workflows
- #860 — Move deterministic bookkeeping and safe recovery into the engine
- `.bkit/workflows.md` § Ask points
- `.bkit/core/engine/commands/workflow/summary.ts` (`acceptItems`, `## Risks and Action Items`, `## Ship Completed with Assumed Items`)
- `.bkit/core/engine/commands/workflow/decisions.ts` (`applyRecommendations`)
- `.bkit/core/workflows/bkit-design.md` Step 3 Grill
- `.bkit/core/workflows/bkit-build.md` Decision Pause
- `.bkit/core/workflows/bkit-debug.md` Loop Question
- `.bkit/core/workflows/bkit-ship.md` Step 11, Confirm Assumed Items

###### bkit:blocked-by start
- #895
###### bkit:blocked-by end

### Overlap with #895

#895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895) covers the other half of the same moment. It is about how a question looks when bkit asks the owner. This issue is about what bkit records and shows when it doesn't ask. Its plan exists: `docs/plans/202611/895-one-question-format-plan.md`. That plan changes only the question layout, not when workflows pause or what an answer does (plan lines 117 and 311), so the two don't conflict in behaviour.

Where they touch:

1. **The same code.** #895 changes build's decision file layout to one line per option and rewrites `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`. This issue needs `summary.ts` to read more items from those same files, through that same function. Building this first would build on a layout #895 replaces.
2. **The same promise.** #895 adds a `Default if unanswered:` line to every question (for example "the run waits for you; taken as A when nobody can be asked", plan line 102). This issue's `## Decisions Taken Without You` section is the record that it happened. Use #895's wording for each `auto-decision` row's `why` and `chose`, so the question and the summary line match. This settles open question 5.
3. **Ship's assumed items.** #895 makes each Confirm Assumed Items question `Recommended: none — {why}` (plan line 185). The summary section here should describe those items the same way.

Not covered by #895, so this issue still owns it:
- recording debug and ship retries that today are only said in chat
- showing the interview answers nobody gave in the design summary
- the new summary section
- the roll-up at ship

Proposed order: build this after #895 lands. #895 is listed under References but not yet as a blocker.

### Owner decisions on the open questions (design no longer needed)

All five open questions are settled, each as recommended:

1. **Verdict:** automatic retries and automatic `Fix now` choices are listed but leave the verdict alone. Only items that need confirmation (assumed accepts, assumed grill answers) hold it at CONCERNS.
2. **Grill assumptions at ship:** listed in the ship summary, not asked. The plan's `Acceptance Scenario confirmed` box already puts the design in front of the owner.
3. **Routine continues** (the ones that never ask, even with `ask` on): not listed.
4. **Single record:** one `auto-decision` row in `status.jsonl`. The build decision file stays the detailed record, and the row points at it.
5. **Wording and order with #895:** each row's `why` and `chose` use #895's `Default if unanswered:` wording, so the question and the summary line match. **#895 is now a blocker** (blocked-by block added to the description). This issue can be planned now; build waits until #895 lands, because #895 rewrites the decision-file layout and `parseDecisionItems`, which this issue's summary reads.

**Scope change from #911:** #911 removes ship Steps 11 and 12, so the table's `/bkit-ship` Step 11 row and approach item 2's "ship Step 11" bullet no longer apply. The plan follows whichever state of `bkit-ship.md` is on `dev` when it runs. If #911 has not landed by then, the plan says how the two changes are ordered.

Next step: `/bkit-plan 902`.

This issue's `bkit:blocked-by` block already lists [#895 — One question format for every owner question in the workflows](https://github.com/cbartens/bkit/issues/895). I added the matching GitHub "blocked by" link, so the board and the issue sidebar show the dependency too. The body is unchanged.

## #904 — Question advisor: a fresh top-tier agent behind every owner question (open)

### Problem

Two friction points, as the owner describes them:

1. bkit asks the owner questions and recommends an answer, but the recommendation is not always written by a strong agent. The owner switches the session to a stronger model to get help answering.
2. Design and plan end with open questions. The owner often doubts that all of them need an owner's call, opens a new thread and asks a stronger model to help answer them.

Both are the same manual step: a fresh, strong agent looks at each question before the owner answers it. Nothing in bkit does that.

What exists today:

- **Build's per-item recommendations are written by the Sonnet orchestrator.** At Decision Pause step 2 the orchestrator writes each item's `recommended` and `reason` into `decision-items.json` itself, for verify gaps and challenge findings. Headless runs then apply those recommendations without anyone seeing them (`decisions apply --by=headless`).
- **Loop questions recommend from the failure count alone.** `bkit counters progress` turns the count per round into a trend, and `decisions compose` recommends `Try again` or `Decide` from that trend. Debug's Loop Question and ship's Merge Question recommend `Stop` in fixed wording.
- **Design and plan open questions are written by the agent that writes the document.** `bkit-design-generate`, `bkit-design-update`, `bkit-plan-generate` and `bkit-plan-update` (all Opus at high effort) list them while writing the document. No step tries to close a question before it reaches the owner at the final return (design Step 12, plan Step 8).
- **In the build verify loop, the "step back" question is asked of the agent that is stuck.** The `FINAL` strategy ("is this the right problem, is the plan flawed, is the cause upstream?") goes to `bkit-build-plan-gaps-remediate` (Sonnet), the agent already in the loop. The build test loop, the debug fix loop and the ship merge loop put it to `bkit-debug-failure-diagnose` (Opus, a new agent each round). `FINAL` is the third fix round, and the shipped default limit is 2, so it runs only after the owner grants more rounds.
- **A real case.** In #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891), the pause offered an `Accept` option the workflow does not define, then kept offering `Try again` where no round on the branch could change the result. Its plan traces that to four mechanical defects and fixes them. It is not yet a case of an agent bending work to fit (see Open questions).

### Outcome

One agent, the question advisor, looks at every question that needs judgment before it reaches the owner. It starts with a fresh context and runs on the top judge tier. For each question it does one of two things:

- **Settles it** from the code, the docs, the ledgers or the web. The question then does not reach the owner. It is recorded as an assumption with its evidence, and the owner can overrule it.
- **Recommends**, writing the recommendation and the reason the owner sees.

A stuck fix loop is one of those questions ("try again, or stop?"). The advisor answers it with the step-back checklist. When it recommends another round, it also writes the brief the next fix agent reads.

Question points, numbered as in the audit table of #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895):

<!-- prettier-ignore -->
| # | Question point | Advisor | Note |
| --- | --- | --- | --- |
| 1-2 | Design Step 3 Grill | Open question | A live interview over several turns. |
| 3 | Design open questions | Yes | A new step after the last `bkit-design-update`, before close. |
| 4 | Plan open questions | Yes | A new step after the last `bkit-plan-update`, before close. |
| 5 | Build Decision Pause | Yes | `VERIFY_GAPS` and `CHALLENGE` items, and the verify, holistic and tests loop questions. `UNPROVEN` keeps its fixed recommendation. |
| 6 | Debug Loop Question | Yes |  |
| 7-9 | Debug stops | No | They ask for a branch, a reference or a commit. |
| 10 | Ship Confirm Assumed Items | No | Only the owner can accept, so no recommendation is given. |
| 11 | Ship Merge Question | Open question | The diagnosis is already written by an Opus agent. |

### Success criteria

- Design and plan: before close, each open question is either settled (moved to the assumptions with its evidence) or kept with the advisor's recommendation. The final return lists only the kept questions.
- Build Decision Pause: every item's `recommended` and `reason` come from the advisor's report, and the orchestrator writes none of them itself.
- Loop questions: the recommendation and its reason come from the advisor's report. After `Try again`, the next fix agent reads the advisor's brief.
- Headless runs apply the advisor's recommendation, and every settled or assumed item stays visible afterwards, as `Accept (assumed)` items are today.
- The advisor uses one prompt and one report format at every point, and its questions use the shared question shape from #895.

### Constraints and non-goals

- **The advisor settles facts and recommends; it decides nothing.** No new pause options, and no way past a red test. The owner answers every kept question. "NEVER hand questions or acceptances to subagents" stays: the advisor never talks to the owner, and the orchestrator relays its report.
- **A settled question cites its evidence** (`file:line`, a `docs/decisions.jsonl` key, a URL). A question about preference, risk, scope, or a major change (`.agents/rules.md` § Major changes) is always kept for the owner.
- **Limits stay.** The advisor never grants extra rounds and never resets a count.
- **Stack-agnostic and provider parity.** The agent ships for every host, pinned in the same tier as the other judges for each provider. Where a provider's judges and fix agents share one model, the gain is the fresh context only.
- **One question format.** The advisor's output uses the shape #895 defines, and adds no second one.
- **Not in scope:** question points 7-10 above; the strategy labels, which model each orchestrator runs on, and who picks the search terms in Fetch Context (see References).

### Decisions already made

- **One agent for every judgment question.** The stuck-loop escalation is one use of the question advisor, not a separate agent. (Owner, 2026-11-10.)
- **Model.** The top judge tier: `claude-opus-5-5` at `high` on Anthropic. `high` is the ceiling set by `docs/decisions.jsonl` key `205-effort-opus-high-sonnet-medium-no-xhigh`; running it higher needs a new decision row.
- **Facts in, not accounts.** The advisor reads the goal document (design, plan or issue), the evidence files, the diff since the base commit, and the attempt history as facts only: verdicts, counts, `BLOCKED` reasons and the owner's `Decision:` lines. It does not read the agents' own accounts of what they did, because those pull a reviewer toward agreeing.
- **Pauses relay the advisor.** The orchestrator copies `recommended` and `reason` from the advisor's report, and `decisions compose` takes the loop question's recommendation from it. The owner's `Decision:` lines override the advisor's brief.
- **Order.** #891's base-commit check runs before the advisor, because it is cheaper.

### Open questions

1. **Design and plan: who closes the open questions?**
   A) The advisor, as a step before close, plus one definition of "a question only the owner can answer" in `.bkit/authoring.md` § Human questions that the four writer prompts also follow.
   B) Only tighten the four writer prompts.
   Recommended: A) — four agents add questions, the last of them at the end of a long writing job, so the last look has to be a separate step, and that step is the advisor's job.
2. **Does the advisor run when no question is pending?** For example a loop that continues inside its limit with `ask` off, or an agent that returns `BLOCKED —`.
   A) No: it runs where a question is asked or answered headless.
   B) Yes, on engine triggers: a `stuck` or `worse` trend, a round that changed nothing, the same gap coming back, a `BLOCKED —` return.
   Recommended: A) for the first version.
3. **Design Grill (points 1-2).** Does the advisor run on every interview turn, prepare the decision tree once before the first turn, or stay out? In a headless run the orchestrator takes its own recommendations as the answers (`.bkit/core/workflows/bkit-design.md:256-259`), so there the advisor would be the only second look.
4. **Debug and build tests.** When the advisor recommends `Try again`, does its brief replace that round's diagnosis or feed it?
5. **Going back a phase.** Is "go back to `/bkit-plan` or `/bkit-design`" a `Stop` whose handover names the next command, or a new route?
6. **Ship Merge Question (point 11).** Is the advisor worth a call there?
7. **Cost.** One advisor call per round of questions, or one per question? Is there a cap per run?
8. **Evidence.** No stuck run has been checked for an agent bending work to fit. In #891's own build run (`docs/plans/202611/logs/891-build-gate-stuck/status.jsonl`), every verify gap closed in one fix round, and the only pauses were the red tests on `dev`.
9. **Name.** `bkit-step-back` no longer describes the agent.

### References

- #905 — Model-independent orchestrators (https://github.com/cbartens/bkit/issues/905): parent, row 1 of its table. It also holds the question of which model each orchestrator runs on.
- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891): its base-commit check runs before the advisor, and both change the build Decision Pause and `.bkit/core/engine/commands/workflow/counters.ts`.
- #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895): the audit table of question points and the shared question shape. It rewrites `decisions compose`, `decision-items.json`, debug's Loop Question and ship's Merge Question.
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (https://github.com/cbartens/bkit/issues/907): hands `FINAL`'s step-back questions to the advisor, and is blocked by this issue.
- #906 — Fetch Context: agents pick the search terms and log queries (https://github.com/cbartens/bkit/issues/906)
- `.bkit/prompts.md` § Orchestrators, § Models
- `.bkit/authoring.md` § Human questions
- `.bkit/core/workflows/bkit-build.md` § Decision Pause, Step 8, Step 9
- `.bkit/core/workflows/bkit-debug.md` § Loop Question
- `.bkit/core/workflows/bkit-ship.md` § Merge Question, Step 11
- `.bkit/core/workflows/bkit-design.md` Step 3 — Grill, Step 12; `.bkit/core/workflows/bkit-plan.md` Step 8
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-diagnose.md`: where the step-back questions are asked today
- `.bkit/core/engine/commands/workflow/counters.ts` (`loopTrend`, `loopProgress`), `.bkit/core/engine/commands/workflow/decisions.ts` (compose, apply)
- `docs/decisions.jsonl` key `205-effort-opus-high-sonnet-medium-no-xhigh`

###### bkit:blocked-by start
- #891
- #895
###### bkit:blocked-by end

Issue body and title rewritten after a review against the code, on the owner's instruction.

- **Scope:** the issue now covers every owner question that needs judgment (design and plan open questions, build's Decision Pause, the loop questions), not only stuck fix loops. The stuck-loop step-back is one use of the question advisor.
- **Corrected against the code:** `FINAL` is the third fix round and the shipped default limit is 2 for every loop, so `FINAL` runs only after the owner grants more rounds; only the build verify loop puts the "step back" question to the agent that is stuck; the build pause's loop recommendation comes from the engine's trend, and only the per-item recommendations come from the orchestrator.
- **Blocked by:** #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895) added, because it rewrites `decisions compose`, `decision-items.json` and the loop and merge questions.
- **Open questions:** the strategy ladder, orchestrator models, where the advisor runs in design's Grill and ship's Merge Question, and the missing evidence from a real stuck run are listed in the body with a recommendation where there is one.
- **Bug found while reading:** ship Step 11 invokes `bkit-debug-failure-diagnose` with no `Strategy`, which that prompt answers with `FAIL` and no diagnosis. Not reproduced in a run. Recorded in `docs/failures.jsonl` under key `ship-failure-diagnose-invoked-without-strategy` (commit `6a3eba604` on local `dev`, not pushed).

Moved under a new umbrella and narrowed to the question advisor alone.

- **Parent:** now #905 — Model-independent orchestrators (https://github.com/cbartens/bkit/issues/905), which itself sits under #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750).
- **Moved out:** the strategy-label question is now #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (https://github.com/cbartens/bkit/issues/907), which is blocked by this issue. The question of which model each orchestrator runs on moved to the umbrella. The migration constraint for the `strategy` field went with #907.
- **Renumbered:** open questions are now 1-9. Question 3 (Design Grill) gained one fact: in a headless run the orchestrator takes its own recommendations as the answers.
- **Related:** #906 — Fetch Context: agents pick the search terms and log queries (https://github.com/cbartens/bkit/issues/906) covers the search terms in design, plan and debug Step 4.

Labels, milestone and the blocked-by list (#891, #895) are unchanged.

Open question 3 (Design Grill) now has its own issue: #908 — Design Grill: an agent prepares the interview, the orchestrator relays (https://github.com/cbartens/bkit/issues/908).

The Grill is more than a recommendation to check. The orchestrator maps the decision tree, words the questions and drafts the acceptance scenario itself, so it needs its own design. Whether that agent is the question advisor or a separate one is open question 2 of #908. Question points 1-2 in this issue's table are decided there.

## #911 — Ship: a failed merge never reaches the diagnose and fix steps (open)

### Failing test or CI run

none yet. Both defects were found by reading `.bkit/core/workflows/bkit-ship.md`. Neither has been seen in a run.

### What happened

`/bkit-ship` has two steps for a merge that fails: Step 11 — Failure Diagnose (an agent works out why) and Step 12 — Failure Remediate (an agent applies the fix). Read as written, they cannot do their job, for two separate reasons.

**1. No route leads to them.** Every route out of Step 10 — Merge Gate + Merge PR goes somewhere else (`bkit-ship.md:764-783`):

- merged → Step 13;
- the gate asks for a new CI run → Step 9;
- the branch needs the base merged in → Step 3;
- the limit is used up → the Merge Question or the Failure Path;
- anything else → the Failure Path.

Line 783 says it outright: "Recoverable merge refusals never enter Steps 11–12." No step routes to Step 11. Step 12 is named only by Step 11 and by the Resume rule in the header (`bkit-ship.md:42`). So the only way in is a resumed run whose last finished step happens to be 10 or 11.

A run that arrives that way is missing what Step 11 needs. Its sub-step 3 (`bkit-ship.md:861`) tests `MERGE_ASK` and narrates `MERGE_ROUNDS` and `MERGE_MAX`. Only Step 10's `counters route` call sets those three, and a resumed run does not hold them.

**2. Step 11 starts the diagnose agent without a value it requires.** The Context that Step 11 hands to `bkit-debug-failure-diagnose` names no `Strategy` (`bkit-ship.md:851-854`). The agent's prompt says what to do then (`.bkit/core/prompts/bkit-debug-failure-diagnose.md:67`): set `Verdict` = `FAIL`, change no other file, and return. So the diagnosis file comes back with every section still `PENDING`.

What follows depends on the setting `bkit.workflows.ship.merge.ask`:

- on → Step 11 asks the owner the Merge Question as if no clear cause had been found;
- off → Step 12 runs `bkit-debug-failure-remediate` against a diagnosis that contains no fix.

Build Step 13 and debug Step 6 pass `Strategy` to the same agent. Ship passes it only to the fix agent in Step 12.

### What should happen

One of two things, and the choice is the first thing to decide:

- **A failed merge gets a diagnose-and-fix round.** Step 10 routes to Step 11, Step 11 holds the three counter values itself, and the diagnose agent gets every value its prompt requires.
- **A failed merge does not get one.** Steps 11 and 12 are removed, together with the Merge Question's Step 11 entry (`bkit-ship.md:798`) and the `ship-failure-diagnose` / `ship-failure-remediate` step rows.

Either way, no step is left in the file that no route can reach.

### Steps to reproduce

Not reproduced. A first attempt:

1. In a test repo, start `/bkit-ship` on a PR whose merge is refused for a reason Step 10 treats as terminal.
2. Check which step runs next. The file says the Failure Path, never Step 11.
3. Separately, start `bkit-debug-failure-diagnose` with the Context from `bkit-ship.md:851-854` and check that it returns `FAIL` with a `PENDING` report.

### How often

Defect 1: every ship run whose merge fails. Defect 2: every run that does reach Step 11.

### Affected area

- `.bkit/core/workflows/bkit-ship.md` Step 10 (routes), Step 11, Step 12, the Merge Question and the Resume rule.
- `.bkit/core/prompts/bkit-debug-failure-diagnose.md` Process step 5.
- `.bkit/core/engine/commands/workflow/steps.ts` and `status.ts` (the step rows, and what `status resume` returns).

### Where and when

Read on `dev`, 2026-11-10, bkit 6.1.1.

### Evidence

- `docs/failures.jsonl` key `ship-failure-diagnose-remediate-steps-reachable-only-on-resume`
- `docs/failures.jsonl` key `ship-failure-diagnose-invoked-without-strategy`
- Not checked: whether `status resume` can return step number 11 at all. If it cannot, Steps 11 and 12 are fully dead.
- Not written down anywhere: why line 783 keeps recoverable refusals out of Steps 11-12 while the steps stay in the file.

### References

- #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750): parent.
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (https://github.com/cbartens/bkit/issues/907): would remove the `Strategy` field, which ends defect 2 by another route. It is blocked and far off, so this issue does not wait for it.
- #904 — Question advisor: a fresh top-tier agent behind every owner question (https://github.com/cbartens/bkit/issues/904): its open question 6 is whether the advisor covers the Merge Question, which Step 11 asks.
- `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-build.md` Step 13, `.bkit/core/workflows/bkit-debug.md` Step 6

**Label changed: `next:debug` → `next:design`**

Both defects were found by reading `bkit-ship.md`, and nothing has failed in a run, so debug has no failure to diagnose. The issue's first step is a choice between two options: wire a failed merge into Steps 11-12, or remove those steps. That choice is design's job (`.bkit/workflows.md:58`).

If the owner makes the choice in a comment here, design is no longer needed and the next step becomes `/bkit-plan 911`.

### Owner decision: remove Steps 11-12 (design no longer needed)

**Decision:** a failed merge does not get a diagnose-and-fix round inside ship. Steps 11 and 12 are removed. When ship stops on a failure, the fix is a separate `/bkit-debug` run.

**Why.**

- **Nothing reaches the steps any more, and the cases that used to are now handled elsewhere.** Before #896, Step 11 ran only when the merge gate had passed (CI green) and GitHub still refused the merge. #896 moved the two cases a code fix could help with to their own routes: head moved after the gate → Step 9 (re-validate), conflict with `dev` → Step 3 (integrate). What is left goes to a stop: base not `dev`, PR not open, head unreadable, or GitHub refusing for a policy reason such as a missing review or a branch rule. An agent editing code cannot fix any of those.
- **A failing CI run never went to Step 11.** At least since `3b8d94681` (2026-10-11), the merge gate in Step 10 sub-step 1 sends a red run (exit 12) to the Failure Path, unless every failed step is a generated file, which ship regenerates. That is unchanged.
- **Debug is the right tool for a red CI run at ship time.** The change already passed build's local tests, so a CI failure in ship is usually CI-only (machine, environment, secrets, a test that fails at random), or new code brought in from `dev` by the Step 3 merge. `/bkit-debug` has steps for that which Steps 11-12 never had: Step 4 reads the actual CI run's evidence, Step 5 reproduces the failure as a failing test, and Step 8 soaks causes nobody has found yet. Steps 11-12 were diagnose and fix only, with no CI evidence and no `Strategy` value. Copying the rest of debug into ship would mean keeping two copies in step.
- Build keeps its own Steps 13-14. There the failing tests come from code the same run just wrote, with the plan at hand, so a diagnose-and-fix loop fits.

**Scope for the plan.**

- `.bkit/core/workflows/bkit-ship.md`: remove Steps 11 and 12, the Merge Question's "diagnosis found no clear cause" branch (keep the used-up-limit branch), the "Recoverable merge refusals never enter Steps 11-12" sentence, and Step 11/12 from the Resume rule. Renumber the steps that follow, or say why the numbers stay.
- Step names `ship-failure-diagnose` and `ship-failure-remediate`: remove from `.bkit/core/engine/commands/workflow/step-table.ts`, `steps.ts`, `.bkit/core/engine/checks/status-holes.ts`, their tests, the workflow checks (`ship-invariants.test.ts`, `workflow-shape.test.ts`, `counter-prose-audit.test.ts`) and the `bkit-ship.none.txt` snapshot.
- Docs that name the steps: `.bkit/workflows.md` and `.bkit/instructions.md`. `utility-pre-release-check` names them too; it is hand-authored in three copies (`.claude/agents/`, `.opencode/agents/`, `.codex/agents/`).
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`. Debug uses both, and build Step 13 uses the diagnose agent.
- Status files from runs started before the change can still hold `ship-failure-*` rows. A resumed run, and `bkit workflows summary`, must still handle them.
- When ship stops on a red CI run, the stop message names `/bkit-debug {FID}` as the next step. Check whether the Failure Path handover already says this; add it if not.
- Defect 2 (Step 11 starting the diagnose agent without `Strategy`) goes away with Step 11. Nothing else is needed for it.

**Side effect:** #902's table loses its ship Step 11 row.

Next step: `/bkit-plan 911`.

**Stays In review: Open Question 1 needs an owner answer.** It is the only question without a default.

`docs/plans/202611/911-ship-failed-merge-plan.md` passes `bkit tests plan-check` with 0 problems, but its Narrative and Success Criteria are marked "⚠️ MISSING". Open Question 1 asks whether to:

- **A:** adopt the proposed wording, or
- **B:** write your own.

Until that is settled, the plan has no Acceptance Scenario to build against. Open Questions 2 and 3 default to A (accept `unexpected` entries; all three red-CI stops name `/bkit-debug`).

Blocker note: this issue now blocks [#849 — Keep local dev synchronized after workflow close](https://github.com/cbartens/bkit/issues/849), [#894 — Show the progress line at step start and at task group boundaries](https://github.com/cbartens/bkit/issues/894) and [#913 — Owner Stop writes the full handover in debug, build and ship](https://github.com/cbartens/bkit/issues/913). All three change the ship step list or ship's Stop answer that this issue changes first. So answering Open Question 1 unblocks the most work in v6.2.

## #913 — Owner Stop writes the full handover in debug, build and ship (open)

### Narrative

When the owner answers Stop to a workflow question, the run ends half done and a later agent has to resume it cold. That is the same position as a failed run, but the two get different handovers:

- On a failure, the Failure Path in `bkit-debug`, `bkit-build` and `bkit-ship` runs `@bkit-debug-abort-handover`. That agent reads the run's status, diagnoses, remediation logs and diff, and writes the full handover: Short Version, What's Actually Happening, Attempt History, Verified Resolutions (do not roll back), Persistent Errors, Recommended Next Steps.
- On an owner Stop, the orchestrator writes a short file by hand: the question, the answer and a resume line. Nothing tells the next agent what was tried, what is verified, or what is still red.

The three owner-Stop paths:

- `.bkit/core/workflows/bkit-debug.md` § Loop Question step 5 → `debug-handover.md`
- `.bkit/core/workflows/bkit-build.md` § Decision Pause step 8 → `build-handover.md` (the decision file plus the resume line)
- `.bkit/core/workflows/bkit-ship.md` § Loop Question, the `Stop` answer → `ship-handover.md`

A consumer's debug run stopped this way posted a handover holding only the question, the answer and a State section the orchestrator added on its own initiative. The diagnosis and remediation detail stayed in separate log files that the comment never pointed at.

Change: on an owner Stop, each workflow runs the same `@bkit-debug-abort-handover` call its Failure Path uses, with the same Read list plus the question and the answer. The agent writes the handover file. Everything after that stays as it is: the run stays IN_PROGRESS, `workflows handover --post` posts it, the lock is released, and `workflows fail` is never run.

### Success Criteria

- An owner Stop in debug, build or ship writes its `{workflow}-handover.md` through `@bkit-debug-abort-handover`, not by hand.
- The handover keeps the owner's question and answer word for word and ends with the existing resume line (`Stopped by the owner; run stays IN_PROGRESS. /bkit-{workflow} {FID} resumes at …`).
- The handover carries the same sections a failure handover does, filled from the run's records (attempts, verified fixes, errors still open, next steps).
- The run stays resumable, and no Stop path calls `workflows fail` or adds `bkit:failed`.
- Design and plan are unchanged; they have no owner-Stop option.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Stop before any diagnose or remediation artifact exists | The agent writes the handover from status rows and the question; sections with no input say so instead of being dropped |
| `{WORKTREE_PATH}` not set (build `PUBLISH` = false path, or no worktree) | The diff step is skipped as on the Failure Path; the agent still runs |
| The agent fails or returns no file | The Stop path goes to the Failure Path, as a non-zero `workflows handover` already does |
| A later resume reads the handover | The resume point in the closing line is unchanged, so `/bkit-{workflow} {FID}` resumes where it did before |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| debug owner Stop invokes `bkit-debug-abort-handover` before `workflows handover --post` | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| build owner Stop invokes `bkit-debug-abort-handover` before `workflows handover --post` | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| ship owner Stop invokes `bkit-debug-abort-handover` before `workflows handover --post` | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Owner Stop runs the handover agent
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Teach the handover agent the owner-Stop case
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-abort-handover.md`: when the input names an owner question and answer, the handover opens with them word for word, says the owner stopped the run (not that automation could not proceed), and keeps the caller's resume line as its last line
  - **DONE WHEN:** the prompt covers both a failure and an owner Stop, and `bkit install` renders the host mirrors with no drift in `bkit check`
  - **TEST FIRST:** n/a — prompt wording only; tasks 2 to 4 test the calls
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** debug Stop calls the agent
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md` § Loop Question step 5: replace the hand-written file with the Failure Path's `context diff` + `@bkit-debug-abort-handover` call (same Read list, plus the question and answer), then the existing `workflows handover --post` and `locks release`
  - **UPDATE:** `.bkit/workflows.md`: the debug row, if it describes the Stop handover
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the debug Stop path names the agent before `workflows handover --post`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug owner Stop invokes bkit-debug-abort-handover` fails on the Stop path writing the file by hand
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** build Stop calls the agent
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md` § Decision Pause step 8: run the Failure Path's agent call (Read list plus the decision file) instead of copying the decision file; keep both `PUBLISH` branches of `workflows handover --post`
  - **UPDATE:** `.bkit/workflows.md`: the build row, if it describes the Stop handover
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the build Stop path names the agent before `workflows handover --post`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build owner Stop invokes bkit-debug-abort-handover` fails on the Stop path copying the decision file by hand
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** ship Stop calls the agent
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md` § Loop Question, the `Stop` answer: run the Failure Path's agent call (Read list plus the question and answer), then the existing `workflows handover --post` and `locks release`
  - **UPDATE:** `.bkit/workflows.md`: the ship row, if it describes the Stop handover
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the ship Stop path names the agent before `workflows handover --post`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship owner Stop invokes bkit-debug-abort-handover` fails on the Stop path writing the file by hand
<!-- bkit:task 4 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumed: the agent keeps its name `bkit-debug-abort-handover` even though build and ship use it too; renaming it is out of scope.
- Assumed: the agent's ledger rows (`docs/failures.jsonl`, `docs/deferrals.jsonl`) are also wanted on a Stop, since the open failures are just as real.
- Open: #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895) is rewriting these same question blocks and the shared line `"stop" writes a handover; the run can be resumed.`. Land after #895, or rebase onto it.

### Out of Scope

- The failure-count bug in the debug Loop Question: #912 — Debug loop question asks Stop with failure counts "? → ?" (https://github.com/cbartens/bkit/issues/912).
- Renaming the handover agent.
- Adding a Stop option to design or plan.

### References

- `.bkit/core/workflows/bkit-debug.md` § Failure Path (steps 3 to 5) — the agent call to reuse
- `.bkit/core/workflows/bkit-build.md` § Failure Path
- `.bkit/core/workflows/bkit-ship.md` § Failure Path
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — existing Failure Path → `bkit-debug-abort-handover` rows

###### bkit:blocked-by start
- #895
- #911
###### bkit:blocked-by end

**Blocked by [#895 — One question format for every owner question in the workflows](https://github.com/cbartens/bkit/issues/895) and [#911 — Ship: a failed merge never reaches the diagnose and fix steps](https://github.com/cbartens/bkit/issues/911).** Both are added to the `bkit:blocked-by` block at the end of the body and as GitHub "blocked by" links.

Why:

- **#895:** this issue already says "Land after #895, or rebase onto it". Both rewrite the same Stop question blocks in debug, build and ship.
- **#911:** Task 4 here rewrites ship's Loop Question `Stop` answer. #911 changes that same answer so its handover writes `Next step: /bkit-debug {FID}`. Building this first would mean that answer gets written twice.

`/bkit-build #913` stops at its blocker check until both are closed.
