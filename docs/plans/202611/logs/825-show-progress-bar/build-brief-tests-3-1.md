# Brief: group 3 — Challenge round 1 findings (tests)

Plan: Workflow Progress Line Implementation Plan

## Why and what

### Context & Goals

Expose the engine's deterministic step position as a compact plain-text chat line. Reuse the workflow step table, active status run, plan parser and existing attempt limits. Keep existing CLI output keys and status-row schemas intact.

**Workstreams:** Entire issue; no prerequisite workstreams or parent design.

**Related Issues:**

- [#825 — Show a progress bar line after every workflow step (open)](https://github.com/cbartens/bkit/issues/825)

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

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Weighting steps by how long they take | The issue explicitly excludes it; unit positions satisfy the acceptance contract. | A separate timing design; `825-duration-weighted-progress`. |
| A live bar in a status line or app UI | The issue explicitly asks for chat lines and excludes an app UI. | A separate application feature; `825-live-status-bar-ui`. |

## Where it fits

- Group 1: Engine works out and prints the line — done
  - TASK 1: Work out a run's progress line from its status rows, its group count and its attempt budget — done
  - TASK 2: Print the line from every call that writes a numbered step-done row and support gate-only completions — done
- Group 2: Workflows show the line — done
  - TASK 3: Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block — done
  - TASK 4: Update the docs that describe narration and step endings — done
- Group 3: Challenge round 1 findings — this group
  - TASK 5: Resuming debug or retrying challenge formatting displays an incorrect budget attempt — open

## The work

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Resuming debug or retrying challenge formatting displays an incorrect budget attempt
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:481` · **Round:** 1
  - **DONE WHEN:** Progress derives the attempt and allowance from the same workflow counter: normal debug remediation uses its cross-run remediation count, saved soak attempts survive later completions, and build challenge uses its challenge round rather than its report invocation count. This preserves the counter scopes documented in `.bkit/core/.bkit/workflows.md` under Counters and Progress Lines and the plan's requirement to use normal/soak/challenge counter contexts.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress normal debug attempts span runs` fails when one remediation in a completed debug run followed by the first remediation in a new run with a frozen maximum of three emits no `Attempt 2 of 3` suffix.
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reuses saved soak counter on later completions` fails when a saved `soakAttempt: 4`, a maximum of three and one grant are followed by `debug-run-tests --attempt=2`, producing `Attempt 2 of 6` instead of `Attempt 4 of 6`.
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress challenge budget follows round rather than report attempt` fails when `build-challenge --attempt=2 --field=round=1` follows the first report in round one and incorrectly prints `Attempt 2 of 2`, although the challenge remains in its first budget round.
<!-- bkit:task 5 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A fresh plan read reflects new groups and a resumed command produces the same line from saved rows. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Row-writing close and non-finish step endings expose one line; pauses, failed writes and unrelated read-only gates expose none. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Malformed or unreadable progress inputs fail before completion append or commit; refused commits emit no progress. Normal command-journal rows remain permitted and observable. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| progress normal debug attempts span runs | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 5 |
| progress reuses saved soak counter on later completions | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 5 |
| progress challenge budget follows round rather than report attempt | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 5 |
