# Workflow Progress Line Implementation Plan

> **Purpose:** The implementation plan for a progress line after every workflow step.

## Context & Goals
Expose the engine's deterministic step position as a compact plain-text chat line. Reuse the workflow step table, active status run, plan parser and existing attempt limits. Keep existing CLI output keys and status-row schemas intact.

**Workstreams:** Entire issue; no prerequisite workstreams or parent design.

**Related Issues:**

- [#825 — Show a progress bar line after every workflow step (open)](https://github.com/cbartens/bkit/issues/825)

## 👤 ⚠️ Acceptance Scenario
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
### Derived Test Matrix
`Unit` and `Integration` follow the repository's tier names in `docs/testing.md`. Original issue descriptions are preserved.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Units and % for a flat workflow (ship Step 10 of 14 → 71%, 7 filled cells) | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Build with 3 groups: Step 8 of group 2 → 50%, `Group 2 of 3` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Build total grows when the plan gains groups after Step 11 | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| A loop back lowers the % and adds `Attempt {a} of {max}` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Line starts `Progress: `, has a 10-cell bar with no spaces, and the bar part is <= 25 characters | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| `steps finish` and `steps done` print `progressLine` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| All five workflow tables, duplicate numbers, missing-plan fallback, nonfinal rounding and final completion produce the specified position. | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| A fresh plan read reflects new groups and a resumed command produces the same line from saved rows. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Row-writing close and non-finish step endings expose one line; pauses, failed writes and unrelated read-only gates expose none. | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 2 |
| Registered command output metadata declares `progressLine` for every emitting verb. | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| All six workflow sources carry the narration clause and provider renders retain it without swallowed command output. | Static | `.bkit/core/engine/render/hosts.test.ts` | 3 |
| The Claude app renders the prefix without a break at 375px, with plain text and a wrapping suffix. | E2E | `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` | 4 |
### 👤 ✅ Human Confirmation
- [ ] **Acceptance Scenario confirmed:** The owner has reviewed this section.

## 👤 ⚠️ Breaking Changes & Naming Review
Add the output key `progressLine` to completion commands and the pure helper `runProgress` beside `WORKFLOW_STEPS`. Keep the existing `counters progress` and `loopProgress` names and behavior. Add an explicit optional `--progress-number` gate flag for numbered gate-only completions; it renders a position from `WORKFLOW_STEPS` without adding status rows or altering resume behavior. Existing command keys, exit codes and persisted rows retain their contracts.
### 👤 ✅ Human Confirmation
- [ ] **Breaking Changes confirmed:** The owner has reviewed this section.

## 👤 ⚠️ Open Questions & Assumptions
- **Assumption:** A step's displayed number identifies the completed step, and percentages describe position rather than elapsed time. If wrong, the completion formula and wording need to change.
- **Assumption:** Percentages use nearest-integer rounding; filled cells use nearest-ten rounding, clamped to 0-10. A nonfinal step is capped at 99%, even when its bar has ten filled cells. If wrong, the exact expected strings change.
- **Assumption:** Gate-only steps use the optional numeric position to distinguish ship Steps 3 and 9 from the earlier row ids their gates validate. If wrong, those steps would display 2 and 8 instead of 3 and 9.
- **Assumption:** Claude app typography can keep the 25-character prefix intact at 375px. The engine controls characters, while the app controls layout. If wrong, the stated phone success criterion needs an owner decision on the format.
- **Open Question:** Should a line add a short reason when the total grows, such as `· 2 groups added`?
  - **Options:** A) Keep the specified format — derive each line from current rows and the current plan without new stored state. · B) Add the reason — define and persist a previous group count, widening the row contract and format.
  - **Recommended:** A) Keep the specified format, because the updated denominator and group suffix already expose the current count.
  - **Default if unanswered:** A) Keep the specified format.
### 👤 ✅ Human Confirmation
- [ ] **Open Questions & Assumptions confirmed:** The owner has reviewed this section.

