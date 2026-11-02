# Brief: group 1 — Engine works out and prints the line (tests)

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

- Group 1: Engine works out and prints the line — this group
  - TASK 1: Work out a run's progress line from its status rows, its group count and its attempt budget — open
  - TASK 2: Print the line from every call that writes a numbered step-done row and support gate-only completions — open
- Group 2: Workflows show the line — next
  - TASK 3: Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block — open
  - TASK 4: Update the docs that describe narration and step endings — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Work out a run's progress line from its status rows, its group count and its attempt budget
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: add the pure `runProgress` helper beside the existing workflow table, with the precise unit formulas, suffix ordering and rounding described above; preserve resume behavior.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: add the derived calculation cases and repair any existing test this logic changes.
  - **READ:** `parsePlanBlocks` in `.bkit/core/engine/commands/workflow/plan-blocks.ts`: use its task-group contract as the supplied group-count source.
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: existing attempt, frozen limit and allowance semantics.
  - **DEPENDS ON:** none
  - **DONE WHEN:** The five step-table tests in the issue matrix and the added table/fallback/attempt/boundary cases pass; ship Step 10 is 71%, build group 2 Step 8 of three groups is 50%, group growth changes totals, loops lower position, and only the final numbered step is 100%.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress flat workflow` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress build groups` fails on a missing `runProgress` or sparse group markers being treated as ordinal positions instead of mapped to file order
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress groups added` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress loop back` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress bar width` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress all workflow numbers` fails on duplicate step ids inflating totals or a rowless ship number being unavailable
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress missing plan fallback` fails on an absent or empty group list producing an invalid build denominator
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress attempt suffix` fails on attempt 1 being shown, an unbudgeted attempt inventing a max, or suffix ordering changing
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress final completion only` fails on a nonfinal high-group position rounding to 100% or final workflow positions failing to reach 100%

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Print the line from every call that writes a numbered step-done row and support gate-only completions
  - **UPDATE:** `writeStepRow` in `.bkit/core/engine/commands/workflow/steps.ts`: resolve and validate fallible progress inputs before completion append/commit, prepare the line from the prospective row, and expose it only after the existing write/commit succeeds, without persisting it in the row.
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: emit `progressLine` alongside existing output keys.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: make `steps done` emit `progressLine`; add explicit validated `--progress-number` to `steps gate` and declare the output metadata.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.ts`: expose and reuse existing frozen budget/grant resolution as needed, preserving loop policy and avoiding a circular import.
  - **UPDATE:** `closeWorkflow` in `.bkit/core/engine/commands/workflow/workflows.ts`: return the close line from the successful row and preserve it through close/flush output before cleanup.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: forward optional progress from recorded context finalisation and its output metadata.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: forward optional progress from recorded dispatch completion and its output metadata.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: accommodate the shared return contract while keeping unnumbered test-red bookkeeping silent.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: preserve existing command fixtures and add output/validation cases.
  - **CREATE:** `.bkit/core/engine/commands/workflow/progress.integration.test.ts`: real-filesystem command wiring tests using existing fixture patterns; reason (a) in Reuse Inventory.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: update command specification output/flag descriptions and regenerate the CLI reference with `pnpm cli:sync`.
  - **READ:** `planFiles` in `.bkit/core/engine/commands/workflow/run-facts.ts`: canonical plan resolution for this feature and month.
  - **READ:** `parsePlanBlocks` in `.bkit/core/engine/commands/workflow/plan-blocks.ts`: parse current groups on each emission.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Both `steps finish` and `steps done` print `progressLine`; all emitting wrappers declare and forward it once, real plan edits immediately update totals, saved rows reproduce the same resumed line, numeric gates validate and display the correct table position without domain-row mutation while preserving normal command-journal rows, invalid progress inputs create no completion row or commit, and every test listed below passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finish prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `done prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `progress output metadata` fails on an emitting command omitting its declared progress output
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `gate progress number validation` fails on invalid workflow numbers being accepted or a failed gate returning a completion line
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reads fresh plan groups` fails on cached groups surviving an edit to the real plan between completions
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress resumes from saved run` fails on unrelated prior runs or changed live package limits altering the saved run's output
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress loop attempts and grants` fails on debug normal/soak, ship merge or build verify/test/challenge retries omitting the correct attempt or saved grant budget
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress specialized completion producers` fails on recorded context, dispatch or close wrappers dropping the eligible line or emitting it twice
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress gate only completions` fails on Step 1 and rowless ship Steps 3/9 losing their table position, a gate adding domain rows or changing existing rows, or real dispatch losing its normal `engine-call` journal row
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions` fails on decision/owner pauses, unnumbered test-red bookkeeping, failed/refused writes or validation-only gates producing progress, or table-driven malformed/unreadable progress-input cases appending a domain completion row or creating a commit; preserve and check normal engine journal rows

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Units and % for a flat workflow (ship Step 10 of 14 → 71%, 7 filled cells) | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Build with 3 groups: Step 8 of group 2 → 50%, `Group 2 of 3` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Build total grows when the plan gains groups after Step 11 | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| A loop back lowers the % and adds `Attempt {a} of {max}` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Line starts `Progress: `, has a 10-cell bar with no spaces, and the bar part is <= 25 characters | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| `steps finish` and `steps done` print `progressLine` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| All five workflow tables, duplicate numbers, sparse group markers, missing-plan fallback, nonfinal rounding and final completion produce the specified position. | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| A fresh plan read reflects new groups and a resumed command produces the same line from saved rows. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Row-writing close and non-finish step endings expose one line; pauses, failed writes and unrelated read-only gates expose none. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Malformed or unreadable progress inputs fail before completion append or commit; refused commits emit no progress. Normal command-journal rows remain permitted and observable. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Registered command output metadata declares `progressLine` for every emitting verb. | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
