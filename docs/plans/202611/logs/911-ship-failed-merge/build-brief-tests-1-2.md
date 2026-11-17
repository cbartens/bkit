# Brief: group 1 — Remove ship Steps 11-12 (tests)

Plan: Ship: remove the unreachable Failure Diagnose / Remediate steps Implementation Plan

## Why and what

### Context & Goals

**Workstream dependencies:** None — the plan covers the whole issue (`Workstreams: []`), and no parent design exists.

`/bkit-ship` (`.bkit/core/workflows/bkit-ship.md`) carries two steps for a failed merge, Step 11 — Failure Diagnose and Step 12 — Failure Remediate, that no route reaches. Every route out of Step 10 goes to Step 13, Step 9, Step 3, the Merge Question or the Failure Path, and Step 10 sub-step 4 says "Recoverable merge refusals never enter Steps 11–12". Only a resumed run whose last row is `ship-failure-diagnose` or `ship-failure-remediate` enters them, and such a run holds none of the `MERGE_ASK` / `MERGE_ROUNDS` / `MERGE_MAX` values Step 11 reads. Step 11 also starts `bkit-debug-failure-diagnose` with no `Strategy`, which that prompt answers with `Verdict: FAIL` and an unfilled report.

The owner decided (issue comment, 2026-11-10T06:50:12Z) that a failed merge gets no diagnose-and-fix round inside ship:

- The cases a code fix could help with already have their own routes since #896: a moved head goes to Step 9, and a conflict with `dev` goes to Step 3.
- A red CI run already goes to the Failure Path from the Step 10 merge gate (`runs gate` exit 12), unless every failed CI step is a generated file.
- `/bkit-debug` is the tool for a red CI run at ship time, because it reads the CI run's evidence, reproduces the failure as a failing test and soaks unknown causes, which Steps 11-12 never did.

**Goals:**