## Alternative Approaches & Recommendations
Extend the existing step table and row-writing seam. Native arithmetic, `Math.round` and string repetition are sufficient; no terminal progress library is needed for a fixed chat string. A stored percentage or a maximum-ever position would become stale when groups grow and hide loop backtracking. A separate progress module duplicating the step table would create a second source of truth. Keep a pure calculation beside the table and reuse existing file readers in its command adapter.
## Out of Scope
<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Weighting steps by how long they take | The issue explicitly excludes it; unit positions satisfy the acceptance contract. | A separate timing design; `825-duration-weighted-progress`. |
| A live bar in a status line or app UI | The issue explicitly asks for chat lines and excludes an app UI. | A separate application feature; `825-live-status-bar-ui`. |
## Suggested Scope Expansion
None identified in the supplied input. Related issue, failure and deferral context gathered by the workflow may add candidates during review without expanding the runbook.
## Security & Privacy
- [x] **User Input:** Validate the new optional gate number against the selected workflow table, using existing command parsing. Derive titles only from trusted `WORKFLOW_STEPS` entries.
- [x] **PII:** Emit only fixed titles, group indices, attempts and percentages. Do not include plan text, issue text, paths, credentials or fetched logs in the line.

No new routes, database writes, role mutations, redirects, webhooks, secrets or environment variables. Keep status and plan reads scoped to the supplied run's checkout. Preserve existing validation and exit codes when a write fails.
## Pre-Flight / Dependencies
No prerequisite plan or new service access is required. The issue supplies the acceptance contract and initial tasks. The input references no parent design or audit report.
### Core
- [x] **Package Management:** Existing TypeScript, Vitest and pnpm tooling is declared; this plan adds no dependency or manifest change.
- [x] **Dependency Versions:** Ran `pnpm bkit:deps:outdated`. It exited 1 because `oxlint-tsgolint` 7.0.2004 has 7.0.2005 available, `@types/node` 24.19.2 has 26.6.5 available and `vite` 6.4.5 has 8.3.5 available. These are existing dev dependencies; no upgrade is needed for this change. Checked Node v24.16.0, pnpm 10.34.7, TypeScript 7.0.2 and Vitest 5.0.5 against the project's declared versions.
- [x] **Existing-Solution Search:** The searches and reuse decisions are recorded below; native arithmetic and string operations cover formatting.
- [x] **User Context:** All required files are readable. The optional suffix question has a recommended default; the phone screenshot remains an owner-run check in the Claude app.
- [x] **Project Context:** Folded decisions and knowledge by key and timestamp, and read the relevant active summaries. Existing rules retain one status log, derive counters from saved rows, freeze attempt limits at run start and add grants without resetting attempts.
- [x] **Testing & Quality:** Use Unit for pure calculation and single-command wrappers, Integration for saved-status/plan/command wiring, Static for text synchronization and provider renders, and a manual E2E observation for Claude app layout.
- [x] **Prerequisite Plans:** None.
### Conditional
- [x] **Architecture & UI:** Extend the existing workflow command modules and source payload. No app UI is authored; the external Claude app supplies the final presentation.
- [x] **Observability:** `progressLine` is structured CLI stdout, as `docs/observability.md` describes. It carries only table titles and numeric state.
- **Secrets & Env Vars:** Not applicable; no new secrets or service accounts.
- **Schema State:** Not applicable; no database.
- **Notifications:** Not applicable; a progress chat line is not an alert or toast.
### 🔒 Gate 1: Prerequisites Check
- [ ] **Acceptance Scenario confirmed:** The owner confirms the acceptance section.
- [ ] **Breaking Changes confirmed:** The owner confirms additive output and naming.
- [ ] **Open Questions confirmed:** The owner accepts the assumptions and default.
- [x] **Security & Privacy checked:** Applicable handling is recorded below.
- [x] **Reuse Inventory complete:** Capabilities name their searches and decisions.
- [x] **Reuse reasons:** Every new artifact has a searched reason.
- [ ] **Gate 1 — Verified:** Owner confirmations remain open.
## Data Schema Integration
No database integration. Existing `step-done`, `workflow-started`, `workflow-done` and allowance rows are inputs; no new persistent fields or row types are introduced.
### Data Schema Usage
None.
### Data Schema Changes
None.
## Reuse Inventory
The source search covered `.bkit/core/engine/commands/workflow`, `.bkit/core/engine/ledgers`, `.bkit/core/.bkit`, the instruction register and `docs/capabilities.md` for `step-done`, `progressLine`, `WORKFLOW_STEPS` and `workflow-narrate`. Language-server overview and references confirmed `writeStepRow` callers. `progressLine` has no existing implementation; existing table, status and plan readers cover its inputs. The capability register confirms module boundaries, while text search corroborates missing progress behavior. Node's existing arithmetic/string built-ins provide all formatting; no framework integration or package research is required.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Calculate numbered position and format the bar | `.bkit/core/engine/commands/workflow/step-table.ts` | Read `WORKFLOW_STEPS`, resume logic and neighboring tests; searched `progressLine`. | `WORKFLOW_STEPS`, `isResumable` | EXTEND | Add a pure calculation beside the canonical table, preserving resume behavior. |
| Read current groups and emit completion output | `.bkit/core/engine/commands/workflow/steps.ts` | Language-server overview and `writeStepRow` references; read finish, done and gate emitters. | `writeStepRow`, `finish`, `stepsCommand`; `parsePlanBlocks`, `planFiles` in existing modules | EXTEND | Return derived output from the shared seam and expose it in completion commands and explicit gate renderings. |
| Use the same frozen attempt limits and grants as loop routing | `.bkit/core/engine/commands/workflow/counters.ts` | Read `pointLimit`, `activeRunStart`, `grantCount` and frozen settings. | Existing counter/limit helpers | EXTEND | Expose the existing limit-resolution logic as needed without copying its policy or introducing import cycles. |
| Propagate shared completion output through specialized wrappers | `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/context.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/tests.ts` | Language-server references plus opened call sites and output objects. | `closeWorkflow`, `context finalise`, `runDispatch`, `tests red` | EXTEND | Preserve wrapper output contracts while forwarding eligible numbered completion lines once. Unnumbered bookkeeping yields no line. |
| Verify pure and wrapper contracts | `.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts` | Opened existing status fixtures, command runner and temp-repo helpers. | Existing Vitest tests beside production modules | EXTEND | Add focused cases using existing fixtures. |
| Verify saved status and fresh plan reads through real commands | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | Searched the workflow test folder for `progressLine`; opened `steps.test.ts` and `workflows.test.ts` fixtures and `docs/testing.md` tier rubric. | No integration file for progress; existing fixture patterns can be reused. | NEW | Reason (a): no progress integration artifact exists; a distinct integration file keeps multi-module wiring in the required integration tier. |
| Narrate the exact line across hosts | `.bkit/instructions.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-auto.md` | Read `workflow-narrate`, source narration and gate calls, plus redirected completions. | Shared clause and six source workflows | EXTEND | Add wording through instruction synchronization and adjust only calls that hide or lack the progress output. |
| Verify provider rendering | `.bkit/core/engine/render/hosts.test.ts` | Opened renderer test imports and existing provider transforms. | Existing renderer suite | EXTEND | Check the new text survives every supported host transform. |
| Describe output and narration | `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`, `CHANGELOG.md` | Read step-ending documentation, header Protocol table, testing tier sections and changelog. | Existing canonical docs | EXTEND | Update existing homes; regenerate CLI reference and installed mirrors. |
| Record the phone verification procedure | `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` | Read plan-log path convention and testing UI rubric; no app-specific automated harness exists. | Plan's owner-run manual checks | NEW | Reason (a): no verification artifact exists for this feature; a run-local procedure and screenshot evidence belong in workflow logs. |
## Architecture & Component Changes
**Ledger rows:** `825-progress-derived-from-current-step-and-plan`, `825-duration-weighted-progress`, `825-live-status-bar-ui`.
### Database Migrations
None.
### Engine
#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** Opened the table and existing resume implementation.
- Add the proposed pure helper `runProgress` alongside `WORKFLOW_STEPS`. Its inputs include workflow, completed step/number, current group/count, attempt and optional maximum. Return percentage and the full line. Keep I/O in existing command modules.
- Count distinct numbered table positions, including rowless ship positions 3 and 9. Flat workflows use position / distinct-number total.
- For build use `G = max(1, parsed groups)` and total `6 + 3G + 7`. Before the loop use the numbered position. Inside Steps 7-9 use `6 + 3(g-1) + (n-6)`. After the loop use `6 + 3G + (n-9)`. `Step n/16` keeps the human workflow number; it does not show the expanded unit count.
- Duplicate numbers, conditional skips and repeated completions do not increase the denominator. Use the current completed position rather than a high-water mark or count of all completed rows, so retries can move backward.
- Round the percentage to the nearest whole number and cap nonfinal output at 99%; final numbered completion is 100%. Produce exactly ten bar cells and a prefix of at most 25 characters. Use `Progress: {bar} {pct}% · Step {n}/{steps} {title}`, then the group suffix only inside build Steps 7-9, then the attempt suffix only above 1. Use `Attempt {a}` when the step has no limit.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** Opened `writeStepRow`, `finish` and the done/gate emitters.
- Extend the result of `writeStepRow` with a derived optional `progressLine`, calculated only after a successful recorded `DONE` completion. Keep the field out of the persisted row and never print a line for a refused/rolled-back write, owner pause, decision step or unrecognized unnumbered bookkeeping row.
- Use the supplied status path to locate this feature's current canonical plan, reuse `planFiles` and `parsePlanBlocks`, and reread its text on every emission. Before the plan exists use one group. Preserve parser/validation errors rather than silently pretending a malformed existing plan is a missing plan.
- Scope the row selection to the current target run, including the run just closed. Ignore prior workflow runs and unrelated rows. Derive retries from the same step/group and normal/soak/challenge counter contexts used by the workflows; do not make up attempts when the row omits one. Use frozen run limits and saved grants, so changing live package settings cannot change a resumed line. Legacy rows without a known budget use the unbudgeted suffix.
- Expose the field in `steps finish` and `steps done` structured output and command output metadata. Ensure `--json` and normal text serialization both preserve the exact string.
- Add optional `--progress-number` to `steps gate`; validate it against the table and render its position after a successful gate. Without the flag, a gate remains validation-only. This explicitly supports Step 1 before its delayed bookkeeping row and rowless ship Steps 3/9, while leaving status history and resume untouched. Failed gates emit no completion line.

