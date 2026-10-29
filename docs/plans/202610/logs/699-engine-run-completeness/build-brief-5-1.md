# Brief: group 5 — `completeness` command surface (WS-5)

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
- Group 4: Completeness checker — rows + contract → verdict (WS-2) — done
  - TASK 8: Classify holes: evidence, step, unexercised, unexpected — done
  - TASK 9: Verdict metadata, unattributable calls, self-exclusion and the read path — done
- Group 5: `completeness` command surface (WS-5) — this group
  - TASK 10: Ship `bkit completeness check` and register it — open
- Group 6: Close and start integration (WS-6) — next
  - TASK 11: Append the `completeness` row at close, fail-open — open
  - TASK 12: Warn at start and resume when the previous run was holey — open
- Group 7: CI advisory wiring + observability and testing docs (WS-7) — later
  - TASK 13: Repoint the CI advisory step and add the sweep liveness assertion — open
  - TASK 14: Document the new log lines, the kill switch and the generalised tier contract — open
- Group 8: Generated artifacts (WS-8) — later
  - TASK 15: Regenerate the capability register, the doc mirrors and the committed payload — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Ship `bkit completeness check` and register it
  - **CREATE:** `.bkit/core/engine/commands/workflow/completeness.ts`: a thin `CommandSpec` — noun `completeness`, verb `check`, flags `--workflow=` (optional) and `--file=`; reads `status.jsonl` and the workflow markdown, calls the checker, prints the report through `ctx.emit`, logs under `[bkit-status-holes]`, always returns `EXIT.OK`; with `--workflow` absent, infers each run's workflow from its own rows
  - **CREATE:** `.bkit/core/engine/commands/workflow/completeness.test.ts`: the exit-0 case on a known-holey run, the workflow-inference case, and the conventions the sibling commands satisfy
  - **UPDATE:** `.bkit/core/engine/commands/registry.ts`: import `completenessCommand` and add it to `COMMANDS`
  - **READ:** `statusCommand` in `.bkit/core/engine/commands/workflow/status.ts`: the `CommandSpec` shape, `FILE_FLAG` and `WORKFLOW_FLAG` reused here
  - **READ:** `conventions.test.ts` in `.bkit/core/engine/commands/conventions.test.ts`: the noun / verb / flag / output-key rules and the "lists every exit code its source can return" check
  - **DEPENDS ON:** 9
  - **DONE WHEN:** `bkit completeness check --file={status.jsonl}` exits 0 on a holey fixture and prints the report; `--workflow` absent still yields a verdict by inferring the run's workflow; a missing `--file` target or an unreadable workflow markdown still exits 0 and reports no verdict; `conventions.test.ts` passes for the new noun; and `bkit completeness check --help` routes to the command.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/completeness.test.ts` `always exits 0 on a holey run` fails on a non-zero code for a run with holes
    - `.bkit/core/engine/commands/workflow/completeness.test.ts` `infers each run's workflow when --workflow is absent` fails on a silent no-op that prints no verdict
    - `.bkit/core/engine/commands/workflow/completeness.test.ts` `exits 0 with no verdict when the file or the workflow markdown is unreadable` fails on a throw or a non-zero code for a missing `status.jsonl` or an unreadable markdown
    - `.bkit/core/engine/commands/conventions.test.ts` `follow the conventions, and list every exit code their source can return` fails while `completenessCommand` is unreachable from `COMMANDS` or its help omits an exit code its source can return

<!-- bkit:task 10 end -->

### Earlier tasks this group depends on

- TASK 9 (group 4, done): Verdict metadata, unattributable calls, self-exclusion and the read path — `.bkit/core/engine/checks/status-holes.ts`, `.bkit/core/engine/checks/status-holes.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Command registration + conventions | `.bkit/core/engine/commands/registry.ts`, `.bkit/core/engine/commands/conventions.test.ts` | read `COMMANDS`; read `GROUPS`, `HELPER_SOURCES`, `commandSources`, `conventionProblems`, `ownCodesReturned` | `registry.ts` — one import + one array entry per noun; `conventions.test.ts` — already checks kebab-case, camelCase output keys, reachability and "lists every exit code its source can return", and requires a test file beside each source in `commands/{workflow,ci,setup}/` | EXTEND | Register `completenessCommand`; the new source ships `completeness.test.ts` beside it, is reachable from `COMMANDS`, and lists every exit code its source can return. |
| `completeness` command noun + verb | `.bkit/core/engine/commands/workflow/completeness.ts` | searched `commands/registry.ts`, `cli.ts` `CLASSIC_VERBS`, and the `status-holes.ts` CLI (a `tsx` script, not a verb) | None — no registered command reports step / command completeness for any phase | NEW | (a) the searches find no candidate: the only reporting surface today is the ship-only `tsx` script, which is not a verb and takes no `status.jsonl` + workflow pair as a command contract. The logic must be the extended `status-holes` module, never a reimplementation. |
| `completeness` command tests | `.bkit/core/engine/commands/workflow/completeness.test.ts` | read `commands/conventions.test.ts` § "each have a test file next to them" | None — every other source in `commands/workflow/` has its own `<name>.test.ts` | NEW | (b) extending a candidate breaks its callers: `conventions.test.ts` requires a test file beside each source in `commands/workflow/`, so the new command source cannot reuse another command's test file. |

### Architecture entries

#### [NEW] `.bkit/core/engine/commands/workflow/completeness.ts`

- **Reuse Check:** `Reuse Inventory` row "`completeness` command noun + verb", reason (a).
- A thin `CommandSpec`: noun `completeness`, verb `check`, flags `--workflow=` (optional, `WORKFLOW_FLAG`) and `--file=` (`FILE_FLAG`); reads `status.jsonl` and the workflow markdown, calls the WS-2 checker, prints the report, always returns `EXIT.OK`. With `--workflow` absent it infers each run's workflow from its own rows. Logs under `[bkit-status-holes]` via `ctx.log` and emits one output object via `ctx.emit`.

#### [NEW] `.bkit/core/engine/commands/workflow/completeness.test.ts`

- **Reuse Check:** `Reuse Inventory` row "`completeness` command tests", reason (b) — `conventions.test.ts` requires a test file beside each source in `commands/workflow/`.
- The command's conventions cases, the exit-0 case on a known-holey run, and the workflow-inference case.

#### [MODIFY] `.bkit/core/engine/commands/registry.ts`

- **Existence Check:** exists (59 lines); read `COMMANDS`.
- Import `completenessCommand` and add it to `COMMANDS`.
