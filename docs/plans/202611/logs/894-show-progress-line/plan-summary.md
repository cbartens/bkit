Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- 4 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-v1-draft.md`, `docs/plans/202611/logs/894-show-progress-line/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/894-show-progress-line/related-deferrals.md`, `docs/plans/202611/logs/894-show-progress-line/related-failures.md`, `docs/plans/202611/logs/894-show-progress-line/related-issues.md` |
| plan-review | CONCERNS | 12 | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-review-1.md`, `docs/plans/202611/logs/894-show-progress-line/plan-review-2.md`, `docs/plans/202611/logs/894-show-progress-line/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-v2-reviewed.md`, `docs/plans/202611/logs/894-show-progress-line/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/894-show-progress-line/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-v1-draft.md`, `docs/plans/202611/logs/894-show-progress-line/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/894-show-progress-line/related-deferrals.md`, `docs/plans/202611/logs/894-show-progress-line/related-failures.md`, `docs/plans/202611/logs/894-show-progress-line/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-review-1.md`, `docs/plans/202611/logs/894-show-progress-line/plan-review-2.md`, `docs/plans/202611/logs/894-show-progress-line/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/894-show-progress-line/plan-v2-reviewed.md`, `docs/plans/202611/logs/894-show-progress-line/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Since #825, every `/bkit-*` workflow shows a progress line when a numbered step **finishes**. Long steps therefore start in silence: the owner doesn't see which step is running or why the wait is long until it's over.

### Success Criteria

- In all five step-listed workflows (design, plan, build, debug, ship), each numbered step that does work shows the engine's start line word for word before its work begins. `/bkit-auto` forwards those lines.
- The start line's % equals the % of the done line before it, and is never above the done line after it.
- In build, every task group shows a start line with `Group {g} of {G}` before Step 7 runs, and a passing group gate shows `Group {g} of {G} done`.
- A step re-entered by a retry loop, in any workflow, shows `Attempt {a} of {max}` in its start line.
- Start lines are worked out from `status.jsonl` and the plan alone and never write a status row, so a resumed run shows the same line it would have shown without the stop.

### Process Sketch

- **WHEN** a numbered step's work is about to begin **→ THEN** the orchestrator runs that step's `Start:` block and shows `Progress: {bar} {pct}% · Starting Step {n}/{steps} {title}` word for word, with the % of the done line shown just before it.
- **WHEN** a build task group begins Step 7, fresh or resumed **→ THEN** the start line carries `Group {g} of {G}` before the long `build-plan-tasks` wait; **WHEN** that group's gate passes **→ THEN** its done line ends `Group {g} of {G} done`.
- **WHEN** a retry loop re-enters a step (build verify / challenge / tests, debug fix / soak, ship merge) **→ THEN** its start line shows the lower % of that earlier step and `Attempt {a} of {max}`.
- **IF** a step is skipped, is a Decision Pause, an owner pause or unnumbered bookkeeping **→ THEN** no start line shows; a skipped step still prints its done line as today.
- **IF** the run stops and resumes **→ THEN** the resumed step shows its start line once, worked out again from `status.jsonl`, identical to the line an unstopped run shows.
- **IF** the run is headless or in the cloud, or the screen is 375px wide **→ THEN** the line prints without waiting, and its `Progress: {bar} {pct}%` part stays within 25 characters so it never wraps.

### Concrete Example

**Setup:** The owner runs `/bkit-build #894` on a plan with three task groups. Group 1 is done and its group gate passed, so the last line shown was `Progress: ████░░░░░░ 36% · Step 8/16 Plan Verify · Group 1 of 3 done`. Build's total is `6 + 3·3 + 7 = 22` units.

**Steps:**

1. The orchestrator briefs group 2 at Step 7 sub-step 1 → it runs `"{BKIT}" steps start --file="{STATUS}" --workflow=build --number=7 --group=2` → the engine prints `progressLine: Progress: ████░░░░░░ 36% · Starting Step 7/16 Plan Execute · Group 2 of 3` and appends no step row.
2. The orchestrator shows that line word for word → the `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` subagents run for 20 minutes while the owner already sees which group is in flight.
3. Step 8's verify returns FAIL, Step 9 fixes the gaps (`Progress: ██████░░░░ 55% · Step 9/16 Plan Gaps Remediate · Group 2 of 3`), and the run goes back to Step 8 → the Step 8 start line reads `Progress: █████░░░░░ 45% · Starting Step 8/16 Plan Verify · Group 2 of 3 · Attempt 2 of 3`, lower than the Step 9 done line before it.
4. The second verify passes and the group gate passes → the gate's done line reads `Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Attempt 2 of 3 · Group 2 of 3 done`. Group 3 starts → `Progress: █████░░░░░ 50% · Starting Step 7/16 Plan Execute · Group 3 of 3`.
5. The session stops while group 3's tasks run, and the owner resumes → `status resume` names Step 7, group 3; the orchestrator runs Step 7's start block before the sub-step it enters, and the engine, passing over group 3's own Step 7 rows, prints `Progress: █████░░░░░ 50% · Starting Step 7/16 Plan Execute · Group 3 of 3` again.