#### [MODIFY] `.bkit/core/engine/commands/workflow/counters.ts`

- **Existence Check:** Opened the frozen limit reader, `pointLimit` and grant counter.
- Share existing frozen limit and grant resolution with the completion adapter when needed. Keep attempts and grants consistent with `counters max --point`; preserve all existing exports and routing behavior.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/context.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** Opened each `writeStepRow` call and its wrapper output.
- Forward eligible shared output from `closeWorkflow`, `context finalise --record` and `runs dispatch --file/--step`. Compute close output before destructive cleanup, and preserve it through flush/ship close returns.
- `tests red` uses `build-tests-red`, which is not a numbered table step; it remains bookkeeping with no standalone line. Other non-table rows are excluded by the same rule. Keep their schemas and control flow intact.
- Update output metadata for emitting verbs and propagate the optional return type through explicitly typed call sites.

#### [MODIFY] Existing tests and [NEW] `.bkit/core/engine/commands/workflow/progress.integration.test.ts`

- **Reuse Check:** Existing Unit files gain calculation and output cases; the new integration artifact uses reason (a) in `Reuse Inventory`.
- Use real temporary filesystem and Git repositories, the actual status fold, actual plan parsing and actual command dispatch. No filesystem or progress-calculator mocks at this boundary. Assert complete strings plus status/plan ground truth, rather than only exit codes.

