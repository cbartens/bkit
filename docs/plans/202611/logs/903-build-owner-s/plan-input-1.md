## Session Prompt — this run's, newer than everything below

/bkit-plan #903

## Issue description — oldest

###### bkit:blocked-by start
- #891
###### bkit:blocked-by end

> **Run after #891 ships.** #891 — Build: gate stuck on tests already red on dev, owner accept ignored — is being built now and changes the same Decision Pause code (`.bkit/core/workflows/bkit-build.md` § Decision Pause, `.bkit/core/engine/commands/workflow/decisions.ts`). Its scope is left unchanged. This issue holds the rest of the same kind of bug: the owner answers at the Decision Pause, and a later step ignores the answer.

### Scope

- **Part 1 — the owner's `Fix now` direction never reaches the build agents.** Full text of #899, closed as not planned in favour of this issue.
- **Part 2 — the summary says FAIL after `Fix now` moved a group's gaps elsewhere.** Full text of #900, closed as not planned in favour of this issue.
- **Part 3 — whatever #891's build leaves undone.** When #891 ships, compare its delivered work with its issue body and add anything not done here.
- **Part 4 — the summary keeps a test-fix FAIL after the next test run passed.** Found in #864's build. It is the same summary rule as Part 2, not an owner answer being ignored. It changes only `summary.ts` and its docs, so it does not wait on #891.

Before fixing, re-check every `file:line` below against `dev` after #891 merges, because that build edits `bkit-build.md` and `decisions.ts`.

## Part 1 — Owner's `Fix now` direction never reaches the build agents (from #899)

### Failing test or CI run

none yet

### What happened

During `/bkit-build #891`, challenge round 1 logged a hard blocker (TASK 16, `**Fixable:** false`). Its plan block put two design directions to the owner. At the Decision Pause the owner answered `Fix now` and picked one direction. The answer is written to `build-decision-1-3.md`.

The owner's direction never reached the agents that do the fix:

- Decision Pause step 5 says that for a challenge task answered `Fix now`, "keep that task open. It runs as it is." The task block is not reshaped. Only a new task block is shaped "by the owner's direction".
- So the plan block still holds the text written before the decision. Its `TEST FIRST` line describes the option the owner turned down ("fails on verdict `all` when the gate recorded a failed non-test stage").
- Step 7's `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` get no decision file in their `Read:` list. The **Owner decisions** contract also bars the orchestrator from restating the answer in `Context`.

As a result, the test writer logged TASK 16 `BLOCKED` ("the owner must decide the signal") and `tests red` recorded the test as `missing`. Run as written, the retry blocks the same way, and the task reaches the summary unfixed even though the owner already decided it.

In the #891 run this was worked around by hand: commit `6db198bf5` ("task 16 reshaped to owner direction") rewrote the task block. The workflow bug remains.

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

### Evidence

- #891's build: `docs/plans/202611/logs/891-build-gate-stuck/build-decision-1-3.md`, `build-plan-tests-6-log.md`, `build-tests-red-6-1.md`

## Part 2 — Summary says FAIL after `Fix now` moved a group's gaps elsewhere (from #900)

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

## Part 4 — Summary keeps a test-fix FAIL after the next test run passed (found in #864's build)

### Failing test or CI run

none yet. No case in `.bkit/core/engine/commands/workflow/summary.test.ts` covers `build-failure-remediate`.

### What happened