**Outcome:** Every wait starts with a line naming the step, the group and the attempt, and no start line ever shows a higher % than the done line that follows it.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| First step of a workflow | Start line shows 0% and an empty bar |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form, ship Step 4 on Path A) | No start line; the done line still prints as today |
| Decision Pause, owner pause, unnumbered bookkeeping | No start line |
| Build before Step 4, so no plan yet | G counts as 1, as for done lines |
| Group gate that fails or goes to gaps remediation | No `done` suffix; the done suffix appears only on the passing gate |
| Retry loop that goes back to an earlier step | That step's start line shows the lower % and the attempt |
| Resume after a stop | The resumed step shows its start line once, worked out again from `status.jsonl` |
| Headless / cloud run | Start lines print; nothing waits on them |
| Start line on a 375px-wide phone | The `Progress: {bar} {pct}%` part never wraps, as for done lines |
| Step that follows a conditional step which did not run (build Step 10 after the last group, build Step 15 after passing tests, ship Step 5 on Path A) | The start % is the last finished position's %, not the skipped position's; the following done line takes the jump |
| Step re-entered mid-way after a resume or a handover, with some of its own rows already written (build Step 7 after `build-plan-tests`) | The engine passes over the step's own trailing rows (same number and group), so the line equals the one the step showed when it first began |
| Gate-only positions that write no row (Step 1 in every workflow, ship Steps 3 and 9) | Counted as finished once the run is past them, so the next start line equals their gate done line |
| Step 2 starts before `{STATUS}` is held | The verb reads the run from `--fid` and `--month`, as the Step 1 gate does, so its % equals the Step 1 done line |
| Step 1 starts before `repo info` has run | The block runs through the `{BKIT}` lookup expression and prints 0% with no `--file` |
| `--number` outside the workflow's step table, `--step` the table places at another number, an unknown workflow, or a non-integer `--group` / `--attempt` | Exit 2, no `progressLine`, nothing written |
| `--step` naming a row outside the step table (`build-decision`, `build-tests-red`) | Exit 0 with no `progressLine`, the rule `steps finish` follows for those rows |
| Unreadable `status.jsonl` or an invalid plan | The same exit codes the done line uses (`EXIT_NO_STATUS`, usage for an invalid plan); no line |
| `/bkit-auto` delegating to a workflow | Auto shows the delegated workflow's start lines as it shows its done lines |
| Last build group (no group gate runs) | No `done` suffix; Step 10's start line marks the end of the loop |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question:** What should the new read-only command be called, and what identifies the step? → the owner, at plan review.
  - **Options:** A) `bkit steps start` keyed on `--number` (plus optional `--step`, `--group`, `--attempt` / `--attempt-of`, `--file` or `--fid` + `--month`) — one verb beside `finish` / `gate`, works for row-less positions (ship 3 and 9), reuses `stepProgress` · B) a `--start` flag on `steps gate` — no new verb, but `gate` runs mechanical checks and needs a step key, so a start call would either run checks it does not need or need a second mode inside one verb · C) a `progressLine` key on `status resume` / `status route` — no new verb, but those verbs answer other questions and run at fixed points, not at every step's start
  - **Recommended:** A) `bkit steps start` — it is the narrowest contract, and it shares the done line's code path instead of adding a parallel one.
  - **Default if unanswered:** A.
- **Open Question:** How is the start % worked out when the step before it did not run (a conditional step skipped, or a gate-only position)? The Success Criteria require the start % to equal the done line before it. → the owner, at plan review.
  - **Options:** A) **finished-before, capped by position:** the smaller of the step's positional start (units before its position) and the % of the last finished position (the active run's last `DONE` numbered row, passing over the step's own trailing rows, with Step 1 and row-less positions counted as finished once passed) — the start % equals the done line before it in every flow, including a passing group gate followed by the next group, and a loop back shows the lower position · B) **positional only:** units before the step's position — simplest, but after a skipped conditional step (build Step 9 when verify passes, build Steps 13-14, ship Step 4 on Path A) the start line jumps above the last shown line, so the "equals" criterion fails exactly at the group boundary the issue cares about · C) positional start, and a passing group gate reports the group's end % — fixes the group boundary only, and changes the % of an existing done line
  - **Recommended:** A) finished-before, capped by position — on forward flow the start % equals the done line before it, and on a loop back (Concrete Example step 3) it is lower than that done line, as the issue's retry-loop Edge Cases row requires; it changes no existing done line. Confirming A confirms that Success Criterion 2's "equals" holds on forward flow and "lower" holds on a loop back.
  - **Default if unanswered:** A.
