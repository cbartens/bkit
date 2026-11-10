Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- 2 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-v1-draft.md`, `docs/plans/202611/logs/903-build-owner-s/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/903-build-owner-s/related-deferrals.md`, `docs/plans/202611/logs/903-build-owner-s/related-failures.md`, `docs/plans/202611/logs/903-build-owner-s/related-issues.md` |
| plan-review | CONCERNS | 7 | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-review-1.md`, `docs/plans/202611/logs/903-build-owner-s/plan-review-2.md`, `docs/plans/202611/logs/903-build-owner-s/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-v2-reviewed.md`, `docs/plans/202611/logs/903-build-owner-s/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/903-build-owner-s/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-v1-draft.md`, `docs/plans/202611/logs/903-build-owner-s/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/903-build-owner-s/related-deferrals.md`, `docs/plans/202611/logs/903-build-owner-s/related-failures.md`, `docs/plans/202611/logs/903-build-owner-s/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-review-1.md`, `docs/plans/202611/logs/903-build-owner-s/plan-review-2.md`, `docs/plans/202611/logs/903-build-owner-s/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/903-build-owner-s/plan-v2-reviewed.md`, `docs/plans/202611/logs/903-build-owner-s/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

The issue is bug-shaped. Its `What should happen` sections under Parts 1, 2 and 4 describe the expected behaviour, but they are not change-shape `Narrative` / `Success Criteria` fields, so this plan does not copy them in.

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** the owner answers a verify-gaps pause with some items `Accept` and one item `Fix now` **→ THEN** the pause writes the new task block and adds `Fix task: {N}` under the `Fix now` item in the decision file.
- **WHEN** that task is ticked and its own group's later verify passes, and Step 12 passes **→ THEN** `workflows summary` lists the paused group's FAIL rows under `Resolved Findings`, keeps the accepted items as a concern, prints `Verdict: CONCERNS`, and Step 15 goes on to Step 16.
- **IF** an item is unanswered, the `Fix now` task is unticked or never verified after the pause, or the item has no `Fix task:` line or names a task the plan does not have **→ THEN** the paused group's FAIL rows stay and the verdict is FAIL.
- **IF** the owner answers `Fix now` on a `**Fixable:** false` challenge task and names a direction **→ THEN** the pause rewrites that task's `DONE WHEN` and `TEST FIRST` to the direction in place, keeps its meta line, and Step 7 builds the direction.
- **IF** a hard blocker is answered `Fix now` with no direction **→ THEN** the item stays undecided and the owner is asked for the direction before anything is built.
- **IF** a test-fix step (build Step 14 or debug Step 7) ends FAIL and a later test run passes with 0 failures on the same scope **→ THEN** the summary lists the test-fix FAIL under `Resolved Findings`; with no such later run it stays a failure.

### Concrete Example

**Setup:** The owner runs `/bkit-build` in a session. The plan has 9 task groups. Group 9's verify fails at its round limit with two gaps, so the Decision Pause composes its file with `--loop=verify` and asks `Question: VERIFY_GAPS`, `From: verify`, `Group: 9`: Q1 is the loop question `Verify` (`Try again` / `Decide`), and Q2 and Q3 are the two gaps.

**Steps:**

1. Owner answers Q1 `Decide`, Q2 `Accept` and Q3 `Fix now` → System writes the `Decision:` lines, writes task 42 in a new group 10, adds `Fix task: 42` under Q3, runs `tests plan-check`, and routes to Step 7.
2. Step 7 writes task 42's tests, records them red, and writes the fix → Step 8 verifies group 10 `PASS` with `Tasks: 42` and ticks task 42.
3. Step 12 runs the final gate → `PASS`, 0 failures.
4. Step 15 runs `workflows summary` → `build-plan-tasks (group 9) FAIL` and `build-plan-verify (group 9) FAIL` appear under `Resolved Findings` as resolved by the Decision Pause, and `1 item(s) accepted at the Decision Pause` stays under the reasons.

**Outcome:** The summary prints `Verdict: CONCERNS`, and the run goes on to Step 16 and opens its PR instead of taking the Failure Path.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A `**Fixable:** false` challenge task is answered `Fix now` with a direction | Its `**DONE WHEN:**` and `**TEST FIRST:**` fields are rewritten to the direction; its number, title, group and `**Severity:** … · **Location:** … · **Round:**` meta line stay, `**Fixable:** false` included; its `Derived Test Matrix` rows are replaced by one per new test; `tests plan-check` passes. |
| A hard blocker (challenge or verify) is answered `Fix now` with no direction | The item counts as lacking a decision; the owner is asked for the direction as a follow-up; no task block is written or rewritten until it is given. |
| A hard blocker is left on a headless run | Unchanged: the run takes the Failure Path naming the hard blocker. |
| A run resumes at Decision Pause step 3 after step 6 wrote an item's `Fix task:` line, before `steps finish` | Step 5 reuses the task that line names and writes no second task block. |
| A verify pause holds `Accept` and `Fix now` items, and every `Fix now` task is ticked and verified `PASS` in its own group after the pause | The paused group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` FAIL rows are resolved; the accepted items stay a concern; the verdict is CONCERNS (or PASS with no other concern). |
| The verify pause is at its round limit, so its file holds the loop question as Q1 (`Verify`, `Decision: Decide — …`) before the gap items | The loop item counts as answered; the gap items from Q2 on are judged by the rule above. |
| The verify pause comes before the round limit (a `Fixable: false` gap), so its file has no loop item | The same rule applies; the gap items start at Q1. |
| A paused group's `build-plan-gaps-remediate` or `build-plan-verify` row ends CONCERNS, not FAIL | It stays under the reasons as a concern: the pause rule clears FAIL rows only, so remediation warnings are kept. |
| A group pauses more than once (an `Accept`-only pause, a re-verify that still FAILs, then a `Fix now` pause) | The latest qualifying `From: verify` decision for that group settles it: every FAIL row of that group before that decision row is judged against it. |
| A `From: holistic`, `From: challenge` or `From: tests` decision file carries a `Group:` line and a `Fix task:` line | It clears no group rows. |
| An item of that pause has no `Decision:` line | The paused group's FAIL rows stay. |
| A `Fix now` task is unticked, its group's latest verify is before the pause or not `PASS`, or its `Tasks` list omits it | The paused group's FAIL rows stay. |
| A `Fix now` item has no `Fix task:` line, or names a task the plan does not have | The paused group's FAIL rows stay: missing evidence leaves the finding unresolved. |
| A `build-decision` row has no artifact, or its decision file cannot be read | It clears nothing (the existing guard in `summary.test.ts`). |
| The decision names `Group: 8` | Only group 8's rows can be cleared; group 9's FAIL rows stay. |
| The `Fix now` task lands inside the paused group (within the caps) | The paused group is verified again; the existing same-group resolution applies, and the new rule agrees. |
| A holistic or tests pause is answered `Fix now` | Unchanged: Step 10 or Step 12 runs again after the fix group, and its own later row settles the result. |
| Build Step 14 ends FAIL and the next `build-run-tests` passes with 0 failures on the same scope | `build-failure-remediate FAIL` is resolved by `build-run-tests`; the first failed run stays listed under `## Tests`. |
| Build Step 14 ends FAIL and no later run passes, or the passing run used another scope | `build-failure-remediate FAIL` stays a failure. |
| Debug Step 7 ends FAIL and the next `debug-run-tests` passes with 0 failures on the same scope | `debug-failure-remediate FAIL` is resolved by `debug-run-tests`. |
| Debug Step 7 ends FAIL after a CI-sourced round (`debug-run-tests` `scope` = `ci:{runId}`), and only a later local run passes | `debug-failure-remediate FAIL` stays: the scopes differ, and local success alone does not resolve a CI-only failure (`docs/testing.md`). |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** What does Part 3 ("whatever #891's build leaves undone") add to this plan? → the owner decides at plan approval.
  - **Options:** A) Nothing beyond Parts 1, 2 and 4 now: every part of #891's issue body it does not deliver was dropped by the owner's rescope or recorded as its own deferral, and none is an ignored owner answer; if #891's remaining steps (challenge, final run, summary) leave a task undone, that task joins this plan through a plan revision — keeps the plan buildable today, but may need one revision · B) Also fold in the headless `Stop` route that #891's plan lists as a scope candidate (a headless pause that takes `Stop` re-runs the red gate instead of stopping) — it fits "an answer a later step ignores", but it needs a design call (Failure Path at once, or the step 8 handover) and #913 rewrites the same Stop handover · C) Hold the whole plan until #891 ships, then plan Part 3 in the same pass — no revision risk, but it delays Part 4, which does not wait on #891.
  - **Recommended:** A) — #891's remaining work is known and deferred; B belongs with #913's Stop-handover design.
  - **Default if unanswered:** A.
