# Brief: group 2 — Workflows show the line

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
- Group 2: Workflows show the line — this group
  - TASK 3: Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block — open
  - TASK 4: Update the docs that describe narration and step endings — open

## The work

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
  - **DONE WHEN:** The instructions sync check reports no drift; all five numbered workflows expose progress at their step endings, auto forwards its delegated lines, and the supported host render tests retain the rule. Task 4 performs the final upgrade and mirror drift check after its source documentation edits.
  - **TEST FIRST:** n/a — prompt wording and generated payload, verified by the instructions synchronization check, existing workflow-shape checks and provider render tests; regenerated baselines are not behavior-first tests.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Update the docs that describe narration and step endings
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: describe the final progress contract, formulas, loop backtracking, gate-only numeric positions and plain-text narration.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: explain the generated progress output and additive gate option outside the generated command-spec region where appropriate.
  - **UPDATE:** `docs/testing.md`: in § Key test files below `<!-- bkit:end -->`, record focused progress calculation/command coverage and the owner-run phone procedure in this project-owned region.
  - **UPDATE:** `CHANGELOG.md`: add the behavior entry in the current unreleased section.
  - **CREATE:** `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md`: the 375px Claude app check procedure, expected exact prefix, screenshot/evidence fields, and explicit `not run` / `passed` / `failed` outcome for build handover; reason (a) in Reuse Inventory.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** The docs name the progress line and where it comes from; they match the implemented output keys, formulas and gate behavior; the phone check procedure exists with the expected 375px screenshot evidence to collect and its explicit outcome is carried into build handover; final upgrade and generated CLI/mirror drift checks pass after all source edits. The phone criterion remains unverified while the outcome is `not run`.
  - **TEST FIRST:** n/a — docs and manual external-app E2E procedure.

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Print the line from every call that writes a numbered step-done row and support gate-only completions — `.bkit/core/engine/commands/workflow/progress.integration.test.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/context.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/.bkit/cli.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Narrate the exact line across hosts | `.bkit/instructions.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-auto.md` | `rg -n -m 3 'workflow-narrate\|Narrate\|steps gate' .bkit/instructions.md .bkit/core/workflows/bkit-*.md`; read the clause and matching gate calls. | Shared clause and six source workflows | EXTEND | Add wording through instruction synchronization and adjust only calls that hide or lack the progress output. |
| Verify provider rendering | `.bkit/core/engine/render/hosts.test.ts` | `rg -n -m 4 'transform\|provider\|codex' .bkit/core/engine/render/hosts.test.ts`; opened renderer imports and transform cases. | Existing renderer suite | EXTEND | Check the new text survives every supported host transform. |
| Describe output and narration | `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`, `CHANGELOG.md` | `rg -n -m 3 'Step endings\|Narrate\|## Tiers\|## Key test files\|Unreleased' .bkit/core/.bkit/cli.md .bkit/core/.bkit/workflows.md docs/testing.md CHANGELOG.md`; read the matching documentation. | Existing canonical docs | EXTEND | Update existing homes; regenerate CLI reference and installed mirrors. |
| Record the phone verification procedure | `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` | `rg --files --hidden -g '*phone*' -g '*claude*' -g '*plan-input*' docs/plans/202611/logs/825-show-progress-bar tests`; `rg -n -m 3 -e 'Workflow logs' -e 'Manual Verification' -e '375' .bkit/workflows.md docs/templates/bkit-plan.md docs/testing.md`. | A Claude settings fixture and the current plan input exist, but no phone verification artifact exists. The template provides owner-run manual checks. | NEW | Reason (a): no verification artifact exists for this feature; a run-local procedure and screenshot evidence belong in workflow logs. |

### Architecture entries

#### [MODIFY] `.bkit/instructions.md` and all six `.bkit/core/workflows/bkit-*.md` sources

- **Existence Check:** Opened the narration clause and all workflow sources' relevant calls.
- Extend `workflow-narrate` without removing its current wording: show the engine's `progressLine` word for word as plain text after each completed step, outside code blocks. Keep other narration.
- Enable explicit numeric gate rendering for the five Step 1 gates and ship Steps 3/9. Show those lines at those step endings. Delayed Step 1 bookkeeping and repeated mechanical gates do not cause a second chat line for the same completion.
- Preserve progress-bearing output instead of redirecting it to `/dev/null` when it is the step's only observable completion. Internal bookkeeping may remain quiet where its completed numbered step already has a visible gate line.
- `/bkit-auto` adds no independent progress; it forwards the invoked workflow's lines. Headless execution uses the same emission and never waits for acknowledgement.
- Run `pnpm instructions:sync` and update the corresponding source workflow catalog. Group 1's engine commits include the required build and `dist/` update. Run the final normal upgrade and generated drift checks once after Task 4's source documentation edits, so every provider mirror includes all changes.

Reuse Inventory rows left out: 0; Architecture entries left out: 2 — read them in docs/plans/202611/825-show-progress-bar-plan.md § Reuse Inventory and § Architecture & Component Changes.
