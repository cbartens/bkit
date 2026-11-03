Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- 2 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/plan-v1-draft.md`, `docs/plans/202611/logs/825-show-progress-bar/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/related-deferrals.md`, `docs/plans/202611/logs/825-show-progress-bar/related-failures.md`, `docs/plans/202611/logs/825-show-progress-bar/related-issues.md` |
| plan-review | CONCERNS | 3 | 1 | `docs/plans/202611/logs/825-show-progress-bar/plan-review-1.md`, `docs/plans/202611/logs/825-show-progress-bar/plan-review-2.md`, `docs/plans/202611/logs/825-show-progress-bar/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/plan-v2-reviewed.md`, `docs/plans/202611/logs/825-show-progress-bar/plan-update-check.md` |

## Acceptance Scenario

### Narrative
While a `/bkit-*` workflow runs, the owner can't easily tell how far along it is or how much is left. After every step, the workflow should show one progress line, with a bar first:

```text
Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3
Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
```

The engine works out the line and the agent shows it word for word, so the agent never makes up a number.
### Success Criteria
- After every step that writes a `step-done` row, in all five step-listed workflows (design, plan, build, debug, ship), the agent shows exactly the line the engine printed.
- The % is worked out by the engine from `status.jsonl` and the plan alone, so a run that resumes after a stop shows the same line it would have shown without the stop.
- In build, adding task groups partway through increases the total straight away, and `Group {g} of {G}` shows the new count.
- A loop going back makes the % go back, and the line shows `Attempt {a}`.
- On a 375px-wide phone screen, the `Progress: {bar} {pct}%` part never wraps, and only the text after it may go onto a second line (checked by screenshot in the Claude app).
### Process Sketch
- **WHEN** ship Step 10 finishes on attempt 2 of 3 **→ THEN** the owner sees the exact 71% line in the Concrete Example.
- **WHEN** build finishes Step 8 in group 2 of 3 **→ THEN** the owner sees 50% and `Group 2 of 3`.
- **WHEN** build gains task groups **→ THEN** its next line uses the new total and group count.
- **WHEN** a retry returns to an earlier step **→ THEN** the percentage falls and the attempt suffix explains the retry.
- **WHEN** the last step finishes **→ THEN** the line reaches 100%.
- **WHEN** an owner pause is recorded **→ THEN** no progress line appears.
### Concrete Example
**Setup:** The owner follows a ship workflow in a chat on a 375px-wide phone. The workflow is completing Step 10 on its second merge attempt, with an allowance of three.

**Steps:**

1. The merge step records its completion in `status.jsonl`.
2. The engine returns `Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3`.
3. The agent shows that string word for word as plain text. The text after the percentage may wrap.

**Outcome:** The owner can read the bar and 71% on one line and can see the completed step and retry count.
### Edge Cases
<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Build before Step 4, so no plan yet | G counts as 1; the total corrects itself once the plan exists |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form) | Counts as done; the line still prints |
| Step that ends in `steps done` or `steps gate` rather than `steps finish` (Step 1, closes, ship Steps 3 and 9) | Prints the same line |
| Decision Pause and owner-pause rows | No line; they aren't steps |
| Run resumed after a stop | Line worked out again from `status.jsonl`; same values |
| `/bkit-auto` | No line of its own; shows the lines of the workflow it hands off to |
| Headless / cloud run | Line still printed; nothing waits on it |
| Last step of the workflow | 100%, and only there |
| Several status rows share a numbered step | Count their number once; show the line for each completed row. |
| No usable task groups in the plan | Use the minimum of one group; reread the plan on each emission. |
| Prior workflow runs share the status file | Select the target active or just-closed run; prior runs cannot change its position or attempt. |
| A nonfinal position rounds to 100% with many groups | Clamp the displayed value to 99%; reserve 100% for the final numbered step. |
| Gate is read-only, has no status path, or validates a previously recorded completion | Do not append a synthetic row; emit only when it represents a completed numbered workflow step with enough status context, without a second line for an already emitted row. |
| Invalid status or plan content | Preserve existing command validation and failure behavior; do not fabricate completion or success. |

## Open Questions

- **Assumption:** A step's displayed number identifies the completed step, and percentages describe position rather than elapsed time. If wrong, the completion formula and wording need to change.
- **Assumption:** Percentages use nearest-integer rounding; filled cells use nearest-ten rounding, clamped to 0-10. A nonfinal step is capped at 99%, even when its bar has ten filled cells. If wrong, the exact expected strings change.
- **Assumption:** Gate-only steps use the optional numeric position to distinguish ship Steps 3 and 9 from the earlier row ids their gates validate. If wrong, those steps would display 2 and 8 instead of 3 and 9.
- **Assumption:** Claude app typography can keep the 25-character prefix intact at 375px. The engine controls characters, while the app controls layout. If wrong, the stated phone success criterion needs an owner decision on the format.
- **Open Question:** Should a line add a short reason when the total grows, such as `· 2 groups added`?
  - **Options:** A) Keep the specified format — derive each line from current rows and the current plan without new stored state. · B) Add the reason — define and persist a previous group count, widening the row contract and format.
  - **Recommended:** A) Keep the specified format, because the updated denominator and group suffix already expose the current count.
  - **Default if unanswered:** A) Keep the specified format.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #825
```

Or, to address the reasons first: `/bkit-plan #825`