- **Open Question Q2:** Once Part 4 clears a test-fix FAIL, does the flake behind the first failed run stay a concern? → the owner decides at plan approval.
  - **Options:** A) No concern: the passing run on the same scope is the evidence, and the failed run stays listed under the summary's `## Tests` and in `Assessment History` — the flake is visible but does not hold the verdict at CONCERNS · B) A concern whenever a failed `*-run-tests` precedes the final pass — flags every flake, but a real failure that Step 14 fixed looks the same, so every fixed run becomes CONCERNS · C) A concern only when the test-fix step changed no files — closest to "it was a flake", but the step row carries no changed-files field, so it needs a new signal on the row.
  - **Recommended:** A) — B cannot tell a flake from a fix, and C adds a new status field for a judgement the `## Tests` list already shows.
  - **Default if unanswered:** A.
- **Open Question Q3:** Should `@bkit-debug-failure-remediate` report FAIL when the only thing blocked was its own confirming re-run (`.bkit/core/prompts/bkit-debug-failure-remediate.md`, the `FAIL` verdict line)? → the owner decides at plan approval.
  - **Options:** A) Keep FAIL: the step could not confirm its result, and with Part 4 the next full test run judges it — no prompt change · B) Report CONCERNS when the step changed no files and only the tests-lock re-run was blocked — the step row reads truer, but it changes a verdict contract that build Step 14 and debug Step 7 share, and `.bkit/prompts.md`.
  - **Recommended:** A) — Part 4 already settles the summary, and a step that could not confirm its fix is honestly FAIL.
  - **Default if unanswered:** A.
