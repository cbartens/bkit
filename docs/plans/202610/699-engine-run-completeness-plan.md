<!-- bkit:anchor
baseSha: 443a20a9aadc0fc9017a66afc34c52d0ca986ccb
baseRef: origin/dev
designPath: docs/plans/202610/699-engine-run-completeness-design.md
designBaseSha: 471abbc369f348a12cbc6c1a6a0907e698cca328
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Engine run completeness check + automatic engine friction — Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every bkit command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

### Success Criteria

1. One bkit verb (`bkit completeness check --workflow= --file=`) reports, for any design / plan / build / debug / ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled — the expected set derived from the markdown at runtime, never a hand table.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl` (a run that closes more than once carries one per close, and the read path takes the last); starting or resuming a run prints a warning when the previous run for that FID was **holey** — holey meaning an _evidence hole_ (a step recorded `DONE` without its required journaled calls) or a _step hole_ (a required step absent from a closed run), never merely an unexercised conditional arm. The warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"` to the **active run's own book root**, deduped by key, carrying a non-empty `by.step` on every path; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow — a failed journal write is swallowed and logged, never raised.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

### Process Sketch

- **WHEN** `bkit workflows start` opens or resumes a run **→ THEN** it prints one warning line on stderr when the previous run for that FID was holey, and proceeds exactly as today — no prompt, no interruption; stdout stays the single output object the prose parses.
- **WHEN** a bkit command runs while a run is active **→ THEN** one `engine-call` row (noun, verb, flag names) is appended to that run's `status.jsonl` at dispatch entry, and nothing else changes.
- **WHEN** a bkit command exits non-zero for a reason other than a declared routing code **→ THEN** one deduped `friction` row with `category: "tool-failure"` is appended to the active run's own book root, and the original exit code still reaches the caller unchanged.
- **WHEN** `bkit workflows close` closes a run **→ THEN** a `completeness` row comparing recorded steps and journaled calls against the workflow markdown is appended before the `workflow-done` row; a second close appends a second row.
- **WHEN** the check finds a step recorded `DONE` without its required calls **→ THEN** the verdict names the step and the missing calls, and nothing fails.
- **WHEN** `bkit completeness check` runs against any historical run **→ THEN** it reports every hole it finds for that run, with no baseline or watermark, and always exits 0.
- **IF** the journal write, the check or its row append throws **→ THEN** one `[bkit-telemetry]` / `[bkit-status-holes]` stderr line is logged, the workflow degrades to "no row" / "no warning", and no exit code changes.

### Concrete Example

**Setup:** the bkit maintainer, in worktree `.worktrees/699-engine-run-completeness`, whose design and plan runs already closed for FID `699-engine-run-completeness`; the plan run's close wrote a `completeness` row with verdict `HOLEY` naming one evidence hole (`plan-fetch-context` recorded `DONE` with no journaled `context ledger-scan`).

**Steps:**

1. Maintainer runs `bkit workflows start --workflow=build --fid=699-engine-run-completeness --month=202610 --detect` → the engine appends `workflow-started`, then reads the previous run's last `completeness` row, prints one stderr line naming the plan run, its run number, its close time and the reading command, and emits its usual single stdout object (`resumed`, `run`, `lastDoneStep`). The run is not interrupted.
2. A build step's fenced block calls `bkit tests run --gate=… --step=build-plan-verify` → `runCommand` journals one `engine-call` row (`noun: "tests"`, `verb: "run"`, `flags: ["gate", "step"]`) and then runs the verb.
3. The same block calls a gate command that exits 3 — a code the verb declares → no `friction` row is written; the workflow's own `Route:` handles the exit as before.
4. A later step's command dies on an undeclared code 64 → the seam appends one `friction` row (`category: "tool-failure"`, `by.step` from that command's own `--step=`, `key: "<noun>-<verb>/<step>"`) to the run's own book root, then returns 64 unchanged, and the step's `**Failure Path**` runs exactly as before.
5. Maintainer runs `bkit workflows close --workflow=build --fid=… --month=202610 --record-step …` → the checker runs in-process over the run's rows and `.bkit/core/workflows/bkit-build.md`, appends the `completeness` row before `workflow-done`, and the close commit carries it into the run's own artifacts.
6. Maintainer runs `bkit completeness check --workflow=build --file=docs/plans/202610/logs/…/status.jsonl` → exit 0, with a report naming the evidence hole (step + missing calls), the friction row's `key`, and the `unexercised` conditional arms.

**Outcome:** the run's own artifacts carry the verdict; the previous run's hole was known before the maintainer built on it; the failed command left an `engine-command` telemetry row instead of vanishing; and no exit code, gate or workflow outcome changed.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Several runs active at once (each in its own worktree): a journaled call attributes to the right run or is not journaled at all — never misattributed (Q12). | The seam resolves the run from the command's own `--file`, else `--fid` + `--month`, else the single `IN_PROGRESS` run under the cwd's git toplevel; more than one candidate and no `--file` / `--fid` → it journals nothing and logs one skip line on stderr. |
| A command run outside the run's worktree (`cd {REPO_ROOT} && bkit branches land`) attributes via its own `--fid` / `--month`, else is skipped. | Resolved through `statusLocation`, which yields the run's own book root; a resolve from the main checkout finds no active run and writes nothing. |
| Conditional, fallback and retry calls in the prose (`"{BKIT}"` inside a `Route:` / `Failure Path` arm) count as required and are reported as _unexercised_ when not taken; only a step recorded `DONE` missing its calls is an _evidence hole_, and the report lists every hole on every run (no watermark or baseline). | The verdict lists them under `unexercised`; `holey` keys on `evidenceHoles` + `stepHoles` only, and the start warning fires on that alone. |
| A run that fails or is abandoned mid-run: completeness must not flag the un-run tail as holes, and a resumed run's earlier rows still count. | A failed run gets no step holes past its last observed step; its earlier `step-done` and `engine-call` rows still count, and `workflows start` computes its verdict on the fly when no `completeness` row exists. |
| A run that closes more than once (the corpus shows three `build-close-workflow` rows on one run) writes one `completeness` row per close, and a call journaled after the run's terminator has no "step in progress" to belong to — the verdict names such calls rather than charging them to a step. | One row per close; the read path takes the last and recomputes when rows follow it; post-terminator calls land in `unattributable`. |
| A run with zero `engine-call` rows (pre-journal, or a broken journal): steps-only verdict labelled `preJournal: true` — never "every command missing"; when the closing engine is itself journaling, the verdict additionally carries `journalSuspect: true` and one stderr line, so a dead journal is not mistaken for a historical run. | `preJournal: true` suppresses evidence holes entirely (steps-only); `journalSuspect: true` is set only on the close path, never by an on-the-fly start computation. |
| Secret or free-text values in a command line (`--token=`, `--error=`) are never journaled — flag names only (Q11). | The `engine-call` row's `flags` array holds flag names only; the friction row's `description` holds the noun, verb, step and exit code, never a command line. |
| The journal write itself failing (read-only tree, full disk) is swallowed; the command still succeeds and one `[bkit-telemetry]` stderr line is emitted, and the heartbeat (`journalSuspect` on a close by a journaling engine that recorded zero `engine-call` rows) keeps the detector from crying wolf when it is itself hurt. | Nested try/finally around every telemetry write; one stderr line per swallow; the forced-throw test asserts exit-code passthrough. |
| The `completeness` verb is itself a bkit command run while a run is active: it journals itself and self-excludes from its own expectations **and** from its own `unexpected` list. | Its own `engine-call` row is filtered out of both lists before classification. |
| `completeness` and `engine-call` rows landing in `status.jsonl` must not shift step-timing (`MARK_ROWS` — measured: total step minutes 1208.1 → 0.7 without the fix, byte-identical with it); the harvest's `afterEnd` / `scan.rows` windows do move when journal rows land after a run's terminator, and that shift is accepted and documented. | Both `MARK_ROWS` copies gain the two types; the harvest parity test pins them equal; the shift is recorded in `.bkit/jsonl.md` § the `run` row. |
| _Plan-added (validation)._ An unknown value passed to `--workflow`, or a missing / non-existent `--file`. | The command exits 2 (`USAGE`) with a tagged message; the seam still journals its own `engine-call` row for that invocation, and no `friction` row is written (exit 2 is a shared routing code). |
| _Plan-added (validation)._ The same repeatable flag given more than once on a journaled command. | The `flags` array lists the flag name once — names are collected into a set, never appended per occurrence. |
| _Plan-added (error)._ A `status.jsonl` that does not exist, or a workflow markdown that cannot be read. | The check exits 0 and reports no verdict (fail-open); `workflows close` writes `workflow-done` with no `completeness` row; `workflows start` prints no warning; each logs one stderr line. |
| _Plan-added (boundary)._ No run is active in the cwd (the normal case in a consumer repo outside a workflow). | The seam journals nothing, writes no friction row and logs nothing — the no-op path costs one resolve attempt. |
| _Plan-added (boundary)._ Friction where the run's `parentSha` is not resolvable at exit. | The row is written without the `run` object; `by.step` still carries the `--step=` value or the `<noun>-<verb>` sentinel, so `validate` admits it. |
| _Plan-added (boundary)._ A `step-done` row whose `step` is not in the derived contract (a renamed step, a hand-written row). | It is reported under the verdict's `unexpected` steps; the check never throws on it. |
| _Plan-added (R3)._ A step runs calls after its own `steps finish` row (build Step 15: `prs probe`, `branches push`). | The post-finish calls count for that step, never for the next one; the run shows no evidence hole for the first step and no `unexpected` call for the second. |
| _Plan-added (R1)._ A finished step took one route arm (build Step 12 on PASS skips the FAIL arm's `counters route`). | The untaken arm's call is `unexercised`; the step is not an evidence hole. |
| _Plan-added (R3)._ A group-loop step repeats its row once per group (`build-plan-execute`, `build-plan-verify`, `build-group-gate`). | Each row owns its own gaps; a group missing a required call is an evidence hole naming that group; repeats never make calls `unattributable`. |
| _Plan-added (R4)._ A paused or failed run journals calls from a workflow-level section (`Decision Pause`, `Failure Path`). | The calls land in `workflowCalls`; they are never `unexpected` and never charged to a step. |
| _Plan-added (Step 4)._ A build whose plan is already in task-block form. | Step 4 writes its skip row; the run shows no step hole for `build-plan-convert`. |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. No database and no external / deployed boundary participates, so there is no fresh-DB replay, `@live`, E2E or Smoke row; `docs/testing.md` § Which tier does a behaviour need? assigns every behaviour below its lowest sufficient tier. The one `tests/*.bats` row is `Unit`: `docs/testing.md` § the unit lane runs the bats shell tier (`pnpm exec bats tests/*.bats`) for shell logic vitest cannot reach. `Task` maps each row to exactly one runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The derived step universe equals the deduped `WORKFLOW_STEPS[workflow]` for all five workflows — no hand table | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 6 |
| Per-step required calls come from every `"{BKIT}"` literal inside the step's section, reduced to noun / verb / flag names | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 6 |
| `stepSections` / `callWords` promoted out of the shape test: the shape test imports them and the workflow-markdown pair still passes | Static | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| The advisory CLI exits 0 on a holey fixture and prints a summary line for a multi-file corpus | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 6 |
| Step conditionality: the column-0 `**Run only if**` / `**Skip if**` rule covers 23/23 step-level sites across the five workflows with no over-classification | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 7 |
| Evidence hole: a step recorded `DONE` missing its required journaled calls | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| Step hole: a required step absent from a closed run is one; a conditional step's absence is not | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| `unexercised` calls are reported but never make a run holey; `unexpected` names calls and steps outside the contract | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| R3: calls a step writes below its own finish line count for that step, on every step of the five workflows replayed in markdown order | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| R1 + R2: an untaken route-arm call of a finished step is `unexercised`; alternative calls differing only in flags match one required call | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| R3: each group-loop repeat of a step owns its own gaps; a group missing a call is named | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| R4: calls from a workflow-level section land in `workflowCalls`, never `unexpected` | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 8 |
| Build Step 4 writes a skip row when the plan check passes with no conversion, and the step table still matches the headings and `--step=` calls | Static | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| `preJournal: true` yields a steps-only verdict; `journalSuspect: true` is set only on the close path | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 9 |
| `unattributable`: a call with no step in progress (after the terminator, or in a gap whose neighbouring rows are both outside the contract) is named, never charged | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 9 |
| The check self-excludes the `completeness` verb from its own expectations and its own `unexpected` list | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 9 |
| The read path takes the last `completeness` row for a run and recomputes when rows follow it | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 9 |
| Friction on an undeclared non-zero exit: one row, `category: "tool-failure"`, in the run's own book root (real worktree, real filesystem) | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| No friction row on a declared routing exit (a shared code or the verb's own) | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| A journal or friction write that throws never changes the command's exit code, and logs one `[bkit-telemetry]` line | Unit | `.bkit/core/engine/commands/lib.test.ts` | 4 |
| `by.step` is never empty — the failing command's own `--step=` else the `<noun>-<verb>` sentinel — and the dedup `key` follows it | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| A same-`key` recurrence raises `recurrenceCount` on the one existing row | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| An `engine-call` row carries noun, verb and flag names only — never a flag value | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| A call made from the main checkout (outside the run's worktree) is skipped, never attributed to another run | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| Two journal rows between `step-done` rows leave a run's total step minutes byte-identical | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 1 |
| The harvest's `MARK_ROWS` copy equals the engine's | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 1 |
| An unknown `status.jsonl` row type is inert in every reader — it splits no run and throws in none | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| `bkit completeness check --workflow= --file=` always exits 0, even on a known-holey run | Unit | `.bkit/core/engine/commands/workflow/completeness.test.ts` | 10 |
| With `--workflow` absent the check infers each run's workflow from its own rows and never silently no-ops | Unit | `.bkit/core/engine/commands/workflow/completeness.test.ts` | 10 |
| The command follows the conventions: registered, reachable, and every exit code its source can return is listed | Static | `.bkit/core/engine/commands/conventions.test.ts` | 10 |
| `workflows close` appends the `completeness` row before the `workflow-done` row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 11 |
| A checker or append throw at close still writes `workflow-done` and returns the normal exit code | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 11 |
| A holey previous run warns on stderr, the run proceeds unchanged, and the warning names the run and the reading command | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 12 |
| A friction row the seam itself wrote survives `ledgers commit` and reaches the harvested ledger | Integration | `scripts/harvest/ledgers.integration.test.ts` | 5 |
| A run closed twice writes one `completeness` row per close | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 11 |
| A clean or absent previous run prints nothing, and a checker failure at start prints no warning and no error | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 12 |
| A missing `status.jsonl` or an unreadable workflow markdown: the check exits 0 and reports no verdict | Unit | `.bkit/core/engine/commands/workflow/completeness.test.ts` | 10 |
| `BKIT_ENGINE_JOURNAL=off` disables the seam: no `engine-call` row and no friction row | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| Friction where the run's `parentSha` is unresolvable: the row is written without the `run` object and still admits `validate` | Unit | `.bkit/core/engine/ledgers/journal.test.ts` | 3 |
| No run active in the cwd: the seam journals nothing, writes no friction row and logs nothing | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| A hole in a long-closed run is still reported — no baseline or watermark filters it | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 9 |
| The sweep prints the summary line the CI lane's liveness grep pins, and the grep rejects output without it | Unit | `tests/status-holes-sweep-liveness.bats` | 13 |
| Calls that run before `workflows start` or after `workflows close` are matched when journaled but never required, so a run that journals every call the journal can see is not holey | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 18 |
| A close that sees a dead journal prints exactly one `[bkit-telemetry]` line on stderr and still closes with the stdout object unchanged | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 19 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Additive, no consumer-facing removal.** No database, no HTTP surface, no route, no config key removed, no existing verb or flag changed. Every read path keeps working: `fold` skips unknown row types and `readStatusRows` accepts any `type`.

