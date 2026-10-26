# Engine Facts in Build Verify and Ship Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

**Problem.** `#676` (closed) audited the six workflow files for orchestrator prose the engine already holds. It did not audit the **subagent prompts**, which carry the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine holds the data. Two agents carry most of it, measured from the prompts (not estimated): `bkit-build-plan-verify` (100 turns, once per group plus once holistic — an 11-row kind→`Fixable` table plus a three-line verdict mapping at `bkit-build-plan-verify.md:67-82`, a task ↔ `DONE` log cross-reference, a task tick, and matrix ↔ runbook coverage), `bkit-ship-deferred-sweep` (200 turns, once per ship — a disabled-test diff scan at `bkit-ship-deferred-sweep.md:69` that decides the ship gate, plus deferral reason tests and a bucket verdict); `bkit-build-plan-current` (50 turns) spends its steps 5-7 on search the engine can do.

**Goal.** `#701`, by the rule `#663` settled: a fact with one right answer is the engine's; judgement is the agent's. The engine computes the test-first verdict and a `fixable` per gap, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests, and writes the deferral rows; the verifier and the deferred sweep keep only what needs judgement (whether the codebase satisfies a task, the four diff reads, the `Executable` / `Reword` / `Broken` call, deliverable verification, doc edits).

**Inputs and precedence.** No design doc and no audit report. `#701` is a `change`-shape issue (`.bkit/trackers.md` § Issue shapes), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Tasks`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word. The plan-input's newest section is the session prompt (`#701` alone), which adds nothing. Two places where the issue's own text disagrees are resolved in this plan and named in `Open Questions & Assumptions` (rows 5 and 6): the order of `fixable` values in `Tasks` Task 1's `DONE WHEN`, and the `tick` default between `Open Questions` item 3 and `Tasks` Task 2.

**Related Issues:**

- `#701` — Engine work in build verify and ship: emit the facts, keep the judgement (open — this issue)
- `#663` — Workflow prompt process token optimisation (closed — parent; settled the engine-fact / judgement rule)
- `#676` — Orchestrator work the engine could do as bkit commands (closed — the workflow-prose half of the same audit; this plan is the subagent-prompt half)
- `#685` — How plans are shaped, reviewed and built (closed — the plan-block format this plan reads and writes)
- `#665` — Fewer plan reviewers and rounds; challenge only on large diffs (closed — why the plan-review fan-out stays at two reviewers plus the scope check)
- `#668` — Build in task slices: symbol refs per task, 160k cap per agent (closed — the per-task `CREATE` / `READ` / `UPDATE` / `DELETE` fields `tasks currency` reads)
- `#680` — ledgers append: engine writes ledger rows with a minted ts (closed — the append machinery `ledgers triage` reuses)
- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (open — shipped-pending neighbour, no shared surface)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

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

### Process Sketch

- **WHEN** the build's verify step runs `bkit tests green --group={N}` **→ THEN** the report and stdout carry a `verdict` and each gap carries `fixable` (`true` / `false` / `null`) and its ready-to-append log line.
- **WHEN** a gap needs a diff read (`test-changed`, `red-mismatch`, `delete-still-referenced`, a row `Changed since red = added lines only`) **→ THEN** that gap prints `fixable: null` and the report's `verdict` is `null`, and the verifier classifies the gap from the diff it reads.
- **WHEN** the verifier judges a task's `DONE WHEN` satisfied **→ THEN** it passes the satisfied task numbers and the workflow ticks them with `bkit tasks tick`; no agent edits the plan.
- **WHEN** a build group's execute log holds neither a `DONE` nor a `BLOCKED` line for some of the group's tasks **→ THEN** `bkit tasks open` lists exactly those tasks and prints `handover: true`.
- **WHEN** the plan-currency step runs `bkit tasks currency --base={BASE_SHA}` **→ THEN** each task whose paths or needles moved is printed with its matched paths and diff hunks, and no hunk outside that set appears.
- **WHEN** the ship step runs `bkit branches scan-diff --disabled-tests --base=origin/dev` **→ THEN** it exits 1 on an added `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` or deleted assertion, printing `file:line` and the test name; a skip predating the base is ignored.
- **WHEN** the ship step runs `bkit ledgers triage --fid={FID} --plan={PLAN}` **→ THEN** each deferral row prints its bucket (`Exempt` / `Lazy`) and, when the reason does not hold, a same-`key` `unjustified` / `TRIAGED` row is appended with a minted `ts` — a `low-severity` `LOW` row stays `Exempt` and writes nothing.

### Concrete Example

**Setup:** A bkit maintainer resumes `/bkit-build` on a plan whose group 1 has one task the executor finished and one it left untouched; the branch is a feature branch off `origin/dev`, and the plan's `Derived Test Matrix` carries a `Task` column.

**Steps:**

1. The build runs Step 6 for group 1 → the executor writes `DONE — TASK 1` and returns `HANDOVER` because its turn cap was near.
2. Step 6's route calls `bkit tasks open --plan={PLAN} --group=1 --log={EXECUTE_LOG}` → it prints task 2 (neither line) and `handover: true`, so the build re-runs Step 6 for the handover with a brief that leaves out task 1.
3. Step 7 calls `bkit tests green --group=1` → the report prints `verdict: null`, and task 2's gap prints `fixable: null` with its log line; the verifier reads that gap's diff itself, judges task 1's `DONE WHEN` satisfied in the codebase, and returns the satisfied number.
4. Step 7 calls `bkit tasks tick --plan={PLAN} --group=1 --tasks=1` → the plan's task 1 line becomes ticked and its number is printed; the verifier never writes the plan.
5. At `/bkit-ship`, Step 5 runs `bkit branches scan-diff --disabled-tests --base=origin/dev` → exit 0 with `disabled: []`, so the sweep's report names no disabled test; `bkit ledgers triage --fid=... --plan=...` prints `Exempt` for a `low-severity` row and writes nothing.

**Outcome:** the plan is ticked by a command, the verdict and every `fixable` come from the engine, the disabled-test list exists in exactly one place, and the deferral rows are written by the engine — every remaining decision is the agent's.

### Edge Cases

`#701` `### Edge Cases`, verbatim, plus plan-added validation / error / boundary cases:

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| a gap kind needs a diff read (`test-changed`) | `tests green` prints `fixable: null` and `verdict: null`; the verifier classifies it |
| a plan has no task blocks | `tasks tick` / `open` / `currency` refuse, naming the plan-check reason |
| a task number named to `tick` sits in another group | `tick` exits 2 and names the task and its group |
| a `Derived Test Matrix` row maps to two tasks | `plan-check` exits 1, naming the row and both tasks |
| a `DELETE` has no `Supersession Inventory` row | `plan-check` exits 1, naming the missing row |
| the diff adds a `.skip` inside a planned test | `scan-diff --disabled-tests` exits 1 with `file:line` and the test name |
| a `.skip` predates `--base` | `scan-diff` ignores it |
| a deferral's `reason` is `low-severity` with `severity: LOW` | `ledgers triage` keeps it `Exempt` and writes no row |
| a deferral's `reason` does not hold at ship time | `ledgers triage` marks it `Lazy` and writes an `unjustified` / `TRIAGED` row with a minted `ts` |
| `green` finds no gap at all (plan-added) | it prints `verdict: PASS` with `gaps: []`, exit 0; the verifier ticks the group's tasks and logs no gap |
| a `Derived Test Matrix` carries no `Task` column (plan-added) | `plan-check` exits 1 with one `matrix` problem naming the column to add, never one problem per row |
| a `Derived Test Matrix` row names a task the plan does not define (plan-added) | `plan-check` exits 1, naming the row and the unknown number |
| a task whose only `TEST FIRST` entry is `n/a — {reason}` (plan-added) | no matrix row is required for it; `plan-check` accepts the plan |
| `tick` names a task already ticked (plan-added) | nothing changes, the number is printed, exit 0 — ticking is idempotent |
| `--tasks` carries a value that is not a task number (plan-added) | exit 2, the bad value named, no line written |
| `--plan` names no file (plan-added) | each `tasks` verb exits 2, naming the path |
| `ledgers triage` finds no deferral row for the FID (plan-added) | it prints an empty bucket list, writes no row, exit 0 |
| `scan-diff --disabled-tests` on a diff that adds no disabled test (plan-added) | exit 0 with `disabled: []` — never a silent non-run |
| `currency` matches no task (plan-added) | it prints no hunks, exit 0; the plan-currency agent reads that as "no affected task" |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. Rows 1-18 are `#701` `### Derived Test Matrix` verbatim (their `unit` label is the issue's own word; the tier `docs/testing.md` records for these files is `Unit` — `.bkit/core/engine/commands/**/*.test.ts` is the unit lane, `branches.test.ts` / `ledgers.test.ts` run real temp git repos as that tier's boundary form). Rows 19+ are plan-added, all `Unit`, each from an `Edge Cases` row. `Task` maps each row to exactly one runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `green` prints a verdict and a `fixable` per gap | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `green` verdict is `FAIL` when a gap is unfixable | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `green` leaves a diff-reading kind `fixable: null` | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tick` marks only the named tasks | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` refuses a task in another group | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| a new command source is registered | unit | `.bkit/core/engine/commands/conventions.test.ts` | 2 |
| `open` lists tasks with no done line | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `open` sets `handover` only when a task is open | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `currency` matches a task on a moved symbol | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `currency` emits no hunk outside the matched set | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `plan-check` refuses an unmapped matrix row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` refuses a delete with no supersession row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `scan-diff` finds an added skip | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `scan-diff` ignores a skip predating the base | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `scan-diff` reports a disabled test with its line | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `ledgers triage` keeps a low-severity deferral exempt | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `ledgers triage` marks an unjustified deferral lazy | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `ledgers triage` writes an unjustified row with a minted ts | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `green` with no gaps prints `verdict: PASS` and an empty `gaps` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tick` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` narrows the group's gap-free tasks by `--tasks` | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `open` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `currency` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `plan-check` refuses a matrix row mapped to two tasks, naming the row and both | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` refuses a task no matrix row maps to | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` accepts a matrix that maps every test-bearing task | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `scan-diff` exits 0 on a diff that adds no disabled test | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `ledgers triage` ignores another feature's deferral rows | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking changes:** `#701` `### Breaking Changes & Naming`, verbatim: _New command noun `tasks`; no existing command changes name. `tests green` output gains `verdict`, `fixable` and `logLine` keys — additive, existing keys unchanged. `branches scan-diff` gains `--disabled-tests`; `ledgers` gains `triage` — additive. No agent, step or prompt is removed. The prompts lose steps but keep their names, so `## Model Overrides` rows and the `§ Models` table are unaffected._