### Workflows and Documentation

#### [MODIFY] `.bkit/instructions.md` and all six `.bkit/core/workflows/bkit-*.md` sources

- **Existence Check:** Opened the narration clause and all workflow sources' relevant calls.
- Extend `workflow-narrate` without removing its current wording: show the engine's `progressLine` word for word as plain text after each completed step, outside code blocks. Keep other narration.
- Enable explicit numeric gate rendering for the five Step 1 gates and ship Steps 3/9. Show those lines at those step endings. Delayed Step 1 bookkeeping and repeated mechanical gates do not cause a second chat line for the same completion.
- Preserve progress-bearing output instead of redirecting it to `/dev/null` when it is the step's only observable completion. Internal bookkeeping may remain quiet where its completed numbered step already has a visible gate line.
- `/bkit-auto` adds no independent progress; it forwards the invoked workflow's lines. Headless execution uses the same emission and never waits for acknowledgement.
- Run `pnpm instructions:sync`; update the corresponding source workflow catalog, then build and run the normal upgrade once to refresh installed copies for every provider.

#### [MODIFY] `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`, `CHANGELOG.md`

- **Existence Check:** Opened the step endings, Protocol table, test tiers and release entries.
- Document output keys and explicit gate rendering in the canonical CLI reference, the narration rule and grouping/retry math in the workflow catalog, focused coverage in the testing doc, and user-facing behavior in the changelog. Generate the command reference from updated command specifications with `pnpm cli:sync`; do not edit generated CLI regions by hand.

#### [NEW] `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md`