- **Open Question:** Should the passing group gate's suffix say `done` or `passed`, and where does it sit? → the owner, at plan review.
  - **Options:** A) `· Group {g} of {G} done`, replacing the line's `· Group {g} of {G}` suffix and placed last, after any `· Attempt {a} of {max}` — the line ends with it and never repeats the group · B) `· Group {g} of {G} passed` in the same place — names the gate result, but "passed" reads as a verdict while the line marks a boundary · C) append `· Group {g} of {G} done` after the existing suffixes — matches the issue text literally, but repeats `Group {g} of {G}` twice on one line
  - **Recommended:** A) `done`, replacing the group suffix — it pairs with `Starting` and keeps the line short on a phone.
  - **Default if unanswered:** A.
- **Open Question:** How does build's group-start block stop losing its line? The issue's test row reads "build's group-start blocks no longer discard their output". → the owner, at plan review.
  - **Options:** A) run `steps start --number=7 --group={GROUP}` on every group entry, before the once-per-group `steps done --step=build-group-start` bookkeeping write, which keeps its `>/dev/null` because its own output is a Step 7 **done** line written at the group's start · B) remove `>/dev/null` and make the `build-group-start` completion return the start line, with `steps start` only on resume — two paths for one line, and a completion verb that returns a non-completion line
  - **Recommended:** A) — one path shows the group's line on fresh and resumed entries alike; the matrix row is met because the group's start line is no longer lost.
  - **Default if unanswered:** A.
  - **If** the owner picks B → Task 7's `build group start shows its start line` test, its `DONE WHEN` and the bookkeeping write all change: the test then fails while the `build-group-start` output goes to `/dev/null`, as the issue's test reads.
- **Open Question:** How does the completeness check treat the new `steps start` calls? → the owner, at plan review.
  - **Options:** A) **required, like every `"{BKIT}"` call** (decision `894-start-block-per-numbered-step`) — the sweep reports a skipped start call as a hole, but an unclosed run that spans the upgrade reports a hole for each start call it never made, and build Step 7 visits that `status-holes-shared-row-key-splits-build-step-7` splits off can show a false start-call hole · B) **exempt `steps start` from the required calls** in `status-holes.ts` — no false holes, but a skipped start line goes unseen by the sweep, and only the shape test holds the blocks in place · C) **required, with the contract judged by the workflow version the run started on** — no false holes for runs spanning the upgrade, but it needs a version stamp on every run (`Out of Scope`)
  - **Recommended:** A) required — it keeps the sweep able to see a skipped start line; the false holes are limited to unclosed runs that span the upgrade, and Tasks 5 and 7 pin how the contract charges the calls.
  - **Default if unanswered:** A.
- **Assumption:** "Never write a status row" means no `step-done` (or any other step) row; the CLI's ordinary `engine-call` journal row for each `steps start` call still lands in `status.jsonl`, as it does for `steps gate` → if the owner means no row of any kind, the verb must opt out of the journal, and the Tier-3 status-holes sweep (`.bkit/core/engine/checks/status-holes.ts`) would then report every start call as missing evidence.
- **Assumption:** Build Step 7's only start call is the one in sub-step 2, because `GROUP` is unset before `context brief --next` runs, and a null `GROUP` routes to Step 10; a resume into Step 7 runs that call once when sub-step 2 runs, not a second time before it → if the resume entered Step 7 past sub-step 2, the group's start line would not show on that resume.
- **Assumption:** Each looped step's start call passes the attempt its own done line records: build Step 8 `--attempt-of=build-plan-verify:next`, Step 9 `build-plan-verify:current`, Step 11 `--attempt={CHALLENGE_ROUND}`, Step 12 `build-run-tests:next`, Steps 13-14 `build-run-tests:current`; debug Step 3 `debug-run-tests:next`, Step 6 `debug-run-tests:current`, Step 7 `debug-failure-remediate:next:all`, Step 8 `debug-failure-soak:next:all`; ship Step 10 `ship-merge-pr:next`, Steps 11-12 `ship-merge-pr:current` → if a finish changes its attempt source later, its start line shows a different attempt from its done line until the start call is updated.
- **Assumption:** In start mode an explicit `--attempt` / `--attempt-of` wins over the completion-time overrides in `stepProgress` (debug remediation count across runs, saved soak count, saved challenge round), because at a step's start the saved fields still hold the previous round → if the overrides were applied, the start line of debug soak and build challenge would show the previous attempt.
- **Assumption:** A step that decides to skip itself through a route (build Steps 4 and 5) places its `Start:` block at the head of the work sub-step the route enters; a step behind a `**Skip if**` / `**Run only if**` line places it after that line → if a step skips in a way the plan did not list, it shows a start line on its skip route until the shape test's skip rule is widened.
- **Assumption:** Renumbering sub-steps is avoided: the `Start:` block is an unnumbered lead before sub-step 1 (or a lead inside the work sub-step), so no `sub-step N` route reference changes → if a step's first sub-step must hold the call, its route references move and the matching `.bkit/instructions.md` local entries need rewriting (knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`).
- **Assumption:** The `CHANGELOG.md` entry goes in a new top block for the next version, because `## [6.1.1]` is released → if the owner keeps an open block elsewhere, the entry moves there.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #894
```

Or, to address the reasons first: `/bkit-plan #894`