One addition the issue does not name, because its own Success Criterion 3 cannot be met without it (see `Open Questions` row 4):

- **Plan format:** `bkit tests plan-check` gains two refusing problem kinds, and a `Derived Test Matrix` whose header holds no `Task` column is refused (one `matrix` problem per plan, naming the column to add) — the machine-readable row↔task mapping the criterion reads. Every plan written before this change therefore needs one mechanical column added to its matrix table before it can be built; `docs/templates/bkit-plan.md` and the clause the plan-writing prompts carry gain the column in the same change, so new plans are born compliant.

**New names:**

- `bkit tasks` — a new command noun; verbs `tick`, `open`, `currency` (`.bkit/core/engine/commands/workflow/tasks.ts`). It reads and writes a plan file's task blocks; there is no new task store.
- `bkit branches scan-diff --disabled-tests` — the flag that computes the disabled-test list; `bkit ledgers triage` — the verb that buckets deferral rows and writes the `unjustified` / `TRIAGED` rows.
- `Derived Test Matrix` row column `Task` — the row's single task number.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question:** where do the plan-block verbs live? → `#701` `Open Questions` item 1, carried forward.
  - **Options:** A — a new `tasks` noun · B — fold into `context` (`brief`, `diff`) and `tests`.
  - **Recommended:** A — the plan-block verbs sit together and `context` keeps artifact work.
  - **Default if unanswered:** A.
- **Open Question:** does `tests green` always print `verdict`? → `#701` `Open Questions` item 2, carried forward.
  - **Options:** A — always · B — behind `--verdict`.
  - **Recommended:** A — the audit log is already machine-read.
  - **Default if unanswered:** A.
- **Open Question:** does `tick` tick the whole group or only `--tasks=`? → `#701` `Open Questions` item 3, carried forward; the plan's tasks and matrix rows pin both halves, so this is a confirmation, not an open fork.
  - **Options:** A — only the named tasks · B — every task in the group with no gap, narrowed by `--tasks=`.
  - **Recommended:** B — the verifier passes the numbers it judged satisfied, so a named-only `tick` would lose the engine's own test-first gap filter; `--tasks=` narrows it.
  - **Default if unanswered:** B.