**New names.**

- `bkit completeness check` — new command noun `completeness`, one verb `check`, flags `--workflow=` (optional) and `--file=`; registered in `.bkit/core/engine/commands/registry.ts`, always exits 0.
- `status.jsonl` row types `engine-call` (noun, verb, flag names) and `completeness` (verdict + per-hole evidence). Both additive; `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` is append-only NDJSON with `merge=union`.
- `checks/status-holes.ts` exports `deriveContract(workflowMd, workflow)`, `check(rows, contract)` and `stepSections` / `callWords`; it keeps its file name and its `[bkit-status-holes]` log prefix.
- `ledgers/journal.ts` — new leaf module holding the seam's row builders: `engineCallRow`, `frictionRow`, `shouldRecordFriction`, `frictionKey`, `appendJournalRow`, `appendFrictionRow`, `journalEnabled`.
- `resolveActiveRun` — new exported function in `commands/lib.ts`; `runCommand`'s `options` gains an optional journal seam so the hot path is injectable in tests.
- `BKIT_ENGINE_JOURNAL` — a **new environment variable**: a boolean kill switch (`off` disables the seam entirely). Non-secret; documented in `docs/observability.md`, not in a secret store.
- New stderr lines under two already-registered prefixes: `[bkit-telemetry]` (swallowed journal writes) and `[bkit-status-holes]` (report + heartbeat). No new prefix — the prefix rule allows a new prefix only with a new module or command noun.

**Removed (module-internal exports, one consumer).**

- `deriveExpectedStepSetFromSource` and `checkSourceCanonicalDrift` in `.bkit/core/engine/checks/status-holes.ts` are replaced by `deriveContract` and its `WORKFLOW_STEPS` cross-check. Their only importer is `checks/status-holes.test.ts`, updated in the same task. `SHIP_STEP_ORDER` is **retained** as the frozen ship step-name list (decision `467-ship-step-names-frozen`), now asserted equal to the deduped `WORKFLOW_STEPS.ship`.

**Behavioural, intentional.**

- Every engine command run while a run is active appends one extra `status.jsonl` row: a build run's journal is up to ~100 rows (the design's probe took a 59-row run to 116). The harvest's `afterEnd` / `scan.rows` windows move when journal rows land after a run's terminator — accepted and documented in `.bkit/jsonl.md`.
- Non-zero exits the workflow previously recorded nowhere (undeclared codes, signal deaths, non-`CommandError` throws) now append a `friction` row. Deliberate; the exclusion set is derived, so routine routing and usage exits never produce one.
- Build Step 4 Plan Convert writes a `build-plan-convert` skip row (`--attempt=1`, `--comment-field="Status=skipped (plan already in task-block form)"`) and posts its step comment when the plan check passes with no conversion, as Step 5 sub-step 2 does today. A build run therefore gains one `step-done` row and one tracker comment on that route.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

Every open question the design carried (its Q1–Q17) is settled: Q1–Q12 by the 13 recorded `docs/decisions.jsonl` rows keyed `699-*`, Q15 by decision `699-completeness-check-no-watermark`, Q17 by the adopted Acceptance Scenario. No question is reopened here.