- **Open Question Q4:** What are this plan's `Narrative` and `Success Criteria`? #903 is bug-shaped, with no design and no change-shape fields, so both sections read MISSING and the plan cannot invent them. → the owner decides at plan approval; Gate 1 stays blocked until both sections are filled.
  - **Proposed Narrative:** The owner answers `Fix now` at `/bkit-build`'s Decision Pause, giving a direction where the item needs one, and the build builds that direction, and the summary credits the verified fix instead of reporting FAIL. A test-fix step that ended FAIL no longer fails the summary once the next test run on the same scope passes.
  - **Proposed Success Criteria** (from the issue's `What should happen` text for Parts 1, 2 and 4):
    1. A `**Fixable:** false` challenge task answered `Fix now` with a direction has its `DONE WHEN` and `TEST FIRST` rewritten to that direction before Step 7 runs.
    2. A hard blocker answered `Fix now` with no direction gets a follow-up question, and no task is built for it until the owner gives the direction.
    3. A group whose verify pause answered every item, with each `Fix now` task ticked and verified `PASS` in its own group after the pause, has no FAIL reason in `workflows summary`; each accepted item stays a concern.
    4. An unanswered item, a `Fix now` item with a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the paused group's FAIL.
    5. A `build-failure-remediate` or `debug-failure-remediate` FAIL counts as resolved when a later test run in the same run passes with 0 failures on the same scope, and stays a failure without one.
  - **Options:** A) Adopt the proposed wording — the plan proceeds at once, and the wording is drawn from the issue, but it is the planner's reading of it · B) The owner writes their own Narrative and Success Criteria — the contract is the owner's own words, but the plan waits for them.
  - **Recommended:** A) — each criterion restates one of the issue's `What should happen` rules, and every one already has a `Derived Test Matrix` row.
  - **Default if unanswered:** both sections keep the MISSING marker, and Gate 1 stays blocked.
