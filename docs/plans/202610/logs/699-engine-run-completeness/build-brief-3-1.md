# Brief: group 3 — Contract deriver — workflow markdown → expected set (WS-1)

Plan: Engine run completeness check + automatic engine friction — Implementation Plan

## Why and what

### Context & Goals

bkit does not verify, at the end of a workflow run, that every engine command the workflow requires actually ran; it does not check the previous run when a workflow starts; and engine errors/warnings are never recorded to `.bkit/friction.jsonl` or `docs/failures.jsonl`. A holey run, or silent engine friction, is therefore invisible unless a human or CI catches it. End-of-run completeness exists only as `.bkit/core/engine/checks/status-holes.ts` — advisory / fail-open, ship-only, CI-only, comparing recorded **steps** against a set derived from `bkit-ship.md` at runtime. This plan generalises that one detector into a five-workflow step **and** command completeness check, appends its verdict to the run's own `status.jsonl` at close, warns at start when the previous run for the FID was holey, and records a `tool-failure` friction row whenever an engine command exits non-zero for a reason that is not a declared routing code.

**Workstream dependencies (build order).** The plan covers the design's eight workstreams, one group each, in the order their `Requires` graph forces. A group's tasks may depend only on its own or an earlier group's tasks.

<!-- prettier-ignore -->
| Group | Workstream | Requires |
| --- | --- | --- |
| 1 | WS-4 row-type reader coverage | — (must land **before** any writer emits the two new row types) |
| 2 | WS-3 journal seam (`engine-call` + friction at dispatch) | WS-4 |
| 3 | WS-1 contract deriver (workflow markdown → expected set) | — |
| 4 | WS-2 completeness checker (rows + contract → verdict) | WS-1 |
| 5 | WS-5 `completeness` command surface | WS-2 |
| 6 | WS-6 close and start integration | WS-2, WS-4, WS-5 |
| 7 | WS-7 CI advisory wiring + observability and testing docs | WS-1, WS-2, WS-3, WS-5 |
| 8 | WS-8 generated artifacts | WS-1 … WS-7 |

**Inputs and precedence.** One design doc, `docs/plans/202610/699-engine-run-completeness-design.md` (verdict CONCERNS, 13 recorded `docs/decisions.jsonl` rows keyed `699-*`); no audit report; the issue body is an `idea`-shape issue (`#699`). The design's `## Acceptance Scenario` supplies `Narrative` and `Success Criteria` word for word. Where the issue body and the design disagree, the design (newer) wins: the design sharpens criterion 2's "holey" (evidence holes + step holes only) and adds the pre-journal carve-out, both recorded as decisions. The design's `## Suggested Workstreams` become the plan's task groups; their `Requires` graph is a within-plan ordering, not a dependency between deliverables (decision `699-follow-up-scoping-one-issue-one-plan`). The design left the check module's name open — the plan settles it in `checks/status-holes.ts`, recorded as decision `699-completeness-check-module-and-seam-files`. The design also left four checker rules open that, measured on the workflow markdown at `2003f19cc`, would mark nearly every normal run holey; the plan settles them as the checker rules R1-R4 (§ Architecture & Component Changes, `checks/status-holes.ts`) and adds the build Step 4 skip row (TASK 7):