- **Answered (A, decision `699-ci-advisory-check-surface`):** the CI advisory step invokes the module's own exit-0 CLI (`tsx .bkit/core/engine/checks/status-holes.ts docs/plans/*/logs/*/status.jsonl`), generalised so each run in each file infers its workflow from its own rows; `package.json` `bkit:audit:status` is unchanged. The `bkit completeness check` verb is the maintainer's ad-hoc reader for one file. The owner's sign-off on this plan covers TASK 13's edit to `.github/workflows/bkit-ci.yml`.
- **Assumption:** journal rows in `status.jsonl` inflate the file without breaking any consumer, because `fold` skips unknown types and `readStatusRows` accepts any `type`; the two `MARK_ROWS` copies are the only readers that must change. → if wrong, a missed reader silently corrupts step timing (the design measured total step minutes 1208.1 → 0.7 with `MARK_ROWS` unchanged), so Group 1 lands before any writer emits the rows, and the "an unknown row type is inert in every reader" assertion is a plan-added test rather than an enumerated reader list.
- **Assumption:** the seam can resolve the active run from the cwd alone at an acceptable cost (the design measured 4.23 ms per call — 0.40 ms scan + 3.83 ms git spawn — with 188 of 357 call sites needing the scan). → if wrong (a consumer's tree is deep or git is slow), the seam adds that cost to every command in every consumer repo; the resolve is resolve-or-skip and injectable, so it can be narrowed to `--file` / `--fid` plus the cwd's own month bucket without touching the row contract.
- **Assumption:** `friction` rows pass the existing writer check unchanged — `KIND_WRITERS.friction.orchestrators` already lists `{design, plan, build, debug, ship, auto}` and `by.step` is supplied non-empty on every path. → if wrong, `appendLedgerRows` throws, the seam swallows it and the feature records nothing; the Integration row (TASK 4) asserts the row on disk in the run's own root, which is where the design's spike disproved the two silent-refusal paths.
- **Assumption:** the column-0 conditionality rule is complete — a future conditional step is written with a column-0 `**Run only if**` / `**Skip if**` line, or a `(Path X only)` heading marker. → if wrong, a conditional step written without a marker is reported as a step hole, i.e. a false positive that erodes the warning; mitigated by making the rule an authoring rule in `.bkit/core/.bkit/authoring.md` § Workflows Only (mirrored to `.bkit/authoring.md`) with a per-workflow fixture (TASK 7). Evidence holes, the primary class, do not depend on it.
- **Assumption:** the checker rules R1-R4 (§ Context & Goals) cover every step shape in the five workflow markdown files. → if wrong, a call R1 wrongly treats as a branch call is reported `unexercised` (the check under-reports, never alarms), and a call R3 attributes to the wrong neighbour shows as an evidence hole plus an `unexpected` call; TASK 8's replay case runs every step section of the five files in markdown order, so a shape the rules miss is a red test at build time, not a false warning in a live run.
- **Assumption:** the seam's default state at the end of Group 2 is **on**, with `BKIT_ENGINE_JOURNAL=off` as the escape. → if wrong (the seam must ship default-off for one release), the flip is a one-line change in `journalEnabled` plus its unit test, and no other task moves.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **A separate engine run-observability stream / sidecar file** (`engine-calls.jsonl` beside `status.jsonl`) — design Approach B. Rejected: departs Q6/Q8; the run's own artifacts stop carrying the verdict unless a pointer row lands, and a hard-killed process leaves a sidecar behind but not the pointer. Its isolation benefit is bought inside the chosen approach, once, by the `MARK_ROWS` reader fix. Recorded as the fallback if the reader surgery proves invasive.
- **A self-describing `step` field on each `engine-call` row** — design Approach B (ideate-1). Rejected: departs Q11's row shape verbatim and still cannot cover the step-less calls (`ledgers append`, `branches land`, `repo …`, `status row`), so it is the chosen approach plus a field. Kept as the fallback if positional attribution proves wrong in the corpus.
- **A compiled, drift-gated expectations manifest built at install time** — design Approach C. Rejected: departs Q4's runtime derivation and needs an owner-confirmed amendment to `384-tier3-promotion`; best 3am diagnosability of the three, so it is the natural next step if prose-parsing drift proves unmanageable.
- **Put the seam in `cli.ts main()` instead of `runCommand`** — design Approach C (ideate-1) / open question 10 option C. Rejected: a probe established that all 358 `"{BKIT}"` call sites (365 at `2003f19cc`) across the six workflow markdown files route through `runCommand` and none bypass it, and a `main()` wrapper would also have to refactor the classic-verb `process.exit` branches.
- **Q5's literal friction exclusion set `{3, 8, 9, 80, 81}`** — rejected by recorded decision `699-friction-exclusion-set-derived`: exits 1 (`NO`), 2 (`USAGE`) and 82 (`NEEDS_HUMAN`) are routine, so a literal set writes a `tool-failure` row on a failed gate, a usage error and a re-ask route — the noise that gets a detector muted.
- **Reinstate the pinned-watermark delta of `384-tier3-promotion`** — rejected by decision `699-completeness-check-no-watermark`: a flat delta is non-empty for a clean run, so the warning would fire on nearly every run; the evidence-hole / step-hole split scopes the signal instead.
- **Recommendation for a future phase:** promote the check from advisory to a blocking gate once one release of unmuted signal has accrued (decision `384-tier3-promotion`, deferral `384-promote-status-hole-detector-from-advisory-to-gate`); and, if positional attribution proves wrong in the corpus, revisit the self-describing-row fallback before widening the mechanism.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Promotion of the completeness check from a fail-open advisory to a blocking gate | No `Success Criteria` line, `Acceptance Scenario` line, `Derived Test Matrix` row or design item needs it: the design's constraint is "Advisory / fail-open until proven (one release without muting)", and criterion 4 requires the check never to change an exit code, block or fail a workflow | Design § Constraints and non-goals; already tracked by the pre-existing OPEN deferral `384-promote-status-hole-detector-from-advisory-to-gate` in `docs/deferrals.jsonl` (no new row written — that row is the matching one, and its promotion criteria are restated by the decision `384-tier3-promotion` row written for this plan) |
| Coverage of the `bkit-auto` router markdown by the check | Not needed by any criterion: `Success Criteria` 1 scopes the report to design / plan / build / debug / ship, and the derived universe is cross-checked against `WORKFLOW_STEPS`, whose keys are exactly those five; `bkit-auto` dispatches to them rather than carrying a step universe of its own | New deferral `699-completeness-check-excludes-bkit-auto-router` (`docs/deferrals.jsonl`, OPEN, `scope-declared`) |
| A success axis on the verdict — a required command that ran and failed | Not needed by any criterion: the design declares it a deliberate non-goal ("a required command that ran but failed still counts as present — a deliberate non-goal this cycle"), and the `engine-call` row records the attempt at dispatch entry, so "journaled" means attempted, not succeeded | New deferral `699-completeness-verdict-no-success-axis` (`docs/deferrals.jsonl`, OPEN, `scope-declared`) |
| Friction-key truncation / identity-collision class fix — the identity-gated prune truncates a friction key at ~68 chars, so two long same-prefix keys collide and the fold loser is destroyed | Not needed by any criterion: this plan's own keys are `<noun>-<verb>/<step>` and stay far under the truncation point, so it avoids the envelope rather than inheriting it, and a schema-level change to key minting / the prune gate is not this change | New deferral `699-friction-key-truncation-class-fix` (`docs/deferrals.jsonl`, OPEN, `own-cycle`) |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `telemetry validate` does not enforce the ts-mint or append-once invariants | `docs/failures.jsonl` key `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants` (OPEN, MEDIUM) | `validate` / `mintTs` in `.bkit/core/engine/ledgers/telemetry.ts`, which the seam calls for every friction row it writes | keep deferred — the seam composes rows through the existing primitives and does not widen `validate`; folding it would add a validation-contract change to a change that already touches the CLI hot path |
| `status.jsonl` run boundary keys on the last run overall, not on the last run of this workflow | `docs/deferrals.jsonl` key `58-status-jsonl-run-boundary-keys-on-last-run-overall` (OPEN, `needs-decision`) | `workflows start`'s run boundary and `fold` in `.bkit/core/engine/ledgers/status.ts`, both read by the seam's `resolveActiveRun` and by the new start warning (Group 6) | keep deferred — it needs the run-boundary semantics decided (the `#209` status substrate); the seam's resolve-or-skip already refuses to guess when more than one run is `IN_PROGRESS`, so it neither fixes nor worsens the interleave |
| `debug-run-tests` writes its `step-done` row with no commit, so attempt-row counting drifts | `docs/deferrals.jsonl` key `58-debug-run-tests-parentsha-advances-only-transitively` (OPEN, `needs-decision`) | the `step-done` rows and `parentSha` joins the checker reads, and the new friction row's `run.parentSha` join | keep deferred — a per-workflow row-shape decision; this plan reads those rows and must not change them |
| Ship's writable checkout of `feat/{FID}` outside the B2 conflict window | `docs/deferrals.jsonl` key `384-ship-without-a-writable-branch-checkout-outside-b2` (OPEN, `scope-declared`) | `statusLocation`'s book-root rule, which the seam's write root now depends on (Group 2) | keep deferred — removing ship's checkout is a ship-workflow redesign; the seam's write root is pinned to whatever `statusLocation` returns, so it follows that decision when it lands |
| Per-workflow rollback path for a shipped-but-wrong bkit workflow change | `docs/deferrals.jsonl` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (OPEN, `own-cycle`) | this plan's `Rollback Strategy`: a bad engine change reaches consumers on `bkit upgrade` with no per-workflow revert | keep deferred — it needs its own affordance design; `BKIT_ENGINE_JOURNAL=off` is the per-run escape only, not a rollback |
| `#701 — Engine work in build verify and ship: emit the facts, keep the judgement` (OPEN) | `related-issues.md:454-693` | `commands/registry.ts` + `commands/conventions.test.ts` (TASK 10 registers the `completeness` noun in both) and `commands/workflow/*`; #701 also adds a `tests plan-check` gate that will judge this plan's own runbook and matrix | keep deferred — sequence after this plan; the two changes edit the same registry / conventions surface, and folding them would put a second command family on this change's review surface |
| `#100 — Agentic preflight and runtime infra hardening` (OPEN) | `related-issues.md:754-818` | `.github/workflows/bkit-ci.yml`, edited by TASK 13 (advisory step + sweep-liveness assertion) | keep deferred — separate CI lane work with its own acceptance |
| `#556 — Review and adopt Compound Engineering patterns` (OPEN) | `related-issues.md:694` | none found — prompt / review-routing surfaces, not engine row readers, the dispatch seam or the check | no action — recorded so the "no open issue" claim is not left standing |
| `#101 — Agentic workflow: review routing, dry-runs, commit hygiene` (OPEN) | `related-issues.md:820` | none found — same reason as `#556` | no action — recorded so the "no open issue" claim is not left standing |

No audit report was supplied with the input, so there is no unnamed audit finding to list.

## Security & Privacy

- [x] **New API Route** — N/A, no HTTP surface; the only new surface is a CLI noun.
- [x] **New DB Table/Column** — N/A, no database in this repo.
- [x] **Role-Gated Mutation** — N/A. The engine's only writer gate is `writerProblem` in `.bkit/core/engine/ledgers/telemetry.ts`; it is unchanged, and the friction row passes it as the active workflow because `KIND_WRITERS.friction.orchestrators` already lists all five phases.
- [x] **User Input** — argv **flag names only** are journaled, never values (Q11): `--token=`, `--error=` and every free-text value stay out of `status.jsonl`. Values continue to be validated per verb by `parseFlags` and each verb's flag specs.
- [x] **PII** — the friction `description` carries the noun, the verb, the step and the exit code; no paths, branch names, tokens, issue bodies or free text. `docs/observability.md` gains the grep patterns for both prefixes.
- [x] **Redirect URL** — N/A.
- [x] **Webhook** — N/A.
- [x] **New Secret/Env Var** — `BKIT_ENGINE_JOURNAL` is a non-secret boolean kill switch, documented in `docs/observability.md`; it needs no secret-store entry and no service-account role.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no packages added or changed; `package.json` and `pnpm-lock.yaml` stay in sync untouched (the only `package.json` item is `bkit:audit:status`, whose path is unchanged because the module keeps its name).
- [x] **Dependency Versions:** node `v24.16.0`, pnpm `10.34.6` (matches `packageManager`). `pnpm bkit:deps:outdated` reports 5 outdated dev-only deps — `vitest` 5.0.3→5.0.5, `@vitest/coverage-v8` 5.0.3→5.0.5, `oxlint` 1.87.0→1.88.0, `@types/node` 24.19.2→26.6.5, `vite` 6.4.4→8.3.4. None blocks this change (no new deps); the `vite` and `@types/node` majors are upstream of this change and are **not** taken here.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory` — reads and greps of `.bkit/core/engine/checks/` (`status-holes.ts` + its test), `commands/lib.ts`, `commands/workflow/` (`workflows.ts`, `run-facts.ts`, `status.ts`, `step-table.ts`, `locks.ts`, `fids.ts`, `ledgers.ts`), `commands/registry.ts`, `commands/conventions.test.ts`, `ledgers/status.ts`, `ledgers/telemetry.ts`, `audits/workflows/workflow-shape.test.ts`, `scripts/harvest/bkit-harvest.mjs` + its test, `scripts/harvest/ledgers.integration.test.ts`, `.bkit/core/engine/install/manifest.ts`, `.bkit/core/.bkit/{workflows,jsonl,authoring}.md` and their `.bkit/` mirrors, `docs/testing.md`, `docs/observability.md`, `docs/architecture.md`, `.github/workflows/bkit-ci.yml`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`.
- [x] **User Context:** file access confirmed (worktree `.worktrees/699-engine-run-completeness`, `git status` clean, branch `feat/699-engine-run-completeness`); no missing user information — the one open question carries a recommendation and a default.
- [x] **Project Context:** read `docs/decisions.jsonl` keys `384-tier3-promotion`, `detector-and-analysis-signal-rules`, `ci-runs-tier3-status-hole-check-advisory`, `467-ship-step-names-frozen` and the 13 `699-*` rows; `docs/deferrals.jsonl` keys `442-status-hole-detector-beyond-ship`, `384-promote-status-hole-detector-from-advisory-to-gate`, `58-status-jsonl-run-boundary-keys-on-last-run-overall`; `.agents/docs.md`, `docs/architecture.md`, `docs/testing.md` § Which tier does a behaviour need? / § Tier-3 fail-open advisory channel, `docs/observability.md` § Log Format, `.bkit/core/.bkit/jsonl.md` § Categories / § Deferral Reason / § Write Idiom, `.bkit/core/.bkit/authoring.md` § Workflows Only, `.bkit/trackers.md` § Issue shapes.
- [x] **Testing & Quality:** matches `docs/testing.md` — every plan-added row is `Unit` or `Integration`; the four Integration rows (two integration files) cross a local stateful boundary (real git worktree + real filesystem + the real `runCommand` dispatch) with no mocks at the boundary and assert a ground-truth signal (the row's bytes on disk in the run's own root, and its presence in the harvested ledger). No external / deployed boundary → no `@live`, E2E, fresh-DB replay or Smoke row.
- [x] **Prerequisite Plans:** None. Group 1 must be fully built and verified before Group 2 emits any row (readers-first); Group 8's generated artifacts are built only after Groups 1–7.

### Conditional

- [x] **Secrets & Env Vars:** no secret added. `BKIT_ENGINE_JOURNAL` is a non-secret kill switch; no service-account role changes because the seam writes only to the run's own tree.
- [x] **Schema State:** N/A — no database; `docs/data-schema.md` has no tables.
- [x] **Architecture & UI:** `docs/architecture.md` gains `ledgers/journal.ts` in the engine tree in the same change that creates the file (TASK 3); no UI.
- [x] **Observability:** per `docs/observability.md` — the seam logs swallowed writes as `[bkit-telemetry] {message}`; the check logs its report and heartbeat as `[bkit-status-holes] {message}`; both prefixes already exist, and TASK 14 records the lines and their grep patterns.
- [x] **Notifications:** None — no alert or toast. The start warning is a stderr log line inside a CLI run, not a notification tier.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** every applicable row verified; the N/A rows justified above.
- [x] **Reuse Inventory complete:** every capability has a row with a `Search performed` entry and a `Decision`; every `NEW` cites its reason (a)/(b)/(c).
- [x] **Gate 1 - Verified:** Core items and applicable Conditional items checked; the three human-confirmation boxes are `[x]`.

## Data Schema Integration

None — no database in this repo. The two new row types are additive to a JSON-line log, not to a schema.

### Data Schema Usage

None.

### Data Schema Changes

None. `docs/data-schema.md` has no tables. The `status.jsonl` row-type table in `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`) and the friction-ledger field table in `.bkit/core/.bkit/jsonl.md` (mirrored to `.bkit/jsonl.md`) are the schema surfaces, and both are updated in this change — at the source, with the mirrors regenerated by `bkit install` in the same task (TASK 2, TASK 3).

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| md-derived expected set + advisory report | `.bkit/core/engine/checks/status-holes.ts` | read in full; `grep -rn "status-holes"` across the repo; `grep -rln "SHIP_STEP_ORDER"` | `.bkit/core/engine/checks/status-holes.ts` — covers `deriveExpectedStepSetFromSource`, `classifyRun`, `computeMandatoryForPath`, `detectHoles`, `formatAdvisoryReport`, exit-0 `main`; hard-coded to `ship-` (a `(?:step:"\|--step=)(ship-[a-z-]+)` regex, a frozen `SHIP_STEP_ORDER`, three ship-only skip sets) | EXTEND | Generalise in place to all five workflows — the constraint forbids a second detector. Parameterise the step prefix, replace the source-derivation pair with `deriveContract(workflowMd, workflow)` + a deduped `WORKFLOW_STEPS[workflow]` cross-check, and keep `SHIP_STEP_ORDER` as the frozen ship step-name list (decision `467-ship-step-names-frozen`), now asserted equal to `WORKFLOW_STEPS.ship`. `classifyRun` / `computeMandatoryForPath` stay ship-shaped. |
| md section + `"{BKIT}"` call parser | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | read `stepSections` (line 815), `callWords` (65), `unknownCalls` (87); greps for `WORKFLOW_STEPS` / `COMMANDS` imports in the file | `stepSections` / `callWords` — pure text helpers already held to the markdown; `unknownCalls` — needs `COMMANDS` from `commands/registry` | EXTEND | Promote `stepSections` / `callWords` out of the test into the check module and import them back, so one parse serves the test and the deriver. `unknownCalls` stays in the test: a `checks → commands/registry` edge would pull all 24 command modules into the check. |
| Step universe (numbers, titles, `--step=` keys) | `.bkit/core/engine/commands/workflow/step-table.ts` | read `WORKFLOW_STEPS`, `WorkflowStep`, `ResumableWorkflow`, `resumePoint`; `grep -rn "WORKFLOW_STEPS"` | `WORKFLOW_STEPS` — already held to the markdown headings and `--step=` calls by `workflow-shape.test.ts`; drift-gated, so not a second source of truth | EXTEND | Cross-check the derived universe against the **deduped** table (the table repeats group-loop steps) and report drift rather than fail. `resumeAt` / `resumeOnVerdict` are resume semantics and stay unconsulted. |
| `status.jsonl` read / write | `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/ledgers/status.ts` | read `readStatusRows`, `readStatusRowsAt`, `readStatusEvents`, `readRuns`, `FILE_FLAG`, `WORKFLOW_FLAG`; read `appendLine`, `fold`, `statusTimestamp` | `readStatusRows` accepts any `type`; `fold` ignores unknown types; `appendLine` serialises any row | EXTEND | The journal row and the verdict row ride the existing readers and writer unchanged; the inert-row assertion pins what is currently assumed. |
| Dedup-by-key idiom | `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/telemetry.ts` | `grep -rn "actionKey\|actionHash\|alreadyDone\|recordAction\|ENGINE_ACTION\|recurrenceCount\|function identity"` | `actionKey` / `actionHash` / `alreadyDone` / `recordAction` (the `engine-action` guard); `identity()` in `telemetry.ts` (`kind + repo + key`) | ADAPT | The `engine-action` idiom is a guard, not a journal, so it does not apply. `recurrenceCount` is declared and computed by nothing (two grep hits: the declaration and a test fixture), so the seam reads the prior same-`key` row and writes `recurrenceCount + 1`; `appendLedgerRows` never reads back. |
| Friction ledger write | `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.ts` | read `appendLedgerRows` and its imports; read `validate`, `writerProblem`, `mintTs`, `APPEND_LEDGERS`, `KIND_WRITERS` | `appendLedgerRows` — mints `ts`, re-runs `validate` then `writerProblem`, throws on either refusal, and imports `../lib.js`; the `ledgers/telemetry.ts` primitives import nothing from `commands/` | EXTEND | Compose the row from the `ledgers/telemetry.ts` primitives rather than `appendLedgerRows`, which would cycle `lib.ts` through the engine's most-imported module. `KIND_WRITERS.friction.orchestrators` already admits `by.workflow` for all five phases — no contract change. |
| Command dispatch seam | `.bkit/core/engine/commands/lib.ts` | read `runCommand` (317), `EXIT` (24), `SHARED_EXIT_CODES` (38), `CommandError`, `statusLocation` (569), `statusRelPath`, `repoRoot`; `grep -n "^import"` | `runCommand` — the single dispatch for all 24 registered nouns, with `spec.exitCodes` in scope; `statusLocation` — already resolves a run's own book root vs `repoRoot(cwd)` | EXTEND | Bracket the dispatch: journal on entry, friction on exit, resolve-or-skip attribution through `statusLocation`, all inside a total swallow. The design's probe verified 358 `"{BKIT}"` call sites (365 at `2003f19cc`) / 21 nouns / 79 noun+verb pairs and 0 bypasses, so one hook covers every current and future verb. |
| Command registration + conventions | `.bkit/core/engine/commands/registry.ts`, `.bkit/core/engine/commands/conventions.test.ts` | read `COMMANDS`; read `GROUPS`, `HELPER_SOURCES`, `commandSources`, `conventionProblems`, `ownCodesReturned` | `registry.ts` — one import + one array entry per noun; `conventions.test.ts` — already checks kebab-case, camelCase output keys, reachability and "lists every exit code its source can return", and requires a test file beside each source in `commands/{workflow,ci,setup}/` | EXTEND | Register `completenessCommand`; the new source ships `completeness.test.ts` beside it, is reachable from `COMMANDS`, and lists every exit code its source can return. |
| Run attribution with no new state | `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/locks.ts`, `.bkit/core/engine/commands/workflow/fids.ts` | `grep -n "export function monthBuckets\|resolveMonth\|readRunsLenient\|workflowLockPath"`; read the import blocks of both files; read `lib.ts`'s own import block and `ledgers/status.ts`'s | `locks.ts` (`monthBuckets`, `resolveMonth`, `readRunsLenient`) and `fids.ts` (`logged`, `freeFid`) — both import `../lib.js`, so `lib.ts` cannot import them without a cycle; no helper answers "the active run from this cwd" | ADAPT | Add `resolveActiveRun` to `commands/lib.ts` itself, where `statusLocation`, `statusRelPath`, `repoRoot`, `git` and `parseJson` (`../shared/json.js`) are in scope, and walk `docs/plans/*/logs/*/status.jsonl` scoped to the cwd's toplevel and capped. Read each file with `lib.ts`'s own `node:fs` + `parseJson` and fold with `fold` / `StatusEvent` from `../ledgers/status.js` — a leaf importing only `node:crypto`, `node:fs`, `node:path`, `../shared/json.js`, never `lib.js`. Import direction is one-way: code under `commands/` may import `ledgers/*`, never the reverse, and `lib.ts` never imports a `commands/**` module (no cycle detection ships). From the main checkout it finds no active run, so an out-of-worktree call is skipped, never misattributed. |
| Current-step resolution for the friction key | `.bkit/core/engine/commands/workflow/step-table.ts` | read `resumePoint` and its `ResumePoint` type | `resumePoint` — exists and works, but it is inference over the run's own rows | ADAPT | Not used: decision `699-friction-dedup-key-step-resolution` takes the failing command's own `--step=` else the `<noun>-<verb>` sentinel, so `by.step` is never empty and the row is never refused. `resumePoint` is the fallback if the corpus shows the sentinel loses too much. |
| `status.jsonl` row-type table | `.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`) | `grep -n "status.jsonl"` § Row type table; `diff .bkit/core/.bkit/workflows.md .bkit/workflows.md`; read `.bkit/core/engine/install/manifest.ts:136-141` (`byte-equal-text`, writeTier1) | the package-side `.bkit/core/.bkit/workflows.md` — the canonical source its consumer mirror is rendered from every install | EXTEND | Add the two new row types to the source table (TASK 2) in the same change as the rows first appear, then `bkit install` regenerates `.bkit/workflows.md`; editing only the mirror loses the edit on the next install / upgrade and fails the `pnpm bkit check` drift gate. |
| `.bkit/jsonl.md` + `.bkit/authoring.md` doc surfaces | `.bkit/core/.bkit/jsonl.md` (→ `.bkit/jsonl.md`), `.bkit/core/.bkit/authoring.md` (→ `.bkit/authoring.md`) | `diff` each `.bkit/core/.bkit/<doc>.md` against its `.bkit/<doc>.md`; read `.bkit/core/engine/install/manifest.ts:136-153` (both `byte-equal-text`, writeTier1, "refreshed every install") | the package-side sources under `.bkit/core/.bkit/`, mirrored into `.bkit/` on every install | EXTEND | Edit the package-side source in TASK 3 (jsonl) and TASK 7 (authoring); `bkit install` regenerates the `.bkit/` mirrors in the same task, and `pnpm bkit check` gates the pair. Editing only the consumer mirror is silently lost on the next install and fails the drift gate. |
| Friction row survives `ledgers commit` and harvest | `scripts/harvest/ledgers.integration.test.ts` | `ls scripts/harvest/`; read the file header (split contract: copy `stats.jsonl`, move `friction.jsonl`, prune only rows durably in the store) and its `harvestConsumer` / `pruneConsumerFile` / `runHarvest` imports | `scripts/harvest/ledgers.integration.test.ts` — real filesystem / store boundary, no mock; covers the split contract but never a row the engine's seam wrote | EXTEND | Add the end-to-end case to the existing file: a row the seam wrote lands in the run's own `.bkit/friction.jsonl`, then `bkit ledgers commit`, then `runHarvest`, and the row is asserted in the harvested ledger. Extending keeps the identity-gated prune surface guarded by the file that already owns it. |
| Step-timing + harvest run windows | `.bkit/core/engine/commands/workflow/run-facts.ts`, `scripts/harvest/bkit-harvest.mjs`, `scripts/harvest/bkit-harvest.test.mjs` | `grep -n "MARK_ROWS"` in both; read `stepsBlock`; read the parity test at `bkit-harvest.test.mjs:2937` | `MARK_ROWS` (`{session, owner-pause, owner-answer}`) in `run-facts.ts:354` and a second copy in the harvest script at `:1478`, pinned equal by the parity test; `splitRuns` (`run.last`) and `runRows` / `lastActivity` | EXTEND | Both copies plus the parity test change together or the harvest test fails. Measured without the fix: total step minutes 1208.1 → 0.7. The harvest's `afterEnd` moves when journal rows land after a terminator — accepted and documented. |
| Advisory CI wiring | `.github/workflows/bkit-ci.yml`, `docs/testing.md`, `package.json` | read the `Check Status Holes` step (`pnpm bkit:audit:status \|\| true`), the `bkit:audit:status` script, and `docs/testing.md` § Tier-3 / § the static lane | the advisory step, the script path, and two sentences naming `bkit-ship.md` and the ship-only test file | EXTEND | Repoint the step at the generalised check (the module's own CLI, so the lane needs no `dist/`), keep `\|\| true`, add a sweep-summary liveness assertion; generalise the two `docs/testing.md` sentences and record the fixture corpus. The promotion gate `384-tier3-promotion` is unchanged. |
| Generated + committed artifacts | `docs/capabilities.md`, `dist/` | `ls docs/capabilities.md`; read `package.json` scripts `graph:rollup` and `bkit:check:dist` | `docs/capabilities.md` (graphify rollup, CI-gated) and `dist/` (rebuilt and diffed by `bkit:check:dist`) | EXTEND | Two new modules change both; `pnpm graph:rollup` and `pnpm build` run in the same change (TASK 15), since both are CI-gated. |
| `completeness` command noun + verb | `.bkit/core/engine/commands/workflow/completeness.ts` | searched `commands/registry.ts`, `cli.ts` `CLASSIC_VERBS`, and the `status-holes.ts` CLI (a `tsx` script, not a verb) | None — no registered command reports step / command completeness for any phase | NEW | (a) the searches find no candidate: the only reporting surface today is the ship-only `tsx` script, which is not a verb and takes no `status.jsonl` + workflow pair as a command contract. The logic must be the extended `status-holes` module, never a reimplementation. |
| `engine-call` + `completeness` row types | `.bkit/core/engine/checks/status-holes.ts` (the row contract) | `grep -rn "\"type\": \"\|type: \"" .bkit/core/engine/ledgers/ .bkit/workflows.md`; read the `engine-action` row shape | None — the nearest is `engine-action` (`{type, action, key, hash, ref, at}`), a dedup guard written only by the acting verb and requiring key + hash + ref | NEW | (a) the searches find no candidate: `engine-action` is a guard, not a journal, and it cannot carry an attempt record. Both new rows are additive — `fold` skips unknown types and `readStatusRows` accepts any `type` — so no existing row changes shape. |
| Seam row builders (`engineCallRow`, `frictionRow`, `shouldRecordFriction`, `frictionKey`, `appendJournalRow`, `appendFrictionRow`, `journalEnabled`) | `.bkit/core/engine/ledgers/journal.ts` | read `ledgers/telemetry.ts` `validate` / `writerProblem` / `mintTs` / `APPEND_LEDGERS` / `identity`; read `ledgers/status.ts` `appendLine` / `statusTimestamp` / `fold`; read `commands/workflow/ledgers.ts` `appendLedgerRows` and its imports; read `commands/lib.ts`'s import block; `grep -rn "process.env.BKIT_" .bkit/core/engine/` for an existing env-gate idiom | None — `telemetry.ts` owns row *validation*, not composition; `appendLedgerRows` imports `../lib.js`; `commands/workflow/*.ts` and `locks.ts` / `fids.ts` also import `../lib.js`; the env-gate search found `process.env.BKIT_DEBUG` in `checks/after/ci-yml.ts:291` and the wider `BKIT_*` family | NEW | (a) the searches find no candidate that composes an engine-authored row, and (b) the two obvious homes would break their callers: putting the builders in `telemetry.ts` widens a validation module into row composition, and calling `appendLedgerRows` from the seam cycles `lib.ts` — the engine's most-imported module — in a repo with no cycle detection. The leaf module imports only `node:fs`, `node:path`, `./status.js`, `./telemetry.js`, so it adds no cycle. The `BKIT_ENGINE_JOURNAL` kill switch is not a new gate surface: `journalEnabled(env)` copies the existing `process.env.BKIT_DEBUG` read shape rather than adding a config file or a second idiom. |
| Seam unit tests | `.bkit/core/engine/ledgers/journal.test.ts` | `ls .bkit/core/engine/ledgers/` | None — `telemetry.test.ts` and `status.test.ts` test their own modules | NEW | (a) the searches find no candidate: no existing test file exercises the seam's row builders. |
| Seam real-boundary tests | `.bkit/core/engine/ledgers/journal.integration.test.ts` | `ls .bkit/core/engine/**/*.integration.test.ts`; read `commands/workflow/shared-checkout.integration.test.ts` and `scripts/harvest/ledgers.integration.test.ts` headers | `scripts/harvest/ledgers.integration.test.ts` (filesystem / consumer-repo boundary, real filesystem stat, no mock) — covers the harvest's split contract, not the engine's write root | NEW | (a) the searches find no candidate: no existing integration test drives `runCommand` against a real worktree that already holds a `status.jsonl`, which is the only way to assert the write root the design's spike disproved (spike C4: `repoRoot(cwd)` from `.worktrees/{fid}` resolves to the main checkout — a different inode). |
| `completeness` command tests | `.bkit/core/engine/commands/workflow/completeness.test.ts` | read `commands/conventions.test.ts` § "each have a test file next to them" | None — every other source in `commands/workflow/` has its own `<name>.test.ts` | NEW | (b) extending a candidate breaks its callers: `conventions.test.ts` requires a test file beside each source in `commands/workflow/`, so the new command source cannot reuse another command's test file. |
| Shell liveness test for the CI advisory step | `tests/status-holes-sweep-liveness.bats` | `ls tests/`; read `tests/gh-stub-smoke.bats` and `tests/bkit-cloud-bootstrap-preflight.bats`; `grep -n "bkit:test:bats" package.json docs/testing.md` | `tests/gh-stub-smoke.bats` and `tests/bkit-cloud-bootstrap-preflight.bats` — the repo's bats files, each covering shell logic vitest cannot reach, with a `tests/fixtures/` corpus and an env shim | NEW | (a) the searches find no candidate: no existing bats file exercises the status-holes sweep or the lane's summary-line grep, and that grep's contract lives in `.github/workflows/bkit-ci.yml` shell, which vitest cannot reach. The unit lane runs it via `pnpm bkit:test:bats`. |

## Architecture & Component Changes

One mechanism, four parts, each pure and independently testable; every part reuses an existing artifact (see `Reuse Inventory`). Import direction is one-way: code under `.bkit/core/engine/commands/` may import `ledgers/*`, never the reverse, and `commands/lib.ts` never imports a `commands/**` module (the repo ships no cycle detection). Files grouped by area below.

**Ledger rows:** `699-completeness-check-module-and-seam-files`, `384-tier3-promotion`, `442-status-hole-detector-beyond-ship`, `699-completeness-check-excludes-bkit-auto-router`, `699-completeness-verdict-no-success-axis`, `699-friction-key-truncation-class-fix`

### Database Migrations

None — no database, no migration, no seed.

### Engine check (contract deriver + verdict checker)

The single generalised check module. Keeps its file name and its registered `[bkit-status-holes]` log prefix (decision `699-completeness-check-module-and-seam-files`) and its advisory exit-0 CLI.

#### [MODIFY] `.bkit/core/engine/checks/status-holes.ts`

- **Existence Check:** exists (477 lines); read in full.
- Add `deriveContract(workflowMd, workflow) → { steps: [{ number, title, stepKey?, requiredCalls: [{ noun, verb, flags[], position, branch }] }], workflowCalls: [{ noun, verb }], universe }`: step sections from the `## … Step N — Title` headings (`###` group-loop headings included, so build's `## Group Loop — Steps 7-9` is covered), required calls from every `"{BKIT}"` literal inside the step's section reduced to noun / verb / flag names, each tagged with `position` (`pre` or `post` its section's own `steps finish` / `steps done` line) and `branch` (R1: under a `- **If**` / `- **Else**` bullet, or in a sub-step a route line names as its target); `workflowCalls` from every `"{BKIT}"` literal outside any step section (R4); and a cross-check of the derived universe against the deduped `WORKFLOW_STEPS[workflow]` (drift reported, not fatal).
- Add `check(rows, contract) → CompletenessVerdict` classifying `evidenceHoles`, `stepHoles`, `unexercised`, `unexpected`, `unattributable`, and carrying `verdict` (`CLEAN|HOLEY`), `preJournal`, `journalSuspect`, `observed`, `sourceSha`, `workflowCalls`. `holey` keys on evidence + step holes only. Attribution (R3): each contract-step row, repeats included, owns the `engine-call` rows in the gap before it (its `pre` calls) and the gap after it up to the next contract-step row (its `post` calls); a gap whose neighbouring rows are both outside the contract, or the gap after the terminator, is `unattributable`. Matching (R2) is on noun + verb only. An absent `branch` call is `unexercised`, never an evidence hole (R1). A call matching a `workflowCalls` entry is never `unexpected` (R4).
- Add the step-conditionality rule: a step is conditional when a column-0 `**Run only if**` / `**Skip if**` line sits anywhere inside its section, or its heading carries a `(Path X only)` marker.
- Add the read path: take the last stored `completeness` row for a run and recompute when rows follow it; self-exclude the `completeness` verb from its own expectations and its own `unexpected` list.
- Add the promoted pure helpers `stepSections` and `callWords`, imported back by `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`.
- Generalise the advisory CLI's `main()` so each run in each `status.jsonl` positional infers its workflow from that run's own rows, and print a per-file report plus one sweep-summary line counting holey runs; drop the `--ship-md` override.
- **[DELETE]** `deriveExpectedStepSetFromSource` and `checkSourceCanonicalDrift`: replaced by `deriveContract` and its `WORKFLOW_STEPS` cross-check (see `Supersession Inventory`). `SHIP_STEP_ORDER`, `classifyRun`, `computeMandatoryForPath`, `detectHoles` and `formatAdvisoryReport` are retained.

#### [MODIFY] `.bkit/core/engine/checks/status-holes.test.ts`

- **Existence Check:** exists; read its header and case list.
- Extend the existing describe blocks (`source derivation`, `classifyRun`, `computeMandatoryForPath`) with the generalised deriver, the conditionality rule and the verdict cases; retarget the two cases that import the deleted exports.

#### [MODIFY] `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- **Existence Check:** exists (1763 lines); read `callWords` (65), `unknownCalls` (87), `stepSections` (815).
- Import `stepSections` / `callWords` from the check module; keep `unknownCalls` and its `COMMANDS` import where they are.

### Ledgers (the dispatch seam's row primitives)

#### [NEW] `.bkit/core/engine/ledgers/journal.ts`

- **Reuse Check:** `Reuse Inventory` row "Seam row builders", reason (a)/(b).
- Leaf module: imports only `node:fs`, `node:path`, `./status.js`, `./telemetry.js`. Exports `engineCallRow({workflow, at, noun, verb, flags})`, `frictionRow({workflow, step, noun, verb, code, bookRoot, parentSha})`, `shouldRecordFriction(code, excludedCodes)`, `frictionKey(noun, verb, step)`, `appendJournalRow(file, row)`, `appendFrictionRow(bookRoot, row)`, `journalEnabled(env)`. `excludedCodes` is computed by the caller in `commands/lib.ts` (where `SHARED_EXIT_CODES` and the verb's `spec.exitCodes` are both in scope) and passed in, so the leaf never reads a `commands/**` module. Every export is synchronous, never throws, and returns a result object so the seam can swallow and log.

#### [NEW] `.bkit/core/engine/ledgers/journal.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Seam unit tests", reason (a).
- Unit cases over the exclusion set, the step sentinel and dedup key, `recurrenceCount`, flag-name-only `engine-call` rows, and the swallowed-write line.

#### [NEW] `.bkit/core/engine/ledgers/journal.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Seam real-boundary tests", reason (a).
- Real temp git repo with a `.worktrees/{fid}` checkout holding a `status.jsonl`; drives the real `runCommand` with a verb that exits undeclared and asserts the `friction` row's bytes in the **worktree's** `.bkit/friction.jsonl` (not the main checkout's), and that a call from the main checkout writes nothing.

### Commands (dispatch seam, new noun, close/start call sites)

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`

- **Existence Check:** exists (604 lines); read `runCommand` (317), `EXIT` (24), `SHARED_EXIT_CODES` (38), `statusLocation` (569).
- Add `resolveActiveRun({cwd, root, file, fid, month})`: the command's own `--file`, else `--fid` + `--month` via `statusLocation`, else the single `IN_PROGRESS` run found by walking `docs/plans/*/logs/*/status.jsonl` under the cwd's git toplevel (scoped to that toplevel, capped, each file read with `lib.ts`'s own `node:fs` + `parseJson` and folded with `fold` / `StatusEvent` from `../ledgers/status.js` — never through a `commands/**` import, which would cycle `lib.ts`); more than one candidate and no `--file` / `--fid` → return nothing.
- Bracket `runCommand`: journal one `engine-call` row at dispatch entry and the `friction` row on an unexpected non-zero exit or a non-`CommandError` throw, both through `ledgers/journal.js`, both inside nested try/finally so no exit code, output object or throw is altered. Compute the exclusion set here — `SHARED_EXIT_CODES` ∪ `spec.exitCodes` — and pass it to `shouldRecordFriction` as `excludedCodes`. Add an optional `journal` member to the `options` argument so the hot path is injectable in tests. Every write targets the active run's own book root from `statusLocation`, never `repoRoot(cwd)`.

#### [MODIFY] `.bkit/core/engine/commands/lib.test.ts`

- **Existence Check:** exists; read `describe("runCommand")`.
- Add the exit-code-passthrough case (a forced journal throw leaves the verb's own code on the way out) and the one-stderr-line case.

#### [NEW] `.bkit/core/engine/commands/workflow/completeness.ts`

- **Reuse Check:** `Reuse Inventory` row "`completeness` command noun + verb", reason (a).
- A thin `CommandSpec`: noun `completeness`, verb `check`, flags `--workflow=` (optional, `WORKFLOW_FLAG`) and `--file=` (`FILE_FLAG`); reads `status.jsonl` and the workflow markdown, calls the WS-2 checker, prints the report, always returns `EXIT.OK`. With `--workflow` absent it infers each run's workflow from its own rows. Logs under `[bkit-status-holes]` via `ctx.log` and emits one output object via `ctx.emit`.

#### [NEW] `.bkit/core/engine/commands/workflow/completeness.test.ts`

- **Reuse Check:** `Reuse Inventory` row "`completeness` command tests", reason (b) — `conventions.test.ts` requires a test file beside each source in `commands/workflow/`.
- The command's conventions cases, the exit-0 case on a known-holey run, and the workflow-inference case.

#### [MODIFY] `.bkit/core/engine/commands/registry.ts`

- **Existence Check:** exists (59 lines); read `COMMANDS`.
- Import `completenessCommand` and add it to `COMMANDS`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** exists (2527 lines); read `appendStats` (1026), `closeWorkflow` (1115), the `start` verb (1904).
- In `closeWorkflow`: after the close step's row and before the `workflow-done` row, call the checker in-process and append the `completeness` row, inside the `appendStats` fail-open idiom (try/catch → one `[bkit-telemetry]` line → degrade to no row).
- In the `start` verb: resolve the previous run in the same `status.jsonl` (the run immediately preceding the one being started / resumed, whatever its workflow), read its **last** stored `completeness` row or compute the verdict on the fly, and print one `[bkit-workflows]` warning line via `ctx.log` when holey — naming the workflow, run number, close time and the reading command. Never interrupt, never prompt; stdout stays the single output object.
- Pass `journalSuspect` only from the close path.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.test.ts`

- **Existence Check:** exists; read `describe("bkit workflows start")` and the close cases.
- Add the close-ordering case, the forced-throw case, and the holey-previous-run warning case.

### Telemetry readers

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.ts`

- **Existence Check:** exists (501 lines); read `stepsBlock` (116) and `MARK_ROWS` (354).
- Add `engine-call` and `completeness` to `MARK_ROWS`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.test.ts`

- **Existence Check:** exists; read `describe("runStatusRows / stepsBlock / ciList")`.
- Add the step-timing case: two journal rows between `step-done` rows leave the run's total step minutes byte-identical to the same fixture without them.

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.test.ts`

- **Existence Check:** exists; read its cases.
- Add the unknown-row-type-inert assertion across `readStatusRows`, `fold` and `runStatusRows`, so a missed reader is a red test rather than silent telemetry corruption.

#### [MODIFY] `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** exists (4819 lines); read `MARK_ROWS` (1478), `splitRuns` and `runRows` / `lastActivity`.
- Add `engine-call` and `completeness` to the harvest's own `MARK_ROWS` copy in the same commit as the engine's, and audit `splitRuns` (`run.last` on every non-start row) and `runRows` / `lastActivity` for the accepted `afterEnd` / `scan.rows` shift.

#### [MODIFY] `scripts/harvest/ledgers.integration.test.ts`

- **Existence Check:** exists; read its header and `harvestConsumer` import list.
- Add the friction end-to-end case: a seam-written row in a run's own `.bkit/friction.jsonl` survives `ledgers commit` and appears in the harvested ledger.

### CI

#### [MODIFY] `.github/workflows/bkit-ci.yml`

- **Existence Check:** exists; read the `Check Status Holes` step (510).
- Keep `pnpm bkit:audit:status || true` as the advisory step (the module's own `tsx` CLI, so the lane needs no `dist/`), and add a sweep-summary liveness assertion: the step fails the lane when the sweep printed no summary line, so a silent no-op is caught rather than passing green.

### Documentation surfaces (non-`docs/`)

`.bkit/{workflows,jsonl,authoring}.md` are force-overwritten mirrors (`writeTier1`, `format: "byte-equal-text"`, "refreshed every install" — `.bkit/core/engine/install/manifest.ts:136-153`) of the package-side `.bkit/core/.bkit/*.md`. Every edit below targets the **source**, and the task that edits it runs `bkit install` to regenerate the `.bkit/` mirror in the same change; `pnpm bkit check` gates the pair. Editing only the mirror is silently lost on the next `bkit install` / `bkit upgrade`.

#### [MODIFY] `.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`)

- **Existence Check:** exists; read § `status.jsonl` — Row type table. Its `.bkit/workflows.md` mirror differs only in the rendered managed marker.
- Add `engine-call` and `completeness` rows; name build Step 4's skip row; then regenerate the mirror with `bkit install`.

#### [MODIFY] `.bkit/core/.bkit/jsonl.md` (→ `.bkit/jsonl.md`)

- **Existence Check:** exists; read § Categories, § Per-Kind Fields and the `run` row's `scan` block.
- Record that the engine writes `friction` **as** the active workflow, the friction row's `scope: "bkit-repo"`, the `tool-failure` category's use, and the accepted `afterEnd` / `scan.rows` shift when journal rows land after a run's terminator; then regenerate the mirror with `bkit install`.

#### [MODIFY] `.bkit/core/.bkit/authoring.md` (→ `.bkit/authoring.md`)

- **Existence Check:** exists; read § Workflows Only (101-120).
- Add the step-conditionality authoring rule under § Workflows Only: a conditional step carries a column-0 `**Run only if**` / `**Skip if**` line inside its own section, or a `(Path X only)` heading marker, because the completeness check derives conditionality from those markers and nothing else; and the row rule: every step writes its own `steps finish` / `steps done` row on every route toward the next step, or carries one of those markers; then regenerate the mirror with `bkit install`.

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** exists; read § Step 4 — Plan Convert (374-401) and § Step 5 — Plan Current sub-step 2 (the skip row it mirrors).
- Split Step 4's sub-step 1 pass route by `CONVERTED`; add sub-step 4, the `build-plan-convert` skip row (`--attempt=1`, `--comment-field="Status=skipped (plan already in task-block form)"`), and its Gate 4 line; then regenerate the host mirrors with `bkit install`.

### Documentation (`docs/`)

#### [MODIFY] `docs/observability.md`

- **Existence Check:** exists; read § Log Format and the `[bkit-telemetry]` section (54).
- Add a `### [bkit-status-holes]` prefix section (the advisory report line, the sweep-summary line, the `journalSuspect` heartbeat line and their grep patterns), the seam's new `[bkit-telemetry] {kind} row not written: {reason}` swallow line, and the `BKIT_ENGINE_JOURNAL` kill switch.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** exists; read § Tier-3 fail-open advisory channel (561) and the static-lane paragraph (755).
- Generalise the two sentences naming `bkit-ship.md` and the ship-only test file to all five workflows; record the per-workflow fixture corpus; update the static lane's `bkit:audit:status` description and the key-test-files row for `checks/status-holes.test.ts`.

#### [MODIFY] `docs/architecture.md`

- **Existence Check:** exists; read § Package Boundaries.
- Place `.bkit/core/engine/ledgers/journal.ts` in the engine tree description (a leaf that composes the engine's own `engine-call` and `friction` rows).

#### [MODIFY] `docs/capabilities.md`

- **Existence Check:** exists (47 KB), generated by `pnpm graph:rollup`; never hand-edited.
- Regenerate with `pnpm graph:rollup` and commit the result in the same change as the new modules.

#### [MODIFY] `docs/decisions.jsonl`

- **Existence Check:** exists (734 rows); the 13 `699-*` design rows are already on disk.
- Rows written for this plan (already appended, listed on the `**Ledger rows:**` line): `699-completeness-check-module-and-seam-files` (new) and `384-tier3-promotion` (same key, restated promotion criteria).

#### [MODIFY] `docs/deferrals.jsonl`

- **Existence Check:** exists; `442-status-hole-detector-beyond-ship` was OPEN at row 80.
- Rows written for this plan (already appended): `442-status-hole-detector-beyond-ship` (`CLOSED`, superseded), plus the three `Exempt` mirrors `699-completeness-check-excludes-bkit-auto-router`, `699-completeness-verdict-no-success-axis` and `699-friction-key-truncation-class-fix`.

### Rebuilt payload (generated, not a doc surface)

`dist/` is regenerated and committed in the same change (`pnpm build`), and the graphify rollup is refreshed (`pnpm graph:rollup`) — both are CI-gated (`pnpm bkit:check:dist` rebuilds and diffs `dist/`; the rollup gate diffs `docs/capabilities.md`). Neither is a source artifact, so neither gets a file block above; TASK 15 does the work.

### Cron Jobs & Scheduled Tasks

None — no scheduled task is added. The CI advisory step runs inside the existing `bkit-tests-static` lane; it is not a cron entry, and `docs/deployments.md` § CI lanes already describes that lane.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `deriveExpectedStepSetFromSource` and `checkSourceCanonicalDrift` (the ship-`step:`-fixed derivation and its `SHIP_STEP_ORDER` canonical cross-check) in `.bkit/core/engine/checks/status-holes.ts` | `deriveContract(workflowMd, workflow)` and its deduped `WORKFLOW_STEPS[workflow]` cross-check in the same module | DELETE | The only importer is `checks/status-holes.test.ts`, updated in the same task, so nothing outside the module migrates. The design requires the ship-only prefix, canonical set and skip sets to be replaced, never duplicated (a second detector is forbidden by the issue's constraints). `SHIP_STEP_ORDER` is **retained as data** — the frozen ship step-name list that decision `467-ship-step-names-frozen` ties to every historical ship run — and is now asserted equal to the deduped `WORKFLOW_STEPS.ship`; only its role as the cross-check's fixed reference is retired. |

No `RETAIN-WITH-REASON` row: nothing else is superseded. `classifyRun`, `computeMandatoryForPath`, `detectHoles`, `formatAdvisoryReport` and the exit-0 `main()` are retained and generalised in place, not replaced.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`) | § `status.jsonl` — Row type table gains `engine-call` and `completeness`; the build Step 4 entry names the skip row; the `.bkit/` mirror regenerated with `bkit install` |
| `.bkit/core/.bkit/jsonl.md` (→ `.bkit/jsonl.md`) | the engine writes `friction` as the active workflow; the friction row's `scope`; the accepted `afterEnd` / `scan.rows` shift on the `run` row; the `tool-failure` category's use; the ~68-char friction-key truncation bound `frictionKey` must stay under; the `.bkit/` mirror regenerated with `bkit install` |
| `.bkit/core/.bkit/authoring.md` (→ `.bkit/authoring.md`) | § Workflows Only — the step-conditionality authoring rule (column-0 `**Run only if**` / `**Skip if**`, `(Path X only)` headings) that the deriver depends on, and the row rule (every step writes its own row on every route toward the next step, or carries a marker); the `.bkit/` mirror regenerated with `bkit install` |
| `docs/observability.md` | new `### [bkit-status-holes]` prefix section (report, sweep-summary and `journalSuspect` heartbeat lines with grep patterns); the seam's `[bkit-telemetry] {kind} row not written: {reason}` swallow line; the `BKIT_ENGINE_JOURNAL` kill switch |
| `docs/testing.md` | § Tier-3 fail-open advisory channel generalised from ship to all five workflows; the per-workflow fixture corpus recorded; the `sourceSha` replay procedure (`git show {parentSha}:{workflowMd}`, re-run against the rebuilt check) written beside it; the static lane's `bkit:audit:status` description and the `checks/status-holes.test.ts` key-test-files row updated |
| `docs/architecture.md` | `.bkit/core/engine/ledgers/journal.ts` placed in the engine tree (a leaf composing the engine's own `engine-call` and `friction` rows) |
| `docs/capabilities.md` | regenerated with `pnpm graph:rollup` after the new modules land (CI-gated: graphify rollup drift) |
| `docs/decisions.jsonl` | `699-completeness-check-module-and-seam-files`; `384-tier3-promotion` restated for the generalised five-workflow check and the no-watermark departure |
| `docs/deferrals.jsonl` | `442-status-hole-detector-beyond-ship` closed (same key, `CLOSED`); `699-completeness-check-excludes-bkit-auto-router`; `699-completeness-verdict-no-success-axis`; `699-friction-key-truncation-class-fix` |
| `docs/knowledge.jsonl` | the build-phase knowledge sweep's entries: the write root is the run's own book root, never `repoRoot(cwd)`; `validate` refuses an empty `by.step`, so the `<noun>-<verb>` sentinel is mandatory; the two `MARK_ROWS` copies are a parity gate, and a missed reader is silent corruption (1208.1 → 0.7 total step minutes) |

## Rollback Strategy

_Code-only — `git revert` sufficient._

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database, no migration, no seed. | nothing to undo |
| **Code** | `git revert {commit}` for the dispatch-seam commit, or set `BKIT_ENGINE_JOURNAL=off` for an immediate, no-deploy kill switch in any consumer repo | the kill switch is the fast path: it disables the journal and the friction writer while leaving the readers (Group 1) and the check in place, and every part degrades independently |
| **Data** | the two new row types are additive; every reader skips unknown `status.jsonl` types, so rows already written are inert after a revert | no cleanup needed; a `completeness` row left in a closed run stays readable by `bkit completeness check` |
| **Risk window** | consumers receive the new behaviour on `bkit upgrade` (a pinned package), so the window is a release, not a deploy; a broken seam is CLI-wide | bounded by the fail-safe contract (nested try/finally, total swallow, one stderr line per swallow) and by TASK 4's exit-code-passthrough and forced-throw tests, which run before the seam's default flips on |

## Agent Execution Runbook

Chronological task checklist. Groups run in build order; a group's tasks may depend only on its own or an earlier group's tasks. Every task names its own tests; no task leaves a test to a later task.

**Pre-code note (Group 1 first).** Group 1 changes readers only. No writer may emit `engine-call` or `completeness` before Group 1 is green: a missed reader is silent telemetry corruption, and the design measured total step minutes 1208.1 → 0.7 with `MARK_ROWS` unchanged.

**Pre-code note (mirrors).** `.bkit/{workflows,jsonl,authoring}.md` are force-overwritten mirrors of the package-side `.bkit/core/.bkit/*.md`. TASK 2, TASK 3 and TASK 7 edit the **source** and regenerate the `.bkit/` mirror with `bkit install` in the same task; TASK 15 re-runs `bkit install` and `pnpm bkit check` as the closing sweep. Editing only a mirror loses the edit on the next install and fails the drift gate.

**Pre-code note (characterisation pins).** Two planned cases pin behaviour that already holds rather than driving new code: TASK 2's `ignores a row type it does not know` (`fold` already skips unknown types — design spike C7) and TASK 9's no-baseline case (no watermark has ever existed). Both stay in `TEST FIRST` as regression pins, and their value is that a future reader change turns them red.

<!-- bkit:group 1 start -->

### GROUP 1: Row-type reader coverage (WS-4)

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Make both `MARK_ROWS` copies skip the two new row types, pinned by the harvest parity test
  - **UPDATE:** `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts`: add `engine-call` and `completeness`
  - **UPDATE:** `MARK_ROWS` in `scripts/harvest/bkit-harvest.mjs`: the same two types, in the same commit, so the parity assertion holds
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.test.ts`: a case proving two journal rows between `step-done` rows leave the run's total step minutes byte-identical
  - **READ:** `stepsBlock` in `.bkit/core/engine/commands/workflow/run-facts.ts`: the `MARK_ROWS` filter whose output must not move
  - **READ:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: `CANONICAL_SHIP_STEP_KEYS`, which no reader change may break
  - **DONE WHEN:** `pnpm test` is green; `pnpm test:harvest` runs `scripts/harvest/bkit-harvest.test.mjs` green with its case `MARK_ROWS is the engine's` passing with both new types present; and the step-timing case reports identical total step minutes with and without the journal rows.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `leaves a run's step minutes unchanged when journal rows land between step rows` fails on a journal row's timestamp being charged into the preceding step's minutes
    - `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` fails while the harvest copy lists only `session`, `owner-pause` and `owner-answer`
  - **TEST EXCEPTION:**
    - `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` fails while the harvest copy lists only `session`, `owner-pause` and `owner-answer` — the harvest test is a plain-node `.mjs` file that the red tool (vitest) cannot run; the execute agent saw it fail by hand with `node scripts/harvest/bkit-harvest.test.mjs` before the fix, and it runs green under `pnpm test:harvest` (owner, 2026-10-29)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Audit the remaining readers and document both row types
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.test.ts`: one case asserting an unknown `status.jsonl` row type is inert in `readStatusRows`, `fold` and `runStatusRows` — no run split, no throw
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `status.jsonl` — Row type table gains `engine-call` (noun, verb, flag names) and `completeness` (verdict, `preJournal`, `journalSuspect`, `observed`, hole lists, `sourceSha`); this is the canonical source of the `.bkit/workflows.md` mirror
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: the `run` row's `scan` block records the accepted `afterEnd` / `scan.rows` shift when journal rows land after a run's terminator; this is the canonical source of the `.bkit/jsonl.md` mirror
  - **UPDATE:** `.bkit/workflows.md`: regenerated from `.bkit/core/.bkit/workflows.md` with `bkit install` and committed, so it stays byte-equal but for the managed marker
  - **UPDATE:** `.bkit/jsonl.md`: regenerated from `.bkit/core/.bkit/jsonl.md` with `bkit install` and committed
  - **READ:** `fold` in `.bkit/core/engine/ledgers/status.ts`: it already skips unknown types — the assertion pins that rather than leaving it assumed
  - **READ:** `splitRuns` in `scripts/harvest/bkit-harvest.mjs`: `run.last` on every non-start row, with `runRows` and `lastActivity` beside it — both move when rows land after a terminator
  - **READ:** `.bkit/core/engine/install/manifest.ts`: the `writeTier1` `byte-equal-text` entries that make `.bkit/{workflows,jsonl}.md` force-overwritten mirrors of the `.bkit/core/.bkit/` sources
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the row-type table lists both rows; the inert-row case passes for every reader named in the task; the `afterEnd` shift is written down in `.bkit/core/.bkit/jsonl.md`; `bkit install` leaves `.bkit/{workflows,jsonl}.md` byte-equal to their sources but for the managed marker; and `pnpm bkit check` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `ignores a row type it does not know` fails while a journal row throws in `fold` or splits a run in `runStatusRows`
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `ignores a row type it does not know` fails while a journal row throws in `fold` or splits a run in `runStatusRows` — the readers already skip unknown row types, so the test only pins that behaviour and cannot fail first (owner, 2026-10-29)

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: Journal seam — `engine-call` + friction at dispatch (WS-3)

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Build the seam's row primitives as a leaf module behind a kill switch
  - **CREATE:** `.bkit/core/engine/ledgers/journal.ts`: `engineCallRow`, `frictionRow`, `shouldRecordFriction(code, excludedCodes)`, `frictionKey`, `appendJournalRow`, `appendFrictionRow`, `journalEnabled` — imports only `node:fs`, `node:path`, `./status.js`, `./telemetry.js`. `excludedCodes` is passed in by `commands/lib.ts` (which owns `SHARED_EXIT_CODES` and `spec.exitCodes`); the leaf never reads a `commands/**` module.
  - **CREATE:** `.bkit/core/engine/ledgers/journal.test.ts`: the exclusion set, the step sentinel and dedup key, `recurrenceCount`, flag-names-only `engine-call` rows, the swallowed-write result shape, the `parentSha`-unresolvable row, and the kill switch
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: the engine writes `friction` as the active workflow; the friction row's `scope: "bkit-repo"`; the `tool-failure` category's use; the ~68-char key-truncation bound `frictionKey` must stay under; this is the canonical source of the `.bkit/jsonl.md` mirror
  - **UPDATE:** `.bkit/jsonl.md`: regenerated from `.bkit/core/.bkit/jsonl.md` with `bkit install` and committed
  - **UPDATE:** `docs/architecture.md`: place `.bkit/core/engine/ledgers/journal.ts` in the engine tree
  - **READ:** `validate` in `.bkit/core/engine/ledgers/telemetry.ts`: the append-time envelope the composed row must satisfy, with `writerProblem`, `mintTs`, `APPEND_LEDGERS` and `identity` beside it
  - **READ:** `.bkit/core/engine/checks/after/ci-yml.ts`: the existing `process.env.BKIT_DEBUG` read shape `journalEnabled(env)` copies, so the kill switch adds no second env-gate idiom
  - **DONE WHEN:** `journal.test.ts` passes; a friction row built by the module passes `validate` and `writerProblem` unchanged; `journalEnabled` keeps the seam off for `off` and on otherwise; and no import in `journal.ts` reaches the `commands/` layer. `frictionKey`'s comment states the ~68-char truncation bound it must stay under; `bkit install` leaves `.bkit/jsonl.md` byte-equal to its source but for the managed marker; and `pnpm bkit check` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.test.ts` `writes no friction row for a declared routing exit` fails on a row appearing for a shared code or the verb's own code
    - `.bkit/core/engine/ledgers/journal.test.ts` `never leaves by.step empty` fails while the sentinel is absent and `validate` refuses the row
    - `.bkit/core/engine/ledgers/journal.test.ts` `raises recurrenceCount on a same-key row` fails while each recurrence appends a second row or writes no counter
    - `.bkit/core/engine/ledgers/journal.test.ts` `journals flag names only` fails on a flag value such as a token or a path reaching the row
    - `.bkit/core/engine/ledgers/journal.test.ts` `writes no row when BKIT_ENGINE_JOURNAL is off` fails while an `off` value still writes an `engine-call` or a friction row
    - `.bkit/core/engine/ledgers/journal.test.ts` `writes a friction row with no run object when parentSha is unresolvable` fails while an unresolvable `parentSha` drops the row or writes an empty `run` object

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Wire the seam into `runCommand` with resolve-or-skip attribution and the fail-safe guarantee
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: `runCommand` journals an `engine-call` row at dispatch entry and the friction row on an unexpected non-zero exit or a non-`CommandError` throw, inside nested try/finally; compute the exclusion set here (`SHARED_EXIT_CODES` ∪ `spec.exitCodes`) and pass it to `shouldRecordFriction` as `excludedCodes`; add the optional `journal` member to `runCommand`'s `options` for injection
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: add the exported `resolveActiveRun` resolver (the command's own `--file`, else `--fid` + `--month` through `statusLocation`, else the single `IN_PROGRESS` run under the cwd's git toplevel, scoped and capped, else nothing). It reads each discovered file with `lib.ts`'s own `node:fs` + `parseJson` and folds with `fold` / `StatusEvent` from `../ledgers/status.js` — never a `commands/**` import, which would cycle `lib.ts`
  - **CREATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: a real temp repo whose `.worktrees/{fid}` holds a `status.jsonl`, driving the real `runCommand`
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: the exit-code-passthrough case and the one-stderr-line case
  - **READ:** `statusLocation` in `.bkit/core/engine/commands/lib.ts`: the book-root rule the write root must follow, with `statusRelPath` and `repoRoot` beside it
  - **READ:** `SHARED_EXIT_CODES` in `.bkit/core/engine/commands/lib.ts`: the shared routing codes the exclusion set unions with the verb's own `spec.exitCodes`, with `EXIT` beside it
  - **READ:** `fold` in `.bkit/core/engine/ledgers/status.ts`: the cycle-safe reducer each discovered `status.jsonl` is folded with, with `StatusEvent` beside it — this module imports only `node:crypto`, `node:fs`, `node:path`, `../shared/json.js`, so `lib.ts` may import it
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a forced journal throw leaves the verb's own exit code and output untouched and logs exactly one line; the Integration cases assert the friction row's bytes on disk in the **worktree's** `.bkit/friction.jsonl`, nothing in the main checkout's, and no row when no run is active in the cwd; and the exit-code-passthrough case passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `writes friction to the run's own book root` fails on the row landing in the main checkout's `.bkit/friction.jsonl` or not at all
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `skips a call made outside the run's worktree` fails on a row attributed to a run the invoking cwd cannot see
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `writes nothing when no run is active in the cwd` fails on an `engine-call` row, a friction row or a log line appearing with no active run
    - `.bkit/core/engine/commands/lib.test.ts` `passes the command's exit code through when the journal write throws` fails on a swallowed throw turning a verb's code into 0 or 1

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Prove a seam-written friction row survives commit and harvest, end to end
  - **UPDATE:** `scripts/harvest/ledgers.integration.test.ts`: a case whose row the **seam itself wrote** — spawn the real CLI as a child process (`tsx .bkit/core/engine/cli.ts`) in a real temp repo whose `.worktrees/{fid}` holds an active run and a `status.jsonl`, force an undeclared non-zero exit, assert the `friction` row's bytes in that run's own `.bkit/friction.jsonl` (never a seeded row), then run the real `ledgers commit` writer and `runHarvest`, and assert the row in the harvested ledger
  - **READ:** `harvestConsumer` in `scripts/harvest/ledgers.ts`: the copy/move contract the new writer must not break, with `runHarvest` beside it
  - **READ:** `.bkit/core/engine/commands/install/install.integration.test.ts`: the spawn-a-real-CLI-process-per-scenario pattern this case copies
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the harvested ledger holds the `tool-failure` row whose `key` matches the seam-written row in the run's own `.bkit/friction.jsonl`; the row is the seam's own output, never a hand-built seed; and the harvest's existing pruning cases still pass.
  - **TEST FIRST:**
    - `scripts/harvest/ledgers.integration.test.ts` `keeps a seam-written tool-failure row through commit and harvest` fails while the row the seam wrote is dropped or pruned before the harvested ledger
  - **TEST EXCEPTION:**
    - `scripts/harvest/ledgers.integration.test.ts` `keeps a seam-written tool-failure row through commit and harvest` fails while the row the seam wrote is dropped or pruned before the harvested ledger — the test checks a feature task 4 had already built, so it could not fail first; it passes against the real CLI, commit and harvest (owner, 2026-10-29)

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: Contract deriver — workflow markdown → expected set (WS-1)

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Generalise the deriver to all five workflows and promote the pure text helpers
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
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `derives the expected step universe for every workflow` fails on the ship-only prefix leaving the other four universes empty — the original no-orphan check was wrong for build, whose Decision Pause row `build-decision` sits outside the steps by design, so the check was narrowed to ship after the red (owner, 2026-10-29)

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Derive step conditionality from the column-0 marker rule and make it an authoring rule
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
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `classifies a step conditional only under the column-0 marker rule` fails on a `**Skip if**` step being reported as a step hole, and on a non-conditional step being excluded — task 6's deriver had already built the conditionality rule, so the test could not fail first (owner, 2026-10-29)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `writes a build-plan-convert row on the no-conversion route` fails while build Step 4's pass route reaches Step 5 with no `steps finish --step=build-plan-convert` call, or the step table drifts from the headings and `--step=` calls — the build Step 4 text was edited before this test was written (owner, 2026-10-29)

<!-- bkit:task 7 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: Completeness checker — rows + contract → verdict (WS-2)

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Classify holes: evidence, step, unexercised, unexpected
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
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `charges calls below a step's finish line to that step` fails while a replay of every step section of the five workflow files in markdown order shows an evidence hole or an `unexpected` call (build Step 15's `prs probe` / `branches push` charged to Step 16) — the shared `replay` helper was rewritten after the red to write one row per key of each unit, because a section that writes no row of its own folds into the next section that does; the test's own lines only changed in wrapping (owner, 2026-10-29)
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports an untaken route arm as unexercised` fails while build Step 12's FAIL-arm `counters route` makes a PASS run holey, or Step 5's two `steps finish` lines count as two required calls — the assertion was narrowed after the red to the one `counters route` call leaving the list, because build still lists `branches push` in `build-create-pr` as unexercised with every arm taken; that case stays unpinned by this test (owner, 2026-10-29)

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Verdict metadata, unattributable calls, self-exclusion and the read path
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
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `gives a pre-journal run a steps-only verdict` fails on every required call being reported missing — task 8's single `check()` already held the pre-journal handling, so the test could not fail first (owner, 2026-10-29)
    - `.bkit/core/engine/checks/status-holes.test.ts` `names a call no contract step owns` fails on a post-terminator call, or a call between two rows outside the contract, being charged to the last step — task 8's `check()` already reported unattributable calls, so the test could not fail first (owner, 2026-10-29)
    - `.bkit/core/engine/checks/status-holes.test.ts` `excludes its own journaled call` fails while the check reports itself as unexpected — task 8's `check()` already left out the checker's own journaled call, so the test could not fail first (owner, 2026-10-29)
    - `.bkit/core/engine/checks/status-holes.test.ts` `reports a hole in a long-closed run with no baseline` fails while a watermark or a baseline delta filters out an old hole — task 8's `check()` already handled a run with no baseline, so the test could not fail first (owner, 2026-10-29)

<!-- bkit:task 9 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### GROUP 5: `completeness` command surface (WS-5)

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Ship `bkit completeness check` and register it
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
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/commands/conventions.test.ts` `follow the conventions, and list every exit code their source can return` fails while `completenessCommand` is unreachable from `COMMANDS` or its help omits an exit code its source can return — the test checks every command at once and the new command only counts once registered; the stub was not registered, so no honest failing run was possible (owner, 2026-10-29)

<!-- bkit:task 10 end -->

<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### GROUP 6: Close and start integration (WS-6)

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Append the `completeness` row at close, fail-open
  - **UPDATE:** `closeWorkflow` in `.bkit/core/engine/commands/workflow/workflows.ts`: call the checker in-process and append one `completeness` row per close, before the `workflow-done` row, inside the `appendStats` fail-open idiom; pass `journalSuspect` from this path only
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the close-ordering case and the forced-throw case
  - **READ:** `appendStats` in `.bkit/core/engine/commands/workflow/workflows.ts`: the try/catch-plus-one-stderr-line idiom the call site copies
  - **READ:** `appendLine` in `.bkit/core/engine/ledgers/status.ts`: how the row is serialised and stamped, with `statusTimestamp` beside it
  - **DEPENDS ON:** 4, 9
  - **DONE WHEN:** the `completeness` row sits before `workflow-done` in the run's `status.jsonl`; a run closed twice carries two rows; and a forced checker throw still writes `workflow-done` and returns the close's normal exit code with one logged line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `appends the completeness row before the workflow-done row` fails when the verdict row is missing or lands after the terminator
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `writes one completeness row per close` fails when a second close overwrites the first row or writes none
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `still closes when the completeness check throws` fails on the close returning a non-zero code or writing no `workflow-done` row

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [x] **TASK 12:** Warn at start and resume when the previous run was holey
  - **UPDATE:** `start` in `.bkit/core/engine/commands/workflow/workflows.ts`: resolve the run immediately preceding the one being started or resumed in the same `status.jsonl` (whatever its workflow), read its last stored `completeness` row or compute the verdict on the fly, and print one `[bkit-workflows]` warning through `ctx.log` naming the workflow, run number, close time and the reading command; never interrupt, never prompt; degrade silently on any error
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the holey-previous-run case and the clean-previous-run case
  - **DEPENDS ON:** 10, 11
  - **DONE WHEN:** a holey previous run prints exactly one warning line on stderr and the run's stdout stays the single output object; a clean or absent previous run prints nothing; and a checker failure at start produces no warning and no error.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `warns when the previous run for this fid was holey` fails while the warning is missing, interrupts the run, or lands on stdout
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints nothing when the previous run is clean, absent, or unreadable` fails while a clean or absent previous run warns, or a checker failure at start raises or prints an error
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `warns when the previous run for this fid was holey` fails while the warning is missing, interrupts the run, or lands on stdout — the fake previous run gained a close-workflow step row after the red, because the checker only counts a run as closed when that row exists and the test could never pass without it; its expectations did not change (owner, 2026-10-29)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints nothing when the previous run is clean, absent, or unreadable` fails while a clean or absent previous run warns, or a checker failure at start raises or prints an error — the clean case was rewritten onto the new shared fixture and the stored completeness row's time moved from 00:30 to 01:00 so no later row forces a recompute; no expectation was weakened or removed (owner, 2026-10-29)

<!-- bkit:task 12 end -->

<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### GROUP 7: CI advisory wiring + observability and testing docs (WS-7)

<!-- bkit:task 13 start -->

- [x] **TASK 13:** Repoint the CI advisory step and add the sweep liveness assertion
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: keep `pnpm bkit:audit:status || true` on the `Check Status Holes` step (the sweep stays advisory and exits 0 on holes), capture its combined output to `"$RUNNER_TEMP/status-holes.txt"`, then `grep -qF '[bkit-status-holes] sweep:' "$RUNNER_TEMP/status-holes.txt" || { echo '[bkit] status-holes sweep printed no summary line'; exit 1; }` — the grep is on the summary line only, so a hole never reds the lane and a silent no-op does; the owner's sign-off on this plan (Open Questions, answer A) covers this edit to a CI workflow file
  - **CREATE:** `tests/status-holes-sweep-liveness.bats`: a case running the sweep over a fixtures corpus and asserting its output carries the exact literal TASK 6 pins, plus a case asserting the lane's `grep -qF` pattern rejects output without it
  - **READ:** `bkit:audit:status` in `package.json`: the corpus-sweep invocation whose path is unchanged because the check module keeps its name
  - **READ:** `tests/gh-stub-smoke.bats`: the bats file shape (a `tests/fixtures/` corpus plus an env shim) this case copies, and `pnpm bkit:test:bats` (`pnpm exec bats tests/*.bats`), the unit-lane step that runs it
  - **READ:** `docs/testing.md`: § the static lane — the paragraph describing this step as the lane's only non-blocking step
  - **DEPENDS ON:** 6, 9, 2
  - **DONE WHEN:** the advisory step still exits 0 on a holey corpus; its output contains the summary line in the exact literal `[bkit-status-holes] sweep: {N} file(s), {M} holey`; the lane fails when that line is absent; and `pnpm bkit:test:bats` runs `tests/status-holes-sweep-liveness.bats` green.
  - **TEST FIRST:**
    - `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` fails when the sweep's summary text drifts from the literal the lane's `grep -qF` pattern names, or the lane's pattern matches output that lacks the line
  - **TEST EXCEPTION:**
    - `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` fails when the sweep's summary text drifts from the literal the lane's `grep -qF` pattern names, or the lane's pattern matches output that lacks the line — the test was written after the CI step and its fixture and passed on its first run, and `bkit tests red` cannot record a red for a `.bats` file because the lint step finds nothing to check there; it now passes under bats (34 of 34) and its second case shows the lane's grep fails when the summary line is missing (owner, 2026-10-29)

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [x] **TASK 14:** Document the new log lines, the kill switch and the generalised tier contract
  - **UPDATE:** `docs/observability.md`: a new `### [bkit-status-holes]` prefix section (the advisory report line, the sweep-summary line, the `journalSuspect` heartbeat line and their grep patterns), the seam's `[bkit-telemetry] {kind} row not written: {reason}` swallow line, and the `BKIT_ENGINE_JOURNAL` kill switch
  - **UPDATE:** `docs/testing.md`: § Tier-3 fail-open advisory channel generalised from ship to all five workflows; the per-workflow fixture corpus recorded; the `sourceSha` replay procedure written down (`git show {parentSha}:{workflowMd}`, re-run against the rebuilt check) so a reader has the command, not just the field; the static lane's `bkit:audit:status` sentence (including its new liveness grep) and the `checks/status-holes.test.ts` key-test-files row updated
  - **READ:** § Log Format in `docs/observability.md`: the prefix rule and the line format the new lines follow
  - **DEPENDS ON:** 3, 4, 6, 9, 10, 11
  - **DONE WHEN:** every stderr line the seam and the check emit is listed in `docs/observability.md` with its grep pattern under an already-registered prefix; and `docs/testing.md` names no ship-only file for the generalised check.
  - **TEST FIRST:** n/a — documentation only; the emitted lines themselves are asserted at the unit and integration tiers by TASK 3, TASK 4, TASK 6 and TASK 9.

<!-- bkit:task 14 end -->

<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### GROUP 8: Generated artifacts (WS-8)

<!-- bkit:task 15 start -->

- [x] **TASK 15:** Regenerate the capability register, the doc mirrors and the committed payload
  - **UPDATE:** `docs/capabilities.md`: regenerate with `pnpm graph:rollup` after the new modules land
  - **UPDATE:** `dist/cli.js`: the whole committed `dist/` payload rebuilt with `pnpm build` and committed in the same change, since `bkit:check:dist` rebuilds and diffs it
  - **UPDATE:** `.bkit/workflows.md`: re-run `bkit install` as the closing sweep, so any mirror edit a task missed is regenerated from its source and committed here
  - **UPDATE:** `.bkit/jsonl.md`: re-run `bkit install` as the closing sweep, so any mirror edit a task missed is regenerated from its source and committed here
  - **UPDATE:** `.bkit/authoring.md`: re-run `bkit install` as the closing sweep, so any mirror edit a task missed is regenerated from its source and committed here
  - **READ:** `build` in `package.json`: the rebuild command whose output lands in `dist/`, with `graph:rollup` and `bkit:check:dist` beside it
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **DONE WHEN:** `pnpm graph:rollup` leaves `docs/capabilities.md` unchanged on a second run; `pnpm bkit:check:dist` exits 0 against the committed `dist/`; `pnpm bkit check` exits 0 with every `.bkit/` mirror byte-equal to its source but for the managed marker.
  - **TEST FIRST:** n/a — generated artifacts; `pnpm bkit:check:dist` (`rm -rf dist && tsc && git diff --exit-code dist/`), the graphify rollup drift gate and `pnpm bkit check` are the assertions, and all three run in CI.

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [x] **TASK 16:** Refresh the capability register and the command list after the rebase
  - **UPDATE:** `docs/capabilities.md`: rebuild with `pnpm graph:refresh` so the register matches a clean rebuild of the rebased tree, and commit it
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate the generated region with `pnpm cli:sync` so it lists the `completeness` verb, then run `bkit upgrade` so the `.bkit/cli.md` mirror follows, and commit both
  - **READ:** `scripts/graphify/bkit-graphify.sh`: the `check-at` drift gate the register must pass
  - **READ:** `.bkit/core/engine/tools/cli-doc.test.ts`: the test that pins the generated region
  - **DEPENDS ON:** 15
  - **DONE WHEN:** `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exits 0 after the commit; `.bkit/core/engine/tools/cli-doc.test.ts` passes; and `pnpm bkit check` exits 0.
  - **TEST FIRST:** n/a — generated artifacts; the graphify drift gate, `cli-doc.test.ts` and `pnpm bkit check` are the assertions

<!-- bkit:task 16 end -->

<!-- bkit:group 8 end -->

<!-- bkit:group 9 start -->

### GROUP 9: Holistic verify fixes (WS-9)

<!-- bkit:task 17 start -->

- [x] **TASK 17:** Give the journal test fixtures the required `use` field
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: add `use: "by-hand"` to each fixture verb that lacks it (the five at lines 208-226)
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: add `use: "by-hand"` to each fixture verb that lacks it (lines 25 and 31)
  - **READ:** `VerbSpec` in `.bkit/core/engine/commands/lib.ts`: the interface that made `use` required
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm bkit:typecheck:tests` exits 0 and `pnpm bkit:gate:static-unit` no longer fails at the test typecheck.
  - **TEST FIRST:** n/a — type-only fixture edit; `pnpm bkit:typecheck:tests` is the assertion

<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** Stop requiring bkit commands that run outside the journal's window
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: a command that sits above the first `workflows start` call, or below the `workflows close` call, in its workflow's markdown is matched when the journal holds it but is never listed as required for a step, the way workflow-level calls already are
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: the simulated run journals only the calls the journal can see (no pre-start calls, no post-close calls) and must come out not holey for build, design, plan and ship
  - **READ:** `.bkit/core/workflows/bkit-build.md`: Steps 1-2 and the Step 16 tail, the pre-start and post-close calls the journal cannot record
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** a run that journals every call the journal can actually record reads CLEAN for all five workflows; a step whose in-window call is genuinely missing still reads HOLEY; and `pnpm bkit:audit:status` still exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `calls outside the journal window are matched but never required` fails while a pre-start or post-close call is listed as a step's required call

<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->

- [ ] **TASK 19:** Warn when the journal looks dead at close, and record the three knowledge entries
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: when `closeWorkflow` sets `journalSuspect`, print exactly one `[bkit-telemetry]` line on stderr through `ctx.log`, never changing stdout or the exit code
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the dead-journal close case
  - **UPDATE:** `docs/knowledge.jsonl`: three entries appended with `bkit ledgers append` — the run's own book root is the journal's write root; the `<noun>-<verb>` step fallback is mandatory; the `MARK_ROWS` copies must stay in parity
  - **UPDATE:** `docs/observability.md`: the new stderr line under the `[bkit-telemetry]` section
  - **DEPENDS ON:** 11, 14
  - **DONE WHEN:** a close with a suspect journal prints exactly one `[bkit-telemetry]` line on stderr and the stdout object is unchanged; `docs/knowledge.jsonl` holds the three entries; and `docs/observability.md` names the line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints one telemetry line on stderr when the journal looks dead at close` fails while no line is printed or the stdout object changes

<!-- bkit:task 19 end -->

<!-- bkit:group 9 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared gate: typecheck · lint · format · prose · slop · unit · bats · integration), `pnpm test:harvest` (the `MARK_ROWS` parity assertion lives in a pure-Node `.mjs` file vitest does not include, so the gate must run it explicitly) and `pnpm bkit check` (drift gate) pass.
- [ ] **Test Synchronization:** three existing suites must move with the change, not after it — `audits/workflows/workflow-shape.test.ts` (imports the promoted parsers), `scripts/harvest/bkit-harvest.test.mjs` (`MARK_ROWS is the engine's` parity) and `tests/status-holes-sweep-liveness.bats` (the new shell tier). `commands/conventions.test.ts` must pass with the new noun registered, and `pnpm bkit check` must see every `.bkit/` mirror byte-equal to its `.bkit/core/.bkit/` source.
- [ ] **Build Configuration:** no new test-only file enters the production build; the two new `ledgers/*.test.ts` files are covered by the existing `vitest` include/exclude, the new `tests/status-holes-sweep-liveness.bats` is picked up by the `tests/*.bats` glob, and `tsc` continues to emit `dist/` for source modules only.
- [ ] **Unit (`pnpm vitest run`):** the full suite, never scoped — the seam sits on the dispatch path of every registered command, so a scoped run would miss a regression in `commands/lib.test.ts`, `commands/workflow/workflows.test.ts` or `commands/conventions.test.ts`.
- [ ] **Integration (`pnpm test:integration`):** the two new boundary files (four rows) — `.bkit/core/engine/ledgers/journal.integration.test.ts` (real worktree, real filesystem, real `runCommand`, no mocks) and `scripts/harvest/ledgers.integration.test.ts` (seam-written row → `ledgers commit` → harvest) — plus `commands/workflow/shared-checkout.integration.test.ts` unchanged.
- [ ] **Apply local migrations:** N/A — no database, no migration.
- [ ] **Generated artifacts:** `pnpm graph:rollup` (second run is a no-op) and `pnpm bkit:check:dist` both exit 0.
- [ ] **Dogfood (repo rule `Verify before complete`):** `pnpm build`, then on **bkit's own repo** (not a scratch consumer — decision `699-friction-end-to-end-on-bkit-itself`) run `node dist/cli.js completeness check --file=…`, and force an undeclared non-zero exit of a built `node dist/cli.js <noun> <verb>` while a run is active, then `bkit ledgers commit` and `pnpm harvest`; assert the `tool-failure` row in that run's own `.bkit/friction.jsonl` and in the harvested ledger. Separately, on a fresh scratch consumer, confirm the no-run path journals nothing.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** On this repo, force a run's hole: close a run with `bkit workflows close`, then delete one `step-done` row from its `status.jsonl`, and run `bkit completeness check --workflow=… --file=…` — expect exit 0 and the deleted step named as a step hole.
- [ ] **Step 2:** Start the next workflow for the same FID (`bkit workflows start --workflow=build --fid=…`) — expect exactly one stderr line naming the previous run, run number, close time and the reading command, with stdout still a single output object and the run uninterrupted.
- [ ] **Step 3:** On bkit's own repo (decision `699-friction-end-to-end-on-bkit-itself`), force a built `node dist/cli.js <noun> <verb>` to exit with an undeclared code while a run is active — expect one `tool-failure` row in the **run's own** `.bkit/friction.jsonl` (not the main checkout's) and the original exit code still returned to the caller; then `bkit ledgers commit` and `pnpm harvest` and expect the same `key` in the harvested ledger.
- [ ] **Step 4:** Set `BKIT_ENGINE_JOURNAL=off` and repeat Step 3 — expect no `engine-call` row and no friction row, and every command's behaviour otherwise unchanged.
- [ ] **Step 5:** Run `pnpm bkit:audit:status` over the corpus and read the output — expect one report per `status.jsonl`, one sweep-summary line, exit 0 even where holes exist.