- **Open Question Q5:** Does a verify pause that the owner answered with `Accept` on every item (no `Fix now`) resolve its group's FAIL rows? The issue's Part 2 rule reads as yes ("answered every item, and each `Accept` item stays a concern"), but `summary.test.ts` `a group's failed execution stays unresolved when verification still has concerns` asserts that an `Accept` pause followed by a CONCERNS re-verify keeps the group's `build-plan-tasks` FAIL, and no ledger row records why. That case's `build-decision` rows carry no decision file, so it holds under every option below. → the owner decides at plan approval.
  - **Options:** A) Keep the FAIL: the plan's rule needs at least one verified `Fix now` task, and the answer is recorded as a decision row — no new behaviour, but an `Accept`-only run still fails its summary and takes the Failure Path · B) Resolve the group: an `Accept`-only pause whose file answers every item clears its group's FAIL rows before the pause, and the accepted items stay a concern — matches the issue's wording and drops no signal, but widens Task 3's rule and adds a matrix row and a test · C) Defer it to its own decision — keeps this plan small, but the inconsistency stays live.
  - **Recommended:** B) — the issue's rule covers it, and the accepted-items concern already carries the signal; a bare `build-decision` row with no answered decision file still clears nothing.
  - **Default if unanswered:** A, the plan as written.
- **Assumption:** #891 merges to `dev` before Groups 2 and 3 are built, and Step 3 (Branch Sync) brings it into this branch → if wrong, Task 2 (`decisions.ts`) and Task 4 (`bkit-build.md`) edit text #891 also changes, and the sync conflicts. Group 1 touches only `summary.ts` and `summary.test.ts`, which #891 does not change.
- **Assumption:** A `*-run-tests` `PASS` row with no `failures` field (the gate wrote no JUnit report) counts as 0 failures, as the existing `answer` lookup treats it → if wrong, a consumer with no JUnit reporters keeps the test-fix FAIL; it never clears a FAIL wrongly, because `steps finish` refuses a `PASS` with failures.
- **Assumption:** Two test runs ran "the same scope" when their `step-done` rows' `scope` strings are equal (`--scope="{TEST_SCOPE}"` in build Step 12 and debug Step 3; `steps finish` requires `scope` on `build-run-tests` / `debug-run-tests` rows, per the closed deferral `58-test-verdict-scope-arg-accepts-empty-silently`) → if wrong (a workflow wrote two names for one gate), the test-fix FAIL stays, which is the safe side.
- **Assumption:** This plan lands before #895, which rewrites the decision-file layout and `parseDecisionItems`, and #895 rebases onto `fixTask` and `decisionHeader` → if #895 lands first, Task 2 is re-planned against #895's layout, and #895 must keep a per-item `Fix task:` line and a header block with `From:` and `Group:`, or every `Fix now` group keeps its FAIL.
- **Assumption:** A paused group's own `build-group-gate` FAIL rows stay outside the pause rule, because a group-gate failure is never a Decision Pause item (`bkit-build.md` § Decision Pause step 2: "always fixed") → if a gate-red group can ever reach a `Fix now` verify pause, its gate FAIL stays, which is the safe side.
- **Assumption:** A challenge task rewritten to the owner's direction keeps `**Fixable:** false` in its meta line, because the meta line records the challenge finding, and no build step skips a task for `Fixable: false` (only Decision Pause step 2 reads it, to make the item a hard blocker) → if a later step starts reading `Fixable: false` as "do not build", the rewritten task is not built and verify reports it open.
- **Assumption:** `taskVerified` in `.bkit/core/engine/commands/workflow/summary-findings.ts` is the right evidence for a `Fix now` task: ticked, its group's latest `build-plan-verify` after the pause is `PASS` with 0 failures and lists the task in `Tasks`, and no later execute or gap-fix row for that group → if wrong, the summary is stricter than needed (the FAIL stays), never looser.
- **Assumption:** `context brief` builds both Step 7 briefs from the plan's task blocks and matrix rows (`.bkit/core/engine/commands/workflow/context.ts`, `## The work`), so a rewritten challenge task reaches the test writer and the code writer with no `Read:` change → if wrong, the agents see the old block and Part 1 fails as today.
- **Assumption:** Every decision file of a verify pause carries the `Group:` and `From:` header lines (`--header=Group={GROUP}` in Decision Pause step 2) → if a file lacks them, its group cannot be named and nothing is cleared.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #903
```

Or, to address the reasons first: `/bkit-plan #903`
