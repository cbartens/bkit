# Brief: group 4 — Completeness checker — rows + contract → verdict (WS-2)

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
- Group 3: Contract deriver — workflow markdown → expected set (WS-1) — done
  - TASK 6: Generalise the deriver to all five workflows and promote the pure text helpers — done
  - TASK 7: Derive step conditionality from the column-0 marker rule and make it an authoring rule — done
- Group 4: Completeness checker — rows + contract → verdict (WS-2) — this group
  - TASK 8: Classify holes: evidence, step, unexercised, unexpected — open
  - TASK 9: Verdict metadata, unattributable calls, self-exclusion and the read path — open
- Group 5: `completeness` command surface (WS-5) — next
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

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Classify holes: evidence, step, unexercised, unexpected
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: extend `deriveContract` so each required call carries `position` (`pre` / `post` its section's own `steps finish` / `steps done` line) and `branch` (R1), and the contract carries `workflowCalls` from every `"{BKIT}"` literal outside any step section (R4)
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: add `check(rows, contract) → CompletenessVerdict` with R3 attribution (each contract-step row, repeats included, owns the gap before it and, for its `post` calls, the gap after it), R2 matching on noun + verb only, absent `branch` calls reported `unexercised`, `workflowCalls` matched before step attribution and never `unexpected`, `holey` keying on `evidenceHoles` + `stepHoles` only, and the full report carrying every class
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: cases for the four classes and R1-R4 over row fixtures, including a clean run whose `unexercised` list is non-empty but whose verdict is `CLEAN`
  - **READ:** `fold` in `.bkit/core/engine/ledgers/status.ts`: the row shapes the classifier reads, with `WorkflowRun` and `Step` beside it
  - **DEPENDS ON:** 7
  - **DONE WHEN:** a step recorded `DONE` missing a required call is an evidence hole naming that call; a required step absent from a closed run is a step hole, while a conditional step's absence is not; `unexercised` never makes a run holey; `unexpected` names calls and steps outside the contract; and a run replaying every step section of the five workflow files in markdown order, each step taking its first route arm, is `CLEAN` with no `unexpected` call.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `names an evidence hole with its missing calls` fails on the hole being dropped or reported without the missing call
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports a missing required step as a step hole` fails while a conditional step's absence is charged as a step hole
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports unexercised calls without marking the run holey` fails while any unexercised call flips `holey`
    - `.bkit/core/engine/checks/status-holes.test.ts` `charges calls below a step's finish line to that step` fails while a replay of every step section of the five workflow files in markdown order shows an evidence hole or an `unexpected` call (build Step 15's `prs probe` / `branches push` charged to Step 16)
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports an untaken route arm as unexercised` fails while build Step 12's FAIL-arm `counters route` makes a PASS run holey, or Step 5's two `steps finish` lines count as two required calls
    - `.bkit/core/engine/checks/status-holes.test.ts` `gives each group-loop repeat its own gaps` fails while a second `build-plan-execute` row leaves calls `unattributable`, or a group missing a required call is not named
    - `.bkit/core/engine/checks/status-holes.test.ts` `matches workflow-level calls outside any step` fails while a `Decision Pause` or `Failure Path` call is reported `unexpected` or charged to a step

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Verdict metadata, unattributable calls, self-exclusion and the read path
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: add `preJournal` (zero `engine-call` rows → steps-only), `journalSuspect` (set only when the caller says the closing engine journals), `unattributable` (a call after the terminator, or in a gap whose neighbouring rows are both outside the contract), `sourceSha`, the self-exclusion of the `completeness` verb from expectations **and** `unexpected`, and the read path (last stored `completeness` row, recomputed when rows follow it)
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: cases for each of the above, including a run that closes twice and one with calls in a gap between two rows outside the contract
  - **DEPENDS ON:** 8
  - **DONE WHEN:** a zero-journal run yields a steps-only verdict labelled `preJournal` and never "every command missing"; `journalSuspect` is set only when the caller passes it; a post-terminator call is named in `unattributable`; the check filters its own journaled call out of both its expectations and its `unexpected`; a second `completeness` row wins over the first; and a hole in a long-closed run is still reported — no baseline or watermark filters it.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `gives a pre-journal run a steps-only verdict` fails on every required call being reported missing
    - `.bkit/core/engine/checks/status-holes.test.ts` `names a call no contract step owns` fails on a post-terminator call, or a call between two rows outside the contract, being charged to the last step
    - `.bkit/core/engine/checks/status-holes.test.ts` `excludes its own journaled call` fails while the check reports itself as unexpected
    - `.bkit/core/engine/checks/status-holes.test.ts` `takes the last completeness row and recomputes when rows follow it` fails while the first row wins or a later row is ignored
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports a hole in a long-closed run with no baseline` fails while a watermark or a baseline delta filters out an old hole

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 7 (group 3, done): Derive step conditionality from the column-0 marker rule and make it an authoring rule — `.bkit/core/engine/checks/status-holes.ts`, `.bkit/core/engine/checks/status-holes.test.ts`, `.bkit/core/.bkit/authoring.md`, `.bkit/authoring.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| md-derived expected set + advisory report | `.bkit/core/engine/checks/status-holes.ts` | read in full; `grep -rn "status-holes"` across the repo; `grep -rln "SHIP_STEP_ORDER"` | `.bkit/core/engine/checks/status-holes.ts` — covers `deriveExpectedStepSetFromSource`, `classifyRun`, `computeMandatoryForPath`, `detectHoles`, `formatAdvisoryReport`, exit-0 `main`; hard-coded to `ship-` (a `(?:step:"\|--step=)(ship-[a-z-]+)` regex, a frozen `SHIP_STEP_ORDER`, three ship-only skip sets) | EXTEND | Generalise in place to all five workflows — the constraint forbids a second detector. Parameterise the step prefix, replace the source-derivation pair with `deriveContract(workflowMd, workflow)` + a deduped `WORKFLOW_STEPS[workflow]` cross-check, and keep `SHIP_STEP_ORDER` as the frozen ship step-name list (decision `467-ship-step-names-frozen`), now asserted equal to `WORKFLOW_STEPS.ship`. `classifyRun` / `computeMandatoryForPath` stay ship-shaped. |
| `engine-call` + `completeness` row types | `.bkit/core/engine/checks/status-holes.ts` (the row contract) | `grep -rn "\"type\": \"\|type: \"" .bkit/core/engine/ledgers/ .bkit/workflows.md`; read the `engine-action` row shape | None — the nearest is `engine-action` (`{type, action, key, hash, ref, at}`), a dedup guard written only by the acting verb and requiring key + hash + ref | NEW | (a) the searches find no candidate: `engine-action` is a guard, not a journal, and it cannot carry an attempt record. Both new rows are additive — `fold` skips unknown types and `readStatusRows` accepts any `type` — so no existing row changes shape. |

Reuse Inventory rows left out: 0; Architecture entries left out: 2 — read them in docs/plans/202610/699-engine-run-completeness-plan.md § Reuse Inventory and § Architecture & Component Changes.
