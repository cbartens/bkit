# Brief: group 2 — Name `/bkit-debug` when ship stops on a red CI run (tests)

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

- Group 1: Remove ship Steps 11-12 — done
  - TASK 1: Remove the ship failure steps from the engine and renumber ship to 12 steps there — done
  - TASK 2: Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12 — done
- Group 2: Name `/bkit-debug` when ship stops on a red CI run — this group
  - TASK 3: Add `--next-step` to `bkit workflows fail`, and refresh the capability register for this change's engine edits — open
  - TASK 4: Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question — open
- Group 3: Docs and hand-authored copies — next
  - TASK 5: Rewrite the bkit docs that ship with the package — open
  - TASK 6: Rewrite the repo docs, the shipped `pre-push` comment and the hand-authored `utility-pre-release-check` copies — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add `--next-step` to `bkit workflows fail`, and refresh the capability register for this change's engine edits
  - **UPDATE:** `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: validate `--next-step` before `failState` (empty → absent; a line break or no `/bkit-` prefix → `EXIT.USAGE` with "--next-step must be one /bkit-* command line"), pass the `Next step:` line through `CommentInput.lines`, emit `nextStep`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `fail` verb spec gains the `next-step` flag with its help text, and `nextStep` in the output doc
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: tests step — three tests in `bkit workflows fail`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated by `pnpm cli:sync`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm bkit:graph:refresh`, run after the engine edits of Tasks 1 and 3 are staged, because the refresh reads the staged tree
  - **READ:** `buildComment` in `.bkit/core/engine/commands/workflow/issues.ts`: appends `lines` after the links
  - **READ:** `CommentInput` in `.bkit/core/engine/commands/workflow/issues.ts`: the optional `lines` field
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `fail` spec in `workflows.ts` declares `next-step`; `.bkit/core/.bkit/cli.md` names `--next-step` in the `fail` flag list; `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` refreshed `dist/` and the mirrors; `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` passes; `pnpm bkit:graph:refresh` ran and `pnpm bkit:graph:check` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep` fails on the comment missing "Next step: `/bkit-debug"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write` fails on the refusal not naming "must be one /bkit-* command line", or on a `workflow-failed` row being written
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail treats an empty --next-step as absent` fails on the flag being refused as unknown, or on `nextStep` not printing null

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path and the Merge Question
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Step 2 sub-step 5 failed-check arms (CLI and exit-80 MCP); the Step 10 sub-step 1 exit-12 arms (new non-regenerable arm; the regenerate `Else` arm on `unchanged` / `undeclared`; the used-up regenerable arm, with `MERGE_ASK` false and true); the Merge Question's `Try again` (clears `NEXT_STEP`) and `Stop` (names it) arms; the Step 12 (Close Workflow) sub-step 1 `Route:`; and Failure Path step 1 (flag and exit-2 retry) and step 6 (last line, after any verbatim summary), per `Architecture & Component Changes` § Workflow
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: tests step — six tests in a new `bkit-ship.md — red CI names /bkit-debug` describe
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `REGEN` ran; `pnpm vitest run` on `ship-invariants.test.ts`, `workflow-shape.test.ts`, `trackers.test.ts` and `instructions-coverage.test.ts` passes, including the six `bkit-ship.md — red CI names /bkit-debug` tests
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other` fails on the exit-12 arm reaching the Failure Path with "no NEXT_STEP held"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened` fails on the `prs checks` failed-check arm reaching the Failure Path with "Step 2 failed check holds no NEXT_STEP"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it` fails on the Stop handover lacking "Next step: {NEXT_STEP}"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP` fails on sub-step 1 having "no Route: after runs gate --capstone-only"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it` fails on the `workflows fail` fence lacking "--next-step=", or on the `Next step:` line sitting before the verbatim `ship-summary.md` content
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path re-runs workflows fail without --next-step on exit 2` fails on Failure Path step 1 having "no exit 2 retry without --next-step"

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Remove the ship failure steps from the engine and renumber ship to 12 steps there — `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/checks/status-holes.ts`, `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/commands/workflow/progress.integration.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`
- TASK 2 (group 1, done): Remove Failure Diagnose and Failure Remediate from the ship workflow, and renumber Steps 13-14 to 11-12 — `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`, `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The ship step-key set is the canonical 12 keys, with no `ship-failure-*` key written or named | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| Close Workflow (Step 12) runs `workflows close` with `--flush` and `--branch=` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 2 |
| `bkit workflows summary` on a ship run holding `ship-failure-*` rows still lists them and exits 0 after the removal (a regression guard: it passes before and after, so the code step lands it and `DONE WHEN` names it) | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| `workflows fail --next-step` adds a `Next step:` line to the failure comment and prints `nextStep` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| `workflows fail` refuses a multi-line or non-`/bkit-` `--next-step` before any write, and treats an empty one as absent | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| Every route that takes a red CI run to the Failure Path (Step 2 CI wait on a PR ship opened, Step 10 merge gate, Step 12 squash capstone) or to the Merge Question (a used-up regenerable red run) holds `/bkit-debug {FID}` as `NEXT_STEP`, and no other route does | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Merge Question's `Stop` arm writes `Next step: {NEXT_STEP}` into the handover and the final message when `NEXT_STEP` is held, and `Try again` clears `NEXT_STEP` | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path passes `--next-step` to `workflows fail` only when `NEXT_STEP` is held, and ends the final message with it after any verbatim `ship-summary.md` content | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
| The Failure Path re-runs `workflows fail` without `--next-step` when the call exits 2 | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 4 |