- **Open Question:** how does `plan-check` know which task a `Derived Test Matrix` row maps to? → answered by this plan; the human confirms because it changes the plan format for every producer.
  - **Options:** A — the row's `Task` cell (a fourth column; `651-sops-env-backup-plan.md` already ships one) · B — infer the mapping from the row's `Target file` plus its test words against each task's `TEST FIRST` · C — check nothing and leave the mapping to the scope-check agent.
  - **Recommended:** A — B cannot discriminate (`700-session-start-nudge-plan.md`'s rows 4-14 share one target file across tasks 1-3, and row wording there differs from every `TEST FIRST` name), and C leaves Success Criterion 3 unmet.
  - **Default if unanswered:** A.
- **Open Question:** what is `fixable` for a `not-green` gap? → answered by this plan from the mapping it moves; the issue's `Tasks` Task 1 `DONE WHEN` lists `false, false, null` for a `not-green`, `no-red`, `test-changed` fixture, which contradicts the prompt's own Process 8 (`not-green` → `Fixable: true`, `bkit-build-plan-verify.md:68`).
  - **Options:** A — `not-green` → `fixable: true` (the prompt's mapping, moved verbatim) · B — `not-green` → `fixable: false` (the issue's literal value order).
  - **Recommended:** A — the engine's mapping must equal the mapping it replaces, or the verifier's verdict changes for every failing test; and `not-green` is exactly the gap a fix executor closes.
  - **Default if unanswered:** A.
- **Open Question:** which gap wins the report `verdict`? The issue's Edge Case says a diff-reading kind prints `verdict: null`, and its Task 1 `DONE WHEN` fixture holds an unfixable gap alongside a diff-reading one.
  - **Options:** A — any `fixable: null` gap makes `verdict` null, so the verifier applies its mapping to every gap · B — any `fixable: false` gap makes `verdict` `FAIL`, else null.
  - **Recommended:** A — it is what the issue's Edge Case and its `DONE WHEN` fixture both state; the verifier still reaches `FAIL` from the gap lines the engine emits.
  - **Default if unanswered:** A.
- **Assumption:** the engine's `fixable` vocabulary is `true` / `false` / `null`, where `null` means "the answer needs a diff read" — the four sites the issue names (`delete-still-referenced`, `test-changed`, `red-mismatch`, row `Changed since red = added lines only`). → if wrong (for example the engine is expected to decide `delete-still-referenced` itself), the verifier loses a judgement it must keep and the `deleteGaps` codebase read becomes load-bearing; the mapping is one table in `tests.ts` and moves in one edit.
- **Assumption:** the `Task` column is the plan's only mapping carrier and every in-flight plan gets the column added mechanically before it is built. → if wrong, a resumed build of an older plan stops in Step 3's `plan-check` with one `matrix` problem naming the missing column (never a per-row flood), and `@bkit-build-plan-convert` regenerates it.
- **Assumption:** `tick` may write the plan file, so the file it writes is the one `plan-check` reads back, and the write is line-addressed through `parsePlanBlocks`'s task `line` field, never a re-render. → if wrong, a plan re-render would lose consumer prose; `DONE WHEN` pins the line-addressed write and `tasks.test.ts` pins that no other line changes.
- **Assumption:** `ledgers triage` can decide the four reason tests from the ledger row, the plan and the diff, without a human. → if wrong on a row the engine cannot decide, that row is bucketed `Exempt` and no row is written: the failure mode is a missed `unjustified` verdict, never a wrong one written over a genuine deferral.
- **Assumption:** the disabled-test marker set (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, and a removed assertion line inside a test file) covers what `.bkit/jsonl.md` and the sweep's Process 8 name, with `docs/plans/**` excluded. → if wrong, the sweep's gate under-reports; the verb is the single place the list lives, so widening the set is one edit in `branches.ts`.
- **Assumption:** the deferral rows this plan writes (`reason` `scope-declared`, one per `Exempt` row that holds real future work) are the only new ledger rows, and the three rows that keep judgement with an agent carry none. → if wrong, `/bkit-ship`'s `ledgers triage` sees a row with no bounded remediation and buckets it `Lazy`, writing an `unjustified` row against a deferral that was never work.
- **Assumption:** the new problems refuse every plan-check caller, including `bkit tests plan-check --existence=report` in build Steps 3 and 7 and `--existence=refuse` in plan Steps 3 and 7. → if wrong, a build whose plan has an unmapped matrix row proceeds and the criterion is unenforced; `plan-check` has one refusal path, so correcting it is one return value.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Fold the plan-block verbs into `context` and `tests`** (`#701` `Open Questions` item 1 option B). Rejected: `CommandSpec` is one noun per source, `bkit tests tick` is not a test verb, and `context`'s verbs are artifact writers; the mapping would live in two files and the `conventions.test.ts` noun-uniqueness rule would not catch a future drift.
- **Gate the verdict behind `--verdict`** (`#701` `Open Questions` item 2 option B). Rejected: the audit report is already machine-read by the verifier and the remediate agent, and a flag would let a caller ask for the half of the report the gate reads.
- **Infer the matrix↔task mapping from `Target file` plus test words** (`Open Questions` row 4 option B). Rejected on evidence: `700-session-start-nudge-plan.md` rows 4-14 target two files across tasks 1-3, so a file key cannot discriminate, and its row wording differs from every `TEST FIRST` name, so a name key matches nothing.
- **Keep the mapping in `bkit-plan-scope-check`** (option C). Rejected: Success Criterion 3 requires `plan-check` to exit 1, and a judgement agent cannot be a gate.
- **Make `plan-check` report a missing `Task` column per row** rather than once per plan. Rejected: a 40-row matrix would print 40 identical problems and bury the one fix; one problem naming the column is the actionable form.
- **Move the four diff reads into the engine too.** Rejected: they are judgement (is this hit a different thing with the same name; does this added line sit inside a planned test), and the issue's Edge Case row 1 keeps them with the verifier.
- **Move the sweep's deliverable verification (Process 7) into the engine.** Rejected: it is the judgement the criterion explicitly keeps, and it reads the plan for it anyway.
- **Let `ledgers triage` also close / re-severity rows** (the `utility-update-deferrals` sweep). Rejected: a different contract (disposition and closing) on the same ledger; this plan only adjudicates `reason` at ship time.
- **Recommendation for a future phase:** after this lands, the same treatment is due to the design-workflow prompts, which have no run measurements yet (`docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The deferred sweep's deliverable verification (Process 7) | `#701` declared it out of scope before work started; it is judgement (does the codebase satisfy a deliverable), no Success Criterion or matrix row needs it, so there is no deferred work to remediate | stays in `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 7 |
| `plan-current`'s `Executable` / `Reword` / `Broken` classification | `#701` declared it out of scope before work started; the engine cannot decide whether landed changes leave a task executable, and Task 4 keeps the call, so there is no deferred work to remediate | stays in `.bkit/core/prompts/bkit-build-plan-current.md` § Process 8 |
| The four diff-reading test-order classifications in `bkit-build-plan-verify.md` | `#701` declared them out of scope before work started; they are judgement, and Task 1 keeps them, so there is no deferred work to remediate | stays in `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 |
| Design-workflow reviewers | `#701` declared them out of scope before work started: no design-run measurements exist, so which prose is mechanical is unmeasured — real future work | new audit of the design prompts; `docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `tests green` still accepts a red recorded after the task's code commit, so a red forced by swapping old source back in clears the `no-red` gap | `docs/failures.jsonl` key `tests-green-accepts-red-recorded-after-task-code` (OPEN, MEDIUM; an older same-key row was CLOSED by `#656`) | the `green` verb Task 1 extends (the `late-red` gap and its `verdict` / `fixable` output) | keep deferred — the residual is in `bkit-build-plan-gaps-remediate`'s red-recording contract, not in `green`'s output; folding it in would widen the engine's judgement here |
| A `task-range` parameter for `bkit-build-plan-execute` (the group brief's task slice) | `docs/deferrals.jsonl` key `pending-bar-155-deferred-task-range-parameter-for-bkit-build-pl` (OPEN, LOW) | the new `tasks` noun's `--tasks=` selection | keep deferred — a brief-range parameter consumed by `context brief`, a different verb from `tasks`; the noun covers tick / open / currency only |
| Amend the plan template's Design-Missing Fallback for standalone plans | `docs/deferrals.jsonl` key `442-plan-template-design-missing-fallback-amendment` (OPEN, LOW) | the same file Task 9 edits (`.bkit/core/docs/templates/bkit-plan.md`, `docs/templates/bkit-plan.md`) | keep deferred — a wording amendment to the MISSING-fallback contract; folding it in changes Narrative / Success Criteria semantics this plan must not touch |
| The pre-commit `bkit:check:dist` gate fails any commit while another agent holds unstaged engine edits | `docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents` (OPEN, MEDIUM) | Task 11 rebuilds `dist/` in a tree other agents may be writing | keep deferred — a `.husky/pre-commit` concern of its own; this plan regenerates `dist/` once, in its close-out task |
| Promote the status-hole detector from advisory to gate | `docs/deferrals.jsonl` key `384-promote-status-hole-detector-from-advisory-to-gate` (OPEN, LOW) | the same move as this plan (a prose / advisory check becoming an engine refusal), on `bkit-audit:status` | keep deferred — a separate detector and a separate repo-only gate; no criterion here needs it |
| Pre-push lint and typecheck scope vs CI's whole-repo scope | `docs/deferrals.jsonl` key `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (OPEN, MEDIUM) | the gate suite every task's `DONE WHEN` runs | keep deferred — a gate-scope question, unrelated to where a fact is computed |

## Security & Privacy

- [ ] **New API Route** — no; the engine's commands are local.
- [ ] **New DB Table/Column** — no database in this repo.
- [x] **User Input** — the new verbs' flags are validated in the handler, not only by their caller: `--plan` must resolve to a file (else exit 2, path named), every `--tasks` value must be a positive integer naming a task the plan defines (else exit 2), `--base` must resolve as a commit (else the existing `EXIT_DIFF_FAILED`), and `--fid` / `--group` go through the same `positiveInt` / string helpers the neighbouring verbs use.
- [ ] **PII** — no personal data; the commands read and write plan text and ledger rows that name issue numbers, files and tests.
- [ ] **Redirect URL** — no.
- [ ] **Webhook** — no.
- [ ] **New Secret/Env Var** — no.
- [ ] **Role-Gated Mutation** — no roles; the plan file and the ledgers are repo-local files the engine already writes.

_Two surfaces are write paths and stay inside the existing privilege_: `bkit tasks tick` rewrites the plan file's own task line (`docs/plans/**`, already written by the plan workflow and the verifier today), and `bkit ledgers triage` appends to `docs/deferrals.jsonl` through the existing `ledgers append` validation and minted-`ts` path — it never rewrites a prior row, and it carries an existing `reason` verbatim rather than inventing one.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no packages added or changed; `package.json` and `pnpm-lock.yaml` stay in sync untouched.
- [x] **Dependency Versions:** node `v24.16.0` (matches `.nvmrc` `24`), pnpm `10.34.6`, git `2.56.0`. `pnpm bkit:deps:outdated` reports 5 outdated dev-only deps — `vitest` 5.0.3→5.0.5, `@vitest/coverage-v8` 5.0.3→5.0.5, `oxlint` 1.87.0→1.88.0, `@types/node` 24.19.2→26.6.5, `vite` 6.4.4→8.3.4. None blocks this change: no dependency is added, and the `vite` major sits upstream of the vitest stack. Stack CLI: the engine runs from the committed `dist/` (`pnpm bkit` = `node dist/cli.js`), so Task 11 rebuilds it — a `dist/` that lags its source is the one CLI/backend mismatch this plan can hit, and `bkit:check:dist` fails CI on it.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory` (`grep -rn` over `.bkit/core/engine/commands/workflow/` for the plan-block readers, the diff scan and the ledger writers; reads of `plan-blocks.ts`, `tests.ts`'s `green` / `plan-check`, `branches.ts`'s `scanDiffVerb`, `ledgers.ts`'s `append`, `ledgers/telemetry.ts`'s reason enum, `context.ts`'s `ledger-scan`).
- [x] **User Context:** file access confirmed (worktree `.worktrees/701-engine-work-build`); every file the runbook names was opened this session; no missing user information — the six `Open Questions` carry a recommendation and a default.
- [x] **Project Context:** read `docs/testing.md` § CI test tiers / § Which tier does a behaviour need? / § Test first / § Key test files, `.bkit/jsonl.md` § Deferral Reason / § Write Idiom, `.bkit/trackers.md` § Issue shapes, `docs/templates/bkit-plan.md`, `.bkit/instructions.md` § Clauses (`plan-scenario-detail`), `docs/decisions.jsonl` (keys near `plan-check` / deferrals — none to supersede) and `docs/deferrals.jsonl` + `docs/failures.jsonl` (open rows in `Suggested Scope Expansion`).
- [x] **Testing & Quality:** matches `docs/testing.md` — every row is `Unit`, the tier its target file already runs in; `.bkit/core/engine/commands/**/*.test.ts` is the unit lane (bkit's repo declares no integration / E2E / `@live` tier — `docs/testing.md` § Validated means executed, "a repo with no integration / E2E / `@live` tier is fully valid"), and `branches.test.ts` / `ledgers.test.ts` / `tests.test.ts` already exercise real temp git repos and the real test-file subprocess as that tier's boundary form. No DB, no external or deployed boundary → no `@live`, E2E or fresh-DB replay row.
- [x] **Prerequisite Plans:** None — `#680` (the append machinery `triage` reuses) and `#685` (the plan-block format) are closed and their code is in this tree.

### Conditional

- [x] **Secrets & Env Vars:** none added; the verbs read no secret and the ledgers stay repo-local.
- [x] **Schema State:** N/A — no database. The two machine-read text contracts this change writes are recorded in `Data Schema Integration`.
- [x] **Architecture & UI:** `docs/architecture.md` needs no edit — no service boundary, topology or installed-layout change (the new file sits in the `commands/workflow/` folder the tree sketch already names); no UI.
- [x] **Observability:** no new logs, audit tables or traces. Each verb reports through `ctx.log` / `ctx.emit` (stderr / stdout) per the engine convention `conventions.test.ts` enforces, and `docs/observability.md` describes the consumer's logging, not the engine's channel — no row there.
- [x] **Notifications:** None — no alert or toast. The only human-facing signal is a nonzero exit code a workflow routes on.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** the one applicable row verified; the rest justified `None`.
- [x] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [ ] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

No database in this repo. The two machine-read text contracts this change reads and writes are recorded here in the schema section's place, because they carry the same "schema, never prose" obligation.

### Data Schema Usage

- **Input (Read):** the plan file's group / task blocks (`<!-- bkit:group N start -->` … `<!-- bkit:group N end -->`, `<!-- bkit:task N start -->` … `<!-- bkit:task N end -->`, the uppercase fields) via `parsePlanBlocks`; the plan's `Derived Test Matrix` table and its `Task` column; the plan's `Supersession Inventory` table; `docs/deferrals.jsonl` rows (`key`, `type`, `category`, `severity`, `reason`, `description`, `remediation`, `references`, `status`); the `bkit tests green` audit report's `gaps: [{task, kind, detail}]`; the build execute log's `DONE — TASK {N}` / `BLOCKED — TASK {N}` lines.
- **Output (Write):** the plan file's task line (`- [ ] **TASK {N}:**` → `- [x] **TASK {N}:**`), line-addressed by `parsePlanBlocks`'s task `line`; `docs/deferrals.jsonl` rows (`schema`, `ts`, `kind`, `key`, `repo`, `bkit`, `by`, `references`, `type`, `category`, `severity`, `reason`, `status`, `description`, `remediation`) written through the existing `ledgers append` validation with a minted `ts`.

### Data Schema Changes

- **ADD:** the optional `Task` column on a plan's `Derived Test Matrix` table (plan text, not a store) — made required by `plan-check`'s new `matrix` kind and carried by `docs/templates/bkit-plan.md`.
- **MODIFY:** no ledger field is added or renamed; `reason` → `unjustified` and `status` → `TRIAGED` are the existing `.bkit/jsonl.md` § Deferral Reason / § Updating a Row semantics.
- **None** for `docs/data-schema.md` — it indexes production database tables only.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Test-first verdict, per-gap `fixable` and the ready-to-append log line | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "kind\|gap(" .bkit/core/engine/commands/workflow/tests.ts`; read the `Gap` type, `writeAuditReport`, `green`'s `ctx.emit` block and `deleteGaps`; `grep -rn "Fixable" .bkit/core/prompts/bkit-build-plan-verify.md .bkit/instructions.md` | `green`'s existing `gaps` array (`{task, kind, detail}`) and its report writer | EXTEND | add `verdict` to the emitted payload and the report, and `fixable` / `logLine` per gap, from one mapping table in the file; every existing key and the report's sections stay |
| Plan table readers (`Derived Test Matrix`, `Supersession Inventory`) | `.bkit/core/engine/commands/workflow/plan-blocks.ts` | read `reuseInventory` + `tableCells` in full; `grep -rn "Derived Test Matrix\|Supersession" .bkit/core/engine/commands` | `reuseInventory(text)` — the plan's Reuse Inventory table reader, with `tableCells` and heading scoping | EXTEND | same file, same shape: two more readers over the same `tableCells` helper, so all plan-table parsing stays in the one module `tests` and `challenge` already import |
| The `tasks` noun (`tick`, `open`, `currency`) | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -rln "parsePlanBlocks" .bkit/core/engine` (`tests.ts`, `challenge.ts`, `run-facts.ts`, `summary.ts`); `ls .bkit/core/engine/commands/workflow/`; read `registry.ts` and `conventions.test.ts` | `tests.ts` (owns `plan-check`, the plan's reader consumer) and `context.ts` (owns `brief` / `diff`, the artifact writers) | NEW | (b) `CommandSpec` is one noun per source and `conventions.test.ts` asserts noun uniqueness and one exported command per file, so folding `tick` into `tests` would make `bkit tests tick` a test verb, and folding it into `context` would put a plan *writer* beside the artifact writers whose callers read a clamped artifact — both named candidates' contracts break |
| Disabled-test diff scan | `.bkit/core/engine/commands/workflow/branches.ts` | read `scanDiffVerb` and the `--marker` added-line branch; `grep -rn "disabled\|\.skip" .bkit/core/engine/commands` | `scan-diff`'s `--marker` branch (added lines from `{base}...HEAD`, `docs/plans` excluded) and its `--expect-none` exit inversion | EXTEND | one more branch beside `--marker`, sharing the fetch / `rev-parse` guard and the diff loop; the line number comes from the hunk header the loop already walks |
| Deferral triage and the `unjustified` / `TRIAGED` row write | `.bkit/core/engine/commands/workflow/ledgers.ts` | read `append`'s validator entry points (`APPEND_LEDGERS`, `EXIT_ROW_REFUSED`, the writer check) and `check`; `grep -rn "DEFERRAL_REASONS\|UNJUSTIFIED_REASON" .bkit/core/engine` | `append` (mints `ts`, validates a row, checks its writer, all-or-nothing) and `ledgers/telemetry.ts`'s `DEFERRAL_REASONS` / `UNJUSTIFIED_REASON` | EXTEND | `triage` computes a bucket and hands each row it must write to the same append path, so the row shape, the `ts` mint and the writer check stay in one place |
| The deferral reason vocabulary and the four tests' inputs | `.bkit/core/engine/ledgers/telemetry.ts` | `grep -rn "DeferralReason\|DEFERRAL_REASONS\|UNJUSTIFIED_REASON" .bkit/core/engine`; read its § Deferral Reason doc block | `DEFERRAL_REASONS` (the closed enum) and `UNJUSTIFIED_REASON`, with the four tests documented beside them | EXTEND | no code change: `triage` imports the enum instead of re-declaring it, so a new reason is one edit; the four tests themselves are new logic in `triage` |
| The sweep's deferral-row list and the ship docs agent's `Pending Items` | `.bkit/core/workflows/bkit-ship.md` | `grep -n "ledger-scan\|deferrals.jsonl\|Step 6" .bkit/core/workflows/bkit-ship.md`; read Step 5 and Step 6 | `bkit context ledger-scan` (a shipped verb) and the ship workflow's existing per-step artifact pattern | EXTEND | Task 8 runs the verb and passes its artifact; no new command, and `docs/deferrals.jsonl` never reaches the docs agent as an unfiltered read |
| The `Task` column on the plan template | `.bkit/core/docs/templates/bkit-plan.md` | `grep -n "Target file" .bkit/core/docs/templates/bkit-plan.md docs/plans/202610/*.md`; `find .bkit -name bkit-plan.md` | `651-sops-env-backup-plan.md` and `700-session-start-nudge-plan.md` already ship a `Task` column; the template's matrix holds three columns | EXTEND | add the column and one sentence to the template's matrix, and to the `plan-scenario-detail` clause the plan-writing prompts carry; the mirror `docs/templates/bkit-plan.md` is regenerated by `bkit install` |

## Architecture & Component Changes

**Ledger rows:** `701-tasks-command-noun`, `701-green-always-prints-verdict`, `701-tick-narrows-by-tasks`, `701-matrix-task-column`, `701-design-workflow-reviewer-audit`

### Database Migrations

None — no database.

### Engine Commands — `.bkit/core/engine/commands/workflow/`

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** file exists.
- `green`: emit a top-level `verdict` (`PASS` no gaps · `FAIL` any gap `fixable: false` · `CONCERNS` every gap `fixable: true` · `null` any gap `fixable: null`) and, on each gap, `fixable` and `logLine`; carry both into `writeAuditReport`'s gap lines so the verifier's prompt reads them from the report. The mapping is one table in the file: `true` — `not-green`; `null` — `delete-still-referenced`, `test-changed`, `red-mismatch`, and the row state `changed: added lines only` (the four diff reads); `false` — `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused`. `logLine` is the line the verifier appends: ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: {fixable}``, rendered once, in the file.
- `plan-check`: extend the `problems` kind union (line 344) with `matrix` and `supersession`, and their checks in `checkPlanText`; update the verb's `summary`, its `output.problems` line and its `--help`. `matrix`: the `Derived Test Matrix` table's header carries no `Task` column → one problem at the header line naming the column to add; a row whose `Task` cell names no task number, or a number no task block defines → one problem at the row; a row naming two or more numbers → one problem naming the row and both tasks; a task that names at least one `TEST FIRST` test and is named by no row → one problem at its task line (a task whose `TEST FIRST` is `n/a` needs no row). `supersession`: every `DELETE` reference of a task names a file that appears in the plan's `Supersession Inventory` table, else one problem at the `DELETE` line.
- No exit code changes; the two kinds join the existing `problems`, so `plan-check` still exits 0 / 1.

#### [MODIFY] `.bkit/core/engine/commands/workflow/plan-blocks.ts`

- **Existence Check:** file exists.
- Add `derivedTestMatrix(text)` and `supersessionInventory(text)` beside `reuseInventory`, reusing `tableCells` and the same heading scoping: the first table under the first heading naming the section, before the next heading of the same or a higher level; `derivedTestMatrix` returns each row's cells plus the `Task` column's index (`null` when the header has none), the header line and the row lines; `supersessionInventory` returns each row's backticked paths. Pure text in, rows out — no file-system access, so `tests` and `challenge` keep sharing it.

#### [new] `.bkit/core/engine/commands/workflow/tasks.ts`

- **Reuse Check:** `Reuse Inventory` row "The `tasks` noun (`tick`, `open`, `currency`)" — reason (b).
- `noun: "tasks"`, `summary`, verbs `tick` / `open` / `currency`, each with `flags`, `output` and `exitCodes` per `lib.ts`'s `VerbSpec`; imports `parsePlanBlocks` (and `derivedTestMatrix` only if a verb needs it) rather than re-parsing the block format.
- `tick --plan= --group= [--tasks=] [--green=]`: candidates are the group's tasks; `--green` (a `tests green` audit report) drops every task the report gaps; `--tasks` (repeatable, positive integers) intersects with the numbers given. Ticks each remaining task's `- [ ] **TASK {N}:**` line to `- [x]`, addressed by `parsePlanBlocks`'s task `line`, leaving every other line byte-identical; prints each ticked number. Exit 0 ticked (including none — idempotent); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a `--tasks` value that is not a positive integer, names a task the plan does not define, or names a task outside `--group` (naming the task and its group), or a `--plan` that is no file.
- `open --plan= --group= --log=`: prints the group's tasks holding neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in `--log` (the log's own line forms), and `handover: true` when at least one is open, else `false`. Exit 0 (including an empty list); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a missing `--plan` / `--log` file.
- `currency --plan= [--base=]`: per task, the paths and needles its `CREATE` / `READ` / `UPDATE` / `DELETE` fields name, matched against `git diff --name-only {base}..HEAD` (default `origin/dev`) and `git diff -S{needle} --name-only`; for matched tasks only, print the matched paths, the needles that matched and `git diff {base}..HEAD -- {paths}`; no hunk outside the matched set. Exit 0 (including no match); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a `--plan` that is no file; the existing diff-failure code when `--base` does not resolve.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** file exists.
- `scan-diff` gains `--disabled-tests` (boolean), joining the "give exactly one of `--paths`, `--marker`, `--code`" guard as a fourth mutually exclusive mode. It reads added lines only from `{base}...HEAD` with `docs/plans` excluded, walking the diff's `@@ … +N,M @@` hunk headers to keep the new-file line number, and reports `{file, line, test}` for each added line matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, or a removed assertion line inside a test file (`*.test.*`, `*.spec.*`, `*_test.*`, `test_*.py`) matching an assertion call. `test` is the nearest preceding test declaration in the working-tree file at that line (`it(`, `test(`, `it.each(`, `func Test`, `def test_`, `@Test`), else the marker line's own trimmed text. `found` / `disabled` join the `output`, and the verb's `summary` and `--help` state the exit inversion (0 nothing added, 1 something added) alongside `--expect-none`'s. Exit codes unchanged: `EXIT_DIFF_FAILED` when `--base` does not resolve or the diff fails.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** file exists.
- New verb `triage --fid= --plan=`: reads `docs/deferrals.jsonl` (folding same-`key` rows last-wins) and keeps the rows whose `key` starts with the FID's leading issue number, or whose `references` name `#{N}` / the FID. Per row: `reason: "low-severity"` with `severity: "LOW"` → bucket `Exempt`, no write. Else the four tests of `.bkit/jsonl.md` § Deferral Reason, all decidable from the row, the plan and the diff: (1) `remediation` names at least one path that exists in the tree and no new architecture; (2) a named path or `references` entry sits inside a surface the plan's tasks touch (their `CREATE` / `READ` / `UPDATE` / `DELETE` files, or the plan's `Reuse Inventory` `File` cells); (3) `reason` is neither `hard-blocked` nor `needs-decision`; (4) a `scope-declared` row's `references` name a plan item (an `Out of Scope` row) or a design § that declared it out of scope — a row that is its own only declaration fails. All four hold → bucket `Lazy` and append a same-`key` row carrying every prior field verbatim with `reason: "unjustified"`, `status: "TRIAGED"` and a `description` naming the failed tests, through `append`'s path (minted `ts`, writer check, all-or-nothing). Prints `{key, bucket, tests}` per row and a total. Exit 0; `EXIT_ROW_REFUSED` if a computed row fails validation (nothing written); exit 2 a missing `--fid` / `--plan` file. The verb's `output` and `--help` list both codes.

#### [MODIFY] `.bkit/core/engine/commands/registry.ts`

- **Existence Check:** file exists.
- Import `tasksCommand` from `./workflow/tasks.js` and add it to `COMMANDS` beside `testsCommand`, so `conventions.test.ts`'s reachability, noun-uniqueness and per-source-test rules cover it.

### Prompts — `.bkit/core/prompts/`

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** file exists.
- Contract: the mandate loses "change plan only to mark tasks done" → the verifier never writes the plan; add the satisfied task numbers to the machine-parseable header (one line, e.g. `Tasks: 1, 2`), because the workflow reads them to tick.
- Process 4: the gap log line is the report's `logLine` verbatim, no longer assembled by hand.
- Process 6-7: drop the `DONE` log cross-reference (the engine's `open` and the execute log's lines are the workflow's inputs).
- Process 8: drop the eleven-row kind→`Fixable` table and keep the four diff reads (`delete-still-referenced`, `test-changed`, row `Changed since red`, `red-mismatch`), now written as "the engine prints `fixable: null` for these and you decide them"; add that a `logLine` carrying `Fixable: false` is a `FAIL`.
- Process 9: replace the plan tick with "pass the satisfied task numbers it judged"; Process 10: drop the verdict mapping and read `verdict` from the report.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-current.md`

- **Existence Check:** file exists.
- Process 5-7: drop the changed-path list, the `-S{needle}` search and the per-path diff read; Process 5 keeps "record what each task depends on" as the input to `bkit tasks currency`, and Process 7 becomes "read the hunks `currency` printed for the matched tasks". Process 8's `Executable` / `Reword` / `Broken` call is unchanged.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-deferred-sweep.md`

- **Existence Check:** file exists.
- Process 8: read `bkit branches scan-diff --disabled-tests --base=origin/dev` and its `disabled` list instead of scanning the supplied diff; a non-empty list is a `Blocking Deferral` and a `FAIL`.
- Process 9-11: read `bkit ledgers triage --fid={FID} --plan={PLAN}` — its `Exempt` rows are the `Exempt Deferrals`, its `Lazy` rows the `Lazy Deferrals` — and drop the reason tests and the `ledgers append` write (the verb writes). Process 7 (deliverable verification) is untouched.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-update-docs.md`

- **Existence Check:** file exists.
- Drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the `bkit context ledger-scan` artifact the ship workflow passes.

#### [MODIFY] `.bkit/core/prompts/bkit-plan-scope-check.md`

- **Existence Check:** file exists.
- Process 9 (matrix ↔ runbook mapping) and Process 11 (supersession inventory presence) are dropped — `plan-check` refuses both; the lens keeps every other check, and the Contract's `Runbook tasks` line is untouched.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-convert.md`

- **Existence Check:** file exists.
- Contract: add the `Task` column to the plan shape it writes (a `Derived Test Matrix` converted from an issue body has three columns), so a converted plan passes `plan-check` on its re-run.

### Workflows — `.bkit/core/workflows/`

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** file exists.
- Step 6 sub-step 5: replace the prose set difference with `bkit tasks open --plan={PLAN} --group={GROUP} --log={EXECUTE_LOG}`, routing on `handover: true`.
- Step 7 sub-step 4: the subagent's `Update:` line drops the plan (the verifier writes no plan file) and its `Read:` list keeps the diff and the green report; sub-step 4's hold gains the satisfied task numbers from the verify artifact's header; a new sub-step runs `bkit tasks tick --plan={PLAN} --group={GROUP} --tasks={VERIFIED_TASKS} --green={GREEN_REPORT}` before the step finishes.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** file exists.
- Step 5 sub-step 2: pass the sweep the diff base it runs the scan against (`origin/dev`, the base the `context diff` artifact already uses), so the sweep's `--base` is not guessed.
- Step 6 sub-step 1: run `bkit context ledger-scan --terms='{FID}' --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log`, pass the artifact in the subagent's `Read:` list, and drop the raw `docs/deferrals.jsonl` read where the scan replaces it.

### Template & Clauses

#### [MODIFY] `.bkit/core/docs/templates/bkit-plan.md`

- **Existence Check:** file exists.
- § Derived Test Matrix: the table gains a `Task` column and one sentence — each row maps to exactly one runbook task by its number, and an `n/a`-only task needs no row. The mirror `docs/templates/bkit-plan.md` is regenerated by `bkit install` in Task 11.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** file exists.
- § Clauses: the `plan-scenario-detail` clause's `Derived Test Matrix` sentence gains the `Task` column as the mapping carrier, then `pnpm instructions:sync` rewrites its copies in the four carrier prompts; `pnpm instructions:show --file bkit-build-plan-convert.md` before the convert prompt gains the same line.

### Cron Jobs & Scheduled Tasks

None — every verb is invoked by a workflow step, on demand.

## Supersession Inventory

Each row is prose inside a prompt that stays: the block is deleted, the prompt file itself is kept and modified. Each DELETEd block is replaced by an engine verb, and the runbook task that removes it is named in `Replaced by`.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `bkit-build-plan-verify.md` § Process 8 — the eleven-row kind→`Fixable` table | `bkit tests green`'s `fixable` per gap (Task 1) | DELETE | one right answer, and the engine already computes every gap kind it maps; the four diff reads stay in the prompt |
| `bkit-build-plan-verify.md` § Process 10 — the three-line verdict mapping | `bkit tests green`'s `verdict` (Task 1) | DELETE | the mapping is arithmetic over `fixable`, which the report now carries |
| `bkit-build-plan-verify.md` § Process 9 — the plan tick edit | `bkit tasks tick` (Task 2) | DELETE | Success Criterion 2: no subagent edits the plan; the tick is a line-addressed write |
| `bkit-build-plan-verify.md` § Process 6-7 — the task ↔ `DONE` log cross-reference | `bkit tasks open` (Task 3) | DELETE | a set difference over the group's tasks and the log's lines, which the engine reads with `parsePlanBlocks` |
| `bkit-build-plan-current.md` § Process 5-7 — the changed-path list, the `-S` needle search and the per-path diff read | `bkit tasks currency` (Task 4) | DELETE | path and needle matching against a base commit is mechanical; the `Executable` / `Reword` / `Broken` call stays |
| `bkit-plan-scope-check.md` § Process 9 — matrix ↔ runbook coverage | `bkit tests plan-check` `matrix` problems (Task 5) | DELETE | Success Criterion 3 makes it a gate, and a gate is the engine's |
| `bkit-plan-scope-check.md` § Process 11 — supersession inventory presence | `bkit tests plan-check` `supersession` problems (Task 5) | DELETE | same: a `DELETE` with no `Supersession Inventory` row is a fact, not a judgement |
| `bkit-ship-deferred-sweep.md` § Process 8 — the disabled-test diff scan | `bkit branches scan-diff --disabled-tests` (Task 6) | DELETE | Success Criterion 4 makes the verb the only place the list lives; the sweep keeps the verdict it decides from the list |
| `bkit-ship-deferred-sweep.md` § Process 9-11 — the deferral reason tests and the `unjustified` row write | `bkit ledgers triage` (Task 7) | DELETE | Success Criterion 5 names the verb; the sweep keeps deliverable verification (Process 7) |
| `bkit-ship-update-docs.md` § Process 7 — the `docs/deferrals.jsonl` grep | `bkit context ledger-scan` (Task 8) | DELETE | the ledger scan is a shipped verb with a clamp and an artifact; a raw grep has neither |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/prompts.md` (source) | The Plan Phase and Build Phase / Ship Phase tables stay name-for-name (no prompt added or removed); record the changed scope of `bkit-build-plan-verify` (no plan write; `tasks: 1, 2` header line), `bkit-build-plan-current` (no diff search), `bkit-ship-deferred-sweep` (no diff scan, no reason tests, no ledger write), `bkit-ship-update-docs` (Pending Items from the scan artifact) and `bkit-plan-scope-check` (two checks dropped) — one row per prompt whose scope line changes, and nothing else |
| `.bkit/prompts.md` (mirror) | Regenerated by `bkit install` from the source above; `bkit check` must stay drift-clean |
| `.bkit/core/.bkit/workflows.md` (source) | § `/bkit-build` — 15 steps: the Step 6 row's handover set difference and the Step 7 row's tick now name `bkit tasks open` / `bkit tasks tick` and the verify header's task numbers; § `/bkit-ship` — 14 steps: the Step 5 row names `scan-diff --disabled-tests` and `ledgers triage`, the Step 6 row names the `ledger-scan` artifact. `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` reads these rows, so the index and the workflow move together |
| `.bkit/workflows.md` (mirror) | Regenerated by `bkit install` from the source above |
| `.bkit/instructions.md` | § Clauses `plan-scenario-detail`: the `Task` column as the matrix's mapping carrier; every `text` block this change retires moves to a `retired` block, then `pnpm instructions:sync` rewrites the copies. The per-file prompt sections for `bkit-build-plan-verify` (`[R72]` and neighbours) and `bkit-ship-deferred-sweep` lose the lines this change deletes, regenerated by the same sync — `.bkit/core/engine/tools/instructions.test.ts` is the guard |
| `.bkit/core/docs/templates/bkit-plan.md` (source) + `docs/templates/bkit-plan.md` (mirror) | § Derived Test Matrix: the `Task` column and its one-sentence rule; the mirror is regenerated by `bkit install` |
| `docs/testing.md` | § Key test files: add a row for `.bkit/core/engine/commands/workflow/tasks.test.ts` (Unit — `bkit tasks tick / open / currency`), and extend the existing rows for `tests.test.ts` (`green`'s `verdict` / `fixable` / `logLine`; `plan-check`'s `matrix` / `supersession` problems), `branches.test.ts` (`scan-diff --disabled-tests`) and `ledgers.test.ts` (`triage`'s buckets and its minted-`ts` row). § Test first is unchanged |
| `docs/capabilities.md` | Regenerated by `pnpm graph:refresh` (the register is built off live source and CI's push-side `graph:check` fails when it differs); no capability rule is added unless the refresh shows the new command file inside an existing rule's scope |
| `docs/knowledge.jsonl` | One row: a plan's `Derived Test Matrix` needs a `Task` column because two plans can share a target test file, so a file key cannot map a row to a task — the reason the format carries the mapping |
| `docs/decisions.jsonl` | Rows `701-tasks-command-noun`, `701-green-always-prints-verdict`, `701-tick-narrows-by-tasks`, `701-matrix-task-column` — written by this plan |
| `docs/deferrals.jsonl` | Row `701-design-workflow-reviewer-audit` — written by this plan |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | no database |
| **Code** | `git revert {COMMIT}` | the engine edits, the prompt / workflow edits, the template and the committed `dist/` revert together; a consumer's installed mirrors roll back on the next `bkit upgrade` from the reverted package |
| **Risk window** | none pre-merge | no migration and no deploy in this repo; the only ordering constraint is that `dist/` ships with its source in the same commit, so a revert cannot leave a stale CLI |

Code-only — `git revert` sufficient. The one non-code residue: a plan that gained a `Task` column keeps it (harmless when the reverted `plan-check` ignores the column), and the `docs/deferrals.jsonl` row `701-design-workflow-reviewer-audit` stays OPEN as a deferral — a revert does not delete a ledger row.

## Agent Execution Runbook

Build order: the engine commands first (Groups 1-2), then the ship-side deferral rules (Group 3), then the producers, docs, indexes and mirrors (Group 4). Tasks 1, 2, 5 and 6 are independent; Tasks 3 and 4 depend on the `tasks` noun from Task 2. **Integration shape (advice only, never a gate):** one PR for all 11 tasks is fine; the natural split is Groups 1-2 (the engine commands and the plan format), Group 3 (the ship-side sweep), then Group 4 (producers, docs, mirrors) — no merge method is implied.

<!-- bkit:group 1 start -->

### GROUP 1: The test-first verdict, the plan tick and the group handover come from the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `tests green` emits `verdict`, a `fixable` per gap and the gap log lines
  - **UPDATE:** `green` in `.bkit/core/engine/commands/workflow/tests.ts`: emit `verdict` (`PASS` no gaps · `FAIL` any gap unfixable · `CONCERNS` otherwise · `null` when any gap needs a diff read) plus `fixable` and `logLine` on each gap, carried into `writeAuditReport` too; `fixable: null` for `delete-still-referenced`, `test-changed`, `red-mismatch` and the row state `Changed since red = added lines only`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: drop the kind→`Fixable` table and the verdict mapping from Process 8 and 10; keep the four diff reads; Process 4 appends the report's `logLine` verbatim
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: the parsed task / gap shapes the audit reads
  - **READ:** `.bkit/instructions.md`: § Clauses and the `bkit-build-plan-verify` per-file section, before editing prose (`pnpm instructions:show --file bkit-build-plan-verify.md`)
  - **DONE WHEN:** `bkit tests green` on a fixture with a `not-green`, a `no-red` and a `test-changed` gap prints `verdict: null` and `fixable` `true`, `false`, `null` in that order (the issue's own fixture, corrected per `Open Questions` row 5); the same report file carries `verdict` and each gap's `fixable` / `logLine`; `grep -c "Fixable" .bkit/core/prompts/bkit-build-plan-verify.md` finds no kind→`Fixable` line and no verdict-mapping line; `pnpm instructions:sync` leaves `instructions.test.ts` green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints a verdict and a fixable per gap` fails while the emitted payload carries no `verdict` and no gap `fixable`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green verdict is FAIL when a gap is unfixable` fails while a `no-red` gap alone still prints `CONCERNS`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a diff-reading kind fixable null` fails while a `test-changed` gap prints `fixable: false`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green with no gaps prints verdict PASS and an empty gaps` fails while a clean audit prints no `verdict`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Create the `tasks` noun with `tick`, and wire the verifier to it
  - **CREATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: the `tasks` command over a plan's task blocks — verbs `tick`, `open`, `currency`; this task lands the noun and `tick`
  - **UPDATE:** `COMMANDS` in `.bkit/core/engine/commands/registry.ts`: register `tasksCommand`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the verifier no longer edits the plan; its header carries the satisfied task numbers and the mandate drops the plan-write clause
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 7 sub-step 4's `Update:` no longer names the plan, the hold reads the satisfied task numbers, and a new sub-step runs `bkit tasks tick` before the step finishes
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `parsePlanBlocks` and the task block's `line` / `end` fields the tick address
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: the verb / flag / exit-code conventions `bkit tests` follows
  - **READ:** `.bkit/core/engine/commands/registry.ts`: what registering a command costs
  - **READ:** `.bkit/core/engine/commands/conventions.test.ts`: the rules a new command source must satisfy
  - **DONE WHEN:** `bkit tasks --help` lists `tick`; `bkit tasks tick --plan= --group= --tasks=` ticks exactly the named tasks and prints their numbers, leaving every other plan line byte-identical; `bkit-build-plan-verify.md` names no plan tick edit and `bkit-build.md` Step 7 calls the verb; `pnpm vitest run .bkit/core/engine/commands/conventions.test.ts` is green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick marks only the named tasks` fails while an unnamed group task is ticked
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a task in another group` fails while it exits 0
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a plan with no task blocks` fails while it ticks nothing and exits 0 instead of naming the plan-check reason
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick narrows the group's gap-free tasks by --tasks` fails while a task the `--green` report gaps is ticked
    - `.bkit/core/engine/commands/conventions.test.ts` `each export a command, and every exported command is in COMMANDS (reachable)` fails while `tasks.ts` exports `tasksCommand` and `COMMANDS` does not list it

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line
  - **UPDATE:** `open` in `.bkit/core/engine/commands/workflow/tasks.ts`: print the group's tasks with neither line and `handover: true` when any exist
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 6 sub-step 5 reads the verb instead of the prose set difference
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process 6-7 drop the `DONE` log cross-reference
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit tasks open --plan= --group= --log=` prints the tasks with neither line and `handover: true` only when one is open; the build workflow's handover set difference is gone and Step 6 routes on `handover`; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` is green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open lists tasks with no done line` fails while a task with a `BLOCKED` line is listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open sets handover only when a task is open` fails on `handover: true` with none
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open refuses a plan with no task blocks` fails while it prints an empty list and exits 0

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: The plan-task match, the plan's matrix and the ship diff become engine checks

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `tasks currency` — plan-current's path and symbol match
  - **UPDATE:** `currency` in `.bkit/core/engine/commands/workflow/tasks.ts`: per task print the matched paths and needles and the diff hunks for its `CREATE` / `READ` / `UPDATE` / `DELETE` fields against `--base`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-current.md`: drop Process 5-7's search; keep the `Executable` / `Reword` / `Broken` call
  - **DEPENDS ON:** 2
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: the `git diff` base guard and the `--name-only` forms the verb copies
  - **DONE WHEN:** `bkit tasks currency --plan= --base=` prints each matched task with its matched paths and needles and the diff hunks, and no hunk for a path outside the matched set; the plan-current prompt names no `git diff` search of its own; an unmatched plan prints no hunks and exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency matches a task on a moved symbol` fails while the task is not listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency emits no hunk outside the matched set` fails while an unmatched path's diff appears
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency refuses a plan with no task blocks` fails while it prints an empty result and exits 0

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row
  - **UPDATE:** `plan-check` in `.bkit/core/engine/commands/workflow/tests.ts`: add problem kinds `matrix` (a header with no `Task` column, a row with no task, a row naming two or more tasks, a test-bearing task no row names) and `supersession` (a `DELETE` with no `Supersession Inventory` row), and update the verb's `summary`, `output.problems` and help text
  - **UPDATE:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: add `derivedTestMatrix` and `supersessionInventory` beside `reuseInventory`, over the same `tableCells` helper
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: drop Process 9 and Process 11, the two checks now engine-side
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `checkPlanText`'s `problems` kind union and the report writer
  - **READ:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the caller that reads a plan-check refusal
  - **READ:** `.bkit/core/workflows/bkit-build.md`: the callers that read `problems` and route on exit 1
  - **DONE WHEN:** `bkit tests plan-check` exits 1 on a plan with a `Derived Test Matrix` row mapped to no task, on a matrix header with no `Task` column, and on a `DELETE` with no `Supersession Inventory` row, naming the line each time, and exits 0 on this plan (which carries the column and maps every test-bearing task); `plan-scope-check` names neither check
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses an unmapped matrix row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a delete with no supersession row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix row mapped to two tasks` fails while the plan is accepted, or while the problem names only one of the two tasks
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a task no matrix row maps to` fails while a plan with an unmapped test-bearing task is accepted
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts a matrix that maps every test-bearing task` fails while a conforming plan is refused

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `branches scan-diff --disabled-tests`
  - **UPDATE:** `scan-diff` in `.bkit/core/engine/commands/workflow/branches.ts`: gain `--disabled-tests` — added lines only from `{base}...HEAD`, `docs/plans/**` excluded, matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` and a removed assertion line inside a test file; exit 1 on any hit, printing `file:line` and the test name
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 8 reads the verb instead of scanning the diff
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 5 passes the diff base (`origin/dev`) the scan runs against, so the sweep never guesses it
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: `scanDiffVerb`, its `--marker` added-line loop and the mutually exclusive mode guard
  - **DONE WHEN:** `bkit branches scan-diff --disabled-tests --base=origin/dev` exits 1 on a diff that adds a `.skip`, printing `file:line` and the test name, exits 0 on a `.skip` predating the base, and exits 0 with `disabled: []` on a diff that adds none; the sweep prompt names no diff scan of its own
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added skip` fails on exit 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a skip predating the base` fails on exit 1
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a disabled test with its line` fails while the reported line number or the test name is missing
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff exits 0 on a diff that adds no disabled test` fails while it exits 1 with an empty `disabled`

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: The sweep's deferral rules move to the engine

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `ledgers triage`
  - **UPDATE:** `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: add the `triage` verb — read the FID's `docs/deferrals.jsonl` rows, apply the closed-enum reason tests from `.bkit/jsonl.md`, print each row's bucket (`Exempt` / `Lazy`) and result, and write the `unjustified` / `TRIAGED` rows with a minted `ts`
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 9-11 read the verb; Process 7 (deliverable verification) stays
  - **READ:** `.bkit/core/engine/ledgers/telemetry.ts`: `DEFERRAL_REASONS` and `UNJUSTIFIED_REASON`, the enum `triage` imports, and the four tests documented beside them
  - **READ:** `.bkit/jsonl.md`: § Deferral Reason — the four tests and the `low-severity` exemption the verb implements
  - **DONE WHEN:** `bkit ledgers triage --fid= --plan=` prints each deferral row's bucket and reason-test result, writes a same-`key` `unjustified` / `TRIAGED` row with a minted `ts` for a row whose reason does not hold, writes nothing for a `low-severity` `LOW` row, and reports nothing for another feature's rows; the sweep prompt names no reason test and writes no ledger row
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps a low-severity deferral exempt` fails while the row is bucketed `Lazy`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage marks an unjustified deferral lazy` fails while the row stays `Exempt`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes an unjustified row with a minted ts` fails while the row is missing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage ignores another feature's deferral rows` fails while another FID's row is bucketed and written

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `ship-update-docs` `Pending Items` from the engine
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the passed scan artifact
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 6 runs `context ledger-scan --source=docs/deferrals.jsonl --terms={FID}` and passes the artifact
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: `ledger-scan`'s flags, its artifact and its clamp, so the step's call is complete
  - **DONE WHEN:** the `ship-update-docs` prompt names no `docs/deferrals.jsonl` grep and names the artifact its `Pending Items` comes from; the ship workflow runs `context ledger-scan` in Step 6 and lists the artifact in the subagent's `Read:`
  - **TEST FIRST:** n/a — prompt and workflow text only, no behaviour

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: Producers, docs, indexes and mirrors

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The plan format teaches the producers: template, clause and clauses' carriers
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: § Derived Test Matrix — a `Task` column and the one-sentence rule (each row maps to exactly one runbook task by its number; an `n/a`-only task needs no row)
  - **UPDATE:** `.bkit/instructions.md`: the `plan-scenario-detail` clause gains the `Task` column as the mapping carrier, the retired wording moves to a `retired` block, then `pnpm instructions:sync` rewrites the carriers
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-convert.md`: the Contract's plan shape gains the `Task` column, so a converted plan passes `plan-check` on its re-run
  - **READ:** `.bkit/instructions.md`: § Clauses `plan-scenario-detail` and the `carriers:` rule (`pnpm instructions:show --file bkit-plan-generate.md` first)
  - **READ:** `.bkit/core/engine/tools/instructions.test.ts`: what the clause guard asserts
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the template's matrix header holds `Task`, the clause names the column and every one of its carrier prompts carries the new sentence after `pnpm instructions:sync`, and `convert`'s Contract names the column; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-shape.test.ts` is green
  - **TEST FIRST:** n/a — template, clause and prompt prose; the guards are existing tests, named in `DONE WHEN`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Sync the docs the change touches
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the changed scope of `bkit-build-plan-verify`, `bkit-build-plan-current`, `bkit-ship-deferred-sweep`, `bkit-ship-update-docs` and `bkit-plan-scope-check`; no name, effort, model or `maxTurns` moves
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `/bkit-build` — 15 steps (Step 6's handover check, Step 7's tick), § `/bkit-ship` — 14 steps (Step 5's two verbs, Step 6's scan artifact)
  - **UPDATE:** `docs/testing.md`: § Key test files — one row for `tasks.test.ts`, and the extended rows for `tests.test.ts`, `branches.test.ts` and `ledgers.test.ts`
  - **UPDATE:** `docs/knowledge.jsonl`: the `Task`-column gotcha row
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8
  - **DONE WHEN:** the prompts index and the workflows index describe the changed steps and prompt scopes, `docs/testing.md` names `tasks.test.ts` and the four extended files, and the knowledge row exists; `pnpm vitest run .bkit/core/engine/audits/workflows/catalog-parity.test.ts .bkit/core/engine/audits/workflows/models-table-parity.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` is green
  - **TEST FIRST:** n/a — docs and indexes; the guards are existing tests, named in `DONE WHEN`

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Refresh the capability register, the mirrors and `dist/`, then dogfood
  - **UPDATE:** `.bkit/prompts.md`: regenerated by `bkit install` from `.bkit/core/.bkit/prompts.md` — never hand-edited
  - **UPDATE:** `.bkit/workflows.md`: regenerated by `bkit install` from `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `docs/templates/bkit-plan.md`: regenerated by `bkit install` from `.bkit/core/docs/templates/bkit-plan.md`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm graph:refresh`
  - **UPDATE:** `dist/cli.js`: regenerated by `pnpm build` (this repo commits its CLI)
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** `bkit install` regenerates the `.claude/`, `.cursor/` and `.opencode/` mirrors of the changed prompts / workflows / template and leaves `bkit check` drift-clean; `pnpm graph:refresh` leaves the register unchanged or updated in the same commit; `pnpm build` regenerates `dist/cli.js` and `pnpm bkit:check:dist` is clean; a fresh scratch consumer run of `node dist/cli.js tasks --help`, `node dist/cli.js branches scan-diff --help` and `node dist/cli.js ledgers --help` lists the new verbs and flags; `pnpm bkit:gate:static-unit-integration` and `pnpm vitest run` (full, never scoped) are green
  - **TEST FIRST:** n/a — install and build regeneration of generated artifacts; no behaviour of its own

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->

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

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (which includes `slop:delta`) and `bkit check` pass.
- [ ] **Test Synchronization:** `conventions.test.ts` (the new source is registered and tested), `catalog-parity.test.ts` + `workflow-shape.test.ts` (the build / ship step bodies moved), `instructions.test.ts` (a synced clause), `dogfood-templates.test.ts` + `template-shape.test.ts` (the template's new column), `verdict-vocabulary.test.ts` and `models-table-parity.test.ts` (no prompt name, verdict line or step key moved), `ledger-integrity.test.ts` (the rows this plan writes).
- [ ] **Build Configuration:** no new test-only config; `tasks.test.ts` sits beside its source under `.bkit/core/engine/commands/workflow/` and stays out of the production build as today.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tests.test.ts`, `tasks.test.ts`, `branches.test.ts`, `ledgers.test.ts`, `conventions.test.ts`):** the 28 `Derived Test Matrix` rows — `green`'s `verdict` / `fixable` / `logLine`, `tick` / `open` / `currency` on real temp plan files and temp git repos, `plan-check`'s `matrix` / `supersession` problems with an accepting control, `scan-diff --disabled-tests` on real temp git repos, and `ledgers triage` writing a real row through `append`.
- [ ] **Apply local migrations:** N/A — no database.
- [ ] **Run all tests:** `pnpm vitest run` (full, never scoped) passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** `pnpm build`, then in a fresh scratch consumer (a plan copied in from this repo) run `node dist/cli.js tasks open --plan=… --group=1 --log=…`, `node dist/cli.js tests plan-check --plan=… --existence=refuse --log=/tmp/pc.md` and `node dist/cli.js tasks tick --plan=… --group=1 --tasks=1`; confirm the plan's other lines are byte-identical after the tick.
- [ ] **Step 2:** In a scratch git repo, add an `.skip` to a test file on a branch, then run `node dist/cli.js branches scan-diff --disabled-tests --base=<the branch point>`; confirm exit 1 with `file:line` and the test name, and exit 0 after the same `.skip` is committed before the base.
- [ ] **Step 3:** On a plan whose `Derived Test Matrix` row names no task, run `node dist/cli.js tests plan-check --plan=… --existence=report --log=/tmp/pc2.md`; confirm exit 1 and that the report names the row and the task that has no row.
