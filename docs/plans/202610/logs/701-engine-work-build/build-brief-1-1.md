# Brief: group 1 — `tests green` emits the test-first verdict, a `fixable` per gap and the gap log lines

Plan: Engine Facts in Build Verify and Ship Implementation Plan

## Why and what

### Context & Goals

**Problem.** `#676` (closed) audited the six workflow files for orchestrator prose the engine already holds. It did not audit the **subagent prompts**, which carry the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine holds the data. Two agents carry most of it, measured from the prompts (not estimated): `bkit-build-plan-verify` (100 turns, once per group plus once holistic — an 11-row kind→`Fixable` table plus a three-line verdict mapping at `bkit-build-plan-verify.md:67-82`, a task ↔ `DONE` log cross-reference, a task tick, and matrix ↔ runbook coverage), `bkit-ship-deferred-sweep` (200 turns, once per ship — a disabled-test diff scan at `bkit-ship-deferred-sweep.md:69` that decides the ship gate, plus deferral reason tests and a bucket verdict); `bkit-build-plan-current` (50 turns) spends its steps 5-7 on search the engine can do.

**Goal.** `#701`, by the rule `#663` settled: a fact with one right answer is the engine's; judgement is the agent's. The engine computes the test-first verdict and a `fixable` per gap, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests, and writes the deferral rows; the verifier and the deferred sweep keep only what needs judgement (whether the codebase satisfies a task, the four diff reads, the `Executable` / `Reword` / `Broken` call, deliverable verification, doc edits).

**Inputs and precedence.** No design doc and no audit report. `#701` is a `change`-shape issue (`.bkit/trackers.md` § Issue shapes), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Tasks`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word. The plan-input's newest section is the session prompt (`#701` alone), which adds nothing. Two places where the issue's own text disagrees are resolved in this plan and named in `Open Questions & Assumptions` (rows 5 and 6): the order of `fixable` values in `Tasks` Task 1's `DONE WHEN`, and the `tick` default between `Open Questions` item 3 and `Tasks` Task 2.

**Review round merged.** Three lenses reviewed this plan as `plan-v1-draft.md`: plan review (tightness, dependency order, design coverage), code review (regression risk) and the scope check (scope, criteria, verification). Their findings are merged here. Six seams they named are settled and named in `Open Questions & Assumptions` (rows 7-11) or in the sections they touch: the `fixable: null` / `verdict: null` seam at the verifier boundary (the engine's `logLine` is a template the verifier substitutes its decided `Fixable` into, and the artifact header `Verdict:` is the post-judgement roll-up, never the report's `null`); the `no-red` "work already landed" exemption kept in the prompt as a verifier override; the holistic verify's group-required tick path; the `matrix` check's semantics, the three in-build producers it would otherwise strand, and the recovery route for a legacy plan; `tasks currency`'s diff range (`{base}...{against}`, `against` = `origin/dev` — three dots is merge-base(`{base}`, `{against}`)..`{against}`, identical to two dots when `{base}` is an ancestor of `{against}`, the normal case now that design and plan worktrees base on `origin/dev`, and it matches `branches scan-diff`, which already diffs `<base>...HEAD`); and the `Changed since red = added lines only` gap (kind `test-changed`, `fixable: null`).

**Related Issues:**