- **Reuse Check:** Reason (a) in `Reuse Inventory`.
- Record the owner-run Claude app procedure, viewport width, complete displayed line and screenshot reference. Keep the screenshot outcome separate from automated width assertions; code cannot assert an external app's typography.
### Cron Jobs & Scheduled Tasks
None.
## Supersession Inventory
None. Extend the existing table, emitters, tests and shared narration; no artifact or public API is replaced.
## Documentation Updates
<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/cli.md` | Generated `progressLine` output contracts and optional gate numeric rendering; step endings explanation. |
| `.bkit/core/.bkit/workflows.md` | Narration Protocol row, progress math, loops, gate-only completions and auto forwarding. |
| `.bkit/instructions.md` | Canonical `workflow-narrate` clause; synchronize its six source carriers. |
| `docs/testing.md` | Focused Unit/Integration coverage and the external phone check's manual nature. |
| `CHANGELOG.md` | Announce exact engine-derived chat progress. |
| `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` | Owner-run screenshot procedure and evidence fields. |

The existing document-index rows already cover these doc kinds; no standalone topic doc is introduced. Decision and deferral rows were written during planning and are listed above; no runbook task writes them.
## Rollback Strategy
Code-only — `git revert` sufficient. Revert the feature commit and regenerate `dist/` and installed payload mirrors together. No database migration, persisted progress state or package setting needs reversal. Existing status logs remain readable throughout the rollout.
## Agent Execution Runbook
One implementation PR may carry all groups. Group 1 supplies the engine behavior; Group 2 connects narration, generated payload and documentation. Task groups stay below five tasks and 25 tests; each task stays below ten tests across three files.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine works out and prints the line

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
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress build groups` fails on a missing `runProgress`
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
  - **UPDATE:** `writeStepRow` in `.bkit/core/engine/commands/workflow/steps.ts`: calculate optional progress output after a successful write without persisting it in the row.
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
  - **DONE WHEN:** Both `steps finish` and `steps done` print `progressLine`; all emitting wrappers declare and forward it once, real plan edits immediately update totals, saved rows reproduce the same resumed line, numeric gates validate and display the correct table position without writing a row, and every test listed below passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finish prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `done prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `progress output metadata` fails on an emitting command omitting its declared progress output
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `gate progress number validation` fails on invalid workflow numbers being accepted or a failed gate returning a completion line
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reads fresh plan groups` fails on cached groups surviving an edit to the real plan between completions
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress resumes from saved run` fails on unrelated prior runs or changed live package limits altering the saved run's output
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress loop attempts and grants` fails on debug normal/soak, ship merge or build verify/test/challenge retries omitting the correct attempt or saved grant budget
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress specialized completion producers` fails on recorded context, dispatch or close wrappers dropping the eligible line or emitting it twice
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress gate only completions` fails on Step 1 and rowless ship Steps 3/9 losing their table position or gate rendering mutating status bytes
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions` fails on decision/owner pauses, unnumbered test-red bookkeeping, failed writes or validation-only gates producing progress

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Workflows show the line

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block
  - **UPDATE:** `.bkit/instructions.md`: extend the canonical `workflow-narrate` clause without removing its existing wording, then run `pnpm instructions:sync`.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: synchronized narration and explicit Step 1 progress gate; expose any sole completion output hidden by redirection.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: synchronized narration and explicit Step 1 progress gate; keep deferred Step 1 bookkeeping from duplicating chat output.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: synchronized narration and Step 1 progress gate, group-loop output, skipped Plan Convert and retry routes.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: synchronized narration, Step 1 progress gate and recorded context/close output across normal/soak routes.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: synchronized narration, Step 1 gate and explicit progress numbers 3/9 on the existing gate calls; preserve close/merge retry lines and avoid repeated validation lines.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: synchronized narration, with no independent percentage and delegated workflow output preserved.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: update the matching narration Protocol row and the step-ending explanations.
  - **UPDATE:** `.bkit/core/engine/render/hosts.test.ts`: extend existing rendered-payload checks or regenerate affected baselines so all supported hosts carry the exact narration rule.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** The instructions sync check reports no drift; all five numbered workflows expose progress at their step endings, auto forwards its delegated lines, and the supported host renders retain the rule after build and upgrade regenerate the mirrors once.
  - **TEST FIRST:** n/a — prompt wording and generated payload, verified by the instructions synchronization check, existing workflow-shape checks and provider render tests; regenerated baselines are not behavior-first tests.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Update the docs that describe narration and step endings
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: describe the final progress contract, formulas, loop backtracking, gate-only numeric positions and plain-text narration.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: explain the generated progress output and additive gate option outside the generated command-spec region where appropriate.
  - **UPDATE:** `docs/testing.md`: record focused progress calculation/command coverage and the owner-run phone procedure.
  - **UPDATE:** `CHANGELOG.md`: add the behavior entry in the current unreleased section.
  - **CREATE:** `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md`: the 375px Claude app check procedure, expected exact prefix and screenshot/evidence fields; reason (a) in Reuse Inventory.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** The docs name the progress line and where it comes from; they match the implemented output keys, formulas and gate behavior; the phone check procedure exists with the expected 375px screenshot evidence to collect, and generated CLI/mirror drift checks pass.
  - **TEST FIRST:** n/a — docs and manual external-app E2E procedure.

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->
### 🔒 Gate 2: Code Implementation Check
- [ ] **No bolt-on:** Every new file traces to its Reuse Inventory row.
- [ ] **Extensions landed:** Each extension remains in its named existing artifact.
- [ ] **No gate weakened:** Existing validation, resume and commit behavior remains intact.
- [ ] **Red before code:** Each planned Unit and Integration test has the required recorded evidence.
- [ ] **Tests unchanged:** Planned test cases preserve their recorded assertions.
- [ ] **Unproven tests:** Any exception follows the owner's approval contract.
- [ ] **Gate 2 — Verified:** The checks above have evidence.
### Mandatory Tasks (Testing & Documentation)
- [ ] Verify every Derived Test Matrix row against its assigned task's completion condition.
- [ ] Fix regressions in existing tests touched by the new output or shared return type.
- [ ] Confirm every planned test exists and passes.
- [ ] Verify output contains only trusted table titles and numeric state.
- [ ] Complete each Documentation Updates row and regenerate source-derived artifacts.
### 🔒 Gate 3: Testing & Documentation Check
- [ ] **Docs updated:** All affected existing homes describe final behavior.
- [ ] **Docs index accurate:** Existing index rows still cover the modified docs.
- [ ] **Gate 3 — Verified:** The checks above have evidence.
## Verification Plan
### Automated Tests
- [ ] **Full Local Gate Suite:** Run the declared `bkit:gate:static-unit-integration` suite and `bkit check` in the build workflow's verification step.
- [ ] **Unit:** Run the focused `step-table.test.ts` and `steps.test.ts` tests; validate all five tables and exact strings, not only percentages.
- [ ] **Integration:** Run `progress.integration.test.ts` against real temporary plan/status files and command dispatch, including saved retries, grants, close cleanup and gate-only position output.
- [ ] **Static:** Run the instructions drift check, generated CLI reference check, existing workflow-shape checks and renderer tests across Claude, Cursor, Codex, Antigravity and opencode.
- [ ] **Test Synchronization:** Regenerate only affected provider baselines; no browser project or E2E suite is introduced.
- [ ] **Build Configuration:** Existing `tsconfig.json` excludes `**/*.test.ts`, so the new integration file stays out of production output.
- [ ] **Built CLI dogfood:** Run `pnpm build`, install/upgrade a fresh scratch consumer using the built `dist/cli.js`, then invoke real completion and gate commands on fixture status/plan files. Inspect stdout and the on-disk rows and generated host payload. Confirm output does not add progress fields to persisted rows.
- [ ] **Migrations:** None.
- [ ] **Run all tests:** The build workflow runs Unit and Integration tiers with no network requirement; its standard gates cover regressions outside the focused tests.
### 🔒 Gate 4: Automated Verification Check
- [ ] **Gate 4 — Verified:** The automated checks have saved command output and on-disk evidence.
### Manual Verification
> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** Unticked checks do not block merge or plan approval.

- [ ] Follow one workflow and compare the exact plain-text chat string with the engine's `progressLine` after each completed step.
- [ ] Add a task group to a build fixture and observe the immediate denominator/group-count change, then retry an earlier step and observe the percentage drop and attempt suffix.
- [ ] In the Claude app at 375px width, display the concrete ship example and a 100% final example as plain text. Save screenshots through the phone-verification procedure and confirm the prefix stays on one line while the suffix can wrap. Report an unavailable device/session as unverified; a character-count test alone does not establish rendered layout.