During `/bkit-build #864` (#864 — Move project docs to templates with adoption warnings, https://github.com/cbartens/bkit/issues/864), Step 12's first test run (`build-run-tests` attempt 1) failed with 1 failure: the known `tracker.test.ts` timing flake.

Step 14's `build-failure-remediate` rightly changed no files. Its own re-run of the gate never ran: both tries of `bkit tests changed` exited without running (the log records "x2, exit 81/75"), because the machine-wide tests lock had been held for 20+ minutes by a consumer's live E2E gate. The remediate prompt sets `Verdict: FAIL` when "any step ends `BLOCKED` with no later `DONE`" (`.bkit/core/prompts/bkit-debug-failure-remediate.md:88`), so the step finished FAIL.

The next Step 12 run (`build-run-tests` attempt 2, same scope `pnpm bkit:gate:static-unit-integration`) passed with 0 failures (its integration tier: 1905 tests passed).

Step 15's `workflows summary` still lists `build-failure-remediate FAIL` as a failure. `RESOLVED_BY` (`.bkit/core/engine/commands/workflow/summary.ts:66-73`) has no entry for `build/build-failure-remediate`, so no later step can clear it. The row then falls through to `fails` after the `answer` lookup (`summary.ts:266`). A build whose Step 14 ends FAIL always summarises as FAIL, even when the next full test run passes.

The docs have no rule for this case either. `.bkit/workflows.md:520` and `.bkit/core/.bkit/workflows.md:520` hold the nearest Resolution evidence row, "Failed group execution or gap remediation", which covers plan groups, not Step 14.

### What should happen

A `build-failure-remediate` FAIL counts as resolved when a later `build-run-tests` in the same run passes with 0 failures on the same scope. If no later test run passes, the FAIL stays.

Not decided anywhere: whether the flake behind the first failure stays a concern after that. The group row's "flakes remain concerns" suggests yes, but nothing records it for Step 14.

### Steps to reproduce

Pass `buildSummary` these rows: `build-run-tests` attempt 1 `FAIL` (1 failure), then `build-failure-remediate` `FAIL`, then `build-run-tests` attempt 2 `PASS` (0 failures), with every plan task ticked and no other FAIL.

- Expected: no FAIL reason from these rows.
- Actual: `Failures` includes `build-failure-remediate FAIL`, and the verdict is FAIL.

### How often

Every build where Step 14 ends FAIL and the next Step 12 run passes. A held tests lock makes it likely: the fix step cannot re-run the gate, so it reports FAIL even when there is nothing to fix.

### Affected area

- `.bkit/core/engine/commands/workflow/summary.ts`: `RESOLVED_BY` (`:66-73`) and the `answer` lookup (`:266`).
- `.bkit/core/engine/commands/workflow/summary.test.ts`: a new case for the rows above.
- `.bkit/workflows.md` and `.bkit/core/.bkit/workflows.md`, § Summary / handover step, Resolution evidence table: a row for a failed test-fix step.
- `/bkit-debug`: `debug-failure-remediate` followed by a passing `debug-run-tests` has no `RESOLVED_BY` entry either. Check whether the debug loop can reach its summary in that state.
- Open question, not decided here: whether `bkit-debug-failure-remediate.md:88` should report FAIL when the only thing blocked was its own confirming re-run.

### Evidence

On branch `feat/864-move-project-docs`, in `docs/plans/202611/logs/864-move-project-docs/`:

- `run-tests-1.md`: FAIL, 1 failure.
- `build-failure-remediate-1-log.md`: `Verdict: FAIL`; Step 1 DONE with no files changed; Step 2 BLOCKED on the tests lock.
- `run-tests-2.md`: PASS, 0 failures.
- `build-summary.md`: lists this FAIL alongside two Part 2 FAILs (group 2's tasks and fix round, whose `Fix now` fix landed in a new group that passed verify).

## References

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (blocker; same Decision Pause surface)
- #899 — Build: owner's Fix now direction never reaches the build agents (closed, not planned; Part 1 here)
- #900 — Build: summary says FAIL after Fix now moved a group's gaps elsewhere (closed, not planned; Part 2 here)
- #864 — Move project docs to templates with adoption warnings (https://github.com/cbartens/bkit/issues/864): the build that found Part 4
- `.bkit/workflows.md` § Summary / handover step, Resolution evidence table: Part 2 and Part 4
- #843 — Friction triage: parent. Scope review: https://github.com/cbartens/bkit/issues/843#issuecomment-6756043605
- `.bkit/core/workflows/bkit-build.md` § Decision Pause, § Step 7, § Step 15 — Summary

## Issue comment — posted 2026-11-10T06:11:22.000Z

**Label changed: `next:debug` → `next:plan`**

Parts 1 and 2 already say what goes wrong and why. Part 3 can only be scoped once #891 ships. Nothing is red, so `/bkit-debug` doesn't fit (`.bkit/workflows.md:61`). The next step is `/bkit-plan 903`, after #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891) ships, as the blocked-by block says.

## Issue comment — posted 2026-11-10T22:57:40.000Z

Added **Part 4** to the body: the build summary keeps a `build-failure-remediate` FAIL even after the next full test run passes. Found in the build for #864 — Move project docs to templates with adoption warnings (https://github.com/cbartens/bkit/issues/864). In that run, the test-fix step changed nothing, which was right for a flake, but it reported FAIL because the shared tests lock blocked its own confirming re-run. The next test run passed, and the summary still counted the FAIL.

Part 4 changes only the summary code and its docs, so unlike Parts 1–3 it does not have to wait for #891 — Build: gate stuck on tests already red on dev, owner accept ignored (https://github.com/cbartens/bkit/issues/891). Two points are left open in the body: whether the flake stays a concern once cleared, and whether the test-fix step should report FAIL when only its re-run was blocked.

No code changed.