- `#701` — Engine work in build verify and ship: emit the facts, keep the judgement (open — this issue)
- `#663` — Workflow prompt process token optimisation (closed — parent; settled the engine-fact / judgement rule)
- `#676` — Orchestrator work the engine could do as bkit commands (closed — the workflow-prose half of the same audit; this plan is the subagent-prompt half)
- `#685` — How plans are shaped, reviewed and built (closed — the plan-block format this plan reads and writes)
- `#665` — Fewer plan reviewers and rounds; challenge only on large diffs (closed — why the plan-review fan-out stays at two reviewers plus the scope check)
- `#668` — Build in task slices: symbol refs per task, 160k cap per agent (closed — the per-task `CREATE` / `READ` / `UPDATE` / `DELETE` fields `tasks currency` reads)
- `#679` — Engine commands for the build / ship orchestration prose (closed — created `branches scan-diff`, the verb Task 6 extends, and the raw-call fence guard; its "print only the fields the workflow reads next" rule applies to Task 6's new output)
- `#656` — Test-order gaps: `no-red` / `late-red` / `test-changed` and the caps (closed — created the gap kinds Task 1 maps and the 10-tests / 3-files caps every group here holds)
- `#680` — ledgers append: engine writes ledger rows with a minted ts (closed — the append machinery `ledgers triage` reuses)
- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (open — shipped-pending neighbour, no shared surface)

---

### Narrative

`#701` `### Narrative`, verbatim:

A bkit maintainer wants the build and ship subagents to stop re-deriving facts the engine already holds. After this, the verifier and the deferred sweep decide only what needs judgement, and the engine computes the verdicts, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests and writes the deferral rows.

### Success Criteria

`#701` `### Success Criteria`, verbatim:

- `bkit tests green` prints `verdict` and a `fixable` per gap; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping and no verdict mapping.
- No subagent edits the plan to tick a task; `bkit tasks tick` does it.
- `bkit tests plan-check` exits 1 on a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row.
- `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the disabled-test list lives.
- `bkit ledgers triage` prints each deferral's bucket and writes the `unjustified` / `TRIAGED` rows; `bkit-ship-deferred-sweep.md` names no reason test.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The deferred sweep's deliverable verification (Process 7) | `#701` declared it out of scope before work started; it is judgement (does the codebase satisfy a deliverable), no Success Criterion or matrix row needs it; `docs/deferrals.jsonl` key `701-sweep-deliverable-verification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 7 |
| `plan-current`'s `Executable` / `Reword` / `Broken` classification | `#701` declared it out of scope before work started; the engine cannot decide whether landed changes leave a task executable, and Task 4 keeps the call; `docs/deferrals.jsonl` key `701-plan-current-classification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-current.md` § Process 8 |
| The four diff-reading test-order classifications in `bkit-build-plan-verify.md` | `#701` declared them out of scope before work started; they are judgement, and Task 1 keeps them; `docs/deferrals.jsonl` key `701-verify-diff-reads-stay-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 |
| Design-workflow reviewers | `#701` declared them out of scope before work started: no design-run measurements exist, so which prose is mechanical is unmeasured — real future work | new audit of the design prompts; `docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit` |

## Where it fits

- Group 1: `tests green` emits the test-first verdict, a `fixable` per gap and the gap log lines — this group
  - TASK 1: `tests green` emits `verdict`, a `fixable` per gap and the gap log lines — open
- Group 2: The plan tick, the group handover and the `tasks` noun come from the engine — next
  - TASK 2: Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — open
  - TASK 3: `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line — open
- Group 3: `tasks currency` replaces plan-current's path and symbol search — later
  - TASK 4: `tasks currency` — plan-current's path and symbol match — open
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — later
  - TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — open
  - TASK 6: `branches scan-diff --disabled-tests` — open
- Group 5: The sweep's deferral rules move to the engine — later
  - TASK 7: `ledgers triage` — open
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — open
- Group 6: Producers, docs, indexes and mirrors — later
  - TASK 9: The plan format teaches the producers: the clause and its carriers — open
  - TASK 10: Sync the docs the change touches — open
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `tests green` emits `verdict`, a `fixable` per gap and the gap log lines
  - **UPDATE:** `green` in `.bkit/core/engine/commands/workflow/tests.ts`: emit `verdict` (`PASS` no gaps · `FAIL` any gap unfixable · `CONCERNS` otherwise · `null` when any gap needs a diff read) plus `fixable` and `logLine` on each gap, carried into `writeAuditReport` too; `fixable: null` for `delete-still-referenced`, `test-changed`, `red-mismatch` and the row state `Changed since red = added lines only`; emit the `test-changed` gap the added-lines-only row does not produce today
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: drop the kind→`Fixable` table and the verdict mapping from Process 8 and 10; keep the four diff reads, the `no-red` "work already landed" override, the `Enforced: false` and `Late-red check` bullets, and the `— Fixable: false` log contract; Process 4 substitutes the verifier's decided `Fixable` where the engine printed `null`; the header `Verdict:` is the post-judgement roll-up and the header gains the `Tasks:` line with the empty form `Tasks: none`
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: the parsed task / gap shapes the audit reads
  - **READ:** `.bkit/instructions.md`: § Clauses and the `bkit-build-plan-verify` per-file section, before editing prose (`pnpm instructions:show --file bkit-build-plan-verify.md`)
  - **DONE WHEN:** `bkit tests green` on a fixture with a `not-green`, a `no-red` and a `test-changed` gap prints `verdict: null` and `fixable` `true`, `false`, `null` in that order (the issue's own fixture, corrected per `Open Questions` row 5); a fixture whose red's test gained added lines only prints one `test-changed` gap with `fixable: null` and exits 1; the same report file carries `verdict` and each gap's `fixable` / `logLine`; `bkit-build-plan-verify.md` holds no kind→`Fixable` table row and no verdict-mapping line (its `— Fixable: false` log contract, its `Enforced: false` / `Late-red check` bullets, its `no-red` override and the four diff reads stay); `pnpm instructions:sync` leaves `instructions.test.ts` green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints a verdict and a fixable per gap` fails while the emitted payload carries no `verdict` and no gap `fixable`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green verdict is FAIL when a gap is unfixable` fails while a `no-red` gap alone still prints `CONCERNS`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a diff-reading kind fixable null` fails while a `test-changed` gap prints `fixable: false`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green with no gaps prints verdict PASS and an empty gaps` fails while a clean audit prints no `verdict`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints verdict null when a gap needs a diff read` fails while a plan whose only gap is `test-changed` prints a decided `verdict`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green emits a test-changed gap for a red whose test gained added lines only` fails while that row produces no gap and `green` exits 0

<!-- bkit:task 1 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Test-first verdict, per-gap `fixable` and the ready-to-append log line | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "kind\|gap(" .bkit/core/engine/commands/workflow/tests.ts`; read the `Gap` type, `writeAuditReport`, `green`'s `ctx.emit` block and `deleteGaps`; `grep -rn "Fixable" .bkit/core/prompts/bkit-build-plan-verify.md .bkit/instructions.md` | `green`'s existing `gaps` array (`{task, kind, detail}`) and its report writer | EXTEND | add `verdict` to the emitted payload and the report, and `fixable` / `logLine` per gap, from one mapping table in the file; every existing key and the report's sections stay |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** file exists.
- `green`: emit a top-level `verdict` (`PASS` no gaps · `FAIL` any gap `fixable: false` · `CONCERNS` every gap `fixable: true` · `null` any gap `fixable: null`) and, on each gap, `fixable` and `logLine`; carry both into `writeAuditReport`'s gap lines so the verifier's prompt reads them from the report. The mapping is one table in the file: `true` — `not-green`; `null` — `delete-still-referenced`, `test-changed`, `red-mismatch`, and the row state `changed: added lines only` (the four diff reads); `false` — `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused`. `logLine` is the line the verifier appends: ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: {fixable}``, rendered once, in the file.
- `green` also emits the diff-read gap for a row state that today produces none: a red whose snapshot and test differ by added lines only (the `added` branch beside `row.changed = "added lines only"` at the `onlyAddsLines` call) now pushes the same `test-changed` gap the non-added branch does, with `fixable: null`, so the verifier is handed the diff read the prompt already holds. `green` therefore exits 1 on that row where it exits 0 today, and the row joins `testOrderOnly` (kind `test-changed` is already in `TEST_ORDER_GAPS`); no new kind and no set widening.
- `plan-check`: extend the `problems` kind union (line 344) with `matrix` and `supersession`, and their checks in `checkPlanText`; update the verb's `summary`, its `output.problems` line and its `--help`. **`matrix` semantics, pinned:** a plan whose text carries no `Derived Test Matrix` section yields no `matrix` problem whatever its tasks name (the refusal is on a row, and issue-form / converted plans carry no table). A plan that carries the table is checked in both directions: the header carries no `Task` column → one problem at the header line naming the column to add; a row whose `Task` cell names no task number, or a number no task block defines → one problem at the row; a row naming two or more numbers → one problem naming the row and both tasks; a task that names at least one `TEST FIRST` test and is named by no row → one problem at its task line (a task whose `TEST FIRST` is `n/a` needs no row). The bidirectional half holds after an in-build append only because `challenge.ts`'s `appendTasks` and build Step 5's `Fix now` writer add a row for every task they write. `supersession`: every `DELETE` reference of a task names a file that appears in the plan's `Supersession Inventory` table, else one problem at the `DELETE` line.
- No exit code changes; the two kinds join the existing `problems`, so `plan-check` still exits 0 / 1. `doneTasks` stays the shared, exported reader of the execute logs' `DONE — TASK {N}` lines (`context.ts` imports it); `tasks open` reuses it rather than re-parsing.

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202610/701-engine-work-build-plan.md § Reuse Inventory and § Architecture & Component Changes.