- **R1 — branch calls.** A call is a branch call when its line sits under a `- **If**` / `- **Else**` bullet, or in a numbered sub-step that an `**If**` / `**Else**` route line in the same section names as its target (`sub-step N`). An absent branch call is `unexercised`, never an evidence hole. About 38 of 61 step sections carry an `**If**` route and more than one call (build Step 12's `counters route` runs on the FAIL arm only).
- **R2 — matching.** A required call matches a journaled call on noun + verb; flag names are reported, never matched (build Step 5's two alternative `steps finish` calls differ only in flags).
- **R3 — attribution.** Each contract-step row, group-loop and retry repeats included, owns the gap before it and the gap after it. A call in the gap after step S's row and before the next row belongs to S when its noun + verb is one of S's post-finish calls (a call written below S's last `steps finish` / `steps done --step=` line), else to the next row's step. 20 of 61 step sections write 59 call lines below their own finish line (build Step 15 runs `prs probe` and `branches push` after `steps finish --step=build-summary`).
- **R4 — workflow-level calls.** Calls in sections no step owns (each file's opening lines, `Failure Path`, build's `Decision Pause`, debug's `Loop Question`, ship's `Confirm Assumed Items` — 45 call lines) form `workflowCalls`: matched before step attribution, never required, never `unexpected`.
- **Step 4 skip row.** Build Step 4 Plan Convert routes straight to Step 5 when the plan check passes, writing no row and carrying no column-0 marker, so R1-R4 alone report it as a step hole on every build whose plan is already in task-block form. Its pass route writes a no-agent skip row, as Step 5 sub-step 2 does, and the authoring rule (TASK 7) requires every step to write its own row on every route toward the next step, or carry a column-0 marker.

**Ledger rows written for this plan:** decision `699-completeness-check-module-and-seam-files`; decision `384-tier3-promotion` (same key, restated promotion criteria for the generalised check); deferral `442-status-hole-detector-beyond-ship` (same key, `CLOSED` — superseded); deferrals `699-completeness-check-excludes-bkit-auto-router`, `699-completeness-verdict-no-success-axis` and `699-friction-key-truncation-class-fix` (the three `Exempt` mirrors). No runbook task writes or checks a ledger row.

**Related Issues:**

- `#331` — WS-G2: silent-corruption gates at ship and milestone end (closed)
- `#676` — Orchestrator work the engine could do as bkit commands (closed)
- `#680` — ledgers append: engine writes ledger rows with a minted ts (closed)
- `#701` — Engine work in build verify and ship: emit the facts, keep the judgement (**open**) — same registry / `conventions.test.ts` surface as TASK 10, and it adds a `tests plan-check` gate that judges this plan's own runbook and matrix
- `#556` — Review and adopt Compound Engineering patterns (**open**) — no surface overlap found; recorded so the "no open issue" claim is not left standing
- `#100` — Agentic preflight and runtime infra hardening (**open**) — shares `.github/workflows/bkit-ci.yml` with TASK 13
- `#101` — Agentic workflow: review routing, dry-runs, commit hygiene (**open**) — no surface overlap found; recorded for the same reason
- `#705` — Build: plan-convert plan-current get their own numbered steps comments (closed) — added build Step 4 Plan Convert and renumbered build to Steps 1-16 (group loop Steps 7-9)
- `#715` — Retire lite workflows; add build publish true/false (**open**) — edits `.bkit/core/.bkit/workflows.md` (TASK 2) and adds a `publish=false` build route that skips build's closing push / PR / CI calls; whichever change lands second marks those calls per R1 or the TASK 7 authoring rule

---

### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every bkit command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

### Success Criteria

1. One bkit verb (`bkit completeness check --workflow= --file=`) reports, for any design / plan / build / debug / ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled — the expected set derived from the markdown at runtime, never a hand table.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl` (a run that closes more than once carries one per close, and the read path takes the last); starting or resuming a run prints a warning when the previous run for that FID was **holey** — holey meaning an _evidence hole_ (a step recorded `DONE` without its required journaled calls) or a _step hole_ (a required step absent from a closed run), never merely an unexercised conditional arm. The warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"` to the **active run's own book root**, deduped by key, carrying a non-empty `by.step` on every path; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow — a failed journal write is swallowed and logged, never raised.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Promotion of the completeness check from a fail-open advisory to a blocking gate | No `Success Criteria` line, `Acceptance Scenario` line, `Derived Test Matrix` row or design item needs it: the design's constraint is "Advisory / fail-open until proven (one release without muting)", and criterion 4 requires the check never to change an exit code, block or fail a workflow | Design § Constraints and non-goals; already tracked by the pre-existing OPEN deferral `384-promote-status-hole-detector-from-advisory-to-gate` in `docs/deferrals.jsonl` (no new row written — that row is the matching one, and its promotion criteria are restated by the decision `384-tier3-promotion` row written for this plan) |
| Coverage of the `bkit-auto` router markdown by the check | Not needed by any criterion: `Success Criteria` 1 scopes the report to design / plan / build / debug / ship, and the derived universe is cross-checked against `WORKFLOW_STEPS`, whose keys are exactly those five; `bkit-auto` dispatches to them rather than carrying a step universe of its own | New deferral `699-completeness-check-excludes-bkit-auto-router` (`docs/deferrals.jsonl`, OPEN, `scope-declared`) |
| A success axis on the verdict — a required command that ran and failed | Not needed by any criterion: the design declares it a deliberate non-goal ("a required command that ran but failed still counts as present — a deliberate non-goal this cycle"), and the `engine-call` row records the attempt at dispatch entry, so "journaled" means attempted, not succeeded | New deferral `699-completeness-verdict-no-success-axis` (`docs/deferrals.jsonl`, OPEN, `scope-declared`) |
| Friction-key truncation / identity-collision class fix — the identity-gated prune truncates a friction key at ~68 chars, so two long same-prefix keys collide and the fold loser is destroyed | Not needed by any criterion: this plan's own keys are `<noun>-<verb>/<step>` and stay far under the truncation point, so it avoids the envelope rather than inheriting it, and a schema-level change to key minting / the prune gate is not this change | New deferral `699-friction-key-truncation-class-fix` (`docs/deferrals.jsonl`, OPEN, `own-cycle`) |

## Where it fits

- Group 1: Row-type reader coverage (WS-4) — done
  - TASK 1: Make both `MARK_ROWS` copies skip the two new row types, pinned by the harvest parity test — done
  - TASK 2: Audit the remaining readers and document both row types — done
- Group 2: Journal seam — `engine-call` + friction at dispatch (WS-3) — done
  - TASK 3: Build the seam's row primitives as a leaf module behind a kill switch — done
  - TASK 4: Wire the seam into `runCommand` with resolve-or-skip attribution and the fail-safe guarantee — done
  - TASK 5: Prove a seam-written friction row survives commit and harvest, end to end — done
- Group 3: Contract deriver — workflow markdown → expected set (WS-1) — this group
  - TASK 6: Generalise the deriver to all five workflows and promote the pure text helpers — open
  - TASK 7: Derive step conditionality from the column-0 marker rule and make it an authoring rule — open
- Group 4: Completeness checker — rows + contract → verdict (WS-2) — next
  - TASK 8: Classify holes: evidence, step, unexercised, unexpected — open
  - TASK 9: Verdict metadata, unattributable calls, self-exclusion and the read path — open
- Group 5: `completeness` command surface (WS-5) — later
  - TASK 10: Ship `bkit completeness check` and register it — open
- Group 6: Close and start integration (WS-6) — later
  - TASK 11: Append the `completeness` row at close, fail-open — open
  - TASK 12: Warn at start and resume when the previous run was holey — open
- Group 7: CI advisory wiring + observability and testing docs (WS-7) — later
  - TASK 13: Repoint the CI advisory step and add the sweep liveness assertion — open
  - TASK 14: Document the new log lines, the kill switch and the generalised tier contract — open
- Group 8: Generated artifacts (WS-8) — later
  - TASK 15: Regenerate the capability register, the doc mirrors and the committed payload — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Generalise the deriver to all five workflows and promote the pure text helpers
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: add `deriveContract(workflowMd, workflow)` (step sections from `## … Step N — Title` headings including `###` group-loop headings; required calls from every `"{BKIT}"` literal in the section, reduced to noun / verb / flag names; the deduped `WORKFLOW_STEPS[workflow]` cross-check reported as drift, not fatal); add `stepSections` and `callWords`
  - **DELETE:** `.bkit/core/engine/checks/status-holes.ts`: `deriveExpectedStepSetFromSource` and `checkSourceCanonicalDrift` — replaced by `deriveContract` and its `WORKFLOW_STEPS` cross-check (see `Supersession Inventory`); their only importer is `checks/status-holes.test.ts`, retargeted in this task
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: generalise `main()` so each run in each `status.jsonl` positional infers its workflow from that run's own rows (one file holds runs of several workflows), print one report per file plus one sweep-summary line in the exact form `[bkit-status-holes] sweep: {N} file(s), {M} holey` where `{M}` counts holey runs, not files, and drop `--ship-md`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: import `stepSections` / `callWords` from the check module instead of holding copies; keep `unknownCalls` and its `COMMANDS` import
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: retarget the two cases importing the deleted exports; add the five-workflow universe equality, the required-call derivation and the sweep-summary cases
  - **READ:** `WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: the deduped step universe the derived set is cross-checked against
  - **READ:** `stepSections` in `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the parser being promoted, with `callWords` beside it
  - **DONE WHEN:** the derived step universe equals the deduped `WORKFLOW_STEPS[workflow]` for all five workflows; `workflow-shape.test.ts` passes through the imported helpers; the advisory CLI exits 0 on a holey fixture and prints one summary line for a multi-file corpus in the exact literal `[bkit-status-holes] sweep: {N} file(s), {M} holey` that TASK 13's lane grep pins; `SHIP_STEP_ORDER` is asserted equal to the deduped `WORKFLOW_STEPS.ship`; and no importer of the two deleted exports remains.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `derives the expected step universe for every workflow` fails on the ship-only prefix leaving the other four universes empty
    - `.bkit/core/engine/checks/status-holes.test.ts` `records every {BKIT} literal in a step as a required call` fails while a call inside a section is dropped or a flag value is retained
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `holds the workflows to the step table` fails while the shape test still holds its own copies of the promoted parsers
    - `.bkit/core/engine/checks/status-holes.test.ts` `prints a sweep summary line and exits 0` fails when the corpus sweep prints nothing for a file it could not attribute, checks a mixed-workflow file against one workflow, counts holey files instead of holey runs, or its summary line text drifts from the literal TASK 13's lane grep pins

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Derive step conditionality from the column-0 marker rule and make it an authoring rule
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: a step is conditional when a column-0 `**Run only if**` / `**Skip if**` line sits anywhere inside its section, or its heading carries a `(Path X only)` marker
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: the per-workflow conditionality fixture — every step-level site across the five workflows classifies as conditional, and no non-conditional step is over-classified
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Workflows Only — the step-conditionality authoring rule the deriver depends on, plus the row rule: every step writes its own `steps finish` / `steps done` row on every route toward the next step, or carries a column-0 `**Run only if**` / `**Skip if**` marker; this is the canonical source of the `.bkit/authoring.md` mirror
  - **UPDATE:** `.bkit/authoring.md`: regenerated from `.bkit/core/.bkit/authoring.md` with `bkit install` and committed
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 4 Plan Convert — split the sub-step 1 pass route into `**If** exit 0, CONVERTED is not held **and** NEWER_COMMENTS = 0 → sub-step 4` and `**If** exit 0 **and** CONVERTED is held → Step 5`; add sub-step 4, the skip row `"{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"` → Step 5, as Step 5 sub-step 2 does; add a Gate 4 line for the skip row; run `pnpm instructions:show --file bkit-build.md` before editing the sentences; then `bkit install` the host mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the build Step 4 entry names the skip row; `.bkit/workflows.md` regenerated from it with `bkit install`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the Step 4 skip-row case
  - **READ:** `bkit-ship.md` in `.bkit/core/workflows/bkit-ship.md`: the column-0 marker sites the fixture is built from, with `bkit-build.md`, `bkit-design.md`, `bkit-debug.md` and `bkit-plan.md` beside it in the same folder
  - **READ:** `derivedCounter` in `.bkit/core/engine/commands/workflow/steps.ts`: the `--attempt-of=build-plan-convert:next` counter, to confirm the skip row's `--attempt=1` and a convert attempt never share one route
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the fixture covers every step-level conditional site in the five workflow markdown files with zero over-classification; the conditionality and row rules are written in `.bkit/core/.bkit/authoring.md`; build Step 4 writes a `build-plan-convert` skip row on its no-conversion pass route and no row is written twice on any route; `bkit install` leaves `.bkit/authoring.md`, `.bkit/workflows.md` and the build host mirrors byte-equal to their sources but for the managed marker; `pnpm bkit check` exits 0; and a marker added inside a non-step section changes no verdict.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `classifies a step conditional only under the column-0 marker rule` fails on a `**Skip if**` step being reported as a step hole, and on a non-conditional step being excluded
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `writes a build-plan-convert row on the no-conversion route` fails while build Step 4's pass route reaches Step 5 with no `steps finish --step=build-plan-convert` call, or the step table drifts from the headings and `--step=` calls

<!-- bkit:task 7 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| md section + `"{BKIT}"` call parser | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | read `stepSections` (line 815), `callWords` (65), `unknownCalls` (87); greps for `WORKFLOW_STEPS` / `COMMANDS` imports in the file | `stepSections` / `callWords` — pure text helpers already held to the markdown; `unknownCalls` — needs `COMMANDS` from `commands/registry` | EXTEND | Promote `stepSections` / `callWords` out of the test into the check module and import them back, so one parse serves the test and the deriver. `unknownCalls` stays in the test: a `checks → commands/registry` edge would pull all 24 command modules into the check. |

Reuse Inventory rows left out: 4; Architecture entries left out: 6 — read them in docs/plans/202610/699-engine-run-completeness-plan.md § Reuse Inventory and § Architecture & Component Changes.