- Remove Steps 11-12, every route and sentence that names them, and their step keys from the engine, the workflow checks and the docs.
- Renumber Steps 13-14 to 11-12, so the step numbers stay contiguous.
- Keep status files written before the change readable: `bkit status resume` and `bkit workflows summary` still handle their `ship-failure-*` rows.
- Name `/bkit-debug {FID}` as the next step when ship stops on a red CI run: the Step 2 CI wait on a PR ship opened, the Step 10 merge gate (including a Stop at the Merge Question on a used-up red run) and the post-merge squash capstone. Today neither the failure comment nor the final message names a next step.
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`, which build and debug still use.

The two `docs/failures.jsonl` rows the issue cites (`ship-failure-diagnose-remediate-steps-reachable-only-on-resume`, `ship-failure-diagnose-invoked-without-strategy`) exist on local `dev` only and are not in this branch's base (`f6914f3c9`).

**Related Issues:**

- #911 — Ship: a failed merge never reaches the diagnose and fix steps (OPEN)
- #750 — Workflow optimisation (OPEN)
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (OPEN)
- #904 — Question advisor: a fresh top-tier agent behind every owner question (OPEN)
- #896 — feat(842-ship-fails-local): ship no longer fails when the local branch differs from GitHub's (MERGED)
- #902 — Show every choice made without asking in each workflow's summary (OPEN)
- #849 — WS-9 retires ship Step 13 (Update Local Dev), which renumbers ship again (OPEN); sequence it after this change and rebase its step numbers on this plan's 1-12 numbering
- #811 — Failure Path flush (OPEN); overlaps § Failure Path in `bkit-ship.md` and `.bkit/core/.bkit/workflows.md`

---

### Narrative

The owner runs `/bkit-ship` on a PR whose CI is red; ship stops at the merge gate and names `/bkit-debug {FID}` as the next step, and the workflow holds no diagnose or fix step that no route reaches.

### Success Criteria

1. `bkit-ship.md` has no Failure Diagnose or Failure Remediate step and names no `ship-failure-*` key.
2. Ship's steps are numbered 1-12 in the workflow, the step table and the docs.
3. A red CI run at the Step 2 CI wait, the merge gate or the post-merge capstone ends with `Next step: /bkit-debug {FID}` in the failure comment and the final message, and an owner's Stop at the Merge Question on a used-up red run ends with it in the handover and the final message.
4. `bkit status resume` and `bkit workflows summary` exit 0 on a status file holding `ship-failure-*` rows, and resume lands at the merge step.
5. `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` keep serving build and debug unchanged.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the `Strategy` field (`STANDARD` / `PIVOT` / `FINAL`) from the build and debug fix loops | No Success Criterion, test row or scope bullet needs it: ship's missing-`Strategy` defect ends with Step 11, and the owner's scope says "Nothing else is needed for it"; the issue's References say #911 "does not wait for" #907 | #907 (deferral `911-ship-strategy-field-removal-via-907`) |

## Where it fits

- Group 1: Remove ship Steps 11-12 — this group
  - TASK 1: Remove the ship failure steps from the engine and renumber ship to 12 steps there — open
  - TASK 2: Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12 — open
- Group 2: Name `/bkit-debug` when ship stops on a red CI run — next
  - TASK 3: Add `--next-step` to `bkit workflows fail`, and refresh the capability register for this change's engine edits — open
  - TASK 4: Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question — open
- Group 3: Docs and hand-authored copies — later
  - TASK 5: Rewrite the bkit docs that ship with the package — open
  - TASK 6: Rewrite the repo docs, the shipped `pre-push` comment and the hand-authored `utility-pre-release-check` copies — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Remove the ship failure steps from the engine and renumber ship to 12 steps there
  - **UPDATE:** `WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: delete the two ship failure entries, renumber `ship-switch-to-dev` 11 and `ship-close-workflow` 12, fix the "Step 13" comment
  - **UPDATE:** `ROW_FIELDS` in `.bkit/core/engine/commands/workflow/steps.ts`: delete the two ship failure entries
  - **UPDATE:** `progressPoint` in `.bkit/core/engine/commands/workflow/steps.ts`: the `ship.merge` check list becomes `ship-merge-pr` alone
  - **UPDATE:** `SHIP_STEP_ORDER` in `.bkit/core/engine/checks/status-holes.ts`: drop the two keys, and renumber the header and `MERGED_ON_ENTRY_SKIP` comments
  - **DELETE:** `RETRY_LOOP_STEPS` in `.bkit/core/engine/checks/status-holes.ts`: the list and its four filters
  - **UPDATE:** `syncDevVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: the doc comment "Ship Step 13: after the merge…" → Step 11 (comment only)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: tests step — replace the `it.each` "a ship failure-remediate %s row resumes at %o" with the old-row test; `runProgress all workflow numbers` (lines 131, 134), `runProgress flat workflow` (line 64) and `runProgress attempt suffix` (lines 158, 161, 163) expect ship total 12
  - **UPDATE:** `.bkit/core/engine/commands/workflow/progress.integration.test.ts`: tests step — the ship progress lines at 471 (`100% · Step 12/12 Close Workflow`), 497 and 510 (`Step 3/12 Base Check`) and 511 (`Step 9/12 Re-validate`), with their recomputed percentages
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: tests step — delete `retryLoopPathBStatus`, the retry-loop exclusions in `computeMandatoryForPath` and "does NOT flag absence of failure-diagnose/remediate (retry-loop steps)"; replace "retry-loop Path B: no holes (failure steps optional)" with the old-row test, whose expected universe is `[...SHIP_STEP_ORDER]`, not a hand list; the "Step 13" comments → Step 11
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: code step — "names every missing field at once" uses `build-failure-remediate`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: code step — in `bkit workflows summary`, add the guard test `lists ship-failure rows from a run started before their removal`, which passes before and after the change and so is not a `TEST FIRST` test
  - **READ:** `resumePoint` in `.bkit/core/engine/commands/workflow/step-table.ts`: the ignore rule for rows of removed steps
  - **DONE WHEN:** `grep -n 'ship-failure' .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/steps.ts .bkit/core/engine/checks/status-holes.ts` prints nothing; `grep -n 'Ship Step 13' .bkit/core/engine/commands/workflow/branches.ts` prints nothing; `pnpm vitest run` on `step-table.test.ts`, `progress.integration.test.ts`, `status-holes.test.ts`, `steps.test.ts` and `workflows.test.ts` passes, including `bkit workflows summary` `lists ship-failure rows from a run started before their removal`. The `ship` case of `workflow-shape.test.ts` "the step table matches the step headings and their --step= calls" stays red until Task 2 renumbers the headings
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `bkit status resume ignores ship rows for the removed failure steps` fails on a remediate `PASS` row resuming at `ship-failure-remediate` instead of `ship-merge-pr`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress all workflow numbers` fails on the ship line reading "Step 3/14 Base Check"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress flat workflow` fails on the ship line reading "71% · Step 10/14 Merge Gate + Merge PR"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress attempt suffix` fails on the attempt lines reading "Step 10/14 Merge Gate + Merge PR · Attempt 2"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress specialized completion producers` fails on the close line reading "Step 14/14 Close Workflow"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress accepts the ship base-check regression guard gate` fails on the progress line reading "21% · Step 3/14 Base Check"
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `workflow progress command wiring progress gate only completions` fails on the re-validate line reading "Step 9/14 Re-validate"
    - `.bkit/core/engine/checks/status-holes.test.ts` `detectHoles reports a pre-change run's ship-failure rows as unexpected and no step as missing` fails on `ship-failure-diagnose` being accepted as a known step instead of listed as unexpected

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the header (Resume, Limits, Locks, Worktrees), the Failure Path step 4 `Read:` line, the Step 2 MERGED route and the Step 10 routes, the Merge Question, the deleted Steps 11-12, and the renumbered Steps 11-12, per `Architecture & Component Changes` § Workflow (the `NEXT_STEP` lines and the Step 2 sub-step 5 split are Task 4)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: tests step — add the Step 1-12 shape test and the Merge Question test; the `--require=strategy` test expects four sites; `Step 14 — Close Workflow` / `Step 13 — Update Local Dev` section matchers → Step 12 / Step 11; delete "ship takes a merge fix round without asking when the diagnosis found the cause"
  - **UPDATE:** `CANONICAL_SHIP_STEP_KEYS` in `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — 12 keys, with its comment and describe titles at 12; the push-timing list drops Failure Remediate; "wires bkit ledgers into exactly 2 bash regions" → 1; the `Step 11` exclusion in the gate-movement test names `Failure Diagnose`; `Step 14.3 labels skip` → Step 12
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — in "passes the actual merge target and defers branch deletion to guarded close" (line 264), `step(ship, 14)` → `step(ship, 12)`
  - **UPDATE:** `COUNTER_STEP_MAP` in `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`: code step — delete the two ship failure entries
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n 'ship-failure\|Failure Diagnose\|Failure Remediate' .bkit/core/workflows/bkit-ship.md` prints nothing; `REGEN` ran; `git diff --exit-code -- .bkit/core/prompts/bkit-debug-failure-diagnose.md .bkit/core/prompts/bkit-debug-failure-remediate.md` prints nothing; `pnpm vitest run` on `workflow-shape.test.ts`, `ship-invariants.test.ts`, `counter-prose-audit.test.ts`, `step-table.test.ts`, `progress.integration.test.ts`, `steps.test.ts`, `status-holes.test.ts`, `workflows.test.ts`, `trackers.test.ts` and `.bkit/core/engine/tools/instructions-coverage.test.ts` passes, including `bkit-ship.md — canonical 12 ship-* step-key set` and the `ship` case of "the step table matches the step headings and their --step= calls"
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12` fails on the heading "Step 11 — Failure Diagnose" still being present
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `status route --require=strategy is used at exactly the four strategy-routing sites` fails on the site list still holding "ship-failure-remediate"
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship asks the Merge Question only when the merge attempts are used up` fails on the Merge Question still holding "the diagnosis found no clear cause"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names)` fails on the workflow still naming "ship-failure-diagnose"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close` fails on Step 12 being Failure Remediate, with no "workflows close" fence

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit-ship.md` has no Failure Diagnose or Failure Remediate step, names no `ship-failure-*` key, and its steps run 1-12 ending at Close Workflow | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| The Merge Question asks only when the merge attempts are used up, and `Try again` always grants a fresh allowance | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| The ship step-key set is the canonical 12 keys, with no `ship-failure-*` key written or named | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| Close Workflow (Step 12) runs `workflows close` with `--flush` and `--branch=` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| `status route --require=strategy` is used at exactly four sites, none in ship | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
| A run resumed after old `ship-failure-*` rows resumes at the merge step (Step 10), after `ship-merge-pr` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Ship's progress line counts 12 steps (`Step 3/12 Base Check`, `Step 10/12 Merge Gate + Merge PR`, with and without the attempt suffix) | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| `bkit workflow progress` on a ship run prints 12-step lines (`Step 3/12 Base Check`, `Step 9/12 Re-validate`, `100% · Step 12/12 Close Workflow`) | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 1 |
| A pre-change run holding `ship-failure-*` rows reports them as `unexpected` and no step as `missing` | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 1 |
| Every route that takes a red CI run to the Failure Path (Step 2 CI wait on a PR ship opened, Step 10 merge gate, Step 12 squash capstone) or to the Merge Question (a used-up regenerable red run) holds `/bkit-debug {FID}` as `NEXT_STEP`, and no other route does | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Merge Question's `Stop` arm writes `Next step: {NEXT_STEP}` into the handover and the final message when `NEXT_STEP` is held, and `Try again` clears `NEXT_STEP` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path passes `--next-step` to `workflows fail` only when `NEXT_STEP` is held, and ends the final message with it after any verbatim `ship-summary.md` content | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path re-runs `workflows fail` without `--next-step` when the call exits 2 | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |

### Planned tests that already exist

- TASK 2 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship asks the Merge Question only when the merge attempts are used up` — exists at `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:2049`; update that test in place: add expectations, never remove or loosen one
